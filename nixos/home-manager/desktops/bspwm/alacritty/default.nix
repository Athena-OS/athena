{

  window = {
    dimensions = {
      columns = 140;
      lines = 38;
    };
    padding = {
      x = 10;
      y = 10;
    };
    decorations = "none";
    startup_mode = "Windowed";
    dynamic_title = true;
    ## Background opacity
    opacity = 0.67;
    ## scrolling
    history = 10000;
    multiplier = 3;
  };

  cursor = {
    style = {
      shape = "Block";
      blinking = "On";
    };
    unfocused_hollow = false;
  };

  ## Live config reload
  live_config_reload = true;

  draw_bold_text_with_bright_colors = true;

  #### Colors ####
  colors = {
    # Default colors
    primary = {
      background = "#000000";
      foreground = "#c5c8c6";
    };
    cursor = {
      text = "#1d1f21";
      cursor = "#c5c8c6";
    };
    # Normal colors
    normal = {
      black = "#1d1f21";
      red = "#cc6666";
      green = "#b5bd68";
      yellow = "#f0c674";
      blue = "#81a2be";
      magenta = "#b294bb";
      cyan = "#8abeb7";
      white = "#c5c8c6";
    };
    # Bright colors
    bright = {
      black = "#969896";
      red = "#de935f";
      green = "#282a2e";
      yellow = "#373b41";
      blue = "#b4b7b4";
      magenta = "#e0e0e0";
      cyan = "#a3685a";
      white = "#ffffff";
    };
  };

  #### Fonts ####
  font = {
    size = 12;
    normal = {
      family = "FiraCode NF";
      style = "Medium";
    };
    bold = {
      family = "FiraCode NF";
      style = "Bold";
    };
    italic = {
      family = "FiraCode NF";
      style = "Italic";
    };
    bold_italic = {
      family = "FiraCode NF";
      style = "Bold Italic";
    };
  };
}