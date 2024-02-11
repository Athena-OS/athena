# Nix Wiki

## A bit of theory about the structure of Nix environment

**nix** is a build system first and foremost, it does not only work for package management.
[**nixpkgs**](https://github.com/NixOS/nixpkgs) refers to the collection of Nix packages and package definitions that provide a vast array of software packages and configurations. It is the core repository of packages used by the Nix package manager and is a fundamental component of NixOS. It is just a repository on GitHub.
[**channels**](https://nixos.wiki/wiki/Nix_channels) correspond to identically named branches of said repository.
**nix-*** are commands that operate on said channels.

In Nix ecosystem, about pkg repositories, there are no mirrors. The package definitions (`default.nix`) are distributed either by **GH+flakes**, or from **Fastly/S3+channels**. The S3 bucket is served through **Fastly**. Fastly is the CDN, there is no inconsistency between CDNs. When you ask your CDN node about a store path, it pulls it from S3. Currently fastly is a non-issue unless you live in India because there, Fastly is slower. **nixpkgs**, instead, is a GitHub repository that gets copied to S3 as a channel.

There is only one official binary cache containing the pkgs. There are no mirrors for anything. Each user can create its custom binary cache with its own packages. [Hydra](https://nixos.wiki/wiki/Hydra) is used to build packages and it pushes to the binary cache every commit constantly.

Channels guarantee you that, whatever is in it is part of a specific revision at least, and doesn't magically move forward in time or has some deps updating but not the others or if it's not in the cache or if ur inputs are not compatible with the channel, Nix will fall back to building the thing locally.

About keyrings and signing key, the official binary cache has only one signing key. Hydra builds and signs the packages. The public key is currently **cache.nixos.org-1:6NCHdD59X431o0gWypbMrAURkbJ16ZPMQFGspcDShjY=** and it is configured by default
https://nixos.org/manual/nix/stable/command-ref/conf-file.html#conf-trusted-public-keys
So one public key and Hydra will sign all the packages only with the related private key.

For Athena OS use case, by using Nix, you don't have to worry about syncing mirrors and hoping the mirror is up to date, or if the package is in the cache or it's not. Furthermore, also issues related to keyrings are not a concern anymore.

**How do build and install processes work?**

1. user requests to build a `.drv` (intermediate file describing how to build a derivation)
2. nix evaluates the drvs input addressed hash
3. nix asks substitutes if they have the artifact for that hash. A substitute caches the artifacts as built by Hydra*.
4. If they have it, nix downloads
5. Nix verifies the artifacts signature agains a list of trusted public keys
Same happens for all dependencies of course

*Hydra evaluates and builds the entirety of nixpkgs and if all required builds succeeds, it will advance the channel, such that all required artifacts are already cached when you get the expression used to build them. Hydra pushes the built artifacts to a storage that the [cache.nixos.org](https://cache.nixos.org/) reads from.

**Learn Nix fundamentals**

Nix is not only a tool to manage derivations (packages) but it is a language. To study and understand well its fundamentals in a very easy manner, give a look to [Nix Pills](https://nixos.org/guides/nix-pills/) and practice with the proposed examples.

**What about installing packages by Nix**

The advantage that Nix could provide to Athena is interesting as shown in the previous message, but the usage of GUI apps from nixpkgs in a distro different from NixOS could not work well. So, installing and using CLI/TUI apps or also Graphical Qt apps could be fine. The remaining GUI apps could not work well. GUI apps could be rendered bad because they use [**NixGL**](https://github.com/guibou/nixGL), an unofficial project that's badly written. You have to manually use NixGL as a wrapper, if you don't, app may not start. The problem of the GUI apps is that the drivers are not searched in their standard locations. By the way, if you use NixOS instead, you wouldn't need NixGL.

**What about package manager tools?**

Before discussing the provided tools, we must talk about the two kind of package management approaches Nix uses:
* **imperative package management**
* **declarative package management**

In NixOS, **imperative package management** refers to the traditional way of managing software packages that most other Linux distributions use. In imperative package management systems, you interact with package managers like apt (used by Debian and Ubuntu), yum (used by Red Hat and CentOS), or pacman (used by Arch Linux) to install, update, and remove software packages on your system. You manually execute package manager commands like apt, yum, or pacman to install, update, or remove packages.
Package managers maintain their own package databases and dependencies. The state of the system can become complex, with packages and dependencies managed independently.

In contrast, NixOS primarily follows a **declarative package management** approach. Declarative package management is a fundamental concept in Nix and NixOS, and it means that instead of directly instructing the system to perform package operations, you define a desired system configuration, including the list of packages you want, in a declarative manner. The Nix package manager then takes this configuration and ensures that your system matches it. You define your system configuration in a Nix expression, specifying the desired packages, services, and system settings. The Nix package manager ensures that your system configuration is applied consistently. The entire system configuration is described in a single configuration file (typically /etc/nixos/configuration.nix), making it easier to understand and replicate your system's state. With declarative package management in NixOS, you have the benefits of reproducibility and isolation, which means that your system's configuration can be version-controlled, and you can easily replicate your system's state on different machines or across different environments. This approach is especially valuable for server environments and reproducible development setups. Summarizing, in the declarative one, it does not use system configuration environment but the one defined in a configuration file. The declarative package management is not a mere package management but a set of rules that define how the new user environment must be set.

Nix allows you to use different tools to manage packages:
* **nix-env** (imperative)
* **nix-shell** (declarative)
* **home-manager** (declarative)
* **nix profile** (imperative)

Which one should we use?

**nix-env** is strongly discouraged for reasons explained [here](https://stop-using-nix-env.privatevoid.net/). Furthermore, the existence of `nix-env` in a NixOS ecosystem has no sense for the motivation about the origin of Nix.

The other three could be good.

**nix-shell** is an **ephemeral shell**, so if you need to run a particular command for a one-off thing, but don't want to store it on the system all times, this kind of shell allows you to gain **temporary access** to a command and after you exit out of the shell, it is like the package was never installed. In order to use it, [Flakes](https://nixos.wiki/wiki/Flakes) must be enabled.

**home-manager** could be used if you need to set user profiles in the new environment, since it is declarative. **nix profile** could be used too as imperative. So, the choice depends on the use case to implement.

There is a further way to install packages and configure environment, that is the current standard method to use: editing **/etc/nixos/configuration.nix**

This file contains several nix expressions to define the configuration to deploy. By this file, you can enable services and install packages. Once you finished to edit this file, save it and apply the changes by running:
```
sudo nixos-rebuild switch
```

An experimental way to deploy configuration and install packages is the usage of **flakes** that will be discussed later.

Each rebuild performed on the system creates a **Generation** that is a revision of a user environment, newly created every time the system is updated (with old ones being preserved until manually removed). Nix's environment rollback facilities rely on Generations. Relying on an old Generation means to rollback to one of your old configurations.

Generation is different from snapshot concept. Generations are for config, snapshots for your runtime data. Please be aware that snapshots are not backups, and that the latter should also be taken into consideration. Snapshots help to get better backups, as they avoid some atomicity problems, so you can consider to implement them too.

In practice you can install a package in several ways:
* by **nix-env**: If you want to install packages directly in your OS and not in a shell sandboxed environment, you can do it by `nix-env -iA nixpkgs.nmap`. I noted that also in this case we dont need to use sudo, and the binaries will be put in `/home/youruser/.nix-profile/bin/nmap`.
* by **nix-shell**: in my Athena I have FISH shell. When I add the nix-channel to unstable repo and I install nmap by `nix-shell -p nmap`, it creates a new environment with a BASH shell (not more FISH because the colors of my Athena prompt change to BASH one)  and it runs nmap in this environment. For the install I didnt have the need to install by sudo. In this environment nmap binary exists in a nix sandboxed dir (test by which nmap) Then, if I type `exit`, I go out from the env and I come back to FISH shell and nmap cannot be called anymore. Maybe it is a secure approach because we dont need to sudo. Note that the new environment is not an isolated or sandboxed environment. It just install and remove the declared package for on-off usage.
* by **nix profile**: run `nix --experimental-features nix-command profile install nixpkgs#nmap --extra-experimental-features flakes`. To remove it, for first check the `Index` of the application by `nix --experimental-features nix-command profile list`, then one of [these](https://nixos.wiki/wiki/Nix_command/profile_remove#Examples) or simply `nix --experimental-features nix-command profile remove ".*nmap.*"`.
* by **home-manager**: it is a good choice to deploy packages at user level and to deploy files in user home folder. The [warnings](https://github.com/nix-community/home-manager#words-of-warning) here are just saying that any error caused by the user could be hard to debug, but currently home-manager should be stable, indeed it is also used in production by NixOS devs.
* by editing **/etc/nixos/configuration.nix** file: it is the current standard method.
* by **flakes**: experimental, we will talk about them later.

You could ask: "Since declarative approach is based on editing configuration files, it could seem less comfortable than using the imperative approach as `sudo pacman -S pkgname`, so why an average user should use the declarative approach?"
Answer: on long term, declarative approach is more comfortable because it does not allow only to install packages, but also to configure them. When you reach your final configuration, you can export it in another Nix system. Furthermore, the imperative approach has a lot limitations that have been solved by Nix/declarative approach and that are explained in section 1.3 of [The Purely Functional Software Deployment Model](https://edolstra.github.io/pubs/phd-thesis.pdf).

**Prepare the environment (non-NixOS system only)**

If you want to use a non-root user (multi-user) you need to start the **nix daemon** (Arch Linux only):
```
sudo pacman -S nix nix-init
sudo systemctl enable --now nix-daemon.service
```
Edit `/etc/nix/nix.conf` by adding:
```
experimental-features = nix-command flakes
```
Then:
```
nix-channel --add https://nixos.org/channels/nixpkgs-unstable nixpkgs
nix-channel --add https://github.com/nix-community/home-manager/archive/master.tar.gz home-manager
nix-channel --update
```
Otherwise (not suggested):
```
sudo nix-channel --add https://nixos.org/channels/nixpkgs-unstable nixpkgs
sudo nix-channel --add https://github.com/nix-community/home-manager/archive/master.tar.gz home-manager
sudo nix-channel --update
```
Testing nmap by installing it by nix. After install reboot the system.

In case for some reason you need to delete all Nix environments, run:
```
sudo nix --experimental-features nix-command store delete --all --ignore-liveness
```

## Nix Channels

### Deploy configuration by channels

To deploy your configuration by channels, you need to create or edit `/etc/nixos/configuration.nix` file. Once completed, run:
```sh
sudo nixos-rebuild switch
```
or
```sh
sudo nixos-rebuild switch -I nixos-config=path/to/configuration.nix
```

## Flakes

### Creation of ISO NixOS-based

To use flakes, add the following code in your `/etc/nixos/configuration.nix`:
```nix
  # nix config
  nix = {
    package = pkgs.nixUnstable;
    settings = {
      extra-experimental-features = [
        "nix-command"
        "flakes"
      ];
      allowed-users = ["@wheel"]; #locks down access to nix-daemon
    };
  };
```

Instead of use the usual nix approach, it is possible to create an ISO by using flakes. Flakes have several advantages over current nix approach and probably in the future they will be the new standard. I don't know why the usage of flakes is so special but using them for creating an ISO shows a good potential. What I saw until now is that by flakes you can create more ISO configurations that can be invoked by a single file `flake.nix`. If you want to do it by the classic way, you need to have N .nix file to invoke for N ISO configurations you desire.

In order to use flakes, you must create a `flake.nix` file in the root of your repository. Note that it is important to use `git add flake.nix` for each change of `flake.nix`. One of potentials I see by the usage of flakes is that inside this flake nix file you can set more than one configuration. For example, if you need to create a XFCE ISO and maybe a GNOME ISO and somtimes you would like to create a KDE ISO, inside `flake.nix` you can define these different configurations with very small effort, and for each of them you can invoke the dedicated `.nix` file. So you can keep all this inside one single file (that imports your needed custom .nix files). Each of these configurations can be invoked by using `.#nixosConfigurations.<config-name>`, for example, if I named my ISO configuration as `live-image`, you can create the ISO with this config by running inside the same directory of `flake.nix` the following command:
```
nix build .#nixosConfigurations.live-image.config.system.build.isoImage
```
Source: https://hoverbear.org/blog/nix-flake-live-media/

In case you would like to change squashfs compression, refers to [Creating_a_NixOS_live_CD](https://nixos.wiki/wiki/Creating_a_NixOS_live_CD#Building_faster). Note that the default compression algorithm is the one with the least resulting size.

In general, flake nix files are composed of two parts: input and output sections. Input section contains the import of repositories or tools by their flake files.

Flake files can be used for different purposes, for example to create ISO files or to retrieve packages or to deploy your configuration. Examples of flake repositories:

https://github.com/erictossell/nixflakes/blob/main/flake.nix
https://github.com/JoshuaFern/nixos-configuration/blob/master/flake.nix
https://github.com/hyprwm/Hyprland/blob/main/flake.nix \
https://github.com/redcode-labs/RedNixOS/blob/master/flake.nix
https://github.com/bobvanderlinden/nixos-config/blob/master/flake.nix
https://github.com/NixOS/nixpkgs/blob/master/flake.nix

Flakes docs: \
https://www.tweag.io/blog/2020-05-25-flakes/ \
https://nixos.wiki/wiki/Flakes

### Deploy configuration by Flakes

Another advantage of using Flakes is the possibility to deploy your configuration in a flexible manner, instead of using the classic way that consists of editing each time `/etc/nixos/configuration.nix` and running `sudo nixos-rebuild switch` or `sudo nixos-rebuild switch -I nixos-config=path/to/configuration.nix` command. By flakes, we can define N configuration deployments in one single `flakes.nix` file.

Once you created your `flake.nix` (look [athena-nix](https://github.com/Athena-OS/athena-nix) as example), you can deploy your configuration by running:
```
sudo nixos-rebuild switch --flake '<local-path-to-dir-containing-flake.nix>/.#xfce'
```
where `.#xfce` is the configuration inside `flake.nix` we want to deploy.

If your current working directory contains already `flake.nix`, you can run:
```
sudo nixos-rebuild switch --flake '.#xfce'
```
If your source repository containing `flake.nix` is hosted online, for example on GitHub, you can run:
```
sudo nixos-rebuild switch --flake 'github:Athena-OS/athena-nix#xfce'
```

Unlike flakes used to create ISO, in this case, when you want to deploy your configuration by flakes, you must import `hardware-configuration.nix` as module inside `flake.nix`. You can do it in two main manners:
* Copying your `/etc/nixos/hardware-configuration.nix` file to your repository
* Refer directly to the `/etc/nixos/hardware-configuration.nix` (this case requires `--impure` argumento when launching `nixos-rebuild` command because you are specifying an absolute path

What should I use? Since `hardware-configuration.nix` file is generated when the OS is installed (or when you run `nixos-generate-config`), and it is different for different users, if your configuration is distributed to more people, the second option is the right one. If you are using it only for yourself, you can use one of the both options.

Another important requirement is to specify in one of your modules the `filesystem` and the `boot.loader` otherwise it will trigger an error.

Note that when you use Flakes for this purpose, you must not use or import modules related to `nixpkgs/nixos/nodules/installer/cd-dvd/<and-so-on>` because these ones are used for ISO creation. Remember also that the flake currently works with a user named `athena` (defined in `home.nix` files).

If you deploy configuration by flakes and get the message:
```
File system "/boot" is not a FAT EFI System Partition (ESP) file system.
systemd-boot not installed in ESP.
No default/fallback boot loader installed in ESP.
Traceback (most recent call last):
  File "/nix/store/jqgdwlxjhyp3znsqylysvnnf74lvd3h1-systemd-boot", line 344, in <module>
    main()
  File "/nix/store/jqgdwlxjhyp3znsqylysvnnf74lvd3h1-systemd-boot", line 332, in main
    install_bootloader(args)
  File "/nix/store/jqgdwlxjhyp3znsqylysvnnf74lvd3h1-systemd-boot", line 270, in install_bootloader
    raise Exception("could not find any previously installed systemd-boot")
Exception: could not find any previously installed systemd-boot
warning: error(s) occurred while switching to the new configuration
```
it is because you are using BIOS/Legacy boot instead of EFI.

### Use inputs to modules in Flakes

In flakes you could need to import and use some stuff, like **home-manager** or a custom stuff, and you need to use it in your flake configuration files.

Let's guess you want to use **home-folder**. You must declare it as **inputs** and then import it and finally you can use it inside your `.nix` module files.

Practically, let's guess you have a `default.nix` in root:
```nix
{ home-manager, ... }:
{
  imports = [
    home-manager.nixosModules.home-manager
    ./hosts
    ./modules
    ./users
  ];
}
```
you can see that this file is expecting `home-manager` and you can give it by `flake.nix`.

In order to pass **home-manager**, you can use different strategies. You know that `flake.nix` file is macrodivided in `inputs` definition and `outputs` parts.

The `inputs` piece of code must be defined as:
```nix
{
  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
  
    home-manager = {
      url = "github:nix-community/home-manager";
      inputs.nixpkgs.follows = "nixpkgs";
    };
  };
...
```
This is always the same according to the approach you decide to use to import it. The differences are in the `outputs` part. Indeed here you can use different approaches:

### Pass all inputs as a single set by using specialArgs
```nix
  outputs = {self, nixpkgs, home-manager}@inputs:
    let mkSystem = extraModules:
      nixpkgs.lib.nixosSystem {
        system = "x86_64-linux";
        specialArgs = {
          username = "athena";
          hostname = "athenaos";
          inherit inputs;
        }; # Using // attrs prevents the error 'infinite recursion due to home-manager usage in root default.nix
        modules = let
          modulesPath = "${self}/nixos/modules";
          #modulesPathNixPkgs = "${nixpkgs}/nixos/modules"; # Accessing remote NixOS/nixpkgs modules
        in
          [
            #"${modulesPath}/iso.nix"
            "/etc/nixos/hardware-configuration.nix"
            "${self}/." # It refers to the default.nix at root that imports in chain all the subfolder contents containing default.nix
          ]
          ++ extraModules;
      };
```
If you use this approach, note that `default.nix` should ask for `inputs` instead of `home-manager` and then you can access to `home-manager` by dot. So, `default.nix` should appear like:
```nix
{ inputs, ... }:
{
  imports = [
    inputs.home-manager.nixosModules.home-manager
    ./hosts
    ./modules
    ./users
  ];
}
```

### Pass all inputs individually by using specialArgs
```nix
  outputs = {self, nixpkgs, home-manager}@inputs:
    let mkSystem = extraModules:
      nixpkgs.lib.nixosSystem {
        system = "x86_64-linux";
        specialArgs = {
          username = "athena";
          hostname = "athenaos";
          inherit (inputs) home-manager;
        }; # Using // attrs prevents the error 'infinite recursion due to home-manager usage in root default.nix
        modules = let
          modulesPath = "${self}/nixos/modules";
          #modulesPathNixPkgs = "${nixpkgs}/nixos/modules"; # Accessing remote NixOS/nixpkgs modules
        in
          [
            #"${modulesPath}/iso.nix"
            "/etc/nixos/hardware-configuration.nix"
            "${self}/." # It refers to the default.nix at root that imports in chain all the subfolder contents containing default.nix
          ]
          ++ extraModules;
      };
```
Note that here we use `inherit (inputs) home-manager;` that means we are inheriting inputs.home-manager (it is the same to write `specialArgs.home-manager = inputs.home-manager`).

In this manner, `default.nix` can ask directly for `home-manager`, so it will be:
```nix
{ home-manager, ... }:
{
  imports = [
    home-manager.nixosModules.home-manager
    ./hosts
    ./modules
    ./users
  ];
}
```

### Usage of attrs
```nix
  outputs = { self, nixpkgs, ... } @ attrs:
    let mkSystem = extraModules:
      nixpkgs.lib.nixosSystem {
        system = "x86_64-linux";
        specialArgs = {
          username = "athena";
          hostname = "athenaos";
        } // attrs;
```
This approach does not need to specify the inheritance of inputs because `attrs` take the elements defined in `inputs` and merges sets (even currently it is not so clear to me).

Additional methods: https://blog.nobbz.dev/2022-12-12-getting-inputs-to-modules-in-a-flake/

## Upgrade

Over time new packages could be added in the stable repository. To make your system aware of these new packages, you need to upgrade your nix channel or your flake (depending on what you are using).

**Nix channel**
```sh
nix-channel --update
sudo nix-channel --update
```

**Flake**
```sh
cd <path/to/your/flake.nix>
nix flake update
sudo nix flake update
```

## Home Manager

The deployment of tools by `/etc/nixos/configuration.nix` is used mainly for system-wide scenarios. What if we want to deploy tools or config dotfiles for a specific user? To do this, we must use **home-manager**. So, system-wide and user-level deployments must be managed separately.

To install home-manager, you need to add the following in `/etc/nixos/configuration.nix` inside `import`:
```nix
imports =
  [
    <home-manager/nixos>
  ]
```
and install place `home-manager` inside:
```nix
packages = with pkgs; [
  home-manager
]
```
Then, since we edited the system-level configuration file, we need to edit `sudo nano /root/.nix-channels` file and add:
```
https://github.com/nix-community/home-manager/archive/release-23.11.tar.gz home-manager
```
(note: also nixos channel version should be set as 23.11)
and run:
```
sudo nix-channel --update
sudo nixos-rebuild switch
```
To use home-manager, you need to create a `.nix` file.

In general, when you use it without specifying a file by `home-manager switch`, it will refer to `$HOME/.config/home-manager/home.nix` file that you should create. In case you created `.nix` file in another location, you can run `home-manager switch -f <your-nix-file-location>`.

You can create a `home.nix` file referring to the actual derivation to install by the following content:
```nix
{ home-manager, ... }:
{
  imports = [
    ./home-manager/desktops/xfce
  ];
  home.username = "athena";
  home.homeDirectory = "/home/athena";
  home.stateVersion = "23.11";
  athena.desktops.xfce.refined = true;
}
```
Note that, when you import without specifying a `.nix` file, it will check for an existing `default.nix` file.

**Install a package built locally**

If we use **home-manager**, it is not used as a classic pkg manager where we give as argument the name of the package and it installs it. No. It works in a different manner. **home-manager** should work in this manner:
* I define a `home.nix` configuration file containing all the packages I want to set in my environment. They could be local or remote packages.
* Then I run `home-manager switch` and it reads the configuration file above and set any declared env variable and install the declared packages. Though environment variables may need a session logout or reboot.

An example of `home.nix` configuration file is:
```
home.packages = [
  (pkgs.callPackage ./path/to/file.nix {})
]
```
HM usually adds a custom shell script sourced by your shell to set environment variables, so you need to manage your shell via HM with programs.name.enable. This means that env variables only will be visible to child processes of the shell, not graphical applications started from your launcher.

Note that the wiki at https://nixos.wiki is unofficial and has a lot of wrong things, so don't follow it.

The official docs are [here](https://nixos.org/learn).

**Important Note**

The usage of `home-manager switch` command will apply the effect on the current session but if you reboot the system, any changes made by this command will be reverted. It occurs due to the immutability of NixOS. If you want to have permanent change, you must invoke the `.nix` file inside `/etc/nixos/configuration.nix`, by adding as example:
```nix
  home-manager.users.athena = { pkgs, ... }: {
    home.packages = [ pkgs.atool pkgs.httpie ];
    imports = [ "/home/athena/athena-nix/home.nix" ];
    programs.bash.enable = true;
    
    # The state version is required and should stay at the version you
    # originally installed.
    home.stateVersion = "23.11";
  };
```

**Deploy dotfiles in HOME folder**

What it is not clear is "How can we deploy config dotfiles to a user?".

In order to do this, we can use `home-manager` as explained above. But how the target `.nix` package must be created? Which content it should contain?

The best approach is to check on already existing files:
https://github.com/bobvanderlinden/nix-home
https://github.com/siraben/dotfiles/blob/master/home-manager/.config/nixpkgs/home.nix
https://github.com/yrashk/nix-home/blob/master/home.nix

Useful docs:
https://www.bekk.christmas/post/2021/16/dotfiles-with-nix-and-home-manager

## NixOS Install

NixOS installation can be performed by using `nixos-install` command that allows you to install a system according to your `configuration.nix` file. You can use a NixOS ISO and follow the [official Nix docs](https://nixos.org/manual/nixos/stable/#sec-installation-installing).

## Nix packages

### Create Nix package

#### nix-init

**nix-init** is a useful tool that can help on Nix package creation.
Let's suppose we would like to create a tool with source in GitHub like https://github.com/orgname/reponame. Let's run:
```
sudo nix run --extra-experimental-features "flakes nix-command" github:nix-community/nix-init --
```
Enter url: https://github.com/orgname/reponame
Check and enter the other information.

Then, let's build the produced `package.nix` file by:
```
nix-build -E 'with import <nixpkgs> {}; callPackage ./package.nix {}'
```
If you get some error, fix them. You can use ChatGPT as helper.

Once you built correctly it, you can test it by:
```
nix-shell -E 'with import <nixpkgs> {}; callPackage ./package.nix {}'
```

Note that if you are creating a Python module (i.e., PyPi), you must use:
```
nix-build -E 'with import <nixpkgs> {}; python3Packages.callPackage ./package.nix {}'
```

#### Learn by studying example .nix files

Studying existing nix derivatives is the best way to learn how to create a package in Nix.

To learn how to create packages, follow [Packaging Tutorial](https://nix.dev/tutorials/learning-journey/packaging-existing-software#hello-world).

#### Set a license

During the creation of a derivation, you need to specify a license. Licenses strings are stored in `licenses` set. You can access to its list by:
```
nix repl -f '<nixpkgs>'
```
Note that `-f '<nixpkgs>'` will load all variables and libs you need to run nix statements.

Then run:
```
nix-repl> builtins.attrNames lib.licenses
```
If you don't use  `-f '<nixpkgs>'`, you need to load the needed variables manually, for example by `:l <nixpkgs>`, then write `lib.` and use TAB completion to find `licenses`.

#### Manage Collisions

If you install two packages (i.e., `_3proxy` and  `ligolo-ng`) that will install a binary file with the same name in the same place, you can get the following error:
```
error: builder for '/nix/store/gzgn99b4siq286gr4ybcl70zqp2h8y61-home-manager-path.drv' failed with exit code 25;
       last 1 log lines:
       > error: collision between `/nix/store/92qf7acxvg6acl4vxji5712n7lhi0q35-ligolo-ng-0.4.4/bin/proxy' and `/nix/store/xz1v4ry2g50jha4gkll9f0didcgbdwnf-3proxy-0.9.4/bin/proxy'
       For full logs, run 'nix log /nix/store/gzgn99b4siq286gr4ybcl70zqp2h8y61-home-manager-path.drv'.
error: 1 dependencies of derivation '/nix/store/1vnxv0cs63cpyvr9ihjhd1gg5gdy9xyp-home-manager-generation.drv' failed to build
error: 1 dependencies of derivation '/nix/store/xxwnh88y46pkcylxgrf0p6q9zf3l1lwc-unit-home-manager-athena.service.drv' failed to build
error: 1 dependencies of derivation '/nix/store/yikxvsvgmla8j7gjd6mr3f5jzpn7a7cb-system-units.drv' failed to build
error: 1 dependencies of derivation '/nix/store/8nrmdivjn6aj6k9r5fqswvy8q0mvfy71-etc.drv' failed to build
error: 1 dependencies of derivation '/nix/store/557gh4yh0cxl3f7vcpnpbpj00a42vk3g-nixos-system-athenaos-24.05.20231219.54aac08.drv' failed to build
```
To prevent this, you can try to install packages at system-level, without home-manager, or you can use [prio functions](https://github.com/NixOS/nixpkgs/blob/7daf35532d2d8bf5e6f7f962e6cd13a66d01a71d/lib/meta.nix#L48-L69) from nixpkgs lib, for example:
```nix
{ lib, pkgs, ...}: {
  home.packages = [
    (lib.highPrio pkgs.ligolo-ng)
  ];
}
```
if you want to give priority to `ligolo-ng` package.

#### Dependency Binaries

One of the main characteristics of Nix is the dependency isolation. It means that, when a dependency is installed by the installation of a package, any binary of the dependency won't be linked to `/run/current-system/sw/bin` so it is not in `PATH`. In case a program is needed to use a binary of a dependency, you need to wrap the binary. You can do by using:
* `lib.getExe toolname` or `${toolname}/bin/binaryname`
* `makeWrapper`
* `makeBinaryWrapper`
* `makeShellWrapper`
* `wrapProgram`

`lib.getExe toolname` is one of the easiest methods. It works only if the `package.nix` file of the tool has `mainProgram` in its metadata information. `mainProgram` contains the binary name of the tool. In case it does not exist, just use `${toolname}/bin/binaryname`.

`makeWrapper` and `wrapProgram` are shell functions in the `makeShellWrapper` and `makeBinaryWrapper` hooks.

So it could be preferred to use `wrapProgram` as it is a bit easier to use (it wraps in-place and doesn't require manual moving around binaries).

Also it could be preferred shell wrappers whereever possible as:
* They are usually smaller (in file size while the bash in the closure usually is there anyway)
* They allow for appending quoted arguments
* They are easier to debug

### Submit a package in nixpkgs repository

Once you are sure that the locally built package works correctly, you are ready to submit the package to [nixpkgs repository](https://github.com/NixOS/nixpkgs).

Below I try to summarize the process but I strongly suggest to study and follow the official [CONTRIBUTING.md](https://github.com/NixOS/nixpkgs/blob/master/CONTRIBUTING.md) guide.

First, if you decide to maintain a package but you are still not a Nixpkgs maintainer, you must create a Pull Request named `maintainers: add <your-maintainer-id>` and add your info in [maintainers/maintainer-list.nix](https://github.com/NixOS/nixpkgs/blob/master/maintainers/maintainer-list.nix). It is good practice this PR is merged before you submit any new package.

Check of course in [nixpkgs/issues](https://github.com/NixOS/nixpkgs/issues) and [nixpkgs/pulls](https://github.com/NixOS/nixpkgs/pulls) if someone has already submitted the tool you want to upload. If not, you can proceed.

To submit a package, according to the new [RFC](https://github.com/nixpkgs-architecture/rfc-140/blob/master/rfcs/0140-simple-package-paths.md), check always if someone has already opened a PR. If yes, try to ask information about that PR and check if it has the latest version of the software to be packaged.

If there are no PR, then you can create your PR. You need to create a Pull Request as **Draft**, named `<tool-name>: init at <version-tool>`, in order to add all needed files (as **package.nix** file, containing the nix code) in [pkgs/by-name/${shard}/${name}](https://github.com/NixOS/nixpkgs/tree/master/pkgs/by-name) where *name* is usually the name of the tool/package and *shard* is the lowercased first two letters of *name*. It's important that you create the PR inside the **NixOS:master** branch.

Note that for Python, Perl, Ruby (and other scripting languages) modules, the current rule to submit is still the old one, that means to create the package file as `default.nix`, submit it in the related directory in [nixpkgs/pkgs/development](https://github.com/NixOS/nixpkgs/tree/master/pkgs/development) and then insert the package entry also in the related directory in [nixpkgs/pkgs/top-level](https://github.com/NixOS/nixpkgs/tree/master/pkgs/top-level). The name of the first commit must be something like `<Language>.pkgs.tool-name>: init at <version-tool>`, for example `python3.pkgs.pysqlite3: init at 0.5.2`.

Remember that when you create a new PR, it will create a forked repository in your GitHub account. At this point, in the future, until your PR is not merged, DON'T sync your forked repository with the original one because it will create conflict issues when Nix devs will try to merge the PR or you will try to edit some commit info.

Check always if there is an open issue in nixpkgs repository, link it in your PR message. Remember also to check the boxes shown in the first message of the PR.

If you want that your package should be backported, use **labels** in your PR. After your PR is merged, automatically a backport PR is opened. The backport PRs still needs a committer that merges it even if it does not require approvals by reviewers. But the intent of backport reviews is not so much about code quality (which should be fine since it was already merged into master), but more so about whether or not it is [acceptable to backport](https://github.com/NixOS/nixpkgs/blob/master/CONTRIBUTING.md#changes-acceptable-for-releases). Usually, for a new package,  it should fit the criteria without problems.

Not sure if it occurs already in **Draft**, but several checks should start. Be sure noone of the fails. Usually the **EditorConfig** check could fail, just enter in its details and fix your `.nix` file.

Once you applied all the needed changes to this PR, switch it from **Draft** to **Open**. Remember that it is a good practice that there should be only one single commit name `<tool-name>: init at <version-tool>` in the PR. You can ask people to thumb up it in order to get more attention for review.

To get people to review your PR, you can add the link of your PR in:
* [Nix/NixOS (unofficial) Discord server - #pr-review-request](https://discord.com/channels/568306982717751326/679366467904471040)
* [NixOS Discourse](https://discourse.nixos.org/t/prs-ready-for-review/3032/99999) by just pasting the clean PR URL without any code tag, wrapping and similar

One of the reasons useful to submit packages to Nixpkgs repository from the user point of view is about building. If we create a `package.nix` locally and we install it by `configuration.nix` or `flake` by referring the package locally, it will build locally it. In case the package is in the remote Nixpkgs repository, when it is installed by `configuration.nix`` or `flake``, the package will be built before installing?

Hydra builds non-broken, free packages in Nixpkgs for supported systems. If make some override on a package, overlay it or any of its dependency, or disable substitution, or use a marked-broken package, or an unfree package, or an unsupported system, you have to rebuild it yourself, so the building will occur locally in your host because Hydra would not handle those cases.

You can of course set up your own builders and binary cache for convenience, so that you only have to build the thing once and deploy to multiple machines if you are customising packages or such.

#### Track merged Pull Requests

Once a package Pull Request is merged to master or backported, it is possible to track the state of them, in particular if the package has been actually implemented in the Nixpkgs repository or still not. It can be done by the [Nixpkgs Pull Request Tracker](https://nixpk.gs/pr-tracker.html) by typing the Pull Request ID of your merged pull request.

#### Commit issues resolution

**Editing commit messages**

In case you synced the forked repository with the original one, you must restore the git state to the commit before this sync. To do this run `git log` to identify the commit before the merge of original nixpkgs to your forked repository, and then run:
```
git clone -b <branch-name> https://github.com/<your-GitHub-user>/nixpkgs --depth=<N> (try different number values by replacing N (starting from 1) until you don't see the commit of synching between the forked repository and the original one)
git reset --hard <previous-commit-id>
git push -f origin <branch-name>
```
In this manner, you should not have any conflict issues coming from commits of other users.

In case you wrote the wrong commit message and you need to change it, run:
```
git clone -b <branch-name> https://github.com/<your-GitHub-user>/nixpkgs --depth=<N> (N depends on how many commits you submitted ahead of the one that needs the message to be changed)
git rebase -i HEAD~<N>
```
at this point a text editor will be opened showing several commits. Identify your commit, change `pick` to `reword`, change its message string and save and close the file. Finally:
```
git push -f origin <branch-name>
```

In case you submitted more than one commit on your PR and you need to merge all of them in one, run:
```
git clone -b <branch-name> https://github.com/<your-GitHub-user>/nixpkgs --depth=<N> (N depends on how many commits you submitted ahead of the ones that need to be merged)
git rebase -i HEAD~<N>
```
at this point a text editor will be opened showing several commits. Identify the commits to merge, leave unchanged the main commit to keep and change `pick` to `squash` on all the remaining commits that must merge with the unchanged one. Finally:
```
git push -f origin <branch-name>
```

**Editing code on old commits**

In case you have more commits in a PR that need to deploy (for example different VSCode theme extensions), and you need to edit the code of some or all of them, it is not too late. You can come back to each one of these submitted commits by:
```
git rebase -i HEAD~<N> (where "N" is the number of commits you need to edit the code)
```
Change **pick** to **edit** for each one of the N commits. Save it, then you will be reverted to the first of the N commits.
Open and edit `default.nix`` and edit the needed code to the first commit. After the editing, save the file and:
```
git commit --all --amend --no-edit
git rebase --continue
```
Now you will go to the second commit and repeat the steps above. The last `git rebase --continue` should show something like:
```
Successfully rebased and updated refs/heads/<branch-name>.
```
At the end, once you edited the code of all commits, run:
```
git push -f origin <branch-name>
```

### Test existing packages

If you want to test an existing package in [nixpkgs](https://github.com/NixOS/nixpkgs) repository, for example `OSCAR`,  just get its `default.nix` file locally, then run:
```
nix-build '<nixpkgs>' -A OSCAR
```
Running simply `nix-build -A OSCAR`, it will look for the `default.nix` file in the current directory and it produces an error because this file has not lib args. For this reason, you must refer to the [default.nix](https://github.com/NixOS/nixpkgs/blob/master/default.nix) file at the root of nixpkgs repository. We can call this .nix file by using `'<nixpkgs>'`. This, upon evaluating, produces an instance of the nixpkgs package set, which then has an attribute called [OSCAR](https://github.com/NixOS/nixpkgs/blob/master/pkgs/top-level/all-packages.nix#L40979), which you select with `-A OSCAR`.

It means that, if you submit a new package on nixpkgs repository, you need also to add the attribute in the [all-packages.nix](https://github.com/NixOS/nixpkgs/blob/master/pkgs/top-level/all-packages.nix) file.

If you edit the local OSCAR `default.nix` and you build by the command above, it won't build this local `default.nix` file, but it'll always use the one from the channel you set. If you want to build the local one, you do the callPackage thing as described in the [nix.dev guide](https://nix.dev/tutorials/learning-journey/packaging-existing-software#hello-world). It occurs because you have a local copy of the repo through the channel and that's what's used here. To find out where it is, you can run `nix-instantiate --eval -E '<nixpkgs>'`.

Note that if you create a `.nix` file, when you you `install` command to copy files, at InstallPhase, use only `444` or `555` permissions because write permissions cannot exist in Nix store. If you try to provide write permissions, nix flattens the permissions to `444` or `555`. To create directories, instead to use `install -dm`, use `mkdir -p`.

A very useful tool that can help you to create Nix derivations is [nix-init](https://github.com/nix-community/nix-init). Just note that, for anything tricky, it falls back to stdenv.mkderivation.

## Themes, Icons and Cursors

Usually, themes, icons and cursors packages could install different flavors of a specific GTK or icon theme, for example [graphite-gtk-theme](https://github.com/NixOS/nixpkgs/blob/nixos-23.11/pkgs/data/themes/graphite-gtk-theme) could have `Graphite`, `Graphite-Dark` and other themes.

How in Nix you can know the list of all possible themes inside a GTK or icon theme package?

Let's guess we would like to have the list of all icon themes inside [tela-circle-icon-theme](https://github.com/NixOS/nixpkgs/blob/nixos-23.11/pkgs/data/icons/tela-circle-icon-theme). The method is to build the package. Usually we can retrieve its `package.nix` package and all the needed files in the same directory, and then building it by:
```nix
sudo nix-build -E 'with import <nixpkgs> {}; callPackage ./package.nix {}'
```
Some packages could return some error because they need to use other modules. In case of our icon theme above, it could return the error:
```
error: evaluation aborted with the following error message: 'Function called without required argument "adwaita-icon-theme" at /home/user/tela/default.nix:4'
```
To run the correct build command, you need to give a look to [all-packages.nix](https://github.com/NixOS/nixpkgs/blob/nixos-23.11/pkgs/top-level/all-packages.nix) and search for `tela-circle-icon-theme`. You will find the following:
```nix
  tela-circle-icon-theme = callPackage ../data/icons/tela-circle-icon-theme {
    inherit (gnome) adwaita-icon-theme;
    inherit (libsForQt5) breeze-icons;
  };
```
It means that, in order to be built correctly, our `package.nix` package needs to inherit all the modules specified between `{}`. In this manner, the correct build command will be:
```
sudo nix-build -E 'with import <nixpkgs> {}; callPackage ./package.nix {inherit (gnome) adwaita-icon-theme; inherit (libsForQt5) breeze-icons;}'
```
After building the package, check inside the `result` directory to see the directory names of the installed themes. They will be the list of theme names you need.

Note that, if you need to apply a theme tweak different than the default one, you can override the default tweak settings of these themes by a build command like:
```
nix-build -E 'with import <nixpkgs> {}; callPackage ./default.nix { inherit (gnome) adwaita-icon-theme; colorVariants = [ "black" ]; }'
```
if you want to have the `black` color variant for your `tela-circle-icon-theme`.

A simpler method to check what are the installed GTK themes or Icon themes from a package is to check the folder `~/.nix-profile/share`.

## User Management

`initialPassword` (and its hashed variants) do only set the password when the user is created the first time. This means it do not exist in the `/etc/passwd`.

`password` and its hashed variants on the other hand side, act the same way as `initialPassword` **if users are mutable**, while it will properly set the password on activation time when users are **not mutable**.

It means that, if you need to change password in a declarative manner by configuration file, you need to use `users.users.${username}.password` (or `users.users.${username}.hashedPassword`) and `users.mutableUsers = false`.

## Clean system

If you massively use building and install a lot of software and you want to check your disk space, consider that Nix is responsible to store data only in `/nix/store`.

You can measure the size of Nix Store by tools like `ncdu`:
```
sudo ncdu /nix/store
```
To clean Nix Store, it is needed to use the following commands:
```
nix-collect-garbage -d
sudo nix-collect-garbage -d
```
Note that `-d` flag will delete the old generations.

If the Nix Store is still occupying a lot of space, probably there could be some resources (probably from your local building processes or due to some bad management from Home Manager) still linked to the Nix Store.

To check what are the roots that are still valid, run:
```
sudo nix-store --gc --print-roots | less
```
Ignore the `/proc` files.

To check the occupied space by each one of them, just copy the single path and run a command like:
```
nix path-info -Sh /run/current-system
```
Note: `-S` shows the closure size, `-s` the size of the path, `-h` makes the numbers human readable.

If you are confident, you can delete manually those paths that don't belong to the system and that you don't recognize, and after that, running the Garbage Collector command as explained above.

You can try to optimize the space consumption by enabling **store-optimisation**. It is possible to enable it in your nix configuration. And after enabled it and restarted your daemon, you trigger it once to be sure that everything is optimized.

The setting to enable it is `nix.settings.auto-optimise-store = true;` inside your `configuration.nix` file. The command to optimize the store once to do the "bootstarp" would be:
```
nix store optimise
```
Is there a performance cost for this optimization? Neglectible. This cost is paid once at path creation time.

## Reporting Issues

When reporting issues for nixpkgs, remember to mention always the maintainers of a package. If they are not specified in the `.nix` file, access to [team-list.nix](https://github.com/NixOS/nixpkgs/blob/master/maintainers/team-list.nix)  or [maintainer-list.nix](https://github.com/NixOS/nixpkgs/blob/master/maintainers/maintainer-list.nix) and search for the language used to develop the involved tool.

## Troubleshooting

**Some icons disappeared from menu**

Directories where NixOS searches for icons are specified in `XCURSOR_PATH` env variable. It could happen that, due to bad configuration, the symlinked icons could be duplicated in more than one path. Due to `nix-collection-garbage` command, some of Nix store resources where the symlinked icons were pointing to, could be deleted. If these broken symlinked icons are stored in a path that is checked before the actual path where you store the symlinked icons, then your icons could disappear. To fix it, just identify the broken symlinked icons and delete them. Finally, logout/login.

**Building error due to 'gtk-update-icon-cache: The generated cache was invalid.'**

During a system rebuild, if you get a message error like:
```
gtk-update-icon-cache: Cache file created successfully.
gtk-update-icon-cache: Cache file created successfully.
gtk-update-icon-cache: The generated cache was invalid.
error: builder for '/nix/store/gf4fp0qf42addb15xpplx472bprrczm9-system-path.drv' failed with exit code 1
error: 1 dependencies of derivation '/nix/store/is3avirfqcb4a59ml9y2pc5ll66mn975-nixos-system-athenaos-23.11.3640.56911ef3403a.drv' failed to build
```
it probably is caused by an icon set you are installing where one or more of its files contain a **space** inside their filename. Just rename them by removing or replacing the space by another character.

**Xorg environment freezes in VMware VM**

Disable 3D Acceleration from VM settings.

**Make error 'first defined here'**

During make compilation, if you get the error:
```
/nix/store/mgdjnsrkqgmxqjaqaxgqyqm7fwyi96fk-binutils-2.31.1/bin/ld: CMakeFiles/rtlib.dir/colourscheme.c.o: in function `colour_scheme_reset_cached_data':
colourscheme.c:(.text+0x1f0): multiple definition of `colour_scheme_reset_cached_data'; CMakeFiles/rtlib.dir/colourscheme.c.o:colourscheme.c:(.text+0x1f0): first defined here
/nix/store/mgdjnsrkqgmxqjaqaxgqyqm7fwyi96fk-binutils-2.31.1/bin/ld: CMakeFiles/rtlib.dir/colourscheme.c.o: in function `colour_scheme_lookup_and_ref':
colourscheme.c:(.text+0x260): multiple definition of `colour_scheme_lookup_and_ref'; CMakeFiles/rtlib.dir/colourscheme.c.o:colourscheme.c:(.text+0x260): first defined here
/nix/store/mgdjnsrkqgmxqjaqaxgqyqm7fwyi96fk-binutils-2.31.1/bin/ld: CMakeFiles/rtlib.dir/colourscheme.c.o: in function `colour_scheme_unref':
colourscheme.c:(.text+0x2c0): multiple definition of `colour_scheme_unref'; CMakeFiles/rtlib.dir/colourscheme.c.o:colourscheme.c:(.text+0x2c0): first defined here
/nix/store/mgdjnsrkqgmxqjaqaxgqyqm7fwyi96fk-binutils-2.31.1/bin/ld: CMakeFiles/rtlib.dir/colourscheme.c.o: in function `colour_scheme_get_palette':
colourscheme.c:(.text+0x380): multiple definition of `colour_scheme_get_palette'; CMakeFiles/rtlib.dir/colourscheme.c.o:colourscheme.c:(.text+0x380): first defined here
...
collect2: error: ld returned 1 exit status
make[2]: *** [src/CMakeFiles/roxterm.dir/build.make:284: src/roxterm] Error 1
make[1]: *** [CMakeFiles/Makefile2:164: src/CMakeFiles/roxterm.dir/all] Error 2
make: *** [Makefile:130: all] Error 2
builder for '/nix/store/zc1rlqyflyzbm9ra7fxfg8m0nkw48j6y-roxterm-3.7.5.drv' failed with exit code 2
error: build of '/nix/store/zc1rlqyflyzbm9ra7fxfg8m0nkw48j6y-roxterm-3.7.5.drv' failed
```
add the following code in your `package.nix` file:
```nix
env.NIX_CFLAGS_COMPILE = toString [ "-fcommon" ];
```