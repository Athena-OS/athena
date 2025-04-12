# ============================================================
# Authors: Brad Heffernan - Erik Dubois - Cameron Percival
# ============================================================
# pylint:disable=C0115,C0116,I1101

import gi
from gi.repository import Gtk, GdkPixbuf
import functions as fn


gi.require_version("Gtk", "3.0")

base_dir = fn.path.dirname(fn.path.realpath(__file__))


class Support(Gtk.Dialog):
    def __init__(self, parent):
        Gtk.Dialog.__init__(self, "Credits - Support Development", parent, 0)

        self.set_size_request(550, 100)
        vbox = Gtk.Box(orientation=Gtk.Orientation.VERTICAL, spacing=10)

        hbox = Gtk.Box(orientation=Gtk.Orientation.HORIZONTAL, spacing=10)
        hbox1 = Gtk.Box(orientation=Gtk.Orientation.HORIZONTAL, spacing=10)
        hbox2 = Gtk.Box(orientation=Gtk.Orientation.HORIZONTAL, spacing=10)
        hbox3 = Gtk.Box(orientation=Gtk.Orientation.HORIZONTAL, spacing=10)

        box = self.get_content_area()
        box.pack_start(vbox, False, False, 0)

        label = Gtk.Label()
        label.set_line_wrap(True)
        label.set_justify(Gtk.Justification.CENTER)
        label.set_markup(
            "Inspired by ArchLinux Tweak Tool.\n\
You can receive support via <b>Discord channel</b>.\n\
You can support the project with providing code, fixes, ideas via GitHub.\n\
Feel free to express your thoughts and enjoy on Athena OS!"
        )

        label2 = Gtk.Label()
        label2.set_justify(Gtk.Justification.CENTER)
        label2.set_markup("Support <b>Athena OS</b>")

        logo = GdkPixbuf.Pixbuf().new_from_file_at_size(
            fn.path.join(base_dir, "images/athena-dark.svg"), 100, 100
        )
        logo_image = Gtk.Image().new_from_pixbuf(logo)

        # ghE = Gtk.EventBox()  # github
        # discE = Gtk.EventBox()  # discord

        donate_eventbox = Gtk.EventBox()  # paypal
        pbdisc = GdkPixbuf.Pixbuf().new_from_file_at_size(
            fn.path.join(base_dir, "images/donate.png"), 54, 54
        )
        ppimage = Gtk.Image().new_from_pixbuf(pbdisc)
        donate_eventbox.add(ppimage)
        donate_eventbox.connect(
            "button_press_event",
            self.on_support_click,
            "https://github.com/sponsors/Athena-OS",
        )
        donate_eventbox.set_property("has-tooltip", True)
        donate_eventbox.connect(
            "query-tooltip", self.tooltip_callback, "Sponsor the project"
        )

        patreon_eventbox = Gtk.EventBox()  # patreon
        pbp = GdkPixbuf.Pixbuf().new_from_file_at_size(
            fn.path.join(base_dir, "images/patreon.png"), 48, 48
        )
        pimage = Gtk.Image().new_from_pixbuf(pbp)
        patreon_eventbox.add(pimage)
        patreon_eventbox.connect(
            "button_press_event",
            self.on_support_click,
            "https://www.patreon.com/arcolinux",
        )
        patreon_eventbox.set_property("has-tooltip", True)
        patreon_eventbox.connect(
            "query-tooltip", self.tooltip_callback, "Support ArcoLinux on Patreon"
        )

        paypal_eventbox = Gtk.EventBox()  # paypal
        pbpp = GdkPixbuf.Pixbuf().new_from_file_at_size(
            fn.path.join(base_dir, "images/paypal.png"), 54, 54
        )
        ppimage = Gtk.Image().new_from_pixbuf(pbpp)
        paypal_eventbox.add(ppimage)
        paypal_eventbox.connect(
            "button_press_event",
            self.on_support_click,
            "https://www.paypal.com/paypalme/arcolinuxpaypal",
        )
        paypal_eventbox.set_property("has-tooltip", True)
        paypal_eventbox.connect(
            "query-tooltip", self.tooltip_callback, "Donate to this project via paypal"
        )

        discord_eventbox = Gtk.EventBox()  # paypal
        pbdisc = GdkPixbuf.Pixbuf().new_from_file_at_size(
            fn.path.join(base_dir, "images/discord.png"), 54, 54
        )
        ppimage = Gtk.Image().new_from_pixbuf(pbdisc)
        discord_eventbox.add(ppimage)
        discord_eventbox.connect(
            "button_press_event", self.on_support_click, "https://discord.gg/athena-os-977645785170714644"
        )
        discord_eventbox.set_property("has-tooltip", True)
        discord_eventbox.connect(
            "query-tooltip", self.tooltip_callback, "Get ATT support on Discord"
        )

        github_eventbox = Gtk.EventBox()  # paypal
        pbghub = GdkPixbuf.Pixbuf().new_from_file_at_size(
            fn.path.join(base_dir, "images/github.png"), 54, 54
        )
        ppimage = Gtk.Image().new_from_pixbuf(pbghub)
        github_eventbox.add(ppimage)
        github_eventbox.connect(
            "button_press_event",
            self.on_support_click,
            "https://github.com/arcolinux/archlinux-tweak-tool-dev",
        )
        github_eventbox.set_property("has-tooltip", True)
        github_eventbox.connect(
            "query-tooltip",
            self.tooltip_callback,
            "Donate time and code to this project",
        )

        # vbox1 = Gtk.Box(orientation=Gtk.Orientation.VERTICAL, spacing=6)

        hbox.pack_start(label, True, True, 10)
        hbox2.pack_start(donate_eventbox, False, False, 10)
        hbox2.pack_start(github_eventbox, False, False, 10)
        #hbox2.pack_start(patreon_eventbox, False, False, 0)
        #hbox2.pack_start(paypal_eventbox, False, False, 10)
        hbox2.pack_start(discord_eventbox, False, False, 10)
        hbox3.pack_start(hbox2, True, False, 0)

        vbox.pack_start(logo_image, False, False, 10)
        vbox.pack_start(hbox, False, False, 10)

        vbox.pack_end(hbox3, False, False, 10)
        vbox.pack_end(hbox1, False, False, 0)
        vbox.pack_end(label2, False, False, 10)

        self.show_all()

    def on_support_click(self, widget, event, link):
        thread = fn.threading.Thread(target=self.weblink, args=(link,))
        thread.daemon = True
        thread.start()

    def weblink(self, link):
        if fn.check_package_installed("firefox"):
            fn.subprocess.call(
                [
                    "sudo",
                    "-H",
                    "-u",
                    fn.sudo_username,
                    "bash",
                    "-c",
                    "firefox --new-tab " + link,
                ],
                shell=False,
            )
        else:
            if fn.check_package_installed("chromium"):
                fn.subprocess.call(
                    [
                        "sudo",
                        "-H",
                        "-u",
                        fn.sudo_username,
                        "bash",
                        "-c",
                        "chromium " + link,
                    ],
                    shell=False,
                )
            else:
                fn.subprocess.call(
                    [
                        "sudo",
                        "-H",
                        "-u",
                        fn.sudo_username,
                        "bash",
                        "-c",
                        "exo-open " + link,
                    ],
                    shell=False,
                )

    def tooltip_callback(self, widget, x, y, keyboard_mode, tooltip, text):
        tooltip.set_text(text)
        return True
