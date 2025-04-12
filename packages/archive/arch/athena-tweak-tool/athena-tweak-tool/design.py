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
# =                         Designs                             =
# =================================================================

designs = [
    "Akame",
    "Cyborg",
    "Graphite",
    "Hack The Box",
    "Samurai",
    "Sweet",
    "Temple",
]
pkexec = ["pkexec", "pacman", "-S", "--needed", "--noconfirm", "--ask=4"]
pkexec_reinstall = ["pkexec", "pacman", "-S", "--noconfirm", "--ask=4"]
copy = ["cp", "-Rv"]

design_mapping = {
    "Akame": "athena-akame-theme",
    "Cyborg": "athena-cyborg-theme",
    "Graphite": "athena-graphite-theme",
    "Hack The Box": "athena-htb-theme",
    "Samurai": "athena-samurai-theme",
    "Sweet": "athena-sweetdark-theme",
    "Temple": "athena-temple-theme",
}


def check_design(design):
    """check if the design is installed"""
    pkg = design_mapping.get(design)
    if fn.check_package_installed(pkg):
        return True
    return False


def check_lock(self, design, state):
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
                target=install_design,
                args=(self, self.d_combo_design.get_active_text(), state),
            )
            t1.daemon = True
            t1.start()
    else:
        # print("NO FILE")
        t1 = fn.threading.Thread(
            target=install_design, args=(self, self.d_combo_design.get_active_text(), state)
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


def install_design(self, design, state):
    pkg = design_mapping.get(design)
    command = np.array([pkg])

    GLib.idle_add(self.design_prog.set_fraction, 0.2)

    timeout_id = None
    timeout_id = GLib.timeout_add(100, fn.do_pulse, None, self.design_prog)
    print("----------------------------------------------------------------")
    print("Packages list to install")
    print("----------------------------------------------------------------")
    print(command)
    print("----------------------------------------------------------------")

    if state == "reinst":
        com1 = pkexec_reinstall
        if self.ch1.get_active():
            GLib.idle_add(self.design_stat.set_text, "Clearing cache .....")
            fn.subprocess.call(
                ["sh", "-c", "yes | pkexec pacman -Scc"],
                shell=False,
                stdout=fn.subprocess.PIPE,
            )
    else:
        com1 = pkexec

    # print(list(np.append(com1, command)))
    GLib.idle_add(
        self.design_stat.set_text,
        "Installing " + self.d_combo_design.get_active_text() + "...",
    )

    for line in command:
        package_name = line if isinstance(line, str) else line[0]
        print(f"   Installing: {package_name}")
        GLib.idle_add(
            self.design_stat.set_text,
            f"   Installing {package_name}...",
        )

        try:
            process = fn.subprocess.Popen(
                list(np.append(com1, line)),
                bufsize=1,
                stdout=fn.subprocess.PIPE,
                stderr=fn.subprocess.PIPE,  # Capture stderr for error handling
                universal_newlines=True,
            )

            stdout, stderr = process.communicate()  # Read both stdout and stderr
            process_return_code = process.returncode  # Get the return code

            for output_line in stdout.splitlines():
                GLib.idle_add(self.design_stat.set_text, output_line.strip())

            try:
                # Check the return code for success or failure
                if process_return_code == 0:
                    if fn.check_package_installed(package_name):
                        print(f"{package_name} is installed")
                        GLib.idle_add(
                            self.design_stat.set_text,
                            f"Successfully installed {package_name}.",
                        )
                        env = fn.get_user_env_from_proc(fn.sudo_username)
                        subproc = fn.subprocess.Popen(
                            ["sudo", "-u", fn.sudo_username, "env", f"DISPLAY={env['DISPLAY']}", f"XAUTHORITY={env['XAUTHORITY']}", f"DBUS_SESSION_BUS_ADDRESS={env['DBUS_SESSION_BUS_ADDRESS']}", f"XDG_CURRENT_DESKTOP={env['XDG_CURRENT_DESKTOP']}", "theme-switcher", design.replace(" ", "")],
                            bufsize=1,
                            stdout=fn.subprocess.PIPE,
                            stderr=fn.subprocess.PIPE,  # Capture stderr for error handling
                            universal_newlines=True,
                        )
                        stdout, stderr = subproc.communicate()  # Read both stdout and stderr
                        subproc_return_code = subproc.returncode  # Get the return code
                    else:
                        print(
                            f"{package_name} IS NOT INSTALLED - REMOVE CONFLICTING PACKAGE(S)"
                        )
                        GLib.idle_add(
                            self.design_stat.set_text,
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
                            self.design_stat.set_text,
                            f"Installation failed: {conflict_message}",
                        )
                    else:
                        print(f"Failed to install {package_name}: {stderr}")
                        GLib.idle_add(
                            self.design_stat.set_text,
                            f"Failed to install {package_name}. Error: {stderr}",
                        )

            except Exception as e:
                print(f"An error occurred while installing {package_name}: {str(e)}")
                GLib.idle_add(
                    self.design_stat.set_text,
                    f"An error occurred: {str(e)}",
                )
        except Exception as e:
            print(f"An error occurred while installing {package_name}: {str(e)}")
            GLib.idle_add(
                self.design_stat.set_text,
                f"An error occurred: {str(e)}",
            )

    # with fn.subprocess.Popen(
    #     list(np.append(com1, command)),
    #     bufsize=1,
    #     stdout=fn.subprocess.PIPE,
    #     universal_newlines=True,
    # ) as p:
    #     for line in p.stdout:
    #         GLib.idle_add(self.design_stat.set_text, line.strip())
    # print("----------------------------------------------------------------")

    GLib.source_remove(timeout_id)
    timeout_id = None
    GLib.idle_add(self.design_prog.set_fraction, 0)

    if check_design(design):
        pkg = design_mapping.get(design)

        # Uninstall all other design packages
        for key, data in design_mapping.items():
            if key != design:
                check_package_and_remove(self, data)
        GLib.idle_add(self.design_stat.set_text, "")
        GLib.idle_add(self.design_status.set_text, "This design is installed")
        GLib.idle_add(
            fn.show_in_app_notification, self, design + " design has been installed"
        )
        print("----------------------------------------------------------------")
        print(design + " design has been installed")
        print("----------------------------------------------------------------")
    else:
        GLib.idle_add(
            self.design_status.set_markup, "This design is <b>NOT</b> installed"
        )
        GLib.idle_add(
            self.design_error.set_text, "Install " + pkg + " via terminal"
        )
        # GLib.idle_add(self.design_stat.set_text, "An error has occured in installation")
        GLib.idle_add(
            fn.show_in_app_notification, self, design + " design has not been installed"
        )
        print("----------------------------------------------------------------")
        print(design + " design has NOT been installed")
        print("----------------------------------------------------------------")
    fn.create_log(self)

