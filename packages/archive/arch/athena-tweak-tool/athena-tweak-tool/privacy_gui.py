# ============================================================
# Authors: Brad Heffernan - Erik Dubois - Cameron Percival
# ============================================================


def gui(self, Gtk, vboxstack3, fn):
    """create a gui"""
    hbox3 = Gtk.Box(orientation=Gtk.Orientation.HORIZONTAL, spacing=10)
    lbl1 = Gtk.Label(xalign=0)
    lbl1.set_text("Privacy/Security")
    lbl1.set_name("title")
    hbox3.pack_start(lbl1, False, False, 0)

    hbox4 = Gtk.Box(orientation=Gtk.Orientation.HORIZONTAL, spacing=10)
    hseparator = Gtk.Separator(orientation=Gtk.Orientation.HORIZONTAL)
    hbox4.pack_start(hseparator, True, True, 0)

    # ==========================================================
    #                       HBLOCK
    # ==========================================================

    hbox7 = Gtk.Box(orientation=Gtk.Orientation.HORIZONTAL, spacing=10)
    hbox8 = Gtk.Box(orientation=Gtk.Orientation.HORIZONTAL, spacing=10)
    hbox11 = Gtk.Box(orientation=Gtk.Orientation.HORIZONTAL, spacing=10)

    label_top = Gtk.Label()
    label_top.set_markup(
        "Improve your <b>security</b> and <b>privacy</b> \
by blocking ads, tracking and malware domains"
    )
    hbox8.pack_start(label_top, False, False, 10)

    instructions = Gtk.Label()
    instructions.set_markup(
        "To update your hblock hosts file, please disable and enable hblock"
    )
    hbox11.pack_start(instructions, False, False, 10)

    label_hblock = Gtk.Label()
    label_hblock.set_text(
        "Enable/install hblock - Your orignal /etc/hosts file can be found in /etc/hosts.bak"
    )

    self.label7 = Gtk.Label(xalign=0)
    self.progress = Gtk.ProgressBar()
    self.progress.set_pulse_step(0.2)

    state = fn.hblock_get_state(self)

    self.hbswich = Gtk.Switch()
    self.hbswich.connect("notify::active", self.set_hblock)
    self.hbswich.set_active(state)

    hbox7.pack_start(label_hblock, False, False, 10)
    hbox7.pack_end(self.hbswich, False, False, 10)

    # ==========================================================
    #                       FIREFOX
    # ==========================================================

    hbox9 = Gtk.Box(orientation=Gtk.Orientation.HORIZONTAL, spacing=10)
    hbox10 = Gtk.Box(orientation=Gtk.Orientation.HORIZONTAL, spacing=10)

    label_firefox = Gtk.Label()
    label_firefox.set_markup("Install extra <b>Firefox</b> extensions")
    hbox9.pack_start(label_firefox, False, False, 10)

    label_firefox_ublock = Gtk.Label()
    label_firefox_ublock.set_markup("Install/remove uBlock Origin")
    label_firefox_ublock.set_margin_left(30)

    state = fn.ublock_get_state(self)

    self.firefox_ublock_switch = Gtk.Switch()
    self.firefox_ublock_switch.connect("notify::active", self.set_ublock_firefox)
    self.firefox_ublock_switch.set_active(state)

    # if state:
    #         self.label7.set_text("uBlock Origin active")
    # else:
    #     self.label7.set_text("UBlock Origin inactive")

    hbox10.pack_start(label_firefox_ublock, False, False, 10)
    hbox10.pack_end(self.firefox_ublock_switch, False, False, 10)

    # ==========================================================
    #                      VSTACK
    # ==========================================================

    vboxstack3.pack_start(hbox3, False, False, 0)
    vboxstack3.pack_start(hbox4, False, False, 0)
    vboxstack3.pack_start(hbox8, False, False, 0)
    vboxstack3.pack_start(hbox11, False, False, 0)
    vboxstack3.pack_start(hbox7, False, False, 0)
    vboxstack3.pack_start(hbox9, False, False, 0)
    vboxstack3.pack_start(hbox10, False, False, 0)

    vboxstack3.pack_end(self.progress, False, False, 0)
    vboxstack3.pack_end(self.label7, False, False, 0)
