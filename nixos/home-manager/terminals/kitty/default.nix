{ pkgs, home-manager, username, theme, ... }:
{
  home-manager.users.${username}.programs.kitty = {
    enable = true;
    /*theme = if theme.module-name == "akame"
            then "Crayon Pony Fish"
            else if theme.module-name == "cyborg"
            then "Gruvbox Dark"
            else if theme.module-name == "everblush"
            then "Atom"
            else if theme.module-name == "hackthebox"
            then "Box"
            else if theme.module-name == "samurai"
            then "Tokyo Night Storm"
            else if theme.module-name == "sweetdark"
            then "Adventure Time"
            else if theme.module-name == "xxe"
            then "Gruvbox Dark"
            else "Atom";*/
    settings = {
      font_family = "JetBrainsMono NF Medium";
      bold_font = "JetBrainsMono NF Bold";
      italic_font = "JetBrainsMono NF Italic";
      bold_italic_font = "JetBrainsMono NF Bold Italic";

      font_size = "12.0";

      adjust_line_height = "92%";

      scrollback_lines = 3000;

      macos_thicken_font = "0.3";

      linux_display_server = "x11";

      confirm_os_window_close = 0;
    };
  };
}