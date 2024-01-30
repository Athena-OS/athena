{ pkgs, username, shell, hashed, hashedRoot, ... }:
{
  users = {
    mutableUsers = false;
    users.${username} = {  
      shell = pkgs.${shell};
      isNormalUser = true;
      hashedPassword = "${hashed}";
      extraGroups = [ "wheel" "input" "video" "render" "networkmanager" ];
    };
    extraUsers = {
       root = {
         hashedPassword = "${hashedRoot}";
       };
     };
  };
}