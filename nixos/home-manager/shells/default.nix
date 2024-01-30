{ home-manager, username, terminal, shell, ... }:
{
  imports = [
    ./powershell
  ];

  home-manager.users.${username} = { pkgs, ...}: {
    home.file.".bash_aliases".source = ./bash_aliases;
    #home.packages = with pkgs; [
    #  neofetch
    #  zoxide
    #];
    xdg.desktopEntries."shell" = {
      type = "Application";
      name = "Shell";
      comment = "Shell";
      icon = "shell";
      exec = "${terminal}";
      terminal = false;
      categories = [ "Application" "Utility" ];
    };
  };
}