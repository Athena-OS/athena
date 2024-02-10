{lib, pkgs, shell, username, theme, ...}:
let
  tmuxcolor = {
    akame = "redwine";
    anunna = "redwine";
    cyborg = "gold";
    graphite = "snow";
    hackthebox = "forest";
    samurai = "sky";
    sweet = "violet";
  }."${theme}" or (throw "tmux unsupported theme '${theme}'");
in
{
  home-manager.users.${username} = { pkgs, ... }: {

    programs.tmux = {
      enable = true;

      plugins = with pkgs.tmuxPlugins; [
        net-speed
        power-theme
        {
          plugin = power-theme;
          extraConfig = ''
            set -g @tmux_power_theme '${tmuxcolor}'
            set -g @tmux_power_show_upload_speed true
            set -g @tmux_power_show_download_speed true
            # 'L' for left only, 'R' for right only and 'LR' for both
            set -g @tmux_power_prefix_highlight_pos 'LR'
            set -g @tmux_power_date_format '%F'
            set -g @tmux_power_time_format '%T'
          '';
        }
        prefix-highlight
        sensible
        yank
      ];
      extraConfig = ''
        # start a non-login shell
        set -g default-command "$SHELL"
        
        # Set the base index for windows to 1 instead of 0
        set -g base-index 1
        setw -g pane-base-index 1
        
        # Plugin Customizaion
        
        set -g status-right   "#{playerctl_full}"

        # Set the prefix key to Ctrl+s
        set -g prefix C-s
        unbind C-b
        bind C-s send-prefix
        
        # Set a more informative status bar with key indication
        set -g status-right "#(tmux-power) #[fg=white,bold][#{?client_prefix,Prefix,}#{?vi,Vi,}#{?copy_mode,Copy,}#[default]]"
        
        # re-number windows when one is closed
        set -g renumber-windows on
        
        # Remapping prefix
        unbind-key C-b
        set-option -g prefix C-s # setting prefix from C-b to C-s
        bind-key C-s send-prefix # ensure that we can send Ctrl-s to other apps or the shell
        
        
        # Split panel with the current path
        unbind % 
        unbind '"'
        bind '\' split-window -h -c '#{pane_current_path}'           
        bind '-' split-window -v -c '#{pane_current_path}'
        
        # Use Alt-arrow keys without prefix key to switch panes
        bind -n M-Left select-pane -L
        bind -n M-Right select-pane -R
        bind -n M-Up select-pane -U
        bind -n M-Down select-pane -D
        
        # Resize panes using Shift+arrow keys
        bind -n S-Left resize-pane -L 5
        bind -n S-Right resize-pane -R 5
        bind -n S-Up resize-pane -U 5
        bind -n S-Down resize-pane -D 5
        
        # Shift arrow to switch windows
        # Switch to next window with prefix + n
        bind-key n next-window
        
        # Switch to last window with prefix + l
        bind-key l previous-window
        
        # Pressed key highlight
        set -g status-right '#{prefix_highlight} | %a %Y-%m-%d %H:%M'
        
        # Vim style pane selection
        bind h select-pane -L
        bind j select-pane -D
        bind k select-pane -U
        bind l select-pane -R
        
        # Use Alt-vim keys without prefix key to switch panes
        bind -n M-h select-pane -L
        bind -n M-j select-pane -D
        bind -n M-k select-pane -U
        bind -n M-l select-pane -R
        
        ## Capture current tmux buffer and copy it to system clipboard with prefix + 'Ctrl + c'
        bind C-c run "tmux save-buffer - | xclip -i -sel clipboard"
        
        ## Optional - paste from system clipboard to tmux session with prefix + 'Ctrl + v'
        
        bind C-v run "tmux set-buffer \"$(xclip -o -sel clipboard)\"; tmux paste-buffer"
        
        #copy and paste vim style
        
        ## Enable vi-copy-mode
        setw -g mode-keys vi
        
        # Turn off mouse and use vim keys for navigations
        # turn this on if you want to use touchpad or mouse to scroll through terminal
        set -g mouse on
        #bind -n WheelUpPane if-shell -F -t = "#{mouse_any_flag}" "send-keys -M" "if -Ft= '#{pane_in_mode}' 'send-keys -M' 'copy-mode -e'"
        
        
        ## changing the key to enter copy mode from `[` to `ESC`
        unbind [
        bind Escape copy-mode
        
        ## unbind p and set it to paste from buffer
        #unbind p
        #bind p paste-buffer
        
        ## set keys for visual mode (v) and yank/copy (y)
        bind-key -Tcopy-mode-vi 'v' send -X begin-selection
        bind-key -Tcopy-mode-vi 'y' send -X copy-pipe-and-cancel 'xclip -in -selection clipboard'
        
        ## Copy using XCLIP
        bind -T copy-mode-vi Enter send-keys -X copy-pipe-and-cancel "xclip -i -f -selection primary | xclip -i -selection clipboard"
        
        # Reload the configuration file
        unbind r
        bind r source-file ~/.tmux.conf \; display "Reloaded tmux config!"
        
        set-option -g status-interval 1
        set-option -g automatic-rename on
        set-option -g automatic-rename-format '#{b:pane_current_path}'
        set -g allow-rename on
        
        
        # activity notifications
        setw -g monitor-activity on
        setw -g visual-activity on
        
        # Set the scrollback buffer size to 50,000 lines
        set -g history-limit 50000
        
        # Enable vi mode for easier navigation
        set-window-option -g mode-keys vi
        
        # Improve terminal colors
        set -g default-terminal "screen-256color"
        set -ga terminal-overrides ",xterm-256color:Tc"
        #set -g default-terminal "tmux-256color"
        #set -ga terminal-overrides ",*256col*:Tc"
        
        # Set the window list format
        set -g window-status-format "#I:#W#F"
        
        # Set the active window format
        set -g window-status-current-format "#[fg=white,bold]#I:#W#F"
        
        # increase scrollback buffer to 99999
        set -g history-limit 99999
        
        
        # Set plugin installation path
        set -g @plugin 'tmux-plugins/tpm'
        set -g @plugin 'tmux-plugins/tmux-sensible'
        set -g @plugin_path '~/.tmux/plugins'
        
        ## For tmux-power
        set -g @plugin 'wfxr/tmux-power'
        set -g @plugin 'ofirgall/tmux-window-name'
        set -g @plugin 'jaclu/tmux-mouse-swipe'
        set -g @plugin 'ChanderG/tmux-notify'
        # Plugin: Tmux highlight the keys
        set -g @plugin 'tmux-plugins/tmux-prefix-highlight'
        # Plugin: Tmux internet speed
        set -g @plugin 'wfxr/tmux-net-speed'
        # Plugin: Tmux Copycat
        set -g @plugin 'tmux-plugins/tmux-copycat'
        # Plugin: Tmux Yank
        set -g @plugin 'tmux-plugins/tmux-yank'
        # Initialize TMUX plugin manager (keep this line at the very bottom of tmux.conf)
        run '~/.tmux/plugins/tpm/tpm'
      '';
    };
  };
}
