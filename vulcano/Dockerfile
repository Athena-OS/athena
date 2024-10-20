FROM athenaos/base-devel

RUN useradd -m -d /src -G wheel builder -s /bin/bash && \
    echo "builder ALL=(ALL) NOPASSWD: ALL" >> /etc/sudoers

RUN pacman --noconfirm -Syyu

USER builder

WORKDIR /src

COPY --chown=builder:builder . .

ENTRYPOINT ["makepkg"]

CMD ["-s", "-f", "--noconfirm", "--needed", "--noprogressbar"]
