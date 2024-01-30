{ pkgs, home-manager, username, ... }:
{
  home-manager.users.${username}.programs.alacritty = {
    enable = true;
    settings = {

      draw_bold_text_with_bright_colors = true;

      window = {
        decorations = "full";
        decorations_theme_variant = "Dark";
        opacity = 0.8;
      };

      font = {
        size = 12;
        normal.family = "JetBrainsMono NF";
        bold = {
          family = "JetBrainsMono NF";
          style = "Bold";
        };
        italic = {
          family = "JetBrainsMono NF";
          style = "Italic";
        };
        bold_italic = {
          family = "JetBrainsMono NF";
          style = "Bold Italic";
        };
      };

      #shell.program = "${pkgs.zsh}/bin/zsh";

      cursor.style = "Beam";

      colors = {
        primary = {
          background = "0x000b1e";
          foreground = "0x0abdc6";
        };
        normal = {
          black = "0x123e7c";
          red = "0xff0000";
          green = "0xd300c4";
          yellow = "0xf57800";
          blue = "0x123e7c";
          magenta = "0x711c91";
          cyan = "0x0abdc6";
          white = "0xd7d7d5";
        };
        dim = {
          black = "0x1c61c2";
          red = "0xff0000";
          green = "0xd300c4";
          yellow = "0xf57800";
          blue = "0x123e7c";
          magenta = "0x711c91";
          cyan = "0x0abdc6";
          white = "0xd7d7d5";
        };
      };
    };
  };
}
