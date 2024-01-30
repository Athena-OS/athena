{ pkgs, ... }:
{
  # Bootloader.
  boot.loader = {
    grub.device = "/dev/sda";
  };
}