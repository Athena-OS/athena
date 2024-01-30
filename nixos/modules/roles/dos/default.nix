{ pkgs, ... }:
{
  environment.systemPackages = with pkgs; [
    ddosify
    hyenae
    katana
    netsniff-ng
    siege
    slowhttptest
    slowlorust
    thc-ipv6
  ];
}
