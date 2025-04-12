# # ============================================================
# # Authors: Brad Heffernan - Erik Dubois - Cameron Percival
# # ============================================================


# def gui(self, Gtk, vboxStack21, fn):
#     """create a gui"""
#     hbox1 = Gtk.Box(orientation=Gtk.Orientation.HORIZONTAL, spacing=10)
#     hbox1_lbl = Gtk.Label(xalign=0)
#     hbox1_lbl.set_markup("Template - if you see this I have forgotten to hide it")
#     hbox1_lbl.set_name("title")
#     hbox1.pack_start(hbox1_lbl, False, False, 10)

#     hbox0 = Gtk.Box(orientation=Gtk.Orientation.HORIZONTAL, spacing=10)
#     hseparator = Gtk.Separator(orientation=Gtk.Orientation.HORIZONTAL)
#     hbox0.pack_start(hseparator, True, True, 0)

#     vbox = Gtk.Box(orientation=Gtk.Orientation.VERTICAL, spacing=10)

#     vboxStack1 = Gtk.Box(orientation=Gtk.Orientation.VERTICAL, spacing=10)
#     vboxStack2 = Gtk.Box(orientation=Gtk.Orientation.VERTICAL, spacing=10)
#     # vboxStack3 = Gtk.Box(orientation=Gtk.Orientation.VERTICAL, spacing=10)

#     stack = Gtk.Stack()
#     stack.set_transition_type(Gtk.StackTransitionType.SLIDE_UP_DOWN)
#     stack.set_transition_duration(350)
#     stack.set_hhomogeneous(False)
#     stack.set_vhomogeneous(False)

#     stack_switcher = Gtk.StackSwitcher()
#     stack_switcher.set_orientation(Gtk.Orientation.HORIZONTAL)
#     stack_switcher.set_stack(stack)
#     stack_switcher.set_homogeneous(True)

#     # ==================================================================
#     #                       ITEM 1
#     # ==================================================================

#     hbox2 = Gtk.Box(orientation=Gtk.Orientation.HORIZONTAL, spacing=10)
#     hbox2_lbl = Gtk.Label(xalign=0)
#     hbox2_lbl.set_markup(
#         "Discover other computers in your network (to access other computers)"
#     )
#     btn_install_discovery = Gtk.Button(label="Install network discovery")
#     btn_install_discovery.connect("clicked", self.on_install_discovery_clicked)
#     btn_remove_discovery = Gtk.Button(label="Uninstall network discovery")
#     btn_remove_discovery.connect("clicked", self.on_remove_discovery_clicked)
#     hbox2.pack_start(hbox2_lbl, False, False, 10)
#     hbox2.pack_end(btn_remove_discovery, False, False, 10)
#     hbox2.pack_end(btn_install_discovery, False, False, 10)

#     hbox3 = Gtk.Box(orientation=Gtk.Orientation.HORIZONTAL, spacing=10)
#     hbox3_lbl = Gtk.Label(xalign=0)
#     hbox3_lbl.set_markup("Change the /etc/nsswitch.conf to connect to computers/NAS")
#     self.nsswitch_choices = Gtk.ComboBoxText()
#     options = ["ArcoLinux", "Garuda", "Arch Linux", "EndeavourOS"]
#     for option in options:
#         self.nsswitch_choices.append_text(option)
#     self.nsswitch_choices.set_active(0)
#     btn_apply_nsswitch = Gtk.Button(label="Apply selected nsswitch.conf")
#     btn_apply_nsswitch.connect("clicked", self.on_click_apply_nsswitch)
#     btn_reset_nsswitch = Gtk.Button(label="Reset to default nsswitch")
#     btn_reset_nsswitch.connect("clicked", self.on_click_reset_nsswitch)
#     hbox3.pack_start(hbox3_lbl, False, False, 10)
#     hbox3.pack_end(btn_reset_nsswitch, False, False, 10)
#     hbox3.pack_start(self.nsswitch_choices, False, False, 10)
#     hbox3.pack_start(btn_apply_nsswitch, False, False, 10)

#     # ==================================================================
#     #                       SAMBA EASY TAB
#     # ==================================================================

#     hbox10 = Gtk.Box(orientation=Gtk.Orientation.HORIZONTAL, spacing=10)
#     hbox10_lbl = Gtk.Label(xalign=0)
#     hbox10_lbl.set_markup("some text")
#     hbox10.pack_start(hbox10_lbl, False, False, 10)

#     hbox11 = Gtk.Box(orientation=Gtk.Orientation.HORIZONTAL, spacing=10)
#     hbox11_lbl = Gtk.Label(xalign=0)
#     hbox11_lbl.set_markup("1. Install the samba server")
#     btn_uninstall_samba = Gtk.Button(label="Uninstall Samba")
#     btn_uninstall_samba.connect("clicked", self.on_click_uninstall_samba)
#     btn_install_samba = Gtk.Button(label="Install Samba")
#     btn_install_samba.connect("clicked", self.on_click_install_samba)
#     hbox11.pack_start(hbox11_lbl, False, False, 10)
#     hbox11.pack_end(btn_uninstall_samba, False, False, 10)
#     hbox11.pack_start(btn_install_samba, False, False, 10)

