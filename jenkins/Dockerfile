FROM jenkins/jenkins:lts-jdk17

USER root
RUN apt-get update \
  && apt-get install -y --no-install-recommends docker.io curl ca-certificates nodejs npm \
  && rm -rf /var/lib/apt/lists/*

RUN curl -fsSL -o /usr/local/bin/kubectl https://dl.k8s.io/release/v1.31.0/bin/linux/amd64/kubectl \
  && chmod +x /usr/local/bin/kubectl

COPY plugins.txt /usr/share/jenkins/ref/plugins.txt
RUN jenkins-plugin-cli --plugin-file /usr/share/jenkins/ref/plugins.txt

USER jenkins
