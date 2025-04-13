# =================================================================
# =          Authors: Brad Heffernan & Erik Dubois                =
# =================================================================

import os
import getpass
import shutil
from os.path import expanduser
from ui.Stack import Stack
from ui.StackSwitcher import StackSwitcher

debug = False

base_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
home = expanduser("~")
username = getpass.getuser()

app_discord = "https://discord.gg/athena-os-977645785170714644"
app_website = "https://athenaos.org/"
app_github = "https://github.com/Athena-OS/athena"
app_ticket = "https://github.com/Athena-OS/athena/issues"
app_forums = "https://www.arcolinuxforum.com"
app_telegram = "https://t.me/arcolinux_d_b"
app_youtube = "https://www.youtube.com/erikdubois"
app_instagram = "https://www.instagram.com/athenaos_sec"
linkedin_devel = "https://www.linkedin.com/in/antoniovoza/"
sponsorship_github = "https://github.com/sponsors/Athena-OS"

if debug:
    user = username
else:
    user = "liveuser"

Settings = home + "/.config/athena-welcome/settings.conf"
Skel_Settings = "/etc/skel/.config/athena-welcome/settings.conf"
dot_desktop = "/usr/share/applications/athena-welcome.desktop"
autostart = home + "/.config/autostart/athena-welcome.desktop"

def command_exists(command):
    return shutil.which(command) is not None

