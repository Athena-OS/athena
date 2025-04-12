# ============================================================
# Authors: Brad Heffernan - Erik Dubois - Cameron Percival
# ============================================================

import functions as fn
from functions import GLib


def check_lxdm(lists, value):
    """return first value in lxdm.conf"""
    if fn.path.isfile(fn.lxdm_conf):
        try:
            pos = fn.get_position(lists, value)
            val = lists[pos].strip()
            return val
        except Exception as error:
            print(error)


def check_lxdm_last(lists, value):
    """if two instances - take last one and return"""
    if fn.path.isfile(fn.lxdm_conf):
        try:
            pos = fn.get_positions(lists, value)
            pos = pos[-1]
            val = lists[pos].strip()
            return val
        except Exception as error:
            print(error)


def set_lxdm_value(self, lists, username, gtk_theme, lxdm_theme, state, pane):
    """setting all the values"""
    if fn.path.isfile(fn.lxdm_conf):
        try:
            fn.add_autologin_group(self)
            pos = fn.get_position(lists, "autologin=")
            pos_gtk_theme = fn.get_position(lists, "gtk_theme=")
            lxdm_list = fn.get_positions(lists, "theme=")
            # get last instance
            lxdm = lxdm_list[-1]
            bot = fn.get_position(lists, "bottom_pane=")

            if state:
                lists[pos] = "autologin=" + username + "\n"
            else:
                if "#" not in lists[pos]:
                    lists[pos] = "#" + lists[pos]

            lists[pos_gtk_theme] = "gtk_theme=" + gtk_theme + "\n"

            lists[lxdm] = "theme=" + lxdm_theme + "\n"

            if pane:
                # at bottom
                lists[bot] = "bottom_pane=1" + "\n"
            else:
                # at top
                lists[bot] = "bottom_pane=0" + "\n"

            with open(fn.lxdm_conf, "w", encoding="utf-8") as f:
                f.writelines(lists)
                f.close()

            GLib.idle_add(
                fn.show_in_app_notification, self, "Settings Saved Successfully"
            )

            # GLib.idle_add(fn.messagebox,self, "Success!!", "Settings applied successfully")
        except Exception as error:
            print(error)
            fn.messagebox(
                self,
                "Failed!!",
                'There seems to have been a problem in "set_lxdm_value"',
            )


def pop_gtk_theme_names_lxdm(combo):
    """populate gtk theme names"""
    coms = []
    combo.get_model().clear()

    if fn.path.isfile(fn.lxdm_conf):
        for item in fn.listdir("/usr/share/themes/"):
            if fn.file_check("/usr/share/themes/" + item + "/index.theme"):
                coms.append(item)
                coms.sort()
        lines = fn.get_lines(fn.lxdm_conf)

        try:
            theme_name = check_lxdm(lines, "gtk_theme=").split("=")[1]
        except IndexError:
            theme_name = ""

        coms.sort()
        for i, item in enumerate(coms):
            combo.append_text(item)
            if theme_name.lower() == item.lower():
                combo.set_active(i)


def pop_lxdm_theme_greeter(combo):
    """Populate the lxdm theme"""
    coms = []
    combo.get_model().clear()

    if fn.path.exists("/usr/share/lxdm/themes") and fn.path.exists(fn.lxdm_conf):
        for items in fn.listdir("/usr/share/lxdm/themes/"):
            coms.append(items)

        lines = fn.get_lines(fn.lxdm_conf)
        try:
            name = check_lxdm_last(lines, "theme=").split("=")[1]
        except IndexError:
            name = ""

        coms.sort()
        for i, item in enumerate(coms):
            combo.append_text(item)
            if name.lower() == item.lower():
                combo.set_active(i)