#     hbox12 = Gtk.Box(orientation=Gtk.Orientation.HORIZONTAL, spacing=10)
#     hbox12_lbl = Gtk.Label(xalign=0)
#     hbox12_lbl.set_markup("2. Apply the /etc/samba/smb.conf of your choice")
#     self.samba_choices = Gtk.ComboBoxText()
#     options_samba = ["Easy", "Usershares", "Windows", "ArcoLinux", "Original"]
#     for option in options_samba:
#         self.samba_choices.append_text(option)
#     self.samba_choices.set_active(0)
#     btn_apply_samba = Gtk.Button(label="Apply selected samba.conf")
#     btn_apply_samba.connect("clicked", self.on_click_apply_samba)
#     btn_reset_samba = Gtk.Button(label="Reset to default samba.conf")
#     btn_reset_samba.connect("clicked", self.on_click_reset_samba)
#     hbox12.pack_start(hbox12_lbl, False, False, 10)
#     hbox12.pack_start(self.samba_choices, True, False, 10)
#     hbox12.pack_start(btn_apply_samba, True, False, 10)
#     hbox12.pack_end(btn_reset_samba, False, False, 10)

#     hbox13 = Gtk.Box(orientation=Gtk.Orientation.HORIZONTAL, spacing=10)
#     hbox13_lbl = Gtk.Label(xalign=0)
#     hbox13_lbl.set_markup(
#         "3. Create a password for the current user to be able to access the Samba server"
#     )
#     btn_create_samba_user = Gtk.Button(label="Create a password for the current user")
#     btn_create_samba_user.connect("clicked", self.on_click_create_samba_user)
#     hbox13.pack_start(hbox13_lbl, False, False, 10)
#     hbox13.pack_start(btn_create_samba_user, False, False, 10)

#     hbox14 = Gtk.Box(orientation=Gtk.Orientation.HORIZONTAL, spacing=10)
#     hbox14_lbl = Gtk.Label(xalign=0)
#     hbox14_lbl.set_markup(
#         "You can now reboot and enjoy the <b>'Shared'</b> folder if you choose '<b>easy</b>' "
#     )
#     hbox14.pack_start(hbox14_lbl, False, False, 10)

#     hbox15 = Gtk.Box(orientation=Gtk.Orientation.HORIZONTAL, spacing=10)
#     hbox15_lbl = Gtk.Label(xalign=0)
#     hbox15_lbl.set_markup(
#         "If you choose '<b>usershares</b>' then we recommend you \
# install also thunar and its plugin and \
# right-click to share any folder in your home directory\nThere are other filemanagers with \
# their plugins at the bottom"
#     )
#     hbox15.pack_start(hbox15_lbl, False, False, 10)

#     # ==================================================================
#     #                             BOTTOM
#     # ==================================================================

#     # warning message
#     hbox90 = Gtk.Box(orientation=Gtk.Orientation.HORIZONTAL, spacing=10)
#     hbox90_lbl = Gtk.Label(xalign=0)
#     hbox90_lbl.set_markup(
#         '<span foreground="red" size="large">We found a firewall on your system</span>'
#     )
#     hbox90.pack_start(hbox90_lbl, False, False, 10)

#     # vboxStack1
#     hbox91 = Gtk.Box(orientation=Gtk.Orientation.HORIZONTAL, spacing=10)
#     hbox91_lbl = Gtk.Label(xalign=0)
#     hbox91_lbl.set_markup(
#         "With the Avahi daemon (network discovery) running on both the server and client,\n\
# the file manager on the client should automatically find the server- Beware of firewalls"
#     )
#     restart_smb = Gtk.Button(label="Restart Smb")
#     restart_smb.connect("clicked", self.on_click_restart_smb)
#     hbox91.pack_start(hbox91_lbl, False, False, 10)
#     hbox91.pack_end(restart_smb, False, False, 10)

#     # vboxStack2
#     hbox92 = Gtk.Box(orientation=Gtk.Orientation.HORIZONTAL, spacing=10)
#     install_arco_thunar_plugin = Gtk.Button(label="Install ArcoLinux Thunar plugin")
#     install_arco_thunar_plugin.connect(
#         "clicked", self.on_click_install_arco_thunar_plugin
#     )
#     install_arco_nemo_plugin = Gtk.Button(label="Install ArcoLinux Nemo plugin")
#     install_arco_nemo_plugin.connect("clicked", self.on_click_install_arco_nemo_plugin)
#     install_arco_caja_plugin = Gtk.Button(label="Install ArcoLinux Caja plugin")
#     install_arco_caja_plugin.connect("clicked", self.on_click_install_arco_caja_plugin)
#     hbox92.pack_start(install_arco_thunar_plugin, False, False, 10)
#     hbox92.pack_start(install_arco_nemo_plugin, False, False, 10)
#     hbox92.pack_start(install_arco_caja_plugin, False, False, 10)

#     # network
#     # if Functions.check_service("firewalld"):
#     vboxStack1.pack_start(hbox90, False, False, 10)  # message warning
#     vboxStack1.pack_start(hbox2, False, False, 10)
#     vboxStack1.pack_start(hbox3, False, False, 0)

#     # samba easy
#     vboxStack2.pack_start(hbox10, False, False, 10)
#     vboxStack2.pack_start(hbox11, False, False, 0)
#     vboxStack2.pack_start(hbox12, False, False, 0)
#     vboxStack2.pack_start(hbox13, False, False, 0)
#     vboxStack2.pack_start(hbox14, False, False, 10)
#     vboxStack2.pack_start(hbox15, False, False, 10)

#     # bottom
#     vboxStack1.pack_end(hbox91, False, False, 10)
#     vboxStack2.pack_end(hbox92, False, False, 10)

#     # ==================================================================
#     #                       PACK TO STACK
#     # ==================================================================

#     stack.add_titled(vboxStack1, "stack1", "Item 1")
#     stack.add_titled(vboxStack2, "stack2", "Item 2")

#     vbox.pack_start(stack_switcher, False, False, 0)
#     vbox.pack_start(stack, True, True, 0)

#     vboxStack21.pack_start(hbox1, False, False, 0)
#     vboxStack21.pack_start(hbox0, False, False, 0)
#     vboxStack21.pack_start(vbox, True, True, 0)
