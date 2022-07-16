<h1 align="center">
  Dive into a new Pentesting Experience with<br>
Athena OS
</h1>

<p align="center">
  <img src="https://img.shields.io/badge/Maintained%3F-Yes-CD8335">
  <img src="https://img.shields.io/github/downloads/Athena-OS/athena-iso/total?label=Downloads&logo=github&color=6EA340">
  <img src="https://badgen.net/github/release/Athena-OS/athena-iso">
  <img src="https://badgen.net/github/stars/Athena-OS/athena-iso">
  <img src="https://badgen.net/github/open-issues/Athena-OS/athena-iso">
  <img src="https://badgen.net/github/license/Athena-OS/athena-iso">
</p>

<p align="center">
  <a href="https://discord.gg/GuDyREsNkj">
    <img src="https://img.shields.io/badge/Join%20on%20Discord-Ya?logo=discord&logoColor=white&color=%235865F2&style=['for-the-badge']&url=https%3A%2F%2Fdiscord.gg%2FGuDyREsNkj">
  </a>
</p>

<p align="center">
  <img src="https://user-images.githubusercontent.com/83867734/174499581-e0f74d41-36ce-4c01-af0d-6ecd98841a64.png" data-canonical-src="https://user-images.githubusercontent.com/83867734/174499581-e0f74d41-36ce-4c01-af0d-6ecd98841a64.png" width="600" height="496" />
</p>

<h3 align="center">
  🏅Born for InfoSec Professionals, Bug Bounty Hunters, Passionate Students and Spicy Hackers🏅
</h3>

<h3 align="center">
  💞
  <a href="https://github.com/Athena-OS/athena-iso/releases/latest">
  Download Athena OS Now
    </a>
  💞
</h3>

<h3 align="center">
  🎥
  <a href="https://www.youtube.com/watch?v=4_ZY9Tj4U_8">
  Spicy Pentesting OS Demo
    </a>
   🎥
</h3>


