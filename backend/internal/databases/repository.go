package databases

import (
	"context"
	"errors"

	"github.com/jackc/pgx/v5/pgxpool"
)

type Repository struct {
	db *pgxpool.Pool
}

func NewRepository(db *pgxpool.Pool) *Repository {
	return &Repository{db: db}
}

func (r *Repository) Create(ctx context.Context, inst *Instance, passwordEnc string) (*Instance, error) {
	query := `
		INSERT INTO database_instances (
			user_id, container_id, name, engine, version, status, host, port,
			database_name, username, password_enc, storage_mb, max_connections,
			docker_id, network_name
		) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15)
		RETURNING id, user_id, container_id, name, engine, version, status, host, port,
		          database_name, username, storage_mb, max_connections, docker_id,
		          network_name, created_at, updated_at
	`
	created := &Instance{}
	err := r.db.QueryRow(ctx, query,
		inst.UserID, inst.ContainerID, inst.Name, inst.Engine, inst.Version,
		inst.Status, inst.Host, inst.Port, inst.DatabaseName, inst.Username,
		passwordEnc, inst.StorageMB, inst.MaxConnections, inst.DockerID, inst.NetworkName,
	).Scan(
		&created.ID, &created.UserID, &created.ContainerID, &created.Name,
		&created.Engine, &created.Version, &created.Status, &created.Host,
		&created.Port, &created.DatabaseName, &created.Username, &created.StorageMB,
		&created.MaxConnections, &created.DockerID, &created.NetworkName,
		&created.CreatedAt, &created.UpdatedAt,
	)
	if err != nil {
		return nil, err
	}
	return created, nil
}

