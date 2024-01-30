{ pkgs, ... }:
{
  # Installed at system-level to avoid conflicts
  environment.systemPackages = with pkgs; [
    amass
    clamav
    cryptsetup
    ddrescue
    exploitdb
    ext4magic
    extundelete
    foremost
    fwbuilder
    ghidra
    netsniff-ng
    python311Packages.impacket
    recoverjpeg
    sleuthkit
    wapiti
    wireshark
    zap
  ];
}