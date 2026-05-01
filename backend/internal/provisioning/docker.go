package provisioning

import (
	"context"
	"fmt"
	"log"

	"github.com/docker/docker/api/types/container"
	"github.com/docker/docker/api/types/mount"
	"github.com/docker/docker/api/types/network"
	"github.com/docker/docker/client"
)

type DockerClient struct {
	cli *client.Client
}

func NewDockerClient() (*DockerClient, error) {
	cli, err := client.NewClientWithOpts(
		client.FromEnv,
		client.WithAPIVersionNegotiation(),
	)
	if err != nil {
		return nil, fmt.Errorf("impossible de se connecter à Docker: %w", err)
	}
	return &DockerClient{cli: cli}, nil
}

func (d *DockerClient) CreateContainer(ctx context.Context, req *ProvisionRequest) (string, error) {
	planCfg, ok := Plans[req.Plan]
	if !ok {
		return "", fmt.Errorf("plan inconnu: %s", req.Plan)
	}

	// Nom unique du container basé sur le hostname
	containerName := fmt.Sprintf("openspace_%s", req.Hostname)

	// Volume persistant pour les données du client
	volumePath := fmt.Sprintf("/var/openspace/data/%s", req.Hostname)

	// Configuration du container
	config := &container.Config{
		Image:    "openspace-base:latest", // Image de base custom
		Hostname: req.Hostname,
		Labels: map[string]string{
			"openspace.user_id":  req.UserID,
			"openspace.hostname": req.Hostname,
			"openspace.plan":     string(req.Plan),
			// Label Traefik pour routing automatique HTTPS
			"traefik.enable": "true",
			fmt.Sprintf("traefik.http.routers.%s.rule", req.Hostname): fmt.Sprintf("Host(`%s.openspace.cm`)", req.Hostname),
			fmt.Sprintf("traefik.http.routers.%s.tls", req.Hostname):  "true",
		},
		Env: []string{
			fmt.Sprintf("HOSTNAME=%s", req.Hostname),
			fmt.Sprintf("USER_ID=%s", req.UserID),
		},
	}

	// Limites de ressources — isolation stricte
	hostConfig := &container.HostConfig{
		Resources: container.Resources{
			Memory:   memoryInBytes(planCfg.RAM),
			NanoCPUs: cpuToNanoCPU(planCfg.CPUs),
		},
		Mounts: []mount.Mount{
			{
				Type:   mount.TypeBind,
				Source: volumePath,
				Target: "/var/www",
			},
		},
		RestartPolicy: container.RestartPolicy{
			Name: "unless-stopped",
		},
		NetworkMode: "openspace_network",
	}

	networkConfig := &network.NetworkingConfig{}

	// Créer le container
	resp, err := d.cli.ContainerCreate(ctx, config, hostConfig, networkConfig, nil, containerName)
	if err != nil {
		return "", fmt.Errorf("erreur création container: %w", err)
	}

	// Démarrer le container
	if err := d.cli.ContainerStart(ctx, resp.ID, container.StartOptions{}); err != nil {
		// Nettoyer si le démarrage échoue
		d.cli.ContainerRemove(ctx, resp.ID, container.RemoveOptions{Force: true})
		return "", fmt.Errorf("erreur démarrage container: %w", err)
	}

	log.Printf("✅ Container créé et démarré: %s (plan: %s)", containerName, req.Plan)
	return resp.ID, nil
}

func (d *DockerClient) StopContainer(ctx context.Context, dockerID string) error {
	return d.cli.ContainerStop(ctx, dockerID, container.StopOptions{})
}

func (d *DockerClient) RemoveContainer(ctx context.Context, dockerID string) error {
	return d.cli.ContainerRemove(ctx, dockerID, container.RemoveOptions{Force: true})
}

func (d *DockerClient) GetContainerIP(ctx context.Context, dockerID string) (string, error) {
	info, err := d.cli.ContainerInspect(ctx, dockerID)
	if err != nil {
		return "", err
	}
	if net, ok := info.NetworkSettings.Networks["openspace_network"]; ok {
		return net.IPAddress, nil
	}
	return "", fmt.Errorf("IP introuvable pour le container")
}

// Convertit "512m" ou "1g" en bytes
func memoryInBytes(ram string) int64 {
	switch ram {
	case "512m":
		return 512 * 1024 * 1024
	case "1g":
		return 1024 * 1024 * 1024
	case "2g":
		return 2 * 1024 * 1024 * 1024
	default:
		return 512 * 1024 * 1024
	}
}

// Convertit des CPUs en NanoCPUs Docker
func cpuToNanoCPU(cpus float64) int64 {
	return int64(cpus * 1e9)
}
