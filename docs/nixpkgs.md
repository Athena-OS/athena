# Nix Packaging Guidelines

The purpose of this document is to provide guidelines to package tools following Nix best practices.

Official docs related to the rules to consider when creating a Nix package: https://github.com/NixOS/nixpkgs/blob/master/pkgs/README.md

## Build packages

There are several ways to build local packages. What I'm currently using are `nix-build` and `nix-shell`.

### nix-build

Once you created your `package.nix`, you can use `nix-build` command to build your `package.nix` package file. The arguments of `niix-build` command can change according to the type of package we are trying to build.

In general, to build packages based on usual functions (like `mkDerivation`) require the usage of:
```sh
nix-build -E 'with import <nixpkgs> {}; callPackage ./package.nix {}'
```
Note that, if you are getting an error reporting `abort` string, probably the invoked `callPackage` command is wrong, so you must use some specific case.

For specific cases, it is required to use a little different command:

For Python3 `buildPythonPackage` function:
```sh
nix-build -E 'with import <nixpkgs> {}; python3Packages.callPackage ./package.nix {}'
```

For qmake to be used in `mkDerivation` function:
```sh
nix-build -E 'with import <nixpkgs> {}; libsForQt5.callPackage ./package.nix {}'
```
In this case, remember to use `wrapQtAppsHook`. If it is not needed to wrap, keep it and add `dontWrapQtApps = true;`.

### Build local packages with local dependencies

Refer to https://summer.nixos.org/blog/callpackage-a-tool-for-the-lazy/#3-benefit-flexible-dependency-injection

Another, more effective, method is to use **niix-shell** because you can create an environment where the package and the related dependencies are actually installed in this environment, so the package will be able to retrieve the related dependencies.

Let's guess our main package to test is `guymager` and the related local dependencies to test with are `libewf-legacy`, `libbfio` and `libguytools`. Let's assume you already packaged both of them and they are stored as:
```sh
├── package.nix (guymager)
├── libewf-legacy
│   ├── package.nix
├── libbfio
│   ├── package.nix
├── libguytools
│   ├── package.nix
```
Insert these local dependencies inside `package.nix` of `guymager` because we will add them in our nix-shell environment file.

Now create a `shell.nix` file that will deploy your environment:
```nix
with import <nixpkgs> {};
let 
  libewf-legacy = pkgs.callPackage ./libewf-legacy/package.nix { };
  libbfio = pkgs.callPackage ./libbfio/package.nix { };
  libguytools = pkgs.libsForQt5.callPackage ./libguytools/package.nix { };
  guymager = pkgs.libsForQt5.callPackage ./package.nix { inherit libewf-legacy libbfio libguytools; };
in
  stdenv.mkDerivation rec {
    name = "env";
    
    buildInputs = [
      curl
      git
      nix
      perl
      libewf-legacy
      libbfio
      libguytools
      guymager
    ];
  }
```
Now, run `nix-shell` and, if `package.nix` files don't produce any errors, you should be inside `nix-shell` environment and you can invoke the program to check if the binary of the main program calls the dependency correctly both at build and run time.

A very interesting use case to use `shell.nix` is to run correctly those applications that try to run non-nix executable, that produce errors.

