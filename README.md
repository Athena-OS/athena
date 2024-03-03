<h1 align="center">
  Dive into a new Pentesting Experience with<br>
Athena OS
</h1>

<p align="center">
  <img src="https://img.shields.io/badge/Maintained%3F-Yes-CD8335">
  <img src="https://badgen.net/github/release/Athena-OS/athena">
  <a href="https://sourceforge.net/projects/athena-iso/files/latest/download"><img alt="Download Athena OS" src="https://img.shields.io/sourceforge/dt/athena-iso.svg" ></a>
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
  <a href="https://github.com/Athena-OS/athena">
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

Usage: /build/packages/hephaestus [-d] [-r] [-s] [package1 package2 ...]

Options:
d     Update the package repository database.
h     Print this Help.
r     Upload packages to the specified repository server. Use '-e SSH_PASSPHRASE=' to specify the SSH passphrase and '-e REPOSITORY_SERVER=' to define the target repository server as container environment variable arguments.
s     Sign packages. Use '-e GPG_PASSPHRASE' to specify the signing key passphrase as container environment variable argument.
```
It builds the specified packages or all the repository packages if no package names are provided.

Hephaestus can be run by using the following parameters:
```
podman run \
    -ti \
    --rm \
    --ulimit nofile=1024:524288 \ # Fix fakeroot hanging
    --userns=keep-id \ # Prevent to set root as owner of mounted volume directories
    -v "$HOME/output:/build/output" \ # Set the target directory to store packages
    -v "$HOME/keydir:/build/keydir" \ # Set the target directory to retrieve the signing key from the host
    -e GPG_PASSPHRASE=$(secret-tool lookup key-sec key-sec) \ # Set the signing key passphrase
    -e SSH_PASSPHRASE=$(secret-tool lookup ssh-sec ssh-sec) \ # Set the SSH repository server passphrase
    -e REPOSITORY_SERVER=username@server.com:/path/to/dir// \ # Set the target repository server
    -e PRE_EXEC="ls -la /build" \ # Pre-build command
    -e POST_EXEC="ls -la /build/output" # Post-build command
    docker.io/athenaos/hephaestus -d -r -s
```

Note that the secrets are managed by `secret-tool` for security reasons.

If you are using a Debian CLI host environment, to make secret-tool working correctly, as a standard user, run:
```
apt install gnome-keyring libsecret-tools
```
Then, the object "/org/freedesktop/secrets/collection/login" must be created:
```
dbus-run-session -- bash
gnome-keyring-daemon --unlock
```
It will be asked for a password to protect the keyring. On the empty terminal row, type your password WITHOUT pressing Enter. Just press CTRL+D two times. Then, run again:
```
gnome-keyring-daemon --unlock
```
As before, type your password WITHOUT pressing Enter. Just press CTRL+D two times.

Now, you should see `login.keyring` and `user.keystore` files in `~/.local/share/keyrings`.

You can store your secrets by `secret-tool`.

In case you forget the password to unlock the keyring, delete `login.keyring` and `user.keystore` files but you will lose your stored secrets.

To test the right password to unlock the keyring, download [unlock.py](https://codeberg.org/umglurf/gnome-keyring-unlock/raw/branch/main/unlock.py) and test the password by:
```
chmod +x ./unlock.py
./unlock.py <<<YourKeyringPassword
```
If it does not return anything, the typed password is right, otherwise you will get "Unlock denied" message.

At each login and reboot, you need to unlock the keyring.
