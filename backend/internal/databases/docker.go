package databases

import (
	"context"
	"crypto/rand"
	"encoding/hex"
	"fmt"
	"io"
	"log"
	"os"
	"strings"

	"github.com/docker/docker/api/types/container"
	"github.com/docker/docker/api/types/image"
	"github.com/docker/docker/api/types/mount"
	"github.com/docker/docker/api/types/network"
	"github.com/docker/docker/client"
)

const networkName = "openspace_network"

type DockerProvisioner struct {
	cli *client.Client
}

func NewDockerProvisioner() (*DockerProvisioner, error) {
	cli, err := client.NewClientWithOpts(
		client.FromEnv,
		client.WithAPIVersionNegotiation(),
	)
	if err != nil {
		return nil, fmt.Errorf("connexion Docker impossible: %w", err)
	}
	return &DockerProvisioner{cli: cli}, nil
}

type provisionParams struct {
	UserID   string
	Name     string
	Engine   Engine
	Username string
	Password string
	DBName   string
}

func (d *DockerProvisioner) Create(ctx context.Context, p provisionParams) (dockerID, host string, port int, err error) {
	cfg, ok := engineConfig[p.Engine]
	if !ok {
		return "", "", 0, fmt.Errorf("moteur inconnu: %s", p.Engine)
	}

	containerName := fmt.Sprintf("openspace_db_%s_%s", shortID(p.UserID), sanitizeName(p.Name))
	volumePath := fmt.Sprintf("/var/openspace/databases/%s/%s", p.UserID, p.Name)
	if err := os.MkdirAll(volumePath, 0755); err != nil {
		return "", "", 0, fmt.Errorf("impossible de créer le volume DB: %w", err)
	}

	env := buildEnv(p)
	config := &container.Config{
		Image: cfg.Image,
		Env:   env,
		Labels: map[string]string{
			"openspace.user_id":   p.UserID,
			"openspace.db_name":   p.Name,
			"openspace.db_engine": string(p.Engine),
		},
	}

	if p.Engine == EngineRedis {
		config.Cmd = []string{"redis-server", "--requirepass", p.Password}
	}

	if pullReader, pullErr := d.cli.ImagePull(ctx, cfg.Image, image.PullOptions{}); pullErr == nil {
		_, _ = io.Copy(io.Discard, pullReader)
		pullReader.Close()
	}

	hostConfig := &container.HostConfig{
		Mounts: []mount.Mount{
			{
				Type:   mount.TypeBind,
				Source: volumePath,
				Target: dataMountTarget(p.Engine),
			},
		},
		RestartPolicy: container.RestartPolicy{Name: "unless-stopped"},
		NetworkMode:   networkName,
	}

	resp, err := d.cli.ContainerCreate(ctx, config, hostConfig, &network.NetworkingConfig{}, nil, containerName)
	if err != nil {
		return "", "", 0, fmt.Errorf("création container DB: %w", err)
	}

	if err := d.cli.ContainerStart(ctx, resp.ID, container.StartOptions{}); err != nil {
		d.cli.ContainerRemove(ctx, resp.ID, container.RemoveOptions{Force: true})
		return "", "", 0, fmt.Errorf("démarrage container DB: %w", err)
	}

	log.Printf("✅ DB container créé: %s (%s)", containerName, p.Engine)
	return resp.ID, containerName, cfg.Port, nil
}

func (d *DockerProvisioner) Remove(ctx context.Context, dockerID string) error {
	if dockerID == "" {
		return nil
	}
	_ = d.cli.ContainerStop(ctx, dockerID, container.StopOptions{})
	return d.cli.ContainerRemove(ctx, dockerID, container.RemoveOptions{Force: true, RemoveVolumes: false})
}

func buildEnv(p provisionParams) []string {
	switch p.Engine {
	case EngineMySQL:
		return []string{
			fmt.Sprintf("MYSQL_ROOT_PASSWORD=%s", p.Password),
			fmt.Sprintf("MYSQL_DATABASE=%s", p.DBName),
			fmt.Sprintf("MYSQL_USER=%s", p.Username),
			fmt.Sprintf("MYSQL_PASSWORD=%s", p.Password),
		}
	case EnginePostgreSQL:
		return []string{
			fmt.Sprintf("POSTGRES_DB=%s", p.DBName),
			fmt.Sprintf("POSTGRES_USER=%s", p.Username),
			fmt.Sprintf("POSTGRES_PASSWORD=%s", p.Password),
		}
	case EngineMongoDB:
		return []string{
			fmt.Sprintf("MONGO_INITDB_ROOT_USERNAME=%s", p.Username),
			fmt.Sprintf("MONGO_INITDB_ROOT_PASSWORD=%s", p.Password),
			fmt.Sprintf("MONGO_INITDB_DATABASE=%s", p.DBName),
		}
	default:
		return nil
	}
}

func dataMountTarget(engine Engine) string {
	switch engine {
	case EngineMySQL:
		return "/var/lib/mysql"
	case EnginePostgreSQL:
		return "/var/lib/postgresql/data"
	case EngineMongoDB:
		return "/data/db"
	case EngineRedis:
		return "/data"
	default:
		return "/data"
	}
}

func generatePassword() string {
	b := make([]byte, 16)
	_, _ = rand.Read(b)
	return hex.EncodeToString(b)
}

func generateUsername(name string) string {
	return "os_" + strings.ReplaceAll(sanitizeName(name), "-", "")
}

func shortID(id string) string {
	id = strings.ReplaceAll(id, "-", "")
	if len(id) > 8 {
		return id[:8]
	}
	return id
}

func sanitizeName(name string) string {
	name = strings.ToLower(name)
	var b strings.Builder
	for _, r := range name {
		if (r >= 'a' && r <= 'z') || (r >= '0' && r <= '9') {
			b.WriteRune(r)
		} else if r == '-' || r == '_' {
			b.WriteRune(r)
		}
	}
	return b.String()
}
