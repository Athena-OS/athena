{
  # To not change upstream! It is managed by the installer
  
  # VM guest additions to improve host-guest interaction
  services.spice-vdagentd.enable = false;
  services.qemuGuest.enable = false;
  virtualisation.vmware.guest.enable = false;
  virtualisation.hypervGuest.enable = false;
  services.xe-guest-utilities.enable = false;
  # The VirtualBox guest additions rely on an out-of-tree kernel module
  # which lags behind kernel releases, potentially causing broken builds.
  virtualisation.virtualbox.guest.enable = false;
}