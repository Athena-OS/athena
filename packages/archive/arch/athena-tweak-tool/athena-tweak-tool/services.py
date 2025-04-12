# ============================================================
# Authors: Brad Heffernan - Erik Dubois - Cameron Percival
# ============================================================

import functions as fn
from functions import GLib


def choose_nsswitch(self):
    """choose a nsswitch"""
    choice = self.nsswitch_choices.get_active_text()

    # options = ['ArcoLinux', 'Garuda', 'Arch Linux', 'EndeavourOS']
    if choice == "ArcoLinux":  # alci #carli
        fn.copy_nsswitch("arco")
        print("Nsswitch from ArcoLinux")
        GLib.idle_add(fn.show_in_app_notification, self, "Nsswitch from ArcoLinux")
    elif choice == "Garuda":
        fn.copy_nsswitch("garuda")
        print("Nsswitch from Garuda")
        GLib.idle_add(fn.show_in_app_notification, self, "Nsswitch from Garuda")
    elif choice == "Arch Linux":  # archlinuxgui #ariser
        fn.copy_nsswitch("arch")
        print("Nsswitch from Arch Linux")
        GLib.idle_add(fn.show_in_app_notification, self, "Nsswitch from Arch Linux")
    elif choice == "Manjaro":
        fn.copy_nsswitch("manjaro")
        print("Nsswitch from Manjaro")
        GLib.idle_add(fn.show_in_app_notification, self, "Nsswitch from Manjaro")
    elif choice == "BigLinux":
        fn.copy_nsswitch("biglinux")
        print("Nsswitch from BigLinux")
        GLib.idle_add(fn.show_in_app_notification, self, "Nsswitch from BigLinux")
    else:
        fn.copy_nsswitch("eos")
        print("Nsswitch from EndeavourOS")
        GLib.idle_add(fn.show_in_app_notification, self, "Nsswitch from EndeavourOS")


def choose_smb_conf(self):
    """choose_smb_conf"""
    choice = self.samba_choices.get_active_text()

    if choice == "ArcoLinux":
        fn.copy_samba("arco")
        print("smb.conf from ArcoLinux")
        GLib.idle_add(fn.show_in_app_notification, self, "Smb.conf from ArcoLinux")
    elif choice == "Easy":
        fn.copy_samba("example")
        GLib.idle_add(
            fn.show_in_app_notification, self, "Smb.conf easy configuration applied"
        )
    elif choice == "Usershares":
        fn.copy_samba("usershares")
        GLib.idle_add(
            fn.show_in_app_notification,
            self,
            "Smb.conf usershares configuration applied",
        )
    elif choice == "Windows":
        fn.copy_samba("windows")
        GLib.idle_add(
            fn.show_in_app_notification, self, "Smb.conf windows configuration applied"
        )
    elif choice == "Original":
        fn.copy_samba("original")
        print("Smb.conf from gitlab of Samba")
        GLib.idle_add(
            fn.show_in_app_notification, self, "Smb.conf from gitlab of Samba"
        )
    elif choice == "BigLinux":
        fn.copy_samba("biglinux")
        print("Smb.conf from BigLinux")
        GLib.idle_add(fn.show_in_app_notification, self, "Smb.conf from BigLinux")


def create_samba_user(self):
    """create a new user for samba"""

    username = fn.sudo_username
    # password = self.entry_password.get_text()

    if username:
        fn.install_package(self, "alacritty")
        print("Type in your password for the Sambashare")
        print(
            "Although the user name is shared with Linux system, Samba uses a password"
        )
        print("separate from that of the Linux user accounts.")
        try:
            fn.subprocess.call(
                "alacritty -e /usr/bin/smbpasswd -a " + username,
                shell=True,
                stdout=fn.subprocess.PIPE,
                stderr=fn.subprocess.STDOUT,
            )
            print("Created a password for the current user")
            print("Alacritty should pop open and you can type your Samba password")
            print("If you can not type your password - type the command in a terminal")
            print("sudo smbpasswd -a 'your_username'")
            fn.show_in_app_notification(self, "Created a password for the current user")
        except Exception as error:
            print(error)


def add_autoconnect_pulseaudio(self):
    if fn.file_check(fn.pulse_default):
        if fn.check_content("load-module module-switch-on-connect\n", fn.pulse_default):
            print("We have already enabled your headset to autoconnect")
        else:
            try:
                with open(fn.pulse_default, "r", encoding="utf-8") as f:
                    lists = f.readlines()
                    f.close()

                lists.append("\nload-module module-switch-on-connect\n")

                with open(fn.pulse_default, "w", encoding="utf-8") as f:
                    f.writelines(lists)
                    f.close()
                print("We have added this line to /etc/pulse/default.pa")
                print("load-module module-switch-on-connect")
                fn.show_in_app_notification(
                    self, "Pulseaudio bluetooth autoconnection enabled"
                )
            except Exception as error:
                print(error)


def restart_smb(self):
    """restart samba"""

    if fn.check_service("smb"):
        restart = "systemctl restart smb"
        fn.system(restart)
        print("Restarting smb service...")
        GLib.idle_add(fn.show_in_app_notification, self, "Restarting smb service...")
    else:
        print("Did you install samba - check for errors")
        print("Type in a terminal")
        print("   sudo systemctl status smb")
        GLib.idle_add(
            fn.show_in_app_notification,
            self,
            "Did you install samba - check for errors",
        )
