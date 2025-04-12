# ============================================================
# Authors: Brad Heffernan - Erik Dubois - Cameron Percival
# ============================================================


def gui(self, Gtk, vboxstack9, fn):
    """create a gui"""
    hbox3 = Gtk.Box(orientation=Gtk.Orientation.HORIZONTAL, spacing=10)
    hbox4 = Gtk.Box(orientation=Gtk.Orientation.HORIZONTAL, spacing=10)
    lbl1 = Gtk.Label(xalign=0)
    lbl1.set_markup("Utilities Enabler")
    lbl1.set_name("title")
    hseparator = Gtk.Separator(orientation=Gtk.Orientation.HORIZONTAL)
    hbox4.pack_start(hseparator, True, True, 0)
    hbox3.pack_start(lbl1, False, False, 0)
    vbox14 = Gtk.Box(orientation=Gtk.Orientation.VERTICAL, spacing=10)

    lbl2 = Gtk.Label(xalign=0)
    lbl3 = Gtk.Label(xalign=0)
    lbl4 = Gtk.Label(xalign=0)
    lbl5 = Gtk.Label(xalign=0)
    lbl6 = Gtk.Label(xalign=0)

    if fn.get_shell() == "bash" or fn.get_shell() == "zsh" or fn.get_shell() == "fish":
        lbl2.set_markup(
            "  Once you have selected and deselected the utilities you want, \
please open a terminal to see how it looks"
        )
        lbl3.set_markup(
            "  We recommend using not more than two utilities at the same time, \
due to screen real estate"
        )
        lbl5.set_markup(
            "  Without the ArcoLinux repositories only fastfetch, neofetch and screenfetch \
are available"
        )
        lbl6.set_markup(
            "  At the end of .bashrc, .zshrc or fish.config we will add the utility"
        )

    else:
        lbl2.set_markup(
            "  Arcolinux Tweak Tool was unable to detect your Shell, or was unable to obtain \
your shells config file."
        )
        lbl3.set_markup(
            "  Arcolinux Tweak Tool only supports BASH, ZSH and FISH currently. If you are \
using something else, you are unable to use these tools from ATT."
        )

    # Every util needs to have a util switch, and a lolcat switch.
    utils = [
        "fastfetch",
		"neofetch",
        "screenfetch",
        "alsi",
        "paleofetch",
        "fetch",
        "hfetch",
        "sfetch",
        "ufetch",
        "ufetch-arco",
        "pfetch",
        "sysinfo",
        "sysinfo-retro",
        "cpufetch",
        "hyfetch",
    ]

    util_switches = []
    self.fastfetch_util = Gtk.Switch()
    self.neofetch_util = Gtk.Switch()
    self.screenfetch_util = Gtk.Switch()
    self.ufetch_util = Gtk.Switch()
    self.ufetch_arco_util = Gtk.Switch()
    self.pfetch_util = Gtk.Switch()
    self.fetch_util = Gtk.Switch()
    self.paleofetch_util = Gtk.Switch()
    self.alsi_util = Gtk.Switch()
    self.hfetch_util = Gtk.Switch()
    self.sfetch_util = Gtk.Switch()
    self.sysinfo_util = Gtk.Switch()
    self.sysinfo_retro_util = Gtk.Switch()
    self.cpufetch_util = Gtk.Switch()
    self.hyfetch_util = Gtk.Switch()
    util_switches.append(self.fastfetch_util)
    util_switches.append(self.neofetch_util)
    util_switches.append(self.screenfetch_util)
    util_switches.append(self.alsi_util)
    util_switches.append(self.paleofetch_util)
    util_switches.append(self.fetch_util)
    util_switches.append(self.hfetch_util)
    util_switches.append(self.sfetch_util)
    util_switches.append(self.ufetch_util)
    util_switches.append(self.ufetch_arco_util)
    util_switches.append(self.pfetch_util)
    util_switches.append(self.sysinfo_util)
    util_switches.append(self.sysinfo_retro_util)
    util_switches.append(self.cpufetch_util)
    util_switches.append(self.hyfetch_util)

    lolcat_switches = []
    self.fastfetch_lolcat = Gtk.Switch()
    self.neofetch_lolcat = Gtk.Switch()
    self.screenfetch_lolcat = Gtk.Switch()
    self.ufetch_lolcat = Gtk.Switch()
    self.ufetch_arco_lolcat = Gtk.Switch()
    self.pfetch_lolcat = Gtk.Switch()
    self.paleofetch_lolcat = Gtk.Switch()
    self.alsi_lolcat = Gtk.Switch()
    self.hfetch_lolcat = Gtk.Switch()
    self.fetch_lolcat = Gtk.Switch()
    self.sfetch_lolcat = Gtk.Switch()
    self.sysinfo_lolcat = Gtk.Switch()
    self.sysinfo_retro_lolcat = Gtk.Switch()
    self.cpufetch_lolcat = Gtk.Switch()
    self.hyfetch_lolcat = Gtk.Switch()
    lolcat_switches.append(self.fastfetch_lolcat)
    lolcat_switches.append(self.neofetch_lolcat)
    lolcat_switches.append(self.screenfetch_lolcat)
    lolcat_switches.append(self.alsi_lolcat)
    lolcat_switches.append(self.paleofetch_lolcat)
    lolcat_switches.append(self.fetch_lolcat)
    lolcat_switches.append(self.hfetch_lolcat)
    lolcat_switches.append(self.sfetch_lolcat)
    lolcat_switches.append(self.ufetch_lolcat)
    lolcat_switches.append(self.ufetch_arco_lolcat)
    lolcat_switches.append(self.pfetch_lolcat)
    lolcat_switches.append(self.sysinfo_lolcat)
    lolcat_switches.append(self.sysinfo_retro_lolcat)
    lolcat_switches.append(self.cpufetch_lolcat)
    lolcat_switches.append(self.hyfetch_lolcat)

    # This is used for the seperators in the grid. It's probably not the best way
    # but it keeps control with us.
    sep_text = "      "

    # Colorscripts is unique in this list, as it does NOT need a lolcat toggle,
    # so handled seperately.
    self.colorscript = Gtk.Switch()
    self.colorscript.connect("notify::active", self.util_toggle, "colorscript random")
    if fn.get_shell() == "bash" or fn.get_shell() == "zsh" or fn.get_shell() == "fish":
        self.colorscript.set_sensitive(True)
    else:
        self.colorscript.set_sensitive(False)
    cs_label = Gtk.Label(xalign=0)
    cs_label.set_markup("Colorscripts")
    # seperators used for colorscript
    cs_sep0 = Gtk.Label(xalign=0)
    cs_sep1 = Gtk.Label(xalign=0)

    # Utilising a grid to keep things neat
    grid = Gtk.Grid()

    # Now we take all the prepared containers and switches, and create a page out of them.
    # TODO:enumerate
    for i in range(len(utils)):
        grid.insert_row(i)
        # These are the seperators using the spacing set above
        # need to be individually created or GTK errors.
        sep0 = Gtk.Label(xalign=0)
        sep0.set_markup(sep_text)
        sep1 = Gtk.Label(xalign=0)
        sep1.set_markup(sep_text)
        sep2 = Gtk.Label(xalign=0)
        sep2.set_markup(sep_text)
        sep3 = Gtk.Label(xalign=0)
        sep3.set_markup(sep_text)
        sep4 = Gtk.Label(xalign=0)
        sep4.set_markup(sep_text)
        lolcat_label = Gtk.Label(xalign=0)
        lolcat_label.set_markup("Use lolcat")
        util_label = Gtk.Label(xalign=0)
        util_label.set_markup(utils[i].capitalize())
        util_switches[i].connect("notify::active", self.util_toggle, utils[i])
        lolcat_switches[i].connect("notify::active", self.lolcat_toggle, utils[i])
        # If we can't find the current shell config or if we don't know what
        # the current shell is; disable all buttons.
        if (
            fn.get_shell() == "bash"
            or fn.get_shell() == "zsh"
            or fn.get_shell() == "fish"
        ):
            util_switches[i].set_sensitive(True)
            lolcat_switches[i].set_sensitive(True)
        else:
            util_switches[i].set_sensitive(False)
            lolcat_switches[i].set_sensitive(False)
        grid.attach(sep0, 0, i, 2, 1)
        grid.attach_next_to(util_label, sep0, Gtk.PositionType.RIGHT, 1, 1)
        grid.attach_next_to(sep1, util_label, Gtk.PositionType.RIGHT, 1, 1)
        grid.attach_next_to(util_switches[i], sep1, Gtk.PositionType.RIGHT, 1, 1)
        grid.attach_next_to(sep2, util_switches[i], Gtk.PositionType.RIGHT, 1, 1)
        grid.attach_next_to(lolcat_label, sep2, Gtk.PositionType.RIGHT, 1, 1)
        grid.attach_next_to(sep3, lolcat_label, Gtk.PositionType.RIGHT, 1, 1)
        grid.attach_next_to(lolcat_switches[i], sep3, Gtk.PositionType.RIGHT, 1, 1)
        grid.attach_next_to(sep4, lolcat_switches[i], Gtk.PositionType.RIGHT, 1, 1)
        # We add colorscripts at the end.
        if i == len(utils) - 1:
            grid.insert_row(i + 1)
            grid.attach(cs_sep0, 0, i + 1, 2, 1)
            grid.attach_next_to(cs_label, cs_sep0, Gtk.PositionType.RIGHT, 1, 1)
            grid.attach_next_to(cs_sep1, cs_label, Gtk.PositionType.RIGHT, 1, 1)
            grid.attach_next_to(self.colorscript, cs_sep1, Gtk.PositionType.RIGHT, 1, 1)

    hbox5 = Gtk.Box(orientation=Gtk.Orientation.HORIZONTAL, spacing=10)
    lbl_arco_repo = Gtk.Label(xalign=0)
    lbl_arco_repo.set_markup(
        "  For some of these packages you will need to add the <b>ArcoLinux \
repositories</b>"
    )
    hbox5.pack_start(lbl_arco_repo, True, True, 0)

    vbox14.pack_start(lbl2, False, False, 0)
    vbox14.pack_start(lbl3, False, False, 0)
    # vbox14.pack_start(lbl4, False, False, 0)
    vbox14.pack_start(lbl5, False, False, 0)
    vbox14.pack_start(lbl6, False, False, 0)
    vbox14.pack_start(grid, False, False, 0)
    vbox14.pack_start(hbox5, False, False, 0)

    vboxstack9.pack_start(hbox3, False, False, 0)
    vboxstack9.pack_start(hbox4, False, False, 0)
    # vboxstack9.pack_start(hbox5, False, False, 0)
    vboxstack9.pack_start(vbox14, False, False, 0)
