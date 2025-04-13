#!/usr/bin/env python3
# =================================================================
# =          Authors: Brad Heffernan & Erik Dubois                =
# =================================================================
import gi
import os

# import conflicts
# import sys

# import wnck
import subprocess
import threading
import shutil
import socket
from time import sleep
from queue import Queue

import ui.GUI as GUI
from ui.MessageDialog import MessageDialogBootloader
from ui.MessageDialog import MessageDialog

gi.require_version("Gtk", "3.0")
# gi.require_version("Wnck", "3.0")
from gi.repository import Gtk, GdkPixbuf, GLib, Gdk  # Wnck

base_dir = os.path.abspath(os.path.join(os.path.dirname(__file__)))
REMOTE_SERVER = "www.bing.com"
# css = """
# box#stack_box{
#     padding: 10px 10px 10px 10px;
# }
# button#button_grub_boot_enabled{
#      font-weight: bold;
#      background-color: @theme_base_color_button;
# }
# button#button_systemd_boot_enabled{
#      font-weight: bold;
#      background-color: @theme_base_color_button;
# }
# button#button_easy_install_enabled{
#      font-weight: bold;
#      background-color: @theme_base_color_button;
# }
# button#button_adv_install_enabled{
#      font-weight: bold;
#      background-color: @theme_base_color_button;
# }
# label#label_style {
#     background-color: @theme_base_color;
#     border-top: 1px solid @borders;
#     border-bottom: 1px solid @borders;
#     border-left: 1px solid @borders;
#     border-right: 1px solid @borders;
#     padding: 10px 10px 10px 10px;
#     border-radius: 100px;
#     font-weight: bold;
#     color: #fcfcfc;
#     font-family: 'Open Sans', 'Helvetica', sans-serif;
# }
# """

css = """ """


