# Tmux Powerline Theme

[![TPM](https://img.shields.io/badge/tpm--support-true-blue)](https://github.com/tmux-plugins/tpm)
[![Awesome](https://img.shields.io/badge/Awesome-tmux-d07cd0?logo=data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAABVklEQVRIS+3VvWpVURDF8d9CRAJapBAfwWCt+FEJthIUUcEm2NgIYiOxsrCwULCwktjYKSgYLfQF1JjCNvoMNhYRCwOO7HAiVw055yoBizvN3nBmrf8+M7PZsc2RbfY3AfRWeNMSVdUlHEzS1t6oqvt4n+TB78l/AKpqHrdwLcndXndU1WXcw50k10c1PwFV1fa3cQVzSR4PMd/IqaoLeIj2N1eTfG/f1gFVtQMLOI+zSV6NYz4COYFneIGLSdZSVbvwCMdxMsnbvzEfgRzCSyzjXAO8xlHcxMq/mI9oD+AGlhqgxjD93OVOD9TUuICdXd++/VeAVewecKKv2NPlfcHUAM1qK9FTnBmQvJjkdDfWzzE7QPOkAfZiEce2ECzhVJJPHWAfGuTwFpo365pO0NYjmEFr5Eas4SPeJfll2rqb38Z7/yaaD+0eNM3kPejt86REvSX6AamgdXkgoxLxAAAAAElFTkSuQmCC)](https://github.com/rothgar/awesome-tmux)
[![License](https://img.shields.io/badge/License-MIT-brightgreen.svg)](https://wfxr.mit-license.org/2017)

Yet another powerline theme for tmux.

### 📥 Installation

**Install manually**

Clone the repo somewhere and source it in `.tmux.conf`:

```tmux
run-shell "/path/to/tmux-power.tmux"
```

*NOTE: Options should be set before sourcing.*

**Install using [TPM](https://github.com/tmux-plugins/tpm)**

```tmux
set -g @plugin 'wfxr/tmux-power'
```

### 🎨 Themes

**Gold**(default): `set -g @tmux_power_theme 'gold'`
![screenshot](https://raw.githubusercontent.com/wfxr/i/master/tmux-power-gold.png)

**Redwine**: `set -g @tmux_power_theme 'redwine'`
![screenshot](https://raw.githubusercontent.com/wfxr/i/master/tmux-power-redwine.png)

**Moon**: `set -g @tmux_power_theme 'moon'`
![screenshot](https://raw.githubusercontent.com/wfxr/i/master/tmux-power-moon.png)

**Forest**: `set -g @tmux_power_theme 'forest'`
![screenshot](https://raw.githubusercontent.com/wfxr/i/master/tmux-power-forest.png)

**Violet**: `set -g @tmux_power_theme 'violet'`
![screenshot](https://raw.githubusercontent.com/wfxr/i/master/tmux-power-violet.png)

**Snow**: `set -g @tmux_power_theme 'snow'`
![screenshot](https://raw.githubusercontent.com/wfxr/i/master/tmux-power-snow.png)

**Coral**: `set -g @tmux_power_theme 'coral'`
![screenshot](https://raw.githubusercontent.com/wfxr/i/master/tmux-power-coral.png)

**Sky**: `set -g @tmux_power_theme 'sky'`
![screenshot](https://raw.githubusercontent.com/wfxr/i/master/tmux-power-sky.png)

**Default**: `set -g @tmux_power_theme 'default'`
Set this theme if you want to honor the terminal colorscheme. To be used with
something like [pywal](https://github.com/dylanaraps/pywal) for instance.

### ⚙  Customizing

You can define your favourite main color if you don't like any of above.

```tmux
set -g @tmux_power_theme '#483D8B' # dark slate blue
```

You can change the date and time formats using strftime:

```tmux
set -g @tmux_power_date_format '%F'
set -g @tmux_power_time_format '%T'
```

You can also customize the icons:

```tmux
set -g @tmux_power_date_icon ' ' # set it to a blank will disable the icon
set -g @tmux_power_time_icon '🕘' # emoji can be used if your terminal supports
set -g @tmux_power_user_icon 'U'
set -g @tmux_power_session_icon 'S'
set -g @tmux_power_upload_speed_icon '↑'
set -g @tmux_power_download_speed_icon '↓'
set -g @tmux_power_left_arrow_icon '<'
set -g @tmux_power_right_arrow_icon '>'
```
*The default icons use glyphs from [nerd-fonts](https://github.com/ryanoasis/nerd-fonts).*

### 📦 Plugin support

**[tmux-net-speed](https://github.com/wfxr/tmux-net-speed)**

```tmux
set -g @tmux_power_show_upload_speed true
set -g @tmux_power_show_download_speed true
```

**[tmux-prefix-highlight](https://github.com/tmux-plugins/tmux-prefix-highlight)**

```tmux
# 'L' for left only, 'R' for right only and 'LR' for both
set -g @tmux_power_prefix_highlight_pos 'LR'
```

**[tmux-web-reachable](https://github.com/wfxr/tmux-web-reachable)**

```tmux
set -g @tmux_power_show_web_reachable true
```

### 🔗 Other plugins

You might also find these useful:

- [tmux-fzf-url](https://github.com/wfxr/tmux-fzf-url)
- [tmux-net-speed](https://github.com/wfxr/tmux-net-speed)
- [tmux-web-reachable](https://github.com/wfxr/tmux-web-reachable)

### 📃 License

[MIT](https://wfxr.mit-license.org/2017) (c) Wenxuan Zhang
