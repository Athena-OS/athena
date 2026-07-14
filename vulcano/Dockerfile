FROM athenaos/base-devel

RUN useradd -m -d /src -G wheel builder -s /bin/bash && \
    echo "builder ALL=(ALL) NOPASSWD: ALL" >> /etc/sudoers

RUN pacman-key --init && \
    pacman-key --populate && \
    pacman -Syyu --noconfirm --needed git

COPY vulcano/entrypoint.sh /usr/local/bin/entrypoint.sh
RUN chmod 755 /usr/local/bin/entrypoint.sh

ARG PKGDIR
USER builder
WORKDIR /src
COPY --chown=builder:builder ${PKGDIR}/ /src/

ENTRYPOINT ["/usr/local/bin/entrypoint.sh"]
CMD ["-s", "-f", "--noconfirm", "--needed", "--noprogressbar"]
