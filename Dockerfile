# Dockerfile
FROM docker.io/athenaos/base-devel:latest

ENV PUSER=builder
ENV PUID=1000

RUN pacman -Syyu --noconfirm pacman-contrib sudo git

RUN useradd -ms /bin/bash $PUSER
RUN usermod -aG lp,rfkill,sys,wheel -u "$PUID" $PUSER && echo "$PUSER ALL=(ALL) NOPASSWD: ALL" > /etc/sudoers.d/$PUSER
RUN chmod 044 /etc/sudoers.d/$PUSER
RUN echo -e "$PUSER\n$PUSER" | passwd "$PUSER"

# Copy the PKGBUILD files
COPY packages/ /build/packages/
RUN mkdir -p /build/output

# Set up an entry point script
RUN chown -R builder:builder /build

USER $PUSER:$PUSER
WORKDIR /build/packages

# Define the entry point
ENTRYPOINT ["/build/packages/hephaestus"]