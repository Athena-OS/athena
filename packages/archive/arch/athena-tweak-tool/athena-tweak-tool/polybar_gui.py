# #============================================================
# # Authors: Brad Heffernan - Erik Dubois - Cameron Percival
# #============================================================

# def gui(self, Gtk, GdkPixbuf, vboxStack14, polybar, fn, base_dir):
#    """create a gui"""
#     # =======================================================
#     #                       GLOBALS
#     # =======================================================

#     hbox1 = Gtk.Box(orientation=Gtk.Orientation.HORIZONTAL, spacing=10)
#     hbox2 = Gtk.Box(orientation=Gtk.Orientation.HORIZONTAL, spacing=10)
#     hbox3 = Gtk.Box(orientation=Gtk.Orientation.HORIZONTAL, spacing=10)
#     hbox4 = Gtk.Box(orientation=Gtk.Orientation.HORIZONTAL, spacing=10)
#     hbox5 = Gtk.Box(orientation=Gtk.Orientation.HORIZONTAL, spacing=10)
#     hbox6 = Gtk.Box(orientation=Gtk.Orientation.HORIZONTAL, spacing=10)
#     hbox7 = Gtk.Box(orientation=Gtk.Orientation.HORIZONTAL, spacing=10)
#     hbox8 = Gtk.Box(orientation=Gtk.Orientation.HORIZONTAL, spacing=10)
#     hbox9 = Gtk.Box(orientation=Gtk.Orientation.HORIZONTAL, spacing=10)
#     hbox10 = Gtk.Box(orientation=Gtk.Orientation.HORIZONTAL, spacing=10)
#     hbox11 = Gtk.Box(orientation=Gtk.Orientation.HORIZONTAL, spacing=10)

#     spacer = Gtk.Box(orientation=Gtk.Orientation.HORIZONTAL, spacing=10)


#     message = Gtk.Label("You will need to manually restart polybar for changes to take effect. Hint:(add to keybind)")
#     hbox11.pack_start(message, True, False, 0)
#     # =======================================================
#     #                       THEME SELECTION
#     # =======================================================

#     label = Gtk.Label("Select your theme")
#     self.pbcombo = Gtk.ComboBoxText()
#     self.pbcombo.connect("changed", self.on_pb_change_item)

#     self.pbrbutton = Gtk.RadioButton(label="Top Bar")
#     self.pbrbutton2 = Gtk.RadioButton.new_from_widget(self.pbrbutton)
#     self.pbrbutton2.set_label("Bottom Bar")
#     self.pbrbutton.set_active(True)

#     self.pbframe = Gtk.Frame()

#     self.pbimage = Gtk.Image()
#     self.pbframe.add(self.pbimage)

#     hbox1.pack_start(label, False, False, 0)
#     hbox1.pack_start(self.pbcombo, True, True, 0)
#     hbox2.pack_start(self.pbframe, True, False, 0)

#     hbox10.pack_start(self.pbrbutton, True, False, 0)
#     hbox10.pack_start(self.pbrbutton2, True, False, 0)

#     # =======================================================
#     #                       IMPORT SECTION
#     # =======================================================

#     title_intro = Gtk.Label(xalign=0)
#     title_intro.set_markup("<big><b><u>Import Config</u></b></big>")

#     import_intro = Gtk.Label()
#     import_intro.set_markup("Select a polybar config and a screenshot of the config to import")
#     # vbox2 = Gtk.Box(orientation=Gtk.Orientation.VERTICAL, spacing=10)
#     label2 = Gtk.Label("Select file to import      ")
#     self.pbtextbox1 = Gtk.Entry()
#     browse1 = Gtk.Button(label=". . .")
#     browse1.connect("clicked", self.on_pb_browse_config)

#     hbox4.pack_start(label2, False, False, 0)
#     hbox4.pack_start(self.pbtextbox1, True, True, 0)
#     hbox4.pack_start(browse1, False, False, 0)

#     label3 = Gtk.Label("Select image to import(Optional)")
#     self.pbtextbox2 = Gtk.Entry()
#     browse2 = Gtk.Button(label=". . .")
#     browse2.connect("clicked", self.on_pb_browse_image)

#     import_image = Gtk.Button(label="Import Config")
#     import_image.connect("clicked", self.on_pb_import_clicked)

#     # self.frame2 = Gtk.Frame()
#     # # self.frame2.set_no_show_all(True)
#     # self.image2 = Gtk.Image()
#     # self.frame2.add(self.image2)

#     hbox8.pack_start(title_intro, False, False, 0)
#     hbox9.pack_start(import_intro, True, False, 0)

#     hbox5.pack_start(label3, False, False, 0)
#     hbox5.pack_start(self.pbtextbox2, True, True, 0)
#     hbox5.pack_start(browse2, False, False, 0)
#     hbox7.pack_start(import_image, True, True, 0)
#     # hbox6.pack_start(self.frame2, True, False, 0)

#     # =======================================================
#     #                       FOOTER
#     # =======================================================

#     self.pblabel4 = Gtk.Label(xalign=0)
#     self.pblabel4.set_markup("")

#     button1 = Gtk.Button(label="Apply Config")
#     button1.set_size_request(0, 30)
#     button1.connect("clicked", self.on_polybar_apply_clicked)
#     # button2 = Gtk.Button(label="Reset Config")

#     hbox3.pack_start(self.pblabel4, False, False, 0)
#     hbox3.pack_end(button1, False, False, 0)

#     # =======================================================
#     #                       PACK TO WINDOW
#     # =======================================================
#     vboxStack14.pack_start(hbox11, False, False, 0)  # Message Section
#     vboxStack14.pack_start(hbox1, False, False, 0)  # Combo Section
#     vboxStack14.pack_start(hbox10, False, False, 0)  # Combo Section
#     vboxStack14.pack_start(hbox2, False, False, 0)  # Preview Section

#     vboxStack14.pack_start(spacer, False, False, 0)  # Spacer
#     vboxStack14.pack_start(hbox8, False, False, 0)  # title
#     vboxStack14.pack_start(hbox9, False, False, 0)  # message
#     vboxStack14.pack_start(hbox4, False, False, 0)  # Import Section
#     vboxStack14.pack_start(hbox5, False, False, 0)  # Import Section
#     vboxStack14.pack_start(hbox7, False, False, 0)  # Import Button
#     vboxStack14.pack_start(hbox6, False, False, 0)  # Preview Section

#     vboxStack14.pack_end(hbox3, False, False, 0)  # Button Section

#     # ===============Populate Combobox=======================

#     polybar.pop_bar(self)