class Main(Gtk.Window):
    def __init__(self):
        super(Main, self).__init__(title="Athena Welcome")
        self.set_border_width(10)
        self.set_default_size(860, 250)
        self.set_icon_from_file(os.path.join(base_dir, "images/athenaos.svg"))
        self.set_position(Gtk.WindowPosition.CENTER)
        self.results = ""

        if not os.path.exists(GUI.Settings):
            if not os.path.exists(GUI.home + "/.config/athena-welcome/"): # If the path does not exist, create it
                os.mkdir(GUI.home + "/.config/athena-welcome/")
            with open(GUI.Settings, "w") as f:
                lines = ["autostart=True\n", "role=none"]
                f.writelines(lines)
                f.close()

        self.style_provider = Gtk.CssProvider()
        self.style_provider.load_from_data(css, len(css))

        Gtk.StyleContext.add_provider_for_screen(
            Gdk.Screen.get_default(),
            self.style_provider,
            Gtk.STYLE_PROVIDER_PRIORITY_APPLICATION,
        )

        # a queue to store package install progress
        self.pkg_queue = Queue()

        # default pacman lockfile
        self.pacman_lockfile = "/var/lib/pacman/db.lck"

        # get the username of the user running the welcome app
        self.sudo_username = os.getlogin()

        self.calamares_polkit = "/usr/bin/calamares_polkit"

        self.session = None

        self.get_session()

        GUI.GUI(self, Gtk, GdkPixbuf)

        threading.Thread(
            target=self.internet_notifier, args=(), daemon=True
        ).start()

    # returns the login session
    def get_session(self):
        try:
            self.session = os.environ.get("XDG_SESSION_TYPE")
        except Exception as e:
            print("Exception in get_session(): %s" % e)

    def on_settings_clicked(self, widget):
        self.toggle_popover()

    def toggle_popover(self):
        if self.popover.get_visible():
            self.popover.hide()
        else:
            self.popover.show_all()

    # check if path exists
    # used to check if /sys/firmware/efi/fw_platform_size exists
    # if yes then display systemd-boot bootloader install option
    def file_check(self, path):
        if os.path.isfile(path):
            return True

        return False

    def on_role_combo_changed(self, combo):
        #GUI.role_name = combo.get_active_iter()
        tree_iter = combo.get_active_iter()
        if tree_iter is not None:
            model = combo.get_model()
            GUI.role_name = model[tree_iter][0]
            print("Selected: role=%s" % GUI.role_name)
            if "Blue Teamer" in GUI.role_name:
                self.role_id = "blue"
            elif "Bug Bounty Hunter" in GUI.role_name:
                self.role_id = "bugbounty"
            elif "Cracker Specialist" in GUI.role_name:
                self.role_id = "cracker"
            elif "DoS Tester" in GUI.role_name:
                self.role_id = "dos"
            elif "Enthusiast Student" in GUI.role_name:
                self.role_id = "student"
            elif "Forensic Analyst" in GUI.role_name:
                self.role_id = "forensic"
            elif "Malware Analyst" in GUI.role_name:
                self.role_id = "malware"
            elif "Mobile Analyst" in GUI.role_name:
                self.role_id = "mobile"
            elif "Network Analyst" in GUI.role_name:
                self.role_id = "network"
            elif "OSINT Specialist" in GUI.role_name:
                self.role_id = "osint"
            elif "Red Teamer" in GUI.role_name:
                self.role_id = "red"
            elif "Web Pentester" in GUI.role_name:
                self.role_id = "web"

    def on_roles_clicked(self, widget):
        if GUI.command_exists("pacman"):
            app_cmd = [
                "shell-rocket",
                "-c",
                "pkexec cyber-toolkit "+self.role_id,
            ]
        elif GUI.command_exists("nixos-rebuild"):
            app_cmd = [
                "shell-rocket",
                "-c",
                "pkexec bash -c \"sed -i '/cyber\\s*=\\s*{/,/}/ { /enable\\s*=\\s*/s/enable\\s*=\\s*.*/enable = true;/; /role\\s*=\\s*/s/role\\s*=\\s*.*/role = \\\"" + self.role_id + "\\\";/}' /etc/nixos/configuration.nix && nixos-rebuild switch\"",
            ]

        threading.Thread(target=self.run_app, args=(app_cmd,), daemon=True).start()

    def on_mirror_clicked(self, widget):
        threading.Thread(target=self.mirror_update, daemon=True).start()

    def convert_to_hex(self, rgba_color):
        red = int(rgba_color.red * 255)
        green = int(rgba_color.green * 255)
        blue = int(rgba_color.blue * 255)
        return "#{r:02x}{g:02x}{b:02x}".format(r=red, g=green, b=blue)

    # install tui option
    def on_install_tui_clicked(self, widget):
        run_cmd = [
            "shell-rocket",
            "-c",
            "pkexec aegis-tui",
        ]

        threading.Thread(target=self.run_app, args=(run_cmd,), daemon=True).start()

    # offline install option
    def on_easy_install_clicked(self, widget):
        if not os.path.exists(self.pacman_lockfile):
            widget.set_name("button_easy_install_enabled")
            widget.get_child().set_markup(
                "<span size='large'><b>Easy Installation (Offline)</b></span>"
            )
            # DEPRECATED NOTICE: get_style_context deprecated in gtk 4.10 and will be removed in gtk 5.0
            selected_bg_color = widget.get_style_context().lookup_color(
                "theme_selected_bg_color"
            )
            if selected_bg_color[0] is True:
                theme_bg_hex_color = self.convert_to_hex(selected_bg_color[1])

                custom_css = css.replace("@theme_base_color_button", theme_bg_hex_color)

                self.style_provider.load_from_data(custom_css, len(custom_css))

            self.button_adv_install.set_name("button_adv_install")

            settings_beginner_file = "/etc/calamares/settings-beginner.conf"
            packages_no_sys_update_file = (
                "/etc/calamares/modules/packages-no-system-update.conf"
            )

            app_cmd = [
                "sudo",
                "cp",
                settings_beginner_file,
                "/etc/calamares/settings.conf",
            ]
            threading.Thread(target=self.run_app, args=(app_cmd,), daemon=True).start()

            app_cmd = [
                "sudo",
                "cp",
                packages_no_sys_update_file,
                "/etc/calamares/modules/packages.conf",
            ]

            threading.Thread(target=self.run_app, args=(app_cmd,), daemon=True).start()

            # arconet specific
            check_file_path = "/etc/dev-rel"
            arconet_found = False
            # Try to open and read from /etc/dev-rel to check for "arconet"
            try:
                with open(check_file_path, "r") as check_file:
                    for line in check_file:
                        if "arconet" in line:
                            arconet_found = True
                            break
            except FileNotFoundError:
                print(f"The file {check_file_path} was not found.")
            except Exception as e:
                print(f"An error occurred: {e}")

            if arconet_found:
                # The path to the file you want to edit
                file_path = "/etc/calamares/modules/shellprocess-before.conf"
                file_path_offline = (
                    "/etc/calamares/modules/shellprocess-before-offline.conf"
                )

                app_cmd = [
                    "sudo",
                    "cp",
                    file_path_offline,
                    file_path,
                ]

            threading.Thread(target=self.run_app, args=(app_cmd,), daemon=True).start()

            # arcopro specific
            check_file_path = "/etc/dev-rel"
            arcopro_found = False
            # Try to open and read from /etc/dev-rel to check for "arconet"
            try:
                with open(check_file_path, "r") as check_file:
                    for line in check_file:
                        if "arcopro" in line:
                            arcopro_found = True
                            break
            except FileNotFoundError:
                print(f"The file {check_file_path} was not found.")
            except Exception as e:
                print(f"An error occurred: {e}")

            if arcopro_found:
                # The path to the file you want to edit
                file_path = "/etc/calamares/modules/shellprocess-before.conf"
                file_path_offline = (
                    "/etc/calamares/modules/shellprocess-before-easy.conf"
                )

                app_cmd = [
                    "sudo",
                    "cp",
                    file_path_offline,
                    file_path,
                ]

            threading.Thread(target=self.run_app, args=(app_cmd,), daemon=True).start()

            efi_file_check = self.file_check("/sys/firmware/efi/fw_platform_size")

            if efi_file_check is True:
                md = MessageDialogBootloader(
                    title="Select bootloader to install",
                    install_method="Easy installation (offline)",
                    pacman_lockfile=self.pacman_lockfile,
                    run_app=self.run_app,
                    calamares_polkit=self.calamares_polkit,
                )
                md.show_all()

            else:
                subprocess.Popen([self.calamares_polkit, "-d"], shell=False)
        else:
            print(
                "[ERROR]: Pacman lockfile found %s, is another pacman process running ?"
                % self.pacman_lockfile
            )
            md = Gtk.MessageDialog(
                parent=self,
                flags=0,
                message_type=Gtk.MessageType.WARNING,
                buttons=Gtk.ButtonsType.OK,
                text="Pacman lockfile found %s, is another pacman process running ?"
                % self.pacman_lockfile,
                title="Warning",
            )
            md.run()
            md.destroy()

    # online install option
    def on_adv_install_clicked(self, widget):
        if not os.path.exists(self.pacman_lockfile):
            widget.set_name("button_adv_install_enabled")
            widget.get_child().set_markup(
                "<span size='large'><b>Advanced Installation (Online)</b></span>"
            )

            # DEPRECATED NOTICE: get_style_context deprecated in gtk 4.10 and will be removed in gtk 5.0
            selected_bg_color = widget.get_style_context().lookup_color(
                "theme_selected_bg_color"
            )
            if selected_bg_color[0] is True:
                theme_bg_hex_color = self.convert_to_hex(selected_bg_color[1])

                custom_css = css.replace("@theme_base_color_button", theme_bg_hex_color)

                self.style_provider.load_from_data(custom_css, len(custom_css))

            self.button_easy_install.set_name("button_easy_install")

            settings_adv_file = "/etc/calamares/settings-advanced.conf"
            system_update_file = "/etc/calamares/modules/packages-system-update.conf"

            app_cmd = [
                "sudo",
                "cp",
                "/etc/calamares/settings-advanced.conf",
                "/etc/calamares/settings.conf",
            ]
            threading.Thread(target=self.run_app, args=(app_cmd,), daemon=True).start()

            app_cmd = [
                "sudo",
                "cp",
                system_update_file,
                "/etc/calamares/modules/packages.conf",
            ]

            threading.Thread(target=self.run_app, args=(app_cmd,), daemon=True).start()

            # arconet specific
            check_file_path = "/etc/dev-rel"
            arconet_found = False
            # Try to open and read from /etc/dev-rel to check for "arconet"
            try:
                with open(check_file_path, "r") as check_file:
                    for line in check_file:
                        if "arconet" in line:
                            arconet_found = True
                            break
            except FileNotFoundError:
                print(f"The file {check_file_path} was not found.")
            except Exception as e:
                print(f"An error occurred: {e}")

            if arconet_found:
                # The path to the file you want to edit
                file_path = "/etc/calamares/modules/shellprocess-before.conf"
                file_path_online = (
                    "/etc/calamares/modules/shellprocess-before-online.conf"
                )

                app_cmd = [
                    "sudo",
                    "cp",
                    file_path_online,
                    file_path,
                ]

            threading.Thread(target=self.run_app, args=(app_cmd,), daemon=True).start()

            # arcopro specific
            check_file_path = "/etc/dev-rel"
            arcopro_found = False
            # Try to open and read from /etc/dev-rel to check for "arconet"
            try:
                with open(check_file_path, "r") as check_file:
                    for line in check_file:
                        if "arcopro" in line:
                            arcopro_found = True
                            break
            except FileNotFoundError:
                print(f"The file {check_file_path} was not found.")
            except Exception as e:
                print(f"An error occurred: {e}")

            if arcopro_found:
                # The path to the file you want to edit
                file_path = "/etc/calamares/modules/shellprocess-before.conf"
                file_path_online = (
                    "/etc/calamares/modules/shellprocess-before-advanced.conf"
                )

                app_cmd = [
                    "sudo",
                    "cp",
                    file_path_online,
                    file_path,
                ]

            threading.Thread(target=self.run_app, args=(app_cmd,), daemon=True).start()

            efi_file_check = self.file_check("/sys/firmware/efi/fw_platform_size")

            if efi_file_check is True:
                md = MessageDialogBootloader(
                    title="Select bootloader to install",
                    install_method="Advanced installation (Online)",
                    pacman_lockfile=self.pacman_lockfile,
                    run_app=self.run_app,
                    calamares_polkit=self.calamares_polkit,
                )
                md.show_all()

            else:
                subprocess.Popen([self.calamares_polkit, "-d"], shell=False)

        else:
            print(
                "[ERROR]: Pacman lockfile found %s, is another pacman process running ?"
                % self.pacman_lockfile
            )
            md = Gtk.MessageDialog(
                parent=self,
                flags=0,
                message_type=Gtk.MessageType.WARNING,
                buttons=Gtk.ButtonsType.OK,
                text="Pacman lockfile found %s, is another pacman process running ?"
                % self.pacman_lockfile,
                title="Warning",
            )
            md.run()
            md.destroy()

    def on_gp_clicked(self, widget):
        app_cmd = ["gparted"]
        threading.Thread(target=self.run_app, args=(app_cmd,), daemon=True).start()

    def on_button_htb_clicked(self, widget):
        app_cmd = [
            "shell-rocket",
            "-c",
            "htb-toolkit -u",
        ]

        threading.Thread(target=self.run_app, args=(app_cmd,), daemon=True).start()

    def check_package_installed(self, package):
        pacman_cmd = ["pacman", "-Qi", package]
        try:
            process = subprocess.run(
                pacman_cmd,
                shell=False,
                stdout=subprocess.PIPE,
                stderr=subprocess.STDOUT,
                universal_newlines=True,
            )

            if process.returncode == 0:
                # package is installed
                return True
            else:
                return False
        except subprocess.CalledProcessError as e:
            # package is not installed
            return False

    def on_button_update_clicked(self, widget):
        if GUI.command_exists("pacman"):
            run_cmd = [
                "shell-rocket",
                "-c",
                "pkexec pacman -Syyu",
            ]
        elif GUI.command_exists("nixos-rebuild"):
            run_cmd = [
                "shell-rocket",
                "-c",
                "pkexec bash -c 'nix-channel --update && nixos-rebuild switch'",
            ]

        threading.Thread(target=self.run_app, args=(run_cmd,), daemon=True).start()

    def check_package_queue(self):
        while True:
            items = self.pkg_queue.get()

            if items is not None:
                status, app_cmd, package = items
                try:
                    if status == 0:
                        print("[INFO]: Launching application")
                        self.run_app(app_cmd)

                    if status == 1:
                        print("[ERROR]: Package %s install failed" % package)
                        break

                    sleep(0.2)
                except Exception as e:
                    print("[ERROR]: Exception in check_package_queue(): %s" % e)
                finally:
                    self.pkg_queue.task_done()

    def remove_dev_package(self, pacman_cmd, package):
        try:
            self.label_notify.set_name("label_style")
            GLib.idle_add(
                self.label_notify.show,
            )
            GLib.idle_add(
                self.label_notify.set_markup,
                "<span foreground='orange'><b>Removing dev package %s</b></span>"
                % package,
            )
            GLib.idle_add(
                self.label_notify.hide,
            )

            with subprocess.Popen(
                pacman_cmd,
                stdout=subprocess.PIPE,
                stderr=subprocess.STDOUT,
                bufsize=1,
                universal_newlines=True,
            ) as process:
                while True:
                    if process.poll() is not None:
                        break

                    for line in process.stdout:
                        print(line.strip())

                if not self.check_package_installed(package):
                    print("[INFO]: Pacman %s uninstall completed" % package)
                    GLib.idle_add(
                        self.label_notify.show,
                    )
                    self.label_notify.set_name("label_style")
                    GLib.idle_add(
                        self.label_notify.set_markup,
                        "<span foreground='orange'><b>Dev package %s removed</b></span>"
                        % package,
                    )
                    GLib.idle_add(
                        self.label_notify.hide,
                    )
                else:
                    print("[ERROR]: Pacman %s uninstall failed" % package)
                    self.label_notify.set_name("label_style")
                    GLib.idle_add(
                        self.label_notify.show,
                    )
                    GLib.idle_add(
                        self.label_notify.set_markup,
                        "<span foreground='orange'><b>Failed to remove dev package %s</b></span>"
                        % package,
                    )

        except Exception as e:
            print("[ERROR]: Exception in remove_dev_package(): %s" % e)
            self.label_notify.set_name("label_style")
            GLib.idle_add(
                self.label_notify.show,
            )
            GLib.idle_add(
                self.label_notify.set_markup,
                "<span foreground='orange'><b>Failed to remove dev package %s</b></span>"
                % package,
            )

    def install_package(self, app_cmd, pacman_cmd, package):
        try:
            self.label_notify.set_name("label_style")

            GLib.idle_add(
                self.label_notify.set_markup,
                "<span foreground='orange'><b>Installing %s</b></span>" % package,
            )

            with subprocess.Popen(
                pacman_cmd,
                stdout=subprocess.PIPE,
                stderr=subprocess.STDOUT,
                bufsize=1,
                universal_newlines=True,
            ) as process:
                while True:
                    if process.poll() is not None:
                        break

                    for line in process.stdout:
                        print(line.strip())

                if self.check_package_installed(package):
                    self.pkg_queue.put((0, app_cmd, package))
                    print("[INFO]: Pacman package install completed")
                    self.label_notify.set_name("label_style")
                    GLib.idle_add(
                        self.label_notify.show,
                    )
                    GLib.idle_add(
                        self.label_notify.set_markup,
                        "<span foreground='orange'><b>Package %s installed</b></span>"
                        % package,
                    )
                    GLib.idle_add(
                        self.label_notify.hide,
                    )
                else:
                    self.pkg_queue.put((1, app_cmd, package))
                    print("[ERROR]: Pacman package install failed")
                    self.label_notify.set_name("label_style")
                    GLib.idle_add(
                        self.label_notify.show,
                    )
                    GLib.idle_add(
                        self.label_notify.set_markup,
                        "<span foreground='orange'><b>Package %s install failed</b></span>"
                        % package,
                    )

        except Exception as e:
            print("[ERROR]: Exception in install_package(): %s" % e)
            self.label_notify.set_name("label_style")
            GLib.idle_add(
                self.label_notify.show,
            )
            GLib.idle_add(
                self.label_notify.set_markup,
                "<span foreground='orange'><b>Package install failed</b></span>",
            )
        finally:
            self.pkg_queue.put(None)

    def run_app(self, app_cmd):
        process = subprocess.run(
            app_cmd,
            shell=False,
            stdout=subprocess.PIPE,
            stderr=subprocess.STDOUT,
            universal_newlines=True,
        )
        # for debugging print stdout to console
        if GUI.debug is True:
            print(process.stdout)

    def startup_toggle(self, widget):
        if widget.get_active() is True:
            if os.path.isfile(GUI.dot_desktop):
                shutil.copy(GUI.dot_desktop, GUI.autostart)
        else:
            if os.path.isfile(GUI.autostart):
                os.unlink(GUI.autostart)
        self.save_settings(widget.get_active())

    def save_settings(self, state):
        with open(GUI.Settings, "r") as f:
            contents = f.read()
            f.close()
        if "role=" in contents:
            role_state = contents.split("role=")[1]
        else:
            role_state = "none"
        with open(GUI.Settings, "w") as f:
            lines = ["autostart=" + str(state) + "\n", "role=" + str(role_state)]
            f.writelines(lines)
            f.close()

    def load_settings(self):
        line = "True"
        if os.path.isfile(GUI.Settings):
            with open(GUI.Settings, "r") as f:
                lines = f.readlines()
                for i in range(len(lines)):
                    if "autostart" in lines[i]:
                        line = lines[i].split("=")[1].strip().capitalize()
                f.close()
        return line

    def on_link_clicked(self, widget, link):
        t = threading.Thread(target=self.weblink, args=(link,))
        t.daemon = True
        t.start()

    def on_social_clicked(self, widget, event, link):
        t = threading.Thread(target=self.weblink, args=(link,))
        t.daemon = True
        t.start()

    def _on_info_clicked(self, widget, event):
        window_list = Wnck.Screen.get_default().get_windows()
        state = False
        for win in window_list:
            if "Information" in win.get_name():
                state = True
        if not state:
            w = conflicts.Conflicts()
            w.show_all()

    def weblink(self, link):
        # webbrowser.open_new_tab(link)
        try:
            # use xdg-open to use the default browser to open the weblink
            subprocess.Popen(
                ["xdg-open", link],
                shell=False,
                stdout=subprocess.PIPE,
                stderr=subprocess.STDOUT,
            )
        except Exception as e:
            print("Exception in opening weblink(): %s" % e)

    def is_connected(self):
        try:
            host = socket.gethostbyname(REMOTE_SERVER)
            s = socket.create_connection((host, 80), 2)
            s.close()

            return True
        except:  # noqa
            pass

        return False

    def tooltip_callback(self, widget, x, y, keyboard_mode, tooltip, text):
        tooltip.set_text(text)
        return True

    def on_launch_clicked(self, widget, event, link):
        app_cmd = [
            "/usr/bin/archlinux-tweak-tool",
        ]
        pacman_cmd = [
            "pkexec",
            "pacman",
            "-Sy",
            "archlinux-tweak-tool-git",
            "--noconfirm",
            "--needed",
        ]

        if os.path.isfile("/usr/bin/archlinux-tweak-tool"):
            threading.Thread(target=self.run_app, args=(app_cmd,), daemon=True).start()

        else:
            md = MessageDialog(
                title="Install Package",
                message="<b>Arch Linux Tweak Tool</b> is missing, would you like to install it ?",
            )

            md.show_all()
            md.run()
            md.destroy()

            if md.response is True:
                threading.Thread(target=self.check_package_queue, daemon=True).start()
                threading.Thread(
                    target=self.install_package,
                    args=(
                        app_cmd,
                        pacman_cmd,
                        "archlinux-tweak-tool-git",
                    ),
                    daemon=True,
                ).start()

    def internet_notifier(self):
        bb = 0
        dis = 0
        while True:
            if not self.is_connected():
                dis = 1
                GLib.idle_add(self.button_htb.set_sensitive, False)
                GLib.idle_add(self.button_mirrors.set_sensitive, False)
                GLib.idle_add(self.button_roles.set_sensitive, False)
                GLib.idle_add(self.button_update.set_sensitive, False)
                GLib.idle_add(self.button_install_tui.set_sensitive, False)
                self.label_notify.set_name("label_style")
                GLib.idle_add(
                    self.label_notify.set_markup,
                    f"<span foreground='yellow'><b>Not connected to internet</b>\n"
                    f"Some features will <b>not</b> be available</span>",
                )  # noqa
            else:
                self.label_notify.set_name("")
                if bb == 0 and dis == 1:
                    GLib.idle_add(self.button_htb.set_sensitive, True)
                    GLib.idle_add(self.button_mirrors.set_sensitive, True)
                    GLib.idle_add(self.button_roles.set_sensitive, True)
                    GLib.idle_add(self.button_update.set_sensitive, True)
                    GLib.idle_add(self.button_install_tui.set_sensitive, True)
                    GLib.idle_add(self.label_notify.set_text, "")
                    bb = 1
            sleep(3)

    # def mirror_reload(self):
    #     md = Gtk.MessageDialog(parent=self,
    #                            flags=0,
    #                            message_type=Gtk.MessageType.INFO,
    #                            buttons=Gtk.ButtonsType.YES_NO,
    #                            text="You are now connected")
    #     md.format_secondary_markup("Would you like to update the <b>Arch Linux</b> mirrorlist?")
    #     response = md.run()

    #     if response == Gtk.ResponseType.YES:
    #         GLib.idle_add(self.cc.set_markup, "<span foreground='orange'><b><i>Updating your mirrorlist</i></b> \nThis may take some time, please wait...</span>")  # noqa
    #         t = threading.Thread(target=self.mirror_update)
    #         t.daemon = True
    #         t.start()
    #     md.destroy()

    def mirror_update(self):
        GLib.idle_add(self.button_mirrors.set_sensitive, False)
        if GUI.command_exists("pacman"):
            GLib.idle_add(
                self.label_notify.set_markup,
                f"<span foreground='orange'><b>Updating your mirrorlists</b>\n"
                f"This may take some time, please wait...</span>",
            )  # noqa
            
            subprocess.run(
                [
                    "pkexec",
                    "bash",
                    "-c",
                    (
                        "rate-mirrors --concurrency 40 --disable-comments --allow-root --save /etc/pacman.d/mirrorlist arch && "
                        "rate-mirrors --concurrency 40 --disable-comments --allow-root --save /etc/pacman.d/chaotic-mirrorlist chaotic-aur"
                    ),
                ],
                shell=False,
            )
            print("Update mirrors completed")
            GLib.idle_add(self.label_notify.set_markup, "<b>Mirrorlist updated</b>")
        elif GUI.command_exists("nixos-rebuild"):
            GLib.idle_add(
                self.label_notify.set_markup,
                f"<span foreground='orange'><b>Updating your Nix channels</b>\n"
                f"This may take some time, please wait...</span>",
            )  # noqa

            subprocess.run(
                [
                    "pkexec",
                    "nix-channel",
                    "--update",
                ],
                shell=False,
            )
            print("Update channels completed")
            GLib.idle_add(self.label_notify.set_markup, "<b>Channels updated</b>")
        GLib.idle_add(self.button_mirrors.set_sensitive, True)

    # def btrfs_update(self):
    #    if GUI.DEBUG:
    #        path = "/home/bheffernan/Repos/GITS/XFCE/hefftor-calamares-oem-config/calamares/modules/partition.conf"
    #    else:
    #        path = "/etc/calamares/modules/partition.conf"

    #    with open(path, "r") as f:
    #        lines = f.readlines()
    #        f.close()
    #    data = [x for x in lines if "defaultFileSystemType" in x]
    #    pos = lines.index(data[0])

    #    lines[pos] = "defaultFileSystemType:  \"ext4\"\n"

    #    with open(path, "w") as f:
    #        f.writelines(lines)
    #        f.close()

    #    GLib.idle_add(self.MessageBox,"Success", "Your filesystem has been changed.")

    # def finished_mirrors(self):
    #     md = Gtk.MessageDialog(parent=self,
    #                            flags=0,
    #                            message_type=Gtk.MessageType.INFO,
    #                            buttons=Gtk.ButtonsType.OK,
    #                            text="Finished")
    #     md.format_secondary_markup("Mirrorlist has been updated!")
    #     md.run()
    #     md.destroy()
    #     GLib.idle_add(self.cc.set_markup, "")
    #     GLib.idle_add(self.button8.set_sensitive, True)

    def MessageBox(self, title, message):
        md = Gtk.MessageDialog(
            parent=self,
            flags=0,
            message_type=Gtk.MessageType.INFO,
            buttons=Gtk.ButtonsType.OK,
            text=title,
        )
        md.format_secondary_markup(message)
        md.run()
        md.destroy()

    def installATT(self):
        subprocess.call(
            [
                "pkexec",
                "/usr/bin/pacman",
                "-S",
                "archlinux-tweak-tool-git",
                "--noconfirm",
            ],
            shell=False,
        )
        GLib.idle_add(
            self.MessageBox,
            "Success!",
            "<b>ArcoLinux Tweak Tool</b> has been installed successfully",
        )  # noqa

    # def get_message(self, title, message):
    #     t = threading.Thread(target=self.fetch_notice,


#                              args=(title, message,))
#     t.daemon = True
#     t.start()
#     t.join()

# def fetch_notice(self, title, message):
#     try:
#         url = 'https://bradheff.github.io/notice/notice'
#         req = requests.get(url, verify=True, timeout=1)

#         if req.status_code == requests.codes.ok:
#             if not len(req.text) <= 1:
#                 title.set_markup(
#                 "<big><b><u>Notice</u></b></big>")
#                 message.set_markup(req.text)
#                 self.results = True
#             else:
#                 self.results = False
#         else:
#             self.results = False
#     except:
#         self.results = False


if __name__ == "__main__":
    w = Main()
    w.connect("delete-event", Gtk.main_quit)
    w.show_all()
    Gtk.main()
