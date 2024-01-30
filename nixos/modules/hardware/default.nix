{
  imports = [
    ./bluetooth
    ./kernel
    ./network
    ./sound
    ./virtualization
  ];

  # KDE complains if power management is disabled (to be precise, if
  # there is no power management backend such as upower).
  powerManagement = {
    enable = true;
    cpuFreqGovernor = "performance";
  };
  services = {
    hardware.bolt.enable = true;
    printing.enable = false;
    timesyncd.enable = true;
    xserver.libinput.enable = true;
  };
  zramSwap.enable = true; # To not change upstream! It is managed by the installer
  hardware = {
    cpu.intel.updateMicrocode = true; # To not change upstream! It is managed by the installer
    bluetooth.enable = true;
    #enableAllFirmware = true; # Need allowUnfree = true
    enableRedistributableFirmware = true;
    opengl = {
      enable = true;
    };
  };
}