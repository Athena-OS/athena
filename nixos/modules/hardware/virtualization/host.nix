{
  /*VMware Workstation software*/
  virtualisation.vmware.host.enable = false;
  virtualisation.vmware.host.extraConfig = ''
    # Allow unsupported device's OpenGL and Vulkan acceleration for guest vGPU
    mks.gl.allowUnsupportedDrivers = "TRUE"
    mks.vk.allowUnsupportedDevices = "TRUE"
  '';
  /* QEMU - Virt Manager */
  virtualisation.libvirtd.enable = false;
  programs.virt-manager.enable = false;
}