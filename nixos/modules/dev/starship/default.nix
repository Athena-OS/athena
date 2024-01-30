{ username, ...}: {
  home-manager.users.${username} = { pkgs, ...}: {
    programs.starship = {
      enable = false;
      enableZshIntegration = false;
    };
  };
}
