# ============================================================
# Authors: Brad Heffernan - Erik Dubois - Cameron Percival
# ============================================================


def gui(self, Gtk, vboxstack1, fn):
    """create a gui"""
    hbox3 = Gtk.Box(orientation=Gtk.Orientation.HORIZONTAL, spacing=10)
    lbl1 = Gtk.Label(xalign=0)
    lbl1.set_text("Pacman Config Editor")
    lbl1.set_name("title")
    hbox3.pack_start(lbl1, False, False, 0)

    hbox4 = Gtk.Box(orientation=Gtk.Orientation.HORIZONTAL, spacing=10)
    hseparator = Gtk.Separator(orientation=Gtk.Orientation.HORIZONTAL)
    hbox4.pack_start(hseparator, True, True, 0)

    hbox5 = Gtk.Box(orientation=Gtk.Orientation.HORIZONTAL, spacing=10)
    # message = Gtk.Label(xalign=0)
    # message.set_text("Refresh the pacman databases when you toggle the switch on/off")
    button_update_repos = Gtk.Button(label="Update pacman databases")
    button_update_repos.connect("clicked", self.on_update_pacman_databases_clicked)
    # hbox5.pack_start(message, True, True, 0)
    hbox5.pack_end(button_update_repos, False, False, 0)
    # ========================================================
    #               FOOTER
    # ========================================================

    self.custom_repo = Gtk.Button(label="Apply custom repo")
    self.custom_repo.connect("clicked", self.custom_repo_clicked)
    reset_pacman_local = Gtk.Button(label="Reset pacman local")
    reset_pacman_local.connect("clicked", self.reset_pacman_local)
    reset_pacman_online = Gtk.Button(label="Reset pacman online")
    reset_pacman_online.connect("clicked", self.reset_pacman_online)
    blank_pacman = Gtk.Button(label="Blank pacman (auto reboot) and select")
    blank_pacman.connect("clicked", self.blank_pacman)
    label_backup = Gtk.Label(xalign=0)
    label_backup.set_text("You can find the backup at /etc/pacman.conf.bak")

    # ==========================================================
    #                   GLOBALS
    # ==========================================================

    hboxstack0 = Gtk.Box(orientation=Gtk.Orientation.HORIZONTAL, spacing=6)
    hboxstack00 = Gtk.Box(orientation=Gtk.Orientation.HORIZONTAL, spacing=6)
    hboxstack1 = Gtk.Box(orientation=Gtk.Orientation.HORIZONTAL, spacing=6)
    hboxstack2 = Gtk.Box(orientation=Gtk.Orientation.HORIZONTAL, spacing=6)
    hboxstack3 = Gtk.Box(orientation=Gtk.Orientation.HORIZONTAL, spacing=6)
    hboxstack4 = Gtk.Box(orientation=Gtk.Orientation.HORIZONTAL, spacing=6)
    hboxstack5 = Gtk.Box(orientation=Gtk.Orientation.HORIZONTAL, spacing=6)
    hboxstack6 = Gtk.Box(orientation=Gtk.Orientation.HORIZONTAL, spacing=6)
    hboxstack7 = Gtk.Box(orientation=Gtk.Orientation.HORIZONTAL, spacing=6)
    hboxstack8 = Gtk.Box(orientation=Gtk.Orientation.HORIZONTAL, spacing=6)
    hboxstack9 = Gtk.Box(orientation=Gtk.Orientation.HORIZONTAL, spacing=6)
    hboxstack10 = Gtk.Box(orientation=Gtk.Orientation.HORIZONTAL, spacing=6)
    hboxstack11 = Gtk.Box(orientation=Gtk.Orientation.HORIZONTAL, spacing=6)
    hboxstack12 = Gtk.Box(orientation=Gtk.Orientation.HORIZONTAL, spacing=6)
    hboxstack13 = Gtk.Box(orientation=Gtk.Orientation.HORIZONTAL, spacing=6)
    hboxstack14 = Gtk.Box(orientation=Gtk.Orientation.HORIZONTAL, spacing=6)
    hboxstack15 = Gtk.Box(orientation=Gtk.Orientation.HORIZONTAL, spacing=6)
    hboxstack16 = Gtk.Box(orientation=Gtk.Orientation.HORIZONTAL, spacing=6)
    hboxstack17 = Gtk.Box(orientation=Gtk.Orientation.HORIZONTAL, spacing=6)
    hboxstack18 = Gtk.Box(orientation=Gtk.Orientation.HORIZONTAL, spacing=6)
    hboxstack19 = Gtk.Box(orientation=Gtk.Orientation.HORIZONTAL, spacing=6)
    hboxstack20 = Gtk.Box(orientation=Gtk.Orientation.HORIZONTAL, spacing=6)
    hboxstack21 = Gtk.Box(orientation=Gtk.Orientation.HORIZONTAL, spacing=6)
    hboxstack22 = Gtk.Box(orientation=Gtk.Orientation.HORIZONTAL, spacing=6)
    hboxstack23 = Gtk.Box(orientation=Gtk.Orientation.HORIZONTAL, spacing=6)
    hboxstack24 = Gtk.Box(orientation=Gtk.Orientation.HORIZONTAL, spacing=6)
    hboxstack25 = Gtk.Box(orientation=Gtk.Orientation.HORIZONTAL, spacing=6)

    # ========================================================
    #               ATHENA REPOS
    # ========================================================

    frame0 = Gtk.Frame(label="")
    frame0lbl = frame0.get_label_widget()
    frame0lbl.set_markup("<b>Athena repository</b>")

    self.athena_button = Gtk.Button(label="Install keys and mirrors")
    self.athena_button.connect("clicked", self.on_athena_clicked)

    self.athena_switch = Gtk.Switch()
    self.athena_switch.connect("notify::active", self.on_athena_toggle)
    label0 = Gtk.Label(xalign=0)
    label0.set_markup("Enable Athena repo")

    # ========================================================
    #               ARCO REPOS
    # ========================================================

    frame3 = Gtk.Frame(label="")
    frame3lbl = frame3.get_label_widget()
    frame3lbl.set_markup("<b>ArcoLinux repositories</b>")

    self.atestrepo_button = Gtk.Switch()
    self.atestrepo_button.connect("notify::active", self.on_pacman_atestrepo_toggle)
    label1 = Gtk.Label(xalign=0)
    label1.set_markup("# Enable ArcoLinux testing repo")

    self.arcolinux_button = Gtk.Button(label="Install keys and mirrors")
    self.arcolinux_button.connect("clicked", self.on_arcolinux_clicked)

    self.arepo_button = Gtk.Switch()
    self.arepo_button.connect("notify::active", self.on_pacman_arepo_toggle)
    label5 = Gtk.Label(xalign=0)
    label5.set_markup("Enable ArcoLinux repo")

    self.a3prepo_button = Gtk.Switch()
    self.a3prepo_button.connect("notify::active", self.on_pacman_a3p_toggle)
    label6 = Gtk.Label(xalign=0)
    label6.set_markup("Enable ArcoLinux 3rd-party repo")

    self.axlrepo_button = Gtk.Switch()
    self.axlrepo_button.connect("notify::active", self.on_pacman_axl_toggle)
    label7 = Gtk.Label(xalign=0)
    label7.set_markup("Enable ArcoLinux x-large repo")

    # ========================================================
    #               ARCHLINUX REPOS
    # ========================================================

    frame = Gtk.Frame(label="")
    framelbl = frame.get_label_widget()
    framelbl.set_markup("<b>Arch Linux repositories</b>")

    self.checkbutton2 = Gtk.Switch()
    self.checkbutton2.connect("notify::active", self.on_pacman_toggle1)
    label3 = Gtk.Label(xalign=0)
    label3.set_markup("# Enable Arch Linux core testing repo")

    self.checkbutton6 = Gtk.Switch()
    self.checkbutton6.connect("notify::active", self.on_pacman_toggle2)
    label13 = Gtk.Label(xalign=0)
    label13.set_markup("Enable Arch Linux core repo")

    self.checkbutton5 = Gtk.Switch()
    self.checkbutton5.connect("notify::active", self.on_pacman_toggle5)
    label12 = Gtk.Label(xalign=0)
    label12.set_markup("#Enable Arch Linux extra-testing repo")

    self.checkbutton7 = Gtk.Switch()
    self.checkbutton7.connect("notify::active", self.on_pacman_toggle3)
    label14 = Gtk.Label(xalign=0)
    label14.set_markup("Enable Arch Linux extra repo")

    self.checkbutton4 = Gtk.Switch()
    self.checkbutton4.connect("notify::active", self.on_pacman_toggle4)
    label10 = Gtk.Label(xalign=0)
    label10.set_markup("# Enable Arch Linux core testing repo")

    self.checkbutton3 = Gtk.Switch()
    self.checkbutton3.connect("notify::active", self.on_pacman_toggle6)
    label4 = Gtk.Label(xalign=0)
    label4.set_markup("# Enable Arch Linux multilib testing repo")

    self.checkbutton8 = Gtk.Switch()
    self.checkbutton8.connect("notify::active", self.on_pacman_toggle7)
    label15 = Gtk.Label(xalign=0)
    label15.set_markup("Enable Arch Linux multilib repo")

    # ========================================================
    #               OTHER REPOS
    # ========================================================

    frame2 = Gtk.Frame(label="")
    frame2lbl = frame2.get_label_widget()
    frame2lbl.set_markup("<b>Other repos</b>")

    self.endeavouros_button = Gtk.Button(label="Install keys and mirrors")
    self.endeavouros_button.connect("clicked", self.on_endeavouros_clicked)
    self.endeavouros_switch = Gtk.Switch()
    self.endeavouros_switch.connect("notify::active", self.on_endeavouros_toggle)
    label16 = Gtk.Label(xalign=0)
    label16.set_markup("Enable Endeavour repo")

    self.nemesis_switch = Gtk.Switch()
    self.nemesis_switch.connect("notify::active", self.on_nemesis_toggle)
    label11 = Gtk.Label(xalign=0)
    label11.set_markup("Enable Nemesis repo")

    # self.xerolinux_button = Gtk.Button(label="Install mirrors")
    # self.xerolinux_button.connect("clicked", self.on_xerolinux_clicked)

    # self.xerolinux_switch = Gtk.Switch()
    # self.xerolinux_switch.connect("notify::active", self.on_xero_toggle)
    # label17 = Gtk.Label(xalign=0)
    # label17.set_markup("Enable Xerolinux repo")

    # self.xerolinux_xl_switch = Gtk.Switch()
    # self.xerolinux_xl_switch.connect("notify::active", self.on_xero_xl_toggle)
    # label18 = Gtk.Label(xalign=0)
    # label18.set_markup("Enable Xerolinux XL repo")

    # self.xerolinux_nv_switch = Gtk.Switch()
    # self.xerolinux_nv_switch.connect("notify::active", self.on_xero_nv_toggle)
    # label19 = Gtk.Label(xalign=0)
    # label19.set_markup("Enable Xerolinux Nvidia repo")

    self.reborn_button = Gtk.Button(label="Install keys and mirrors")
    self.reborn_button.connect("clicked", self.on_reborn_clicked)
    self.reborn_switch = Gtk.Switch()
    self.reborn_switch.connect("notify::active", self.on_reborn_toggle)
    label20 = Gtk.Label(xalign=0)
    label20.set_markup("Enable RebornOS repo")

    self.garuda_button = Gtk.Button(label="Install keys and mirrors")
    self.garuda_button.connect("clicked", self.on_garuda_clicked)
    self.garuda_switch = Gtk.Switch()
    self.garuda_switch.connect("notify::active", self.on_garuda_toggle)
    label21 = Gtk.Label(xalign=0)
    label21.set_markup("Enable Garuda repo")

    self.blackarch_button = Gtk.Button(label="Install keys and mirrors")
    self.blackarch_button.connect("clicked", self.on_blackarch_clicked)
    self.blackarch_switch = Gtk.Switch()
    self.blackarch_switch.connect("notify::active", self.on_blackarch_toggle)
    label22 = Gtk.Label(xalign=0)
    label22.set_markup("Enable BlackArch repo")

    self.chaotics_button = Gtk.Button(label="Install keys and mirrors")
    self.chaotics_button.connect("clicked", self.on_chaotics_clicked)
    self.chaotics_switch = Gtk.Switch()
    self.chaotics_switch.connect("notify::active", self.on_chaotics_toggle)
    label9 = Gtk.Label(xalign=0)
    label9.set_markup("Enable Chaotics repo - set as last repo")

    # ========================================================
    #               CUSTOM REPOS
    # ========================================================

    label2 = Gtk.Label(xalign=0)
    label2.set_markup("<b>Add custom repo to pacman.conf</b>")

    self.textview_custom_repo = Gtk.TextView()
    self.textview_custom_repo.set_wrap_mode(Gtk.WrapMode.WORD)
    self.textview_custom_repo.set_editable(True)
    self.textview_custom_repo.set_cursor_visible(True)
    self.textview_custom_repo.set_border_window_size(Gtk.TextWindowType.LEFT, 1)
    self.textview_custom_repo.set_border_window_size(Gtk.TextWindowType.RIGHT, 1)
    self.textview_custom_repo.set_border_window_size(Gtk.TextWindowType.TOP, 1)
    self.textview_custom_repo.set_border_window_size(Gtk.TextWindowType.BOTTOM, 1)

    scrolled_window = Gtk.ScrolledWindow()
    scrolled_window.set_policy(Gtk.PolicyType.AUTOMATIC, Gtk.PolicyType.AUTOMATIC)
    scrolled_window.add(self.textview_custom_repo)

    # ========================================================
    #               ATHENA REPOS PACKING
    # ========================================================

    if not fn.check_package_installed("athena-keyring"):
        hboxstack0.pack_start(label0, False, True, 10)
        hboxstack0.pack_end(self.athena_button, False, False, 10)

    if fn.check_package_installed("athena-keyring"):
        hboxstack0.pack_start(label0, False, True, 10)
        hboxstack0.pack_end(self.athena_switch, False, False, 10)

    # ========================================================
    #               ARCO REPOS PACKING
    # ========================================================
    if not fn.check_package_installed("arcolinux-keyring"):
        hboxstack7.pack_start(label5, False, True, 10)
        hboxstack7.pack_end(self.arcolinux_button, False, True, 10)

    if fn.check_package_installed("arcolinux-keyring"):
        hboxstack18.pack_start(label1, False, True, 10)
        hboxstack18.pack_end(self.atestrepo_button, False, False, 10)
        hboxstack7.pack_start(label5, False, True, 10)
        hboxstack7.pack_end(self.arepo_button, False, False, 10)
        hboxstack8.pack_start(label6, False, True, 10)
        hboxstack8.pack_end(self.a3prepo_button, False, False, 10)
        hboxstack9.pack_start(label7, False, True, 10)
        hboxstack9.pack_end(self.axlrepo_button, False, False, 10)

    vboxstack2 = Gtk.Box(orientation=Gtk.Orientation.VERTICAL, spacing=0)
    vboxstack2.pack_start(hboxstack1, False, False, 10)

    # ========================================================
    #               TESTING REPOS PACKING
    # ========================================================

    hboxstack14.pack_start(label12, False, True, 10)
    hboxstack14.pack_end(self.checkbutton5, False, False, 10)
    hboxstack5.pack_start(label3, False, True, 10)
    hboxstack5.pack_end(self.checkbutton2, False, False, 10)
    hboxstack15.pack_start(label13, False, True, 10)
    hboxstack15.pack_end(self.checkbutton6, False, False, 10)
    hboxstack16.pack_start(label14, False, True, 10)
    hboxstack16.pack_end(self.checkbutton7, False, False, 10)
    hboxstack12.pack_start(label10, False, True, 10)
    hboxstack12.pack_end(self.checkbutton4, False, False, 10)
    hboxstack6.pack_start(label4, False, True, 10)
    hboxstack6.pack_end(self.checkbutton3, False, False, 10)
    hboxstack17.pack_start(label15, False, True, 10)
    hboxstack17.pack_end(self.checkbutton8, False, False, 10)

    # ========================================================
    #               OTHER REPOS PACKING
    # ========================================================

    if not fn.check_package_installed("endeavouros-keyring"):
        hboxstack19.pack_start(label16, False, True, 10)
        hboxstack19.pack_end(self.endeavouros_button, False, False, 10)

    if fn.check_package_installed("endeavouros-keyring"):
        hboxstack19.pack_start(label16, False, True, 10)
        hboxstack19.pack_end(self.endeavouros_switch, False, False, 10)

    hboxstack13.pack_start(label11, False, True, 10)
    hboxstack13.pack_end(self.nemesis_switch, False, False, 10)

    # if not fn.check_package_installed("xerolinux-mirrorlist"):
    #     hboxstack20.pack_start(label17, False, True, 10)
    #     hboxstack20.pack_end(self.xerolinux_button, False, True, 10)

    # if fn.check_package_installed("xerolinux-mirrorlist"):
    #     hboxstack20.pack_start(label17, False, True, 10)
    #     hboxstack20.pack_end(self.xerolinux_switch, False, False, 10)

    #     hboxstack21.pack_start(label18, False, True, 10)
    #     hboxstack21.pack_end(self.xerolinux_xl_switch, False, False, 10)

    #     hboxstack22.pack_start(label19, False, True, 10)
    #     hboxstack22.pack_end(self.xerolinux_nv_switch, False, False, 10)

    if not fn.check_package_installed("rebornos-keyring"):
        hboxstack23.pack_start(label20, False, True, 10)
        hboxstack23.pack_end(self.reborn_button, False, False, 10)

    if fn.check_package_installed("rebornos-keyring"):
        hboxstack23.pack_start(label20, False, True, 10)
        hboxstack23.pack_end(self.reborn_switch, False, False, 10)

    if not fn.check_package_installed("chaotic-keyring"):
        hboxstack24.pack_start(label21, False, True, 10)
        hboxstack24.pack_end(self.garuda_button, False, False, 10)

    if fn.check_package_installed("chaotic-keyring"):
        hboxstack24.pack_start(label21, False, True, 10)
        hboxstack24.pack_end(self.garuda_switch, False, False, 10)

    if not fn.check_package_installed("blackarch-keyring"):
        hboxstack25.pack_start(label22, False, True, 10)
        hboxstack25.pack_end(self.blackarch_button, False, False, 10)

    if fn.check_package_installed("blackarch-keyring"):
        hboxstack25.pack_start(label22, False, True, 10)
        hboxstack25.pack_end(self.blackarch_switch, False, False, 10)

    if not fn.check_package_installed("chaotic-keyring"):
        hboxstack11.pack_start(label9, False, True, 10)
        hboxstack11.pack_end(self.chaotics_button, False, False, 10)

    if fn.check_package_installed("chaotic-keyring"):
        hboxstack11.pack_start(label9, False, True, 10)
        hboxstack11.pack_end(self.chaotics_switch, False, False, 10)

    vboxstack4 = Gtk.Box(orientation=Gtk.Orientation.VERTICAL, spacing=0)
    vboxstack4.pack_start(hboxstack25, False, False, 10)
    vboxstack4.pack_start(hboxstack13, False, False, 10)
    vboxstack4.pack_start(hboxstack19, False, False, 10)
    # vboxstack4.pack_start(hboxstack20, False, False, 10)
    # if fn.check_package_installed("xerolinux-mirrorlist"):
    #     vboxstack4.pack_start(hboxstack21, False, False, 10)
    #     vboxstack4.pack_start(hboxstack22, False, False, 10)
    vboxstack4.pack_start(hboxstack23, False, False, 10)
    vboxstack4.pack_start(hboxstack24, False, False, 10)
    vboxstack4.pack_start(hboxstack11, False, False, 10)

    # ========================================================
    #               CUSTOM REPOS PACKING
    # ========================================================

    hboxstack2.pack_start(label2, False, True, 10)
    hboxstack3.pack_start(scrolled_window, True, True, 10)

    # ========================================================
    #               BUTTONS PACKING
    # ========================================================

    hboxstack4.pack_end(self.custom_repo, False, False, 0)
    hboxstack4.pack_end(reset_pacman_local, False, False, 0)
    hboxstack4.pack_end(reset_pacman_online, False, False, 0)
    hboxstack4.pack_end(blank_pacman, False, False, 0)
    # hboxstack4.pack_start(label_backup, False, False, 0)

    # ========================================================
    #               TESTING REPOS PACKING TO FRAME
    # ========================================================

    vbox = Gtk.Box(orientation=Gtk.Orientation.VERTICAL, spacing=10)
    vbox.pack_start(hboxstack5, False, False, 0)
    vbox.pack_start(hboxstack15, False, False, 0)
    vbox.pack_start(hboxstack14, False, False, 0)
    vbox.pack_start(hboxstack16, False, False, 0)
    # vbox.pack_start(hboxstack12, False, False, 0)
    vbox.pack_start(hboxstack6, False, False, 0)
    vbox.pack_start(hboxstack17, False, False, 0)
    frame.add(vbox)

    # ========================================================
    #               ATHENA REPOS PACKING TO FRAME
    # ========================================================

    vbox0 = Gtk.Box(orientation=Gtk.Orientation.VERTICAL, spacing=10)
    vbox0.pack_start(hboxstack00, False, False, 0)
    vbox0.pack_start(hboxstack0, False, False, 0)
    frame0.add(vbox0)

    # ========================================================
    #               OTHER REPOS PACKING TO FRAME
    # ========================================================

    vbox2 = Gtk.Box(orientation=Gtk.Orientation.VERTICAL, spacing=10)
    vbox2.pack_start(hboxstack10, False, False, 0)
    vbox2.pack_start(vboxstack4, False, False, 0)
    frame2.add(vbox2)

    # ========================================================
    #               ARCO REPOS PACKING TO FRAME
    # ========================================================

    vbox3 = Gtk.Box(orientation=Gtk.Orientation.VERTICAL, spacing=10)
    vbox3.pack_start(hboxstack18, False, False, 0)
    vbox3.pack_start(hboxstack7, False, False, 0)
    vbox3.pack_start(hboxstack8, False, False, 0)
    vbox3.pack_start(hboxstack9, False, False, 0)

    frame3.add(vbox3)
    # ========================================================
    #               PACK TO WINDOW
    # ========================================================

    # =================PACMAN CONFIG EDITOR========================

    vboxstack1.pack_start(hbox3, False, False, 0)
    vboxstack1.pack_start(hbox4, False, False, 0)
    vboxstack1.pack_start(hbox5, False, False, 0)

    # =================ATHENA REPO========================

    vboxstack1.pack_start(frame0, False, False, 5)

    # =================ARCO REPO========================

    vboxstack1.pack_start(frame3, False, False, 5)

    # =================TESTING REPO========================

    vboxstack1.pack_start(frame, False, False, 0)

    # =================OTHER REPO========================

    vboxstack1.pack_start(frame2, False, False, 0)

    # =================CUSTOM REPO========================

    vboxstack1.pack_start(hboxstack2, False, False, 0)
    vboxstack1.pack_start(hboxstack3, True, True, 0)

    # =================FOOTER========================

    vboxstack1.pack_end(hboxstack4, False, False, 0)
