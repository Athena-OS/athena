# ============================================================
# Authors: Brad Heffernan - Erik Dubois - Cameron Percival
# ============================================================
# pylint:disable=C0301,I1101,W0104

import functions as fn

# from types import FunctionType
# import crypt
from functions import GLib


def create_user(self):
    """Create a new user"""
    # if not empty fields
    username = self.hbox_username.get_text()
    name = self.hbox_name.get_text()
    atype = self.combo_account_type.get_active_text()
    password = self.hbox_password.get_text()
    confirm_password = self.hbox_confirm_password.get_text()
    if (
        len(username) > 0
        and len(name) > 0
        and len(password) > 0
        and len(confirm_password) > 0
    ):
        # if passwords check out
        if password == confirm_password:
            user_password = "echo " + username + ":" + password
            try:
                command = "groupadd -r sambashare"
                fn.subprocess.call(
                    command.split(" "),
                    shell=False,
                    stdout=fn.subprocess.PIPE,
                    stderr=fn.subprocess.STDOUT,
                )
            except Exception as error:
                print(error)

            if password == confirm_password:
                if atype == "Administrator":
                    useradd = (
                        'useradd -m -G audio,video,network,storage,rfkill,wheel,sambashare -c "'
                        + name
                        + '" -s /bin/bash '
                        + username
                    )
                    fn.system(useradd)
                    fn.system(user_password + " | " + "chpasswd -c SHA512")
                else:
                    useradd = (
                        'useradd -m -G audio,video,network,storage,rfkill,sambashare -c "'
                        + name
                        + '" -s /bin/bash '
                        + username
                    )
                    fn.system(useradd)
                    fn.system(user_password + " | " + "chpasswd -c SHA512")
                print("User has been created")
                GLib.idle_add(
                    fn.show_in_app_notification, self, "User has been created"
                )
        else:
            fn.show_in_app_notification(self, "Passwords are not the same")
            fn.messagebox(self, "Message", "Passwords are not the same")
    else:
        fn.show_in_app_notification(self, "First fill in all the fields")
        fn.messagebox(self, "Message", "First fill in all the fields")


def on_click_delete_user(self):
    """delete user"""
    username = self.cbt_users.get_active_text()
    if username is not None:
        userdel = "userdel " + username

        fn.system(userdel)
        print("User has been deleted - home folder has not been deleted")
        GLib.idle_add(fn.show_in_app_notification, self, "User has been deleted")


def on_click_delete_all_user(self):
    """delete also home dir"""
    username = self.cbt_users.get_active_text()
    if username is not None:
        userdel = "userdel -r -f " + username

        fn.system(userdel)
        print("User has been deleted - home folder has been deleted")
        GLib.idle_add(
            fn.show_in_app_notification, self, "User and home folder has been deleted"
        )


def pop_cbt_users(self, combo):
    """populate with users - 1000 is default user - not included"""
    combo.get_model().clear()
    users = fn.list_users("/etc/passwd")
    for user in users:
        self.cbt_users.append_text(user)
        self.cbt_users.set_active(0)
