# ============================================================
# Authors: Brad Heffernan - Erik Dubois - Cameron Percival
# ============================================================

import functions as fn
from functions import GLib


def check_lightdm(lists, value):
    """check value of lightdm"""
    if fn.os.path.isfile(fn.lightdm_conf):
        try:
            pos = fn.get_position(lists, value)
            val = lists[pos].strip()
            return val
        except Exception as error:
            print(error)


def check_lightdm_greeter(lists, value):
    """check value of lightdm_greeter"""
    if fn.os.path.isfile(fn.lightdm_greeter):
        try:
            pos = fn.get_position(lists, value)
            val = lists[pos].strip()
            return val
        except Exception as error:
            print(error)


# for autologin and session in lightdm.conf


def set_lightdm_value(self, lists, value, session, state):
    """set autologin and session in lightdm_conf"""
    if fn.os.path.isfile(fn.lightdm_conf):
        try:
            fn.add_autologin_group(self)

            pos = fn.get_position(lists, "autologin-user=")
            pos_session = fn.get_position(lists, "autologin-session=")

            if state:
                lists[pos] = "autologin-user=" + value + "\n"
                lists[pos_session] = "autologin-session=" + session + "\n"
            else:
                if "#" not in lists[pos]:
                    lists[pos] = "#" + lists[pos]
                    lists[pos_session] = "#" + lists[pos_session]

            with open(fn.lightdm_conf, "w", encoding="utf-8") as f:
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
                'There seems to have been a problem in "set_lightdm_value"',
            )


def set_lightdm_icon_theme_cursor(self, lists, theme, icon, cursor):
    """set theme, icon, cursor and color background"""
    if fn.os.path.isfile(fn.lightdm_greeter):
        try:
            pos_theme = fn.get_position(lists, "theme-name=")
            pos_icon_theme = fn.get_position(lists, "icon-theme-name=")
            pos_cursor_theme = fn.get_position(lists, "cursor-theme-name=")
            pos_background = fn.get_position(lists, "background=")

            lists[pos_theme] = "theme-name=" + theme + "\n"
            lists[pos_icon_theme] = "icon-theme-name=" + icon + "\n"
            lists[pos_cursor_theme] = "cursor-theme-name=" + cursor + "\n"

            hexa = fn.rgb_to_hex(
                self.slick_greeter_color.get_current_rgba().to_string()
            ).upper()
            if self.slick_greeter_color_checkbutton.get_active():
                lists[pos_background] = "background=" + hexa + "\n"
            else:
                lists[pos_background] = (
                    "# background=Background file to use, either an \
image path or a color (e.g. #772953)"
                    + hexa
                    + "\n"
                )

            with open(fn.lightdm_greeter, "w", encoding="utf-8") as f:
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
                'There seems to have been a problem in "set_lightdm_value"',
            )


def set_lightdm_icon_theme_cursor_slick(self, lists, theme, icon):
    """Slick greeter settings"""
    if fn.os.path.isfile(fn.lightdm_slick_greeter):
        try:
            # no cursor in slick greeter
            pos_theme = fn.get_position(lists, "theme-name=")
            pos_icon_theme = fn.get_position(lists, "icon-theme-name=")
            pos_background = fn.get_position(lists, "background=")

            lists[pos_theme] = "theme-name=" + theme + "\n"
            lists[pos_icon_theme] = "icon-theme-name=" + icon + "\n"

            hexa = fn.rgb_to_hex(
                self.slick_greeter_color.get_current_rgba().to_string()
            ).upper()
            if self.slick_greeter_color_checkbutton.get_active():
                lists[pos_background] = "background=" + hexa + "\n"
            else:
                lists[pos_background] = (
                    "# background=Background file to use, either an \
image path or a color (e.g. #772953)"
                    + hexa
                    + "\n"
                )

            with open(fn.lightdm_slick_greeter, "w", encoding="utf-8") as f:
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
                'There seems to have been a problem in "set_lightdm_value"',
            )


def pop_box_sessions_lightdm(self, combo):
    """populate sessions in lightdm"""
    if fn.distr != "artix":
        coms = []
        combo.get_model().clear()

        if fn.os.path.isfile(fn.lightdm_conf) and fn.os.path.exists(
            "/usr/share/xsessions"
        ):
            for items in fn.os.listdir("/usr/share/xsessions/"):
                coms.append(items.split(".")[0].lower())
            lines = fn.get_lines(fn.lightdm_conf)

            try:
                name = check_lightdm(lines, "autologin-session=").split("=")[1]
            except IndexError:
                name = ""

            if "i3-with-shmlog" in coms:
                coms.remove("i3-with-shmlog")
            if "openbox-kde" in coms:
                coms.remove("openbox-kde")
            if "cinnamon2d" in coms:
                coms.remove("cinnamon2d")
            if "icewm-session" in coms:
                coms.remove("icewm-session")

            coms.sort()
            for i, item in enumerate(coms):
                combo.append_text(item)
                if name.lower() == item.lower():
                    combo.set_active(i)


def pop_gtk_theme_names_lightdm(self, combo):
    """populate theme names in lightdm"""
    if fn.distr != "artix":
        coms = []
        combo.get_model().clear()

        if fn.os.path.isfile(fn.lightdm_greeter):
            for item in fn.os.listdir("/usr/share/themes/"):
                if fn.file_check("/usr/share/themes/" + item + "/index.theme"):
                    coms.append(item)
                    coms.sort()
            lines = fn.get_lines(fn.lightdm_greeter)

            # pos = fn.get_position(lines, "theme-name=")
            try:
                theme_name = check_lightdm_greeter(lines, "theme-name=").split("=")[1]
            except IndexError:
                theme_name = ""

            coms.sort()
            for i, item in enumerate(coms):
                combo.append_text(item)
                if theme_name.lower() == item.lower():
                    combo.set_active(i)


def pop_gtk_icon_names_lightdm(self, combo):
    """populate icon names lightdm"""
    if fn.distr != "artix":
        coms = []
        combo.get_model().clear()

        if fn.os.path.isfile(fn.lightdm_greeter):
            for item in fn.os.listdir("/usr/share/icons/"):
                if not fn.path_check("/usr/share/icons/" + item + "/cursors/"):
                    coms.append(item)
                    coms.sort()
            lines = fn.get_lines(fn.lightdm_greeter)

            # pos = fn.get_position(lines, "icon-theme-name=")
            try:
                icon_theme_name = check_lightdm(lines, "icon-theme-name=").split("=")[1]
            except IndexError:
                icon_theme_name = ""

            coms.sort()
            for i, item in enumerate(coms):
                combo.append_text(item)
                if icon_theme_name.lower() == item.lower():
                    combo.set_active(i)


def pop_gtk_cursor_names(self, combo):
    """populate cursor names from"""
    if fn.distr != "artix":
        coms = []
        combo.get_model().clear()

        if fn.os.path.isfile(fn.lightdm_greeter):
            for item in fn.os.listdir("/usr/share/icons/"):
                if fn.path_check("/usr/share/icons/" + item + "/cursors/"):
                    coms.append(item)
                    coms.sort()

            lines = fn.get_lines(fn.lightdm_greeter)

            try:
                cursor_theme = check_lightdm(lines, "cursor-theme-name=").split("=")[1]
            except IndexError:
                cursor_theme = ""

            coms.sort()
            for i, item in enumerate(coms):
                combo.append_text(item)
                if cursor_theme.lower() == item.lower():
                    combo.set_active(i)
