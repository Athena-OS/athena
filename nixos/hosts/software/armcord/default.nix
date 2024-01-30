{ pkgs, config, nix-std, ... }:
{
  # For discord wayland pipewire screensharing
  nixpkgs.config.ungoogled-chromium.commandLineArgs = "
    --ozone-platform=auto
    --disable-features=UseChromeOSDirectVideoDecoder
    --enable-features=RunVideoCaptureServiceInBrowserProcess
    --disable-gpu-memory-buffer-compositor-resources
    --disable-gpu-memory-buffer-video-frames
    --enable-hardware-overlays
  ";

  /*nixpkgs.config.permittedInsecurePackages = [
    "libtiff-4.0.3-opentoonz"
    "libxls-1.6.2"
  ];*/

  environment.systemPackages = with pkgs; [
    armcord
  ];
}