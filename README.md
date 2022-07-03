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
  <a href="https://github.com/Athena-OS/athena-iso/releases/latest">
  💞Download Athena OS Now💞
    </a>
</h3>

<h3 align="center">
  🏅Born for InfoSec Professionals, Bug Bounty Hunters, Passionate Students and Spicy Hackers🏅
</h3>
<br>


### Why Athena?
* *Pentesting*: Athena can access to [BlackArch repository](https://blackarch.org/tools.html), the **biggest pentesting tool warehouse**, whereas Debian-based distros cannot.
* *User-oriented*: if Arch is born for experienced users, Athena is conceived for **decreasing complexity** and **improving user experience**.
* *Lightweight*: Athena **optimizes the disk space consumption** by retrieving the tools you need only when you use them. Tools you never use won't be stored and the space is only used for what you really need.
* *Performance*: Athena is based on Arch Linux so it is configured to load the **bare minimum** for its purpose. No useless services, no useless modules consuming your resources.
* *Flexibility*: for its Arch nature, Athena is **flexible** and can easily evolve to the new needs of the users.
<br>

## Incoming Updates
Here I would like to inform you about new features already tested and implemented that will be published in the next release, for keeping you always informed in a comfortable way.

The next release will provide:
* Improved **PenTOXIC menu** responsiveness from 1 second on the current release to some milliseconds (almost instantaneous) on the new release
* Removed some Hyper terminal plugins (hyperpower, hyperterm-dibdabs, hyper-startup) for improving the responsiveness of **Hyper Terminal**. The user can install these plugins autonomously
* Implemented **Discord** application
* Implemented **Discord top bar icon**
* Implemented **lolcat**
* Added **Ghidra** and **EDB Debugger** in PenTOXIC
* Added support of the **auto-size screen** in VMWare and VirtualBox Live Environment
* Implemented **hexedit**
* Changed cool-retro-term to **gnome-terminal** for running security tools from PenTOXIC menu because graphically less bulky
* Implemented **Athena Remote Repository** for rolling updates
* Implemented **Theme Choice** on the Installer
* Implement a new theme: **Graphite Dark**
* Implemented a new menu: **PWNage**. No spoilers, just some image:
![image](https://user-images.githubusercontent.com/83867734/175814103-b0047645-a92e-480d-a8b5-a4f7e16933eb.png)

I will take some time for getting feedbacks by users and then I will publish the next release!

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
## Installation

Download the latest Athena release .iso file from the related section. According to your need, you can choose to install Athena on your computer natively, or implement it on a Virtual Machine (e.g., VMware or VirtualBox).

When you mount the ISO to your pendrive or your Virtual Machine and boot up Athena, you will meet Athena Calamares Installer, that allows you to customise your future Athena OS as you wish.

Currently, I didn't have the time to test every scenario, but I can suggest you an installation scenario that I tested, and it is based on the installation of Athena on a VMware Virtual Machine:
1. Boot up Athena on VMware
2. On Athena Welcome App select `Advanced Installation`
3. On `Welcome` select your preferred language
4. On `Kernel` select `Linux kernel - installed by default`
5. On `Drivers` and `Drivers Nv` leaves blank
6. On `Virtual Machine` set `VMware Virtual Machine`
7. On `Login` set `Display Manager: Gdm`
8. On `Theme` set what you prefer
9. On `Location` and `Keyboard` set what you wish. Note: currently Calamares has a bug on the timezone setting because if the user clicks on a point of the map, usually the timezone is set to en_AG. Choose manually your preferences. This bug will be fixed in the next release of Calamares (you will need only a `pacman -Syu`).
10. On `Partitions` set `Erase disk` and feel free to set up the Swap or not, and use btrfs
11. On `Users` set the user details you wish
12. Confirm the choices summary
13. Wait for the end of installation
14. Enjoy Athena OS!

Note: Athena Welcome App is based on ArcoLinux project. Currently, the links are still referred to ArcoLinux.

<br>

## Usage

Athena OS is just born and wait only for being used by the InfoSec community!

Athena is divided in two environment: desktop and application menu.

In the desktop environment, you can invoke **PentOX** by `CTRL + SPACE`, a special menu based on [Fly-Pie](https://github.com/Schneegans/Fly-Pie) project showing hacking categories containing the most used security tools we use for our pentesting activities. PentOX gives you the possibility to quickly access to **Firefox ESR**, **Code OSS** and **Hyper** terminal. It is born to be also used on touchscreens.

At the first usage of Athena, the security tools are not installed but if you click on one of them, Athena will install it for you. It helps the user to save disk space and install only the tools they need. The security tools invoked by PentOX menu are run by cool-retro-term terminal, and you can customise it by right-click on it and settings.

The application menu environment can be accessed by pressing the `WIN` button on the keyboard. This environment is used for giving you quick access to a battery of payloads you can use for your pentesting activity as **SecLists** and **PayloadAllTheThings**.

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
| `bat` | A `cat` clone with syntax highlighting and Git integration. |
| `code` | Core engine of Visual Studio Code.  |
| `cool-retro-term` | Retro-style terminal.  |
| `eog` | Image viewer. |
| `fish` | A smart and user-friendly command line shell. |
| `git` | Fast, scalable, distributed revision control system. |
| `gnome-extensions` | Gnome Extension manager. |
| `gnome-tweaks` | Configure looks and functionality of your desktop. |
| `hyper` | A terminal built on web technologies. |
| `la` | An `ls -la` alias. |
| `lsd` | An `ls` command with a lot of pretty colors and some other stuff. |
| `nano` | Simple terminal-based text editor. |
| `nautilus` | File Manager. |
| `neofetch` | CLI system information tool written in BASH. |
| `pacman` | Arch Linux package manager. |
| `paru` | Pacman wrapping AUR helper with lots of features and minimal interaction. |
| `tree` | Recursive directory listing program that produces a depth indented listing of files. |
| `vim` | Highly configurable text editor built to make creating and changing any kind of text very efficient. |

Vim configuration is based on https://github.com/amix/vimrc so it implements smart and useful [plugins](https://github.com/amix/vimrc#included-plugins), [color schemes](https://github.com/amix/vimrc#included-color-schemes) and [modes](https://github.com/amix/vimrc#included-modes).

If you would like to enable, edit or disable Burn My Window opening and closing effect:
```
gnome-extensions prefs burn-my-windows@schneegans.github.com
```
and check or uncheck your effects.

## Shortcuts
Main keybindings in Athena OS for speeding up your work:
| Keybind | Description |
| ------- | ----------- |
| `CTRL+SPACE` | PentOX menu |
| `CTRL+TAB` | PWNage menu |
| `WIN` | Switch between desktop and application menu |
| **Hyper Terminal** | |
| `CTRL+SHIFT+N` | New Window |
| `CTRL+SHIFT+T` | New Tab |
| `CTRL+SHIFT+E` | Split Down |
| `CTRL+SHIFT+D` | Split Right |
| `CTRL+SHIFT+W` | Close Window |
| `CTRL+SHIFT+Q` | Quit |


<br>

## Screenshots
![image](https://user-images.githubusercontent.com/83867734/174466390-e8e259aa-4fb7-4daa-9a7a-334dcded25d7.png)

![image](https://user-images.githubusercontent.com/83867734/174466429-dfea6b99-5c9d-413c-bb9b-b913977b37f7.png)

![image](https://user-images.githubusercontent.com/83867734/174466501-22401754-b879-45b8-8c22-88c1db158371.png)

![image](https://user-images.githubusercontent.com/83867734/174466454-d9701dff-bb1b-4f96-b1fa-f3b6f319c960.png)

![image](https://user-images.githubusercontent.com/83867734/174466786-2a9e772f-0c6e-498e-812f-d2ffa3a4b8c7.png)

![image](https://user-images.githubusercontent.com/83867734/174466654-499e34bf-3087-48c0-b913-35bab5c2e5d0.png)

![image](https://user-images.githubusercontent.com/83867734/174467971-c1f229bc-0349-44fc-9200-88df28bb6359.png)

## Athena Roadmap
* Implementation of different themes that can be chosen at time of the installation
* Dash 2 Dock evaluation
* Wiki documentation

## Troubleshooting
* After the installation, if Fly-Pie extension (PenTOXIC menu) and Burn My Windows extension don't work, reinstall the operating system on a separate VM and check again;
* After the first login of Discord App, at the next access on the application, if it freezes during the starting, reboot the system and the issue will be fixed.

## Credits
* [ArcoLinux Project](https://www.arcolinux.info): Resources and Learning materials
* [Simon Schneegans](https://github.com/Schneegans): Fly-Pie menu and Burn My Window extensions
* [HackTheBox](https://www.hackthebox.com): Bash and PowerShell icons; Hack The Box icon
* [Offensive Security](https://www.offensive-security.com): Kali Linux security tools icons; Offensive Security icon
* [Kitsunekun](https://www.furaffinity.net/view/23914148): Athena Chibi Logo
* [Red Team Village](https://redteamvillage.io): PWNage menu icon
