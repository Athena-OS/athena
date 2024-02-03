{ pkgs, ... }:
let
  utilities = with pkgs; [
    asciinema
    bat
    bfetch
    bless
    cmatrix
    cowsay
    figlet
    file
    fortune
    glxinfo
    gparted
    htb-toolkit
    hw-probe
    imagemagick
    lolcat
    lsd
    ncdu
    netcat-openbsd
    nyancat
    orca
    pciutils
    pfetch
    sl
    timeline
    toilet
    tree
    unzip
    wget
    xclip
    xcp
    zoxide
  ];

  devel = with pkgs; [ 
  #  cargo
  #  gcc
  #  jq
  #  killall
  #  python3
  ];

  exploits = with pkgs; [
    #powersploit
  ];

  wordlists = with pkgs; [
    #seclists
  ];
in
{
  environment.systemPackages = devel ++ utilities ++ exploits ++ wordlists;
  imports = [
    ./armcord
  ];
}