# Tmux sensible

A set of tmux options that should be acceptable to everyone.

Inspired by [vim-sensible](https://github.com/tpope/vim-sensible).

Tested and working on Linux, OSX and Cygwin.

### Principles

- `tmux-sensible` options should be acceptable to **every** tmux user!<br/>
  If any of the options bothers you, please open an issue and it will probably
  be updated (or removed).
- if you think a new option should be added, feel free to open a pull request.
- **no overriding** of user defined settings.<br/>
  Your existing `.tmux.conf` settings are respected and they won't be changed.
  That way you can use `tmux-sensible` if you have a few specific options.

### Goals

- group standard tmux community options in one place
- remove clutter from your `.tmux.conf`
- educate new tmux users about basic options

### Options

```tmux
# Address vim mode switching delay (http://superuser.com/a/252717/65504)
set -s escape-time 0

# Increase scrollback buffer size from 2000 to 50000 lines
set -g history-limit 50000

# Increase tmux messages display duration from 750ms to 4s
set -g display-time 4000

# Refresh 'status-left' and 'status-right' more often, from every 15s to 5s
set -g status-interval 5

# (OS X) Fix pbcopy/pbpaste for old tmux versions (pre 2.6)
set -g default-command "reattach-to-user-namespace -l $SHELL"

# Upgrade $TERM
set -g default-terminal "screen-256color"

# Emacs key bindings in tmux command prompt (prefix + :) are better than
# vi keys, even for vim users
set -g status-keys emacs

# Focus events enabled for terminals that support them
set -g focus-events on

# Super useful when using "grouped sessions" and multi-monitor setup
setw -g aggressive-resize on
```

### Key bindings

```tmux
# Easier and faster switching between next/prev window
bind C-p previous-window
bind C-n next-window
```

Above bindings enhance the default `prefix + p` and `prefix + n` bindings by
allowing you to hold `Ctrl` and repeat `a + p`/`a + n` (if your prefix is
`C-a`), which is a lot quicker.

```tmux
# Source .tmux.conf as suggested in `man tmux`
bind R source-file '~/.tmux.conf'
```

"Adaptable" key bindings that build upon your `prefix` value:

```tmux
# If prefix is 'C-a'
bind C-a send-prefix
bind a last-window
```

If prefix is `C-b`, above keys will be `C-b` and `b`.<br/>
If prefix is `C-z`, above keys will be `C-z` and `z`... you get the idea.

### Installation with [Tmux Plugin Manager](https://github.com/tmux-plugins/tpm) (recommended)

Add plugin to the list of TPM plugins in `.tmux.conf`:

```tmux
set -g @plugin 'tmux-plugins/tmux-sensible'
```

Hit `prefix + I` to fetch the plugin and source it. That's it!

### Manual Installation

Clone the repo:

    $ git clone https://github.com/tmux-plugins/tmux-sensible ~/clone/path

Add this line to the bottom of `.tmux.conf`:

```tmux
run-shell ~/clone/path/sensible.tmux
```

Reload TMUX environment with `$ tmux source-file ~/.tmux.conf`, and that's it.

### Other goodies

You might also find these useful:

- [copycat](https://github.com/tmux-plugins/tmux-copycat)
  improve tmux search and reduce mouse usage
- [pain control](https://github.com/tmux-plugins/tmux-pain-control)
  useful standard bindings for controlling panes
- [resurrect](https://github.com/tmux-plugins/tmux-resurrect)
  persists tmux environment across system restarts

### License

[MIT](LICENSE.md)
