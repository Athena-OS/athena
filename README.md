<h1 align="center">
  Dive into a new Pentesting Experience with<br>
Athena OS
</h1>

<p align="center">
  <img src="https://img.shields.io/badge/Maintained%3F-Yes-CD8335">
  <img src="https://badgen.net/github/release/Athena-OS/athena">
  <img src="https://badgen.net/github/stars/Athena-OS/athena">
  <img src="https://img.shields.io/github/issues-raw/Athena-OS/athena">
  <img src="https://img.shields.io/github/issues-closed-raw/Athena-OS/athena">
  <img src="https://img.shields.io/github/license/Athena-OS/athena">
</p>

<p align="center">
  <a href="https://www.instagram.com/athenaos_sec">
    <img src="https://img.shields.io/badge/Follow%20us%20on%20Instagram-Ya?logo=instagram&logoColor=white&color=%23e95950&style=['for-the-badge']&url=https://www.instagram.com/athenaos_sec">
    </a>
  <a href="https://discord.gg/AHXqyJHhGc">
    <img src="https://img.shields.io/badge/Join%20on%20Discord-Ya?logo=discord&logoColor=white&color=%235865F2&style=['for-the-badge']&url=https://discord.gg/AHXqyJHhGc">
  </a>
</p>

<!--<p align="center">
  <img src="https://user-images.githubusercontent.com/83867734/174499581-e0f74d41-36ce-4c01-af0d-6ecd98841a64.png" data-canonical-src="https://user-images.githubusercontent.com/83867734/174499581-e0f74d41-36ce-4c01-af0d-6ecd98841a64.png" width="600" height="496" />
</p>-->
![image](https://github.com/Athena-OS/athena/assets/83867734/b130dd25-5e7f-4cc8-bc16-6f384b4210f3)

<!--
<p align="center">
  <img src="https://user-images.githubusercontent.com/83867734/192104268-ddfd4b2e-d79e-44e9-a0f7-3d627829d894.png" data-canonical-src="https://user-images.githubusercontent.com/83867734/192104268-ddfd4b2e-d79e-44e9-a0f7-3d627829d894.png" width="400" height="422" />
</p>
-->
<!--
<p align="center">
  <img src="https://user-images.githubusercontent.com/83867734/192106351-96cc40a5-994c-4068-9092-f05c69e686c6.png" data-canonical-src="https://user-images.githubusercontent.com/83867734/192106351-96cc40a5-994c-4068-9092-f05c69e686c6.png" width="400" height="400" />
</p>
-->

<h3 align="center">
  🏅Born for InfoSec Professionals, Bug Bounty Hunters, Passionate Students and Spicy Hackers🏅
</h3>

<h3 align="center">
  💞
  <a href="https://github.com/Athena-OS/athena/releases/">
  Get Athena OS Now!
    </a>
  💞
</h3>
<br>
<p align="center">
  <a href="https://hub.docker.com/u/athenaos"><img src="https://user-images.githubusercontent.com/83867734/224526828-b4f2a470-d539-494d-9ac0-34568a75af3a.png" width="150" height="128" /></a>
</p>
<h5 align="center">
Click Docker icon above to explore Athena OS Docker containers!
</h5>
<br>
<p align="center">
  <a href="https://apps.microsoft.com/store/detail/athena-os/9N1M7Q4F1KQF?hl=en-us&gl=us"><img src="https://upload.wikimedia.org/wikipedia/commons/f/f7/Get_it_from_Microsoft_Badge.svg" width="250" height="90" /></a>
</p>
<h5 align="center">
Click the icon above to explore Athena OS WSL in Microsoft Store App!
</h5>

## Hephaestus
**Hephaestus** is the Athena OS Continuous Integration/Continuous Delivery Builder to improve the integration and delivery of the packages.

As a container, it can be run in every platform supporting Docker or Podman. It is used to automate the building and delivery of Athena OS packages and for package debugging.
```
**===========================================================**
||     __  __           __                    __             ||
||    / / / /__  ____  / /_  ____ ____  _____/ /___  _______ ||
||   / /_/ / _ \/ __ \/ __ \/ __ `/ _ \/ ___/ __/ / / / ___/ ||
||  / __  /  __/ /_/ / / / / /_/ /  __(__  ) /_/ /_/ (__  )  ||
|| /_/ /_/\___/ .___/_/ /_/\__,_/\___/____/\__/\__,_/____/   ||
||            /_/                                            ||
**===========================================================**

The Athena OS CI/CD Builder

Usage: ./hephaestus [-a] [-c <ncores>] [-d] [-r] [-s] [-u] [-w] [-x] [package1 package2 ...]

Options:
-a     Build all packages.
-c     Set number of cores for building (maximum 4).
-d     Delete packages from the repository database.
-h     Print this Help.
-n     Skip all dependency checks.
-r     Upload packages to the specified repository server. Use '-e SSH_SEC=' to specify the SSH secret object and '-e REPOSITORY_SERVER=' to define the target repository server as container environment variable arguments.
-s     Sign packages. Use '-e GPG_SEC' to specify the signing key secret object as container environment variable argument.
-u     Update the package repository database.
-w     Overwrite existing packages in the output directory.
-x     Search for the fastest mirrors.
```
It builds the specified packages or all the repository packages if no package names are provided.

First to proceed, it is important to set the secret objects of GPG and SSH keys if needed. To do it in a secure manner:
1. create a file named `key-sec-file`, write the secret inside it and save it;
2. create a file named `ssh-sec-file`, write the secret inside it and save it.

Then, run:
```
podman secret create key-sec key-sec-file
podman secret create ssh-sec ssh-sec-file
```
Finally, remove the file storing the secrets because no needed anymore:
```
rm key-sec-file ssh-sec-file
```

Hephaestus can be run by using the following parameters:
```
systemctl start --user podman
podman run \
    -ti \
    --rm \
    --secret key-sec \
    --secret ssh-sec \
    --secret strapi-sec \
    --ulimit nofile=1024:524288 \ # Fix fakeroot hanging
    --userns=keep-id \ # Prevent to set root as owner of mounted volume directories
    -v "/srv/mirrors/athena:/src/output" \ # Set the target directory to store packages
    -v "/srv/logs:/src/logs" \ # Set the target directory to store build logs
    -v "$HOME/keydir:/src/keydir" \ # Set the target directory to retrieve the signing key from the host
    -e REPOSITORY_SERVER=username@server.com:/path/to/dir// \ # Set the target repository server
    -e PRE_EXEC="ls -la /src" \ # Pre-build command
    -e POST_EXEC="ls -la /src/output" # Post-build command
    docker.io/athenaos/hephaestus -a -d -r -s -x
```
Example usage:
```
podman run -ti --rm --secret key-sec --ulimit nofile=1024:524288 --userns=keep-id -v "/srv/mirrors/athena:/src/output" -v "$HOME/keydir:/src/keydir" -e GPG_SEC="key-sec" docker.io/athenaos/hephaestus -s -x bloodhound-python certipy
```