func (r *Repository) ListByUserID(ctx context.Context, userID string) ([]*Instance, error) {
	query := `
		SELECT id, user_id, container_id, name, engine, version, status, host, port,
		       database_name, username, storage_mb, max_connections, docker_id,
		       network_name, created_at, updated_at
		FROM database_instances
		WHERE user_id = $1 AND status != 'deleted'
		ORDER BY created_at DESC
	`
	rows, err := r.db.Query(ctx, query, userID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var instances []*Instance
	for rows.Next() {
		inst, err := scanInstance(rows.Scan)
		if err != nil {
			continue
		}
		instances = append(instances, inst)
	}
	return instances, rows.Err()
}

func (r *Repository) FindByID(ctx context.Context, id, userID string) (*Instance, error) {
	query := `
		SELECT id, user_id, container_id, name, engine, version, status, host, port,
		       database_name, username, storage_mb, max_connections, docker_id,
		       network_name, created_at, updated_at
		FROM database_instances
		WHERE id = $1 AND user_id = $2 AND status != 'deleted'
	`
	inst := &Instance{}
	err := r.db.QueryRow(ctx, query, id, userID).Scan(
		&inst.ID, &inst.UserID, &inst.ContainerID, &inst.Name,
		&inst.Engine, &inst.Version, &inst.Status, &inst.Host,
		&inst.Port, &inst.DatabaseName, &inst.Username, &inst.StorageMB,
		&inst.MaxConnections, &inst.DockerID, &inst.NetworkName,
		&inst.CreatedAt, &inst.UpdatedAt,
	)
	if err != nil {
		return nil, errors.New("instance introuvable")
	}
	return inst, nil
}

func (r *Repository) FindByIDInternal(ctx context.Context, id string) (*Instance, string, error) {
	query := `
		SELECT id, user_id, container_id, name, engine, version, status, host, port,
		       database_name, username, password_enc, storage_mb, max_connections,
		       docker_id, network_name, created_at, updated_at
		FROM database_instances WHERE id = $1 AND status != 'deleted'
	`
	inst := &Instance{}
	var passwordEnc string
	err := r.db.QueryRow(ctx, query, id).Scan(
		&inst.ID, &inst.UserID, &inst.ContainerID, &inst.Name,
		&inst.Engine, &inst.Version, &inst.Status, &inst.Host,
		&inst.Port, &inst.DatabaseName, &inst.Username, &passwordEnc,
		&inst.StorageMB, &inst.MaxConnections, &inst.DockerID,
		&inst.NetworkName, &inst.CreatedAt, &inst.UpdatedAt,
	)
	if err != nil {
		return nil, "", errors.New("instance introuvable")
	}
	return inst, passwordEnc, nil
}

func (r *Repository) CountByUserAndType(ctx context.Context, userID string, nosql bool) (int, error) {
	var query string
	if nosql {
		query = `
			SELECT COUNT(*) FROM database_instances
			WHERE user_id = $1 AND engine IN ('mongodb', 'redis')
			  AND status NOT IN ('deleted', 'deleting')
		`
	} else {
		query = `
			SELECT COUNT(*) FROM database_instances
			WHERE user_id = $1 AND engine IN ('mysql', 'postgresql')
			  AND status NOT IN ('deleted', 'deleting')
		`
	}
	var count int
	err := r.db.QueryRow(ctx, query, userID).Scan(&count)
	return count, err
}

func (r *Repository) NameExists(ctx context.Context, userID, name string) bool {
	var exists bool
	r.db.QueryRow(ctx,
		`SELECT EXISTS(SELECT 1 FROM database_instances WHERE user_id = $1 AND name = $2 AND status != 'deleted')`,
		userID, name,
	).Scan(&exists)
	return exists
}

func (r *Repository) UpdateStatus(ctx context.Context, id string, status InstanceStatus) error {
	_, err := r.db.Exec(ctx,
		`UPDATE database_instances SET status = $1, updated_at = NOW() WHERE id = $2`,
		status, id,
	)
	return err
}

func (r *Repository) UpdateActive(ctx context.Context, id, dockerID, host string, port int) error {
	_, err := r.db.Exec(ctx, `
		UPDATE database_instances
		SET docker_id = $1, host = $2, port = $3, status = 'active', updated_at = NOW()
		WHERE id = $4
	`, dockerID, host, port, id)
	return err
}

func (r *Repository) MarkDeleted(ctx context.Context, id string) error {
	_, err := r.db.Exec(ctx,
		`UPDATE database_instances SET status = 'deleted', updated_at = NOW() WHERE id = $1`,
		id,
	)
	return err
}

func (r *Repository) CreateUser(ctx context.Context, u *DBUser, passwordEnc string) (*DBUser, error) {
	query := `
		INSERT INTO database_users (instance_id, username, password_enc, permissions)
		VALUES ($1, $2, $3, $4)
		RETURNING id, instance_id, username, permissions, created_at
	`
	created := &DBUser{}
	err := r.db.QueryRow(ctx, query, u.InstanceID, u.Username, passwordEnc, u.Permissions).Scan(
		&created.ID, &created.InstanceID, &created.Username, &created.Permissions, &created.CreatedAt,
	)
	if err != nil {
		return nil, err
	}
	return created, nil
}

func (r *Repository) ListUsers(ctx context.Context, instanceID string) ([]*DBUser, error) {
	query := `
		SELECT id, instance_id, username, permissions, created_at
		FROM database_users WHERE instance_id = $1 ORDER BY created_at
	`
	rows, err := r.db.Query(ctx, query, instanceID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var users []*DBUser
	for rows.Next() {
		u := &DBUser{}
		if err := rows.Scan(&u.ID, &u.InstanceID, &u.Username, &u.Permissions, &u.CreatedAt); err != nil {
			continue
		}
		users = append(users, u)
	}
	return users, rows.Err()
}

func (r *Repository) CreateBackup(ctx context.Context, instanceID, backupType string) (*Backup, error) {
	query := `
		INSERT INTO database_backups (instance_id, type, status)
		VALUES ($1, $2, 'pending')
		RETURNING id, instance_id, size_bytes, storage_path, type, status, created_at
	`
	b := &Backup{}
	var storagePath *string
	err := r.db.QueryRow(ctx, query, instanceID, backupType).Scan(
		&b.ID, &b.InstanceID, &b.SizeBytes, &storagePath, &b.Type, &b.Status, &b.CreatedAt,
	)
	if err != nil {
		return nil, err
	}
	if storagePath != nil {
		b.StoragePath = *storagePath
	}
	return b, nil
}

func (r *Repository) CompleteBackup(ctx context.Context, id, path string, size int64) error {
	_, err := r.db.Exec(ctx, `
		UPDATE database_backups SET status = 'completed', storage_path = $1, size_bytes = $2
		WHERE id = $3
	`, path, size, id)
	return err
}

func scanInstance(scan func(dest ...any) error) (*Instance, error) {
	inst := &Instance{}
	err := scan(
		&inst.ID, &inst.UserID, &inst.ContainerID, &inst.Name,
		&inst.Engine, &inst.Version, &inst.Status, &inst.Host,
		&inst.Port, &inst.DatabaseName, &inst.Username, &inst.StorageMB,
		&inst.MaxConnections, &inst.DockerID, &inst.NetworkName,
		&inst.CreatedAt, &inst.UpdatedAt,
	)
	return inst, err
}
