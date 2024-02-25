# tmux-notify

[![Maintained](https://img.shields.io/badge/Maintained%3F-yes-green)](https://github.com/ChanderG/tmux-notify/pulse)
[![Contributions](https://img.shields.io/badge/contributions-welcome-orange.svg)](contributing.md)
[![Tmux version](https://img.shields.io/badge/tmux-%3D%3E1.9-blue)](https://github.com/tmux/tmux/wiki)

<a href="https://github.com/ChanderG/tmux-notify"><img src="resources/tmux-notify-logo.svg" alt="tmux notify logo" width="567" height="135"/></a>

Tmux plugin to notify you when processes complete.

Notification is via libnotify and visual bell raised in the tmux window. Visual bells can be mapped (in the terminal level) to X11 urgency bit and handled by your window manager.

## Use cases

-   When you have already started a process in a pane and wish to be notified; that is can't use a manual trigger
-   Working in different containers (Docker) -> can't choose the shell -> and can't use a shell level feature
-   Working over ssh but your tmux is on client side

## Install

Using [Tmux Plugin Manager](https://github.com/tmux-plugins/tpm), add:

    set -g @plugin 'ChanderG/tmux-notify'

to your `.tmux.conf`.

Use `prefix + I` to install.

## Usage

`prefix + m`: Start monitoring a pane and notify when it finishes.

`prefix + alt + m`: Start monitoring a pane, return it in focus and notify when it finishes.

`prefix + M`: Cancel monitoring of a pane.

## Pre-requisites

bash, notify-send on the machine with the tmux server.
Tested only on Linux.

## Configuration

### Enable verbose notification

By default, the notification text is set to `Tmux pane task completed!`. We have also included a verbose output option. When enabled information about the pane, window and session in which the task has completed is given.

Put `set -g @tnotify-verbose 'on'` in `.tmux.conf` to enable this.

#### Change the verbose notification message

To change the verbose notifaction text put `set -g @tnotify-verbose-msg 'put your notification text here'` in `.tmux.conf`. You can use all the tmux variables in your notification text. Some useful tmux aliases are:

-   `#D`: Pane id
-   `#P`: Pane index
-   `#T`: Pane title
-   `#S`: Session name
-   `#I`: Window index
-   `#W`: Window name

For the full list of aliases and variables you are refered to the `FORMATS`  section of the [tmux manual](http://man7.org/linux/man-pages/man1/tmux.1.html).

### Change monitor update period

By default, the monitor sleep period is set to 10 seconds. This means that tmux-notify checks the pane activity every 10 seconds.

Put `set -g @tnotify-sleep-duration 'desired duration'` in `.tmux.conf` to change this duration.

**NOTE:** Keep in mind that there is a trade-off between notification speed (short sleep duration) and the amount of memory this tool needs.

## How does it work

Pretty naive approach actually. Checks if pane content ends in $ every 10 seconds.
Will add other prompt end characters as needed.

## Contributing

Feel free to open an issue if you have ideas on how to make this GitHub action better or if you want to report a bug! All contributions are welcome. :rocket: Please consult the [contribution guidelines](CONTRIBUTING.md) for more information.

## License

[MIT](LICENSE)

## References

Icon created with svg made by [@chanut](https://www.flaticon.com/authors/chanut) from [www.flaticon.com](https://www.flaticon.com/authors/chanut)
