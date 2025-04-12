# # ============================================================
# # Authors: Brad Heffernan - Erik Dubois - Cameron Percival
# # ============================================================
# # pylint:disable=C0301,I1101,W0104
# import functions as fn
# from functions import GLib


# def choose_nsswitch(self, widget):
#     choice = self.nsswitch_choices.get_active_text()

#     # options = ['ArcoLinux', 'Garuda', 'Arch Linux', 'EndeavourOS']
#     if choice == "ArcoLinux":
#         fn.copy_nsswitch("arco")
#         print("Nsswitch from ArcoLinux")
#         GLib.idle_add(fn.show_in_app_notification, self, "Nsswitch from ArcoLinux")
#     elif choice == "Garuda":
#         fn.copy_nsswitch("garuda")
#         print("Nsswitch from Garuda")
#         GLib.idle_add(fn.show_in_app_notification, self, "Nsswitch from Garuda")
#     elif choice == "Arch Linux":
#         fn.copy_nsswitch("arch")
#         print("Nsswitch from Arch Linux")
#         GLib.idle_add(fn.show_in_app_notification, self, "Nsswitch from Arch Linux")
#     else:
#         fn.copy_nsswitch("eos")
#         print("Nsswitch from EndeavourOS")
#         GLib.idle_add(fn.show_in_app_notification, self, "Nsswitch from EndeavourOS")


# def choose_smb_conf(self, widget):
#     choice = self.samba_choices.get_active_text()

#     # options_samba = ['ArcoLinux', 'Example', 'Original']
#     if choice == "ArcoLinux":
#         fn.copy_samba("arco")
#         print("smb.conf from ArcoLinux")
#         GLib.idle_add(fn.show_in_app_notification, self, "Smb.conf from ArcoLinux")
#     elif choice == "Easy":
#         fn.copy_samba("example")
#         GLib.idle_add(
#             fn.show_in_app_notification, self, "Smb.conf easy configuration applied"
#         )
#     elif choice == "Usershares":
#         fn.copy_samba("usershares")
#         GLib.idle_add(
#             fn.show_in_app_notification,
#             self,
#             "Smb.conf usershares configuration applied",
#         )
#     elif choice == "Windows":
#         fn.copy_samba("windows")
#         GLib.idle_add(
#             fn.show_in_app_notification, self, "Smb.conf windows configuration applied"
#         )
#     elif choice == "Original":
#         fn.copy_samba("original")
#         print("Smb.conf from gitlab of Samba")
#         GLib.idle_add(
#             fn.show_in_app_notification, self, "Smb.conf from gitlab of Samba"
#         )


# def create_samba_user(self, widget):

#     username = fn.sudo_username
#     # password = self.entry_password.get_text()

#     if username:
#         fn.install_package(self, "alacritty")
#         print("Type in your password for the Sambashare")
#         print(
#             "Although the user name is shared with Linux system, Samba uses a password"
#         )
#         print("separate from that of the Linux user accounts.")
#         try:
#             fn.subprocess.call(
#                 "alacritty -e /usr/bin/smbpasswd -a " + username,
#                 shell=True,
#                 stdout=fn.subprocess.PIPE,
#                 stderr=fn.subprocess.STDOUT,
#             )
#             print("Created a password for the current user")
#             GLib.idle_add(
#                 fn.show_in_app_notification,
#                 self,
#                 "Created a password for the current user",
#             )
#         except Exception as e:
#             print(e)
#     else:
#         print("First fill in your username")
#         GLib.idle_add(fn.show_in_app_notification, self, "First fill in your username")


# def delete_samba_user(self, widget):

#     username = self.samba_users.get_active_text()

#     if username:
#         fn.install_package(self, "alacritty")
#         fn.subprocess.call(
#             "alacritty -e /usr/bin/smbpasswd -x " + username,
#             shell=True,
#             stdout=fn.subprocess.PIPE,
#             stderr=fn.subprocess.STDOUT,
#         )
#         print("Deleting the selected user from Samba...")
#         GLib.idle_add(
#             fn.show_in_app_notification,
#             self,
#             "Deleting the selected user from Samba...",
#         )
#     else:
#         print("Make a selection")
#         GLib.idle_add(fn.show_in_app_notification, self, "Make a selection")


# def delete_user(self, widget):

#     username = self.samba_users.get_active_text()

#     if username:
#         userdel = "userdel " + username
#         fn.os.system(userdel)
#         print("The user " + username + " has been completely deleted from your system")
#         GLib.idle_add(fn.show_in_app_notification, self, "User deleted from system")
#     else:
#         print("Something went wrong")


# def restart_smb(self, widget):

#     if fn.check_service("smb"):
#         restart = "systemctl restart smb"
#         fn.os.system(restart)
#         print("Restarting smb service...")
#         GLib.idle_add(fn.show_in_app_notification, self, "Restarting smb service...")
#     else:
#         print("Did you install samba - check for errors")
#         print("Type in a terminal")
#         print("   sudo systemctl status smb")
#         GLib.idle_add(
#             fn.show_in_app_notification,
#             self,
#             "Did you install samba - check for errors",
#         )
