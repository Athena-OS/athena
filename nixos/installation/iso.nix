{ pkgs, lib, username, ... }: {

  imports = [
    ./installation-cd-graphical-mate.nix
  ];

  boot = {
    kernelPackages = pkgs.linuxPackages; # LTS Kernel
    kernelModules = [ "rtl8821cu" ];
    loader.grub.useOSProber = true;
  };

  # Needed for https://github.com/NixOS/nixpkgs/issues/58959
  boot.supportedFilesystems = lib.mkForce [ "btrfs" "reiserfs" "vfat" "ext4" "f2fs" "xfs" "ntfs" "cifs" ];

  hardware = {
    cpu.amd.updateMicrocode = true;
    cpu.intel.updateMicrocode = true;
    bluetooth.enable = true;
    #enableAllFirmware = true; # Need allowUnfree = true
    enableRedistributableFirmware = true;
    opengl = {
      enable = true;
    };
  };

  services = {
    timesyncd = {
      # feel free to change to sth around your location
      # servers = ["pl.pool.ntp.org"];
      enable = true;
    };

    printing.enable = false;
    vnstat.enable = true;

    avahi = {
      enable = true;
      browseDomains = [];
      wideArea = false;
      nssmdns = true;
    };

    unbound = {
      enable = true;
      settings.server = {
        access-control = [];
        interface = [];
      };
    };

    hardware = {
      bolt.enable = true;
    };

    xserver.exportConfiguration = true;
  };

  networking = {
    hostName = "athenaos";
    dhcpcd.enable = true;
    networkmanager.dhcp = "dhcpcd";
    firewall = {
      #allowedTCPPorts = [22 80];
      #allowPing = false;
      checkReversePath = "loose";
      enable = true;
      logReversePathDrops = true;
      # trustedInterfaces = [ "" ];
    };
  };

  #time.timeZone = "UTC"; # change to your one

  # locales as well
  i18n = {
    defaultLocale = "en_US.UTF-8";
  };

  programs = {
    git.enable = true;
    nano.enable = true;
  };

  fonts.packages = with pkgs; [
    noto-fonts
    noto-fonts-emoji
  ];

  # List packages installed in system profile. To search, run:
  # $ nix search wget
  environment.systemPackages = with pkgs; [
    (callPackage ../pkgs/aegis-nix/package.nix { })
    (callPackage ../pkgs/aegis-tui/package.nix { })
    (callPackage ../pkgs/athena-config/package.nix { })
  ];

  home-manager.users.${username} = { pkgs, ... }: {
    /* The home.stateVersion option does not have a default and must be set */
    home.stateVersion = "23.11";
    nixpkgs.config.allowUnfree = true;
  };
}
