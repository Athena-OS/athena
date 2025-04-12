# ============================================================
# Authors: Brad Heffernan - Erik Dubois - Cameron Percival
# ============================================================
import functions as fn


def gui(self, Gtk, vboxStack7, termite):
    """create a gui"""
    hbox3 = Gtk.Box(orientation=Gtk.Orientation.HORIZONTAL, spacing=10)
    hbox4 = Gtk.Box(orientation=Gtk.Orientation.HORIZONTAL, spacing=10)
    lbl1 = Gtk.Label(xalign=0)
    lbl1.set_text("Terminals")
    lbl1.set_name("title")
    hseparator = Gtk.Separator(orientation=Gtk.Orientation.HORIZONTAL)
    hbox4.pack_start(hseparator, True, True, 0)
    hbox3.pack_start(lbl1, False, False, 0)

    # label25 = Gtk.Label()
    # label25.set_text("Termite themes :\n     Use the button to install - Select the theme here")
    # hbox25 = Gtk.Box(orientation=Gtk.Orientation.HORIZONTAL, spacing=0)
    # hbox25.pack_start(label25, False, False, 10)

    hbox01 = Gtk.Box(orientation=Gtk.Orientation.HORIZONTAL, spacing=0)
    label01 = Gtk.Label()
    label01.set_markup("<b>URXVT</b>")
    hbox01.pack_start(label01, False, False, 10)

    label23 = Gtk.Label()
    label23.set_text("Urxvt themes - Change the settings of ~/.Xresources manually")
    hbox23 = Gtk.Box(orientation=Gtk.Orientation.HORIZONTAL, spacing=0)
    hbox23.pack_start(label23, False, False, 10)

    hbox02 = Gtk.Box(orientation=Gtk.Orientation.HORIZONTAL, spacing=0)
    hbox02.set_margin_top(30)
    label02 = Gtk.Label()
    label02.set_markup("<b>ALACRITTY</b>")
    hbox02.pack_start(label02, False, False, 10)

    hbox06 = Gtk.Box(orientation=Gtk.Orientation.HORIZONTAL, spacing=0)
    label06 = Gtk.Label()
    label06.set_markup(
        "Choose your Alcritty theme - type 'alacritty-themes' in the terminal"
    )
    hbox06.pack_start(label06, False, False, 10)

    hbox07 = Gtk.Box(orientation=Gtk.Orientation.HORIZONTAL, spacing=0)
    label07 = Gtk.Label()
    if fn.check_package_installed("alacritty") == True:
        label07.set_markup("Alacritty already <b>installed</b>")
    else:
        label07.set_markup("Install Alacritty")
    btn_install_alacritty = Gtk.Button(label="Install Alacritty")
    btn_install_alacritty.connect("clicked", self.on_clicked_install_alacritty)
    hbox07.pack_start(label07, False, False, 10)
    hbox07.pack_end(btn_install_alacritty, False, False, 10)

    hbox03 = Gtk.Box(orientation=Gtk.Orientation.HORIZONTAL, spacing=0)
    label03 = Gtk.Label()
    if fn.check_package_installed("alacritty-themes") == True:
        label03.set_markup("Alacritty-themes is already <b>installed</b>")
    else:
        label03.set_markup("Install Alacritty-themes")
    btn_install_alacritty_themes = Gtk.Button(label="Install Alacritty themes")
    btn_install_alacritty_themes.connect(
        "clicked", self.on_clicked_install_alacritty_themes
    )
    btn_remove_alacritty_themes = Gtk.Button(label="Remove Alacritty themes")
    btn_remove_alacritty_themes.connect(
        "clicked", self.on_clicked_remove_alacritty_themes
    )
    hbox03.pack_start(label03, False, False, 10)
    hbox03.pack_end(btn_remove_alacritty_themes, False, False, 10)
    hbox03.pack_end(btn_install_alacritty_themes, False, False, 10)

    hbox26 = Gtk.Box(orientation=Gtk.Orientation.HORIZONTAL, spacing=0)
    btn_set_att_alacritty_theme = Gtk.Button(label="Set ATT Alacritty-theme")
    btn_set_att_alacritty_theme.connect(
        "clicked", self.on_clicked_set_arcolinux_alacritty_theme_config
    )
    btn_reset_alacritty = Gtk.Button(label="Reset Alacritty theme")
    btn_reset_alacritty.connect("clicked", self.on_clicked_reset_alacritty)
    hbox26.pack_end(btn_set_att_alacritty_theme, False, False, 10)
    hbox26.pack_end(btn_reset_alacritty, False, False, 10)

    hbox04 = Gtk.Box(orientation=Gtk.Orientation.HORIZONTAL, spacing=0)
    hbox04.set_margin_top(0)
    label04 = Gtk.Label()
    label04.set_markup("<b>XFCE4-TERMINAL</b>")
    hbox04.pack_start(label04, False, False, 10)

    hbox27 = Gtk.Box(orientation=Gtk.Orientation.HORIZONTAL, spacing=0)
    label27 = Gtk.Label()
    label27.set_markup(
        "Choose your Xfce4-terminal theme in the preferences,\
colors, presets of Xfce4-terminal"
    )
    hbox27.pack_start(label27, False, False, 10)

    hbox2 = Gtk.Box(orientation=Gtk.Orientation.HORIZONTAL, spacing=0)
    label28 = Gtk.Label()
    if fn.check_package_installed("xfce4-terminal"):
        label28.set_markup("Xfce4-terminal already <b>installed</b>")
    else:
        label28.set_markup("Install Xfce4-terminal")
    btn_install_xfce4_terminal = Gtk.Button(label="Install Xfce4-terminal")
    btn_install_xfce4_terminal.connect(
        "clicked", self.on_clicked_install_xfce4_terminal
    )
    btn_remove_xfce4_terminal = Gtk.Button(label="Remove Xfce4-terminal")
    btn_remove_xfce4_terminal.connect("clicked", self.on_clicked_remove_xfce4_terminal)
    hbox2.pack_start(label28, False, False, 10)
    hbox2.pack_end(btn_remove_xfce4_terminal, False, False, 10)
    hbox2.pack_end(btn_install_xfce4_terminal, False, False, 10)

    hbox28 = Gtk.Box(orientation=Gtk.Orientation.HORIZONTAL, spacing=0)
    label08 = Gtk.Label()
    if fn.check_package_installed("xfce4-terminal-base16-colors-git"):
        label08.set_markup("Xfce4-terminal themes <b>installed</b>")
    else:
        label08.set_markup("Install all Xfce4-terminal themes")
    btn_install_xfce4_terminal_themes = Gtk.Button(
        label="Install Xfce4-terminal themes"
    )
    btn_install_xfce4_terminal_themes.connect(
        "clicked", self.on_clicked_install_xfce4_themes
    )
    btn_remove_xfce4_terminal_themes = Gtk.Button(label="Remove Xfce4-terminal themes")
    btn_remove_xfce4_terminal_themes.connect(
        "clicked", self.on_clicked_remove_xfce4_themes
    )
    hbox28.pack_start(label08, False, False, 10)
    hbox28.pack_end(btn_remove_xfce4_terminal_themes, False, False, 10)
    hbox28.pack_end(btn_install_xfce4_terminal_themes, False, False, 10)

    hbox29 = Gtk.Box(orientation=Gtk.Orientation.HORIZONTAL, spacing=0)
    btn_choose_xfce4_theme = Gtk.Button(label="Reset xfce4-terminal theme")
    btn_choose_xfce4_theme.connect("clicked", self.on_clicked_reset_xfce4_terminal)
    hbox29.pack_end(btn_choose_xfce4_theme, False, False, 10)

    hbox05 = Gtk.Box(orientation=Gtk.Orientation.HORIZONTAL, spacing=0)
    hbox05.set_margin_top(30)
    label05 = Gtk.Label()
    label05.set_markup("<b>TERMITE</b>")
    hbox05.pack_start(label05, False, False, 10)

    hbox24 = Gtk.Box(orientation=Gtk.Orientation.HORIZONTAL, spacing=0)
    label24 = Gtk.Label()
    if fn.check_package_installed("termite"):
        label24.set_markup("Termite is already <b>installed</b>")
    else:
        label24.set_markup("Install Termite")
    btn_install_termite = Gtk.Button(label="Install Termite")
    btn_install_termite.connect("clicked", self.on_clicked_install_termite)
    btn_remove_termite = Gtk.Button(label="Remove Termite")
    btn_remove_termite.connect("clicked", self.on_clicked_remove_termite)
    hbox24.pack_start(label24, False, False, 10)
    hbox24.pack_end(btn_remove_termite, False, False, 10)
    hbox24.pack_end(btn_install_termite, False, False, 10)

    hbox21 = Gtk.Box(orientation=Gtk.Orientation.HORIZONTAL, spacing=0)
    label21 = Gtk.Label()
    if fn.check_package_installed("arcolinux-termite-themes-git"):
        label21.set_markup("Termite themes are already <b>installed</b>")
    else:
        label21.set_markup("Install Termite themes")
    btn_install_termite_themes = Gtk.Button(label="Install Termite themes")
    btn_install_termite_themes.connect(
        "clicked", self.on_clicked_install_termite_themes
    )
    btn_remove_termite_themes = Gtk.Button(label="Remove Termite themes")
    btn_remove_termite_themes.connect("clicked", self.on_clicked_remove_termite_themes)
    hbox21.pack_start(label21, False, False, 10)
    hbox21.pack_end(btn_remove_termite_themes, False, False, 10)
    hbox21.pack_end(btn_install_termite_themes, False, False, 10)

    hbox22 = Gtk.Box(orientation=Gtk.Orientation.HORIZONTAL, spacing=0)
    label22 = Gtk.Label()
    label22.set_markup("Remove the themes manually from ~/.config/termite")
    hbox22.pack_start(label22, False, False, 10)

    hbox19 = Gtk.Box(orientation=Gtk.Orientation.HORIZONTAL, spacing=0)
    label19 = Gtk.Label()
    label19.set_markup("Choose your <b>Termite</b> theme")
    self.term_themes = Gtk.ComboBoxText()
    termite.get_themes(self.term_themes)
    hbox19.pack_start(label19, False, False, 10)
    hbox19.pack_start(self.term_themes, True, True, 10)

    hbox20 = Gtk.Box(orientation=Gtk.Orientation.HORIZONTAL, spacing=10)
    termreset = Gtk.Button(label="Reset Termite")
    termreset.connect("clicked", self.on_term_reset)
    termset = Gtk.Button(label="Apply Termite theme")
    termset.connect("clicked", self.on_term_apply)
    hbox20.pack_end(termset, False, False, 0)
    hbox20.pack_end(termreset, False, False, 0)

    vboxStack7.pack_start(hbox3, False, False, 0)  # lbl1
    vboxStack7.pack_start(hbox4, False, False, 0)  # seperator
    vboxStack7.pack_start(hbox01, False, False, 0)
    vboxStack7.pack_start(hbox23, False, False, 0)
    vboxStack7.pack_start(hbox02, False, False, 0)
    vboxStack7.pack_start(hbox06, False, False, 0)
    vboxStack7.pack_start(hbox07, False, False, 0)
    vboxStack7.pack_start(hbox03, False, False, 0)
    vboxStack7.pack_start(hbox26, False, False, 0)
    vboxStack7.pack_start(hbox04, False, False, 0)
    vboxStack7.pack_start(hbox27, False, False, 0)
    vboxStack7.pack_start(hbox2, False, False, 0)
    vboxStack7.pack_start(hbox28, False, False, 0)
    vboxStack7.pack_start(hbox29, False, False, 0)
    vboxStack7.pack_start(hbox05, False, False, 0)
    vboxStack7.pack_start(hbox24, False, False, 0)
    vboxStack7.pack_start(hbox21, False, False, 0)
    vboxStack7.pack_start(hbox22, False, False, 0)
    vboxStack7.pack_start(hbox19, False, False, 0)
    vboxStack7.pack_start(hbox20, False, False, 0)
