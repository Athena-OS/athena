# =================================================================
# =          Authors: Brad Heffernan & Erik Dubois                =
# =================================================================

import os
import getpass
from os.path import expanduser
from subprocess import check_output
import subprocess

DEBUG = False
#DEBUG = True

base_dir = os.path.dirname(os.path.realpath(__file__))
home = expanduser("~")
username = getpass.getuser()

if DEBUG:
    user = username
else:
    user = "liveuser"

Settings = home + "/.config/athena-welcome/settings.conf" # The role is at system level because packages are installed at system level
dot_desktop = "/usr/share/applications/athena-welcome.desktop"
autostart = home + "/.config/autostart/athena-welcome.desktop"


def GUI(self, Gtk, GdkPixbuf):

    autostart = eval(self.load_settings())

    self.vbox = Gtk.Box(orientation=Gtk.Orientation.VERTICAL, spacing=0)
    self.add(self.vbox)

    hbox1 = Gtk.Box(orientation=Gtk.Orientation.HORIZONTAL, spacing=10)
    hbox2 = Gtk.Box(orientation=Gtk.Orientation.HORIZONTAL, spacing=10)
    hbox3 = Gtk.Box(orientation=Gtk.Orientation.HORIZONTAL, spacing=10)
    hbox4 = Gtk.Box(orientation=Gtk.Orientation.HORIZONTAL, spacing=10)
    hbox5 = Gtk.Box(orientation=Gtk.Orientation.HORIZONTAL, spacing=10)
    hbox6 = Gtk.Box(orientation=Gtk.Orientation.HORIZONTAL, spacing=10)
    hbox7 = Gtk.Box(orientation=Gtk.Orientation.HORIZONTAL, spacing=10)
    hbox8 = Gtk.Box(orientation=Gtk.Orientation.HORIZONTAL, spacing=10)
    hbox9 = Gtk.Box(orientation=Gtk.Orientation.HORIZONTAL, spacing=10)
    hbox10 = Gtk.Box(orientation=Gtk.Orientation.HORIZONTAL, spacing=10) #ComboBox
    hbox11 = Gtk.Box(orientation=Gtk.Orientation.HORIZONTAL, spacing=10) #Key shortcut
    hboxmiddle = Gtk.Box(orientation=Gtk.Orientation.HORIZONTAL, spacing=10)

    # vbox1 = Gtk.Box(orientation=Gtk.Orientation.VERTICAL, spacing=10)
    # vbox2 = Gtk.Box(orientation=Gtk.Orientation.VERTICAL, spacing=10)

    infoE = Gtk.EventBox()
    pbinfo = GdkPixbuf.Pixbuf().new_from_file_at_size(
        os.path.join(base_dir, 'images/question.png'), 38, 38)
    infoimage = Gtk.Image().new_from_pixbuf(pbinfo)
    infoE.add(infoimage)
    infoE.connect("button_press_event", self.on_info_clicked)
    infoE.set_property("has-tooltip", True)
    infoE.connect("query-tooltip", self.tooltip_callback, "Conflicts Info")

    # ======================================================================
    #                   WELCOME LABEL
    # ======================================================================

    self.cc = Gtk.Label()

    label = Gtk.Label(xalign=0)
    label.set_markup(
        "<big>Welcome to <b>Athena OS</b></big>")
    label.set_line_wrap(True)

    # pixbuf = GdkPixbuf.Pixbuf().new_from_file_at_size(
    #     os.path.join(base_dir, 'images/arcolinux-one-liner.png'), 145, 145)
    # image = Gtk.Image().new_from_pixbuf(pixbuf)

    label2 = Gtk.Label(xalign=0)
    label2.set_justify(Gtk.Justification.CENTER)
    label2.set_line_wrap(True)

    label_warning = Gtk.Label(xalign=0)
    label_warning.set_justify(Gtk.Justification.CENTER)
    label_warning.set_line_wrap(True)

    if username == user:

        label2.set_markup(
            "During the installation many options will be open to you. You have the freedom of choice.\n" +  # noqa
            "We communicate with our community via a diversity of social media.\n" +  # noqa
            "Join us to learn the latest news, ask questions or for casual talk.\n" +  # noqa
            "Reach us on <b>Discord</b> for chatting or assistance.\n")
        #label_warning.set_markup(
            #"\n<span size='x-large'><b>Use the Easy Installation\n" + # noqa
            #"if the Advanced Installation fails</b></span>\n")  # noqa
    else:
        label2.set_markup(#"Press <b>[CTRL+SPACE]</b> for the <b>Red Team menu</b>, <b>[CTRL+ALT+A]</b> for the <b>Blue Team menu</b> or <b>[CTRL+SHIFT+SPACE]</b> for the <b>PWNage menu</b> to explore them.\n\n" + # noqa
                          "Choose your role and click the <b>Set Your Role</b> button to retrieve the main resources you need!\n\n" + #noqa
			  "Click <b>HTB Update</b> to set your Hack The Box API key and start your hacking experience!\n\n" + #noqa
                    
                          "Get started on Athena. We communicate with our community through Discord or GitHub.\n" + #noqa
                          "Join us to learn the latest news, ask questions or just for chatting.\n" +  # noqa
                          "Open a <b>ticket</b> for any issues or proposals.\n" +  # noqa
                          "Learn, study and have fun!")

    hbox4.set_center_widget(label2)
    hbox1.pack_start(label, False, False, 0)
    hbox1.pack_end(self.cc, False, False, 0)
    #hbox4.pack_start(label2, False, False, 0)
    hbox8.pack_start(label_warning, True, False, 0)

    # ======================================================================
    #                   COMBO MENU
    # ======================================================================

    role_store = Gtk.ListStore(str)
    roles = [
        "🔥 Choose your Role 🔥",
        "💙 Blue Teamer 💙",
        "🐞 Bug Bounty Hunter 🐞",
        "🍘 Cracker Specialist 🍘",
        "💀 DoS Tester 💀",
        "🎓 Enthusiast Student 🎓",
        "🔍 Forensic Analyst 🔍",
        "🦠 Malware Analyst 🦠",
        "📱 Mobile Analyst 📱",
        "🖧 Network Analyst 🖧",
        "🌐 OSINT Specialist 🌐",
        "❤️ Red Teamer ❤️",
        "🕸️ Web Pentester 🕸️",
    ]

    for role in roles:
        role_store.append([role])
    
    role_combo = Gtk.ComboBox.new_with_model(role_store) # Source: https://stackoverflow.com/questions/53678686/python-gtk-3-how-to-center-text-within-combobox-widget
    role_combo.connect("changed", self.on_role_combo_changed)
    renderer_text = Gtk.CellRendererText()
    renderer_text.set_property("xalign", 0.51) #less than 0.51 has no affect
    role_combo.pack_start(renderer_text, True)
    role_combo.add_attribute(renderer_text, "text", 0)

    #role_combo.set_entry_text_column(0)

    with open(Settings, "r") as f:
        contents = f.read()
        f.close()
    if "role=" in contents:
        strout = contents.split("role=")[1].replace('\n', '')  # Extract the latest installed role from the $HOME/.config/athena-welcome/settings.conf
    else:
        strout = "none"

    if "blue" == strout:
        role_combo.set_active(1)
    elif "bugbounty" == strout:
        role_combo.set_active(2)
    elif "cracker" == strout:
        role_combo.set_active(3)
    elif "dos" == strout:
        role_combo.set_active(4)
    elif "student" == strout:
        role_combo.set_active(5)
    elif "forensic" == strout:
        role_combo.set_active(6)
    elif "malware" == strout:
        role_combo.set_active(7)
    elif "mobile" == strout:
        role_combo.set_active(8)
    elif "network" == strout:
        role_combo.set_active(9)
    elif "osint" == strout:
        role_combo.set_active(10)
    elif "red" == strout:
        role_combo.set_active(11)
    elif "web" == strout:
        role_combo.set_active(12)
    else:
        role_combo.set_active(0)

    #The position of ComboBox roles is defined in the if-else of the usernames below in hbox1

    # ======================================================================
    #                   MAIN BUTTONS
    # ======================================================================

    btngparted = Gtk.Button(label="")
    btngparted_label = btngparted.get_child()
    btngparted_label.set_markup("<span size='large'><b>Run GParted</b></span>")
    btngparted.connect("clicked", self.on_gp_clicked)
    btngparted.set_size_request(0, 50)

    #buttonkeys = Gtk.Button(label="")
    #buttonkeys_label = buttonkeys.get_child()
    #buttonkeys_label.set_markup("<span size='large'><b>Update Aegis Installer</b></span>")
    #buttonkeys.connect("clicked", self.on_aegis_update_clicked)
    #buttonkeys.set_size_request(0, 50)

    #button2 = Gtk.Button(label="")
    #button2_label = button2.get_child()
    #button2_label.set_markup("<span size='large'><b>Easy Installation</b></span>")

    #button2.connect("clicked", self.on_ai_clicked)
    #button2.set_size_request(0, 80)

    btnonlinstall = Gtk.Button(label="")
    btnonlinstall_label = btnonlinstall.get_child()
    btnonlinstall_label.set_markup("<span size='large'><b>Installation (Online)</b></span>")

    btnonlinstall.connect("clicked", self.on_aica_clicked)
    btnonlinstall.set_size_request(0, 50)

    #btnofflinstall = Gtk.Button(label="")
    #btnofflinstall_label = btnofflinstall.get_child()
    #btnofflinstall_label.set_markup("<span size='large'><b>Easy Installation (Offline)</b></span>")

    #btnofflinstall.connect("clicked", self.on_offline_clicked)
    #btnofflinstall.set_size_request(0, 50)

    gridimg = Gtk.Grid ()
    pb = GdkPixbuf.Pixbuf.new_from_file_at_size('images/htb.png', 35, 35)
    img = Gtk.Image()
    img.set_from_pixbuf(pb)
    label = Gtk.Label ("<span size='large'><b>HTB Update</b></span>")
    label.set_use_markup(True)
    gridimg.attach (img, 0, 0, 40, 1) #40 is used to shift the icon from left to right in the button section
    gridimg.attach (label, 1, 0, 100, 1) #100 is used to shift the icon from right to left in the button section
    gridimg.set_column_homogeneous(True) #These two lines are important for managing the centering of icon and label
    gridimg.set_row_homogeneous(True)    

    self.buttonhtb = Gtk.Button(xalign=0.5, yalign=1) #Icon image centered by yalign=1 (maybe no... It is override by gridimg.attach above)
    #buttonhtb = self.buttonhtb.get_child()
    #self.buttonhtb.set_always_show_image (True)
    #buttonhtb.set_markup("<span size='large'><b>HTB Update</b></span>")
    #self.buttonhtb.set_image(img) # Used for putting only the icon in the button. I need also label so I don't use this
    #self.buttonhtb.set_image_position(Gtk.PositionType.TOP)
    #self.buttonhtb.get_style_context().add_class("btn_article")
    self.buttonhtb.connect("clicked", self.on_buttonhtb_clicked)
    self.buttonhtb.set_size_request(200, 50)
    gridimg.show_all ()
    self.buttonhtb.add(gridimg)

    self.buttontools = Gtk.Button(label="")
    buttontools = self.buttontools.get_child()
    buttontools.set_markup("<span size='large'><b>Tool Recipe</b></span>")
    self.buttontools.connect("clicked", self.on_buttontools_clicked)
    self.buttontools.set_size_request(200, 50)

    self.buttonrtm = Gtk.Button(label="")
    buttonrtm = self.buttonrtm.get_child()
    buttonrtm.set_markup("<span size='large'><b>Set Your Role</b></span>")
    self.buttonrtm.connect("clicked", self.on_buttonrtm_clicked)
    self.buttonrtm.set_size_request(420, 70)

    self.bntmirrors = Gtk.Button(label="")
    bntmirrors_label = self.bntmirrors.get_child()
    bntmirrors_label.set_markup("<span size='large'><b>Update All Mirrors</b></span>")
    self.bntmirrors.connect("clicked", self.on_mirror_clicked)
    self.bntmirrors.set_size_request(420, 70)
    
    #self.buttonatt = Gtk.Button(label="")
    #buttonatt_label = self.buttonatt.get_child()
    #buttonatt_label.set_markup("<span size='large'><b>Launch Arch Linux Tweak Tool</b></span>")
    #self.buttonatt.connect("clicked", self.on_buttonatt_clicked)
    #self.buttonatt.set_size_request(420, 70)

    #I dont need a Software Manager
    #self.buttonpamac = Gtk.Button(label="")
    #buttonpamac_label = self.buttonpamac.get_child()
    #buttonpamac_label.set_markup("<span size='large'><b>Install software</b></span>")
    #self.buttonpamac.connect("clicked", self.on_buttonpamac_clicked)
    #self.buttonpamac.set_size_request(420, 70)

    # grid.add(btngparted)
    if username == user:
        grid = Gtk.Grid()
        grid.attach(self.bntmirrors, 4, 2, 2, 2)
        #grid.attach(btnroletools, 2, 0, 2, 2)
        grid.attach(btngparted, 2, 2, 2, 2)
        #grid.attach(buttonkeys, 1, 4, 2, 2)
        #grid.attach(button2, 1, 4, 2, 2)
        #grid.attach(btnonlinstall, 3, 4, 2, 2)
        #grid.attach(btnofflinstall, 1, 2, 2, 2)
        grid.attach(btnonlinstall, 3, 0, 2, 2)
        grid.set_column_homogeneous(True)
        grid.set_row_homogeneous(True)

    else:

        #First Top Level Buttons
        self.buttonhtb.set_size_request(300, 50)
        self.buttontools.set_size_request(300, 50)
        hboxmiddle.pack_start(self.buttonhtb, True, False, 0)
        hboxmiddle.pack_start(self.buttontools, True, False, 0)
        #Second Top Level Buttons
        grid = Gtk.Box(orientation=Gtk.Orientation.HORIZONTAL, spacing=10)
        self.buttonrtm.set_size_request(300, 70)
        self.bntmirrors.set_size_request(300, 70)
        ##self.buttonatt.set_size_request(300, 70)
        
        
        #self.buttonpamac.set_size_request(300, 70)
        #grid.pack_start(self.buttonpamac, True, False, 0)
        ##grid.pack_start(self.buttonatt, True, False, 0)
        grid.pack_start(self.buttonrtm, True, False, 0)
        grid.pack_start(self.bntmirrors, True, False, 0)
        hbox1.pack_end(role_combo, False, False, 0) #pack_end means starting from right position
        
    # grid.set_row_homogeneous(True)

    # ======================================================================
    #                   NOTICE
    # ======================================================================

    # label3 = Gtk.Label(xalign=0)
    # label3.set_line_wrap(True)

    # label4 = Gtk.Label(xalign=0)
    # label4.set_line_wrap(True)

    # self.vbox2 = Gtk.Box(orientation=Gtk.Orientation.VERTICAL, spacing=10)

    # self.vbox2.pack_start(label3, False,False,0)
    # self.vbox2.pack_start(label4, False,False,0)

    # ======================================================================
    #                   USER INFO
    # ======================================================================

    lblusrname = Gtk.Label(xalign=0)
    lblusrname.set_text("User:")

    lblpassword = Gtk.Label(xalign=0)
    lblpassword.set_text("Pass:")

    lblusr = Gtk.Label(xalign=0)
    lblusr.set_text("liveuser  |")

    lblpass = Gtk.Label(xalign=0)
    lblpass.set_markup("<i>No Password</i>")

    hboxUser = Gtk.Box(orientation=Gtk.Orientation.HORIZONTAL, spacing=10)

    hboxUser.pack_start(lblusrname, False, False, 0)
    hboxUser.pack_start(lblusr, False, False, 0)

    hboxUser.pack_start(lblpassword, False, False, 0)
    hboxUser.pack_start(lblpass, False, False, 0)

    # ======================================================================
    #                   FOOTER BUTTON LINKS
    # ======================================================================

    ###########################################
    #       First Line Footer Buttons        #
    ###########################################
    if username != user:
        btnroletools = Gtk.Button(label="Show Tools for Roles")
        btnroletools.connect("clicked", self.on_buttonroletools_clicked)
        btnroletools.set_tooltip_markup("Show all the tools for each role")
        btnroletools.set_size_request(300, 0)
 
        buttonupdate = Gtk.Button(label="Upgrade Athena")
        buttonupdate.connect("clicked", self.on_buttonupdate_clicked)
        buttonupdate.set_tooltip_markup("Upgrade Athena")
        buttonupdate.set_size_request(300, 0)

        button14 = Gtk.Button(label="Hacking Variables")
        button14.connect("clicked", self.on_buttonhv_clicked)
        button14.set_tooltip_markup("Show the hacking variables")
        button14.set_size_request(300, 0)

        hbox11.pack_start(btnroletools, True, True, 0)
        hbox11.pack_start(buttonupdate, True, True, 0)
        hbox11.pack_end(button14, True, True, 0)

    ###########################################
    #       Second Line Footer Buttons        #
    ###########################################

    button3 = Gtk.Button(label="Release info")
    button3.connect("clicked", self.on_link_clicked,
                    "https://github.com/Athena-OS/athena-iso/releases")
    button3.set_size_request(200, 50)

    button4 = Gtk.Button(label="Athena OS project")
    button4.connect("clicked", self.on_link_clicked,
                    "https://github.com/Athena-OS")
    button4.set_size_request(200, 50)

    button5 = Gtk.Button(label="Open a ticket")
    button5.connect("clicked", self.on_link_clicked,
                    "https://github.com/Athena-OS/athena-iso/issues/new/choose")
    button5.set_size_request(200, 50)

    hbox2.pack_start(button3, True, True, 0)
    hbox2.pack_start(button4, True, True, 0)
    hbox2.pack_start(button5, True, True, 0)

    ###########################################
    #       Third Line Footer Buttons        #
    ###########################################

    btndiscord = Gtk.Button(label="Discord")
    btndiscord.connect("clicked", self.on_link_clicked,
                    "https://discord.gg/athena-os-977645785170714644")

    button9 = Gtk.Button(label="Video Demo")
    button9.connect("clicked", self.on_link_clicked,
                     "https://www.youtube.com/watch?v=4_ZY9Tj4U_8")

    button10 = Gtk.Button(label="")
    button10_label = button10.get_child()
    button10_label.set_markup("<b>Donate</b>")
    button10.connect("clicked", self.on_link_clicked,
                    "https://github.com/sponsors/Athena-OS")

    button11 = Gtk.Button(label="Wiki")
    button11.connect("clicked", self.on_link_clicked,
                     "https://github.com/Athena-OS/athena-iso/wiki")

    button12 = Gtk.Button(label="Quit")
    button12.connect("clicked", Gtk.main_quit)
    button12.set_tooltip_markup("Quit the Athena Welcome")

    hbox5.pack_start(btndiscord, True, True, 0)
    hbox5.pack_start(button9, True, True, 0)
    hbox5.pack_start(button10, True, True, 0)
    hbox5.pack_start(button11, True, True, 0)
    hbox5.pack_start(button12, True, True, 0)


    # hbox8.pack_start(self.btndiscord, True, False, 0)

    # ======================================================================
    #                   Add to startup
    # ======================================================================

    check = Gtk.CheckButton(label="Autostart")
    check.connect("toggled", self.statup_toggle)
    check.set_active(autostart)
    hbox3.pack_end(check, False, False, 0)

    # ======================================================================
    #                   SOCIAL LINKS
    # ======================================================================
    #fbE = Gtk.EventBox()
    #tE = Gtk.EventBox()
    #meE = Gtk.EventBox()
    #inE = Gtk.EventBox()
    #liE = Gtk.EventBox()
    #pE = Gtk.EventBox()
    #yE = Gtk.EventBox()
    #dE = Gtk.EventBox()
    #tgE = Gtk.EventBox()
    #elE = Gtk.EventBox()

    #pbfb = GdkPixbuf.Pixbuf().new_from_file_at_size(
    #    os.path.join(base_dir, 'images/facebook.png'), 28, 28)
    #fbimage = Gtk.Image().new_from_pixbuf(pbfb)

    #pbt = GdkPixbuf.Pixbuf().new_from_file_at_size(
    #    os.path.join(base_dir, 'images/twitter.png'), 28, 28)
    #timage = Gtk.Image().new_from_pixbuf(pbt)

    #pbme = GdkPixbuf.Pixbuf().new_from_file_at_size(
    #    os.path.join(base_dir, 'images/mewe.png'), 23, 23)
    #meimage = Gtk.Image().new_from_pixbuf(pbme)

    #pbin = GdkPixbuf.Pixbuf().new_from_file_at_size(
    #    os.path.join(base_dir, 'images/insta.png'), 28, 28)
    #inimage = Gtk.Image().new_from_pixbuf(pbin)

    #pbli = GdkPixbuf.Pixbuf().new_from_file_at_size(
    #    os.path.join(base_dir, 'images/linkedin.png'), 28, 28)
    #liimage = Gtk.Image().new_from_pixbuf(pbli)

    #pbp = GdkPixbuf.Pixbuf().new_from_file_at_size(
    #    os.path.join(base_dir, 'images/patreon.png'), 28, 28)
    #pimage = Gtk.Image().new_from_pixbuf(pbp)

    #pby = GdkPixbuf.Pixbuf().new_from_file_at_size(
    #    os.path.join(base_dir, 'images/youtube.png'), 28, 28)
    #yimage = Gtk.Image().new_from_pixbuf(pby)

    #pbd = GdkPixbuf.Pixbuf().new_from_file_at_size(
    #    os.path.join(base_dir, 'images/discord.png'), 28, 28)
    #dimage = Gtk.Image().new_from_pixbuf(pbd)

    #pbtg = GdkPixbuf.Pixbuf().new_from_file_at_size(
    #    os.path.join(base_dir, 'images/tg.png'), 28, 28)
    #tgimage = Gtk.Image().new_from_pixbuf(pbtg)

    #pbel = GdkPixbuf.Pixbuf().new_from_file_at_size(
    #    os.path.join(base_dir, 'images/element.png'), 28, 28)
    #elimage = Gtk.Image().new_from_pixbuf(pbel)

    #fbE.add(fbimage)
    #tE.add(timage)
    #meE.add(meimage)
    #inE.add(inimage)
    #liE.add(liimage)
    #pE.add(pimage)
    #yE.add(yimage)
    #dE.add(dimage)
    #tgE.add(tgimage)
    #elE.add(elimage)

    #fbE.connect("button_press_event", self.on_social_clicked,
    #            "https://www.facebook.com/groups/arcolinux")
    #tE.connect("button_press_event", self.on_social_clicked,
    #           "https://twitter.com/arcolinux")
    #meE.connect("button_press_event", self.on_social_clicked,
    #            "https://mewe.com/group/5bbc4577a40f3002b313671d")
    #inE.connect("button_press_event", self.on_social_clicked,
    #            "https://www.instagram.com/arcolinux/")
    #liE.connect("button_press_event", self.on_social_clicked,
    #            "https://www.linkedin.com/in/arcolinux/")
    #pE.connect("button_press_event", self.on_social_clicked,
    #           "https://www.patreon.com/arcolinux")
    #yE.connect("button_press_event", self.on_social_clicked,
    #           "https://youtube.com/c/erikdubois")
    #dE.connect("button_press_event", self.on_social_clicked,
    #           "https://discordapp.com/invite/R2amEEz")
    #tgE.connect("button_press_event", self.on_social_clicked,
    #            "https://t.me/arcolinux_d_b")
    #elE.connect("button_press_event", self.on_social_clicked,
    #            "https://app.element.io/#/room/!jUDkosOsuDbGWNzKYl:matrix.org")

    #fbE.set_property("has-tooltip", True)
    #tE.set_property("has-tooltip", True)
    #meE.set_property("has-tooltip", True)
    #inE.set_property("has-tooltip", True)
    #liE.set_property("has-tooltip", True)
    #pE.set_property("has-tooltip", True)
    #yE.set_property("has-tooltip", True)
    #dE.set_property("has-tooltip", True)
    #tgE.set_property("has-tooltip", True)
    #elE.set_property("has-tooltip", True)

    #fbE.connect("query-tooltip", self.tooltip_callback, "Facebook")
    #tE.connect("query-tooltip", self.tooltip_callback, "Twitter")
    #meE.connect("query-tooltip", self.tooltip_callback, "Mewe")
    #inE.connect("query-tooltip", self.tooltip_callback, "Instagram")
    #liE.connect("query-tooltip", self.tooltip_callback, "LinkedIn")
    #pE.connect("query-tooltip", self.tooltip_callback, "Patreon")
    #yE.connect("query-tooltip", self.tooltip_callback, "Youtube")
    #dE.connect("query-tooltip", self.tooltip_callback, "Discord")
    #tgE.connect("query-tooltip", self.tooltip_callback, "Telegram")
    #elE.connect("query-tooltip", self.tooltip_callback, "Element-Matrix")

    #hbox3.pack_start(fbE, False, False, 0)
    #hbox3.pack_start(tE, False, False, 0)
    #hbox3.pack_start(meE, False, False, 0)
    #hbox3.pack_start(inE, False, False, 0)
    #hbox3.pack_start(liE, False, False, 0)
    #hbox3.pack_start(elE, False, False, 0)

    #hbox6.pack_start(pE, False, False, 50)
    #hbox6.pack_start(yE, False, False, 0)
    #hbox6.pack_start(dE, False, False, 0)
    #hbox6.pack_start(tgE, False, False, 0)
    #if username == user:
    #    hbox3.pack_start(hboxUser, True, False, 0)
    #hbox3.pack_start(hbox6, True, False, 0)

    # ======================================================================
    #                   Start Athena Tweak Tool
    # ======================================================================
    launchBox = Gtk.EventBox()
    pblaunch = GdkPixbuf.Pixbuf().new_from_file_at_size(
        os.path.join(base_dir, 'images/archlinux-tweak-tool.svg'), 40, 40)
    launchimage = Gtk.Image().new_from_pixbuf(pblaunch)

    launchBox.add(launchimage)
    launchBox.connect("button_press_event", self.on_launch_clicked, "")

    launchBox.set_property("has-tooltip", True)
    launchBox.connect("query-tooltip",
                      self.tooltip_callback,
                      "Launch Athena Tweak Tool")

    hbox6.pack_start(launchBox, False, False, 0)
    #hbox6.pack_start(infoE, False, False, 0)
    # ======================================================================
    #                   PACK TO WINDOW
    # ======================================================================
    label3 = Gtk.Label("v20.6-4")
    hbox7.pack_end(label3, False, False, 0)
    # if self.is_connected():
    #     self.get_message(label3, label4)

    self.vbox.pack_start(hbox1, False, False, 7)  # Logo on the left and ComboBox on the right
    self.vbox.pack_start(hbox4, False, False, 7)  # welcome Label
    self.vbox.pack_start(hbox8, False, False, 7)  # warning Label

    self.vbox.pack_start(hboxmiddle, False, False, 7)  # HTB Update and Tool list buttons grid

    self.vbox.pack_start(grid, True, False, 7)  # Run GParted/Aegis

    # if self.results and self.is_connected():
    #     self.vbox.pack_start(self.vbox2, False, False, 0)  # Notice

    self.vbox.pack_end(hbox3, False, False, 0)  # Footer
    #self.vbox.pack_end(hbox7, False, False, 0)  # Version
    self.vbox.pack_end(hbox5, False, False, 7)  # Buttons
    self.vbox.pack_end(hbox2, False, False, 7)  # Buttons
    self.vbox.pack_end(hbox11, False, False, 7)  # Buttons
