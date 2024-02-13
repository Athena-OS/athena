{
  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-23.11";
  
    home-manager = {
      url = "github:nix-community/home-manager/release-23.11";
      inputs.nixpkgs.follows = "nixpkgs";
    };
  };

  outputs = {self, nixpkgs, home-manager}@inputs:
    let
      theme = "graphite";
      desktop = "mate";
      dmanager = "lightdm";
      shell = "bash";
      terminal = "alacritty";
      browser = "firefox";
      bootloader = "systemd";
      mkSystem = extraModules:
      nixpkgs.lib.nixosSystem {
        system = "x86_64-linux";
        specialArgs = {
          username = "athena";
          hostname = "athenaos";
          hashed = "$6$zjvJDfGSC93t8SIW$AHhNB.vDDPMoiZEG3Mv6UYvgUY6eya2UY5E2XA1lF7mOg6nHXUaaBmJYAMMQhvQcA54HJSLdkJ/zdy8UKX3xL1";
          hashedRoot = "$6$zjvJDfGSC93t8SIW$AHhNB.vDDPMoiZEG3Mv6UYvgUY6eya2UY5E2XA1lF7mOg6nHXUaaBmJYAMMQhvQcA54HJSLdkJ/zdy8UKX3xL1";
          inherit (inputs) home-manager;
        }; # Using // attrs prevents the error 'infinite recursion due to home-manager usage in root default.nix
        modules = let
          #modulesPath = "./nixos/installation";
          #modulesPathNixPkgs = "${nixpkgs}/nixos/modules"; # Accessing remote NixOS/nixpkgs modules
        in
          [
            {
              _module.args.theme = theme;
              _module.args.dmanager = dmanager;
              _module.args.desktop = desktop;
              _module.args.shell = shell;
              _module.args.terminal = terminal;
              _module.args.browser = browser;
              _module.args.bootloader = bootloader;
            }
          ]
          ++ extraModules;
      };
    in {
      nixosConfigurations = let
        modulesPath = "./nixos/installation";
      in {
        # nix build .#nixosConfigurations.live-image.config.system.build.isoImage
        "live-image" = mkSystem [
          # Note that if one of the following modules need to input parameters like 'terminal' and 'shell', these are taken in the code above
          ./nixos/installation/iso.nix
          ./nixos/home-manager/desktops/mate
          ./nixos/home-manager/terminals/alacritty
          ./nixos/modules/themes/graphite
          ./nixos/hosts
          home-manager.nixosModules.home-manager
        ];
        "runtime" = mkSystem [
          "/etc/nixos/hardware-configuration.nix"
          home-manager.nixosModules.home-manager
          ./nixos/. # It refers to the default.nix at nixos/ directory that imports in chain all the subfolder contents containing default.nix
          ./nixos/hosts/software
          ./nixos/modules/boot/${bootloader}
          ./nixos/home-manager/desktops/${desktop}
          ./nixos/modules/dms/${dmanager}
          ./nixos/modules/themes/${theme}
          ./nixos/home-manager/terminals/${terminal}
          ./nixos/home-manager/browsers/${browser}
          ./nixos/home-manager/shells/${shell}
        ];
        "student" = mkSystem [
          "/etc/nixos/hardware-configuration.nix"
          ./nixos/modules/roles/student
        ];
      };
  
      packages."x86_64-linux" =
        (builtins.mapAttrs (n: v: v.config.system.build.isoImage) self.nixosConfigurations)
        // {
          default = self.packages."x86_64-linux"."live-image";
        };
    };
}
