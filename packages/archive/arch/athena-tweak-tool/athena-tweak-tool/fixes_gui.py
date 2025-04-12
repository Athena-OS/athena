# ============================================================
# Authors: Brad Heffernan - Erik Dubois - Cameron Percival
# ============================================================


def gui(self, Gtk, vboxstack19, fn, fixes):
    """create a gui"""
    hbox1 = Gtk.Box(orientation=Gtk.Orientation.HORIZONTAL, spacing=10)
    hbox1_label = Gtk.Label(xalign=0)
    hbox1_label.set_text("Fixes")
    hbox1_label.set_name("title")
    hbox1.pack_start(hbox1_label, False, False, 10)

    hbox0 = Gtk.Box(orientation=Gtk.Orientation.HORIZONTAL, spacing=10)
    hseparator = Gtk.Separator(orientation=Gtk.Orientation.HORIZONTAL)
    hbox0.pack_start(hseparator, True, True, 0)

    hbox5 = Gtk.Box(orientation=Gtk.Orientation.HORIZONTAL, spacing=10)
    hbox5_label = Gtk.Label(xalign=0)
    hbox5_label.set_text("Re-install archlinux-keyring")
    btn_install_arch_keyring = Gtk.Button(label="Install keyring (local)")
    btn_install_arch_keyring.connect("clicked", self.on_click_install_arch_keyring)
    btn_install_arch_keyring_online = Gtk.Button(label="Install keyring (online)")
    btn_install_arch_keyring_online.connect(
        "clicked", self.on_click_install_arch_keyring_online
    )
    hbox5.pack_start(hbox5_label, False, False, 10)
    hbox5.pack_end(btn_install_arch_keyring_online, False, False, 10)
    hbox5.pack_end(btn_install_arch_keyring, False, False, 10)

    hbox2 = Gtk.Box(orientation=Gtk.Orientation.HORIZONTAL, spacing=10)
    hbox2_label = Gtk.Label(xalign=0)
    hbox2_label.set_text("Reset and reload pacman keys")
    btn_apply_pacman_key_fix = Gtk.Button(label="Fix keys")
    btn_apply_pacman_key_fix.connect("clicked", self.on_click_fix_pacman_keys)
    hbox2.pack_start(hbox2_label, False, False, 10)
    hbox2.pack_end(btn_apply_pacman_key_fix, False, False, 10)

    hbox3 = Gtk.Box(orientation=Gtk.Orientation.HORIZONTAL, spacing=10)
    hbox3_label = Gtk.Label(xalign=0)
    hbox3_label.set_text("Set the mainstream servers from Arch Linux")
    btn_apply_osbeck = Gtk.Button(label="Set mainstream")
    btn_apply_osbeck.connect("clicked", self.on_click_fix_mainstream)
    button_reset_mirrorlist = Gtk.Button(label="Reset mirrorlist")
    button_reset_mirrorlist.connect("clicked", self.on_click_reset_mirrorlist)
    hbox3.pack_start(hbox3_label, False, False, 10)
    hbox3.pack_end(button_reset_mirrorlist, False, False, 10)
    hbox3.pack_end(btn_apply_osbeck, False, False, 10)

    # if all installed
    hbox4 = Gtk.Box(orientation=Gtk.Orientation.HORIZONTAL, spacing=10)
    hbox4_label = Gtk.Label(xalign=0)
    hbox4_label.set_text("Get the best Arch Linux servers (takes a while)")
    self.btn_run_reflector = Gtk.Button(label="Run reflector")
    self.btn_run_reflector.connect("clicked", self.on_click_get_arch_mirrors)
    self.btn_run_rate_mirrors = Gtk.Button(label="Run rate-mirrors")
    self.btn_run_rate_mirrors.connect("clicked", self.on_click_get_arch_mirrors2)
    hbox4.pack_start(hbox4_label, False, False, 10)
    hbox4.pack_end(self.btn_run_reflector, False, False, 10)
    hbox4.pack_end(self.btn_run_rate_mirrors, False, False, 10)

    # if not installed
    hbox40 = Gtk.Box(orientation=Gtk.Orientation.HORIZONTAL, spacing=10)
    hbox40_label = Gtk.Label(xalign=0)
    hbox40_label.set_text("Install apps to find the best Arch Linux servers")
    btn_install_mirrors = Gtk.Button(label="Install reflector")
    btn_install_mirrors.connect("clicked", self.on_click_install_arch_mirrors)
    btn_install_rate_mirrors = Gtk.Button(label="Install rate mirrors")
    btn_install_rate_mirrors.connect("clicked", self.on_click_install_arch_mirrors2)
    hbox40.pack_start(hbox40_label, False, False, 10)
    hbox40.pack_end(btn_install_mirrors, False, False, 10)
    hbox40.pack_end(btn_install_rate_mirrors, False, False, 10)

    if not fn.path.exists("/usr/bin/reflector"):
        self.btn_run_reflector.set_sensitive(False)
    if not fn.path.exists("/usr/bin/rate-mirrors"):
        self.btn_run_rate_mirrors.set_sensitive(False)

    # hbox5 = Gtk.Box(orientation=Gtk.Orientation.HORIZONTAL, spacing=10)
    # hbox5_label = Gtk.Label(xalign=0)
    # hbox5_label.set_text("Get the original ArcoLinux /etc/sddm.conf\
    # and /etc/sddm.conf.d/kde_settings.conf")
    # button_Apply_Mirrors = Gtk.Button(label="Reset sddm.conf (online source)")
    # button_Apply_Mirrors.connect ("clicked", self.on_click_fix_sddm_conf)
    # hbox5.pack_start(hbox5_label, False, False, 10)
    # hbox5.pack_end(button_Apply_Mirrors, False, False, 10)

    hbox6 = Gtk.Box(orientation=Gtk.Orientation.HORIZONTAL, spacing=10)
    hbox6_label = Gtk.Label(xalign=0)
    hbox6_label.set_text("Get the original ArcoLinux /etc/pacman.conf")
    btn_reset_pacman = Gtk.Button(label="Reset pacman.conf")
    btn_reset_pacman.connect("clicked", self.on_click_fix_pacman_conf)
    hbox6.pack_start(hbox6_label, False, False, 10)
    hbox6.pack_end(btn_reset_pacman, False, False, 10)

    hbox7 = Gtk.Box(orientation=Gtk.Orientation.HORIZONTAL, spacing=10)
    hbox7_label = Gtk.Label(xalign=0)
    hbox7_label.set_text("Get the best keyservers for /etc/pacman.d/gnupg/gpg.conf")
    btn_apply_pacman_gpg_conf = Gtk.Button(label="Backup and reset gpg.conf")
    btn_apply_pacman_gpg_conf.connect("clicked", self.on_click_fix_pacman_gpg_conf)
    hbox7.pack_start(hbox7_label, False, False, 10)
    hbox7.pack_end(btn_apply_pacman_gpg_conf, False, False, 10)

    hbox8 = Gtk.Box(orientation=Gtk.Orientation.HORIZONTAL, spacing=10)
    hbox8_label = Gtk.Label(xalign=0)
    hbox8_label.set_text("Get the best keyservers for ~/.gnupg/gpg.conf")
    btn_apply_pacman_gpg_conf_local = Gtk.Button(label="Backup and reset gpg.conf")
    btn_apply_pacman_gpg_conf_local.connect(
        "clicked", self.on_click_fix_pacman_gpg_conf_local
    )
    hbox8.pack_start(hbox8_label, False, False, 10)
    hbox8.pack_end(btn_apply_pacman_gpg_conf_local, False, False, 10)

    hbox12 = Gtk.Box(orientation=Gtk.Orientation.HORIZONTAL, spacing=10)
    hbox12_label = Gtk.Label(xalign=0)
    hbox12_label.set_text("Choose the number of parallel downloads for pacman")
    self.parallel_downloads = Gtk.ComboBoxText()
    numbers = [
        "1",
        "2",
        "3",
        "4",
        "5",
        "6",
        "7",
        "8",
        "9",
        "10",
        "11",
        "12",
        "13",
        "14",
        "15",
        "16",
        "17",
        "18",
        "19",
        "20",
    ]

    btn_apply_parallel_downloads = Gtk.Button(label="Apply")
    btn_apply_parallel_downloads.connect(
        "clicked", self.on_click_apply_parallel_downloads
    )

    if fn.check_content("ParallelDownloads", fn.pacman):
        for number in numbers:
            self.parallel_downloads.append_text(number)  # string
        act_number = fixes.pop_parallel_downloads(self)
        self.parallel_downloads.set_active(act_number)

    else:
        btn_apply_parallel_downloads.set_sensitive(False)

    hbox12.pack_start(hbox12_label, False, False, 10)
    hbox12.pack_end(btn_apply_parallel_downloads, False, False, 10)
    hbox12.pack_end(self.parallel_downloads, False, False, 10)

    hbox13 = Gtk.Box(orientation=Gtk.Orientation.HORIZONTAL, spacing=10)
    hbox13_label = Gtk.Label(xalign=0)
    hbox13_label.set_text("Choose your cursor globally - /usr/share/icons/default")
    self.cursor_themes = Gtk.ComboBoxText()
    fixes.pop_gtk_cursor_names(self.cursor_themes)
    btn_apply_cursor = Gtk.Button(label="Apply")
    btn_apply_cursor.connect("clicked", self.on_click_apply_global_cursor)
    hbox13.pack_start(hbox13_label, False, False, 10)
    hbox13.pack_end(btn_apply_cursor, False, False, 10)
    hbox13.pack_end(self.cursor_themes, False, False, 10)

    hbox9 = Gtk.Box(orientation=Gtk.Orientation.HORIZONTAL, spacing=10)
    hbox9_label = Gtk.Label(xalign=0)
    hbox9_label.set_markup(
        "<b>Distro specific:  </b>" + fn.change_distro_label(fn.distr)
    )
    hbox9.pack_start(hbox9_label, False, False, 10)

    hbox10 = Gtk.Box(orientation=Gtk.Orientation.HORIZONTAL, spacing=10)
    hbox10_label = Gtk.Label(xalign=0)
    hbox10_label.set_markup("<b>For any Arch Linux based system</b>")
    hbox10.pack_start(hbox10_label, False, False, 10)

    hbox14 = Gtk.Box(orientation=Gtk.Orientation.HORIZONTAL, spacing=10)
    hbox14_label = Gtk.Label(xalign=0)
    hbox14_label.set_markup("Provide probe link")
    btn_probe = Gtk.Button(label="Get probe link")
    btn_probe.connect("clicked", self.on_click_probe)
    hbox14.pack_start(hbox14_label, False, False, 10)
    hbox14.pack_end(btn_probe, False, False, 10)

    hbox11 = Gtk.Box(orientation=Gtk.Orientation.HORIZONTAL, spacing=10)
    hbox11_label = Gtk.Label(xalign=0)
    hbox11_label.set_markup(
        "We install Alacritty to show you what changes - close the terminal and ATT continues"
    )
    hbox11.pack_start(hbox11_label, False, False, 10)

    hbox15 = Gtk.Box(orientation=Gtk.Orientation.HORIZONTAL, spacing=10)
    hbox15_label = Gtk.Label(xalign=0)
    hbox15_label.set_text("Remove all variety packages")
    btn_apply_remove_all_variety_packages = Gtk.Button(label="Apply")
    btn_apply_remove_all_variety_packages.connect(
        "clicked", self.on_click_remove_all_variety_packages
    )
    hbox15.pack_start(hbox15_label, False, False, 10)
    hbox15.pack_end(btn_apply_remove_all_variety_packages, False, False, 10)

    hbox16 = Gtk.Box(orientation=Gtk.Orientation.HORIZONTAL, spacing=10)
    hbox16_label = Gtk.Label(xalign=0)
    hbox16_label.set_text("Remove all conky packages")
    btn_apply_remove_all_conky_packages = Gtk.Button(label="Apply")
    btn_apply_remove_all_conky_packages.connect(
        "clicked", self.on_click_remove_all_conky_packages
    )
    hbox16.pack_start(hbox16_label, False, False, 10)
    hbox16.pack_end(btn_apply_remove_all_conky_packages, False, False, 10)

    hbox17 = Gtk.Box(orientation=Gtk.Orientation.HORIZONTAL, spacing=10)
    hbox17_label = Gtk.Label(xalign=0)
    hbox17_label.set_text("Remove all kernel(s) and keep the Linux kernel")
    btn_apply_remove_all_kernels_but_linux = Gtk.Button(label="Apply")
    btn_apply_remove_all_kernels_but_linux.connect(
        "clicked", self.on_click_remove_all_kernels_but_linux
    )
    hbox17.pack_start(hbox17_label, False, False, 10)
    hbox17.pack_end(btn_apply_remove_all_kernels_but_linux, False, False, 10)

    hbox18 = Gtk.Box(orientation=Gtk.Orientation.HORIZONTAL, spacing=10)
    hbox18_label = Gtk.Label(xalign=0)
    hbox18_label.set_text("Remove all kernel(s) and keep the Linux Cachyos kernel")
    btn_apply_remove_all_kernels_but_linux_cachyos = Gtk.Button(label="Apply")
    btn_apply_remove_all_kernels_but_linux_cachyos.connect(
        "clicked", self.on_click_remove_all_kernels_but_linux_cachyos
    )
    hbox18.pack_start(hbox18_label, False, False, 10)
    hbox18.pack_end(btn_apply_remove_all_kernels_but_linux_cachyos, False, False, 10)

    hbox19 = Gtk.Box(orientation=Gtk.Orientation.HORIZONTAL, spacing=10)
    hbox19_label = Gtk.Label(xalign=0)
    hbox19_label.set_text("Remove all kernel(s) and keep the Linux LTS kernel")
    btn_apply_remove_all_kernels_but_linux_lts = Gtk.Button(label="Apply")
    btn_apply_remove_all_kernels_but_linux_lts.connect(
        "clicked", self.on_click_remove_all_kernels_but_linux_lts
    )
    hbox19.pack_start(hbox19_label, False, False, 10)
    hbox19.pack_end(btn_apply_remove_all_kernels_but_linux_lts, False, False, 10)

    hbox20 = Gtk.Box(orientation=Gtk.Orientation.HORIZONTAL, spacing=10)
    hbox20_label = Gtk.Label(xalign=0)
    hbox20_label.set_text("Remove all kernel(s) and keep the Linux Zen kernel")
    btn_apply_remove_all_kernels_but_linux_zen = Gtk.Button(label="Apply")
    btn_apply_remove_all_kernels_but_linux_zen.connect(
        "clicked", self.on_click_remove_all_kernels_but_linux_zen
    )
    hbox20.pack_start(hbox20_label, False, False, 10)
    hbox20.pack_end(btn_apply_remove_all_kernels_but_linux_zen, False, False, 10)


    hbox21 = Gtk.Box(orientation=Gtk.Orientation.HORIZONTAL, spacing=10)
    hbox21_label = Gtk.Label(xalign=0)
    hbox21_label.set_text("Change debug to !debug in /etc/makepkg.conf")
    btn_apply_change_debug = Gtk.Button(label="Apply")
    btn_apply_change_debug.connect(
        "clicked", self.on_click_change_debug
    )
    hbox21.pack_start(hbox21_label, False, False, 10)
    hbox21.pack_end(btn_apply_change_debug, False, False, 10)

    # ======================================================================
    #                       VBOX STACK
    # ======================================================================

    vboxstack19.pack_start(hbox1, False, False, 0)
    vboxstack19.pack_start(hbox0, False, False, 0)
    vboxstack19.pack_start(hbox10, False, False, 20)
    vboxstack19.pack_start(hbox14, False, False, 0)
    # vboxstack19.pack_start(hbox11, False, False, 0)
    if not (fn.distr == "manjaro" or fn.distr == "biglinux" or fn.distr == "artix"):
        vboxstack19.pack_start(hbox5, False, False, 0)
    vboxstack19.pack_start(hbox2, False, False, 0)
    if not (fn.distr == "manjaro" or fn.distr == "biglinux" or fn.distr == "artix"):
        vboxstack19.pack_start(hbox3, False, False, 0)
    if not (fn.distr == "manjaro" or fn.distr == "biglinux" or fn.distr == "artix"):
        vboxstack19.pack_start(hbox4, False, False, 0)
    if not (fn.distr == "manjaro" or fn.distr == "biglinux" or fn.distr == "artix"):
        vboxstack19.pack_start(hbox40, False, False, 0)
    vboxstack19.pack_start(hbox7, False, False, 0)
    vboxstack19.pack_start(hbox8, False, False, 0)
    vboxstack19.pack_start(hbox12, False, False, 0)
    vboxstack19.pack_start(hbox13, False, False, 0)

    if fn.distr == "arcolinux":
        vboxstack19.pack_start(hbox9, False, False, 20)
        vboxstack19.pack_start(hbox15, False, False, 0)
        vboxstack19.pack_start(hbox16, False, False, 0)
        vboxstack19.pack_start(hbox17, False, False, 0)
        vboxstack19.pack_start(hbox18, False, False, 0)
        vboxstack19.pack_start(hbox19, False, False, 0)
        vboxstack19.pack_start(hbox20, False, False, 0)
        vboxstack19.pack_start(hbox21, False, False, 0)
