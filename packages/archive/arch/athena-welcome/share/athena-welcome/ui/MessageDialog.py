# This class is only for constructing a Message Dialog

import os
import gi
import subprocess
import threading
from threading import Thread

gi.require_version("Gtk", "3.0")
from gi.repository import Gtk, GdkPixbuf

base_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))


# generic Message Dialog with yes/no buttons
class MessageDialog(Gtk.Dialog):
    def __init__(
        self,
        title,
        message,
    ):
        Gtk.Dialog.__init__(self)

        self.set_border_width(10)
        self.set_title(title)
        self.set_modal(True)

        self.set_resizable(False)

        self.response = False

        headerbar = Gtk.HeaderBar()
        headerbar.set_title(title)
        headerbar.set_show_close_button(True)

        headerbar.pack_start(
            Gtk.Image().new_from_pixbuf(
                GdkPixbuf.Pixbuf().new_from_file_at_size(
                    os.path.join(base_dir, "images/arcolinux.png"), 16, 16
                )
            )
        )

        self.set_titlebar(headerbar)

        btn_yes = Gtk.Button(label="Yes")
        btn_yes.set_size_request(100, 30)
        btn_yes.connect("clicked", self.on_md_yes_clicked)
        btn_yes.set_halign(Gtk.Align.END)

        btn_no = Gtk.Button(label="No")
        btn_no.set_size_request(100, 30)
        btn_no.connect("clicked", self.on_md_no_clicked)
        btn_no.set_halign(Gtk.Align.END)

        label_message = Gtk.Label(xalign=0.5, yalign=0.5)
        label_message.set_markup(message)

        hbox_buttons = Gtk.Box(orientation=Gtk.Orientation.HORIZONTAL, spacing=5)
        hbox_buttons.pack_start(btn_yes, False, False, 0)
        hbox_buttons.pack_start(btn_no, False, False, 0)

        hbox_buttons.set_halign(Gtk.Align.CENTER)

        self.vbox.set_spacing(5)

        self.vbox.add(label_message)

        self.vbox.add(hbox_buttons)

    def on_md_yes_clicked(self, widget):
        self.response = True
        self.destroy()

    def on_md_no_clicked(self, widget):
        self.response = False
        self.destroy()


