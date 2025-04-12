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

default_app = ["nano", "ttf-hack"]

# =================================================================
# =                           Login                               =
# =================================================================

logins = [
    "Astronaut",
    "Black Hole",
    "Cyberpunk",
    "Cyborg",
    "Kath",
    "Jake The Dog",
    "Pixel Sakura",
    "Post Apocalypse",
    "Purple Leaves",
]
pkexec = ["pkexec", "pacman", "-S", "--needed", "--noconfirm", "--ask=4"]
pkexec_reinstall = ["pkexec", "pacman", "-S", "--noconfirm", "--ask=4"]
copy = ["cp", "-Rv"]

login_mapping = {
    "Astronaut": "astronaut",
    "Black Hole": "black_hole",
    "Cyberpunk": "cyberpunk",
    "Cyborg": "japanese_aesthetic",
    "Kath": "hyprland_kath",
    "Jake The Dog": "jake_the_dog",
    "Pixel Sakura": "pixel_sakura",
    "Post Apocalypse": "postapocalyptic_hacker",
    "Purple Leaves": "purple_leaves",
}

def check_login(login):
    """Check if the theme metadata references the given login in ConfigFile"""
    metadata_path = "/usr/share/sddm/themes/sddm-astronaut-theme/metadata.desktop"
    login_greeter = login_mapping.get(login)

    if not os.path.isfile(metadata_path):
        return False
    with open(metadata_path, "r") as f:
        for line in f:
            line = line.strip()
            if line.startswith("ConfigFile="):
                config_value = line.split("=", 1)[1].strip()
                return login_greeter in config_value
    return False

def install_login(self, login, state):
    login_greeter = login_mapping.get(login)
    base_dir = fn.path.dirname(fn.path.realpath(__file__))
    command = [ base_dir + "/data/any/archlinux-sddm-greeter", login_greeter ]

    GLib.idle_add(self.login_prog.set_fraction, 0.2)

    timeout_id = None
    timeout_id = GLib.timeout_add(100, fn.do_pulse, None, self.login_prog)
    print("----------------------------------------------------------------")
    print("SDDM greeter to apply")
    print("----------------------------------------------------------------")
    print(login_greeter)
    print("----------------------------------------------------------------")

    # print(list(np.append(com1, command)))
    GLib.idle_add(
        self.login_stat.set_text,
        "Applying " + self.d_combo_login.get_active_text() + "...",
    )

    try:
        process = fn.subprocess.Popen(
            command,
            bufsize=1,
            stdout=fn.subprocess.PIPE,
            stderr=fn.subprocess.PIPE,  # Capture stderr for error handling
            universal_newlines=True,
        )

        stdout, stderr = process.communicate()  # Read both stdout and stderr
        process_return_code = process.returncode  # Get the return code

        for output_line in stdout.splitlines():
            GLib.idle_add(self.login_stat.set_text, output_line.strip())

        try:
            # Check the return code for success or failure
            if process_return_code == 0:
                GLib.idle_add(
                    self.login_stat.set_text,
                    f"Successfully {login_greeter} applied.",
                )
            else:
                GLib.idle_add(
                    self.login_stat.set_text,
                    f"Failed to apply {login_greeter}.",
                )

        except Exception as e:
            print(f"An error occurred while installing {login_greeter}: {str(e)}")
            GLib.idle_add(
                self.login_stat.set_text,
                f"An error occurred: {str(e)}",
            )
    except Exception as e:
        print(f"An error occurred while installing {login_greeter}: {str(e)}")
        GLib.idle_add(
            self.login_stat.set_text,
            f"An error occurred: {str(e)}",
        )

    GLib.source_remove(timeout_id)
    timeout_id = None
    GLib.idle_add(self.login_prog.set_fraction, 0)
    fn.create_log(self)

