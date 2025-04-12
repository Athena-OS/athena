# ============================================================
# Authors: Brad Heffernan - Erik Dubois - Cameron Percival
# ============================================================

import datetime
import numpy as np
from gi.repository import GLib, Gtk  # noqa
import functions as fn
import os

# import Settings
# import gi
# import distro
# import os

# gi.require_version('Gtk', '3.0')

# =================================================================
# =                         Desktops                             =
# =================================================================

desktops = [
    "Bspwm",
    "Cinnamon",
    "GNOME",
    "Hyprland",
    "MATE",
    "Plasma",
    "XFCE Picom",
    "XFCE Refined",
]
pkexec = ["pkexec", "pacman", "-S", "--needed", "--noconfirm", "--ask=4"]
pkexec_reinstall = ["pkexec", "pacman", "-S", "--noconfirm", "--ask=4"]
copy = ["cp", "-Rv"]

session_mapping = {
    "Bspwm": "bspwm",
    "Cinnamon": "cinnamon",
    "GNOME": "gnome-xorg",
    "Hyprland": "hyprland",
    "MATE": "mate",
    "Plasma": "plasma",
    "XFCE Picom": "xfce",
    "XFCE Refined": "xfce",
}

# =================================================================
# =                         Distros                               =
# =================================================================

# =================================================================
# =================================================================
# =================================================================
# =                         ARCOLINUX                             =
# =================================================================
# =================================================================
# =================================================================

env_mapping = {
    "Bspwm": "athena-bspwm-config",
    "Cinnamon": "athena-cinnamon-base",
    "GNOME": "athena-gnome-config",
    "Hyprland": "athena-hyprland-config",
    "MATE": "athena-mate-base",
    "Plasma": "athena-kde-base",
    "XFCE Picom": "athena-xfce-picom",
    "XFCE Refined": "athena-xfce-refined",
}

file_mapping = {
    "Bspwm": [
        "/etc/skel/.p10k.zsh",
        "/etc/skel/.config/bspwm",
        "/etc/skel/.config/btop",
        "/etc/skel/.config/gtk-3.0",
        "/etc/skel/.config/mpd",
        "/etc/skel/.config/ncmpcpp",
        "/etc/skel/.config/paru",
        "/etc/skel/.config/ranger",
        "/etc/skel/.config/rofi",
        "/etc/skel/.local/bin",
        "/etc/skel/.local/share/applications",
        "/etc/skel/.local/share/asciiart",
        "/etc/skel/.local/share/fonts"
        ],
    "Cinnamon": [
        "/etc/skel/.config/cinnamon",
        "/etc/skel/.flag-cinnamon-once"
        ],
    "GNOME": [
        "/etc/skel/.flag-gnome-once"
        ],
    "Hyprland": [],
    "MATE": [
        "/etc/skel/.flag-mate-once"
        ],
    "Plasma": [
        "/etc/skel/.config/kwinrc",
        "/etc/skel/.config/kwinrulesrc",
        "/etc/skel/.config/plasma-org.kde.plasma.desktop-appletsrc",
        "/etc/skel/.flag-kde-once"
        ],
    "XFCE Picom": [
        "/etc/skel/.config/xfce4",
        "/etc/skel/.flag-xfce-once",
        "/etc/skel/.config/eww",
        "/etc/skel/.config/gtk-3.0/gtk.css",
        "/etc/skel/.config/picom.conf",
        "/etc/skel/.profile",
        "/etc/skel/.Xresources"
        ],
    "XFCE Refined": [
        "/etc/skel/.config/xfce4",
        "/etc/skel/.flag-xfce-once"
        ]
}


def check_desktop(session):
    """check if desktop is installed"""
    # /usr/share/xsessions/xfce.desktop
    if os.path.exists("/usr/share/xsessions"):
        lst = fn.listdir("/usr/share/xsessions/")
        for xsession in lst:
            if session + ".desktop" == xsession:
                return True
    if os.path.exists("/usr/share/wayland-sessions"):
        lst = fn.listdir("/usr/share/wayland-sessions/")
        for wsession in lst:
            if session + ".desktop" == wsession:
                return True

    return False