def GUI(self, Gtk, GdkPixbuf):
    # initialize main vbox
    self.vbox = Gtk.Box(orientation=Gtk.Orientation.VERTICAL, spacing=0)
    self.vbox.set_halign(Gtk.Align.CENTER)
    self.add(self.vbox)

    headerbar = Gtk.HeaderBar()
    headerbar.set_title("Athena Welcome")
    headerbar.set_show_close_button(True)

    self.set_titlebar(headerbar)

    # x11 shows icon inside headerbar twice, only set icon when on wayland
    if self.session is not None:
        if self.session == "wayland":
            headerbar.pack_start(
                Gtk.Image().new_from_pixbuf(
                    GdkPixbuf.Pixbuf().new_from_file_at_size(
                        os.path.join(base_dir, "images/athenaos.svg"), 16, 16
                    )
                )
            )

    # initialize the stack
    stack = Stack(transition_type="CROSSFADE")

    # initialize the stack-switcher
    stack_switcher = StackSwitcher(stack)

    vbox_stack_sidebar = Gtk.Box(orientation=Gtk.Orientation.VERTICAL, spacing=10)
    vbox_stack_sidebar.set_name("stack_box")

    vbox_stack_sidebar.add(stack_switcher)
    vbox_stack_sidebar.add(stack)

    self.vbox.add(vbox_stack_sidebar)
    
    # initialize role combobox
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
        "🌐 Network Analyst 🌐",
        "🕵️ OSINT Specialist 🕵️",
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
    
    # vbox to contain all the installation controls
    vbox_install_stack = Gtk.Box(orientation=Gtk.Orientation.VERTICAL, spacing=5)
    vbox_install_stack.set_halign(Gtk.Align.CENTER)

    combobox_stack = Gtk.Box(orientation=Gtk.Orientation.HORIZONTAL, spacing=0)
    combobox_stack.set_halign(Gtk.Align.END) # END means ComboBox on the right

    hbox_install_buttons = Gtk.Box(orientation=Gtk.Orientation.HORIZONTAL, spacing=5)
    hbox_install_buttons.set_halign(Gtk.Align.CENTER)

    hbox_userinfo_buttons = Gtk.Box(orientation=Gtk.Orientation.HORIZONTAL, spacing=5)
    hbox_userinfo_buttons.set_halign(Gtk.Align.CENTER)

    vbox_quit = Gtk.Box(orientation=Gtk.Orientation.VERTICAL, spacing=5)
    vbox_quit.set_halign(Gtk.Align.CENTER)

    hbox_util_buttons = Gtk.Box(orientation=Gtk.Orientation.HORIZONTAL, spacing=5)
    hbox_util_buttons.set_halign(Gtk.Align.CENTER)

    vbox_welcome_title = Gtk.Box(orientation=Gtk.Orientation.VERTICAL, spacing=0)
    vbox_welcome_title.set_halign(Gtk.Align.CENTER)

    vbox_welcome_message = Gtk.Box(orientation=Gtk.Orientation.VERTICAL, spacing=0)
    vbox_welcome_message.set_halign(Gtk.Align.CENTER)

    # Here it is actually defined the position of buttons inside the Welcome tab
    vbox_install_stack.pack_start(combobox_stack, False, False, 0)
    vbox_install_stack.pack_start(vbox_welcome_title, False, False, 0)
    vbox_install_stack.pack_start(vbox_welcome_message, False, False, 0)
    vbox_install_stack.pack_start(hbox_install_buttons, False, False, 0)
    # vbox_install_stack.pack_start(hbox_second_row_buttons, False, False, 0)
    vbox_install_stack.pack_start(hbox_util_buttons, False, False, 0)
    vbox_install_stack.pack_start(hbox_userinfo_buttons, False, False, 15)
    vbox_install_stack.pack_start(vbox_quit, False, False, 0)

    # vbox to contain all the information text
    vbox_info_stack = Gtk.Box(orientation=Gtk.Orientation.VERTICAL, spacing=5)
    vbox_info_stack.set_halign(Gtk.Align.CENTER)

    vbox_info = Gtk.Box(orientation=Gtk.Orientation.VERTICAL, spacing=5)
    vbox_info_stack.pack_start(vbox_info, False, False, 0)
    
    # vbox to contain credits text
    vbox_credits_stack = Gtk.Box(orientation=Gtk.Orientation.VERTICAL, spacing=5)
    vbox_credits_stack.set_halign(Gtk.Align.CENTER)

    vbox_credits = Gtk.Box(orientation=Gtk.Orientation.VERTICAL, spacing=5)
    vbox_credits_stack.pack_start(vbox_credits, False, False, 0)

    hbox_social_links = Gtk.Box(orientation=Gtk.Orientation.HORIZONTAL, spacing=5)
    hbox_social_links.set_halign(Gtk.Align.CENTER)

    # social links with images
    hbox_social_img = Gtk.Box(orientation=Gtk.Orientation.HORIZONTAL, spacing=5)
    hbox_social_img.set_halign(Gtk.Align.CENTER)

    label_discord = Gtk.Label(xalign=0, yalign=0)
    label_discord.set_markup(
        "<a href='%s' title='%s'>%s</a>" % (app_discord, app_discord, "Discord")
    )

    #label_telegram = Gtk.Label(xalign=0, yalign=0)
    #label_telegram.set_markup(
    #    "<a href='%s' title='%s'>%s</a>" % (app_telegram, app_telegram, "Telegram")
    #)

    #label_youtube = Gtk.Label(xalign=0, yalign=0)
    #label_youtube.set_markup(
    #    "<a href='%s' title='%s'>%s</a>" % (app_youtube, app_youtube, "Youtube")
    #)

    #label_forums = Gtk.Label(xalign=0, yalign=0)
    #label_forums.set_markup(
    #    "<a href='%s' title='%s'>%s</a>" % (app_forums, app_forums, "Forums")
    #)

    # ======================================================================
    #                   SOCIAL LINKS
    # ======================================================================

    ## facebook
    #fb_event = Gtk.EventBox()
    #pbfb = GdkPixbuf.Pixbuf().new_from_file_at_size(
    #    os.path.join(base_dir, "images/facebook.png"), 28, 28
    #)
    #fbimage = Gtk.Image().new_from_pixbuf(pbfb)
    #fb_event.add(fbimage)
    #fb_event.connect(
    #    "button_press_event",
    #    self.on_social_clicked,
    #    "https://www.facebook.com/groups/arcolinux",
    #)

    ## telegram
    #tg_event = Gtk.EventBox()
    #pbtg = GdkPixbuf.Pixbuf().new_from_file_at_size(
    #    os.path.join(base_dir, "images/tg.png"), 28, 28
    #)
    #tgimage = Gtk.Image().new_from_pixbuf(pbtg)
    #tg_event.add(tgimage)
    #tg_event.connect(
    #    "button_press_event",
    #    self.on_social_clicked,
    #    app_telegram,
    #)

    ## twitter
    #tw_event = Gtk.EventBox()
    #pbtw = GdkPixbuf.Pixbuf().new_from_file_at_size(
    #    os.path.join(base_dir, "images/twitter.png"), 28, 28
    #)
    #twimage = Gtk.Image().new_from_pixbuf(pbtw)
    #tw_event.add(twimage)
    #tw_event.connect(
    #    "button_press_event",
    #    self.on_social_clicked,
    #    "https://twitter.com/arcolinux",
    #)

    ## mewe
    #mew_event = Gtk.EventBox()
    #pbmew = GdkPixbuf.Pixbuf().new_from_file_at_size(
    #    os.path.join(base_dir, "images/mewe.png"), 28, 28
    #)
    #mewimage = Gtk.Image().new_from_pixbuf(pbmew)
    #mew_event.add(mewimage)
    #mew_event.connect(
    #    "button_press_event",
    #    self.on_social_clicked,
    #    "https://mewe.com/group/5bbc4577a40f3002b313671d",
    #)

    # discord
    ds_event = Gtk.EventBox()
    pbds = GdkPixbuf.Pixbuf().new_from_file_at_size(
        os.path.join(base_dir, "images/discord.png"), 28, 28
    )
    dsimage = Gtk.Image().new_from_pixbuf(pbds)
    ds_event.add(dsimage)
    ds_event.connect(
        "button_press_event",
        self.on_social_clicked,
        app_discord,
    )

    ## youtube
    #yt_event = Gtk.EventBox()
    #pbyt = GdkPixbuf.Pixbuf().new_from_file_at_size(
    #    os.path.join(base_dir, "images/youtube.png"), 28, 28
    #)
    #ytimage = Gtk.Image().new_from_pixbuf(pbyt)
    #yt_event.add(ytimage)
    #yt_event.connect(
    #    "button_press_event",
    #    self.on_social_clicked,
    #    "https://youtube.com/c/erikdubois",
    #)

    # instagram
    insta_event = Gtk.EventBox()
    pbinsta = GdkPixbuf.Pixbuf().new_from_file_at_size(
        os.path.join(base_dir, "images/insta.png"), 28, 28
    )
    instaimage = Gtk.Image().new_from_pixbuf(pbinsta)
    insta_event.add(instaimage)
    insta_event.connect(
        "button_press_event",
        self.on_social_clicked,
        app_instagram,
    )

    ## linkedin
    #lin_event = Gtk.EventBox()
    #pblin = GdkPixbuf.Pixbuf().new_from_file_at_size(
    #    os.path.join(base_dir, "images/linkedin.png"), 28, 28
    #)
    #linimage = Gtk.Image().new_from_pixbuf(pblin)
    #lin_event.add(linimage)
    #lin_event.connect(
    #    "button_press_event",
    #    self.on_social_clicked,
    #    "https://www.linkedin.com/in/arcolinux/",
    #)

    ## patreon
    #pat_event = Gtk.EventBox()
    #pbpat = GdkPixbuf.Pixbuf().new_from_file_at_size(
    #    os.path.join(base_dir, "images/patreon.png"), 28, 28
    #)
    #patimage = Gtk.Image().new_from_pixbuf(pbpat)
    #pat_event.add(patimage)
    #pat_event.connect(
    #    "button_press_event",
    #    self.on_social_clicked,
    #    "https://www.patreon.com/arcolinux",
    #)

    ## element
    #el_event = Gtk.EventBox()
    #pbel = GdkPixbuf.Pixbuf().new_from_file_at_size(
    #    os.path.join(base_dir, "images/element.png"), 28, 28
    #)
    #elimage = Gtk.Image().new_from_pixbuf(pbel)
    #el_event.add(elimage)
    #el_event.connect(
    #    "button_press_event",
    #    self.on_social_clicked,
    #    "https://app.element.io/#/room/!jUDkosOsuDbGWNzKYl:matrix.org",
    #)

    ## att
    #att_event = Gtk.EventBox()
    #pbatt = GdkPixbuf.Pixbuf().new_from_file_at_size(
    #    os.path.join(base_dir, "images/archlinux-tweak-tool.svg"), 28, 28
    #)
    #attimage = Gtk.Image().new_from_pixbuf(pbatt)
    #att_event.add(attimage)
    #att_event.connect("button_press_event", self.on_launch_clicked, "")

    label_social_padding = Gtk.Label(xalign=0, yalign=0)
    label_social_padding.set_text("     ")

    # tooltips
    #fb_event.set_property("has-tooltip", True)
    #tw_event.set_property("has-tooltip", True)
    #mew_event.set_property("has-tooltip", True)
    insta_event.set_property("has-tooltip", True)
    #lin_event.set_property("has-tooltip", True)
    #el_event.set_property("has-tooltip", True)
    #pat_event.set_property("has-tooltip", True)
    #yt_event.set_property("has-tooltip", True)
    ds_event.set_property("has-tooltip", True)
    #tg_event.set_property("has-tooltip", True)
    #att_event.set_property("has-tooltip", True)

    #fb_event.connect("query-tooltip", self.tooltip_callback, "Facebook")
    #tw_event.connect("query-tooltip", self.tooltip_callback, "Twitter")
    #mew_event.connect("query-tooltip", self.tooltip_callback, "Mewe")
    insta_event.connect("query-tooltip", self.tooltip_callback, "Instagram")
    #lin_event.connect("query-tooltip", self.tooltip_callback, "LinkedIn")
    #el_event.connect("query-tooltip", self.tooltip_callback, "Element")
    #el_event.connect("query-tooltip", self.tooltip_callback, "Element-Matrix")
    #pat_event.connect("query-tooltip", self.tooltip_callback, "Patreon")
    #yt_event.connect("query-tooltip", self.tooltip_callback, "YouTube")
    ds_event.connect("query-tooltip", self.tooltip_callback, "Discord")
    #tg_event.connect("query-tooltip", self.tooltip_callback, "Telegram")
    #att_event.connect("query-tooltip", self.tooltip_callback, "Arch Linux Tweak Tool")

    #hbox_social_img.add(fb_event)
    #hbox_social_img.add(tw_event)
    #hbox_social_img.add(mew_event)
    hbox_social_img.add(insta_event)
    #hbox_social_img.add(lin_event)
    #hbox_social_img.add(el_event)
    #hbox_social_img.add(pat_event)
    hbox_social_img.add(label_social_padding)
    #hbox_social_img.add(yt_event)
    hbox_social_img.add(ds_event)
    #hbox_social_img.add(tg_event)
    #hbox_social_img.add(att_event)

    label_info_header1 = Gtk.Label(xalign=0, yalign=0)
    label_info_header1.set_name("label_style")
    label_info_header1.set_justify(Gtk.Justification.CENTER)
    label_info_header1.set_halign(Gtk.Align.CENTER)

    label_info_header2 = Gtk.Label(xalign=0.5, yalign=0.5)
    label_info_header2.set_name("label_style")
    label_info_header2.set_justify(Gtk.Justification.CENTER)
    label_info_header2.set_halign(Gtk.Align.CENTER)
    label_info_header2.set_markup("<b>You have the freedom of choice</b>")

    label_info2 = Gtk.Label(xalign=0.5, yalign=0.5)
    label_info2.set_justify(Gtk.Justification.CENTER)

    if debug is True:
        label_info_header1.set_markup("<b>Athena OS Installer</b>")

        desc = (
            f"We advise to clean the computer with GParted before installing.\n"
            f"During the Calamares installation many options will be open to you.\n\n"
            f"<b>Easy installation</b> (Recommended) option is offline, no internet connection required\n"
            f"<b>Advanced installation</b> option is online, this requires a working internet connection"
        )

        #desc2 = (
        #    f"We communicate with our community via a diversity of social media.\n"
        #    f"Do join us to learn the latest news, ask questions or for casual talk.\n"
        #    f"Join us <b> <a href='{app_youtube}' title='{app_youtube}'>Youtube</a></b> as we communicate and teach via our Youtube channel.\n"
        #    f"<b> <a href='{app_telegram}' title='{app_telegram}'>Telegram</a></b> is for chitchat - <b> <a href='{app_discord}' title='{app_discord}'>Discord</a></b> is for assistance.\n"
        #    f"We have a <b> <a href='{app_forums}' title='{app_forums}'>Forum</a></b> for the longer and more technical questions.\n\n"
        #)
        desc2 = ("Choose your role and click the <b>Set Cyber Role</b> button to retrieve the main pentesting resources you need!\n\n" + #noqa
			  "Click <b>HTB Update</b> to set your Hack The Box API key and start your hacking experience!\n\n" + #noqa
                    
                          "Get started on Athena. We communicate with our community through <b><a href='{app_discord}' title='{app_discord}'>Discord</a></b> or <b><a href='{app_github}' title='{app_github}'>GitHub</a></b>.\n" + #noqa
                          "Join us to learn the latest news, ask questions or just for chatting.\n" +  # noqa
                          "Open a <b><a href='{app_ticket}' title='{app_ticket}'>ticket</a></b> for any issues or proposals.\n\n" +  # noqa
                          "Learn, study and have fun!")

        label_info2.set_markup(desc2)

    else:
        label_info_header1.set_markup("\n<b>Welcome to Athena OS</b>\n")
        desc = ("Choose your role and click the <b>Set Cyber Role</b> button to retrieve the main pentesting resources you need!\n\n" + #noqa
			  "Click <b>HTB Update</b> to set your Hack The Box API key and start your hacking experience!\n\n" + #noqa
                    
                          "Get started on Athena. We communicate with our community through <b><a href='{app_discord}' title='{app_discord}'>Discord</a></b> or <b><a href='{app_github}' title='{app_github}'>GitHub</a></b>.\n" + #noqa
                          "Join us to learn the latest news, ask questions or just for chatting.\n" +  # noqa
                          "Open a <b><a href='{app_ticket}' title='{app_ticket}'>ticket</a></b> for any issues or proposals.\n\n" +  # noqa
                          "Learn, study and have fun!")

    label_info = Gtk.Label(xalign=0, yalign=0)
    label_info.set_markup(desc)
    label_info.set_justify(Gtk.Justification.CENTER)

    # ======================================================================
    #                   PACK THE INFO BOX
    # ======================================================================

    vbox_info.pack_start(label_info_header1, False, False, 0)
    vbox_info.pack_start(label_info, False, False, 0)
    if len(label_info2.get_text()) > 0:
        vbox_info.pack_start(label_info_header2, False, False, 0)
        vbox_info.pack_start(label_info2, False, False, 0)

    vbox_info.pack_start(hbox_social_links, False, False, 0)
    vbox_info.pack_start(hbox_social_img, False, False, 0)

    # ======================================================================
    #                   ADD PAGES TO STACK
    # ======================================================================

    if debug is True:
        stack.add_titled(vbox_install_stack, "Installation", "Installation")
    else:
        stack.add_titled(vbox_install_stack, "Welcome", "Welcome")

    stack.add_titled(vbox_info_stack, "Information", "Information")
    stack.add_titled(vbox_credits_stack, "Credits", "Credits")

    autostart = eval(self.load_settings())

    hbox_notify = Gtk.Box(orientation=Gtk.Orientation.HORIZONTAL, spacing=0)
    hbox_notify.set_halign(Gtk.Align.CENTER)

    hbox_footer_buttons = Gtk.Box(orientation=Gtk.Orientation.HORIZONTAL, spacing=10)

    # ======================================================================
    #                   NOTIFY LABEL
    # ======================================================================

    self.label_notify = Gtk.Label(xalign=0.5, yalign=0.5)
    self.label_notify.set_justify(Gtk.Justification.CENTER)
    hbox_notify.pack_end(self.label_notify, False, False, 0)

    # ======================================================================
    #                   WELCOME LABEL
    # ======================================================================

    # label_welcome = Gtk.Label(xalign=0.5, yalign=0.5)
    # label_welcome.set_markup("<big>Welcome to <b>Athena OS</b></big>")
    self.cc = Gtk.Label()

    # ======================================================================
    #                  ATHENA IMAGE
    # ======================================================================
    if command_exists("pacman"):
        pixbuf = GdkPixbuf.Pixbuf().new_from_file_at_size(
            os.path.join(base_dir, "images/athena-arch-one-liner.png"), 512, 512
        )
    elif command_exists("nixos-rebuild"):
        pixbuf = GdkPixbuf.Pixbuf().new_from_file_at_size(
            os.path.join(base_dir, "images/athena-nix-one-liner.png"), 512, 512
        )
    image = Gtk.Image().new_from_pixbuf(pixbuf)

    # ======================================================================
    #                   WELCOME LABEL
    # ======================================================================

    label_welcome_message = Gtk.Label(xalign=0.5, yalign=0.5)
    label_welcome_message.set_name("label_style")

    if username == user:
        label_welcome_message.set_text(
            "Use the Easy Installation if the Advanced Installation fails"
        )
    else:
        label_welcome_message.set_text(
            "The buttons below will help you get started on Athena OS"
        )

    vbox_welcome_title.pack_start(image, True, False, 0)
    vbox_welcome_message.pack_start(label_welcome_message, True, False, 0)

    # ======================================================================
    #                   MAIN BUTTONS
    # ======================================================================

    # ======================================================================
    #                   BUTTON - GPARTED
    # ======================================================================

    button_gparted = Gtk.Button(label="")
    button_gparted_label = button_gparted.get_child()
    button_gparted_label.set_markup("<span size='large'><b>Run GParted</b></span>")
    button_gparted.connect("clicked", self.on_gp_clicked)
    button_gparted.set_size_request(100, 50)
    button_gparted.set_property("has-tooltip", True)
    button_gparted.connect("query-tooltip", self.tooltip_callback, "Launch GParted")

    # ======================================================================
    #                   BUTTON - INSTALL by TUI
    # ======================================================================

    self.button_install_tui = Gtk.Button(label="")
    button_install_tui_label = self.button_install_tui.get_child()
    button_install_tui_label.set_markup(
        "<span size='large'><b>Install Athena OS (TUI)</b></span>"
    )
    self.button_install_tui.connect("clicked", self.on_install_tui_clicked)
    self.button_install_tui.set_size_request(300, 60)
    self.button_install_tui.set_property("has-tooltip", True)
    self.button_install_tui.connect(
        "query-tooltip", self.tooltip_callback, "Install Athena OS by Aegis Terminal User Interface"
    )

    # ======================================================================
    #                   BUTTON - EASY INSTALL (OFFLINE)
    # ======================================================================

    #self.button_easy_install = Gtk.Button(label="")
    #button_easy_install_label = self.button_easy_install.get_child()
    #button_easy_install_label.set_markup(
    #    "<span size='large'><b>Easy Installation (Offline)</b></span>"
    #)
    #self.button_easy_install.connect("clicked", self.on_easy_install_clicked)
    #self.button_easy_install.set_size_request(300, 60)
    #self.button_easy_install.set_property("has-tooltip", True)
    #self.button_easy_install.connect(
    #    "query-tooltip", self.tooltip_callback, "No internet connection required"
    #)

    # ======================================================================
    #                   BUTTON - ADVANCED INSTALL (ONLINE)
    # ======================================================================

    #self.button_adv_install = Gtk.Button(label="")
    #button_adv_label = self.button_adv_install.get_child()

    #button_adv_label.set_markup(
    #    "<span size='large'><b>Advanced Installation (Online)</b></span>"
    #)
    #self.button_adv_install.connect("clicked", self.on_adv_install_clicked)
    #self.button_adv_install.set_size_request(300, 60)
    #self.button_adv_install.set_property("has-tooltip", True)
    #self.button_adv_install.connect(
    #    "query-tooltip", self.tooltip_callback, "Internet connection required"
    #)

    # ======================================================================
    #                   BUTTON - SET ROLE
    # ======================================================================

    self.button_roles = Gtk.Button(label="")
    button_roles_label = self.button_roles.get_child()

    button_roles_label.set_markup("<span size='large'><b>Set Cyber Role</b></span>")

    self.button_roles.connect("clicked", self.on_roles_clicked)
    self.button_roles.set_size_request(100, 50)
    self.button_roles.set_property("has-tooltip", True)
    self.button_roles.connect(
        "query-tooltip", self.tooltip_callback, "Set the selected Cyber Role"
    )

    # ======================================================================
    #                   BUTTON - HTB UPDATE
    # ======================================================================

    self.button_htb = Gtk.Button()
    grid = Gtk.Grid ()

    # Load the image
    try:
        pb = GdkPixbuf.Pixbuf.new_from_file_at_size("images/htb.png", 35, 35)
    except:
        pb = None
    image = Gtk.Image()
    image.set_from_pixbuf(pb)
    label = Gtk.Label (" <span size='large'><b>HTB Update</b></span> ")
    label.set_use_markup(True)
    grid.attach (image, 0, 0, 1, 1)
    grid.attach (label, 1, 0, 1, 1)
    grid.set_row_homogeneous(True) #This line is important for managing the centering of the row vertically
    grid.show_all ()    

    self.button_htb.add (grid)
    self.button_htb.set_size_request(100, 50)

    self.button_htb.connect("clicked", self.on_button_htb_clicked)
    self.button_htb.set_property("has-tooltip", True)
    self.button_htb.connect(
        "query-tooltip", self.tooltip_callback, "Launch HTB Toolkit update"
    )

    # ======================================================================
    #                   BUTTON - UPDATE OS
    # ======================================================================

    self.button_update = Gtk.Button(label="")
    button_update_label = self.button_update.get_child()
    button_update_label.set_markup("<span size='large'><b>Package Update</b></span>")
    self.button_update.set_size_request(100, 50)
    self.button_update.connect("clicked", self.on_button_update_clicked)
    self.button_update.set_property("has-tooltip", True)
    self.button_update.connect("query-tooltip", self.tooltip_callback, "Launch Athena Update")

    # ======================================================================
    #                   BUTTON - MIRRORS/CHANNEL
    # ======================================================================

    self.button_mirrors = Gtk.Button(label="")
    button_mirrors_label = self.button_mirrors.get_child()
    button_mirrors_label.set_markup("<span size='large'><b>Update Mirrors</b></span>")
    self.button_mirrors.set_size_request(100, 50)
    self.button_mirrors.set_property("has-tooltip", True)
    self.button_mirrors.connect("query-tooltip", self.tooltip_callback, "Update mirrors")
    self.button_mirrors.connect("clicked", self.on_mirror_clicked)

    # ======================================================================
    #                   USER INFO
    # ======================================================================

    label_creds = Gtk.Label(xalign=0)
    label_creds.set_markup("User: liveuser | Pass: <i>No Password</i>")
    label_creds.set_name("label_style")

    hbox_user = Gtk.Box(orientation=Gtk.Orientation.HORIZONTAL, spacing=5)

    hbox_user.pack_start(label_creds, False, False, 0)

    # ======================================================================
    #                   WELCOME TAB - BUTTON POSITION
    # ======================================================================
    # hbox_util_buttons and hbox_util_buttons elements are positioned in Welcome Tab. Check the first rows above about them
    if username == user:
        hbox_util_buttons.pack_start(self.button_mirrors, False, True, 0)
        hbox_util_buttons.pack_start(button_gparted, False, True, 0)

        hbox_install_buttons.pack_start(self.button_install_tui, True, True, 0)
        #hbox_install_buttons.pack_start(self.button_easy_install, True, True, 0)
        #hbox_install_buttons.pack_end(self.button_adv_install, True, True, 0)

        hbox_userinfo_buttons.pack_start(hbox_user, False, True, 0)

    else:
        combobox_stack.pack_start(role_combo, False, True, 0)
        hbox_install_buttons.pack_start(self.button_update, False, True, 0)
        hbox_install_buttons.pack_start(self.button_htb, False, True, 0)
        hbox_install_buttons.pack_start(self.button_roles, False, True, 0)
        hbox_install_buttons.pack_start(self.button_mirrors, False, True, 0)

        # self.button_arco_website = Gtk.Button(label="")
        # self.button_arco_website.get_child().set_markup("<b>Athena OS Website</b>")
        # self.button_arco_website.set_size_request(100, 30)
        #
        # self.button_probe = Gtk.Button(label="")
        # self.button_probe.get_child().set_markup("<b>Run Probe</b>")
        # self.button_probe.set_size_request(100, 30)

        # hbox_second_row_buttons.pack_start(self.button_arco_website,False,True,0)
        # hbox_second_row_buttons.pack_start(self.button_probe,False,True,0)

    # ======================================================================
    #                   CREDITS
    # ======================================================================

    label_credits_inspired = Gtk.Label(xalign=0.5, yalign=0.5)
    label_credits_inspired.set_name("label_style")
    label_credits_inspired.set_markup("\nInspired by <b>ArcoLinux Welcome App</b>\n")
    label_credits_inspired.set_halign(Gtk.Align.CENTER)
    label_credits_inspired.set_justify(Gtk.Justification.CENTER)

    label_credits_title = Gtk.Label(xalign=0.5, yalign=0.5)
    label_credits_title.set_name("label_style")
    label_credits_title.set_markup("<b>Development Team</b>")
    label_credits_title.set_halign(Gtk.Align.CENTER)
    label_credits_title.set_justify(Gtk.Justification.CENTER)

    label_credits_support = Gtk.Label(xalign=0.5, yalign=0.5)
    label_credits_support.set_name("label_style")
    label_credits_support.set_markup(
        f"Support Athena OS by <b><a href='{sponsorship_github}' title='{sponsorship_github}'>sponsoring the project</a></b>"
    )
    label_credits_support.set_halign(Gtk.Align.CENTER)
    label_credits_support.set_justify(Gtk.Justification.CENTER)

    label_credits = Gtk.Label(xalign=0, yalign=0)
    label_credits.set_markup(
        f"<b><a href='{linkedin_devel}' title='{linkedin_devel}'>Antonio Voza</a></b>\n"
    )
    label_credits.set_justify(Gtk.Justification.CENTER)
    label_credits.set_line_wrap(True)
    label_credits.set_halign(Gtk.Align.CENTER)

    label_thanks_title = Gtk.Label(xalign=0.5, yalign=0.5)
    label_thanks_title.set_name("label_style")
    label_thanks_title.set_markup("<b>Thanks to</b>")
    label_thanks_title.set_halign(Gtk.Align.CENTER)
    label_thanks_title.set_justify(Gtk.Justification.CENTER)

    label_thanks = Gtk.Label(xalign=0, yalign=0)
    label_thanks.set_markup(
        f"Brad Heffernan\n"
        f"Erik Dubois\n"
        f"Fennec\n"
    )
    label_thanks.set_justify(Gtk.Justification.CENTER)
    label_thanks.set_line_wrap(True)
    label_thanks.set_halign(Gtk.Align.CENTER)

    vbox_credits.pack_start(label_credits_inspired, False, False, 0)
    vbox_credits.pack_start(label_credits_title, False, False, 0)
    vbox_credits.pack_start(label_credits, False, False, 0)
    vbox_credits.pack_start(label_thanks_title, False, False, 0)
    vbox_credits.pack_start(label_thanks, False, False, 0)
    vbox_credits.pack_start(label_credits_support, False, False, 0)

    # ======================================================================
    #                   QUIT BUTTON
    # ======================================================================

    button_quit = Gtk.Button(label="")
    button_quit.get_child().set_markup("<b>Quit</b>")
    button_quit.set_size_request(100, 30)
    button_quit.connect("clicked", Gtk.main_quit)
    
    vbox_quit.pack_start(button_quit, False, False, 0)

    # ======================================================================
    #                   Add to startup
    # ======================================================================

    check = Gtk.CheckButton(label="Autostart")
    check.set_property("has-tooltip", True)
    check.connect(
        "query-tooltip",
        self.tooltip_callback,
        "Autostart Athena Welcome at login",
    )
    check.connect("toggled", self.startup_toggle)
    check.set_active(autostart)

    hbox_footer_buttons.set_halign(Gtk.Align.CENTER)

    if username == user:
        
        vbox_auto_start = Gtk.Box(orientation=Gtk.Orientation.VERTICAL, spacing=5)
        vbox_auto_start.set_halign(Gtk.Align.CENTER)
        vbox_auto_start.pack_end(check, True, False, 0)
        self.vbox.pack_end(vbox_auto_start, True, False, 0)
    else:
        hbox_footer_buttons.pack_end(check, False, False, 0)

    # ======================================================================
    #                   PACK TO WINDOW
    # ======================================================================

    self.vbox.pack_start(hbox_notify, False, False, 5)  # notify label
    self.vbox.pack_end(hbox_footer_buttons, False, False, 0)  # Footer
