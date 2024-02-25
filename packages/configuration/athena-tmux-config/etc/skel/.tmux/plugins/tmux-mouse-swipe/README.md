# tmux-mouse-swipe

Right click and swipe left or right in any pane to switch window in that
direction or swipe up or down to switch session.

As always any suggestions for improvements are welcome!

## Purpose

When you are at the keyboard obviously a key sequence is both faster and more
natural to switch sessions or windows.
I use this tool mostly just getting a quick overview when having the
terminal on a side screen, in such cases mouse swiping is handy.

The reason I wrote it as a posix script is that since it gets run multiple
times in quick sequence, on my iPad running iSH, there is a noticeable
performance boost not having to repeatedly start bash scripts.

## Installation

Comparability: tmux version 3.0 or higher

### With [Tmux Plugin Manager](https://github.com/tmux-plugins/tpm) (recommended)

Add plugin to the list of TPM plugins in `.tmux.conf`:

```tmux
set -g @plugin 'jaclu/tmux-mouse-swipe'
```

Hit `<prefix> + I` to fetch the plugin and source it.

### Manual Installation

Clone the repository:

```shell
git clone https://github.com/jaclu/tmux-mouse-swipe.git ~/clone/path
```

Add this line to the bottom of `.tmux.conf`:

```tmux
run-shell ~/clone/path/mouse_swipe.tmux
```

From the terminal, reload TMUX environment:

```shell
tmux source-file ~/.tmux.conf
```

## Usage

Once installed, try pressing down right button and swipe up, down, left
or right on any pane.

Once you release the button, tmux should switch window after horizontal
swipe and session after vertical.

If you only have one Window or Session, a message will be displayed
that the requested action can not be performed, depending on swipe direction.

## Minimal movement

Since drag isn't registered until you move one character cell, and at least
one more cell of movement is needed to detect direction, minimal movement
distance is two characters.

## Not purely vertical / horizontal swipes

If both vertical and horizontal swiping is detected, the axis with the most delta is assumed to be the intended action.

## Pane borders

tmux sends mouse coordinates relative to the pane that the mouse is over,
so if you cross a pane border during the swipe,
the direction of movement will most likely not be the intended.

## Basic modifications

If you want to bind this to another mouse event, search for the
MOUSE SUPPORT section in the tmux man page for details on how to bind mouse
events. Change mouse_swipe.tmux in the top directory of this repository.

## Contributing

Contributions are welcome, and they are greatly appreciated!
Every little bit helps, and credit will always be given.

The best way to send feedback is to file an issue at
[tmux-mouse-swipe/issues](https://github.com/jaclu/tmux-mouse-swipe/issues)

### License

[MIT](LICENSE.md)
