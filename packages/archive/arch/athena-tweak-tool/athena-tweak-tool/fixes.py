# ============================================================
# Authors: Brad Heffernan - Erik Dubois - Cameron Percival
# ============================================================

import functions as fn
from functions import GLib


def check_cursor_global(lists, value):
    """find name of global cursor"""
    if fn.path.isfile(fn.icons_default):
        try:
            pos = fn.get_position(lists, value)
            val = lists[pos].strip()
            return val
        except Exception as error:
            print(error)


def check_parallel_downloads(lists, value):
    """find number of parellel downloads"""
    if fn.path.isfile(fn.pacman):
        try:
            pos = fn.get_position(lists, value)
            val = lists[pos].strip()
            return val
        except Exception as error:
            print(error)


def set_global_cursor(self, cursor):
    """set global cursor"""
    if fn.path.isfile(fn.icons_default):
        try:
            with open(fn.icons_default, "r", encoding="utf-8") as f:
                lines = f.readlines()
                f.close()

            pos_cursor_theme = fn.get_position(lines, "Inherits=")
            lines[pos_cursor_theme] = "Inherits=" + cursor + "\n"

            with open(fn.icons_default, "w", encoding="utf-8") as f:
                f.writelines(lines)
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


def pop_gtk_cursor_names(combo):
    """populate cursor names"""
    coms = []
    combo.get_model().clear()
    for item in fn.listdir("/usr/share/icons/"):
        if fn.path_check("/usr/share/icons/" + item + "/cursors/"):
            coms.append(item)
            coms.sort()
    lines = fn.get_lines(fn.icons_default)
    try:
        cursor_theme = check_cursor_global(lines, "Inherits=").split("=")[1]
    except IndexError:
        cursor_theme = ""

    coms.sort()
    for i, item in enumerate(coms):
        combo.append_text(item)
        if cursor_theme.lower() == item.lower():
            combo.set_active(i)


def set_parallel_downloads(self, widget):
    """set number of parallel downloads in pacman.conf"""
    if fn.path.isfile(fn.pacman):
        try:
            with open(fn.pacman, "r", encoding="utf-8") as f:
                lines = f.readlines()
                f.close()
            par_downloads = self.parallel_downloads.get_active_text()
            pos_par_down = fn.get_position(lines, "ParallelDownloads")
            lines[pos_par_down] = "ParallelDownloads = " + par_downloads + "\n"

            with open(fn.pacman, "w", encoding="utf-8") as f:
                f.writelines(lines)
                f.close()
            print("Saved to /etc/pacman.conf")
            print(lines[pos_par_down])
            fn.show_in_app_notification(self, "Settings Saved Successfully")

            # GLib.idle_add(fn.messagebox,self, "Success!!", "Settings applied successfully")
        except Exception as error:
            print(error)
            fn.messagebox(
                self,
                "Failed!!",
                'There seems to have been a problem in "set_parallel_downloads"',
            )


def pop_parallel_downloads(self):
    """populate parallel downloads for pacman"""
    if fn.path.isfile(fn.pacman):
        try:
            with open(fn.pacman, "r", encoding="utf-8") as f:
                lines = f.readlines()
                f.close()
        except Exception as error:
            print(error)
            fn.messagebox(
                self,
                "Failed!!",
                'There seems to have been a problem in "pop_parallel_downloads"',
            )
    try:
        parallel_downloads = check_parallel_downloads(lines, "ParallelDownloads").split(
            "="
        )[1]
        active_number = int(parallel_downloads) - 1
        return active_number
    except IndexError:
        active_number = ""
