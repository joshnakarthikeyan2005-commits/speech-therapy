# DevOps Setup

## Local Docker

Run the full stack with monitoring:

```bash
docker compose up --build
```

Endpoints:
- Frontend: http://localhost:8080
- Backend: http://localhost:3001
- Prometheus: http://localhost:9090
- Grafana: http://localhost:3000

Default Grafana login:
- user: admin
- password: admin

## Kubernetes

Apply manifests in this order:

```bash
kubectl apply -f k8s/namespace.yaml
kubectl apply -f k8s/mongo.yaml
kubectl apply -f k8s/backend.yaml
kubectl apply -f k8s/frontend.yaml
kubectl apply -f k8s/monitoring.yaml
kubectl apply -f k8s/ingress.yaml
```

Build and load images before applying:
- `speech-therapy-backend:latest`
- `speech-therapy-frontend:latest`

## Jenkins

Use [Jenkinsfile](Jenkinsfile) for CI/CD. It:
- installs frontend and backend dependencies
- builds the frontend app
- optionally builds Docker images
- optionally pushes Docker images
- optionally deploys Kubernetes manifests from `main` and rolls out new image tags

### Jenkins setup for this project

1. Install Jenkins and required tools on the agent:
	- Node.js 20+
	- Docker
	- kubectl (only if you will deploy from Jenkins)
2. Install Jenkins plugins:
	- Pipeline
	- Git
	- NodeJS (recommended)
3. Create a Pipeline job:
	- Job type: Pipeline
	- Definition: Pipeline script from SCM
	- SCM: Git
	- Script Path: `Jenkinsfile`
4. Add Jenkins credentials:
	- Type: Username with password
	- ID: `dockerhub-creds`
	- Username/password: your Docker registry credentials
5. Build parameters available:
	- `BUILD_DOCKER` (default `true`)
	- `PUSH_DOCKER` (default `false`)
	- `DEPLOY_TO_K8S` (default `false`, runs only on `main`)
	- `DOCKER_REGISTRY` (default `docker.io`)
	- `DOCKER_REPO` (example `yourdockerhubusername`)
	- `DOCKER_CREDENTIALS_ID` (default `dockerhub-creds`)
	- `K8S_NAMESPACE` (default `speech-therapy`)

### Jenkins run modes

1. CI only
	- `BUILD_DOCKER=true`
	- `PUSH_DOCKER=false`
	- `DEPLOY_TO_K8S=false`
2. CI + Docker push
	- `BUILD_DOCKER=true`
	- `PUSH_DOCKER=true`
	- `DOCKER_REPO` must be set
3. Full CI/CD (main branch)
	- `BUILD_DOCKER=true`
	- `PUSH_DOCKER=true`
	- `DEPLOY_TO_K8S=true`
	- `DOCKER_REPO` and kube context must be configured in Jenkins agent

### Optional local Jenkins container

You can bootstrap Jenkins with:

```bash
cd jenkins
docker compose -f docker-compose.jenkins.yml up --build -d
```

Jenkins UI: `http://localhost:8081`

### Notes

- This Jenkinsfile supports both Linux and Windows agents (`sh`/`bat`).
- If you deploy to Kubernetes, ensure Jenkins has access to your kubeconfig context.
- When `PUSH_DOCKER=true`, image tags use Jenkins build number and are rolled out to Kubernetes deployments.
