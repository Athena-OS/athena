{ hostname, username, ... }:
{
  networking = {
    networkmanager.enable = true;
    hostName = "${hostname}";
  };
  services.vnstat.enable = true;
  users.users.${username} = {
    extraGroups = [ "networkmanager" ];
  };
}