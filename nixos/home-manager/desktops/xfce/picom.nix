{ config, ... }:
{
    services.picom.enable = true;
    services.picom.settings = ''
        #################################
        #             Corners           #
        #################################
        # requires: https://github.com/sdhand/compton
        corner-radius = 3.0;
        rounded-corners-exclude = [
          #"window_type = 'normal'",
          "class_g = 'Xfce4-panel' && window_type = 'dock'"
        ];
        round-borders = 0;
        round-borders-exclude = [
          #"class_g = 'TelegramDesktop'",
        ];

        round-borders-rule = [
          #"3:class_g      = 'XTerm'",
          #"3:class_g      = 'URxvt'",
          #"10:class_g     = 'Alacritty'",
          #"15:class_g     = 'Signal'"
        ];



        #################################
        #             Shadows           #
        #################################

        shadow = true;
        shadow-radius = 15;
        shadow-ignore-shaped = false;
        shadow-opacity = 0.5;
        shadow-offset-x = -15;
        shadow-offset-y = -15;

        shadow-exclude = [
          "!bounding_shaped && class_g = 'Xfce4-screenshooter'",
          "name = 'cpt_frame_window'",
          "class_g = 'Plank' && window_type = 'dock'",
          "class_g ?= 'Notify-osd'",
          "class_g = 'Cairo-clock'",
          "class_g *?= 'slop'",
          "class_g = 'Polybar'",
          "class_g = 'conky'",
          "_GTK_FRAME_EXTENTS@:c",
          "_NET_WM_WINDOW_TYPE:a *= '_KDE_NET_WM_WINDOW_TYPE_OVERRIDE'"
        ];



        #################################
        #   Transparency / Opacity      #
        #################################

        inactive-opacity = 1;
        frame-opacity = 1.0;
        inactive-opacity-override = false;
        active-opacity = 1.0;
        inactive-dim = 0.1

        focus-exclude = [
          "class_g = 'Cairo-clock'",
          "class_g = 'gcolor3'",
          "class_g = 'Bar'",                    # lemonbar
          "class_g = 'slop'"                    # maim
        ];



        #################################
        #            Fading             #
        #################################

        fading = true;
        fade-in-step = .1;
        fade-out-step = .1;



        #################################
        #       General Settings        #
        #################################

        # daemon = false
        # experimental-backends = true;
        # backend = "glx";
        backend = "xrender";

        vsync = true;
        mark-wmwin-focused = true;
        mark-ovredir-focused = true;
        detect-rounded-corners = true;
        detect-client-opacity = true;

        # Specify refresh rate of the screen. If not specified or 0, picom will
        # try detecting this with X RandR extension.
        #
        # refresh-rate = 60
        refresh-rate = 0;

        # Use 'WM_TRANSIENT_FOR' to group windows, and consider windows
        # in the same group focused at the same time.
        #
        # detect-transient = false
        detect-transient = true;

        # Use 'WM_CLIENT_LEADER' to group windows, and consider windows in the same
        # group focused at the same time. 'WM_TRANSIENT_FOR' has higher priority if
        # detect-transient is enabled, too.
        #
        # detect-client-leader = false
        detect-client-leader = true;

        # Disable the use of damage information.
        # This cause the whole screen to be redrawn everytime, instead of the part of the screen
        # has actually changed. Potentially degrades the performance, but might fix some artifacts.
        # The opposing option is use-damage
        #
        # no-use-damage = false
        use-damage = true;

        # Set the log level. Possible values are:
        #  "trace", "debug", "info", "warn", "error"
        # in increasing level of importance. Case doesn't matter.
        # If using the "TRACE" log level, it's better to log into a file
        # using *--log-file*, since it can generate a huge stream of logs.
        #
        # log-level = "debug"
        log-level = "info";

        # Set the log file.
        # If *--log-file* is never specified, logs will be written to stderr.
        # Otherwise, logs will to written to the given file, though some of the early
        # logs might still be written to the stderr.
        # When setting this option from the config file, it is recommended to use an absolute path.
        #
        # log-file = "/path/to/your/log/file"

        # Show all X errors (for debugging)
        # show-all-xerrors = false

        # Write process ID to a file.
        # write-pid-path = "/path/to/your/log/file"

        # Window type settings
        #
        # 'WINDOW_TYPE' is one of the 15 window types defined in EWMH standard:
        #     "unknown", "desktop", "dock", "toolbar", "menu", "utility",
        #     "splash", "dialog", "normal", "dropdown_menu", "popup_menu",
        #     "tooltip", "notification", "combo", and "dnd".
        #
        # Following per window-type options are available: ::
        #
        #   fade, shadow:::
        #     Controls window-type-specific shadow and fade settings.
        #
        #   opacity:::
        #     Controls default opacity of the window type.
        #
        #   focus:::
        #     Controls whether the window of this type is to be always considered focused.
        #     (By default, all window types except "normal" and "dialog" has this on.)
        #
        #   full-shadow:::
        #     Controls whether shadow is drawn under the parts of the window that you
        #     normally won't be able to see. Useful when the window has parts of it
        #     transparent, and you want shadows in those areas.
        #
        #   redir-ignore:::
        #     Controls whether this type of windows should cause screen to become
        #     redirected again after been unredirected. If you have unredir-if-possible
        #     set, and doesn't want certain window to cause unnecessary screen redirection,
        #     you can set this to `true`.
        #
        wintypes:
        {
          normal = { }
          desktop = { }
          tooltip = { shadow = true; opacity = 1; focus = true; full-shadow = false; corner-radius = 1; };
          dock = { }
          dnd = { shadow = false; }
          splash = { }
          popup_menu = { opacity = 1; }
          dropdown_menu = { opacity = 1; }
          utility = { }
        };
    '';
}