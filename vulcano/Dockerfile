FROM athenaos/base-devel

# Build user (makepkg refuses to run as root)
RUN useradd -m -d /src -G wheel builder -s /bin/bash && \
    echo "builder ALL=(ALL) NOPASSWD: ALL" >> /etc/sudoers

# git is needed by the entrypoint *before* makepkg resolves makedepends
RUN pacman -Syyu --noconfirm --needed git

COPY vulcano/entrypoint.sh /usr/local/bin/entrypoint.sh
RUN chmod 755 /usr/local/bin/entrypoint.sh

# Which package dir to build, relative to the repo root (the build context)
ARG PKGDIR
USER builder
WORKDIR /src
COPY --chown=builder:builder ${PKGDIR}/ /src/

ENTRYPOINT ["/usr/local/bin/entrypoint.sh"]
CMD ["-s", "-f", "--noconfirm", "--needed", "--noprogressbar"]
