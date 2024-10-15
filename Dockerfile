# Dockerfile
FROM docker.io/athenaos/base-devel:latest

ENV PUSER=builder
ENV PUID=1000

RUN pacman -Syyu --noconfirm pacman-contrib sudo git rate-mirrors rsync sshpass

RUN useradd -d /src -ms /bin/bash $PUSER
RUN usermod -aG wheel -u "$PUID" $PUSER && echo "$PUSER ALL=(ALL) NOPASSWD: ALL" > /etc/sudoers.d/$PUSER
RUN chmod 044 /etc/sudoers.d/$PUSER

# Copy the PKGBUILD files
COPY packages/ /src/packages/
RUN mkdir -p /src/output

USER $PUSER
WORKDIR /src

COPY --chown=$PUSER:$PUSER . .

# Define the entry point
ENTRYPOINT ["/build/packages/hephaestus"]