### Why Athena?
* *Pentesting*: Athena can access to [BlackArch repository](https://blackarch.org/tools.html), the **biggest pentesting tool warehouse**, whereas Debian-based distros cannot.
* *User-oriented*: if Arch is born for experienced users, Athena is conceived for **decreasing complexity** and **improving user experience**.
* *Lightweight*: Athena **optimizes the disk space consumption** by retrieving the tools you need only when you use them. Tools you never use won't be stored and the space is only used for what you really need.
* *Performance*: Athena is based on Arch Linux so it is configured to load the **bare minimum** for its purpose. No useless services, no useless modules consuming your resources.
* *Flexibility*: for its Arch nature, Athena is **flexible** and can easily evolve to the new needs of the users.
<br>

Wiki: https://github.com/Athena-OS/athena-iso/wiki

For a correct Post Installation setting, please follow the [Configuration](https://github.com/Athena-OS/athena-iso#configuration) section.

## Latest Updates
Here I would like to inform you about new features already tested and implemented that have been published in the newest release, for keeping you always informed in a comfortable way.

The newest release provides:
* Implemented **Bfetch** tool
* Implemented **Bashtop** tool
* Implemented **Dash 2 Dock** bar
* Implemented **Desktop Icon NG**
* Removed Hyper due to poor performance terminal
* Implemented **Kitty** for high performance terminal
* Implemented **tmux** as terminal multiplexing
* Implemented additional **aliases** shared between FISH and BASH
* Implemented **Figlet** and **spicy fonts**
* Implemented **Notion App Enhanced**
* Full integration with **Hack The Box** platform


## Introduction
The purpose of Athena project arises to offer a different experience than the most used pentesting distributions. These distros are mainly based on Debian, and they rely mainly on Debian or GitHub repositories for retrieving security tools that don't store all security tools and are hard to maintain. Furthermore, these OSes come already with a big amount of tools and services of which a good percentage is never used by the average of users, and it becomes a space waste and could cause performance degradation.

Athena is designed from scratch, so already during the development phase useless modules and services have been excluded in order to improve performance and resource consumption. Furthermore, this design approach allowed to review in detailed manner each single package and component to include inside the distribution. It led the OS to build a user-friendly environment, despite based on Arch Linux.

The heritage of Arch Linux impacts positively Athena OS with respect to other pentesting Debian-based OSes:
* Better performance: pacman is faster than apt 
* Focused: Athena can be developed and maintained down to the smallest detail 
* Much more security tools: Athena can rely on BlackArch repository, that contains much more security tools than Debian repositories 
* Freedom: during the installation, you can choose to build your Athena with any resource or service you need. 
* Documentation: Arch Linux is very well documented on Internet for any need

Athena's environment is based on GNOME Wayland that provide exciting features the user can enjoy!

Let's give a detailed look on Athena! 
<br>
<br>

## Main Elements

### PenTOXIC Menu

PenTOXIC Menu is born for organizing in pretty manner all main security tools you need to start your hacking activity. It consists in two levels:
* 1st level containing the several **hacking categories** as submenu, plus **Firefox** browser and **Code OSS** as editor
* 2nd level consisting in the **hacking tools** deployed for each category

![image](https://user-images.githubusercontent.com/83867734/177038161-261c745d-79f8-44d7-8e8b-ec2e9dd439be.png)

### PWNage Menu

PWNage Menu allows you to access quickly to the main hacking platforms for learning purposes and to join the main Discord InfoSec Communities:
* 1st shell deploys all quick links to the main hacking platforms
* 2nd shell can be accessed by the Discurity icon on top where the user has the opportunity to join several Discord InfoSec servers or open Discord App.

![image](https://user-images.githubusercontent.com/83867734/177038794-05892fb5-2c05-40be-9d1b-ea1b56410a57.png)

### Hack The Box Integration

Cannot you wait for opening browser and accessing to Hack The Box website? Athena gives you the possibility to play Hack The Box machines directly on your Operating System environment in a quick and comfortable manner. Athena offers:
* Connect/Disconnect to/from Hack The Box VPN servers
* Play any active free machine you wish
* Reset the active machine
* Stop any active machine
* Submit a flag and write a review about your hacking experience!
* ... and of course you can access to the Hack The Box website in one click

![image](https://user-images.githubusercontent.com/83867734/178805340-d3491817-25ae-4418-9d4a-9a723e709ecd.png)

### Firefox ESR Hack Mode

<p align="center">
  <img width="200" height="200" src="https://user-images.githubusercontent.com/83867734/177051677-d8a7efa4-cfb3-407e-8569-195ba8a483b3.png">
</p>

Firefox ESR has been modified in order to integrate at the installation time the addons you need for your web application pentesting activity. The preinstalled addons are:
* Cookie Quick Manager
* Dark Reader
* FoxyProxy Standard
* HacKontext
* HTTPS Everywhere
* Privacy 
* uBlock Origin
* Wappalyzer

### Payload to Dock

Payload to Dock is based on Dash 2 Dock and keeps the access to the most famous payload repositories. It allows you to get the latest version of payloads and accessing their path directly by the shell. It shows:
* Auto Wordlists
* FuzzDB
* PayloadAllTheThings
* SecLists
* Security Wordlist

The Dock contains also links to Mimikatz and Powersploit.

![image](https://user-images.githubusercontent.com/83867734/177040060-ae74270f-0528-4e4b-972f-a2c293578263.png)

### BlackArch Repository

<p align="center">
  <img width="400" height="400" src="https://user-images.githubusercontent.com/83867734/177051929-9a248a26-fc4f-4741-bc14-af679e2eb7b2.png">
</p>

BlackArch Linux is an Arch Linux-based penetration testing distribution for penetration testers and security researchers. Its repository contains [2800+ tools](https://blackarch.org/tools.html), classified for categories. You can install tools individually or in groups according to the categories they belong. BlackArch Repository is compatible with only Arch-based distributions as Athena OS.

<br>

## Installation

Download the latest Athena release .iso file from the related section. According to your need, you can choose to install Athena on your computer natively, or implement it on a Virtual Machine (e.g., VMware or VirtualBox).

Currently VirtualBox is affected by a bug is enabling 3D Acceleration, so keep it disabled.

When you mount the ISO to your pendrive or your Virtual Machine and boot up Athena, you will meet Athena Calamares Installer, that allows you to customise your future Athena OS as you wish.

Currently, I didn't have the time to test every scenario, but I can suggest you an installation scenario that I tested, and it is based on the installation of Athena on a VMware Virtual Machine:
1. Boot up Athena on VMware
2. Wait for the Installer appearing. If not, on Athena Welcome App select `Advanced Installation`
3. On `Welcome` select your preferred language
4. On `Kernel` select `Linux kernel - installed by default`
5. On `Drivers` and `Drivers Nv` leaves blank
6. On `Virtual Machine` set `VMware Virtual Machine`
7. On `Login` set `Display Manager: Gdm`
8. On `Theme` set what you prefer
9. On `Location` and `Keyboard` set what you wish. Note: currently Calamares has a bug on the timezone setting because if the user clicks on a point of the map, usually the timezone is set to en_AG. Choose manually your preferences on the right-bottom part of the window (if need, expand installer window). This bug will be fixed in the next release of Calamares (you will need only a `pacman -Syu`).
10. On `Partitions` set `Erase disk` and feel free to set up the Swap or not, and use btrfs
11. On `Users` set the user details you wish
12. Confirm the choices summary
13. Wait for the end of installation
14. Enjoy Athena OS!

Note: Athena Welcome App is based on ArcoLinux project. Currently, the links are still referred to ArcoLinux.

<br>

## Configuration

After the installation and the first boot:
1. please Logout and Login from the current session. It is needed for initializing the GNOME keyring for storing your Hack The Box API key in a secure manner.
2. open Kitty terminal, run `htb-update` and copy and paste your Hack The Box API key.

The Hack The Box API Key can be retrieved by your Hack The Box profile settings -> "Create App Token".

Until your API key will be valid, your system will update the Hack The Box contents automatically for you at each login or when `htb-update` is run.

Note that GNOME, for safety reason, after a reboot could disable GNOME extensions, so PenTOXIC and PWNage menu could not work. For re-enable then again easily, just go to the Menu Application, search for `Extensions`, and enable the first option.

<br>

## Usage

Athena OS is just born and wait only for being used by the InfoSec community!

Athena is divided in two environment: desktop and application menu.

In the desktop environment, you can invoke **PenTOXIC** by `CTRL + SPACE`, a special menu based on [Fly-Pie](https://github.com/Schneegans/Fly-Pie) project showing hacking categories containing the most used security tools we use for our pentesting activities. PenTOXIC gives you the possibility to quickly access to **Firefox ESR**, **Code OSS** and **Kitty** terminal. It is born to be also used on touchscreens.

At the first usage of Athena, the security tools are not installed but if you click on one of them, Athena will install it for you. It helps the user to save disk space and install only the tools they need. The security tools invoked by PentOX menu are run by cool-retro-term terminal, and you can customise it by right-click on it and settings.

The second main element in the desktop is **PWNage**, a menu that offers you learning and support resources for people entering in the Cybersecurity world, and accessible by `CTRL + TAB`. In details, PWNage consists in two levels: the first one composed of Hacking Platform resources for learning and training, and the second one composed of InfoSec discord servers where you can find any kind of support. PWNage is fully integrated with **Hack The Box**, so you can play any active free machine directly on your desktop environment!

The application menu environment can be accessed by pressing the `WIN` button on the keyboard. This environment is used for giving you quick access to a battery of payloads you can use for your pentesting activity as **SecLists** and **PayloadAllTheThings**. These resources are also shown in the desktop by the **Payload to Dock**.

Of course, Athena can retrieve much more security tools, almost 3000! It is possible because it relies on [BlackArch repository](https://blackarch.org/tools.html), so if you need another tool not shown on PentOX menu, you can install it directly by `sudo pacman -S <tool-name>`. If you are a lover of a specific hacking category, you can install one shot all the tools related to a specific category. For example, if you are a lover of exploitation, you can install all related tools by `sudo pacman -S blackarch-exploitation`. For other categories or specific tools, please refer to the BlackArch link.
  
In Athena OS, Firefox ESR comes with preinstalled extensions that can support you during your pentesting activity and privacy navigation:
* Cookie Quick Manager: manage (view, search, create, edit, delete, backup, restore) cookies
* Dark Reader: Dark mode for every website. Take care of your eyes, use dark theme for night and daily browsing
* FoxyProxy: Proxy Management tool
* HacKontext: inject HTTP header and body of the active browser tab on InfoSec command-line tools to improve and speed up their usage
* HTTPS Everywhere: encrypt the Web! Automatically use HTTPS security on many sites
* Privacy Badger: automatically learn to block invisible trackers
* uBlock Origin: an efficient blocker. Easy on CPU and memory
* Wappalyzer: uncover the technologies used on websites. It detects content management systems, eCommerce platforms, web servers, JavaScript frameworks, analytics tools and many more.

Furthermore, Athena supports also git, so be creative to make your own security tool and publish it on GitHub!

There are other spicy features on Athena, but for now I shut my mind. 🔥Discover them!🔥
<br>
<br>
## Support

If you detect any issues during your experience, please [open an issue](https://github.com/Athena-OS/athena-iso/issues) on athena-iso GitHub repository.
<br>
<br>

## Utility Commands

| Command | Description |
| ------- | ----------- |
| `bashtop` | Resource monitor that shows usage and stats for processor, memory, disks, network and processes. |
| `bat` | A `cat` clone with syntax highlighting and Git integration. |
| `bfetch` | SuperB general-purpose fetch displayer . |
| `code` | Core engine of Visual Studio Code.  |
| `eog` | Image viewer. |
| `fish` | A smart and user-friendly command line shell. |
| `git` | Fast, scalable, distributed revision control system. |
| `gnome-extensions` | Gnome Extension manager. |
| `gnome-tweaks` | Configure looks and functionality of your desktop. |
| `kitty` | The fast, feature-rich, GPU based terminal emulator. |
| `la` | An `lsd -a` alias. |
| `ll` | An `lsd -alFh` alias. |
| `lsd` | An `ls` command with a lot of pretty colors and some other stuff. |
| `nano` | Simple terminal-based text editor. |
| `nautilus` | File Manager. |
| `neofetch` | CLI system information tool written in BASH. |
| `pacman` | Arch Linux package manager. |
| `paru` | Pacman wrapping AUR helper with lots of features and minimal interaction. |
| `tmux` | Terminal multiplexer that allow you switch easily between several programs in one terminal, detach them and reattach them to a different terminal. |
| `tree` | Recursive directory listing program that produces a depth indented listing of files. |
| `vim` | Highly configurable text editor built to make creating and changing any kind of text very efficient. |

Vim configuration is based on https://github.com/amix/vimrc so it implements smart and useful [plugins](https://github.com/amix/vimrc#included-plugins), [color schemes](https://github.com/amix/vimrc#included-color-schemes) and [modes](https://github.com/amix/vimrc#included-modes).

If you would like to enable, edit or disable Burn My Window opening and closing effect:
```
gnome-extensions prefs burn-my-windows@schneegans.github.com
```
and check or uncheck your effects.

Change your themes and icons by `gnome-tweaks`.

## Shortcuts
Keybindings in Athena OS for speeding up your work.

![logo](https://user-images.githubusercontent.com/83867734/179193319-e72540a0-d284-4b81-ac0a-fedd29484355.png)
| Keybind | Description |
| ------- | ----------- |
| `CTRL+SPACE` | PenTOXIC menu |
| `CTRL+TAB` | PWNage menu |
| `WIN` | Multi-desktop environment |
| `WIN+WIN` | Switch between desktop and "Show Applications" menu |

<br>
<br>

![image](https://user-images.githubusercontent.com/83867734/179191651-fe161356-2d4b-401c-8bea-1318bc481046.png)
| Keybind | Description |
| ------- | ----------- |
| `CTRL + s`| Super/Mod Key |
| `Mod_Key + \` | Split Panel Vertically |
| `Mod_Key + -` | Split Panel Horizontal |
| `Mod_Key + r` | Reload tmux |
| `Mod_Key + SHIFT + i` | Install Plugins | 
| `Mod_Key + SHIFT + u` | Update Plugins |
| `Mod_Key + c` | New Tab |
| `SHIFT + Right/Left Arrow Key` or `Modkey + n` | Switch Between Tabs |
| `Mod_Key + Right/Left/Up/Down Arrow Key` | Switch Between Splitted Panels |
| `Mod_Key + w` | List All Windows and Panels |
| `Mod_Key + x` | Kill Tab or Panel |
| `Mod_Key + &` | Kill Window |
| `Mod_key + q` | Show Panel or Tab Number |
| `Mod_Key + t` | Clock |
| `Mod_Key + y` | Copy Selected Text to Clipboard |
| `Mod_Key + SHIFT + y` | Copy Working Directory |
| `Mod_Key + p` | Paste |
| `Mod_Key + d` | Detach Terminal |
| `Mod_Key + f` | Find |
| `Mod_Key + z` | Make Panel Full Window |
| `Mod_Key + m` | Start Monitoring Panel |
| `Mod_key + $` | Rename Session |

<br>

## Screenshots
![image](https://user-images.githubusercontent.com/83867734/177039614-dbd8b314-a083-4153-96ea-6f1eff3d604a.png)

## Athena Roadmap
* Implementation of different themes that can be chosen at time of the installation
* Wiki documentation

## Troubleshooting
* After the installation, if Fly-Pie extension (PenTOXIC menu) and Burn My Windows extension don't work, reinstall the operating system on a separate VM and check again;
* After the first login of Discord App, at the next access on the application, if it freezes during the starting, reboot the system and the issue will be fixed.

## Credits
* [ArcoLinux Project](https://www.arcolinux.info): Resources and Learning materials
* [Calamares Team](https://calamares.io): Calamares Installer
* [Simon Schneegans](https://github.com/Schneegans): Fly-Pie menu and Burn My Window extensions
* [HackTheBox](https://www.hackthebox.com): Bash and PowerShell icons; Hack The Box icon
* [Offensive Security](https://www.offensive-security.com): Kali Linux security tools icons; Offensive Security icon
* [Kitsunekun](https://www.furaffinity.net/view/23914148): Athena Chibi Logo
* [Red Team Village](https://redteamvillage.io): PWNage menu icon
