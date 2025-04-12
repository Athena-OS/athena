# ============================================================
# Authors: Brad Heffernan - Erik Dubois - Cameron Percival
# ============================================================


def gui(self, Gtk, vboxstack1):
    """ArcoLinux mirrorlist"""
    hbox3 = Gtk.Box(orientation=Gtk.Orientation.HORIZONTAL, spacing=10)
    hbox4 = Gtk.Box(orientation=Gtk.Orientation.HORIZONTAL, spacing=10)
    lbl1 = Gtk.Label(xalign=0)
    lbl1.set_text("ArcoLinux Mirrorlist")
    lbl1.set_name("title")
    hseparator = Gtk.Separator(orientation=Gtk.Orientation.HORIZONTAL)
    hbox4.pack_start(hseparator, True, True, 0)
    hbox3.pack_start(lbl1, False, False, 0)

    # ==========================================================
    #                   GLOBALS
    # ==========================================================

    hboxstack4 = Gtk.Box(orientation=Gtk.Orientation.HORIZONTAL, spacing=6)
    hboxstack7 = Gtk.Box(orientation=Gtk.Orientation.HORIZONTAL, spacing=6)
    hboxstack10 = Gtk.Box(orientation=Gtk.Orientation.HORIZONTAL, spacing=6)
    hboxstack11 = Gtk.Box(orientation=Gtk.Orientation.HORIZONTAL, spacing=6)
    hboxstack12 = Gtk.Box(orientation=Gtk.Orientation.HORIZONTAL, spacing=6)
    hboxstack14 = Gtk.Box(orientation=Gtk.Orientation.HORIZONTAL, spacing=6)
    hboxstack15 = Gtk.Box(orientation=Gtk.Orientation.HORIZONTAL, spacing=6)
    hboxstack16 = Gtk.Box(orientation=Gtk.Orientation.HORIZONTAL, spacing=6)
    hboxstack17 = Gtk.Box(orientation=Gtk.Orientation.HORIZONTAL, spacing=6)
    hboxstack18 = Gtk.Box(orientation=Gtk.Orientation.HORIZONTAL, spacing=6)
    hboxstack19 = Gtk.Box(orientation=Gtk.Orientation.HORIZONTAL, spacing=6)

    # ========================================================
    #               ARCO REPOS
    # ========================================================

    frame3 = Gtk.Frame(label="")
    frame3lbl = frame3.get_label_widget()
    frame3lbl.set_markup("<b>ArcoLinux Mirrorlist</b>")

    # seedhost
    self.aseed_button = Gtk.Switch()
    self.aseed_button.connect("notify::active", self.on_mirror_seed_repo_toggle)
    label5 = Gtk.Label(xalign=0)
    label5.set_markup(
        "Enable Seedhost repo - Do not enable it and save us bandwidth and money \
- paid - Netherlands - Always up-to-date"
    )
    seedhost_sync = Gtk.Label(xalign=0)
    hboxstack7.pack_start(label5, False, True, 10)
    hboxstack7.pack_end(self.aseed_button, False, False, 20)
    hboxstack7.pack_start(seedhost_sync, False, True, 10)

    # gitlab
    self.agitlab_button = Gtk.Switch()
    self.agitlab_button.connect("notify::active", self.on_mirror_gitlab_repo_toggle)
    label_gitlab = Gtk.Label(xalign=0)
    label_gitlab.set_markup(
        "Enable Gitlab repo - free bandwidth - United States - Always up-to-date"
    )
    gitlab_sync = Gtk.Label(xalign=0)
    hboxstack16.pack_start(label_gitlab, False, True, 10)
    hboxstack16.pack_end(self.agitlab_button, False, False, 20)
    hboxstack16.pack_start(gitlab_sync, False, True, 10)

    # belnet
    self.abelnet_button = Gtk.Switch()
    self.abelnet_button.connect("notify::active", self.on_mirror_belnet_repo_toggle)
    label6 = Gtk.Label(xalign=0)
    label6.set_markup(
        "Enable Belnet repo - free bandwidth - Belgium - Belnet syncs twice per day"
    )
    belnet_sync = Gtk.Label(xalign=0)
    hboxstack14.pack_start(label6, False, True, 10)
    hboxstack14.pack_end(self.abelnet_button, False, False, 20)
    hboxstack14.pack_start(belnet_sync, False, True, 10)

    # funami
    self.afunami_button = Gtk.Switch()
    self.afunami_button.connect("notify::active", self.on_mirror_funami_repo_toggle)
    labelfunami = Gtk.Label(xalign=0)
    labelfunami.set_markup(
        "Enable Funami repo - free bandwidth - South Korea - Funami syncs once per day"
    )
    funami_sync = Gtk.Label(xalign=0)
    hboxstack18.pack_start(labelfunami, False, True, 10)
    hboxstack18.pack_end(self.afunami_button, False, False, 20)
    hboxstack18.pack_start(funami_sync, False, True, 10)

    # jingk
    self.ajingk_button = Gtk.Switch()
    self.ajingk_button.connect("notify::active", self.on_mirror_jingk_repo_toggle)
    labeljingk = Gtk.Label(xalign=0)
    labeljingk.set_markup(
        "Enable Jingk repo - free bandwidth - Singapore - Jingk syncs twice per day"
    )
    jingk_sync = Gtk.Label(xalign=0)
    hboxstack19.pack_start(labeljingk, False, True, 10)
    hboxstack19.pack_end(self.ajingk_button, False, False, 20)
    hboxstack19.pack_start(jingk_sync, False, True, 10)

    # accum
    self.aaccum_button = Gtk.Switch()
    self.aaccum_button.connect("notify::active", self.on_mirror_accum_repo_toggle)
    labelaaccum = Gtk.Label(xalign=0)
    labelaaccum.set_markup(
        "Enable Accum repo - free bandwidth - Sweden - Accum syncs twice per day"
    )
    accum_sync = Gtk.Label(xalign=0)
    hboxstack17.pack_start(labelaaccum, False, True, 10)
    hboxstack17.pack_end(self.aaccum_button, False, False, 20)
    hboxstack17.pack_start(accum_sync, False, True, 10)

    # github - always there as fallback - no extra large repo on github
    # self.agithub_button = Gtk.Switch()
    # self.agithub_button.connect("notify::active", self.on_mirror_github_repo_toggle)
    # label7 = Gtk.Label(xalign=0)
    # label7.set_markup("Enable Github repo - free bandwidth")
    # hboxstack9.pack_start(label7, False, True, 10)
    # hboxstack9.pack_end(self.agithub_button, False, False, 20)

    # aarnet
    self.aarnet_button = Gtk.Switch()
    self.aarnet_button.connect("notify::active", self.on_mirror_aarnet_repo_toggle)
    label8 = Gtk.Label(xalign=0)
    label8.set_markup(
        "Enable Aarnet repo - free bandwidth - Australia - Aarnet syncs daily"
    )
    aarnet_sync = Gtk.Label(xalign=0)
    # aarnet_sync.set_markup("     Aarnet syncs once per day")
    hboxstack10.pack_start(label8, False, True, 10)
    hboxstack10.pack_end(self.aarnet_button, False, False, 20)
    hboxstack10.pack_start(aarnet_sync, False, True, 10)

    warning = Gtk.Label(xalign=0)
    warning.set_markup(
        "If you disable all these mirrors you will no longer have access \
to the ArcoLinux Xlarge repository."
    )
    warning2 = Gtk.Label(xalign=0)
    warning2.set_markup("Change your /etc/pacman.conf accordingly.")
    hboxstack11.pack_start(warning, False, False, 10)
    hboxstack12.pack_start(warning2, False, False, 10)

    frame4 = Gtk.Frame(label="")
    frame4.set_margin_top(10)
    frame4lbl = frame4.get_label_widget()
    frame4lbl.set_markup("<b>Other mirrorlists</b>")

    pace_label = Gtk.Label(xalign=0)
    pace_label.set_margin_top(0)
    pace_label.set_markup(
        "We use the <b>pace</b> application to set the mirrors of other \
repositories.\nYou save the settings in pace by clicking on preview and save. \
Pace will change the orginal layout."
    )
    launch_pace_btn = Gtk.Button(label="Install/launch pace")
    launch_pace_btn.connect("clicked", self.on_click_launch_pace)

    hboxstack15.pack_start(pace_label, False, False, 10)
    hboxstack15.pack_start(launch_pace_btn, False, False, 10)

    # ========================================================
    #               FOOTER
    # ========================================================

    reset_mirror = Gtk.Button(label="Reset ArcoLinux Mirrorlist")
    reset_mirror.connect("clicked", self.on_click_reset_arcolinux_mirrorlist)
    hboxstack4.pack_end(reset_mirror, False, False, 0)

    # ========================================================
    #               VBOX - FRAME
    # ========================================================

    vbox3 = Gtk.Box(orientation=Gtk.Orientation.VERTICAL, spacing=10)
    # message
    vbox3.pack_start(hboxstack11, False, False, 0)
    vbox3.pack_start(hboxstack12, False, False, 0)
    # gitlab
    vbox3.pack_start(hboxstack16, False, False, 0)
    # sweden
    vbox3.pack_start(hboxstack17, False, False, 0)
    # belnet
    vbox3.pack_start(hboxstack14, False, False, 0)
    # aarnet
    vbox3.pack_start(hboxstack10, False, False, 0)
    # funami
    # vbox3.pack_start(hboxstack18, False, False, 0)
    # jingk
    # vbox3.pack_start(hboxstack19, False, False, 0)
    # seedhost
    vbox3.pack_start(hboxstack7, False, False, 0)

    frame3.add(vbox3)

    vbox4 = Gtk.Box(orientation=Gtk.Orientation.VERTICAL, spacing=10)
    # message
    #vbox4.pack_start(hboxstack15, False, False, 0)
    #frame4.add(vbox4)

    # ========================================================
    #               PACK TO WINDOW
    # ========================================================

    vboxstack1.pack_start(hbox3, False, False, 0)
    vboxstack1.pack_start(hbox4, False, False, 0)
    vboxstack1.pack_start(frame3, False, False, 10)
    #vboxstack1.pack_start(frame4, False, False, 10)
    vboxstack1.pack_end(hboxstack4, False, False, 0)
