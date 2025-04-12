# ============================================================
# Authors: Brad Heffernan - Erik Dubois - Cameron Percival
# ============================================================

import functions as fn
import gi

gi.require_version("Gtk", "3.0")
from gi.repository import Gtk

base_dir = fn.os.path.abspath(fn.os.path.join(fn.os.path.dirname(__file__), ".."))


class PackagesPromptGui(Gtk.Dialog):
    def __init__(self, packages):
        """create a gui"""
        try:
            Gtk.Dialog.__init__(self)

            title = "Athena Tweak Tool: Confirm package installation"

            headerbar = Gtk.HeaderBar()
            headerbar.set_title(title)
            headerbar.set_show_close_button(True)

            self.set_resizable(True)
            self.set_border_width(10)
            self.set_titlebar(headerbar)

            button_yes = self.add_button("Yes", Gtk.ResponseType.OK)
            button_yes.set_size_request(100, 30)
            btn_yes_context = button_yes.get_style_context()
            btn_yes_context.add_class("destructive-action")

            button_no = self.add_button("No", Gtk.ResponseType.CANCEL)
            button_no.set_size_request(100, 30)

            self.connect("response", on_response, self)

            self.set_icon_from_file(
                fn.os.path.join(
                    base_dir, "athena-tweak-tool/images/athena-dark.svg"
                )
            )

            infobar = Gtk.InfoBar()

            lbl_title_message = Gtk.Label(xalign=0, yalign=0)
            lbl_title_message.set_markup(
                "There are <b>%s</b> packages to install, proceed ?" % len(packages)
            )
            content = infobar.get_content_area()
            content.add(lbl_title_message)

            infobar.set_revealed(True)

            lbl_padding1 = Gtk.Label(xalign=0, yalign=0)
            lbl_padding1.set_text("")

            lbl_padding2 = Gtk.Label(xalign=0, yalign=0)
            lbl_padding2.set_text("")

            grid_message = Gtk.Grid()

            grid_message.attach(infobar, 0, 0, 1, 1)
            grid_message.attach(lbl_padding1, 0, 1, 1, 1)

            scrolled_window = Gtk.ScrolledWindow()
            textview = Gtk.TextView()
            textview.set_name("textview_log")
            textview.set_property("editable", False)
            textview.set_property("monospace", True)
            textview.set_border_width(10)
            textview.set_vexpand(True)
            textview.set_hexpand(True)

            msg_buffer = textview.get_buffer()
            msg_buffer.insert(
                msg_buffer.get_end_iter(),
                "\n Click Yes to confirm install of the following packages:\n\n",
            )
            # fill the textview buffer with a list of packages to install

            for package in sorted(packages):
                msg_buffer.insert(msg_buffer.get_end_iter(), " - %s\n" % package)

            # move focus away from the textview, to hide the cursor at load
            headerbar.set_property("can-focus", True)
            Gtk.Window.grab_focus(headerbar)

            scrolled_window.add(textview)

            grid_message.attach(scrolled_window, 0, 2, 1, 1)
            grid_message.attach(lbl_padding2, 0, 3, 1, 1)

            self.set_default_size(800, 600)

            self.vbox.add(grid_message)

        except Exception as e:
            fn.logger.error("Exception in packages_list.gui(): %s" % e)


def on_response(self, response, dialog):
    return response
