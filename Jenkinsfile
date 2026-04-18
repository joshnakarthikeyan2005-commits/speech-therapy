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
    HAS_DOCKER = 'unknown'
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

    stage('Check Docker CLI') {
      when {
        expression { return params.BUILD_DOCKER }
      }
      steps {
        script {
          if (isUnix()) {
            env.HAS_DOCKER = (sh(returnStatus: true, script: 'command -v docker >/dev/null 2>&1') == 0).toString()
          } else {
            env.HAS_DOCKER = (bat(returnStatus: true, script: 'where docker >nul 2>nul') == 0).toString()
          }
          echo "Docker CLI available: ${env.HAS_DOCKER}"
        }
      }
    }

    stage('Prepare Image Names') {
      when {
        expression { return params.BUILD_DOCKER && env.HAS_DOCKER == 'true' }
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
        expression { return params.BUILD_DOCKER && env.HAS_DOCKER == 'true' }
      }
      steps {
        script {
          if (isUnix()) {
            sh 'docker build -t ${BACKEND_IMAGE_FULL} ./backend'
            sh 'docker build -t ${FRONTEND_IMAGE_FULL} .'
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
          expression { return env.HAS_DOCKER == 'true' }
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
          expression { return env.HAS_DOCKER == 'true' }
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
