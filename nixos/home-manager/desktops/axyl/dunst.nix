{
  global = {
    font = "JetBrainsMono Nerd Font 10";
    markup = "full";
    format = "%s\n%b";
    sort = "no";
    indicate_hidden = "yes";
    alignment = "left";
    show_age_threshold = 60;
    word_wrap = "yes";
    ignore_newline = "no";
    stack_duplicates = false;
    hide_duplicate_count = "yes";
    geometry = "280x50-10+44";
    shrink = "no";
    idle_threshold = 120;
    monitor = 0;
    follow = "mouse";
    sticky_history = "yes";
    history_length = 20;
    show_indicators = "no";
    line_height = 4;
    separator_height = 4;
    padding = 20;
    horizontal_padding = 20;
    separator_color = "auto";
    startup_notification = true;
    browser = "x-www-browser -new-tab";
    always_run_script = true;
    title = "Dunst";
    class = "Dunst";
    icon_position = "left";
    max_icon_size = 48;
    frame_width = 2;
  };

  shortcuts = {
    close = "ctrl+shift+space";
    close_all = "ctrl+shift+space";
    history = "ctrl+grave";
    context = "ctrl+shift+period";
  };

  urgency_low = {
    frame_color = "#7aa2f7";
    background = "#1a1b26";
    foreground = "#7aa2f7";
    timeout = 5;
  };

  urgency_normal = {
    frame_color = "#444b6a";
    foreground = "#a9b1d6";
  };

  urgency_critical = {
    frame_color = "#f7768e";
    foreground = "#f7768e";
  };
}