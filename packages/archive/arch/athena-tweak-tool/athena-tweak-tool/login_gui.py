# ============================================================
# Authors: Brad Heffernan - Erik Dubois - Cameron Percival
# ============================================================


def gui(self, Gtk, GdkPixbuf, vboxstack24, login, fn, base_dir, Pango):
    """create a gui"""

    hbox = Gtk.Box(orientation=Gtk.Orientation.HORIZONTAL, spacing=10)
    hbox3 = Gtk.Box(orientation=Gtk.Orientation.HORIZONTAL, spacing=10)
    hbox4 = Gtk.Box(orientation=Gtk.Orientation.HORIZONTAL, spacing=10)
    buttonbox = Gtk.Box(orientation=Gtk.Orientation.HORIZONTAL, spacing=10)
    # defaultbox = Gtk.Box(orientation=Gtk.Orientation.HORIZONTAL, spacing=10)
    statbox = Gtk.Box(orientation=Gtk.Orientation.HORIZONTAL, spacing=10)
    checkbox = Gtk.Box(orientation=Gtk.Orientation.HORIZONTAL, spacing=10)
    vbox = Gtk.Box(orientation=Gtk.Orientation.VERTICAL, spacing=10)

    vboxprog = Gtk.Box(orientation=Gtk.Orientation.VERTICAL, spacing=3)

    dropbox = Gtk.Box(orientation=Gtk.Orientation.VERTICAL, spacing=1)

    lbl1 = Gtk.Label(xalign=0)
    lbl1.set_text("Login Installer")
    lbl1.set_name("title")
    hseparator = Gtk.Separator(orientation=Gtk.Orientation.HORIZONTAL)
    hbox4.pack_start(hseparator, True, True, 0)
    hbox3.pack_start(lbl1, False, False, 0)

    # =======================================
    #               DROPDOWN
    # =======================================
    label_warning = Gtk.Label(xalign=0)
    label_warning.set_markup(
        "<b>Make sure the Athena repository is active \
- see Pacman tab</b>\n\nEnjoy these beautiful login themes"
    )
    label = Gtk.Label(xalign=0)
    label.set_text("Select a login")

    # button_arco_repo = Gtk.Button(label="Activate Athena repository")
    # button_arco_repo.connect("clicked", self.on_arco_repo_clicked)
    # button_arco_repo.set_margin_top(30)

    self.d_combo_login = Gtk.ComboBoxText()
    self.d_combo_login.set_size_request(180, 0)
    self.d_combo_login.connect("changed", self.on_d_combo_changed_login)
    for x in login.logins:
        self.d_combo_login.append_text(x)
    self.d_combo_login.set_active(0)
    self.d_combo_login.set_wrap_width(1)

    dropbox.pack_start(label_warning, False, False, 0)
    # dropbox.pack_start(button_arco_repo, False, False, 0)
    dropbox.pack_start(label, False, False, 20)
    dropbox.pack_start(self.d_combo_login, False, False, 0)

    # =======================================
    #               STATUS
    # =======================================
    statbox.pack_start(self.login_status, True, False, 0)

    # =======================================
    #               BUTTONS
    # =======================================

    self.button_install_login = Gtk.Button(label="Install")
    self.button_reinstall_login = Gtk.Button(label="Re-Install")

    self.button_adt = Gtk.Button()
    self.button_adt.set_margin_top(70)
    self.button_adt.set_size_request(100, 20)

    if fn.check_package_installed("arcolinux-desktop-trasher-git") is True:
        self.adt_installed = True
        self.button_adt.set_label("Remove the ArcoLinux Desktop Trasher")
        self.button_adt.connect("clicked", self.on_launch_adt_clicked)
    else:
        self.adt_installed = False
        self.button_adt.set_label("Install the ArcoLinux Desktop Trasher")
        self.button_adt.connect("clicked", self.on_launch_adt_clicked)

    self.button_install_login.connect("clicked", self.on_install_clicked_login, "inst")
    self.button_reinstall_login.connect("clicked", self.on_install_clicked_login, "reinst")

    buttonbox.pack_start(self.button_install_login, True, True, 0)
    # buttonbox.pack_start(self.button_reinstall_login, True, True, 0)
    # buttonbox.pack_start(button_uninstall, True, True, 0)

    # =======================================
    #               BUTTONS
    # =======================================

    # set_default = Gtk.Button(label="Set Default")
    # set_default.set_size_request(195, 0)

    # set_default.connect("clicked", self.on_default_clicked_login)
    # defaultbox.pack_end(set_default, False, False, 0)

    self.ch1 = Gtk.CheckButton(label="Select to clear cache before re-install")
    checkbox.pack_start(self.ch1, False, False, 0)
    # =======================================
    #               TEXTVIEW
    # =======================================
    self.login_prog = Gtk.ProgressBar()
    self.login_stat = Gtk.Label(xalign=0)
    self.login_stat.set_ellipsize(Pango.EllipsizeMode.MIDDLE)

    warning_picom = Gtk.Label(xalign=0)
    message = "We have found picom-ibhagwan-git or picom-jonaburg-git on this system\n\
Know that these packages conflict with picom-git. It will be removed."
    warning_picom.set_markup(
        '<span foreground="red" size="large">' + message + "</span>"
    )
    warning_picom.set_line_wrap(True)

    self.login_error = Gtk.Label(xalign=0)

    if fn.check_package_installed("picom-ibhagwan-git") or fn.check_package_installed(
        "picom-jonaburg-git"
    ):
        vboxprog.pack_start(warning_picom, False, False, 0)
    vboxprog.pack_start(self.login_error, False, False, 0)
    vboxprog.pack_start(self.login_stat, False, False, 0)
    vboxprog.pack_start(self.login_prog, False, False, 0)

    # =======================================
    #               FRAME PREVIEW
    # =======================================
    try:
        pixbuf3 = GdkPixbuf.Pixbuf().new_from_file_at_size(
            base_dir + "/login_data/" + login_mapping.get(self.d_combo_login.get_active_text()) + ".png",
            345,
            345,
        )
        self.image_login.set_from_pixbuf(pixbuf3)
    except:
        pass
    frame = Gtk.Frame(label="Preview")
    frame.add(self.image_login)

    lbl = Gtk.Label(xalign=0)
    lbl.set_text("Installation output")

    # =======================================
    #               PACK TO BOXES
    # =======================================
    vbox.pack_start(dropbox, False, False, 0)
    vbox.pack_start(statbox, False, False, 0)
    #vbox.pack_start(checkbox, False, False, 0)
    vbox.pack_start(buttonbox, False, False, 0)
    # vbox.pack_start(defaultbox, False, False, 0)

    hbox.pack_start(vbox, True, True, 10)
    hbox.pack_start(frame, True, True, 10)

    vbox1 = Gtk.Box(orientation=Gtk.Orientation.VERTICAL, spacing=10)
    vbox1.pack_start(hbox, False, False, 10)
    if fn.distr == "arcolinux":
        vbox1.pack_start(self.button_adt, False, True, 10)
    vbox1.pack_end(vboxprog, False, False, 0)
    # =======================================
    #               PACK TO WINDOW
    # =======================================
    vboxstack24.pack_start(hbox3, False, False, 0)
    vboxstack24.pack_start(hbox4, False, False, 0)
    vboxstack24.pack_start(vbox1, True, True, 0)