Indeed, according to [NixOS documentation](https://nix.dev/guides/faq.html#how-to-run-non-nix-executables) NixOS cannot run dynamically linked executables intended for generic Linux environments out of the box.

As example, if you need to build a NodeJS application by Puppeteer, normally it tries to run `$HOME/.cache/puppeteer/chrome/linux-121.0.6167.85/chrome-linux64/chrome` executable that, as said above, does not work.

In these cases, we need always to force the application to use executables that are built for NixOS. In this particular case, for example, if you need to compile a custom [Bibata Cursor](https://github.com/ful1e5/Bibata_Cursor), you need to run:
```
npx cbmp -d 'svg/original' -o 'bitmaps/Bibata-Gruvbox' -bc '#282828' -oc '#EBDBB2' -wc '#000000'
```
This command uses Puppeteer that produces the error seen above.

To manage this case, just create the following `shell.nix` and set the location where Puppeteer should look for `chromium` executable, and we assign the Nix Chromium executable one:
```nix
with import <nixpkgs> {};
  stdenv.mkDerivation rec {
    name = "env";
      shellHook = ''
        export PUPPETEER_EXECUTABLE_PATH="${pkgs.chromium.outPath}/bin/chromium"
      '';
    buildInputs = [
       clickgen
       yarn
       python3
       python311Packages.attrs
       chromium
    ];
  }
```
Run `nix-shell` and we you run again `npx`, it will work.

### Clean environment

To clean the environment from all the files created by the build process, run `nix-collect-garbage` and remove `result` directories.

## Dependencies

Dependencies can be used by the following expressions:
* nativeBuildInputs: dependencies that should exist in the build environment
* buildInputs: dependencies that should exist in the runtime environment
* propagatedBuildInputs:  dependencies that should exist in the runtime environment and also propagated to downstream runtime environments. Usually used in Python packages

All dependencies used in **buildInputs** allow to link header and lib files correctly during the compilation of a tool.

Note that dependencies containing binaries won't install their binaries due to the Nix isolation nature. Maybe, for all the dependencies that the package needs to use their binaries, put these dependencies in `propagatedBuildInputs`.

Another way to install dependencies is by [string context](https://shealevy.com/blog/2018/08/05/understanding-nixs-string-context/) that means to use `${}` to expand the value of a package. An example of this usage is the following:
```nix
  postPatch = ''
    substituteInPlace src/manage.rs \
      --replace-fail /usr/share/htb-toolkit/icons/ $out/share/htb-toolkit/icons/
    substituteInPlace src/utils.rs \
      --replace-fail /usr/bin/bash ${bash} \
      --replace-fail "\"base64\"" "\"${coreutils}/bin/base64\"" \
      --replace-fail "\"gunzip\"" "\"${gzip}/bin/gunzip\""
    substituteInPlace src/appkey.rs \
      --replace-fail secret-tool ${lib.getExe libsecret}
    substituteInPlace src/vpn.rs \
      --replace-fail "arg(\"openvpn\")" "arg(\"${openvpn}/bin/openvpn\")" \
      --replace-fail "arg(\"killall\")" "arg(\"${killall}/bin/killall\")"
  '';
```
This code will automatically install the needed dependencies specified inside `${}` like `${coreutils}`, `${gzip}`, `${lib.getExe libsecret}`, `${openvpn}` and `${killall}` and you don't need to specify them inside `buildInputs`. Note that, also in this case, the binaries of the dependencies are not installed.

The `replace` argument has different options shown [here](https://github.com/NixOS/nixpkgs/pull/260776).

## mkDerivation

This function automatically compiles source files if a **Makefile** exists. It means that we don't need to specify `make` commands in `buildPhase` or `installPhase`. Indeed, often it is not necessary to write any build instructions because the stdenv build system is based on autoconf, which automatically detected the structure of the project directory. We need only to eventually set make flags if needed. Use `makeFlags` to specify flags used on each phase or `buildFlags` to specify flags to be used only during the `buildPhase`.

For example, if `Makefile` is not in the root directory of the project source, you can instruct mkDerivation to find Makefile by:
```nix
  makeFlags = [
    "-C src"
  ];
```

Add `enableParallelBuilding = true;` to enable parallel building.

Only in case where the structure of the project does not allow to run autoconf process correctly, then we could be forced to write some code in some of nix phases.

Note that, if you don't need to run C/C++ compiler, replace `stdenv.mkDerivation` by `stdenvNoCC.mkDerivation` and `stdenv` by `stdenvNoCC` on top of the file.

### Usage of hooks

#### autoconf

In case your source project contains **configure** files, you can import **autoreconfHook** and use it as:
```nix
nativeBuildInputs = [autoreconfHook];
```
In this manner, it simulates the usage of `autoreconf` command and compile and install the tool.

In case the building produces an error due to, for example, obsolete macros that interrupts the autoconf process, try to use **configure** approach described in the next section.

#### configure

In case the **autoconf** method does not work, try to use this approach.

Some source files use **configure** file during compilation. This file can use arguments as `build` for cross-platform building, `host` and `target`.

Instead to write `./configure --build=arm --prefix=$out` in `buildPhase`, you can use:
```nix
configurePlatforms = [ "build" ];
```
Along with it, `configureFlags` can be used for adding additional flags. In this example we don't add the flag `--prefix=$out` because in Nix the default value of `--prefix` is already `$out`.

### Syntax

When using **mkDerivation** in a `.nix` package file, and its variables need to be used in other elements, instead of using `rec` you can use `finalAttrs`, as the following example:
```nix
  stdenv.mkDerivation (finalAttrs: {
    pname = "maltego";
    version = "4.6.0";
  
    src = fetchzip {
      url = "https://downloads.maltego.com/maltego-v4/linux/Maltego.v${finalAttrs.version}.linux.zip";
      hash = "sha256-q+1RYToZtBxAIDSiUWf3i/3GBBDwh6NWteHiK4VM1HY=";
    };
    ...
  })
```
In this manner, all the declared variables like `pname` or `version` can be accessed by `finalAttrs.<variable-name>`.

### Makefile

If inside the `Makefile` we have something like:
```
BIN = /usr/bin
```
instead of using `substituteInPlace`, we can use:
```nix
makeFlags = [ "BIN=$(out)/bin" ];
```

## Shell scripts

In case you need to package a shell script which relies on ambient binaries/commands from the system environment, you could not be aware about all used commands, mostly for complex scripts. It can be problematic to understand what are the right dependencies to invoke.

A solution is to use [resholve](https://github.com/abathur/resholve). It helps us to build the package in a self-contained environment in order to keep the correct dependencies tracked.

An example of package using resholve is [unix-privesc-check](https://github.com/NixOS/nixpkgs/blob/f00e45dabfe1af2df6399d0f3b400b6b351467dd/pkgs/by-name/un/unix-privesc-check/package.nix).

In particular, it is mandatory to have **solutions** variable. Inside it:
* **inputs** must be filled with the dependencies of the script
* **fake** should contain those commands that don't exist in Linux environment or that cause the error `"There is not yet a good way to resolve '<command>' in Nix builds."`
* **execer** should contain all those commands that cause the error `'<command>' _might_ be able to execute its arguments, and I don't have any command-specific rules for figuring out if this specific invocation does or not.`. Note that, if the error persists despite you used `cannot`, use the package variable by `.bin` like `"cannot:${glibc.bin}/bin/ldd"`.

## Python standalone (no setup.py)

To build Python tools with no `setup.py` file, it is important that the python script can be linked to the Python Path containing any dependency module that needs to be imported. Guessing that we have a Python script in `$out/share/weevely/weevely.py`, we need to use `python3Packages.buildPythonApplication rec {` as derivation function and create a wrapper and link `PYTHONPATH` to it, like:
```nix
    makeWrapper ${python3}/bin/python $out/bin/weevely \
      --add-flags "$out/share/weevely/weevely.py" \
      --prefix PYTHONPATH : ${python3Packages.makePythonPath propagatedBuildInputs}
```
Remember that dependency modules must be inside `propagatedBuildInputs`.

To prevent the error related to `setup.py not found`, add `format = "other";` in `package.nix`.

## Perl Modules

In case you need to upload a Perl module in Nixpkgs repository, you must not create a `default.nix` in `pkgs/development/perl-modules` (unless the module is not straight forward and needs some core dependency). In most cases, you need only to add in `pkgs/top-level/perl-packages.nix` something like this structure:
```nix
  ParseWin32Registry = buildPerlPackage {
    pname = "ParseWin32Registry";
    version = "1.1";
    src = fetchurl {
      url = "mirror://cpan/authors/id/J/JM/JMACFARLA/Parse-Win32Registry-1.1.tar.gz";
      hash = "sha256-wWOyAr5q17WPSEZJT/crjJqXloPKmU5DgOmsZWTcBbo=";
    };
    meta = with lib; {
      description = "Module for parsing Windows Registry files";
      license = with licenses; [ artistic1 gpl1Only ];
    };
  };
```

## Meta information

**meta** allows to specify several information about the package. The needed fields to set are mainly:
```nix
  meta = with lib; {
    homepage = "https://www.packagetool.com";
    description = "Description of the tool";
    mainProgram = "<tool-name>";
    maintainers = with maintainers; [ <maintainer list separated by space> ];
    platforms = with platforms; <platform list separated by ++>;
    sourceProvenance = with sourceTypes; [ <sourceTypes-value> ];
    license = licenses.<license-type>;
  };
```
You can also use a direct form like `platforms = platforms.unix;`

Note, if you use the pattern with `with` like `sourceProvenance = with sourceTypes;`, the assigned values should be in a list, so between `[ ]`.

Some of these fields accept only specific input values. For each one of these fields, to know what are the possible values to use, refer to the following:
* maintainers: [maintainer-list.nix](https://github.com/NixOS/nixpkgs/blob/master/maintainers/maintainer-list.nix) and [team-list.nix](https://github.com/NixOS/nixpkgs/blob/master/maintainers/team-list.nix) or running:
  ```nix
  nix repl -f '<nixpkgs>'
  builtins.attrNames lib.maintainers
  ```
* platforms: 
  ```nix
  nix repl -f '<nixpkgs>'
  builtins.attrNames lib.platforms
  ```
* sourceProvenance:
  ```nix
  nix repl -f '<nixpkgs>'
  builtins.attrNames lib.sourceTypes
  ```
  note that if nothing is specified, the default value is **fromSource**
* license:
  ```nix
  nix repl -f '<nixpkgs>'
  builtins.attrNames lib.licenses
  ```

  Furthermore, the link at **homepage** must be `https`.

## Misc

### Make binary wrapper

The creation of a binary wrapper is very comfortable since it allows to set environment variables along with it. An example:
```nix
  installPhase = ''
    runHook preInstall
  
    mkdir -p $out/{bin,share}
    chmod +x bin/maltego
  
    cp -aR . "$out/share/maltego/"
  
    makeWrapper $out/share/maltego/bin/maltego $out/bin/${finalAttrs.meta.mainProgram} \
      --set JAVA_HOME ${jre} \
      --prefix PATH : ${lib.makeBinPath [ jre ]}
  
    runHook postInstall
  '';
```

### Make a bash wrapper

Currently, to wrap a program in a bash script, it is possible to use:
```nix
  installPhase = ''
    runHook preInstall

    mkdir -p $out/{bin,share}

    cp -aR . "$out/share/toolname/"

    cat > "$out/bin/${pname}" << EOF
    #!${runtimeShell}
    exec ${perl}/bin/perl $out/share/toolname/toolname.pl "\$@"
    EOF

    chmod u+x  "$out/bin/${pname}"

    runHook postInstall
  '';
```
Some packages in other Linux distributions are wrapped by using `cd` command before using `exec` like:
```nix
  cat > "$pkgdir/usr/bin/$pkgname" << EOF
#!/usr/bin/env bash
cd /usr/share/$pkgname/
exec perl ./rip.pl "\${@}"
EOF
```
This approach is usually used because some tool scripts call other files that work, as example, as plugins, by "relative" path as i.e. `./plugins/`. If `cd` was removed, the tool script is not able to find `plugins` directory anymore.

In Nix, this usage of `cd` in wrappers must be discouraged because it forces you to land in `$out/share/toolname` that is inside `/nix/store`. At this point, how can we prevent `cd` usage and still access to paths like `plugins`?

A good strategy is to use `postPatch` and `substituteInPlace` to replace `plugins` by `$out/share/toolname/plugins` inside the tool script files that define the plugin path. An example comes from `regripper` nix package file:
```nix
  postPatch = ''
    substituteInPlace rip.pl rr.pl \
      --replace-fail \"plugins/\" \"$out/share/regripper/plugins/\" \
      --replace-fail \"plugins\" \"$out/share/regripper/plugins\"
  '';
```

### Usage of macros

The usage of macros in some fields of the `.nix` file is discouraged. For example, in:
```nix
buildPythonPackage rec {
  pname = "pysqlite3";
  version = "0.5.2";
  src = fetchFromGitHub {
    owner = "coleifer";
    repo = pname;
  ...
```
`repo = pname;` must be changed to `repo = "pysqlite3";`. The motivation to avoid the usage of macros/variables on some fiels is explained here: https://github.com/NixOS/nixpkgs/issues/277994

### Source link

If using SourceForge as source, use `mirror://sourceforge/project`.

### Replace code strings

If it is needed to replace code strings inside source files, it is possible to use `substituteInPlace`, usually in `postPatch` for example:
```nix
  postPatch = ''
    substituteInPlace bin/maltego \
      --replace-fail /usr/bin/awk ${lib.getExe gawk} \
      --replace-fail "string" "anotherstring"
  '';
```
To intend, the number of spaces is two.
Note also the usage of `${lib.getExe gawk}`: **lib.getExe** can be used to retrive the path of a binary file.

### Linking libraries

If I'm not wrong, `mkDerivation` should automatically detect `/usr/<path-to-lib>/<lib-file>` at build time and replace `/usr` by `$out`. It occurs when `/usr` as written according to a specific pattern, for example `/usr/local/lib/libguytools.a`.

In case a source file contains something like:
```cpp
const QString ThreadScanLibSearchDirs     = "/lib,/usr/lib,/usr/lib64,/usr/local/lib";  // Separate directories by commas
```
where `ThreadScanLibSearchDirs` will be used as base to find libraries as `libudev` and/or `libparted` at **runtime**, it is needed to change those paths like:
```nix
substituteInPlace threadscan.cpp \
  --replace-fail '/lib,/usr/lib,/usr/lib64,/usr/local/lib' '${builtins.replaceStrings [":"] [","] (lib.makeLibraryPath [ udev parted ])}'
```
It will result in something like:
```cpp
const QString ThreadScanLibSearchDirs     = "/nix/store/2cvhyiblil0vgrcbr4x46pvx9150pqfi-systemd-minimal-libs-254.6/lib,/nix/store/nswzq08675i33c0smqrhyww4r8z3r6v5-parted-3.6/lib";  // Separate directories by commas
```
In case you are using a `substituteInPlace` that replaces `/usr` by `$out` to the file containing the code above, be sure that this general `substituteInPlace` is placed after the `substituteInPlace` of those specific libraries.

If you are dealing with a Java project, you can link libraries at runtime as follows:
```nix
  installPhase = ''
    mkdir -p "$out/lib/java" "$out/share/java"
    cp tool/target/gp.jar "$out/share/java"
    makeWrapper "${jre8_headless}/bin/java" "$out/bin/gp" \
      --add-flags "-jar '$out/share/java/gp.jar'" \
      --prefix LD_LIBRARY_PATH : "${pcsclite.out}/lib"
  '';
```
where `pcsclite` is the dependency package of the needed library.

### Create Desktop file

In a Nix package it is possible to create desktop files by importing `copyDesktopItems` and `makeDesktopItem` and use `desktopItems` as:
```nix
  nativeBuildInputs = [
    copyDesktopItems
  ];
```
and
```nix
  desktopItems = [
    (makeDesktopItem {
      name = finalAttrs.pname;
      desktopName = "Maltego";
      exec = finalAttrs.meta.mainProgram;
      icon = finalAttrs.pname;
      comment = "An open source intelligence and forensics application";
      categories = [ "Network" "Security" ];
      startupNotify = false;
    })
  ];
```

### Create multiple icons from .ico file

If a source project has a `.ico` file, it is possible to generate icon images in different sizes that could be used in the desktop file of the tool. It can be reached by importing `icoutils` and use the following structure:
```nix
  nativeBuildInputs = [
    icoutils
  ];
```
and
```nix
  installPhase = ''
      runHook preInstall
  
      mkdir -p $out/{bin,share}
      chmod +x bin/maltego
  
      icotool -x bin/maltego.ico
  
      for size in 16 32 48 256
      do
        mkdir -p $out/share/icons/hicolor/$size\x$size/apps
        cp maltego_*_$size\x$size\x32.png $out/share/icons/hicolor/$size\x$size/apps/maltego.png
      done
  
      rm -r *.png
  
      cp -aR . "$out/share/maltego/"
  ...
```

### Patch files

If you need to perform massive change on the code of upstream files, you can create **patch files** that will replace the diff content with respect to the original files. This is useful if a tool works on usual Linux systems but not in NixOS and some changes should be applied to make it working on NixOS.

#### Get patch files

When we submit existing tools, some of them could need to be patched for several motivations (i.e., security reasons). How can we know if a tool has patch files available?

One effective method is to access to [Debian Security Tools Packaging Team repository](https://salsa.debian.org/pkg-security-team) and search for the tool you are submitting in Nix repository and look inside `debian/patches` directory where you can find a list of patch files.

#### Create patch files

To create a patch file, you need to create a folder containing the same directory path of the upstream project. For example, if you need to patch `utils.rs` and it is stored in the `src/` folder, you should create:
```sh
mkdir -p a/src
mkdir -p b/src
```
in `a/src/` you will store the upstream original `utils.rs` while in `b/src/` you will store the edited `utils.rs`. Then, run:
```sh
diff -Naur a/src/utils.rs b/src/utils.rs > utils.patch
```
`utils.patch` is the patch file we will use inside our Nix derivative.

#### Deploy patch files

Usually, if patches are available online, it is a good practice to use `fetchpatch` instead of using local patch files.

As example, in `package.nix`:
```nix
  patches = [
    (fetchpatch {
      url = "https://salsa.debian.org/pkg-security-team/ext3grep/-/raw/<latest-commit>/debian/patches/001_fix-ftbfs-e2fsprogs_1.42-WIP-702.diff";
      hash = "sha256-27M+o3vw4eGCFpdqVLXX6b73a8v29yuKphMo8K0xJ3U=";
    })
    (fetchpatch {
      url = "https://salsa.debian.org/pkg-security-team/ext3grep/-/raw/<latest-commit>/debian/patches/002_remove_i_dir_acl.diff";
      hash = "sha256-2bdlJ+zlsd7zX3ztV7NOTwSmEZf0N1BM8qJ/5avKX+M=";
    })
  ];
```
Note that we must replace `debian/master` by the last commit ID of the single patch file. it is needed because, if we use `debian/master`, the file could change over time and it can generate issues.

If you are using local patch file, use:
```nix
  # Patches only relevant for Nixpkgs
  patches = [
    ./utils.patch
  ];
```
In case you have multiple local patch files that are used for one single purpose, you must merge them in one single patch file by, for example:
```sh
cat main.patch manage.patch types.patch utils.patch > disable_shell_prompt_change.patch
```
and, inside the `package.nix`:
```nix
  # Patches only relevant for Nixpkgs
  patches = [
    ./disable-shell-prompt-change.patch
  ];
```
Note that, according to the [naming convention](https://github.com/NixOS/nixpkgs/blob/master/CONTRIBUTING.md#file-naming-and-organisation), filenames should contain dashes if needed, instead of underscores.

### Testing Python programs

Testing Python applications directly in the system is discouraged and the application could not find Python libraries you want to import. This testing should be done in a development environment instead of directly in you system. According to [this guide](https://ayats.org/blog/nix-workflow/#python), you can create your Python development environment by creating a `default.nix` file similar to:
```nix
with import <nixpkgs> {};

pkgs.mkShell {
  packages = [
    (pkgs.python3.withPackages (python-pkgs: [
      python-pkgs.pygobject3
    ]))
  ];

  nativeBuildInputs = [
    gobject-introspection
    wrapGAppsHook
  ];

  buildInputs = [
    gtk3
    libwnck
  ];
  
  # Workaround: make vscode's python extension read the .venv
  shellHook = ''
    export PYTHONPATH="$PYTHONPATH:${libwnck}"
    venv="$(cd $(dirname $(which python)); cd ..; pwd)"
    ln -Tsf "$venv" .venv
  '';
}
```
and then, run `nix-shell`. By this method, the application is able to find the imported libraries and it runs in an isolated environment.

## OfBorg check

OfBorg helps us to understand if a tool we submitted on a PR builds correctly in specific architectures (i.e., darwin). Just go to the list of all checks on the bottom page of the opened PR and scroll down the list until you find something like `ext3grep, ext3grep.passthru.tests on x86_64-darwin`.

If it does not succeed, it means there is an error. As example, in case of darwin check failing, if there is no code fix or patch file solving it, just change `platforms = platforms.unix;` to `platforms = platforms.linux;`.

## Review PR

It is possible to review a PR and post an automated comment on the result to the PR ticket by using `nixpkgs-review` command. To use this, clone the Nixpkgs repository from a recent master/unstable checkout:
```sh
git clone https://github.com/NixOS/nixpkgs --depth=1
cd nixpkgs
```
Then, run:
```sh
nixpkgs-review pr <PR-number>
nixpkgs-review post-result --token <your-GitHub-token>
```
This command will publish a comment on your behalf containing the result of the tested compilation.
Your GitHub personal token must be created by the scope `repo:public_repo`.

If the output is similar to:

Result of `nixpkgs-review pr 288039` run on x86_64-linux [1](https://github.com/Mic92/nixpkgs-review)
<details>
  <summary>1 package built:</summary>
  <ul>
    <li>scrounge-ntfs</li>
  </ul>
</details>

and there is no error shown, the compilation has been successful.

For additional information, refer to [nixpkgs-review docs](https://github.com/Mic92/nixpkgs-review#usage).
