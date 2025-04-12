# ============================================================
# Authors: Brad Heffernan - Erik Dubois - Cameron Percival
# ============================================================


def gui(self, Gtk, vboxStack10, user, fn):
    """create a gui"""
    hbox4 = Gtk.Box(orientation=Gtk.Orientation.HORIZONTAL, spacing=10)
    lbl1 = Gtk.Label(xalign=0)
    lbl1.set_text("Create User")
    lbl1.set_name("title")
    hbox4.pack_start(lbl1, False, False, 0)

    hbox5 = Gtk.Box(orientation=Gtk.Orientation.HORIZONTAL, spacing=10)
    hseparator = Gtk.Separator(orientation=Gtk.Orientation.HORIZONTAL)
    hbox5.pack_start(hseparator, True, True, 0)

    sep_text = "                       "

    label_name = Gtk.Label(xalign=0)
    label_name.set_text("    Name")
    name_sep = Gtk.Label(xalign=0)
    name_sep.set_text(sep_text)

    label_username = Gtk.Label(xalign=0)
    label_username.set_text("    Username")
    uname_sep = Gtk.Label(xalign=0)
    uname_sep.set_text(sep_text)

    label_account_type = Gtk.Label(xalign=0)
    label_account_type.set_text("    Account type")
    account_sep = Gtk.Label(xalign=0)
    account_sep.set_text(sep_text)

    label_password = Gtk.Label(xalign=0)
    label_password.set_text("    Password")
    pwd_sep = Gtk.Label(xalign=0)
    pwd_sep.set_text(sep_text)

    label_confirm_password = Gtk.Label(xalign=0)
    label_confirm_password.set_text("    Confirm password")
    conf_pwd_sep = Gtk.Label(xalign=0)
    conf_pwd_sep.set_text(sep_text)

    label_empty1 = Gtk.Label(xalign=0)
    label_empty1.set_text("")

    label_empty2 = Gtk.Label(xalign=0)
    label_empty2.set_text("")

    label_empty3 = Gtk.Label(xalign=0)
    label_empty3.set_text("")

    self.hbox_username = Gtk.Entry()
    self.hbox_name = Gtk.Entry()
    self.hbox_password = Gtk.Entry()
    self.hbox_password.set_visibility(False)
    self.hbox_confirm_password = Gtk.Entry()
    self.hbox_confirm_password.set_visibility(False)

    self.combo_account_type = Gtk.ComboBoxText()
    # TODO: enumerate
    for i in range(len(fn.account_list)):
        self.combo_account_type.append_text(fn.account_list[i])
    self.combo_account_type.set_active(1)

    grid = Gtk.Grid()
    grid.attach(label_username, 0, 0, 2, 1)
    grid.attach_next_to(uname_sep, label_username, Gtk.PositionType.RIGHT, 1, 1)
    grid.attach_next_to(self.hbox_username, uname_sep, Gtk.PositionType.RIGHT, 1, 1)
    grid.attach(label_name, 0, 2, 2, 1)
    grid.attach_next_to(name_sep, label_name, Gtk.PositionType.RIGHT, 1, 1)
    grid.attach_next_to(self.hbox_name, name_sep, Gtk.PositionType.RIGHT, 1, 1)
    grid.attach(label_account_type, 0, 4, 2, 1)
    grid.attach_next_to(account_sep, label_account_type, Gtk.PositionType.RIGHT, 1, 1)
    grid.attach_next_to(
        self.combo_account_type, account_sep, Gtk.PositionType.RIGHT, 1, 1
    )
    grid.attach(label_password, 0, 6, 2, 1)
    grid.attach_next_to(pwd_sep, label_password, Gtk.PositionType.RIGHT, 1, 1)
    grid.attach_next_to(self.hbox_password, pwd_sep, Gtk.PositionType.RIGHT, 1, 1)
    grid.attach(label_confirm_password, 0, 8, 2, 1)
    grid.attach_next_to(
        conf_pwd_sep, label_confirm_password, Gtk.PositionType.RIGHT, 1, 1
    )
    grid.attach_next_to(
        self.hbox_confirm_password, conf_pwd_sep, Gtk.PositionType.RIGHT, 1, 1
    )

    hbox9 = Gtk.Box(orientation=Gtk.Orientation.HORIZONTAL, spacing=10)
    lbl_information = Gtk.Label(xalign=0)
    lbl_information.set_markup(
        "The following groups are used for an administrator:\n\
audio, video, network, storage, rfkill, wheel, autologin, sambashare"
    )
    hbox9.pack_start(lbl_information, False, False, 0)

    hbox2 = Gtk.Box(orientation=Gtk.Orientation.HORIZONTAL, spacing=10)
    apply_settings = Gtk.Button(label="Apply settings")
    apply_settings.connect("clicked", self.on_click_user_apply)
    hbox2.pack_start(apply_settings, False, False, 0)

    hbox40 = Gtk.Box(orientation=Gtk.Orientation.HORIZONTAL, spacing=10)
    lbl_delete_user = Gtk.Label(xalign=0)
    lbl_delete_user.set_text("Delete User")
    lbl_delete_user.set_name("title")
    hbox40.pack_start(lbl_delete_user, False, False, 0)

    hbox50 = Gtk.Box(orientation=Gtk.Orientation.HORIZONTAL, spacing=10)
    hseparator = Gtk.Separator(orientation=Gtk.Orientation.HORIZONTAL)
    hbox50.pack_start(hseparator, True, True, 0)

    hbox7 = Gtk.Box(orientation=Gtk.Orientation.HORIZONTAL, spacing=10)
    hbox7_label = Gtk.Label(xalign=0)
    hbox7_label.set_markup("<b>Beware - you could delete your own user account</b>")
    hbox7.pack_start(hbox7_label, False, False, 10)

    hbox8 = Gtk.Box(orientation=Gtk.Orientation.HORIZONTAL, spacing=10)
    hbox8_label = Gtk.Label(xalign=0)
    hbox8_label.set_text("Remove the selected user")
    button_delete_user = Gtk.Button(label="Remove the selected user")
    button_delete_user.connect("clicked", self.on_click_delete_user)
    button_delete_all_user = Gtk.Button(
        label="Remove the selected user and the home folder"
    )
    button_delete_all_user.connect("clicked", self.on_click_delete_all_user)
    self.cbt_users = Gtk.ComboBoxText()
    user.pop_cbt_users(self, self.cbt_users)
    hbox8.pack_start(hbox8_label, False, False, 10)
    hbox8.pack_start(self.cbt_users, False, False, 10)

    hbox10 = Gtk.Box(orientation=Gtk.Orientation.HORIZONTAL, spacing=10)
    hbox10.pack_start(button_delete_all_user, False, False, 10)

    hbox11 = Gtk.Box(orientation=Gtk.Orientation.HORIZONTAL, spacing=10)
    hbox11.pack_start(button_delete_user, False, False, 10)

    hbox12 = Gtk.Box(orientation=Gtk.Orientation.HORIZONTAL, spacing=10)
    visudo_message = Gtk.Label(xalign=0)
    visudo_message.set_markup(
        "On <b>Arch Linux</b> remember to 'EDITOR=nano visudo' and uncomment the line '%wheel ALL=(ALL:ALL) ALL'\n\
if you want your users to have administrator rights"
    )
    hbox12.pack_start(visudo_message, False, False, 0)

    vboxStack10.pack_start(hbox4, False, False, 0)
    vboxStack10.pack_start(hbox5, False, False, 0)
    vboxStack10.pack_start(grid, False, False, 0)
    vboxStack10.pack_start(hbox9, False, False, 0)
    vboxStack10.pack_start(hbox2, False, False, 0)
    vboxStack10.pack_start(hbox40, False, False, 0)
    vboxStack10.pack_start(hbox50, False, False, 0)
    vboxStack10.pack_start(hbox7, False, False, 0)
    vboxStack10.pack_start(hbox8, False, False, 0)
    vboxStack10.pack_start(hbox10, False, False, 0)
    vboxStack10.pack_start(hbox11, False, False, 0)
    if fn.distr == "arch":
        vboxStack10.pack_start(hbox12, False, False, 0)
