# ============================================================
# Authors: Brad Heffernan - Erik Dubois - Cameron Percival
# ============================================================


def gui(self, Gtk, vboxstack13, fn):
    """create a gui"""

    hbox3 = Gtk.Box(orientation=Gtk.Orientation.HORIZONTAL, spacing=0)
    lbl1 = Gtk.Label(xalign=0)
    lbl1.set_text("Autostart")
    lbl1.set_name("title")
    hbox3.pack_start(lbl1, False, False, 0)

    hbox4 = Gtk.Box(orientation=Gtk.Orientation.HORIZONTAL, spacing=0)
    hseparator = Gtk.Separator(orientation=Gtk.Orientation.HORIZONTAL)
    hbox4.pack_start(hseparator, True, True, 0)

    toplabelbox = Gtk.Box(orientation=Gtk.Orientation.HORIZONTAL, spacing=0)
    labelbox = Gtk.Box(orientation=Gtk.Orientation.HORIZONTAL, spacing=0)
    lbls = Gtk.Label(xalign=0)
    lbls.set_text("Current content of ~/.config/autostart/")
    toplabelbox.pack_start(lbls, False, False, 0)

    files = [x.replace(".desktop", "") for x in fn.listdir(fn.autostart)]
    mainbox = Gtk.Box(orientation=Gtk.Orientation.VERTICAL, spacing=10)

    scrolled_window = Gtk.ScrolledWindow()
    scrolled_window.set_policy(Gtk.PolicyType.NEVER, Gtk.PolicyType.AUTOMATIC)

    self.vvbox = Gtk.Box(orientation=Gtk.Orientation.VERTICAL, spacing=10)
    self.vvbox.set_name("vbox")

    scrolled_window.add(self.vvbox)
    mainbox.pack_start(scrolled_window, True, True, 0)

    self.load_autostart(files)

    # ==========================================
    #              Button
    # ==========================================
    lbl1 = Gtk.Label("Name")
    lbl2 = Gtk.Label("Command")
    lbl3 = Gtk.Label("Comment")

    self.txtbox1 = Gtk.Entry()  # Name
    self.txtbox2 = Gtk.Entry()  # EXEC
    self.txtbox3 = Gtk.Entry()  # Comment
    self.txtbox1.set_size_request(180, 0)
    self.txtbox2.set_size_request(180, 0)
    self.txtbox3.set_size_request(180, 0)
    self.txtbox1.connect("changed", self.on_comment_changed)
    self.txtbox2.connect("changed", self.on_comment_changed)

    bbutton = Gtk.Button(label="...")
    self.abutton = Gtk.Button(label="Add")
    self.abutton.set_size_request(140, 0)
    self.abutton.set_sensitive(False)

    bbutton.connect("clicked", self.on_exec_browse)

    self.abutton.connect("clicked", self.on_add_autostart)

    vbox2 = Gtk.Box(orientation=Gtk.Orientation.VERTICAL, spacing=3)
    vbox3 = Gtk.Box(orientation=Gtk.Orientation.VERTICAL, spacing=3)
    vbox4 = Gtk.Box(orientation=Gtk.Orientation.VERTICAL, spacing=3)
    vbox5 = Gtk.Box(orientation=Gtk.Orientation.VERTICAL, spacing=3)
    vbox6 = Gtk.Box(orientation=Gtk.Orientation.VERTICAL, spacing=3)

    vbox2.pack_start(lbl1, False, False, 0)
    vbox2.pack_start(self.txtbox1, False, False, 0)

    vbox3.pack_start(lbl2, False, False, 0)
    vbox3.pack_start(self.txtbox2, False, False, 0)

    vbox4.pack_start(lbl3, False, False, 0)
    vbox4.pack_start(self.txtbox3, False, False, 0)

    vbox5.pack_end(bbutton, False, False, 0)
    vbox6.pack_end(self.abutton, False, False, 0)

    hbox2 = Gtk.Box(orientation=Gtk.Orientation.HORIZONTAL, spacing=0)
    hbox2.pack_start(vbox2, False, False, 5)
    hbox2.pack_start(vbox3, False, False, 0)
    hbox2.pack_start(vbox5, False, False, 0)
    hbox2.pack_start(vbox4, False, False, 5)
    hbox2.pack_start(vbox6, False, False, 5)

    vboxstack13.pack_start(hbox3, False, False, 0)
    vboxstack13.pack_start(hbox4, False, False, 0)
    vboxstack13.pack_start(toplabelbox, False, False, 0)
    vboxstack13.pack_start(mainbox, True, True, 0)
    vboxstack13.pack_start(labelbox, False, False, 0)
    vboxstack13.pack_start(hbox2, False, False, 0)
