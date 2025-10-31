#!/usr/bin/env bash
# shellcheck disable=SC2034

iso_name="athenaos"
iso_label="ATHENA-OS"
iso_publisher="Athena OS <https://www.athenaos.org>"
iso_application="Athena OS Live/Rescue CD"
iso_version="live"
install_dir="arch"
buildmodes=('iso')
boot_modes=('uefi-x64.systemd-boot')
arch=('x86_64')
pacman_conf="pacman.conf"
airootfs_image_type="squashfs"
airootfs_image_tool_options=('-comp' 'xz' '-Xbcj' 'x86' '-b' '1M' '-Xdict-size' '1M')
bootstrap_tarball_compression=('zstd' '-c' '-T0' '--auto-threads=logical' '--long' '-19')
file_permissions=(
  ["/etc/gshadow"]="0:0:600"
  ["/etc/shadow"]="0:0:600"
  ["/root"]="0:0:700"
  ["/root/.automated_script.sh"]="0:0:755"
  ["/etc/polkit-1/rules.d"]="0:0:750"
  ["/etc/sudoers.d"]="0:0:750"
  ["/etc/NetworkManager/dispatcher.d/09-timezone"]="0:0:755"
)