class MessageDialogBootloader(Gtk.Dialog):
    def __init__(
        self,
        title,
        install_method,
        pacman_lockfile,
        run_app,
        calamares_polkit,
    ):
        Gtk.Dialog.__init__(self)

        self.set_border_width(10)
        self.set_title(title)
        self.set_modal(True)
        # self.set_default_size(600, 100)
        self.set_resizable(False)

        self.pacman_lockfile = pacman_lockfile

        self.run_app = run_app
        self.calamares_polkit = calamares_polkit

        self.label_message = Gtk.Label(xalign=0, yalign=0)
        self.label_message.set_halign(Gtk.Align.CENTER)

        headerbar = Gtk.HeaderBar()
        headerbar.set_title(title)
        headerbar.set_show_close_button(True)

        headerbar.pack_start(
            Gtk.Image().new_from_pixbuf(
                GdkPixbuf.Pixbuf().new_from_file_at_size(
                    os.path.join(base_dir, "images/arcolinux.png"), 16, 16
                )
            )
        )

        self.set_titlebar(headerbar)

        btn_cancel = Gtk.Button(label="Cancel")
        btn_cancel.set_size_request(100, 30)
        btn_cancel.connect("clicked", self.on_md_cancel_clicked)
        btn_cancel.set_halign(Gtk.Align.END)

        title_message = "You have chosen the %s option" % install_method

        title_second_message = "Which bootloader do you prefer <b>Grub</b>, <b>Systemd-boot</b> or <b>Refind</b> ?"

        btn_bootloader_grub = Gtk.Button(label="Install Grub")
        btn_bootloader_grub.set_size_request(100, 30)
        btn_bootloader_grub.connect("clicked", self.on_bootloader_grub_clicked)

        btn_bootloader_systemd_boot = Gtk.Button(label="Install Systemd-boot")
        btn_bootloader_systemd_boot.set_size_request(100, 30)
        btn_bootloader_systemd_boot.connect(
            "clicked", self.on_bootloader_systemd_boot_clicked
        )

        btn_bootloader_refind = Gtk.Button(label="Install Refind")
        btn_bootloader_refind.set_size_request(100, 30)
        btn_bootloader_refind.connect("clicked", self.on_bootloader_refind_clicked)

        label_title_message = Gtk.Label(xalign=0.5, yalign=0.5)
        label_title_message.set_markup("<b>%s</b>" % title_message)

        label_title_message.set_halign(Gtk.Align.CENTER)

        label_title_second_message = Gtk.Label(xalign=0.5, yalign=0.5)
        label_title_second_message.set_markup("%s" % title_second_message)

        label_title_second_message.set_halign(Gtk.Align.CENTER)

        lbl_padding1 = Gtk.Label(xalign=0, yalign=0)
        lbl_padding1.set_text(" ")

        lbl_padding2 = Gtk.Label(xalign=0, yalign=0)
        lbl_padding2.set_text(" ")

        hbox_buttons = Gtk.Box(orientation=Gtk.Orientation.HORIZONTAL, spacing=5)
        hbox_buttons.pack_start(btn_bootloader_grub, False, False, 1)
        hbox_buttons.pack_start(btn_bootloader_systemd_boot, False, False, 1)
        hbox_buttons.pack_start(btn_bootloader_refind, False, False, 1)

        hbox_buttons.set_halign(Gtk.Align.CENTER)

        vbox_cancel = Gtk.Box(orientation=Gtk.Orientation.VERTICAL, spacing=5)
        vbox_cancel.pack_end(btn_cancel, False, False, 0)

        self.vbox.set_spacing(10)

        self.vbox.add(label_title_message)
        self.vbox.add(label_title_second_message)
        self.vbox.add(hbox_buttons)

    def on_md_cancel_clicked(self, widget):
        self.destroy()

    # select GRUB
    def on_bootloader_grub_clicked(self, widget):
        if not os.path.exists(self.pacman_lockfile):
            bootloader_file = "/etc/calamares/modules/bootloader-grub.conf"

            if os.path.exists(bootloader_file):
                app_cmd = [
                    "sudo",
                    "cp",
                    bootloader_file,
                    "/etc/calamares/modules/bootloader.conf",
                ]

                Thread(target=self.run_app, args=(app_cmd,), daemon=True).start()
                if os.path.exists("/usr/share/xsessions/nimdow.desktop"):
                    subprocess.Popen([self.calamares_polkit], shell=False)
                else:
                    subprocess.Popen([self.calamares_polkit, "-d"], shell=False)
            else:
                print(
                    "[ERROR]: %s not found, are you sure you are on a Live ISO?"
                    % bootloader_file
                )

                if self.label_message is not None:
                    self.label_message.destroy()

                self.label_message.set_markup(
                    "<span foreground='orange'><b>%s not found\nAre you sure you are on a Live ISO?</b></span>"
                    % bootloader_file
                )

                self.vbox.add(self.label_message)
                self.show_all()

        else:
            print(
                "[ERROR]: Pacman lockfile found %s, is another pacman process running ?"
                % self.pacman_lockfile
            )

            if self.label_message is not None:
                self.label_message.destroy()

            self.label_message.set_markup(
                "<span foreground='orange'><b Pacman lockfile found %s, is another pacman process running ?</b></span>"
                % self.pacman_lockfile
            )

            self.vbox.add(self.label_message)
            self.show_all()

        self.destroy()

    # select systemd-boot
    def on_bootloader_systemd_boot_clicked(self, widget):
        if not os.path.exists(self.pacman_lockfile):
            bootloader_file = "/etc/calamares/modules/bootloader-systemd.conf"

            if os.path.exists(bootloader_file):
                app_cmd = [
                    "sudo",
                    "cp",
                    bootloader_file,
                    "/etc/calamares/modules/bootloader.conf",
                ]
                Thread(target=self.run_app, args=(app_cmd,), daemon=True).start()
                if os.path.exists("/usr/share/xsessions/nimdow.desktop"):
                    subprocess.Popen([self.calamares_polkit], shell=False)
                else:
                    subprocess.Popen([self.calamares_polkit, "-d"], shell=False)

            else:
                print("[ERROR]: %s not found, are you on a Live ISO?" % bootloader_file)

                if self.label_message is not None:
                    self.label_message.destroy()

                self.label_message.set_markup(
                    "<span foreground='orange'><b>%s not found\nAre you sure you are on a Live ISO?</b></span>"
                    % bootloader_file
                )

                self.vbox.add(self.label_message)
                self.show_all()

        else:
            print(
                "[ERROR]: Pacman lockfile found %s, is another pacman process running ?"
                % self.pacman_lockfile
            )

            if self.label_message is not None:
                self.label_message.destroy()

            self.label_message.set_markup(
                "<span foreground='orange'><b Pacman lockfile found %s, is another pacman process running ?</b></span>"
                % self.pacman_lockfile
            )

            self.vbox.add(self.label_message)
            self.show_all()

        self.destroy()

    # select refind
    def on_bootloader_refind_clicked(self, widget):
        if not os.path.exists(self.pacman_lockfile):
            bootloader_file = "/etc/calamares/modules/bootloader-refind.conf"

            if os.path.exists(bootloader_file):
                app_cmd = [
                    "sudo",
                    "cp",
                    bootloader_file,
                    "/etc/calamares/modules/bootloader.conf",
                ]
                Thread(target=self.run_app, args=(app_cmd,), daemon=True).start()
                if os.path.exists("/usr/share/xsessions/nimdow.desktop"):
                    subprocess.Popen([self.calamares_polkit], shell=False)
                else:
                    subprocess.Popen([self.calamares_polkit, "-d"], shell=False)

            else:
                print("[ERROR]: %s not found, are you on a Live ISO?" % bootloader_file)

                if self.label_message is not None:
                    self.label_message.destroy()

                self.label_message.set_markup(
                    "<span foreground='orange'><b>%s not found\nAre you sure you are on a Live ISO?</b></span>"
                    % bootloader_file
                )

                self.vbox.add(self.label_message)
                self.show_all()

        else:
            print(
                "[ERROR]: Pacman lockfile found %s, is another pacman process running ?"
                % self.pacman_lockfile
            )

            if self.label_message is not None:
                self.label_message.destroy()

            self.label_message.set_markup(
                "<span foreground='orange'><b Pacman lockfile found %s, is another pacman process running ?</b></span>"
                % self.pacman_lockfile
            )

            self.vbox.add(self.label_message)
            self.show_all()

        self.destroy()
