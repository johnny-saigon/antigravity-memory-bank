# {{PROJECT_NAME}} — Infrastructure Invariants

## 1. Host & Port Allocations
- **Port**: {{PORT}}
- **Ingress**: Reverse proxy via Caddy / Nginx.
- **Health Check Endpoint**: `{{HEALTH_URL}}`

## 2. Resource Boundaries
- Strict isolation of process PIDs, file storage, and network ports.
- Never share database credentials or storage buckets across distinct services.
