<h1 align="center">
  Dive into a new Pentesting Experience with<br>
Athena OS
</h1>

<p align="center">
  <img src="https://img.shields.io/badge/Maintained%3F-Yes-CD8335">
  <img src="https://badgen.net/github/release/Athena-OS/athena-nix">
  <a href="https://sourceforge.net/projects/athena-iso/files/latest/download"><img alt="Download Athena OS" src="https://img.shields.io/sourceforge/dt/athena-iso.svg" ></a>
  <img src="https://badgen.net/github/stars/Athena-OS/athena-nix">
  <img src="https://img.shields.io/github/issues-raw/Athena-OS/athena-nix">
  <img src="https://img.shields.io/github/issues-closed-raw/Athena-OS/athena-nix">
  <img src="https://img.shields.io/github/license/Athena-OS/athena-nix">
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
![image](https://github.com/Athena-OS/athena-iso/assets/83867734/b130dd25-5e7f-4cc8-bc16-6f384b4210f3)

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
  <a href="https://hub.athenaos.org/athena-images/23.11/">
  Download Athena OS Now
    </a>
  💞
</h3>

## Athena Nix

Athena Nix currently provides several configurations (still in test):
* **runtime**

A configuration can be deployed in several ways:

#### Remote
```
sudo nixos-rebuild switch --flake 'github:Athena-OS/athena-nix#runtime' --impure
```

#### Local
Running command inside `athena-nix` directory:
```
git clone https://github.com/Athena-OS/athena-nix
cd athena-nix
sudo nixos-rebuild switch --flake '.#runtime' --impure
```
Running command outside `athena-nix` directory:
```
sudo nixos-rebuild switch --flake '<local-path-to-dir-containing-flake.nix>/.#runtime' --impure
```
`--impure` is used because the deployment can be applied according to your `hardware-configuration.nix`.

The default user and password in the configuration is `athena:athena`. Be sure to change user and password inside `athena-nix/flake.nix` file by editing `username` and `hashed` (or `hashedRoot` for your root account) attributes according to your needs when you deploy this configuration.

Passwords must be set as hash (i.e., SHA-512) instead of cleartext. To create it in a secure way run:
```
nix-shell -p openssl
openssl passwd -6 yourpassword
```
Finally, paste the generated hash in `hashed` or `hashedRoot` inside `flake.nix`.

The usage of **nix-shell** is important to create the password in an ephimeral environment, in order to not keep the command history stored in the system.