def check_lock(self, desktop, state):
    """check pacman lock"""
    if fn.path.isfile("/var/lib/pacman/db.lck"):
        mess_dialog = Gtk.MessageDialog(
            parent=self,
            flags=0,
            message_type=Gtk.MessageType.INFO,
            buttons=Gtk.ButtonsType.YES_NO,
            text="Lock File Found",
        )
        mess_dialog.format_secondary_markup(
            "pacman lock file found, do you want to remove it and continue?"
        )  # noqa

        result = mess_dialog.run()
        mess_dialog.destroy()

        if result in (Gtk.ResponseType.OK, Gtk.ResponseType.YES):
            fn.unlink("/var/lib/pacman/db.lck")
            # print("YES")
            t1 = fn.threading.Thread(
                target=install_desktop,
                args=(self, self.d_combo_desktop.get_active_text(), state),
            )
            t1.daemon = True
            t1.start()
    else:
        # print("NO FILE")
        t1 = fn.threading.Thread(
            target=install_desktop, args=(self, self.d_combo_desktop.get_active_text(), state)
        )
        t1.daemon = True
        t1.start()

    return False


def check_package_and_remove(self, package):
    """remove a package if exists"""
    if fn.check_package_installed(package):
        GLib.idle_add(
            self.desktopr_stat.set_text,
            f"Removing {package}...",
        )
        fn.remove_package_rns(self, package)


