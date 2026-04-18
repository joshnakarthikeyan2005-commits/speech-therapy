pipeline {
  agent any

  options {
    timestamps()
    disableConcurrentBuilds()
  }

  parameters {
    booleanParam(name: 'BUILD_DOCKER', defaultValue: true, description: 'Build Docker images')
    booleanParam(name: 'PUSH_DOCKER', defaultValue: false, description: 'Push Docker images to registry')
    booleanParam(name: 'DEPLOY_TO_K8S', defaultValue: false, description: 'Deploy to Kubernetes (main branch only)')
    string(name: 'DOCKER_REGISTRY', defaultValue: 'docker.io', description: 'Docker registry host')
    string(name: 'DOCKER_REPO', defaultValue: '', description: 'Docker repo namespace (example: mydockeruser)')
    string(name: 'DOCKER_CREDENTIALS_ID', defaultValue: 'dockerhub-creds', description: 'Jenkins credentials ID for Docker registry')
    string(name: 'K8S_NAMESPACE', defaultValue: 'speech-therapy', description: 'Kubernetes namespace')
  }

  environment {
    BACKEND_IMAGE = 'speech-therapy-backend'
    FRONTEND_IMAGE = 'speech-therapy-frontend'
    IMAGE_TAG = "${BUILD_NUMBER}"
  }

  stages {
    stage('Checkout') {
      steps {
        checkout scm
      }
    }

    stage('Install Frontend') {
      steps {
        script {
          if (isUnix()) {
            sh 'npm ci'
          } else {
            bat 'npm ci'
          }
        }
      }
    }

    stage('Install Backend') {
      steps {
        dir('backend') {
          script {
            if (isUnix()) {
              sh 'npm ci'
            } else {
              bat 'npm ci'
            }
          }
        }
      }
    }

    stage('Build Frontend') {
      steps {
        script {
          if (isUnix()) {
            sh 'npm run build'
          } else {
            bat 'npm run build'
          }
        }
      }
    }

    stage('Check Docker Engine') {
      when {
        expression { return params.BUILD_DOCKER }
      }
      steps {
        script {
          def dockerOk = false
          if (isUnix()) {
            dockerOk = (sh(returnStatus: true, script: 'curl --silent --fail --unix-socket /var/run/docker.sock http://localhost/_ping | grep -qx OK') == 0)
          } else {
            dockerOk = (bat(returnStatus: true, script: 'where docker >nul 2>nul') == 0)
          }

          if (!dockerOk) {
            error('Docker engine is not reachable. Ensure Docker Desktop is running and try again.')
          }

          echo 'Docker engine reachable: true'
        }
      }
    }

    stage('Prepare Image Names') {
      when {
        expression { return params.BUILD_DOCKER }
      }
      steps {
        script {
          def repoPrefix = params.DOCKER_REPO?.trim() ? "${params.DOCKER_REPO.trim()}/" : ''
          env.BACKEND_IMAGE_FULL = "${repoPrefix}${env.BACKEND_IMAGE}:${env.IMAGE_TAG}"
          env.FRONTEND_IMAGE_FULL = "${repoPrefix}${env.FRONTEND_IMAGE}:${env.IMAGE_TAG}"
          echo "Backend image: ${env.BACKEND_IMAGE_FULL}"
          echo "Frontend image: ${env.FRONTEND_IMAGE_FULL}"
        }
      }
    }

    stage('Build Docker Images') {
      when {
        expression { return params.BUILD_DOCKER }
      }
      steps {
        script {
          if (isUnix()) {
            sh '''
              set -e

              build_image() {
                local context_dir="$1"
                local dockerfile_name="$2"
                local image_name="$3"
                local context_tar
                local response_file

                context_tar="$(mktemp)"
                response_file="$(mktemp)"
                tar -C "$context_dir" -cf "$context_tar" .

                curl --silent --show-error --fail --no-buffer \
                  --unix-socket /var/run/docker.sock \
                  -H 'Content-Type: application/x-tar' \
                  -X POST \
                  --data-binary "@$context_tar" \
                  "http://localhost/build?t=${image_name}&dockerfile=${dockerfile_name}&rm=1" | tee "$response_file"

                if grep -q '"error"' "$response_file"; then
                  echo "Docker build failed for ${image_name}"
                  cat "$response_file"
                  exit 1
                fi

                rm -f "$context_tar" "$response_file"
              }

              build_image backend Dockerfile "$BACKEND_IMAGE_FULL"
              build_image . Dockerfile "$FRONTEND_IMAGE_FULL"
            '''
          } else {
            bat 'docker build -t %BACKEND_IMAGE_FULL% backend'
            bat 'docker build -t %FRONTEND_IMAGE_FULL% .'
          }
        }
      }
    }

    stage('Push Docker Images') {
      when {
        allOf {
          expression { return params.BUILD_DOCKER }
          expression { return params.PUSH_DOCKER }
          expression { return params.DOCKER_REPO?.trim() }
        }
      }
      steps {
        withCredentials([usernamePassword(credentialsId: params.DOCKER_CREDENTIALS_ID, usernameVariable: 'DOCKER_USER', passwordVariable: 'DOCKER_PASS')]) {
          script {
            if (isUnix()) {
              sh 'echo "$DOCKER_PASS" | docker login ${DOCKER_REGISTRY} -u "$DOCKER_USER" --password-stdin'
              sh 'docker push ${BACKEND_IMAGE_FULL}'
              sh 'docker push ${FRONTEND_IMAGE_FULL}'
            } else {
              bat 'echo %DOCKER_PASS%| docker login %DOCKER_REGISTRY% -u %DOCKER_USER% --password-stdin'
              bat 'docker push %BACKEND_IMAGE_FULL%'
              bat 'docker push %FRONTEND_IMAGE_FULL%'
            }
          }
        }
      }
    }

    stage('Deploy Kubernetes') {
      when {
        allOf {
          expression { return params.DEPLOY_TO_K8S }
          branch 'main'
        }
      }
      steps {
        script {
          if (isUnix()) {
            sh 'kubectl apply -f k8s/'
            if (params.PUSH_DOCKER && params.DOCKER_REPO?.trim()) {
              sh 'kubectl -n ${K8S_NAMESPACE} set image deployment/backend backend=${BACKEND_IMAGE_FULL}'
              sh 'kubectl -n ${K8S_NAMESPACE} set image deployment/frontend frontend=${FRONTEND_IMAGE_FULL}'
              sh 'kubectl -n ${K8S_NAMESPACE} rollout status deployment/backend'
              sh 'kubectl -n ${K8S_NAMESPACE} rollout status deployment/frontend'
            }
          } else {
            bat 'kubectl apply -f k8s/'
            if (params.PUSH_DOCKER && params.DOCKER_REPO?.trim()) {
              bat 'kubectl -n %K8S_NAMESPACE% set image deployment/backend backend=%BACKEND_IMAGE_FULL%'
              bat 'kubectl -n %K8S_NAMESPACE% set image deployment/frontend frontend=%FRONTEND_IMAGE_FULL%'
              bat 'kubectl -n %K8S_NAMESPACE% rollout status deployment/backend'
              bat 'kubectl -n %K8S_NAMESPACE% rollout status deployment/frontend'
            }
          }
        }
      }
    }
  }

  post {
    success {
      echo 'Pipeline completed successfully.'
    }
    failure {
      echo 'Pipeline failed. Check stage logs for root cause.'
    }
  }
}
