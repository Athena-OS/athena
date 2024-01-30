{ pkgs, home-manager, username, shell, ... }:
{
  # Needed to install at system-level to source their .zsh files in .zshrc
  environment.systemPackages = with pkgs; [
    powershell
  ];
  home-manager.users.${username} = {
    xdg.configFile."powershell/Microsoft.PowerShell_profile.ps1".source = ./Microsoft.PowerShell_profile.ps1;
  };
}