def install_desktop(self, desktop, state):
    # error = False
    # make backup of your .config
    now = datetime.datetime.now()
    if not fn.path.exists(fn.home + "/.config-att"):
        fn.makedirs(fn.home + "/.config-att")
        fn.permissions(fn.home + "/.config-att")
    # for all users that have now root permissions
    if fn.path.exists(fn.home + "/.config-att"):
        fn.permissions(fn.home + "/.config-att")
    fn.copy_func(
        fn.home + "/.config/",
        fn.home + "/.config-att/config-att-" + now.strftime("%Y-%m-%d-%H-%M-%S"),
        isdir=True,
    )
    fn.permissions(
        fn.home + "/.config-att/config-att-" + now.strftime("%Y-%m-%d-%H-%M-%S")
    )

    if fn.distr == "archcraft":
        fn.clear_skel_directory()

    print(desktop)

    GLib.idle_add(self.desktopr_prog.set_fraction, 0.2)

    timeout_id = None
    timeout_id = GLib.timeout_add(100, fn.do_pulse, None, self.desktopr_prog)
    print("----------------------------------------------------------------")
    print("Packages list to install")
    print("----------------------------------------------------------------")
    print(env_mapping.get(desktop))
    print("----------------------------------------------------------------")

    if state == "reinst":
        com1 = pkexec_reinstall
        if self.ch1.get_active():
            GLib.idle_add(self.desktopr_stat.set_text, "Clearing cache .....")
            fn.subprocess.call(
                ["sh", "-c", "yes | pkexec pacman -Scc"],
                shell=False,
                stdout=fn.subprocess.PIPE,
            )
    else:
        com1 = pkexec

    # print(list(np.append(com1, command)))
    GLib.idle_add(
        self.desktopr_stat.set_text,
        "Installing " + self.d_combo_desktop.get_active_text() + "...",
    )

    package_name = env_mapping.get(desktop)
    print(f"   Installing: {package_name}")
    GLib.idle_add(
        self.desktopr_stat.set_text,
        f"   Installing {package_name}...",
    )

    try:
        process = fn.subprocess.Popen(
            list(np.append(com1, package_name)),
            bufsize=1,
            stdout=fn.subprocess.PIPE,
            stderr=fn.subprocess.PIPE,  # Capture stderr for error handling
            universal_newlines=True,
        )

        stdout, stderr = process.communicate()  # Read both stdout and stderr
        process_return_code = process.returncode  # Get the return code

        for output_line in stdout.splitlines():
            GLib.idle_add(self.desktopr_stat.set_text, output_line.strip())

        # List of group packages
        group_packages = [
            "budgie-desktop",
            "budgie-extras",
            "cinnamon",
            "cutefish",
            "enlightenment",
            "gnome-extra",
            "gnome",
            "mate-extra",
            "mate",
            "pantheon",
            "plasma",
            "ukui",
            "xfce4-goodies",
            "xfce4",
        ]

        try:
            # Check the return code for success or failure
            if process_return_code == 0:
                if package_name in group_packages:
                    print(
                        "There is no way to check if a group package is installed"
                    )
                    GLib.idle_add(
                        self.desktopr_stat.set_text,
                        "There is no way to check if a group package is installed.",
                    )
                elif fn.check_package_installed(package_name):
                    print(f"{package_name} is installed")
                    GLib.idle_add(
                        self.desktopr_stat.set_text,
                        f"Successfully installed {package_name}.",
                    )
                else:
                    print(
                        f"{package_name} IS NOT INSTALLED - REMOVE CONFLICTING PACKAGE(S)"
                    )
                    GLib.idle_add(
                        self.desktopr_stat.set_text,
                        f"Failed to install {package_name}. Possible conflicts detected.",
                    )
            else:
                # Check for package conflicts in stderr
                conflict_message = None
                for line in stderr.splitlines():
                    if "conflicting dependencies" in line or "in conflict" in line:
                        conflict_message = line
                        break  # Stop searching once we find a conflict message

                if conflict_message:
                    print(f"Installation failed due to package conflict: {conflict_message}")
                    GLib.idle_add(
                        self.desktopr_stat.set_text,
                        f"Installation failed: {conflict_message}",
                    )
                else:
                    print(f"Failed to install {package_name}: {stderr}")
                    GLib.idle_add(
                        self.desktopr_stat.set_text,
                        f"Failed to install {package_name}. Error: {stderr}",
                    )

        except Exception as e:
            print(f"An error occurred while installing {package_name}: {str(e)}")
            GLib.idle_add(
                self.desktopr_stat.set_text,
                f"An error occurred: {str(e)}",
            )
    except Exception as e:
        print(f"An error occurred while installing {package_name}: {str(e)}")
        GLib.idle_add(
            self.desktopr_stat.set_text,
            f"An error occurred: {str(e)}",
        )

    # with fn.subprocess.Popen(
    #     list(np.append(com1, command)),
    #     bufsize=1,
    #     stdout=fn.subprocess.PIPE,
    #     universal_newlines=True,
    # ) as p:
    #     for line in p.stdout:
    #         GLib.idle_add(self.desktopr_stat.set_text, line.strip())
    # print("----------------------------------------------------------------")

    GLib.source_remove(timeout_id)
    timeout_id = None
    GLib.idle_add(self.desktopr_prog.set_fraction, 0)

    session = session_mapping.get(desktop)

    if check_desktop(session):
        for x in file_mapping.get(desktop):
            if fn.path.isdir(x) or fn.path.isfile(x):
                print(x)
                dest = x.replace("/etc/skel", fn.home)
                # print(dest)
                if fn.path.isdir(x):
                    dest = fn.path.split(dest)[0]
                l1 = np.append(copy, [x])
                l2 = np.append(l1, [dest])
                GLib.idle_add(
                    self.desktopr_stat.set_text, "Copying " + x + " to " + dest
                )

                with fn.subprocess.Popen(
                    list(l2),
                    bufsize=1,
                    stdout=fn.subprocess.PIPE,
                    universal_newlines=True,
                ) as p:
                    for line in p.stdout:
                        GLib.idle_add(self.desktopr_stat.set_text, line.strip())
                fn.permissions(dest)

        # Uninstall all other desktop packages
        for key, data in env_mapping.items():
            if key != desktop:
                check_package_and_remove(self, data)
        if self.ch2.get_active():
            GLib.idle_add(self.desktopr_stat.set_text, "Clearing configuration files .....")
            for key, files in file_mapping.items():
                if key != desktop:
                    for file_path in files:
                        file_path_config = file_path.replace("/etc/skel", fn.home)
                        print(f"Removing {file_path_config}...")
                        GLib.idle_add(self.desktopr_stat.set_text, f"Removing {file_path_config}...")
                        fn.remove_file(file_path_config)
        GLib.idle_add(self.desktopr_stat.set_text, "")
        GLib.idle_add(self.desktop_status.set_text, "This desktop is installed")
        GLib.idle_add(
            fn.show_in_app_notification, self, desktop + " has been installed"
        )
        print("----------------------------------------------------------------")
        print(desktop + " has been installed")
        print("----------------------------------------------------------------")
    else:
        GLib.idle_add(
            self.desktop_status.set_markup, "This desktop is <b>NOT</b> installed"
        )
        GLib.idle_add(
            self.desktopr_error.set_text, "Install " + desktop + " via terminal"
        )
        # GLib.idle_add(self.desktopr_stat.set_text, "An error has occured in installation")
        GLib.idle_add(
            fn.show_in_app_notification, self, desktop + " has not been installed"
        )
        print("----------------------------------------------------------------")
        print(desktop + " has NOT been installed")
        print("----------------------------------------------------------------")
    fn.create_log(self)
