#!/usr/bin/env python3

# ============================================================
# Inspired by Arch Linux Tweak Tool
# ============================================================
# pylint:disable=C0103,C0115,C0116,C0411,C0413,E1101,E0213,I1101,R0902,R0904,R0912,R0913,R0914,R0915,R0916,R1705,W0613,W0621,W0622,W0702,W0703
# pylint:disable=C0301,C0302 #line too long

import zsh_theme
import utilities
import user
import themer
import design
import terminals
import support
import splash
import settings
import services
import sddm
import pacman_functions
import fastfetch
import lxdm
import login
import lightdm
import fixes
import gui
import att
import desktopr
import autostart
from packages_prompt_gui import PackagesPromptGui
from subprocess import call
import os
import subprocess
import signal
import datetime
import functions as fn
import gi
import fastfetch_gui
import utilities


gi.require_version("Gtk", "3.0")
from gi.repository import Gdk, GdkPixbuf, Gtk, Pango, GLib
from os import readlink

# from time import sleep
# from subprocess import PIPE, STDOUT, call
# import polybar


base_dir = fn.path.dirname(fn.path.realpath(__file__))
pmf = pacman_functions


class Main(Gtk.Window):
    def __init__(self):
        print(
            "---------------------------------------------------------------------------"
        )
        print("If you have errors, report it on Athena GitHub project or Athena Discord Server")
        print(
            "---------------------------------------------------------------------------"
        )
        print("Link:")
        print(" - Athena OS - https://athenaos.org/")
        print(
            "---------------------------------------------------------------------------"
        )
        print("Backups of files related to the ATT are created.")
        print("You can recognize them by the extension .bak or .back")
        print("If we have a reset button, the backup file will be used")
        print(
            "---------------------------------------------------------------------------"
        )
        print("[INFO] : pkgver = pkgversion")
        print("[INFO] : pkgrel = pkgrelease")
        print(
            "---------------------------------------------------------------------------"
        )
        print("[INFO] : Distro = " + fn.distr)
        print(
            "---------------------------------------------------------------------------"
        )

        print("[INFO] : User = " + fn.sudo_username)
        fn.findgroup()
        print(
            "---------------------------------------------------------------------------"
        )
        super(Main, self).__init__(title="Athena Tweak Tool")
        self.set_border_width(10)
        self.connect("delete-event", self.on_close)
        self.set_position(Gtk.WindowPosition.CENTER)
        self.set_icon_from_file(fn.path.join(base_dir, "images/archlinux.png"))
        self.set_default_size(1150, 920)

        self.opened = True
        self.firstrun = True
        # self.desktop = ""
        self.timeout_id = None

        self.design_status = Gtk.Label()
        self.desktop_status = Gtk.Label()
        self.login_status = Gtk.Label()
        self.image_design = Gtk.Image()
        self.image_DE = Gtk.Image()
        self.image_login = Gtk.Image()

        self.grub_image_path = ""
        self.login_wallpaper_path = ""
        self.fb = Gtk.FlowBox()
        self.flowbox_wall = Gtk.FlowBox()

        splScr = splash.SplashScreen()

        while Gtk.events_pending():
            Gtk.main_iteration()

        # t = fn.threading.Thread(target=fn.get_desktop,
        #                                args=(self,))
        # t.daemon = True
        # t.start()
        # t.join()

        # print(self.desktop)

        # in a video ATT did not change - lateron it did...?
        # if fn.path.isdir("/root/.config/xfce4/xfconf/xfce-perchannel-xml/"):
        #     try:
        #         fn.shutil.rmtree("/root/.config/xfce4/xfconf/xfce-perchannel-xml/")
        #         if fn.path.isdir(
        #             fn.home + "/.config/xfce4/xfconf/xfce-perchannel-xml/"
        #         ):
        #             fn.shutil.copytree(
        #                 fn.home + "/.config/xfce4/xfconf/xfce-perchannel-xml/",
        #                 "/root/.config/xfce4/xfconf/xfce-perchannel-xml/",
        #             )
        #     except Exception as error:
        #         print(error)

        # =====================================================
        #     ENSURING WE HAVE THE DIRECTORIES WE NEED
        # =====================================================

        # make directory if it doesn't exist
        if not fn.path.isdir(fn.log_dir):
            try:
                fn.mkdir(fn.log_dir)
            except Exception as error:
                print(error)

        # make directory if it doesn't exist
        if not fn.path.isdir(fn.att_log_dir):
            try:
                fn.mkdir(fn.att_log_dir)
            except Exception as error:
                print(error)

        # ensuring we have a neofetch directory
        if not fn.path.exists(fn.home + "/.config/neofetch"):
            try:
                fn.makedirs(fn.home + "/.config/neofetch", 0o766)
                fn.permissions(fn.home + "/.config/neofetch")
            except Exception as error:
                print(error)

        # ensuring we have a fastfetch directory
        if not fn.path.exists(fn.home + "/.config/fastfetch"):
            try:
                fn.makedirs(fn.home + "/.config/fastfetch", 0o766)
                fn.permissions(fn.home + "/.config/fastfetch")
            except Exception as error:
                print(error)

        # ensuring we have .autostart
        if not fn.path.exists(fn.home + "/.config/autostart"):
            try:
                fn.makedirs(fn.home + "/.config/autostart", 0o766)
                fn.permissions(fn.home + "/.config/autostart")
            except Exception as error:
                print(error)

        # ensuring we have a directory for backups
        if not fn.path.isdir(fn.home + "/.config/athena-tweak-tool"):
            try:
                fn.makedirs(fn.home + "/.config/athena-tweak-tool", 0o766)
                fn.permissions(fn.home + "/.config/athena-tweak-tool")
            except Exception as error:
                print(error)

        # if there is a file called default remove it
        if fn.path.isfile("/usr/share/icons/default"):
            try:
                fn.unlink("/usr/share/icons/default")
            except Exception as error:
                print(error)

        # ensuring we have an index.theme
        if not fn.path.isdir("/usr/share/icons/default"):
            try:
                fn.makedirs("/usr/share/icons/default", 0o755)
            except Exception as error:
                print(error)

        if not fn.path.isfile("/usr/share/icons/default/index.theme"):
            if fn.path.isfile("/usr/share/icons/default/index.theme.bak"):
                try:
                    fn.shutil.copy(
                        "/usr/share/icons/default/index.theme.bak",
                        "/usr/share/icons/default/index.theme",
                    )
                except Exception as error:
                    print(error)
            else:
                try:
                    fn.shutil.copy(
                        "/usr/share/athena-tweak-tool/data/arco/cursor/index.theme",
                        "/usr/share/icons/default/index.theme",
                    )
                except Exception as error:
                    print(error)

        # =====================================================
        #                   MAKING BACKUPS
        # =====================================================

        # ensuring we have a backup of /etc/sddm.conf.d/kde_settings.conf
        # no backups in this folder - it confuses sddm.conf.d

        # sddm_default_d1 = "/etc/sddm.conf"
        # sddm_default_d1_bak = "/etc/bak.sddm.conf"
        # sddm_default_d2 = "/etc/sddm.conf.d/kde_settings.conf"
        # sddm_default_d2_bak = "/etc/bak.kde_settings.conf"

        if fn.path.isfile(fn.sddm_default_d1):
            if not fn.path.isfile(fn.sddm_default_d1_bak):
                try:
                    fn.shutil.copy(fn.sddm_default_d1, fn.sddm_default_d1_bak)
                except Exception as error:
                    print(error)

        if fn.path.isfile(fn.sddm_default_d2):
            if not fn.path.isfile(fn.sddm_default_d2_bak):
                try:
                    fn.shutil.copy(fn.sddm_default_d2, fn.sddm_default_d2_bak)
                except Exception as error:
                    pass

        # ensuring we have a backup of /etc/lightdm/lightdm.conf
        if fn.path.isfile(fn.lightdm_conf):
            if not fn.path.isfile(fn.lightdm_conf_bak):
                try:
                    fn.shutil.copy(fn.lightdm_conf, fn.lightdm_conf_bak)
                except Exception as error:
                    print(error)

        # ensuring we have a backup of /etc/lightdm/lightdm-gtk-greeter.conf
        if fn.path.isfile(fn.lightdm_greeter):
            if not fn.path.isfile(fn.lightdm_greeter_bak):
                try:
                    fn.shutil.copy(fn.lightdm_greeter, fn.lightdm_greeter_bak)
                except Exception as error:
                    print(error)

        # ensuring we have a backup of /etc/lightdm/slick-greeter.conf
        if fn.path.isfile(fn.lightdm_slick_greeter):
            if not fn.path.isfile(fn.lightdm_slick_greeter_bak):
                try:
                    fn.shutil.copy(
                        fn.lightdm_slick_greeter, fn.lightdm_slick_greeter_bak
                    )
                except Exception as error:
                    print(error)

        # ensuring we have a backup of /etc/lxdm/lxdm.conf
        if fn.path.isfile(fn.lxdm_conf):
            if not fn.path.isfile(fn.lxdm_conf_bak):
                try:
                    fn.shutil.copy(fn.lxdm_conf, fn.lxdm_conf_bak)
                except Exception as error:
                    print(error)

        # ensuring we have a backup of index.theme
        if fn.path.exists("/usr/share/icons/default/index.theme"):
            if not fn.path.isfile("/usr/share/icons/default/index.theme" + ".bak"):
                try:
                    fn.shutil.copy(
                        "/usr/share/icons/default/index.theme",
                        "/usr/share/icons/default/index.theme" + ".bak",
                    )
                except Exception as error:
                    print(error)

        # ensuring we have a backup of samba.conf
        if fn.path.exists("/etc/samba/smb.conf"):
            if not fn.path.isfile("/etc/samba/smb.conf" + ".bak"):
                try:
                    fn.shutil.copy(
                        "/etc/samba/smb.conf", "/etc/samba/smb.conf" + ".bak"
                    )
                except Exception as error:
                    print(error)

        # ensuring we have a backup of the nsswitch.conf
        if fn.path.exists("/etc/nsswitch.conf"):
            if not fn.path.isfile("/etc/nsswitch.conf" + ".bak"):
                try:
                    fn.shutil.copy("/etc/nsswitch.conf", "/etc/nsswitch.conf" + ".bak")
                except Exception as error:
                    print(error)

        # ensuring we have a backup of the config.fish
        if not fn.path.isfile(
            fn.home + "/.config/fish/config.fish" + ".bak"
        ) and fn.path.isfile(fn.home + "/.config/fish/config.fish"):
            try:
                fn.shutil.copy(
                    fn.home + "/.config/fish/config.fish",
                    fn.home + "/.config/fish/config.fish" + ".bak",
                )
                fn.permissions(fn.home + "/.config/fish/config.fish.bak")
            except Exception as error:
                print(error)

        # ensuring we have a backup or the athena mirrorlist
        if fn.path.isfile(fn.athena_mirrorlist):
            if not fn.path.isfile(fn.athena_mirrorlist + ".bak"):
                try:
                    fn.shutil.copy(
                        fn.athena_mirrorlist, fn.athena_mirrorlist + ".bak"
                    )
                except Exception as error:
                    print(error)

        # # ensuring we have a backup or the xerolinux mirrorlist
        # if fn.path.isfile(fn.xerolinux_mirrorlist):
        #     if not fn.path.isfile(fn.xerolinux_mirrorlist + ".bak"):
        #         try:
        #             fn.shutil.copy(
        #                 fn.xerolinux_mirrorlist, fn.xerolinux_mirrorlist + ".bak"
        #             )
        #         except Exception as error:
        #             print(error)

        # ensuring we have a backup of the archlinux mirrorlist
        if fn.path.isfile(fn.mirrorlist):
            if not fn.path.isfile(fn.mirrorlist + ".bak"):
                try:
                    fn.shutil.copy(fn.mirrorlist, fn.mirrorlist + ".bak")
                except Exception as error:
                    print(error)

        # ensuring we have a backup of current /etc/hosts
        if fn.path.isfile("/etc/hosts"):
            try:
                if not fn.path.isfile("/etc/hosts" + ".bak"):
                    fn.shutil.copy("/etc/hosts", "/etc/hosts" + ".bak")
            except Exception as error:
                print(error)

        # ensuring we have a backup of current neofetch
        if fn.path.isfile(fn.neofetch_config):
            try:
                if not fn.path.isfile(fn.neofetch_config + ".bak"):
                    fn.shutil.copy(fn.neofetch_config, fn.neofetch_config + ".bak")
                    fn.permissions(fn.neofetch_config + ".bak")
            except Exception as error:
                print(error)

        # ensuring we have a backup of current fastfetch
        if fn.path.isfile(fn.fastfetch_config):
            try:
                if not fn.path.isfile(fn.fastfetch_config + ".bak"):
                    fn.shutil.copy(fn.fastfetch_config, fn.fastfetch_config + ".bak")
                    fn.permissions(fn.fastfetch_config + ".bak")
            except Exception as error:
                print(error)

        # make backup of ~/.bashrc
        if fn.path.isfile(fn.bash_config):
            try:
                if not fn.path.isfile(fn.bash_config + ".bak"):
                    fn.shutil.copy(fn.bash_config, fn.bash_config + ".bak")
                    fn.permissions(fn.home + "/.bashrc.bak")
            except Exception as error:
                print(error)

        # make backup of ~/.zshrc
        if fn.path.isfile(fn.zsh_config):
            try:
                if not fn.path.isfile(fn.zsh_config + ".bak"):
                    fn.shutil.copy(fn.zsh_config, fn.zsh_config + ".bak")
                    fn.permissions(fn.home + "/.zshrc.bak")
            except Exception as error:
                print(error)

        # put usable .zshrc file there if nothing
        if not fn.path.isfile(fn.zsh_config):
            try:
                fn.shutil.copy(fn.zshrc_arco, fn.home)
                fn.permissions(fn.home + "/.zshrc")
            except Exception as error:
                print(error)

        # make backup of /etc/default/grub
        # renaming bak to back for BigLinux
        if fn.path.isfile(fn.grub_default_grub):
            if not fn.path.isfile(fn.grub_default_grub + ".back"):
                try:
                    fn.shutil.copy(fn.grub_default_grub, fn.grub_default_grub + ".back")
                except Exception as error:
                    print(error)

        # make backup of /etc/pacman.conf
        if fn.path.isfile(fn.pacman):
            if not fn.path.isfile(fn.pacman + ".bak"):
                try:
                    fn.shutil.copy(fn.pacman, fn.pacman + ".bak")
                except Exception as error:
                    print(error)

        # make backup of .config/xfce4/terminal/terminalrc
        if fn.file_check(fn.xfce4_terminal_config):
            try:
                if not fn.path.isfile(fn.xfce4_terminal_config + ".bak"):
                    fn.shutil.copy(
                        fn.xfce4_terminal_config, fn.xfce4_terminal_config + ".bak"
                    )
                    fn.permissions(fn.xfce4_terminal_config + ".bak")
            except Exception as error:
                print(error)

        # make backup of .config/alacritty/alacritty.yml
        if fn.file_check(fn.alacritty_config):
            try:
                if not fn.path.isfile(fn.alacritty_config + ".bak"):
                    fn.shutil.copy(fn.alacritty_config, fn.alacritty_config + ".bak")
                    fn.permissions(fn.alacritty_config + ".bak")
            except Exception as error:
                print(error)

        # =====================================================
        #               CATCHING ERRORS
        # =====================================================

        # sddm_default_d1 = "/etc/sddm.conf"
        # sddm_default_d1_bak = "/etc/bak.sddm.conf"
        # sddm_default_d2 = "/etc/sddm.conf.d/kde_settings.conf"
        # sddm_default_d2_bak = "/etc/bak.kde_settings.conf"

        # make directory if it doesn't exist'
        if fn.path.exists("/usr/bin/sddm"):
            fn.create_sddm_k_dir()

            # if there is an sddm.conf but is empty = 0
            if fn.path.isfile(fn.sddm_default_d1):
                try:
                    if fn.path.getsize(fn.sddm_default_d1) == 0:
                        fn.shutil.copy(fn.sddm_default_d1_arco, fn.sddm_default_d1)
                        fn.shutil.copy(fn.sddm_default_d2_arco, fn.sddm_default_d2)
                except Exception as error:
                    print(error)

            # if there is NO sddm.conf at all - both are not there
            if not fn.path.exists(fn.sddm_default_d1) and not fn.path.exists(
                fn.sddm_default_d2
            ):
                try:
                    fn.shutil.copy(fn.sddm_default_d1_arco, fn.sddm_default_d1)
                    fn.shutil.copy(fn.sddm_default_d2_arco, fn.sddm_default_d2)

                    message = """
    The default SDDM files in your installation were either missing or corrupted.
    ATT has created and/or updated the necessary SDDM files.
    Backups have been created where possible.

    Affected files:
        - /etc/sddm.conf
        - /etc/sddm.conf.d/kde_settings.conf
        - /usr/lib/sddm/sddm.conf.d/default.conf

    You may need to adjust the settings again if necessary."""

                    print(message.strip())
                    fn.restart_program()
                except OSError as e:
                    # This will ONLY execute if the sddm files and the underlying sddm files do not exist
                    if e.errno == 2:
                        command = "/usr/local/bin/arcolinux-fix-sddm-config"
                        fn.subprocess.call(
                            command,
                            shell=True,
                            stdout=fn.subprocess.PIPE,
                            stderr=fn.subprocess.STDOUT,
                        )
                        print(
                            "The SDDM files in your installation either did not exist, or were corrupted."
                        )
                        print(
                            "These files have now been RESTORED. Please re-run the Tweak Tool if it did not load for you."
                        )
                        fn.restart_program()

            # adding lines to sddm
            if fn.path.isfile(fn.sddm_default_d2):
                session_exists = sddm.check_sddmk_session("Session=")
                if session_exists is False:
                    sddm.insert_session("#Session=")

            # adding lines to sddm
            if fn.path.isfile(fn.sddm_default_d2):
                user_exists = sddm.check_sddmk_user("User=")
                if user_exists is False:
                    sddm.insert_user("#User=")

        if fn.path.exists("/usr/bin/sddm"):
            # if any of the variables are missing we copy/paste
            if sddm.check_sddmk_complete():
                pass
            else:
                fn.create_sddm_k_dir()
                fn.shutil.copy(fn.sddm_default_d1_arco, fn.sddm_default_d1)
                fn.shutil.copy(fn.sddm_default_d2_arco, fn.sddm_default_d2)
                print(
                    "We changed your sddm configuration files so that ATT could start"
                )
                print(
                    "Backups are at /etc/bak.kde_settings.conf and /etc/bak.sddm.conf"
                )
                GLib.idle_add(
                    fn.show_in_app_notification,
                    self,
                    "We had to change your sddm configuration files",
                )

        # ensuring we have a neofetch config to start with
        if not fn.path.isfile(fn.neofetch_config):
            try:
                fn.shutil.copy(fn.neofetch_arco, fn.neofetch_config)
                fn.permissions(fn.neofetch_config)
            except Exception as error:
                print(error)

        # ensuring we have a fastfetch config to start with
        if not fn.path.isfile(fn.fastfetch_config):
            try:
                fn.shutil.copy(fn.fastfetch_arco, fn.fastfetch_config)
                fn.permissions(fn.fastfetch_config)
            except Exception as error:
                print(error)

        # ensuring permissions
        a1 = fn.stat(fn.home + "/.config/autostart")
        a2 = fn.stat(fn.home + "/.config/athena-tweak-tool")
        autostart = a1.st_uid
        att = a2.st_uid

        # fixing root permissions if the folder exists
        # can be removed later - 02/11/2021 startdate
        if fn.path.exists(fn.home + "/.config-att"):
            fn.permissions(fn.home + "/.config-att")

        if autostart == 0:
            fn.permissions(fn.home + "/.config/autostart")
            print("Fixing autostart permissions...")

        if att == 0:
            fn.permissions(fn.home + "/.config/athena-tweak-tool")
            print("Fixing athena-tweak-tool permissions...")

        # polybar
        # if not fn.path_check(fn.config_dir + "images"):
        #     fn.makedirs(fn.config_dir + "images", 0o766)
        #     for x in fn.listdir(base_dir + "/polybar_data/"):
        #         fn.copy_func(base_dir + "/polybar_data/" + x, fn.config_dir + "images", False)
        #     fn.permissions(fn.config_dir + "images")
        # else:
        #     for x in fn.listdir(base_dir + "/polybar_data/"):
        #         fn.copy_func(base_dir + "/polybar_data/" + x, fn.config_dir + "images", False)
        #     fn.permissions(fn.config_dir + "images")

        if not fn.path.isfile(fn.config):
            key = {"theme": ""}
            settings.make_file("TERMITE", key)
            fn.permissions(fn.config)

        # =====================================================
        #      LAUNCHING GUI AND SETTING ALL THE OBJECTS
        # =====================================================

        gui.gui(self, Gtk, Gdk, GdkPixbuf, base_dir, os, Pango)

        # =====================================================
        #               READING AND SETTING
        # =====================================================

        # ========================ATHENA REPO=============================

        athena_repo = pmf.check_repo("[athena]")

        # ========================ARCO REPO=============================

        arco_testing = pmf.check_repo("[arcolinux_repo_testing]")
        arco_base = pmf.check_repo("[arcolinux_repo]")
        arco_3p = pmf.check_repo("[arcolinux_repo_3party]")
        arco_xl = pmf.check_repo("[arcolinux_repo_xlarge]")

        # ========================ARCH REPO=============================

        arch_testing = pmf.check_repo("[core-testing]")
        arch_core = pmf.check_repo("[core]")
        arch_extra = pmf.check_repo("[extra]")
        arch_community = pmf.check_repo("[extra-testing]")
        arch_multilib_testing = pmf.check_repo("[multilib-testing]")
        arch_multilib = pmf.check_repo("[multilib]")

        # ========================OTHER REPO=============================

        reborn_repo = pmf.check_repo("[Reborn-OS]")
        garuda_repo = pmf.check_repo("[garuda]")
        blackarch_repo = pmf.check_repo("[blackarch]")
        chaotics_repo = pmf.check_repo("[chaotic-aur]")
        endeavouros_repo = pmf.check_repo("[endeavouros]")
        nemesis_repo = pmf.check_repo("[nemesis_repo]")
        # xero_repo = pmf.check_repo("[xerolinux_repo]")
        # xero_xl_repo = pmf.check_repo("[xerolinux_repo_xl]")
        # xero_nv_repo = pmf.check_repo("[xerolinux_nvidia_repo]")

        # ========================ARCO MIRROR=============================

        if fn.path.isfile(fn.arcolinux_mirrorlist):
            arco_mirror_seed = pmf.check_mirror(
                "Server = https://ant.seedhost.eu/arcolinux/$repo/$arch"
            )
            arco_mirror_gitlab = pmf.check_mirror(
                "Server = https://gitlab.com/arcolinux/$repo/-/raw/main/$arch"
            )
            arco_mirror_belnet = pmf.check_mirror(
                "Server = https://ftp.belnet.be/arcolinux/$repo/$arch"
            )
            arco_mirror_accum = pmf.check_mirror(
                "Server = https://mirror.accum.se/mirror/arcolinux.info/$repo/$arch"
            )
            arco_mirror_funami = pmf.check_mirror(
                "Server = https://mirror.funami.tech/arcolinux/$repo/$arch"
            )
            arco_mirror_jingk = pmf.check_mirror(
                "Server = https://mirror.jingk.ai/arcolinux/$repo/$arch"
            )
            arco_mirror_aarnet = pmf.check_mirror(
                "Server = https://mirror.aarnet.edu.au/pub/arcolinux/$repo/$arch"
            )
            # arco_mirror_github = pmf.check_mirror(
            #     "Server = https://arcolinux.github.io/$repo/$arch")

        # ========================ATHENA MIRROR SET TOGGLE=====================

        self.athena_switch.set_active(athena_repo)
        self.opened = False

        # ========================ARCO MIRROR SET TOGGLE=====================

        if fn.path.isfile(fn.arcolinux_mirrorlist):
            self.aseed_button.set_active(arco_mirror_seed)
            self.agitlab_button.set_active(arco_mirror_gitlab)
            self.abelnet_button.set_active(arco_mirror_belnet)
            self.afunami_button.set_active(arco_mirror_funami)
            self.ajingk_button.set_active(arco_mirror_jingk)
            self.aaccum_button.set_active(arco_mirror_accum)
            self.aarnet_button.set_active(arco_mirror_aarnet)
            # self.agithub_button.set_active(arco_mirror_github)

        # ========================ARCO REPO SET TOGGLE=====================

        self.atestrepo_button.set_active(arco_testing)
        self.arepo_button.set_active(arco_base)
        self.a3prepo_button.set_active(arco_3p)
        self.axlrepo_button.set_active(arco_xl)

        # ========================ARCH LINUX REPO SET TOGGLE==================

        self.checkbutton2.set_active(arch_testing)
        self.checkbutton6.set_active(arch_core)
        self.checkbutton7.set_active(arch_extra)
        self.checkbutton5.set_active(arch_community)
        self.checkbutton3.set_active(arch_multilib_testing)
        self.checkbutton8.set_active(arch_multilib)

        # ========================OTHER REPO SET TOGGLE==================

        self.reborn_switch.set_active(reborn_repo)
        self.opened = False
        self.garuda_switch.set_active(garuda_repo)
        self.opened = False
        self.blackarch_switch.set_active(blackarch_repo)
        self.opened = False
        self.chaotics_switch.set_active(chaotics_repo)
        self.opened = False
        self.endeavouros_switch.set_active(endeavouros_repo)
        self.opened = False
        self.nemesis_switch.set_active(nemesis_repo)
        self.opened = False
        # self.xerolinux_switch.set_active(xero_repo)
        # self.opened = False
        # self.xerolinux_xl_switch.set_active(xero_xl_repo)
        # self.opened = False
        # self.xerolinux_nv_switch.set_active(xero_nv_repo)
        # self.opened = False

        # ====================DESIGN INSTALL REINSTALL===================

        if not fn.path.isfile(fn.athena_mirrorlist):
            self.button_install_design.set_sensitive(False)
            self.button_reinstall_design.set_sensitive(False)

        if fn.path.isfile(fn.athena_mirrorlist):
            if fn.check_athena_repos_active() is True:
                self.button_install_design.set_sensitive(True)
                self.button_reinstall_design.set_sensitive(True)
            else:
                self.button_install_design.set_sensitive(False)
                self.button_reinstall_design.set_sensitive(False)

        # ====================DESKTOP INSTALL REINSTALL===================

        if not fn.path.isfile(fn.athena_mirrorlist):
            self.button_install_desktop.set_sensitive(False)
            self.button_reinstall_desktop.set_sensitive(False)

        if fn.path.isfile(fn.athena_mirrorlist):
            if fn.check_athena_repos_active() is True:
                self.button_install_desktop.set_sensitive(True)
                self.button_reinstall_desktop.set_sensitive(True)
            else:
                self.button_install_desktop.set_sensitive(False)
                self.button_reinstall_desktop.set_sensitive(False)

        # ====================LOGIN INSTALL===================

        if not fn.path.isfile(fn.athena_mirrorlist):
            self.button_install_login.set_sensitive(False)

        if fn.path.isfile(fn.athena_mirrorlist):
            if fn.check_athena_repos_active() is True:
                self.button_install_login.set_sensitive(True)
            else:
                self.button_install_login.set_sensitive(False)

        # =====================================================
        #                        GRUB
        # =====================================================

        if fn.check_package_installed("arcolinux-grub-theme-vimix-git"):
            try:
                if fn.check_content("GRUB_TIMEOUT=", fn.grub_default_grub):
                    with open(fn.grub_default_grub, "r", encoding="utf-8") as f:
                        lists = f.readlines()
                        f.close()

                    val = fn.get_position(lists, "GRUB_TIMEOUT=")
                    number = int(lists[val].split("=")[1].replace('"', ""))
                    self.scale.set_value(number)
            except Exception as error:
                print(error)

        # ========================FASTFETCH LOLCAT TOGGLE===================

        shell = fn.get_shell()

        if shell in ("zsh", "bash", "fish"):
            # ========================TERMINAL UTILITIES TOGGLES========================
            # screenfetch
            self.screenfetch_lolcat.set_active(
                utilities.get_term_rc("screenfetch | lolcat")
            )
            self.screenfetch_util.set_active(utilities.get_term_rc("screenfetch"))
            # ufetch
            self.ufetch_lolcat.set_active(utilities.get_term_rc("ufetch | lolcat"))
            self.ufetch_util.set_active(utilities.get_term_rc("ufetch"))
            # ufetch-arco
            self.ufetch_arco_lolcat.set_active(
                utilities.get_term_rc("ufetch-arco | lolcat")
            )
            self.ufetch_arco_util.set_active(utilities.get_term_rc("ufetch-arco"))
            # pfetch
            self.pfetch_lolcat.set_active(utilities.get_term_rc("pfetch | lolcat"))
            self.pfetch_util.set_active(utilities.get_term_rc("pfetch"))
            # paleofetch
            self.paleofetch_lolcat.set_active(
                utilities.get_term_rc("paleofetch | lolcat")
            )
            self.paleofetch_util.set_active(utilities.get_term_rc("paleofetch"))
            # alsi
            self.alsi_lolcat.set_active(utilities.get_term_rc("alsi | lolcat"))
            self.alsi_util.set_active(utilities.get_term_rc("alsi"))
            # hfetch
            self.hfetch_lolcat.set_active(utilities.get_term_rc("hfetch | lolcat"))
            self.hfetch_util.set_active(utilities.get_term_rc("hfetch"))
            # sfetch
            self.sfetch_lolcat.set_active(utilities.get_term_rc("sfetch | lolcat"))
            self.sfetch_util.set_active(utilities.get_term_rc("sfetch"))
            # sysinfo
            self.sysinfo_lolcat.set_active(utilities.get_term_rc("sysinfo | lolcat"))
            self.sysinfo_util.set_active(utilities.get_term_rc("sysinfo"))
            # fetch
            self.fetch_lolcat.set_active(utilities.get_term_rc("fetch | lolcat"))
            self.fetch_util.set_active(utilities.get_term_rc("fetch"))
            # sysinfo-retro
            self.sysinfo_retro_lolcat.set_active(
                utilities.get_term_rc("sysinfo-retro | lolcat")
            )
            self.sysinfo_retro_util.set_active(utilities.get_term_rc("sysinfo-retro"))
            # cpufetch
            self.cpufetch_lolcat.set_active(utilities.get_term_rc("cpufetch | lolcat"))
            self.cpufetch_util.set_active(utilities.get_term_rc("cpufetch"))
            # hyfetch
            self.hyfetch_lolcat.set_active(utilities.get_term_rc("hyfetch | lolcat"))
            self.hyfetch_util.set_active(utilities.get_term_rc("hyfetch"))
            # colorscripts
            self.colorscript.set_active(utilities.get_term_rc("colorscript random"))

            # fastfetch
            # Disable signals temporarily to prevent triggering on initialization
            #self.fast_util.handler_block_by_func(self.on_fast_util_toggled)
            #self.fast_lolcat.handler_block_by_func(self.on_fast_lolcat_toggled)

            # Initialize fastfetch and lolcat switches
            #fastfetch_enabled = utilities.get_term_rc("fastfetch")
            #lolcat_enabled = utilities.get_term_rc("fastfetch | lolcat")

            #self.fast_util.set_active(fastfetch_enabled)
            #self.fast_lolcat.set_active(lolcat_enabled)

            # Set sensitivity: lolcat should only be sensitive if fastfetch is active
            #self.fast_lolcat.set_sensitive(fastfetch_enabled)

            # Re-enable signals after initialization
            #self.fast_util.handler_unblock_by_func(self.on_fast_util_toggled)
            #self.fast_lolcat.handler_unblock_by_func(self.on_fast_lolcat_toggled)

            # Connect toggle handlers
            #self.fast_util.connect("notify::active", self.on_fast_util_toggled)
            #self.fast_lolcat.connect("notify::active", self.on_fast_lolcat_toggled)

        # =====================================================
        #                     LIGHTDM
        # =====================================================

        if fn.path.exists("/usr/bin/lightdm"):
            if fn.path.isfile(fn.lightdm_conf):
                try:
                    if "#" in lightdm.check_lightdm(
                        fn.get_lines(fn.lightdm_conf), "autologin-user="
                    ):
                        self.autologin_lightdm.set_active(False)
                        self.sessions_lightdm.set_sensitive(False)
                    else:
                        self.autologin_lightdm.set_active(True)
                        self.sessions_lightdm.set_sensitive(True)
                except Exception as error:
                    print(error)

        # =====================================================
        #                        SDDM
        # =====================================================

        if fn.path.exists("/usr/bin/sddm"):
            try:
                # if not "plasma" in self.desktop.lower():
                if sddm.check_sddm(
                    sddm.get_sddm_lines(fn.sddm_default_d2), "CursorTheme="
                ) and sddm.check_sddm(sddm.get_sddm_lines(fn.sddm_default_d2), "User="):
                    if fn.path.isfile(fn.sddm_default_d2):
                        if "#" in sddm.check_sddm(
                            sddm.get_sddm_lines(fn.sddm_default_d2), "User="
                        ):
                            self.autologin_sddm.set_active(False)
                            self.sessions_sddm.set_sensitive(False)
                        else:
                            self.autologin_sddm.set_active(True)
                            self.sessions_sddm.set_sensitive(True)
            except:
                pass

        if not fn.path.isfile("/tmp/att.lock"):
            with open("/tmp/att.lock", "w", encoding="utf-8") as f:
                f.write("")

        # =====================================================
        #                        LXDM
        # =====================================================

        if fn.path.exists("/usr/bin/lxdm"):
            try:
                pos = fn.get_position(fn.get_lines(fn.lxdm_conf), "bottom_pane=")
                lines = fn.get_lines(fn.lxdm_conf)
                state = lines[pos].split("=")[1].strip()
                if fn.path.isfile(fn.lxdm_conf):
                    if state == "1":
                        self.panel_lxdm.set_active(True)
                    else:
                        self.panel_lxdm.set_active(False)
            except Exception as error:
                pass

        if not fn.path.isfile("/tmp/att.lock"):
            with open("/tmp/att.lock", "w", encoding="utf8") as f:
                f.write("")

        # =====================================================
        #                        UTILITIES
        # =====================================================

        # check if arco repos are active else no switch
        utilities.set_util_state_arco_switch(self)

        # =====================================================
        #     IF ALL THIS IS DONE - DESTROY SPLASH SCREEN
        # =====================================================

        splScr.destroy()

    # =====================================================
    # =====================================================
    # =====================================================
    # =====================================================
    #     END OF DEF __INIT__(SELF)
    # =====================================================
    # =====================================================
    # =====================================================
    # =====================================================

    # =====================================================
    #     CREATE AUTOSTART_GUI
    # =====================================================

    def create_autostart_columns(self, treeView):
        rendererText = Gtk.CellRendererText()
        renderer_checkbox = Gtk.CellRendererToggle()
        column_checkbox = Gtk.TreeViewColumn("", renderer_checkbox, active=0)
        renderer_checkbox.connect("toggled", self.renderer_checkbox, self.startups)
        renderer_checkbox.set_activatable(True)
        column_checkbox.set_sort_column_id(0)

        column = Gtk.TreeViewColumn("Name", rendererText, text=1)
        column.set_sort_column_id(1)

        column2 = Gtk.TreeViewColumn("Comment", rendererText, text=2)
        column2.set_sort_column_id(2)

        treeView.append_column(column_checkbox)
        treeView.append_column(column)
        treeView.append_column(column2)

    def create_columns(self, treeView):
        rendererText = Gtk.CellRendererText()
        column = Gtk.TreeViewColumn("Name", rendererText, text=0)
        column.set_sort_column_id(0)
        treeView.append_column(column)

    def renderer_checkbox(self, renderer, path, model):
        if path is not None:
            it = model.get_iter(path)
            model[it][0] = not model[it][0]

    def on_activated(self, treeview, path, column):
        failed = False
        treestore, selected_treepaths = treeview.get_selection().get_selected_rows()
        selected_treepath = selected_treepaths[0]
        selected_row = treestore[selected_treepath]
        bool = selected_row[0]
        text = selected_row[1]

        if bool:
            bools = False
        else:
            bools = True

        with open(
            fn.home + "/.config/autostart/" + text + ".desktop", "r", encoding="utf-8"
        ) as f:
            lines = f.readlines()
            f.close()
        try:
            pos = fn.get_position(lines, "Hidden=")
        except:
            failed = True
            with open(
                fn.home + "/.config/autostart/" + text + ".desktop",
                "a",
                encoding="utf-8",
            ) as f:
                f.write("Hidden=" + str(bools))
                f.close()
        if not failed:
            val = lines[pos].split("=")[1].strip()
            lines[pos] = lines[pos].replace(val, str(bools).lower())
            with open(
                fn.home + "/.config/autostart/" + text + ".desktop",
                "w",
                encoding="utf-8",
            ) as f:
                f.writelines(lines)
                f.close()

    # ====================================================================
    #                       AUTOSTART
    # ====================================================================

    def on_comment_changed(self, widget):
        if len(self.txtbox1.get_text()) >= 3 and len(self.txtbox2.get_text()) >= 3:
            self.abutton.set_sensitive(True)

    # autostart toggle on and off
    def on_auto_toggle(self, widget, data, lbl):
        failed = False
        try:
            with open(fn.autostart + lbl + ".desktop", "r", encoding="utf-8") as f:
                lines = f.readlines()
                f.close()
            try:
                pos = fn.get_position(lines, "Hidden=")
            except:
                failed = True
                with open(fn.autostart + lbl + ".desktop", "a", encoding="utf-8") as f:
                    f.write("Hidden=" + str(not widget.get_active()).lower())
                    f.close()
        except:
            pass
        if not failed:
            try:
                val = lines[pos].split("=")[1].strip()
                lines[pos] = lines[pos].replace(
                    val, str(not widget.get_active()).lower()
                )
                with open(fn.autostart + lbl + ".desktop", "w", encoding="utf-8") as f:
                    f.writelines(lines)
                    f.close()
            except:
                # non .desktop files
                pass

    # remove file from ~/.config/autostart
    def on_auto_remove_clicked(self, widget, data, listbox, lbl):
        try:
            fn.unlink(fn.autostart + lbl + ".desktop")
            print("Removed item from ~/.config/autostart/")
            self.vvbox.remove(listbox)
        except Exception as error:
            print(error)
            print("We were unable to remove it")
            print("Evaluate if it can/should be removed")
            print("Then remove it manually")
            print("We only remove .desktop files")

    def clear_autostart(self):
        for x in self.vvbox.get_children():
            self.vvbox.remove(x)

    def load_autostart(self, files):
        self.clear_autostart()

        for x in files:
            self.add_row(x)

    def add_row(self, x):
        hbox = Gtk.Box(orientation=Gtk.Orientation.HORIZONTAL, spacing=10)
        vbox2 = Gtk.Box(orientation=Gtk.Orientation.VERTICAL, spacing=0)

        lbl = Gtk.Label(xalign=0)
        lbl.set_text(x)

        swtch = Gtk.Switch()
        swtch.connect("notify::active", self.on_auto_toggle, lbl.get_text())
        swtch.set_active(autostart.get_startups(lbl.get_text()))

        listbox = Gtk.ListBox()

        fbE = Gtk.EventBox()

        pbfb = GdkPixbuf.Pixbuf().new_from_file_at_size(
            fn.path.join(base_dir, "images/remove.png"), 28, 28
        )
        fbimage = Gtk.Image().new_from_pixbuf(pbfb)

        fbE.add(fbimage)

        fbE.connect(
            "button_press_event", self.on_auto_remove_clicked, listbox, lbl.get_text()
        )

        fbE.set_property("has-tooltip", True)

        fbE.connect("query-tooltip", self.tooltip_callback, "Remove")

        hbox.pack_start(lbl, False, False, 0)
        hbox.pack_end(fbE, False, False, 0)
        vbox2.pack_start(swtch, False, False, 10)
        hbox.pack_end(vbox2, False, False, 0)

        vbox1 = Gtk.Box(orientation=Gtk.Orientation.VERTICAL, spacing=0)
        vbox1.pack_start(hbox, False, False, 5)

        listbox.set_selection_mode(Gtk.SelectionMode.NONE)
        listboxrow = Gtk.ListBoxRow()
        listboxrow.add(vbox1)
        listbox.add(listboxrow)

        self.vvbox.pack_start(listbox, False, False, 0)
        self.vvbox.show_all()

    def on_remove_auto(self, widget):
        selection = self.treeView4.get_selection()
        model, paths = selection.get_selected_rows()

        # Get the TreeIter instance for each path
        for path in paths:
            iter = model.get_iter(path)
            # Remove the ListStore row referenced by iter
            value = model.get_value(iter, 1)
            model.remove(iter)
            fn.unlink(fn.home + "/.config/autostart/" + value + ".desktop")
            print("Item has been removed from autostart")
            fn.show_in_app_notification(self, "Item has been removed from autostart")

    def on_add_autostart(self, widget):
        if len(self.txtbox1.get_text()) > 1 and len(self.txtbox2.get_text()) > 1:
            autostart.add_autostart(
                self,
                self.txtbox1.get_text(),
                self.txtbox2.get_text(),
                self.txtbox3.get_text(),
            )
        print("Item has been added to autostart")
        fn.show_in_app_notification(self, "Item has been added to autostart")

    def on_exec_browse(self, widget):
        dialog = Gtk.FileChooserDialog(
            title="Please choose a file", action=Gtk.FileChooserAction.OPEN
        )

        dialog.set_select_multiple(False)
        dialog.set_show_hidden(False)
        dialog.set_current_folder(fn.home)
        dialog.add_buttons(
            Gtk.STOCK_CANCEL, Gtk.ResponseType.CANCEL, "Open", Gtk.ResponseType.OK
        )
        dialog.connect("response", self.open_response_auto)

        dialog.show()

    def open_response_auto(self, dialog, response):
        if response == Gtk.ResponseType.OK:
            print(dialog.get_filenames())
            foldername = dialog.get_filenames()
            # for item in foldername:
            self.txtbox2.set_text(foldername[0])
            dialog.destroy()
        elif response == Gtk.ResponseType.CANCEL:
            dialog.destroy()

    # ================================================================================
    # ================================================================================
    # ================================================================================
    # ================================================================================
    # ================================================================================
    # ================================================================================
    #                MAIN FUNCTIONS
    # ================================================================================
    # ================================================================================
    # ================================================================================
    # ================================================================================
    # ================================================================================
    # ================================================================================

    def on_click_launch_pace(self, widget):
        if fn.path.isfile(fn.athena_mirrorlist):
            if fn.check_arco_repos_active() is True:
                fn.install_pace(self)
                call("pace", shell=True)
            else:
                print("First activate the Athena repos")
                fn.show_in_app_notification(self, "First activate the Arco repos")
        else:
            print("Install Arco mirrors and keys")
            fn.show_in_app_notification(self, "Install Arco mirrors and keys")

    # ====================================================================
    #                       ATHENA MIRRORLIST
    # ====================================================================

    def on_click_reset_athena_mirrorlist(self, widget):
        if fn.path.isfile(fn.athena_mirrorlist_original):
            fn.shutil.copy(fn.athena_mirrorlist_original, fn.athena_mirrorlist)
            fn.show_in_app_notification(
                self, "Original Athena mirrorlist is applied"
            )
        fn.restart_program()

    # ====================================================================
    #                       ATT
    # ====================================================================

    # themes

    def on_install_att_themes_clicked(self, widget):
        print("We have installed all the selected themes")
        fn.show_in_app_notification(self, "We have installed all the selected themes")
        att.install_themes(self)
        # populate lightdm page
        if fn.check_package_installed("lightdm"):
            lightdm.pop_gtk_theme_names_lightdm(self, self.gtk_theme_names_lightdm)
        # populate lxdm page
        if fn.check_package_installed("lxdm"):
            lxdm.pop_gtk_theme_names_lxdm(self.lxdm_gtk_theme)

    def on_remove_att_themes_clicked(self, widget):
        print("We have removed all the selected themes")
        fn.show_in_app_notification(self, "We have removed all the selected themes")
        att.remove_themes(self)
        # populate lightdm page
        if fn.check_package_installed("lightdm"):
            lightdm.pop_gtk_theme_names_lightdm(self, self.gtk_theme_names_lightdm)
        # populate lxdm page
        if fn.check_package_installed("lxdm"):
            lxdm.pop_gtk_theme_names_lxdm(self.lxdm_gtk_theme)

    def on_find_att_themes_clicked(self, widget):
        print("ATT : We show the installed themes")
        fn.show_in_app_notification(self, "We show the installed themes")
        att.find_themes(self)
        # populate lightdm page
        if fn.check_package_installed("lightdm"):
            lightdm.pop_gtk_theme_names_lightdm(self, self.gtk_theme_names_lightdm)
        # populate lxdm page
        if fn.check_package_installed("lxdm"):
            lxdm.pop_gtk_theme_names_lxdm(self.lxdm_gtk_theme)

    # ====================================================================
    # Sardi

    def on_install_att_sardi_icon_themes_clicked(self, widget):
        print("ATT : We have installed all the selected sardi icon themes")
        fn.show_in_app_notification(
            self, "We have installed all the selected sardi icon themes"
        )
        att.install_sardi_icons(self)
        # populate icon names on lightdm
        if fn.check_package_installed("lightdm"):
            lightdm.pop_gtk_icon_names_lightdm(self, self.gtk_icon_names_lightdm)

    def on_remove_att_sardi_icon_themes_clicked(self, widget):
        print("ATT : We have removed all the selected sardi icon themes")
        fn.show_in_app_notification(
            self, "We have removed all the selected sardi icon themes"
        )
        att.remove_sardi_icons(self)
        # populate icon names lightdm
        if fn.check_package_installed("lightdm"):
            lightdm.pop_gtk_icon_names_lightdm(self, self.gtk_icon_names_lightdm)

    def on_find_att_sardi_icon_themes_clicked(self, widget):
        print("ATT : We show the installed sardi icon themes")
        fn.show_in_app_notification(self, "We show the installed sardi icon themes")
        att.find_sardi_icons(self)
        # populate icon names on lightdm
        if fn.check_package_installed("lightdm"):
            lightdm.pop_gtk_icon_names_lightdm(self, self.gtk_icon_names_lightdm)

    # ====================================================================
    # surfn

    def on_install_att_surfn_icon_themes_clicked(self, widget):
        print("ATT : We have installed all the selected Surfn cursor themes")
        fn.show_in_app_notification(
            self, "We have installed all the selected Surfn cursor themes"
        )
        att.install_surfn_icons(self)
        # populate icon names on lightdm
        if fn.check_package_installed("lightdm"):
            lightdm.pop_gtk_icon_names_lightdm(self, self.gtk_icon_names_lightdm)

    def on_remove_att_surfn_icon_themes_clicked(self, widget):
        print("ATT : We have removed all the selected Surfn cursor themes")
        fn.show_in_app_notification(
            self, "We have removed all the selected Surfn cursor themes"
        )
        att.remove_surfn_icons(self)
        # populate icon names on lightdm
        if fn.check_package_installed("lightdm"):
            lightdm.pop_gtk_icon_names_lightdm(self, self.gtk_icon_names_lightdm)

    def on_find_att_surfn_icon_themes_clicked(self, widget):
        print("ATT : We show all the installed Surfn icon themes")
        fn.show_in_app_notification(self, "We show all the installed Surfn icon themes")
        att.find_surfn_icons(self)
        # populate icon names on lightdm
        if fn.check_package_installed("lightdm"):
            lightdm.pop_gtk_icon_names_lightdm(self, self.gtk_icon_names_lightdm)

    # ====================================================================
    # selection of theming

    def on_click_att_theming_all_selection(self, widget):
        print("ATT : We have selected all themes")
        fn.show_in_app_notification(self, "We have selected all themes")
        att.set_att_checkboxes_theming_all(self)

    def on_click_att_theming_blue_selection(self, widget):
        print("ATT : We have selected the normal selection - blue themes")
        fn.show_in_app_notification(
            self, "We have selected the normal selection - blue themes"
        )
        att.set_att_checkboxes_theming_blue(self)

    def on_click_att_theming_dark_selection(self, widget):
        print("ATT : We have selected the minimal selection - dark themes")
        fn.show_in_app_notification(
            self, "We have selected the minimal selection - dark themes"
        )
        att.set_att_checkboxes_theming_dark(self)

    def on_click_att_theming_none_selection(self, widget):
        print("ATT : We have selected no themes")
        fn.show_in_app_notification(self, "We have selected no themes")
        att.set_att_checkboxes_theming_none(self)

    # selection of icon theming
    def on_click_att_sardi_icon_theming_all_selection(self, widget):
        print("ATT : We have selected all sardi icons")
        fn.show_in_app_notification(self, "We have selected all sardi icons")
        att.set_att_checkboxes_theming_sardi_icons_all(self)

    def on_click_att_sardi_icon_theming_mint_selection(self, widget):
        print("ATT : We have selected the mint selection - sardi icons")
        fn.show_in_app_notification(
            self, "We have selected the mint selection - sardi icons"
        )
        att.set_att_checkboxes_theming_sardi_mint_icons(self)

    def on_click_att_sardi_icon_theming_mixing_selection(self, widget):
        print("ATT : We have selected the mixing selection - sardi icons")
        fn.show_in_app_notification(
            self, "We have selected the mixing selection - sardi icons"
        )
        att.set_att_checkboxes_theming_sardi_mixing_icons(self)

    def on_click_att_sardi_icon_theming_variations_selection(self, widget):
        print("ATT : We have selected the variation selection - sardi icons")
        fn.show_in_app_notification(
            self, "We have selected the variation selection - sardi icons"
        )
        att.set_att_checkboxes_theming_sardi_icons_variations(self)

    def on_click_att_sardi_icon_theming_none_selection(self, widget):
        print("ATT : We have selected no sardi icons")
        fn.show_in_app_notification(self, "We have selected no sardiicons")
        att.set_att_checkboxes_theming_sardi_icons_none(self)

    # different families of SARDI

    def on_click_att_fam_sardi_icon_theming_sardi_selection(self, widget):
        print("ATT : We have selected the Sardi family")
        fn.show_in_app_notification(self, "We have selected the Sardi family themes")
        att.set_att_fam_checkboxes_theming_sardi_icons(self)

    def on_click_att_fam_sardi_icon_theming_sardi_flexible_selection(self, widget):
        print("ATT : We have selected the Sardi flexible family")
        fn.show_in_app_notification(
            self, "We have selected the Sardi flexible family themes"
        )
        att.set_att_fam_checkboxes_theming_sardi_flexible(self)

    def on_click_att_fam_sardi_icon_theming_sardi_mono_selection(self, widget):
        print("ATT : We have selected the Sardi mono family")
        fn.show_in_app_notification(
            self, "We have selected the Sardi mono family themes"
        )
        att.set_att_fam_checkboxes_theming_sardi_mono(self)

    def on_click_att_fam_sardi_icon_theming_sardi_flat_selection(self, widget):
        print("ATT : We have selected the Sardi flat family")
        fn.show_in_app_notification(
            self, "We have selected the Sardi flat family themes"
        )
        att.set_att_fam_checkboxes_theming_sardi_flat(self)

    def on_click_att_fam_sardi_icon_theming_sardi_ghost_selection(self, widget):
        print("ATT : We have selected the Sardi ghost family")
        fn.show_in_app_notification(
            self, "We have selected the Sardi ghost family themes"
        )
        att.set_att_fam_checkboxes_theming_sardi_ghost(self)

    def on_click_att_fam_sardi_icon_theming_sardi_orb_selection(self, widget):
        print("ATT : We have selected the Sardi orb family")
        fn.show_in_app_notification(
            self, "We have selected the Sardi orb family themes"
        )
        att.set_att_fam_checkboxes_theming_sardi_orb(self)

    # selection of Surfn icons theming
    def on_click_att_surfn_theming_all_selection(self, widget):
        print("ATT : We have selected all cursors")
        fn.show_in_app_notification(self, "We have selected all cursors")
        att.set_att_checkboxes_theming_surfn_icons_all(self)

    def on_click_att_surfn_theming_normal_selection(self, widget):
        print("ATT : We have selected the normal selection - cursors")
        fn.show_in_app_notification(
            self, "We have selected the normal selection - cursors"
        )
        att.set_att_checkboxes_theming_surfn_icons_normal(self)

    def on_click_att_surfn_theming_minimal_selection(self, widget):
        print("ATT : We have selected the minimal selection - cursors")
        fn.show_in_app_notification(
            self, "We have selected the minimal selection - cursors"
        )
        att.set_att_checkboxes_theming_surfn_icons_minimal(self)

    def on_click_att_surfn_theming_none_selection(self, widget):
        print("ATT : We have selected no cursors")
        fn.show_in_app_notification(self, "We have selected no cursors")
        att.set_att_checkboxes_theming_surfn_icons_none(self)

    def on_install_extras_clicked(self, widget):
        print("ATT : We install the selected projects")
        fn.show_in_app_notification(self, "We install the selected projects")
        att.install_att_extras(self)
        # populate lightdm page
        if fn.check_package_installed("lightdm"):
            lightdm.pop_gtk_theme_names_lightdm(self, self.gtk_theme_names_lightdm)
            lightdm.pop_gtk_icon_names_lightdm(self, self.gtk_icon_names_lightdm)
        # populate lxdm page
        if fn.check_package_installed("lxdm"):
            lxdm.pop_gtk_theme_names_lxdm(self.lxdm_gtk_theme)

    # extras
    def on_remove_extras_clicked(self, widget):
        print("ATT : We remove the selected projects")
        fn.show_in_app_notification(self, "We remove the selected projects")
        att.remove_att_extras(self)
        # populate lightdm page
        if fn.check_package_installed("lightdm"):
            lightdm.pop_gtk_theme_names_lightdm(self, self.gtk_theme_names_lightdm)
            lightdm.pop_gtk_icon_names_lightdm(self, self.gtk_icon_names_lightdm)
        # populate lxdm page
        if fn.check_package_installed("lxdm"):
            lxdm.pop_gtk_theme_names_lxdm(self.lxdm_gtk_theme)

    def on_find_extras_clicked(self, widget):
        print("ATT : We show the installed projects")
        fn.show_in_app_notification(self, "We show the installed projects")
        att.find_att_extras(self)
        # populate lightdm page
        if fn.check_package_installed("lightdm"):
            lightdm.pop_gtk_theme_names_lightdm(self, self.gtk_theme_names_lightdm)
            lightdm.pop_gtk_icon_names_lightdm(self, self.gtk_icon_names_lightdm)
        # populate lxdm page
        if fn.check_package_installed("lxdm"):
            lxdm.pop_gtk_theme_names_lxdm(self.lxdm_gtk_theme)

    # selection of extras theming
    def on_click_extras_theming_all_selection(self, widget):
        print("ATT : We have selected all projects")
        fn.show_in_app_notification(self, "We have selected all projects")
        att.set_att_checkboxes_extras_all(self)

    def on_click_extras_theming_none_selection(self, widget):
        print("ATT : We have selected none of the projects")
        fn.show_in_app_notification(self, "We have selected none of the projects")
        att.set_att_checkboxes_extras_none(self)

    # ====================================================================
    #                       BASH
    # ====================================================================

    def tobash_apply(self, widget):
        fn.change_shell(self, "bash")

    def on_install_bash_completion_clicked(self, widget):
        fn.install_package(self, "bash")
        fn.install_package(self, "bash-completion")

    def on_remove_bash_completion_clicked(self, widget):
        fn.remove_package(self, "bash-completion")

    def on_arcolinux_bash_clicked(self, widget):
        try:
            if fn.path.isfile(fn.bashrc_arco):
                fn.shutil.copy(fn.bashrc_arco, fn.bash_config)
                fn.permissions(fn.home + "/.bashrc")
            fn.source_shell(self)
        except Exception as error:
            print(error)

        print("ATT ~/.bashrc is applied")
        GLib.idle_add(fn.show_in_app_notification, self, "ATT ~/.bashrc is applied")

    def on_bash_reset_clicked(self, widget):
        try:
            if fn.path.isfile(fn.bash_config + ".bak"):
                fn.shutil.copy(fn.bash_config + ".bak", fn.bash_config)
                fn.permissions(fn.home + "/.bashrc")
        except Exception as error:
            print(error)

        print("Your personal ~/.bashrc is applied again - logout")
        GLib.idle_add(
            fn.show_in_app_notification,
            self,
            "Your personal ~/.bashrc is applied again - logout",
        )

    #    #====================================================================
    #    #                       DESIGN
    #    #====================================================================

    def on_d_combo_changed_design(self, widget):
        try:
            pixbuf3 = GdkPixbuf.Pixbuf().new_from_file_at_size(
                base_dir + "/design_data/" + self.d_combo_design.get_active_text().lower().replace(" ", "") + ".png",
                345,
                345,
            )
            self.image_design.set_from_pixbuf(pixbuf3)
        except:
            self.image_design.set_from_pixbuf(None)
        if design.check_design(self.d_combo_design.get_active_text()):
            self.design_status.set_text("This design is installed")
        else:
            self.design_status.set_text("This design is NOT installed")

    def on_install_clicked_design(self, widget, state):
        fn.create_log(self)
        print("Installing " + self.d_combo_design.get_active_text())
        design.check_lock(self, self.d_combo_design.get_active_text(), state)

    def on_default_clicked_design(self, widget):
        fn.create_log(self)
        if design.check_design(self.d_combo_design.get_active_text()) is True:
            secs = settings.read_section()
            if "DESIGN" in secs:
                settings.write_settings(
                    "DESIGN", "default", self.d_combo_design.get_active_text()
                )
            else:
                settings.new_settings(
                    "DESIGN", {"default": self.d_combo_design.get_active_text()}
                )
        else:
            fn.show_in_app_notification(self, "That design is not installed")
            print("The design is not installed")


    #    #====================================================================
    #    #                       DESKTOPR
    #    #====================================================================

    def on_d_combo_changed_desktop(self, widget):
        try:
            pixbuf3 = GdkPixbuf.Pixbuf().new_from_file_at_size(
                base_dir + "/desktop_data/" + self.d_combo_desktop.get_active_text().lower().replace(" ", "_") + ".png",
                345,
                345,
            )
            self.image_DE.set_from_pixbuf(pixbuf3)
        except:
            self.image_DE.set_from_pixbuf(None)
        if desktopr.check_desktop(desktopr.session_mapping.get(self.d_combo_desktop.get_active_text())):
            self.desktop_status.set_text("This desktop is installed")
        else:
            self.desktop_status.set_text("This desktop is NOT installed")

    def on_install_clicked_desktop(self, widget, state):
        fn.create_log(self)
        print("Installing " + self.d_combo_desktop.get_active_text())
        desktopr.check_lock(self, self.d_combo_desktop.get_active_text(), state)

    def on_default_clicked_desktop(self, widget):
        fn.create_log(self)
        if desktopr.check_desktop(desktopr.session_mapping.get(self.d_combo_desktop.get_active_text())) is True:
            secs = settings.read_section()
            if "DESKTOP" in secs:
                settings.write_settings(
                    "DESKTOP", "default", self.d_combo_desktop.get_active_text()
                )
            else:
                settings.new_settings(
                    "DESKTOP", {"default": self.d_combo_desktop.get_active_text()}
                )
        else:
            fn.show_in_app_notification(self, "That desktop is not installed")
            print("Desktop is not installed")


    #    #====================================================================
    #    #                            LOGIN
    #    #====================================================================

    def on_d_combo_changed_login(self, widget):
        try:
            pixbuf3 = GdkPixbuf.Pixbuf().new_from_file_at_size(
                base_dir + "/login_data/" + login.login_mapping.get(self.d_combo_login.get_active_text()) + ".png",
                345,
                345,
            )
            self.image_login.set_from_pixbuf(pixbuf3)
        except:
            self.image_login.set_from_pixbuf(None)
        if login.check_login(self.d_combo_login.get_active_text()):
            self.login_status.set_text("This login is installed")
        else:
            self.login_status.set_text("This login is NOT installed")

    def on_install_clicked_login(self, widget, state):
        fn.create_log(self)
        print("Installing " + self.d_combo_login.get_active_text())
        login.install_login(self, self.d_combo_login.get_active_text(), state)

    #    #====================================================================
    #    #                       FISH
    #    #====================================================================

    def on_install_only_fish_clicked_reboot(self, widget):
        fn.install_package(self, "fish")
        fn.restart_program()

    def on_install_only_fish_clicked(self, widget):
        fn.install_package(self, "fish")
        print("Only Fish has been installed")
        print("Fish is installed without a configuration")
        fn.show_in_app_notification(
            self, "Only the Fish package is installed without a configuration"
        )

    def on_remove_only_fish_clicked(self, widget):
        fn.remove_package(self, "fish")

    def on_arcolinux_fish_package_clicked(self, widget):
        fn.install_arco_package(self, "arcolinux-fish-git")
        if fn.check_package_installed("arcolinux-fish-git") is True:
            # backup whatever is there
            if fn.path_check(fn.home + "/.config/fish"):
                now = datetime.datetime.now()

                if not fn.path.exists(fn.home + "/.config/fish-att"):
                    fn.makedirs(fn.home + "/.config/fish-att")
                    fn.permissions(fn.home + "/.config/fish-att")

                if fn.path.exists(fn.home + "/.config-att"):
                    fn.permissions(fn.home + "/.config-att")

                fn.copy_func(
                    fn.home + "/.config/fish",
                    fn.home
                    + "/.config/fish-att/fish-att-"
                    + now.strftime("%Y-%m-%d-%H-%M-%S"),
                    isdir=True,
                )
                fn.permissions(
                    fn.home
                    + "/.config/fish-att/fish-att-"
                    + now.strftime("%Y-%m-%d-%H-%M-%S")
                )

            fn.copy_func("/etc/skel/.config/fish", fn.home + "/.config/", True)
            fn.permissions(fn.home + "/.config/fish")

            # if there is no file .config/fish
            if not fn.path.isfile(fn.home + "/.config/fish/config.fish"):
                fn.shutil.copy(
                    "/etc/skel/.config/fish/config.fish",
                    fn.home + "/.config/fish/config.fish",
                )
                fn.permissions(fn.home + "/.config/fish/config.fish")

            fn.source_shell(self)
            print(
                "ATT Fish config is installed and your old fish folder (if any) is in ~/.config/fish-att"
            )
            fn.show_in_app_notification(self, "ATT fish config is installed")

    def on_arcolinux_only_fish_clicked(self, widget):
        if not fn.path.isdir(fn.home + "/.config/fish/"):
            try:
                fn.mkdir(fn.home + "/.config/fish/")
                fn.permissions(fn.home + "/.config/fish/")
            except Exception as error:
                print(error)

        if fn.path.isfile(fn.fish_arco):
            fn.shutil.copy(fn.fish_arco, fn.home + "/.config/fish/config.fish")
            fn.permissions(fn.home + "/.config/fish/config.fish")

        if not fn.path.isfile(fn.home + "/.config/fish/config.fish.bak"):
            fn.shutil.copy(fn.fish_arco, fn.home + "/.config/fish/config.fish.bak")
            fn.permissions(fn.home + "/.config/fish/config.fish.bak")

        fn.source_shell(self)
        print("Fish config has been saved")
        fn.show_in_app_notification(self, "Fish config has been saved")

    def on_fish_reset_clicked(self, widget):
        if fn.path.isfile(fn.home + "/.config/fish/config.fish.bak"):
            fn.shutil.copy(
                fn.home + "/.config/fish/config.fish.bak",
                fn.home + "/.config/fish/config.fish",
            )
            fn.permissions(fn.home + "/.config/fish/config.fish")

        if not fn.path.isfile(fn.home + "/.config/fish/config.fish.bak"):
            fn.shutil.copy(fn.fish_arco, fn.home + "/.config/fish/config.fish")
            fn.permissions(fn.home + "/.config/fish/config.fish")

        print("Fish config reset")
        fn.show_in_app_notification(self, "Fish config reset")

    def on_remove_fish_all(self, widget):
        fn.remove_package_s("arcolinux-fish-git")
        fn.remove_package_s("fish")
        print("Fish is removed - remove the folder in ~/.config/fish manually")
        fn.show_in_app_notificatio(
            self, "Fish is removed - remove the folder in ~/.config/fish manually"
        )

    def tofish_apply(self, widget):
        fn.change_shell(self, "fish")

    # ====================================================================
    #                       FIXES
    # ====================================================================

    def on_click_install_arch_keyring(self, widget):
        pathway = base_dir + "/data/arch/packages/"
        file = fn.listdir(pathway)
        fn.install_local_package(self, pathway + str(file).strip("[]'"))

    def on_click_install_arch_keyring_online(self, widget):
        pathway = "/tmp/att-installation/"
        fn.mkdir(pathway)
        command = (
            "wget https://archlinux.org/packages/core/any/archlinux-keyring/download --content-disposition -P"
            + pathway
        )
        try:
            fn.subprocess.call(
                command,
                shell=True,
                stdout=fn.subprocess.PIPE,
                stderr=fn.subprocess.STDOUT,
            )
            print("Downloading the package")
            GLib.idle_add(fn.show_in_app_notification, self, "Downloading the package")
        except Exception as error:
            print(error)

        file = fn.listdir(pathway)
        fn.install_local_package(self, pathway + str(file).strip("[]'"))
        try:
            fn.shutil.rmtree(pathway)
        except Exception as error:
            print(error)

    def on_click_fix_pacman_keys(self, widget):
        fn.install_package(self, "alacritty")
        try:
            fn.subprocess.call(
                "alacritty --hold -e /usr/share/athena-tweak-tool/data/any/fix-pacman-databases-and-keys",
                shell=True,
                stdout=fn.subprocess.PIPE,
                stderr=fn.subprocess.STDOUT,
            )
            print("Pacman has been reset (gpg, libraries,keys)")
            GLib.idle_add(fn.show_in_app_notification, self, "Pacman keys fixed")
        except Exception as error:
            print(error)

    def on_click_probe(self, widget):
        fn.install_package(self, "hw-probe")
        fn.install_package(self, "alacritty")
        try:
            fn.subprocess.call(
                "alacritty --hold -e /usr/share/athena-tweak-tool/data/arco/bin/arcolinux-probe",
                shell=True,
                stdout=fn.subprocess.PIPE,
                stderr=fn.subprocess.STDOUT,
            )
            print("Probe link has been created")
            GLib.idle_add(
                fn.show_in_app_notification, self, "Probe link has been created"
            )
        except Exception as error:
            print(error)

    def on_click_fix_mainstream(self, widget):
        fn.install_package(self, "alacritty")
        try:
            command = "alacritty --hold -e /usr/share/athena-tweak-tool/data/any/set-mainstream-servers"
            fn.subprocess.call(
                command.split(" "),
                shell=False,
                stdout=fn.subprocess.PIPE,
                stderr=fn.subprocess.STDOUT,
            )
            print("Mainstream servers have been set")
            GLib.idle_add(
                fn.show_in_app_notification, self, "Mainstream servers have been saved"
            )
        except Exception as error:
            print(error)

    def on_click_reset_mirrorlist(self, widget):
        try:
            if fn.path.isfile(fn.mirrorlist + ".bak"):
                fn.shutil.copy(fn.mirrorlist + ".bak", fn.mirrorlist)
        except Exception as error:
            print(error)
        print("Your original mirrorlist is back")
        GLib.idle_add(
            fn.show_in_app_notification, self, "Your original mirrorlist is back"
        )

    def on_click_get_arch_mirrors(self, widget):
        fn.install_package(self, "alacritty")
        try:
            fn.install_package(self, "reflector")
            fn.subprocess.call(
                "alacritty --hold -e /usr/share/athena-tweak-tool/data/any/archlinux-get-mirrors-reflector",
                shell=True,
                stdout=fn.subprocess.PIPE,
                stderr=fn.subprocess.STDOUT,
            )
            print("Fastest Arch Linux servers have been set using reflector")
            GLib.idle_add(
                fn.show_in_app_notification,
                self,
                "Fastest Arch Linux servers saved - reflector",
            )
        except:
            print("Install alacritty")

    def on_click_get_arch_mirrors2(self, widget):
        fn.install_package(self, "alacritty")
        try:
            fn.subprocess.call(
                "alacritty --hold -e /usr/share/athena-tweak-tool/data/any/archlinux-get-mirrors-rate-mirrors",
                shell=True,
                stdout=fn.subprocess.PIPE,
                stderr=fn.subprocess.STDOUT,
            )
            print("Fastest Arch Linux servers have been set using rate-mirrors")
            GLib.idle_add(
                fn.show_in_app_notification,
                self,
                "Fastest Arch Linux servers saved - rate-mirrors",
            )
        except Exception as error:
            print(error)

    def on_click_fix_sddm_conf(self, widget):
        fn.install_package(self, "alacritty")
        try:
            command = "alacritty --hold -e /usr/share/athena-tweak-tool/data/arco/bin/arcolinux-fix-sddm-config"
            fn.subprocess.call(
                command,
                shell=True,
                stdout=fn.subprocess.PIPE,
                stderr=fn.subprocess.STDOUT,
            )
            print("We use the default setup from plasma")
            print("Two files:")
            print(" - /etc/sddm.conf")
            print(" - /etc/sddm.d.conf/kde_settings.conf")
            GLib.idle_add(
                fn.show_in_app_notification,
                self,
                "Saved the original SDDM configuration",
            )
        except:
            print("Install alacritty")

    def on_click_fix_pacman_conf(self, widget):
        try:
            command = "alacritty --hold -e /usr/local/bin/arcolinux-fix-pacman-conf"
            fn.subprocess.call(
                command,
                shell=True,
                stdout=fn.subprocess.PIPE,
                stderr=fn.subprocess.STDOUT,
            )
            print("Saved the original /etc/pacman.conf")
            GLib.idle_add(
                fn.show_in_app_notification, self, "Saved the original /etc/pacman.conf"
            )
        except Exception as error:
            print(error)

    def on_click_fix_pacman_gpg_conf(self, widget):
        if not fn.path.isfile(fn.gpg_conf + ".bak"):
            fn.shutil.copy(fn.gpg_conf, fn.gpg_conf + ".bak")
        fn.shutil.copy(fn.gpg_conf_original, fn.gpg_conf)
        print("The new /etc/pacman.d/gnupg/gpg.conf has been saved")
        print("We only add servers to the config")
        GLib.idle_add(
            fn.show_in_app_notification,
            self,
            "The new /etc/pacman.d/gnupg/gpg.conf has been saved",
        )

    def on_click_fix_pacman_gpg_conf_local(self, widget):
        if not fn.path.isdir(fn.home + "/.gnupg"):
            try:
                fn.makedirs(fn.home + "/.gnupg", 0o766)
                fn.permissions(fn.home + "/.gnupg")
            except Exception as error:
                print(error)

        if not fn.path.isfile(fn.gpg_conf_local + ".bak"):
            try:
                fn.shutil.copy(fn.gpg_conf_local, fn.gpg_conf_local + ".bak")
                fn.permissions(fn.gpg_conf_local + ".bak")
            except Exception as error:
                print(error)

        fn.shutil.copy(fn.gpg_conf_local_original, fn.gpg_conf_local)
        fn.permissions(fn.gpg_conf_local)
        print("The new ~/.gnupg/gpg.conf has been saved")
        print("We only add servers to the config")
        GLib.idle_add(
            fn.show_in_app_notification,
            self,
            "The new ~/.gnupg/gpg.conf has been saved",
        )

    def on_click_install_arch_mirrors(self, widget):
        fn.install_package(self, "reflector")
        self.btn_run_reflector.set_sensitive(True)

    def on_click_install_arch_mirrors2(self, widget):
        fn.install_package(self, "rate-mirrors")
        self.btn_run_rate_mirrors.set_sensitive(True)

    def on_click_apply_global_cursor(self, widget):
        cursor = self.cursor_themes.get_active_text()
        fixes.set_global_cursor(self, cursor)
        print("Cursor is saved in /usr/share/icons/default")
        GLib.idle_add(
            fn.show_in_app_notification,
            self,
            "Cursor saved in /usr/share/icons/default",
        )

    def on_click_remove_all_variety_packages(self, widget):
        try:
            fn.install_package(self, "alacritty")
            fn.subprocess.call(
                "alacritty --hold -e /usr/share/athena-tweak-tool/data/arco/bin/arcolinux-remove-variety",
                shell=True,
                stdout=fn.subprocess.PIPE,
                stderr=fn.subprocess.STDOUT,
            )
            print("Removing variety and any related packages")
            GLib.idle_add(
                fn.show_in_app_notification,
                self,
                "Removing variety and any related packages",
            )
        except:
            print("Install alacritty")

    def on_click_remove_all_conky_packages(self, widget):
        try:
            fn.install_package(self, "alacritty")
            fn.subprocess.call(
                "alacritty --hold -e /usr/share/athena-tweak-tool/data/arco/bin/arcolinux-remove-conky",
                shell=True,
                stdout=fn.subprocess.PIPE,
                stderr=fn.subprocess.STDOUT,
            )
            print("Removing conky and any related packages")
            GLib.idle_add(
                fn.show_in_app_notification,
                self,
                "Removing conky and any related packages",
            )
        except:
            print("Install alacritty")

    def on_click_remove_all_kernels_but_linux(self, widget):
        try:
            fn.install_package(self, "alacritty")
            fn.subprocess.call(
                "alacritty --hold -e /usr/share/athena-tweak-tool/data/arco/bin/arcolinux-remove-all-kernels-but-linux",
                shell=True,
                stdout=fn.subprocess.PIPE,
                stderr=fn.subprocess.STDOUT,
            )
            print("Removing kernel(s) and any related packages")
            GLib.idle_add(
                fn.show_in_app_notification,
                self,
                "Removing kernel(s) and any related packages",
            )
        except:
            print("Install alacritty")

    def on_click_remove_all_kernels_but_linux_cachyos(self, widget):
        try:
            fn.install_package(self, "alacritty")
            fn.subprocess.call(
                "alacritty --hold -e /usr/share/athena-tweak-tool/data/arco/bin/arcolinux-remove-all-kernels-but-linux-cachyos",
                shell=True,
                stdout=fn.subprocess.PIPE,
                stderr=fn.subprocess.STDOUT,
            )
            print("Removing kernel(s) and any related packages")
            GLib.idle_add(
                fn.show_in_app_notification,
                self,
                "Removing kernel(s) and any related packages",
            )
        except:
            print("Install alacritty")

    def on_click_remove_all_kernels_but_linux_lts(self, widget):
        try:
            fn.install_package(self, "alacritty")
            fn.subprocess.call(
                "alacritty --hold -e /usr/share/athena-tweak-tool/data/arco/bin/arcolinux-remove-all-kernels-but-linux-lts",
                shell=True,
                stdout=fn.subprocess.PIPE,
                stderr=fn.subprocess.STDOUT,
            )
            print("Removing kernel(s) and any related packages")
            GLib.idle_add(
                fn.show_in_app_notification,
                self,
                "Removing kernel(s) and any related packages",
            )
        except:
            print("Install alacritty")

    def on_click_remove_all_kernels_but_linux_zen(self, widget):
        try:
            fn.install_package(self, "alacritty")
            fn.subprocess.call(
                "alacritty --hold -e /usr/share/athena-tweak-tool/data/arco/bin/arcolinux-remove-all-kernels-but-linux-zen",
                shell=True,
                stdout=fn.subprocess.PIPE,
                stderr=fn.subprocess.STDOUT,
            )
            print("Removing kernel(s) and any related packages")
            GLib.idle_add(
                fn.show_in_app_notification,
                self,
                "Removing kernel(s) and any related packages",
            )
        except:
            print("Install alacritty")

    def on_click_change_debug(self, widget):
        try:
            fn.install_package(self, "alacritty")
            fn.subprocess.call(
                "alacritty --hold -e /usr/share/athena-tweak-tool/data/arco/bin/remove-debug",
                shell=True,
                stdout=fn.subprocess.PIPE,
                stderr=fn.subprocess.STDOUT,
            )
            print("Changing debug into !debug in /etc/makepkg.conf")
            GLib.idle_add(
                fn.show_in_app_notification,
                self,
                "Changing debug into !debug in /etc/makepkg.conf",
            )
        except:
            print("Install alacritty")

    # ====================================================================
    #                       GRUB
    # ====================================================================

    def on_grub_item_clicked(self, widget, data):
        for x in data:
            self.grub_image_path = x.get_name()

    def on_set_grub_wallpaper(self, widget):
        if not fn.path.isfile(fn.grub_theme_conf):
            self.on_click_install_arco_vimix_clicked(self)

        if self.grub_image_path == "":
            fn.show_in_app_notification(self, "First choose a wallpaper image")
        else:
            fn.set_grub_wallpaper(self, self.grub_image_path)

    def on_reset_grub_wallpaper(self, widget):
        if fn.path.isfile(fn.grub_theme_conf + ".bak"):
            fn.shutil.copy(fn.grub_theme_conf + ".bak", fn.grub_theme_conf)
        self.pop_themes_grub(self.grub_theme_combo, fn.get_grub_wallpapers(), True)

        if not fn.path.isfile(fn.grub_theme_conf):
            self.on_click_install_arco_vimix_clicked(self)

        print("Default Vimix grub wallpaper applied")
        fn.show_in_app_notification(self, "Default Vimix grub wallpaper applied")

    def on_reset_grub(self, widget):
        if fn.path.isfile(fn.grub_default_grub + ".back"):
            fn.shutil.copy(fn.grub_default_grub + ".back", fn.grub_default_grub)
        self.pop_themes_grub(self.grub_theme_combo, fn.get_grub_wallpapers(), True)
        fn.make_grub(self)

    def pop_themes_grub(self, combo, lists, start):
        if fn.path.isfile(fn.grub_theme_conf):
            combo.get_model().clear()
            with open(fn.grub_theme_conf, "r", encoding="utf-8") as f:
                listss = f.readlines()
                f.close()

            val = fn.get_position(listss, "desktop-image: ")
            # bg_image = listss[val].split(" ")[1].replace('"', "").strip()

            for x in self.fb.get_children():
                self.fb.remove(x)

            for x in lists:
                pb = GdkPixbuf.Pixbuf().new_from_file_at_size(
                    "/boot/grub/themes/Vimix/" + x, 128, 128
                )
                pimage = Gtk.Image()
                pimage.set_name("/boot/grub/themes/Vimix/" + x)
                pimage.set_from_pixbuf(pb)
                self.fb.add(pimage)
                pimage.show_all()

    def on_grub_theme_change(self, widget):
        try:
            pixbuf3 = GdkPixbuf.Pixbuf().new_from_file_at_size(
                "/boot/grub/themes/Vimix/" + widget.get_active_text(),
                645,
                645,
            )
            print(widget.get_active_text())
            self.image_grub.set_from_pixbuf(pixbuf3)
        except Exception as error:
            print(error)

    def on_import_wallpaper(self, widget):
        text = self.tbimage.get_text()
        if len(text) > 1:
            print(fn.path.basename(text))
            fn.shutil.copy(text, "/boot/grub/themes/Vimix/" + fn.path.basename(text))
            self.pop_themes_grub(self.grub_theme_combo, fn.get_grub_wallpapers(), False)
        else:
            print("First search for a wallpaper")
            fn.show_in_app_notification(self, "First select an image")

    def on_remove_wallpaper(self, widget):
        widget.set_sensitive(False)
        if fn.path.isfile(self.grub_image_path):
            # if fn.path.isfile('/boot/grub/themes/Vimix/' +
            #                   self.grub_theme_combo.get_active_text()):
            excludes = [
                "archlinux03.jpg",
                "archlinux04.jpg",
                "archlinux06.jpg",
                "archlinux07.jpg",
                "arcolinux01.jpg",
                "arcolinux02.jpg",
                "arcolinux03.jpg",
                "arcolinux04.jpg",
                "arcolinux05.jpg",
                "arcolinux06.jpg",
                "arcolinux07.jpg",
                "arcolinux08.jpg",
                "background-slaze.jpg",
                "background-stylish.jpg",
                "background-tela.jpg",
                "background-vimix.jpg",
                "archlinux01.png",
                "archlinux02.png",
                "archlinux05.png",
                "arcolinux09.png",
                "arcolinux10.png",
                "arcolinux11.png",
                "arcolinux.png",
                "background.png",
            ]

            # if not self.grub_theme_combo.get_active_text() in excludes:
            if not fn.path.basename(self.grub_image_path) in excludes:
                # fn.unlink('/boot/grub/themes/Vimix/' +
                #           self.grub_theme_combo.get_active_text())
                fn.unlink(self.grub_image_path)
                self.pop_themes_grub(
                    self.grub_theme_combo, fn.get_grub_wallpapers(), True
                )
                fn.show_in_app_notification(self, "Wallpaper removed successfully")
            else:
                fn.show_in_app_notification(self, "You can not remove that wallpaper")
        else:
            print("First select a wallpaper to remove")
            fn.show_in_app_notification(self, "First select a wallpaper to remove")
        widget.set_sensitive(True)

    def on_choose_wallpaper(self, widget):
        dialog = Gtk.FileChooserDialog(
            title="Please choose a file",
            action=Gtk.FileChooserAction.OPEN,
        )
        filter = Gtk.FileFilter()
        filter.set_name("IMAGE Files")
        filter.add_mime_type("image/png")
        filter.add_mime_type("image/jpg")
        filter.add_mime_type("image/jpeg")
        dialog.set_filter(filter)
        dialog.set_current_folder(fn.home)
        dialog.add_buttons(
            Gtk.STOCK_CANCEL, Gtk.ResponseType.CANCEL, "Open", Gtk.ResponseType.OK
        )
        dialog.connect("response", self.open_response_cb)

        dialog.show()

    def open_response_cb(self, dialog, response):
        if response == Gtk.ResponseType.OK:
            self.tbimage.set_text(dialog.get_filename())
            dialog.destroy()
        elif response == Gtk.ResponseType.CANCEL:
            dialog.destroy()

    def on_click_install_arco_vimix_clicked(self, desktop):
        if fn.check_package_installed("grub2-theme-vimix-git"):
            fn.remove_package(self, "grub2-theme-vimix-git")
        fn.install_arco_package(self, "arcolinux-grub-theme-vimix-git")
        if fn.check_package_installed("arcolinux-grub-theme-vimix-git"):
            fn.set_default_grub_theme(self)
            fn.make_grub(self)
            GLib.idle_add(
                fn.show_in_app_notification, self, "Setting saved successfully"
            )
        fn.restart_program()

    def on_reset_grub_vimix(self, desktop):
        fn.install_arco_package(self, "arcolinux-grub-theme-vimix-git")
        fn.set_default_grub_theme(self)
        fn.make_grub(self)
        GLib.idle_add(fn.show_in_app_notification, self, "Vimix has been installed")

    def on_click_install_orignal_grub_rebornos(self, widget):
        if fn.check_package_installed("arcolinux-grub-theme-vimix-git"):
            fn.remove_package(self, "arcolinux-grub-theme-vimix-git")
        fn.install_package(self, "grub2-theme-vimix-git")
        self.on_reset_grub(self)
        fn.restart_program()

    def on_clicked_grub_timeout(self, widget):
        seconds = int(self.scale.get_value())
        fn.set_grub_timeout(self, seconds)
        fn.make_grub(self)

    # ====================================================================
    #                            PRIVACY
    # ====================================================================

    def set_hblock(self, widget, state):
        if fn.check_arco_repos_active() is True:
            if self.firstrun is not True:
                t = fn.threading.Thread(
                    target=fn.set_hblock, args=(self, widget, widget.get_active())
                )
                t.start()
                print("Hblock is now active/inactive")
                GLib.idle_add(
                    fn.show_in_app_notification, self, "Hblock is active/inactive"
                )
            else:
                self.firstrun = False
        else:
            print("First activate the ArcoLinux repos")
            self.hbswich.set_active(False)
            GLib.idle_add(
                fn.show_in_app_notification, self, "First activate the ArcoLinux repos"
            )

    def set_ublock_firefox(self, widget, state):
        t = fn.threading.Thread(
            target=fn.set_firefox_ublock, args=(self, widget, widget.get_active())
        )
        t.start()

    # ====================================================================
    #                       LIGHTDM
    # ====================================================================

    def on_click_lightdm_apply(self, widget):
        # for autologin, user and session
        if (
            (
                self.sessions_lightdm.get_active_text() is not None
                and self.autologin_lightdm.get_active() is True
            )
            or self.autologin_lightdm.get_active() is False
            and self.gtk_theme_names_lightdm.get_active_text() is not None
            and self.gtk_icon_names_lightdm.get_active_text() is not None
            and self.cursor_themes_lightdm.get_active_text() is not None
        ):
            t1 = fn.threading.Thread(
                target=lightdm.set_lightdm_value,
                args=(
                    self,
                    fn.get_lines(fn.lightdm_conf),
                    fn.sudo_username,
                    self.sessions_lightdm.get_active_text(),
                    self.autologin_lightdm.get_active(),
                ),
            )
            t1.daemon = True
            t1.start()
            print("Lightdm autologin and session settings saved successfully")
        else:
            print("Make sure all variables are filled in")
            fn.show_in_app_notification(self, "Fill in all fields")

        # for theme,icon and cursor - lightdm greeter
        if (
            (self.gtk_theme_names_lightdm.get_active_text() is not None)
            and self.gtk_icon_names_lightdm.get_active_text() is not None
            and self.cursor_themes_lightdm.get_active_text() is not None
        ):
            t1 = fn.threading.Thread(
                target=lightdm.set_lightdm_icon_theme_cursor,
                args=(
                    self,
                    fn.get_lines(fn.lightdm_greeter),
                    self.gtk_theme_names_lightdm.get_active_text(),
                    self.gtk_icon_names_lightdm.get_active_text(),
                    self.cursor_themes_lightdm.get_active_text(),
                ),
            )
            t1.daemon = True
            t1.start()
            print("Lightdm icon and theme settings saved successfully")
        else:
            print("Make sure all variables are filled in")
            fn.show_in_app_notification(self, "Fill in all fields")

        # for theme,icon and cursor - slick greeter
        if (
            (self.gtk_theme_names_lightdm.get_active_text() is not None)
            and self.gtk_icon_names_lightdm.get_active_text() is not None
            and self.cursor_themes_lightdm.get_active_text() is not None
        ):
            t1 = fn.threading.Thread(
                target=lightdm.set_lightdm_icon_theme_cursor_slick,
                args=(
                    self,
                    fn.get_lines(fn.lightdm_slick_greeter),
                    self.gtk_theme_names_lightdm.get_active_text(),
                    self.gtk_icon_names_lightdm.get_active_text(),
                ),
            )
            t1.daemon = True
            t1.start()
            print("Lightdm icon and theme settings saved successfully")
        else:
            print("Make sure all variables are filled in")
            fn.show_in_app_notification(self, "Fill in all fields")

    def on_click_install_arco_lightdmgreeter(self, widget):
        if fn.path.isfile(fn.lightdm_greeter_arco_att):
            fn.shutil.copy(fn.lightdm_greeter_arco_att, fn.lightdm_greeter)

        print("Lightdm gtk-greeter-settings applied")
        fn.show_in_app_notification(self, "Lightdm gtk-greeter-settings applied")

    def on_click_reset_lightdm_lightdm_greeter(self, widget):
        if fn.path.isfile(fn.lightdm_conf_bak):
            fn.shutil.copy(fn.lightdm_conf_bak, fn.lightdm_conf)
        if fn.path.isfile(fn.lightdm_greeter_bak):
            fn.shutil.copy(fn.lightdm_greeter_bak, fn.lightdm_greeter)

        if "#" in lightdm.check_lightdm(
            fn.get_lines(fn.lightdm_conf), "autologin-user="
        ):
            self.autologin_lightdm.set_active(False)
        else:
            self.autologin_lightdm.set_active(True)

        print("Lightdm and lightdm gtk-greeter-settings applied")
        fn.show_in_app_notification(self, "Lightdm settings applied")
        fn.restart_program()

    def on_autologin_lightdm_activated(self, widget, gparam):
        if widget.get_active():
            command = "groupadd autologin"
            try:
                fn.subprocess.call(
                    command.split(" "),
                    shell=False,
                    stdout=fn.subprocess.PIPE,
                    stderr=fn.subprocess.STDOUT,
                )
            except Exception as error:
                print(error)

            # print("We added the group autologin or checked that it exists")
            self.sessions_lightdm.set_sensitive(True)
        else:
            self.sessions_lightdm.set_sensitive(False)

    # no lightdm present
    def on_click_att_lightdm_clicked(self, desktop):
        fn.install_package(self, "lightdm")
        fn.install_package(self, "lightdm-gtk-greeter")
        fn.install_package(self, "lightdm-gtk-greeter-settings")
        print("--------------------------------------------")
        print("Do not forget to enable Lightdm")
        print("--------------------------------------------")
        GLib.idle_add(
            fn.show_in_app_notification,
            self,
            "Lightdm has been installed but not enabled",
        )
        try:
            fn.shutil.copy(fn.lightdm_conf_arco, fn.lightdm_conf)
            fn.shutil.copy(fn.lightdm_greeter_arco, fn.lightdm_greeter)
            fn.shutil.copy(fn.ligthdm_slick_greeter_arco, fn.lightdm_slick_greeter)
        except Exception as error:
            print(error)
        fn.restart_program()

    def on_click_lightdm_enable(self, desktop):
        fn.install_package(self, "lightdm")
        fn.install_package(self, "lightdm-gtk-greeter")
        fn.enable_login_manager(self, "lightdm")

    def on_click_install_slick_greeter(self, desktop):
        fn.install_package(self, "lightdm-slick-greeter")
        fn.enable_slick_greeter(self)
        login.find_slick_greeter_label(self.lbl_slickgreeter)

    def on_click_remove_slick_greeter(self, desktop):
        fn.remove_package(self, "lightdm-slick-greeter")
        fn.disable_slick_greeter(self)
        login.find_slick_greeter_label(self.lbl_slickgreeter)

    def on_click_lightdm_reset_original_att(self, widget):
        try:
            fn.shutil.copy(fn.lightdm_conf_arco, fn.lightdm_conf)
            fn.shutil.copy(fn.lightdm_greeter_arco, fn.lightdm_greeter)
            fn.shutil.copy(fn.ligthdm_slick_greeter_arco, fn.lightdm_slick_greeter)
        except Exception as error:
            print(error)

        print(
            "All files have been changed /etc/lightdm.conf, /etc/lightdm-gtk-greeter.conf"
        )
        print("and /etc/lightdm/slick-greeter.conf")
        print("Now change the configuration like you want it to be and save")
        fn.show_in_app_notification(
            self, "The ATT lightdm configuration is now applied"
        )
        fn.restart_program()

    # ====================================================================
    #                        LXDM
    # ====================================================================

    def on_click_install_lxdm(self, desktop):
        fn.install_package(self, "lxdm")
        print("--------------------------------------------")
        print("Do not forget to enable Lxdm")
        print("--------------------------------------------")
        fn.restart_program()

    # no lxdm present
    def on_click_att_lxdm_clicked(self, desktop):
        fn.install_package(self, "lxdm")
        try:
            fn.shutil.copy(fn.lxdm_conf_arco, fn.lxdm_conf)
        except Exception as error:
            print(error)
        try:
            fn.shutil.copy(fn.lxdm_conf_arco, fn.lxdm_conf)
        except Exception as error:
            print(error)
        print("--------------------------------------------")
        print("Do not forget to enable Lxdm")
        print("--------------------------------------------")
        fn.restart_program()

    def on_click_lxdm_enable(self, desktop):
        fn.install_package(self, "lxdm")
        fn.enable_login_manager(self, "lxdm")

    def on_autologin_lxdm_activated(self, widget, gparam):
        if widget.get_active():
            command = "groupadd autologin"
            try:
                fn.subprocess.call(
                    command.split(" "),
                    shell=False,
                    stdout=fn.subprocess.PIPE,
                    stderr=fn.subprocess.STDOUT,
                )
            except Exception as error:
                print(error)

    def on_click_lxdm_reset_original_att(self, widget):
        try:
            fn.shutil.copy(fn.lxdm_conf_arco, fn.lxdm_conf)
        except Exception as error:
            print(error)

        print("ATT Lxdm configuration file has been saved /etc/lxdm/lxdm.conf")
        print("Now change the configuration like you want it to be and save")
        fn.show_in_app_notification(self, "The ATT Lxdm configuration is now applied")
        fn.restart_program()

    def on_click_lxdm_reset(self, widget):
        if fn.path.isfile(fn.lxdm_conf_bak):
            fn.shutil.copy(fn.lxdm_conf_bak, fn.lxdm_conf)
        print("Lxdm default settings applied")
        fn.show_in_app_notification(self, "Lxdm default settings applied")
        fn.restart_program()

    def on_click_install_att_lxdm_minimalo(self, widget):
        fn.install_arco_package(self, "arcolinux-lxdm-theme-minimalo-git")
        lxdm.pop_lxdm_theme_greeter(self.lxdm_theme_greeter)

    def on_click_remove_att_lxdm_minimalo(self, widget):
        fn.remove_package(self, "arcolinux-lxdm-theme-minimalo-git")
        lxdm.pop_lxdm_theme_greeter(self.lxdm_theme_greeter)

    def on_click_install_lxdm_themes(self, widget):
        fn.install_arco_package(self, "lxdm-themes")
        lxdm.pop_lxdm_theme_greeter(self.lxdm_theme_greeter)

    def on_click_remove_lxdm_themes(self, widget):
        fn.remove_package(self, "lxdm-themes")
        lxdm.pop_lxdm_theme_greeter(self.lxdm_theme_greeter)

    def on_click_lxdm_apply(self, widget):
        if (
            self.lxdm_gtk_theme.get_active_text() is not None
            and self.lxdm_theme_greeter.get_active_text() is not None
        ):
            t1 = fn.threading.Thread(
                target=lxdm.set_lxdm_value,
                args=(
                    self,
                    fn.get_lines(fn.lxdm_conf),
                    fn.sudo_username,
                    self.lxdm_gtk_theme.get_active_text(),
                    self.lxdm_theme_greeter.get_active_text(),
                    self.autologin_lxdm.get_active(),
                    self.panel_lxdm.get_active(),
                ),
            )
            t1.daemon = True
            t1.start()
            print("Lxdm autologin and other session settings saved successfully")
        else:
            print("Select all elements - none can be empty")
            fn.show_in_app_notification(self, "You need to select all elements first")

    # ====================================================================
    #                        FASTFETCH CONFIG
    # ====================================================================

    def on_install_fast(self, widget):
        fn.install_package(self, "fastfetch")

    # ====================================================================
    #                        FASTFETCH CONFIG
    # ====================================================================

    # def on_install_fast(self, widget):
    #    fn.install_package(self, "fastfetch")

    # def on_distro_ascii_changed(self, widget):
    #     self.big_ascii.set_active(True)

    def on_apply_fast(self, widget):
        small_ascii = "auto"
        backend = "off"
        #    if self.asci.get_active():
        #        backend = "ascii"
        #        if not self.big_ascii.get_active() and not self.off.get_active():
        #            small_ascii = "arch_small"
        #            if fn.distr == "arcolinux":
        #                small_ascii = "arcolinux_small"
        #            if fn.distr == "archlinux":
        #               small_ascii = "arch_small"
        #           if fn.distr == "manjaro":
        #               small_ascii = "manjaro_small"
        #            backend = "ascii"
        #        elif not self.small_ascii.get_active() and not self.off.get_active():
        #            backend = "ascii"
        #        else:
        #            backend = "off"

        #    if self.distro_ascii.get_active_text() != "auto" and not self.off.get_active():
        #        small_ascii = self.distro_ascii.get_active_text()
        #        if self.small_ascii.get_active():
        #            if self.distro_ascii.get_active_text() == "ArcoLinux":
        #                small_ascii = "arcolinux_small"
        #            if self.distro_ascii.get_active_text() == "Arch":
        #                small_ascii = "arch_small"
        #            if self.distro_ascii.get_active_text() == "Manjaro":
        #               small_ascii = "manjaro_small"

        fastfetch.apply_config(self, backend, small_ascii)

    def on_reset_fast_att(self, widget):
        if fn.path.isfile(fn.fastfetch_arco):
            fn.shutil.copy(fn.fastfetch_arco, fn.fastfetch_config)
            fn.permissions(fn.fastfetch_config)
            print("Fastfetch default ATT settings applied")
            fn.show_in_app_notification(self, "Default settings applied")
            fastfetch.get_checkboxes(self)

    def on_reset_fast(self, widget):
        if fn.path.isfile(fn.fastfetch_config + ".bak"):
            fn.shutil.copy(fn.fastfetch_config + ".bak", fn.fastfetch_config)

            #        backend = fastfetch.check_backend()
            #        if backend == "ascii":
            #            self.asci.set_active(True)

            fastfetch.get_checkboxes(self)
            print("fastfetch default settings applied")
            fn.show_in_app_notification(self, "Default settings applied")

    # def radio_toggled(self, widget):
    #    if self.asci.get_active():
    #        self.big_ascii.set_sensitive(True)
    #        self.small_ascii.set_sensitive(True)
    #    else:
    #        self.big_ascii.set_sensitive(False)
    #        self.small_ascii.set_sensitive(False)

    # When using this function to toggle a lolcat: utility = name of tool, e.g. fastfetch

    def lolcat_toggle(self, widget, active, utility):
        lolcat_state = widget.get_active()
        util_state = utilities.get_util_state(self, utility)

        if lolcat_state:
            utilities.install_util("lolcat")
            if not util_state or utility == "fastfetch":
                util_state = True
                utilities.set_util_state(self, utility, True, True)
        elif not lolcat_state and utility == "fastfetch":
            utilities.set_util_state(self, utility, True, False)

        utilities.write_configs(utility, util_state, lolcat_state)

    def on_fast_util_toggled(self, switch, gparam):
        util_state = switch.get_active()
        lolcat_state = self.fast_lolcat.get_active()

        fastfetch.toggle_fastfetch(util_state)

        if not util_state:
            self.fast_lolcat.set_active(False)
            lolcat_state = False

        utilities.write_configs("fastfetch", util_state, lolcat_state)
        self.fast_lolcat.set_sensitive(util_state)

    def on_fast_lolcat_toggled(self, switch, gparam):
        lolcat_state = switch.get_active()
        util_state = self.fast_util.get_active()

        if util_state:
            fastfetch.toggle_lolcat(lolcat_state)
            utilities.write_configs("fastfetch", util_state, lolcat_state)

    def util_toggle(self, widget, active, utility):
        util_state = widget.get_active()
        lolcat_state = utilities.get_lolcat_state(self, utility)

        if util_state:
            utilities.install_util(utility)
            if utility == "fastfetch":
                utilities.set_util_state(self, utility, True, lolcat_state)
        else:
            if lolcat_state:
                lolcat_state = False
            utilities.set_util_state(self, utility, False, False)
            if utility == "fastfetch":
                utilities.set_util_state(self, utility, False, False)

            utilities.write_configs(utility, util_state, lolcat_state)

    def on_click_fastfetch_all_selection(self, widget):
        print("You have selected all Fastfetch switches")
        fastfetch.set_checkboxes_all(self)

    def on_click_fastfetch_normal_selection(self, widget):
        print("You have selected the normal selection")
        fastfetch.set_checkboxes_normal(self)

    def on_click_fastfetch_small_selection(self, widget):
        print("You have selected the small selection")
        fastfetch.set_checkboxes_small(self)

    def on_click_fastfetch_none_selection(self, widget):
        print("You have not selected any Fastfetch switch")
        fastfetch.set_checkboxes_none(self)

    def on_mirror_seed_repo_toggle(self, widget, active):
        if not pmf.mirror_exist(
            "Server = https://ant.seedhost.eu/arcolinux/$repo/$arch"
        ):
            pmf.append_mirror(self, fn.seedhostmirror)
        else:
            if self.opened is False:
                pmf.toggle_mirrorlist(self, widget.get_active(), "arco_mirror_seed")

    def on_mirror_gitlab_repo_toggle(self, widget, active):
        if not pmf.mirror_exist(
            "Server = https://gitlab.com/arcolinux/$repo/-/raw/main/$arch"
        ):
            pmf.append_mirror(self, fn.seedhostmirror)
        else:
            if self.opened is False:
                pmf.toggle_mirrorlist(self, widget.get_active(), "arco_mirror_gitlab")

    def on_mirror_belnet_repo_toggle(self, widget, active):
        if not pmf.mirror_exist(
            "Server = https://ant.seedhost.eu/arcolinux/$repo/$arch"
        ):
            pmf.append_mirror(self, fn.seedhostmirror)
        else:
            if self.opened is False:
                pmf.toggle_mirrorlist(self, widget.get_active(), "arco_mirror_belnet")

    def on_mirror_funami_repo_toggle(self, widget, active):
        if not pmf.mirror_exist(
            "Server = https://mirror.funami.tech/arcolinux/$repo/$arch"
        ):
            pmf.append_mirror(self, fn.seedhostmirror)
        else:
            if self.opened is False:
                pmf.toggle_mirrorlist(self, widget.get_active(), "arco_mirror_funami")

    def on_mirror_jingk_repo_toggle(self, widget, active):
        if not pmf.mirror_exist(
            "Server = https://mirror.jingk.ai/arcolinux/$repo/$arch"
        ):
            pmf.append_mirror(self, fn.seedhostmirror)
        else:
            if self.opened is False:
                pmf.toggle_mirrorlist(self, widget.get_active(), "arco_mirror_jingk")

    def on_mirror_accum_repo_toggle(self, widget, active):
        if not pmf.mirror_exist(
            "Server = https://mirror.accum.se/mirror/arcolinux.info/$repo/$arch"
        ):
            pmf.append_mirror(self, fn.seedhostmirror)
        else:
            if self.opened is False:
                pmf.toggle_mirrorlist(self, widget.get_active(), "arco_mirror_accum")

    def on_mirror_aarnet_repo_toggle(self, widget, active):
        if not pmf.mirror_exist(
            "Server = https://mirror.aarnet.edu.au/pub/arcolinux/$repo/$arch"
        ):
            pmf.append_mirror(self, fn.aarnetmirror)
        else:
            if self.opened is False:
                pmf.toggle_mirrorlist(self, widget.get_active(), "arco_mirror_aarnet")

    # def on_mirror_github_repo_toggle(self, widget, active):
    #     if not pmf.mirror_exist("Server = https://ant.seedhost.eu/arcolinux/$repo/$arch"):
    #         pmf.append_mirror(self, fn.seedhostmirror)
    #     else:
    #         if self.opened is False:
    #             pmf.toggle_mirrorlist(self, widget.get_active(),
    #                                   "arco_mirror_github")

    # =====================================================
    #               PACMAN CONF
    # =====================================================

    def on_update_pacman_databases_clicked(self, Widget):
        fn.update_repos(self)
        print("sudo pacman -Sy")
        print("All the selected pacman databases are up-to-date")
        fn.show_in_app_notification(
            self, "All the selected pacman databases are up-to-date"
        )

    def on_athena_clicked(self, widget):
        fn.install_athena(self)
        print("Athena keyring and mirrors added")
        print("Restart Att and select the repos")
        GLib.idle_add(
            fn.show_in_app_notification, self, "Athena keyring and mirrors added"
        )
        fn.update_repos(self)

    def on_athena_toggle(self, widget, active):
        if not pmf.repo_exist("[athena]"):
            pmf.append_repo(self, fn.athena_repo)
            print("Repo has been added to /etc/pacman.conf")
            fn.show_in_app_notification(self, "Repo has been added to /etc/pacman.conf")
        else:
            if self.opened is False:
                pmf.toggle_test_repos(self, widget.get_active(), "athena")

    def on_arcolinux_clicked(self, widget):
        fn.install_arcolinux(self)
        print("ArcoLinux keyring and mirrors added")
        fn.show_in_app_notification(
            self, "ArcoLinux keyring and mirrors added + activated"
        )
        self.on_pacman_atestrepo_toggle(self.atestrepo_button, False)
        self.on_pacman_arepo_toggle(self.arepo_button, True)
        self.on_pacman_a3p_toggle(self.a3prepo_button, True)
        self.on_pacman_axl_toggle(self.axlrepo_button, True)
        fn.update_repos(self)
        # fn.restart_program()

    def on_pacman_atestrepo_toggle(self, widget, active):
        if not pmf.repo_exist("[arcolinux_repo_testing]"):
            pmf.append_repo(self, fn.atestrepo)
            print("Repo has been added to /etc/pacman.conf")
            GLib.idle_add(
                fn.show_in_app_notification,
                self,
                "Repo has been added to /etc/pacman.conf",
            )
        else:
            if self.opened is False:
                pmf.toggle_test_repos(self, widget.get_active(), "arco_testing")

    def on_pacman_arepo_toggle(self, widget, active):
        if not pmf.repo_exist("[arcolinux_repo]"):
            pmf.append_repo(self, fn.arepo)
            print("Repo has been added to /etc/pacman.conf")
            GLib.idle_add(
                fn.show_in_app_notification,
                self,
                "Repo has been added to /etc/pacman.conf",
            )
        else:
            if self.opened is False:
                pmf.toggle_test_repos(self, widget.get_active(), "arco_base")
                if fn.check_arco_repos_active() is True:
                    self.button_install_design.set_sensitive(True)
                    self.button_install_desktop.set_sensitive(True)
                    self.button_reinstall_design.set_sensitive(True)
                    self.button_reinstall_desktop.set_sensitive(True)
                    self.install_arco_vimix.set_sensitive(True)
                else:
                    self.button_install_design.set_sensitive(False)
                    self.button_install_desktop.set_sensitive(False)
                    self.button_reinstall_design.set_sensitive(False)
                    self.button_reinstall_desktop.set_sensitive(False)
                    self.install_arco_vimix.set_sensitive(False)
        utilities.set_util_state_arco_switch(self)

    def on_pacman_a3p_toggle(self, widget, active):
        if not pmf.repo_exist("[arcolinux_repo_3party]"):
            pmf.append_repo(self, fn.a3drepo)
            print("Repo has been added to /etc/pacman.conf")
            GLib.idle_add(
                fn.show_in_app_notification,
                self,
                "Repo has been added to /etc/pacman.conf",
            )
        else:
            if self.opened is False:
                pmf.toggle_test_repos(self, widget.get_active(), "arco_a3p")
                if fn.check_arco_repos_active() is True:
                    self.button_install_design.set_sensitive(True)
                    self.button_install_desktop.set_sensitive(True)
                    self.button_reinstall_design.set_sensitive(True)
                    self.button_reinstall_desktop.set_sensitive(True)
                else:
                    self.button_install_design.set_sensitive(False)
                    self.button_install_desktop.set_sensitive(False)
                    self.button_reinstall_design.set_sensitive(False)
                    self.button_reinstall_desktop.set_sensitive(False)

    def on_pacman_axl_toggle(self, widget, active):
        if not pmf.repo_exist("[arcolinux_repo_xlarge]"):
            pmf.append_repo(self, fn.axlrepo)
            print("Repo has been added to /etc/pacman.conf")
            GLib.idle_add(
                fn.show_in_app_notification,
                self,
                "Repo has been added to /etc/pacman.conf",
            )
        else:
            if self.opened is False:
                pmf.toggle_test_repos(self, widget.get_active(), "arco_axl")

    def on_reborn_clicked(self, widget):
        fn.install_reborn(self)
        print("Reborn keyring and mirrors added")
        print("Restart Att and select the repos")
        GLib.idle_add(
            fn.show_in_app_notification, self, "Reborn keyring and mirrors added"
        )
        fn.update_repos(self)

    def on_reborn_toggle(self, widget, active):
        if not pmf.repo_exist("[Reborn-OS]"):
            pmf.append_repo(self, fn.reborn_repo)
            print("Repo has been added to /etc/pacman.conf")
            fn.show_in_app_notification(self, "Repo has been added to /etc/pacman.conf")
        else:
            if self.opened is False:
                pmf.toggle_test_repos(self, widget.get_active(), "reborn")

    def on_blackarch_clicked(self, widget):
        fn.install_blackarch(self)
        print("BlackArch keyring and mirrors added")
        print("Restart Att and select the repos")
        GLib.idle_add(
            fn.show_in_app_notification, self, "BlackArch keyring and mirrors added"
        )
        fn.update_repos(self)

    def on_blackarch_toggle(self, widget, active):
        if not pmf.repo_exist("[blackarch]"):
            pmf.append_repo(self, fn.blackarch_repo)
            print("Repo has been added to /etc/pacman.conf")
            fn.show_in_app_notification(self, "Repo has been added to /etc/pacman.conf")
        else:
            if self.opened is False:
                pmf.toggle_test_repos(self, widget.get_active(), "blackarch")

    def on_garuda_clicked(self, widget):
        fn.install_chaotics(self)
        print("Chaotics keyring and mirrors added")
        print("Restart Att and select the repos")
        GLib.idle_add(
            fn.show_in_app_notification, self, "Chaotics keyring and mirrors added"
        )
        fn.update_repos(self)

    def on_garuda_toggle(self, widget, active):
        if not pmf.repo_exist("[garuda]"):
            pmf.append_repo(self, fn.garuda_repo)
            print("Repo has been added to /etc/pacman.conf")
            fn.show_in_app_notification(self, "Repo has been added to /etc/pacman.conf")
        else:
            if self.opened is False:
                pmf.toggle_test_repos(self, widget.get_active(), "garuda")

    def on_chaotics_clicked(self, widget):
        fn.install_chaotics(self)
        print("Chaotics keyring and mirrors added")
        print("Restart Att and select the repos")
        GLib.idle_add(
            fn.show_in_app_notification, self, "Chaotics keyring and mirrors added"
        )
        fn.update_repos(self)

    def on_chaotics_toggle(self, widget, active):
        if not pmf.repo_exist("[chaotic-aur]"):
            pmf.append_repo(self, fn.chaotics_repo)
            print("Repo has been added to /etc/pacman.conf")
            fn.show_in_app_notification(self, "Repo has been added to /etc/pacman.conf")
        else:
            if self.opened is False:
                pmf.toggle_test_repos(self, widget.get_active(), "chaotics")

    def on_endeavouros_clicked(self, widget):
        fn.install_endeavouros(self)
        print("EndeavourOS keyring and mirrors added")
        print("Restart Att and select the repo")
        fn.show_in_app_notification(self, "Restart Att and select the repo")
        fn.update_repos(self)

    def on_endeavouros_toggle(self, widget, active):
        if not pmf.repo_exist("[endeavouros]"):
            pmf.append_repo(self, fn.endeavouros_repo)
            print("Repo has been added to /etc/pacman.conf")
            fn.show_in_app_notification(self, "Repo has been added to /etc/pacman.conf")
        else:
            if self.opened is False:
                pmf.toggle_test_repos(self, widget.get_active(), "endeavouros")

    def on_nemesis_toggle(self, widget, active):
        if not pmf.repo_exist("[nemesis_repo]"):
            pmf.append_repo(self, fn.nemesis_repo)
            print("Repo has been added to /etc/pacman.conf")
            fn.show_in_app_notification(self, "Repo has been added to /etc/pacman.conf")
        else:
            if self.opened is False:
                pmf.toggle_test_repos(self, widget.get_active(), "nemesis")
        fn.update_repos(self)

    # def on_xerolinux_clicked(self, widget):
    #     fn.install_xerolinux(self)
    #     print("XeroLinux mirrors added")
    #     print("Restart Att and select the repos")
    #     fn.show_in_app_notification(self, "Xerolinux mirrors added")
    #     fn.update_repos(self)

    # def on_xero_toggle(self, widget, active):
    #     if not pmf.repo_exist("[xerolinux_repo]"):
    #         pmf.append_repo(self, fn.xero_repo)
    #         print("Repo has been added to /etc/pacman.conf")
    #         fn.show_in_app_notification(self, "Repo has been added to /etc/pacman.conf")
    #     else:
    #         if self.opened is False:
    #             pmf.toggle_test_repos(self, widget.get_active(), "xero")

    # def on_xero_xl_toggle(self, widget, active):
    #     if not pmf.repo_exist("[xerolinux_repo_xl]"):
    #         pmf.append_repo(self, fn.xero_xl_repo)
    #         print("Repo has been added to /etc/pacman.conf")
    #         fn.show_in_app_notification(self, "Repo has been added to /etc/pacman.conf")
    #     else:
    #         if self.opened is False:
    #             pmf.toggle_test_repos(self, widget.get_active(), "xero_xl")

    # def on_xero_nv_toggle(self, widget, active):
    #     if not pmf.repo_exist("[xerolinux_nvidia_repo]"):
    #         pmf.append_repo(self, fn.xero_nv_repo)
    #         print("Repo has been added to /etc/pacman.conf")
    #         fn.show_in_app_notification(self, "Repo has been added to /etc/pacman.conf")
    #     else:
    #         if self.opened is False:
    #             pmf.toggle_test_repos(self, widget.get_active(), "xero_nv")

    def on_pacman_toggle1(self, widget, active):
        if not pmf.repo_exist("[core-testing]"):
            pmf.append_repo(self, fn.arch_testing_repo)
            print("Repo has been added to /etc/pacman.conf")
            fn.show_in_app_notification(self, "Repo has been added to /etc/pacman.conf")
        else:
            if self.opened is False:
                pmf.toggle_test_repos(self, widget.get_active(), "testing")

    def on_pacman_toggle2(self, widget, active):
        if not pmf.repo_exist("[core]"):
            pmf.append_repo(self, fn.arch_core_repo)
            print("Repo has been added to /etc/pacman.conf")
            fn.show_in_app_notification(self, "Repo has been added to /etc/pacman.conf")
        else:
            if self.opened is False:
                pmf.toggle_test_repos(self, widget.get_active(), "core")

    def on_pacman_toggle3(self, widget, active):
        if not pmf.repo_exist("[extra]"):
            pmf.append_repo(self, fn.arch_extra_repo)
            print("Repo has been added to /etc/pacman.conf")
            fn.show_in_app_notification(self, "Repo has been added to /etc/pacman.conf")
        else:
            if self.opened is False:
                pmf.toggle_test_repos(self, widget.get_active(), "extra")

    def on_pacman_toggle4(self, widget, active):
        if not pmf.repo_exist("[extra-testing]"):
            pmf.append_repo(self, fn.arch_community_testing_repo)
            print("Repo has been added to /etc/pacman.conf")
            fn.show_in_app_notification(self, "Repo has been added to /etc/pacman.conf")
        else:
            if self.opened is False:
                pmf.toggle_test_repos(self, widget.get_active(), "extra-testing")

    def on_pacman_toggle5(self, widget, active):
        if not pmf.repo_exist("[extra-testing]"):
            pmf.append_repo(self, fn.arch_extra_testing_repo)
            print("Repo has been added to /etc/pacman.conf")
            GLib.idle_add(
                fn.show_in_app_notification,
                self,
                "Repo has been added to /etc/pacman.conf",
            )
        else:
            if self.opened is False:
                pmf.toggle_test_repos(self, widget.get_active(), "community")

    def on_pacman_toggle6(self, widget, active):
        if not pmf.repo_exist("[multilib-testing]"):
            pmf.append_repo(self, fn.arch_multilib_testing_repo)
            print("Repo has been added to /etc/pacman.conf")
            fn.show_in_app_notification(self, "Repo has been added to /etc/pacman.conf")
        else:
            if self.opened is False:
                pmf.toggle_test_repos(self, widget.get_active(), "multilib-testing")

    # def on_pacman_toggle7(self, widget, active):
    #     if not pmf.repo_exist("[Reborn-OS]"):
    #         pmf.append_repo(self, fn.reborn_repo)
    #         print("Repo has been added to /etc/pacman.conf")
    #         fn.show_in_app_notification(self, "Repo has been added to /etc/pacman.conf")
    #     else:
    #         if self.opened is False:
    #             pmf.toggle_test_repos(self, widget.get_active(), "Reborn-OS")

    def on_pacman_toggle7(self, widget, active):
        if not pmf.repo_exist("[multilib]"):
            pmf.append_repo(self, fn.arch_multilib_repo)
            print("Repo has been added to /etc/pacman.conf")
            fn.show_in_app_notification(self, "Repo has been added to /etc/pacman.conf")
        else:
            if self.opened is False:
                pmf.toggle_test_repos(self, widget.get_active(), "multilib")

    def custom_repo_clicked(self, widget):
        custom_repo_text = self.textview_custom_repo.get_buffer()
        startiter, enditer = custom_repo_text.get_bounds()

        if not len(custom_repo_text.get_text(startiter, enditer, True)) < 5:
            print(custom_repo_text.get_text(startiter, enditer, True))
            pmf.append_repo(self, custom_repo_text.get_text(startiter, enditer, True))
        try:
            fn.update_repos(self)
        except Exception as error:
            print(error)
            print("Is the code correct? - check /etc/pacman.conf")

    def blank_pacman(source, target):
        fn.shutil.copy(fn.pacman, fn.pacman + ".bak")
        if fn.distr == "arch":
            fn.shutil.copy(fn.blank_pacman_arch, fn.pacman)
        if fn.distr == "arcolinux":
            fn.shutil.copy(fn.blank_pacman_arco, fn.pacman)
        if fn.distr == "endeavouros":
            fn.shutil.copy(fn.blank_pacman_eos, fn.pacman)
        if fn.distr == "garuda":
            fn.shutil.copy(fn.blank_pacman_garuda, fn.pacman)
        print("We have now a blank pacman /etc/pacman.conf depending on the distro")
        print("ATT will reboot automatically")
        print(
            "Now add the repositories in the order you would like them to appear in the /etc/pacman.conf"
        )
        fn.restart_program()

    def reset_pacman_local(self, widget):
        if fn.path.isfile(fn.pacman + ".bak"):
            fn.shutil.copy(fn.pacman + ".bak", fn.pacman)
            print("We have used /etc/pacman.conf.bak to reset /etc/pacman.conf")
            fn.show_in_app_notification(
                self, "Default Settings Applied - check in a terminal"
            )

    def reset_pacman_online(self, widget):
        if fn.distr == "arch":
            fn.shutil.copy(fn.pacman_arch, fn.pacman)
        if fn.distr == "arcolinux":
            fn.shutil.copy(fn.pacman_arco, fn.pacman)
        if fn.distr == "endeavouros":
            fn.shutil.copy(fn.pacman_eos, fn.pacman)
        if fn.distr == "garuda":
            fn.shutil.copy(fn.pacman_garuda, fn.pacman)
        print("The online version of /etc/pacman.conf is saved")
        fn.show_in_app_notification(
            self, "Default Settings Applied - check in a terminal"
        )

    # =====================================================
    #               PATREON LINK
    # =====================================================

    def on_social_clicked(self, widget, event):
        sup = support.Support(self)
        response = sup.run()

        if response == Gtk.ResponseType.DELETE_EVENT:
            sup.destroy()

    def tooltip_callback(self, widget, x, y, keyboard_mode, tooltip, text):
        tooltip.set_text(text)
        return True

    # ====================================================================
    #                       POLYBAR
    # ====================================================================

    # def on_polybar_apply_clicked(self, widget):
    #     if self.pbrbutton.get_active():
    #         state = True
    #     else:
    #         state = False

    #     polybar.set_config(self, self.pbcombo.get_active_text(), state)
    #     if fn.path.isfile(polybar.launch):
    #         fn.show_in_app_notification(self, "Restart polybar to see changes")
    #     else:
    #         fn.messagebox(
    #             self, "ERROR!!", "You dont seem to have a <b>launch.sh</b> file to launch/relaunch polybar")

    # def on_pb_browse_config(self, widget):
    #     dialog = Gtk.FileChooserDialog(
    #         title="Please choose a file", action=Gtk.FileChooserAction.OPEN)
    #     dialog.set_select_multiple(False)

    #     dialog.set_current_folder(fn.home)
    #     dialog.add_buttons(
    #         Gtk.STOCK_CANCEL, Gtk.ResponseType.CANCEL, "Open", Gtk.ResponseType.OK)
    #     dialog.connect("response", self.open_config_response)

    #     dialog.show()

    # def on_pb_browse_image(self, widget):
    #     dialog = Gtk.FileChooserDialog(
    #         title="Please choose a file", action=Gtk.FileChooserAction.OPEN)
    #     dialog.set_select_multiple(False)
    #     filter = Gtk.FileFilter()
    #     filter.set_name("IMAGE Files")
    #     filter.add_mime_type("image/png")
    #     filter.add_mime_type("image/jpg")
    #     filter.add_mime_type("image/jpeg")
    #     dialog.set_filter(filter)
    #     dialog.set_current_folder(fn.home)
    #     dialog.add_buttons(
    #         Gtk.STOCK_CANCEL, Gtk.ResponseType.CANCEL, "Open", Gtk.ResponseType.OK)
    #     dialog.connect("response", self.open_image_response)

    #     dialog.show()

    # def open_image_response(self, dialog, response):

    #     if response == Gtk.ResponseType.OK:
    #         self.pbtextbox2.set_text(dialog.get_filename())
    #         dialog.destroy()
    #     elif response == Gtk.ResponseType.CANCEL:
    #         dialog.destroy()

    # def open_config_response(self, dialog, response):

    #     if response == Gtk.ResponseType.OK:
    #         self.pbtextbox1.set_text(dialog.get_filename())
    #         dialog.destroy()
    #     elif response == Gtk.ResponseType.CANCEL:
    #         dialog.destroy()

    # def on_pb_import_clicked(self, widget):
    #     polybar.import_config(
    #         self, self.pbtextbox1.get_text(), self.pbtextbox2.get_text())

    # def on_pb_change_item(self, widget):
    #     try:
    #         pixbuf = GdkPixbuf.Pixbuf().new_from_file_at_size(
    #             fn.config_dir + '/images/' + widget.get_active_text() + '.jpg', 385, 385)
    #         self.pbimage.set_from_pixbuf(pixbuf)
    #     except:
    #         self.pbimage.set_from_pixbuf(None)

    # ====================================================================
    #                       SDDM
    # ====================================================================

    def on_click_sddm_apply(self, widget):
        fn.create_sddm_k_dir()
        if (
            self.sessions_sddm.get_active_text() is not None
            and self.theme_sddm.get_active_text() is not None
            and self.autologin_sddm.get_active() is True
            and self.sddm_cursor_themes.get_active_text() is not None
        ) or (
            self.autologin_sddm.get_active() is False
            and self.theme_sddm.get_active_text() is not None
            and self.sddm_cursor_themes.get_active_text() is not None
        ):
            if fn.path.isfile(fn.sddm_default_d2):
                t1 = fn.threading.Thread(
                    target=sddm.set_sddm_value,
                    args=(
                        self,
                        sddm.get_sddm_lines(fn.sddm_default_d2),
                        fn.sudo_username,
                        self.sessions_sddm.get_active_text(),
                        self.autologin_sddm.get_active(),
                        self.theme_sddm.get_active_text(),
                        self.sddm_cursor_themes.get_active_text(),
                    ),
                )
                t1.daemon = True
                t1.start()

            if fn.check_content("[Autologin]", fn.sddm_default_d1):
                t2 = fn.threading.Thread(
                    target=sddm.set_user_autologin_value,
                    args=(
                        self,
                        sddm.get_sddm_lines(fn.sddm_default_d1),
                        fn.sudo_username,
                        self.sessions_sddm.get_active_text(),
                        self.autologin_sddm.get_active(),
                    ),
                )
                t2.daemon = True
                t2.start()

            print("Sddm settings saved successfully")
            fn.show_in_app_notification(self, "Sddm settings saved successfully")

        else:
            print("You need to select desktop, theme and cursor first")
            fn.show_in_app_notification(
                self, "You need to select desktop and/or theme first"
            )

    def on_click_sddm_reset(self, widget):
        if fn.path.isfile(fn.sddm_default_d2):
            if "#" in sddm.check_sddm(sddm.get_sddm_lines(fn.sddm_default_d2), "User="):
                self.autologin_sddm.set_active(False)
            else:
                self.autologin_sddm.set_active(True)
            print("Your sddm.conf backup is now applied")
            fn.show_in_app_notification(self, "Your sddm.conf backup is now applied")
        else:
            print("We did not find a backup file for sddm.conf")
            fn.show_in_app_notification(
                self, "We did not find a backup file for sddm.conf"
            )

    def on_click_sddm_reset_original_att(self, widget):
        fn.create_sddm_k_dir()
        try:
            fn.shutil.copy(fn.sddm_default_d1_arco, fn.sddm_default_d1)
            fn.shutil.copy(fn.sddm_default_d2_arco, fn.sddm_default_d2)
        except Exception as error:
            print(error)

        print("The ATT sddm configuration is now applied")
        print(
            "Both files have been changed /etc/sddm.conf and /etc/sddm.conf.d/kde_settings.conf"
        )
        print("Now change the configuration like you want it to be and save")
        fn.show_in_app_notification(
            self, "The ATT sddm.conf and sddm.d.conf is now applied"
        )
        fn.restart_program()

    def on_click_sddm_reset_original(self, widget):
        fn.create_sddm_k_dir()
        try:
            if fn.path.isfile(fn.sddm_default_d1_bak):
                fn.shutil.copy(fn.sddm_default_d1_bak, fn.sddm_default_d1)
            if fn.path.isfile(fn.sddm_default_d2_bak):
                fn.shutil.copy(fn.sddm_default_d2_bak, fn.sddm_default_d2)
        except Exception as error:
            print(error)

        print("Your orignal sddm configuration is now applied")
        print(
            "Both files have been changed /etc/sddm.conf and /etc/sddm.conf.d/kde_settings.conf"
        )
        fn.show_in_app_notification(
            self, "The original sddm.conf and sddm.d.conf is now applied"
        )
        fn.restart_program()

    def on_click_no_sddm_reset_original(self, widget):
        fn.create_sddm_k_dir()
        if fn.path.isfile(fn.sddm_default_d1_arco):
            fn.shutil.copyfile(fn.sddm_default_d1_arco, fn.sddm_default_d1)
            fn.shutil.copyfile(fn.sddm_default_d2_arco, fn.sddm_default_d2)
        print("The ArcoLinux sddm configuration is now applied")
        fn.show_in_app_notification(
            self, "The ArcoLinux sddm configuration is now applied"
        )

    def on_autologin_sddm_activated(self, widget, gparam):
        if widget.get_active():
            command = "groupadd autologin"
            try:
                fn.subprocess.call(
                    command.split(" "),
                    shell=False,
                    stdout=fn.subprocess.PIPE,
                    stderr=fn.subprocess.STDOUT,
                )
            except Exception as error:
                print(error)
            self.sessions_sddm.set_sensitive(True)
        else:
            self.sessions_sddm.set_sensitive(False)

    def on_click_install_sddm_themes(self, widget):
        fn.install_arco_package(self, "arcolinux-meta-sddm-themes")
        sddm.pop_theme_box(self, self.theme_sddm)

    def on_click_remove_sddm_themes(self, widget):
        fn.remove_package_s(self, "arcolinux-meta-sddm-themes")
        if self.keep_default_theme.get_active() is True:
            fn.install_arco_package(self, "arcolinux-sddm-simplicity-git")
        fn.remove_package_remnants("arcolinux-meta-sddm-themes")
        sddm.pop_theme_box(self, self.theme_sddm)

    def on_click_install_bibata_cursor(self, widget):
        fn.install_arco_package(self, "bibata-cursor-theme-bin")
        if fn.check_package_installed("sddm"):
            sddm.pop_gtk_cursor_names(self, self.sddm_cursor_themes)
        if fn.check_package_installed("lightdm"):
            lightdm.pop_gtk_cursor_names(self, self.cursor_themes_lightdm)
        fixes.pop_gtk_cursor_names(self.cursor_themes)

    def on_click_remove_bibata_cursor(self, widget):
        fn.remove_package(self, "bibata-cursor-theme-bin")
        if fn.check_package_installed("sddm"):
            sddm.pop_gtk_cursor_names(self, self.sddm_cursor_themes)
        if fn.check_package_installed("lightdm"):
            lightdm.pop_gtk_cursor_names(self, self.cursor_themes_lightdm)
        fixes.pop_gtk_cursor_names(self.cursor_themes)

    def on_click_install_bibatar_cursor(self, widget):
        fn.install_arco_package(self, "bibata-extra-cursor-theme")
        if fn.check_package_installed("sddm"):
            sddm.pop_gtk_cursor_names(self, self.sddm_cursor_themes)
        if fn.check_package_installed("lightdm"):
            lightdm.pop_gtk_cursor_names(self, self.cursor_themes_lightdm)
        fixes.pop_gtk_cursor_names(self.cursor_themes)

    def on_click_remove_bibatar_cursor(self, widget):
        fn.remove_package(self, "bibata-extra-cursor-theme")
        if fn.check_package_installed("sddm"):
            sddm.pop_gtk_cursor_names(self, self.sddm_cursor_themes)
        if fn.check_package_installed("lightdm"):
            lightdm.pop_gtk_cursor_names(self, self.cursor_themes_lightdm)
        fixes.pop_gtk_cursor_names(self.cursor_themes)

    # if no sddm - press 1
    def on_click_att_sddm_clicked(self, desktop):
        fn.install_package(self, "sddm")
        fn.install_arco_package(self, "arcolinux-sddm-simplicity-git")
        print("Do not forget to enable sddm")
        fn.show_in_app_notification(self, "Sddm has been installed but not enabled")
        fn.create_sddm_k_dir()
        fn.shutil.copyfile(fn.sddm_default_d1_arco, fn.sddm_default_d1)
        fn.shutil.copyfile(fn.sddm_default_d2_arco, fn.sddm_default_d2)
        print("The ATT sddm configuration is now applied")
        fn.show_in_app_notification(self, "The ATT sddm configuration is now applied")
        fn.restart_program()

    def on_click_sddm_enable(self, desktop):
        fn.install_package(self, "sddm")
        fn.enable_login_manager(self, "sddm")

    def on_launch_adt_clicked(self, desktop):
        # check if package is installed and update label
        if self.adt_installed is True:
            fn.remove_package(self, "arcolinux-desktop-trasher-git")
            if fn.check_package_installed("arcolinux-desktop-trasher-git") is False:
                self.button_adt.set_label("Install the ArcoLinux Desktop Trasher")
                self.adt_installed = False

        else:
            fn.install_package(self, "arcolinux-desktop-trasher-git")
            if fn.check_package_installed("arcolinux-desktop-trasher-git") is True:
                self.button_adt.set_label("Remove the ArcoLinux Desktop Trasher")
                self.adt_installed = True
        # try:
        #    subprocess.Popen("/usr/local/bin/arcolinux-desktop-trasher")
        #    fn.show_in_app_notification(self, "ArcoLinux Desktop Trasher launched")
        #    print("We started ADT")
        # except:
        #    pass

    def on_click_apply_parallel_downloads(self, widget):
        fixes.set_parallel_downloads(self, widget)

    # ====================================================================
    #                       SERVICES - NSSWITCH
    # ====================================================================

    def on_install_discovery_clicked(self, widget):
        fn.install_discovery(self)
        GLib.idle_add(
            fn.show_in_app_notification,
            self,
            "Network discovery is installed - a good nsswitch_config is needed",
        )
        print("Network discovery is installed")

    def on_remove_discovery_clicked(self, widget):
        fn.remove_discovery(self)
        GLib.idle_add(fn.show_in_app_notification, self, "Network discovery is removed")
        print("Network discovery is removed")

    def on_click_reset_nsswitch(self, widget):
        if fn.path.isfile(fn.nsswitch_config + ".bak"):
            fn.shutil.copy(fn.nsswitch_config + ".bak", fn.nsswitch_config)

        print("/etc/nsswitch.config reset")
        fn.show_in_app_notification(self, "Nsswitch config reset")

    def on_click_apply_nsswitch(self, widget):
        services.choose_nsswitch(self)

    # ====================================================================
    #                       SERVICES - SAMBA
    # ====================================================================

    def on_click_create_samba_user(self, widget):
        services.create_samba_user(self)

    # def on_click_delete_user(self, widget):
    #     services.delete_user(self)

    def on_click_restart_smb(self, widget):
        services.restart_smb(self)

    def on_click_save_samba_share(self, widget):
        fn.save_samba_config(self)

    def on_click_install_arco_thunar_plugin(self, widget):
        if fn.path.isfile(fn.arcolinux_mirrorlist):
            if fn.check_arco_repos_active() is True:
                fn.install_arco_thunar_plugin(self, widget)
            else:
                print("First activate the ArcoLinux repos")
                fn.show_in_app_notification(self, "First activate the ArcoLinux repos")
        else:
            print("Install the ArcoLinux keys and mirrors")
            fn.show_in_app_notification(self, "Install the ArcoLinux keys and mirrors")

    def on_click_install_arco_caja_plugin(self, widget):
        if fn.path.isfile(fn.arcolinux_mirrorlist):
            if fn.check_arco_repos_active() is True:
                fn.install_arco_caja_plugin(self, widget)
            else:
                print("First activate the ArcoLinux repos")
                fn.show_in_app_notification(self, "First activate the ArcoLinux repos")
        else:
            print("Install the ArcoLinux keys and mirrors")
            fn.show_in_app_notification(self, "Install the ArcoLinux keys and mirrors")

    def on_click_install_arco_nemo_plugin(self, widget):
        if fn.path.isfile(fn.arcolinux_mirrorlist):
            if fn.check_arco_repos_active() is True:
                fn.install_arco_nemo_plugin(self, widget)
            else:
                print("First activate the ArcoLinux repos")
                fn.show_in_app_notification(self, "First activate the ArcoLinux repos")
        else:
            print("Install the ArcoLinux keys and mirrors")
            fn.show_in_app_notification(self, "Install the ArcoLinux keys and mirrors")

    def on_click_apply_samba(self, widget):
        services.choose_smb_conf(self)
        print("Applying selected samba configuration")
        fn.show_in_app_notification(self, "Applying selected samba configuration")

    def on_click_reset_samba(self, widget):
        if fn.path.isfile(fn.samba_config + ".bak"):
            fn.shutil.copy(fn.samba_config + ".bak", fn.samba_config)
            print("We have reset your /etc/samba/smb.conf")
            fn.show_in_app_notification(self, "Original smb.conf is applied")
        if not fn.path.isfile(fn.samba_config + ".bak"):
            print("We have no original /etc/samba/smb.conf.bak file - we can not reset")
            print("Instead choose one from the dropdown")
            fn.show_in_app_notification(self, "No backup configuration present")

    def on_click_install_samba(self, widget):
        fn.install_samba(self)
        print("Samba has been successfully installed")
        fn.show_in_app_notification(self, "Samba has been successfully installed")

    def on_click_uninstall_samba(self, widget):
        fn.uninstall_samba(self)
        print("Samba has been successfully uninstalled")
        fn.show_in_app_notification(self, "Samba has been successfully uninstalled")

    # ====================================================================
    #                       SERVICES - AUDIO
    # ====================================================================

    def on_click_switch_to_pulseaudio(self, widget):
        print("Installing pulseaudio")

        # if fn.distr == "manjaro":
        #     fn.remove_package_dd(self, "manjaro-pulse")

        if fn.check_package_installed("pipewire-pulse"):
            fn.remove_package_dd(self, "pipewire-pulse")
            fn.remove_package_dd(self, "wireplumber")

        try:
            fn.install_package(self, "pulseaudio")  # conflicts with pipewire-pulse
            fn.install_package(
                self, "pulseaudio-bluetooth"
            )  # conflicts with pipewire-pulse
            fn.install_package(self, "pulseaudio-alsa")

            fn.install_package(self, "pavucontrol")

            fn.install_package(self, "alsa-utils")
            fn.install_package(self, "alsa-plugins")
            fn.install_package(self, "alsa-lib")
            fn.install_package(self, "alsa-firmware")
            fn.install_package(self, "gstreamer")
            fn.install_package(self, "gst-plugins-good")
            fn.install_package(self, "gst-plugins-bad")
            fn.install_package(self, "gst-plugins-base")
            fn.install_package(self, "gst-plugins-ugly")

            # if blueberry_installed:
            #     fn.install_package(self, "blueberry")

            # add line for autoconnect
            services.add_autoconnect_pulseaudio(self)

        except Exception as error:
            print(error)

    def on_click_switch_to_pipewire(self, widget):
        print("Installing pipewire")
        blueberry_installed = False

        try:
            if fn.check_package_installed("pulseaudio"):
                fn.remove_package_dd(self, "pulseaudio")
                fn.remove_package_dd(self, "pulseaudio-bluetooth")

            fn.install_package(self, "pipewire")
            fn.install_package(
                self, "pipewire-pulse"
            )  # contains wireplumber - conflicts with pulseaudio and pulseaudio-bluetooth
            fn.install_package(self, "pipewire-alsa")
            # fn.install_package(self, "pipewire-jack")
            # fn.install_package(self, "pipewire-zeroconf")

            fn.install_package(self, "pavucontrol")

            fn.install_package(self, "alsa-utils")
            fn.install_package(self, "alsa-plugins")
            fn.install_package(self, "alsa-lib")
            fn.install_package(self, "alsa-firmware")
            fn.install_package(self, "gstreamer")
            fn.install_package(self, "gst-plugins-good")
            fn.install_package(self, "gst-plugins-bad")
            fn.install_package(self, "gst-plugins-base")
            fn.install_package(self, "gst-plugins-ugly")

            if blueberry_installed:
                fn.install_package(self, "blueberry")

            if fn.check_package_installed("pipewire-media-session"):
                fn.remove_package_dd(self, "pipewire-media-session")
                fn.install_package(self, "pipewire-pulse")
                fn.install_package(self, "wireplumber")

        except Exception as error:
            print(error)

    # ====================================================================
    #                       SERVICES - BLUETOOTH
    # ====================================================================
    # applications
    def on_click_install_bluetooth(self, widget):
        print("Installing bluetooth")
        fn.install_package(self, "bluez")
        fn.install_package(self, "bluez-utils")
        if fn.check_package_installed("bluez"):
            self.enable_bt.set_sensitive(True)
            self.disable_bt.set_sensitive(True)
            self.restart_bt.set_sensitive(True)

    def on_click_remove_bluetooth(self, widget):
        print("Removing bluez")
        fn.remove_package_dd(self, "bluez")
        fn.remove_package_dd(self, "bluez-utils")
        if not fn.check_package_installed("bluez"):
            self.enable_bt.set_sensitive(False)
            self.disable_bt.set_sensitive(False)
            self.restart_bt.set_sensitive(False)

    # def on_click_install_gnome_bt(self, widget):
    #     print("Installing gnome-bluetooth")
    #     fn.install_package(self, "gnome-bluetooth")

    # def on_click_remove_gnome_bt(self, widget):
    #     print("Removing gnome-bluetooth")
    #     fn.remove_package_dd(self, "gnome-bluetooth")

    def on_click_install_blueberry(self, widget):
        print("Installing blueberry")
        fn.install_package(self, "blueberry")

    def on_click_remove_blueberry(self, widget):
        print("Removing blueberry")
        fn.remove_package(self, "blueberry")

    def on_click_install_blueman(self, widget):
        print("Installing blueman")
        fn.install_package(self, "blueman")

    def on_click_remove_blueman(self, widget):
        print("Removing blueman")
        fn.remove_package(self, "blueman")

    def on_click_install_bluedevil(self, widget):
        print("Installing bluedevil")
        fn.install_package(self, "bluedevil")

    def on_click_remove_bluedevil(self, widget):
        print("Removing bluedevil")
        fn.remove_package_s(self, "bluedevil")

    # service
    def on_click_enable_bluetooth(self, widget):
        print("Enabling bluetooth service/socket")
        fn.enable_service("bluetooth")
        fn.show_in_app_notification(self, "Bluetooth has been enabled")

    def on_click_disable_bluetooth(self, widget):
        print("Enabling bluetooth service/socket")
        fn.disable_service("bluetooth")
        fn.show_in_app_notification(self, "Bluetooth has been disabled")

    def on_click_restart_bluetooth(self, widget):
        print("Restart bluetooth")
        fn.restart_service("bluetooth")
        fn.show_in_app_notification(self, "Bluetooth has been restarted")

    # ====================================================================
    #                       SERVICES - CUPS
    # ====================================================================

    def on_click_install_cups(self, widget):
        print("Installing cups")
        fn.install_package(self, "cups")

    def on_click_remove_cups(self, widget):
        print("Removing cups")
        fn.remove_package(self, "cups")

    def on_click_install_cups_pdf(self, widget):
        print("Installing cups-pdf")
        fn.install_package(self, "cups-pdf")

    def on_click_remove_cups_pdf(self, widget):
        print("Removing cups-pdf")
        fn.remove_package(self, "cups-pdf")

    def on_click_enable_cups(self, widget):
        print("Enabling cups service/socket")
        fn.enable_service("cups")

    def on_click_disable_cups(self, widget):
        print("Enabling cups service/socket")
        fn.disable_service("cups")

    def on_click_restart_cups(self, widget):
        print("Restart cups")
        fn.restart_service("cups")

    def on_click_install_printer_drivers(self, widget):
        print("Following printer drivers have been installed")
        fn.install_package(self, "foomatic-db-engine")
        fn.install_package(self, "foomatic-db")
        fn.install_package(self, "foomatic-db-ppds")
        fn.install_package(self, "foomatic-db-nonfree")
        fn.install_package(self, "foomatic-db-nonfree-ppds")
        fn.install_package(self, "gutenprint")
        fn.install_package(self, "foomatic-db-gutenprint-ppds")
        fn.install_package(self, "ghostscript")
        fn.install_package(self, "gsfonts")

    def on_click_remove_printer_drivers(self, widget):
        print("Following printer drivers have been removed")
        fn.remove_package(self, "foomatic-db-engine")
        fn.remove_package(self, "foomatic-db")
        fn.remove_package(self, "foomatic-db-ppds")
        fn.remove_package(self, "foomatic-db-nonfree")
        fn.remove_package(self, "foomatic-db-nonfree-ppds")
        fn.remove_package(self, "gutenprint")
        fn.remove_package(self, "foomatic-db-gutenprint-ppds")
        fn.remove_package(self, "ghostscript")
        fn.remove_package(self, "gsfonts")

    def on_click_install_hplip(self, widget):
        print("Installing Hplip")
        fn.install_package(self, "hplip")

    def on_click_remove_hplip(self, widget):
        print("Removing Hplip")
        fn.remove_package(self, "hplip")

    def on_click_install_system_config_printer(self, widget):
        print("Installing system_config_printer")
        fn.install_package(self, "system-config-printer")

    def on_click_remove_system_config_printer(self, widget):
        print("Removing system_config_printer")
        fn.remove_package(self, "system_config_printer")

    # TODO : how to launch an app as the user
    # def on_click_launch_system_config_printer(self, desktop):
    #     if fn.check_package_installed("system-config-printer"):
    #         try:
    #             subprocess.Popen("/usr/bin/system-config-printer")
    #             GLib.idle_add(
    #                 fn.show_in_app_notification,
    #                 self,
    #                 "System config printer launched",
    #             )
    #             print("We started system-config-printer")
    #         except:
    #             pass
    #     else:
    #         print("First install system-config-printer package")
    #         fn.show_in_app_notification(self, "First install system-config-printer")

    # ====================================================================
    #                       SHELLS EXTRA
    # ====================================================================

    def on_extra_shell_applications_clicked(self, widget):
        if self.expac.get_active():
            fn.install_package(self, "expac")
        if self.ripgrep.get_active():
            fn.install_package(self, "ripgrep")
        if self.yay.get_active():
            fn.install_arco_package(self, "yay-bin")
        if self.paru.get_active():
            fn.install_arco_package(self, "paru-bin")
        if self.bat.get_active():
            fn.install_package(self, "bat")
        if self.downgrade.get_active():
            fn.install_arco_package(self, "downgrade")
        if self.hw_probe.get_active():
            fn.install_arco_package(self, "hw-probe")
        if self.rate_mirrors.get_active():
            fn.install_arco_package(self, "rate-mirrors-bin")
        if self.most.get_active():
            fn.install_package(self, "most")
        print("Software has been installed depending on the repos")
        fn.show_in_app_notification(
            self, "Software has been installed depending on the repos"
        )
        if fn.check_package_installed("expac") is False:
            self.expac.set_active(False)
        if fn.check_package_installed("ripgrep") is False:
            self.ripgrep.set_active(False)
        if fn.check_package_installed("yay-bin") is False:
            self.yay.set_active(False)
        if fn.check_package_installed("paru-bin") is False:
            self.paru.set_active(False)
        if fn.check_package_installed("bat") is False:
            self.bat.set_active(False)
        if fn.check_package_installed("downgrade") is False:
            self.downgrade.set_active(False)
        if fn.check_package_installed("hw-probe") is False:
            self.hw_probe.set_active(False)
        if fn.check_package_installed("rate-mirrors-bin") is False:
            self.rate_mirrors.set_active(False)
        if fn.check_package_installed("most") is False:
            self.most.set_active(False)

    def on_select_all_toggle(self, widget, active):
        if self.select_all.get_active():
            self.expac.set_active(True)
            self.ripgrep.set_active(True)
            self.yay.set_active(True)
            self.paru.set_active(True)
            self.bat.set_active(True)
            self.downgrade.set_active(True)
            self.hw_probe.set_active(True)
            self.rate_mirrors.set_active(True)
            self.most.set_active(True)

    # =====================================================
    #               THEMER FUNCTIONS
    # =====================================================

    def on_polybar_toggle(self, widget, active):
        if widget.get_active():
            themer.toggle_polybar(self, themer.get_list(fn.i3wm_config), True)
        else:
            themer.toggle_polybar(self, themer.get_list(fn.i3wm_config), False)
            if fn.check_if_process_is_running("polybar"):
                try:
                    fn.subprocess.run(
                        ["killall", "-q", "polybar"], check=True, shell=False
                    )
                except Exception as error:
                    print(error)

    def awesome_apply_clicked(self, widget):
        if not fn.path.isfile(fn.awesome_config + ".bak"):
            fn.shutil.copy(fn.awesome_config, fn.awesome_config + ".bak")

        tree_iter = self.awesome_combo.get_active_iter()
        if tree_iter is not None:
            model = self.awesome_combo.get_model()
            row_id, name = model[tree_iter][:2]
        nid = str(row_id + 1)
        themer.set_awesome_theme(themer.get_list(fn.awesome_config), nid)
        print("Theme applied successfully")
        fn.show_in_app_notification(self, "Theme set successfully")

    def awesome_reset_clicked(self, widget):
        if fn.path.isfile(fn.awesome_config + ".bak"):
            fn.shutil.copy(fn.awesome_config + ".bak", fn.awesome_config)
            fn.show_in_app_notification(self, "Config reset successfully")

            awesome_list = themer.get_list(fn.awesome_config)
            awesome_lines = themer.get_awesome_themes(awesome_list)

            self.store.clear()
            # TODO: enumerate
            for x in range(len(awesome_lines)):
                self.store.append([x, awesome_lines[x]])
            val = int(
                themer.get_value(awesome_list, "local chosen_theme =")
                .replace("themes[", "")
                .replace("]", "")
            )
            self.awesome_combo.set_active(val - 1)

    def i3wm_apply_clicked(self, widget):
        if fn.path.isfile(fn.i3wm_config):
            fn.shutil.copy(fn.i3wm_config, fn.i3wm_config + ".bak")

        themer.set_i3_themes(
            themer.get_list(fn.i3wm_config), self.i3_combo.get_active_text()
        )
        if not themer.check_polybar(themer.get_list(fn.i3wm_config)):
            themer.set_i3_themes_bar(
                themer.get_list(fn.i3wm_config), self.i3_combo.get_active_text()
            )
        print("Theme applied successfully")
        fn.show_in_app_notification(self, "Theme applied successfully")

    def i3wm_reset_clicked(self, widget):
        if fn.path.isfile(fn.i3wm_config + ".bak"):
            fn.shutil.copy(fn.i3wm_config + ".bak", fn.i3wm_config)
            fn.show_in_app_notification(self, "Config reset successfully")

            i3_list = themer.get_list(fn.i3wm_config)

            themer.get_i3_themes(self.i3_combo, i3_list)

    def qtile_apply_clicked(self, widget):
        if fn.path.isfile(fn.qtile_config):
            fn.shutil.copy(fn.qtile_config, fn.qtile_config + ".bak")

        themer.set_qtile_themes(
            themer.get_list(fn.qtile_config), self.qtile_combo.get_active_text()
        )
        print("Theme applied successfully")
        fn.show_in_app_notification(self, "Theme applied successfully")

    def qtile_reset_clicked(self, widget):
        if fn.path.isfile(fn.qtile_config + ".bak"):
            fn.shutil.copy(fn.qtile_config + ".bak", fn.qtile_config)
            fn.show_in_app_notification(self, "Config reset successfully")

            qtile_list = themer.get_list(fn.qtile_config)

            themer.get_qtile_themes(self.qtile_combo, qtile_list)

    def leftwm_apply_clicked(self, widget):
        themer.set_leftwm_themes(self.leftwm_combo.get_active_text())
        print("Theme " + self.leftwm_combo.get_active_text() + " applied successfully")
        fn.show_in_app_notification(
            self,
            "Theme " + self.leftwm_combo.get_active_text() + " applied successfully",
        )
        self.status_leftwm.set_markup("<b>Theme is installed and applied</b>")

    def leftwm_reset_clicked(self, widget):
        themer.reset_leftwm_themes(self.leftwm_combo.get_active_text())
        print("Reverting back to candy as fall-back")
        print("Theme " + self.leftwm_combo.get_active_text() + " reset successfully")
        fn.show_in_app_notification(
            self, "Theme " + self.leftwm_combo.get_active_text() + " reset successfully"
        )
        self.status_leftwm.set_markup("<b>Theme is installed and applied</b>")

    def leftwm_remove_clicked(self, widget):
        themer.remove_leftwm_themes(self.leftwm_combo.get_active_text())
        print("Reverting back to candy as fall-back")
        print("Theme " + self.leftwm_combo.get_active_text() + " removed successfully")
        fn.show_in_app_notification(
            self,
            "Theme " + self.leftwm_combo.get_active_text() + " removed successfully",
        )

    def on_leftwm_combo_changed(self, widget):
        link_theme = fn.path.basename(readlink(fn.leftwm_config_theme_current))
        # print(link_theme)
        theme = self.leftwm_combo.get_active_text()
        if fn.path_check(fn.leftwm_config_theme + theme):
            self.status_leftwm.set_markup("<b>Theme is installed</b>")
        else:
            self.status_leftwm.set_markup("<b>Theme is NOT installed</b>")

        if fn.path_check(fn.leftwm_config_theme + theme) and link_theme == theme:
            self.status_leftwm.set_markup("<b>Theme is installed and applied</b>")

    # ====================================================================
    #                       TERMINALS
    # ====================================================================

    def on_clicked_install_alacritty(self, widget):
        fn.install_package(self, "alacritty")

    def on_clicked_install_alacritty_themes(self, widget):
        if fn.check_arco_repos_active() is True:
            fn.install_package(self, "alacritty")
            fn.install_package(self, "ttf-hack")
            fn.install_arco_package(self, "alacritty-themes")
            fn.install_arco_package(self, "base16-alacritty-git")
            print("Alacritty themes installed")
            fn.show_in_app_notification(self, "Alacritty themes installed")

            # if there is no file copy/paste from /etc/skel else alacritty-themes crash
            if not fn.path.isfile(fn.alacritty_config):
                if not fn.path.isdir(fn.alacritty_config_dir):
                    try:
                        fn.mkdir(fn.alacritty_config_dir)
                        fn.permissions(fn.alacritty_config_dir)
                    except Exception as error:
                        print(error)

                fn.shutil.copy(fn.alacritty_arco, fn.alacritty_config)
                fn.permissions(fn.home + "/.config/alacritty")
                print("Alacritty config saved")
        else:
            print("First activate the ArcoLinux repos")
            fn.show_in_app_notification(self, "First activate the ArcoLinux repos")

    def on_clicked_remove_alacritty_themes(self, widget):
        fn.remove_package(self, "alacritty")
        fn.remove_package(self, "ttf-hack")
        fn.remove_package(self, "alacritty-themes")
        fn.remove_package(self, "base16-alacritty-git")
        print("Alacritty themes removed")
        fn.show_in_app_notification(self, "Alacritty themes removed")

    def on_clicked_install_xfce4_terminal(self, widget):
        fn.install_package(self, "xfce4-terminal")

    def on_clicked_remove_xfce4_terminal(self, widget):
        fn.remove_package(self, "xfce4-terminal")

    def on_clicked_install_xfce4_themes(self, widget):
        if fn.check_arco_repos_active() is True:
            fn.install_arco_package(self, "xfce4-terminal-base16-colors-git")
            fn.install_arco_package(self, "tempus-themes-xfce4-terminal-git")
            fn.install_arco_package(self, "prot16-xfce4-terminal")
            print("Xfce4 themes installed")
            fn.show_in_app_notification(self, "Xfce4 themes installed")
        else:
            print("First activate the ArcoLinux repos")
            fn.show_in_app_notification(self, "First activate the ArcoLinux repos")

    def on_clicked_remove_xfce4_themes(self, widget):
        fn.remove_package(self, "xfce4-terminal-base16-colors-git")
        fn.remove_package(self, "tempus-themes-xfce4-terminal-git")
        fn.remove_package(self, "prot16-xfce4-terminal")
        print("Xfce4 themes removed")
        fn.show_in_app_notification(self, "Xfce4 themes removed")

    def on_clicked_reset_xfce4_terminal(self, widget):
        if fn.path.isfile(fn.xfce4_terminal_config + ".bak"):
            fn.shutil.copy(fn.xfce4_terminal_config + ".bak", fn.xfce4_terminal_config)
            fn.permissions(fn.home + "/.config/xfce4/terminal")
            print("xfce4-terminal reset")
            fn.show_in_app_notification(self, "Xfce4-terminal reset")

    def on_clicked_reset_alacritty(self, widget):
        if fn.path.isfile(fn.alacritty_config + ".bak"):
            fn.shutil.copy(fn.alacritty_config + ".bak", fn.alacritty_config)
            fn.permissions(fn.home + "/.config/alacritty")
            print("Alacritty reset")
            fn.show_in_app_notification(self, "Alacritty reset")

    def on_clicked_set_arcolinux_alacritty_theme_config(self, widget):
        if fn.path.isfile(fn.alacritty_config):
            fn.shutil.copy(fn.alacritty_arco, fn.alacritty_config)
            fn.permissions(fn.home + "/.config/alacritty")
            print("Applied the ATT Alacritty theme/config")
            fn.show_in_app_notification(self, "Applied the ATT Alacritty theme/config")

    # ====================================================================
    #                      TERMITE
    # ====================================================================

    def on_clicked_install_termite(self, widget):
        fn.install_arco_package(self, "termite")
        terminals.get_themes(self.term_themes)

    def on_clicked_remove_termite(self, widget):
        fn.remove_package(self, "termite")
        terminals.get_themes(self.term_themes)

    def on_clicked_install_termite_themes(self, widget):
        if fn.check_arco_repos_active() is True:
            fn.install_arco_package(self, "termite")
            fn.install_arco_package(self, "arcolinux-termite-themes-git")
            fn.copy_func("/etc/skel/.config/termite", fn.home + "/.config/", True)
            fn.permissions(fn.home + "/.config/termite")
            terminals.get_themes(self.term_themes)
            print("Termite  themes installed")
            fn.show_in_app_notification(self, "Termite themes installed")
        else:
            print("First activate the ArcoLinux repos")
            fn.show_in_app_notification(self, "First activate the ArcoLinux repos")

    def on_clicked_remove_termite_themes(self, widget):
        fn.remove_package(self, "arcolinux-termite-themes-git")
        terminals.get_themes(self.term_themes)
        print("Termite  themes removed")
        GLib.idle_add(fn.show_in_app_notification, self, "Termite themes removed")

    def on_term_apply(self, widget):
        if self.term_themes.get_active_text() is not None:
            widget.set_sensitive(False)
            terminals.set_config(self, self.term_themes.get_active_text())
            widget.set_sensitive(True)

    def on_term_reset(self, widget):
        if fn.path.isfile(fn.termite_config + ".bak"):
            fn.shutil.copy(fn.termite_config + ".bak", fn.termite_config)
            fn.show_in_app_notification(self, "Default Settings Applied")
            if fn.path.isfile(fn.config):
                settings.write_settings("TERMITE", "theme", "")
                terminals.get_themes(self.term_themes)

    # ====================================================================
    #                       USER
    # ====================================================================

    def on_click_user_apply(self, widget):
        user.create_user(self)
        user.pop_cbt_users(self, self.cbt_users)

    def on_click_delete_user(self, widget):
        user.on_click_delete_user(self)
        user.pop_cbt_users(self, self.cbt_users)

    def on_click_delete_all_user(self, widget):
        user.on_click_delete_all_user(self)
        user.pop_cbt_users(self, self.cbt_users)

    # ====================================================================
    #                      WALL - WALLPAPER
    # ====================================================================

    def on_login_wallpaper_clicked(self, widget, data):
        for x in data:
            self.login_wallpaper_path = x.get_name()

    def on_reset_login_wallpaper(self, widget):
        fn.reset_login_wallpaper(self, self.login_wallpaper_path)

    def pop_login_wallpapers(self, combo, lists, start):
        combo.get_model().clear()

        for x in self.flowbox_wall.get_children():
            self.flowbox_wall.remove(x)

        for x in lists:
            pb = GdkPixbuf.Pixbuf().new_from_file_at_size(
                fn.login_backgrounds + x, 128, 128
            )
            pimage = Gtk.Image()
            pimage.set_name(fn.login_backgrounds + x)
            pimage.set_from_pixbuf(pb)
            self.flowbox_wall.add(pimage)
            pimage.show_all()

    def on_login_wallpaper_change(self, widget):
        try:
            pixbuf3 = GdkPixbuf.Pixbuf().new_from_file_at_size(
                fn.login_backgrounds + widget.get_active_text(),
                645,
                645,
            )
            print(widget.get_active_text())
            self.image_grub.set_from_pixbuf(pixbuf3)
        except Exception as error:
            print(error)

    def on_import_login_wallpaper(self, widget):
        text = self.login_image.get_text()
        if len(text) > 1:
            fn.shutil.copy(text, fn.login_backgrounds + fn.path.basename(text))
            try:
                command = "chmod 644 " + fn.login_backgrounds + fn.path.basename(text)
                subprocess.call(
                    command.split(" "),
                    shell=False,
                    stdout=subprocess.PIPE,
                    stderr=subprocess.STDOUT,
                )
            except Exception as error:
                print(error)

            self.pop_login_wallpapers(
                self.login_managers_combo, fn.get_login_wallpapers(), False
            )
            print("Image imported")
            fn.show_in_app_notification(self, "Wallpaper imported successfully")
        else:
            print("First import an image")
            fn.show_in_app_notification(self, "First import an image")

    def on_set_login_wallpaper(self, widget):
        if self.login_wallpaper_path == "":
            print("First choose a wallpaper image")
            fn.show_in_app_notification(self, "First choose a wallpaper image")
        else:
            fn.set_login_wallpaper(self, self.login_wallpaper_path)

    def on_install_att_backgrounds(self, widget):
        fn.install_arco_package(self, "archlinux-login-backgrounds-git")
        self.pop_login_wallpapers(
            self.login_managers_combo, fn.get_login_wallpapers(), False
        )
        sddm.pop_login_managers_combo(self, self.login_managers_combo)

    def on_remove_att_backgrounds(self, widget):
        fn.remove_package(self, "archlinux-login-backgrounds-git")
        self.pop_login_wallpapers(
            self.login_managers_combo, fn.get_login_wallpapers(), False
        )
        sddm.pop_login_managers_combo(self, self.login_managers_combo)

    def on_install_att_plain_backgrounds(self, widget):
        fn.install_arco_package(self, "archlinux-login-backgrounds-plain-git")
        self.pop_login_wallpapers(
            self.login_managers_combo, fn.get_login_wallpapers(), False
        )
        sddm.pop_login_managers_combo(self, self.login_managers_combo)

    def on_remove_att_plain_backgrounds(self, widget):
        fn.remove_package(self, "archlinux-login-backgrounds-plain-git")
        self.pop_login_wallpapers(
            self.login_managers_combo, fn.get_login_wallpapers(), False
        )
        sddm.pop_login_managers_combo(self, self.login_managers_combo)

    def on_import_remove_login_wallpaper(self, widget):
        if self.login_wallpaper_path == "":
            print("First choose a wallpaper to remove")
            fn.show_in_app_notification(self, "First choose a wallpaper image")
        else:
            excludes = [
                "att-01.jpg",
                "att-02.jpg",
                "att-03.jpg",
                "att-04.jpg",
                "att-05.jpg",
                "att-06.jpg",
                "att-07.jpg",
                "att-08.jpg",
                "att-08.jpg",
                "att-09.jpg",
                "att-plain-01.png",
                "att-plain-02.png",
                "att-plain-03.png",
                "att-plain-04.png",
                "att-plain-05.png",
                "att-plain-06.png",
                "background01.jpg",
                "background02.jpg",
                "background03.jpg",
                "background04.jpg",
                "background05.jpg",
                "background06.jpg",
                "background07.jpg",
                "background08.jpg",
                "background09.jpg",
                "background10.jpg",
                "background11.jpg",
                "background12.jpg",
                "background13.jpg",
                "background14.jpg",
                "background15.jpg",
                "background16.jpg",
                "background17.jpg",
                "background18.jpg",
                "background19.jpg",
                "background20.jpg",
                "background21.jpg",
                "background22.jpg",
                "background23.jpg",
                "background24.jpg",
                "background25.jpg",
                "background26.jpg",
                "background27.jpg",
                "background28.jpg",
                "background29.jpg",
                "background30.jpg",
                "background31.jpg",
                "background32.jpg",
                "background33.jpg",
                "background34.jpg",
                "background35.jpg",
                "background36.jpg",
                "background37.jpg",
                "background38.jpg",
                "background39.jpg",
                "background40.jpg",
                "background41.jpg",
                "background42.jpg",
                "background43.jpg",
                "background44.jpg",
                "background45.jpg",
                "background46.jpg",
                "background47.jpg",
                "background48.jpg",
                "background49.jpg",
                "background50.jpg",
                "background51.jpg",
                "background52.jpg",
                "background53.jpg",
                "background54.jpg",
                "background55.jpg",
                "background56.jpg",
                "background57.jpg",
                "background58.jpg",
                "background59.jpg",
                "background60.jpg",
                "background61.jpg",
                "background62.jpg",
                "background63.jpg",
            ]

            if not fn.path.basename(self.login_wallpaper_path) in excludes:
                # fn.unlink('/boot/grub/themes/Vimix/' +
                #           self.grub_theme_combo.get_active_text())
                fn.unlink(self.login_wallpaper_path)
                self.pop_login_wallpapers(
                    self.login_managers_combo, fn.get_login_wallpapers(), False
                )
                print("Wallpaper has been removed")
                print(self.login_wallpaper_path)
                fn.show_in_app_notification(self, "Wallpaper removed successfully")
                fn.reset_login_wallpaper(self, widget)
                self.login_wallpaper_path = ""
            else:
                print("You can not remove that wallpaper")
                fn.show_in_app_notification(self, "You can not remove that wallpaper")

    def on_choose_login_wallpaper(self, widget):
        dialog = Gtk.FileChooserDialog(
            title="Please choose a file",
            action=Gtk.FileChooserAction.OPEN,
        )
        filter = Gtk.FileFilter()
        filter.set_name("IMAGE Files")
        filter.add_mime_type("image/png")
        filter.add_mime_type("image/jpg")
        filter.add_mime_type("image/jpeg")
        dialog.set_filter(filter)
        dialog.set_current_folder(fn.home)
        dialog.add_buttons(
            Gtk.STOCK_CANCEL, Gtk.ResponseType.CANCEL, "Open", Gtk.ResponseType.OK
        )
        dialog.connect("response", self.open_response_lw)

        dialog.show()

    def open_response_lw(self, dialog, response):
        if response == Gtk.ResponseType.OK:
            self.login_image.set_text(dialog.get_filename())
            dialog.destroy()
        elif response == Gtk.ResponseType.CANCEL:
            dialog.destroy()

    # ====================================================================
    #                      ZSH THEMES
    # ====================================================================

    def on_clicked_install_only_zsh(self, widget):
        fn.install_package(self, "zsh")
        fn.restart_program()

    def on_install_zsh_completions_clicked(self, widget):
        fn.install_package(self, "zsh-completions")

    def on_remove_zsh_completions_clicked(self, widget):
        fn.remove_package(self, "zsh-completions")

    def on_install_zsh_syntax_highlighting_clicked(self, widget):
        fn.install_package(self, "zsh-syntax-highlighting")

    def on_remove_zsh_syntax_highlighting_clicked(self, widget):
        fn.remove_package(self, "zsh-syntax-highlighting")

    def on_arcolinux_zshrc_clicked(self, widget):
        try:
            if fn.path.isfile(fn.zshrc_arco):
                fn.shutil.copy(fn.zshrc_arco, fn.zsh_config)
                fn.permissions(fn.home + "/.zshrc")
            fn.source_shell(self)
        except Exception as error:
            print(error)

        print("ATT ~/.zshrc is applied")
        GLib.idle_add(fn.show_in_app_notification, self, "ATT ~/.zshrc is applied")

    def on_zshrc_reset_clicked(self, widget):
        try:
            if fn.path.isfile(fn.zsh_config + ".bak"):
                fn.shutil.copy(fn.zsh_config + ".bak", fn.zsh_config)
                fn.permissions(fn.home + "/.zshrc")
        except Exception as error:
            print(error)

        print("Your personal ~/.zshrc is applied again - logout")
        GLib.idle_add(
            fn.show_in_app_notification,
            self,
            "Your personal ~/.zshrc is applied again - logout",
        )

    def on_zsh_apply_theme(self, widget):
        # create a .zshrc if it doesn't exist'
        if not fn.path.isfile(fn.zsh_config):
            fn.shutil.copy(fn.zshrc_arco, fn.zsh_config)
            fn.permissions(fn.home + "/.zshrc")

        if self.zsh_themes.get_active_text() is not None:
            # widget.set_sensitive(False)
            zsh_theme.set_config(self, self.zsh_themes.get_active_text())
            widget.set_sensitive(True)
            print("Applying zsh theme")

    def on_zsh_reset(self, widget):
        if fn.path.isfile(fn.zsh_config + ".bak"):
            fn.shutil.copy(fn.zsh_config + ".bak", fn.zsh_config)
            fn.permissions(fn.home + "/.zshrc")
            fn.permissions(fn.home + "/.zshrc.bak")
            fn.show_in_app_notification(self, "Default settings applied")
            print("Backup has been applied")
        else:
            fn.shutil.copy(
                "/usr/share/athena-tweak-tool/data/arco/.zshrc", fn.home + "/.zshrc"
            )
            fn.permissions(fn.home + "/.zshrc")
            fn.show_in_app_notification(self, "Valid ~/.zshrc applied")
            print("Valid ~/.zshrc applied")

    def tozsh_apply(self, widget):
        fn.change_shell(self, "zsh")

    def install_oh_my_zsh(self, widget):
        fn.install_arco_package(self, "oh-my-zsh-git")
        self.termset.set_sensitive(True)
        self.zsh_themes.set_sensitive(True)
        zsh_theme.get_themes(self.zsh_themes)

    # The intent behind this function is to be a centralised image changer for all portions of ATT that need it
    # Currently utilising an if tree - this is not best practice: it should be a match: case tree.
    # But I have not yet got that working.
    def update_image(
        self, widget, image, theme_type, att_base, image_width, image_height
    ):
        sample_path = ""
        preview_path = ""
        random_option = False
        # THIS CODE IS KEPT ON PURPOSE. DO NOT DELETE.
        # Once Python 3.10 is released and used widely, delete the if statements below the match blocks
        # and use the match instead. It is faster, and easier to maintain.
        #    match "zsh":
        #        case 'zsh':
        #            sample_path = att_base+"/images/zsh-sample.jpg"
        #            preview_path = att_base+"/images/zsh_previews/"+widget.get_active_text() + ".jpg"
        #        case 'qtile':
        #            sample_path = att_base+"/images/zsh-sample.jpg"
        #            previe_path = att_base+"/images/zsh_previews/"+widget.get_active_text() + ".jpg"
        #        case 'i3':
        #            sample_path = att_base+"/images/i3-sample.jpg"
        #            preview_path = att_base+"/themer_data/i3/"+widget.get_active_text() + ".jpg"
        #        case 'awesome':
        #            sample_path = att_base+"/images/i3-sample.jpg"
        #            preview_path = att_base+"/themer_data/awesomewm/"+widget.get_active_text() + ".jpg"
        #        case 'neofetch':
        #            sample_path = att_base + widget.get_active_text()
        #            preview_path = att_base + widget.get_active_text()
        #        case unknown_command:
        #            print("Function update_image passed an incorrect value for theme_type. Value passed was: " + theme_type)
        #            print("Remember that the order for using this function is: self, widget, image, theme_type, att_base_path, image_width, image_height.")
        if theme_type == "zsh":
            sample_path = att_base + "/images/zsh-sample.jpg"
            preview_path = (
                att_base + "/images/zsh_previews/" + widget.get_active_text() + ".jpg"
            )
            if widget.get_active_text() == "random":
                random_option = True
        elif theme_type == "qtile":
            sample_path = att_base + "/images/qtile-sample.jpg"
            preview_path = (
                att_base + "/themer_data/qtile/" + widget.get_active_text() + ".jpg"
            )
        elif theme_type == "leftwm":
            sample_path = att_base + "/images/leftwm-sample.jpg"
            preview_path = (
                att_base + "/themer_data/leftwm/" + widget.get_active_text() + ".jpg"
            )
        elif theme_type == "i3":
            sample_path = att_base + "/images/i3-sample.jpg"
            preview_path = (
                att_base + "/themer_data/i3/" + widget.get_active_text() + ".jpg"
            )
        elif theme_type == "awesome":
            # Awesome section doesn't use a ComboBoxText, but a ComboBox - which has different properties.
            tree_iter = self.awesome_combo.get_active_iter()
            if tree_iter is not None:
                model = self.awesome_combo.get_model()
                row_id, name = model[tree_iter][:2]

            sample_path = att_base + "/images/awesome-sample.jpg"
            preview_path = att_base + "/themer_data/awesomewm/" + name + ".jpg"
        elif theme_type == "neofetch":
            sample_path = att_base + widget.get_active_text()
            preview_path = att_base + widget.get_active_text()
        else:
            # If we are doing our job correctly, this should never be shown to users. If it does, we have done something wrong as devs.
            print(
                "Function update_image passed an incorrect value for theme_type. Value passed was: "
                + theme_type
            )
            print(
                "Remember that the order for using this function is: self, widget, image, theme_type, att_base_path, image_width, image_height."
            )
        # source_pixbuf = image.get_pixbuf()
        if fn.path.isfile(preview_path) and not random_option:
            pixbuf = GdkPixbuf.Pixbuf().new_from_file_at_size(
                preview_path, image_width, image_height
            )
        else:
            pixbuf = GdkPixbuf.Pixbuf().new_from_file_at_size(
                sample_path, image_width, image_height
            )
        image.set_from_pixbuf(pixbuf)

    def remove_oh_my_zsh(self, widget):
        fn.remove_package(self, "oh-my-zsh-git")
        zsh_theme.get_themes(self.zsh_themes)
        self.termset.set_sensitive(False)
        self.zsh_themes.set_sensitive(False)

    # ====================================================================
    #                            PACKAGES
    # ====================================================================#

    def on_click_export_packages(
        self,
        widget,
        packages_obj,
        rb_export_all,
        rb_export_explicit,
        gui_parts,
    ):
        try:
            if not os.path.exists(packages_obj.export_dir):
                fn.makedirs(packages_obj.export_dir)
                fn.permissions(packages_obj.export_dir)
            if fn.check_pacman_lockfile() is True:
                fn.logger.warning(
                    "Export aborted, failed to lock database, pacman lockfile exists at %s"
                )

                fn.messagebox(
                    self,
                    "Export of packages failed",
                    "Failed to lock database, pacman lockfile exists at %s\nIs another pacman process running ?"
                    % fn.pacman_lockfile,
                )

            else:
                vbox_stack = gui_parts[0]
                grid_package_status = gui_parts[1]
                grid_package_count = gui_parts[2]
                vbox_pacmanlog = gui_parts[3]
                textbuffer = gui_parts[4]
                textview = gui_parts[5]
                label_package_status = gui_parts[6]
                label_package_count = gui_parts[7]

                if vbox_pacmanlog.is_visible() is False:
                    vbox_stack.pack_start(grid_package_status, False, False, 0)
                    vbox_stack.pack_start(grid_package_count, False, False, 0)
                    vbox_stack.pack_start(vbox_pacmanlog, False, False, 0)
                    vbox_stack.show_all()

                    grid_package_status.hide()
                    grid_package_count.hide()
                else:
                    grid_package_status.hide()
                    grid_package_count.hide()

                rb_export_selected = None
                if rb_export_all.get_active():
                    rb_export_selected = "export_all"
                if rb_export_explicit.get_active():
                    rb_export_selected = "export_explicit"
                export_ok = packages_obj.export_packages(rb_export_selected, gui_parts)
                if export_ok is False:
                    fn.messagebox(
                        self,
                        "Export failed",
                        "Failed to export list of packages",
                    )
                else:
                    fn.messagebox(
                        self,
                        "Export completed",
                        "Exported to file %s" % packages_obj.default_export_path,
                    )

        except Exception as e:
            fn.logger.error("Exception in on_click_export_packages(): %s" % e)

    def on_message_dialog_yes_response(self, widget):
        fn.logger.info("Ok to proceed to install")
        widget.destroy()

    def on_message_dialog_no_response(self, widget):
        fn.logger.info("Packages install skipped by user")
        widget.destroy()

    def on_click_install_packages(self, widget, packages_obj, gui_parts):
        try:
            if fn.check_pacman_lockfile() is True:
                fn.logger.warning(
                    "Install aborted, failed to lock database, pacman lockfile exists at %s"
                    % fn.pacman_lockfile
                )

                fn.messagebox(
                    self,
                    "Install aborted",
                    "Failed to lock database, pacman lockfile exists at %s\nIs another pacman process running ?"
                    % fn.pacman_lockfile,
                )
            else:
                packages = packages_obj.get_packages_file_content()

                if packages is not None:
                    packages_prompt_dialog = PackagesPromptGui(packages)

                    packages_prompt_dialog.show_all()
                    response = packages_prompt_dialog.run()
                    packages_prompt_dialog.destroy()

                    if response == Gtk.ResponseType.OK:
                        widget.set_sensitive(False)
                        fn.logger.info("Preparing installation")
                        vbox_stack = gui_parts[0]
                        grid_package_status = gui_parts[1]
                        grid_package_count = gui_parts[2]
                        vbox_pacmanlog = gui_parts[3]
                        # textbuffer = gui_parts[4]
                        # textview = gui_parts[5]
                        label_package_status = gui_parts[6]
                        label_package_count = gui_parts[7]

                        if vbox_pacmanlog.is_visible() is False:
                            vbox_stack.pack_start(grid_package_status, False, False, 0)
                            vbox_stack.pack_start(grid_package_count, False, False, 0)
                            vbox_stack.pack_start(vbox_pacmanlog, False, False, 0)
                            vbox_stack.show_all()
                        else:
                            grid_package_status.show()
                            grid_package_count.show()

                        packages_obj.install_packages(packages, widget, gui_parts)
                else:
                    fn.logger.error(
                        "Package list file %s not found"
                        % packages_obj.default_export_path
                    )
                    fn.messagebox(
                        self,
                        "Error package list file not found",
                        "Cannot find %s" % packages_obj.default_export_path,
                    )

        except Exception as e:
            fn.logger.error("Exception in on_click_install_packages(): %s" % e)
            widget.set_sensitive(True)

    # ====================================================================
    #                            BOTTOM BUTTONS
    # ====================================================================

    def on_refresh_att_clicked(self, desktop):
        fn.restart_program()

    def on_close(self, widget, data):
        fn.unlink("/tmp/att.lock")
        Gtk.main_quit()

    def on_reload_att_clicked(self, widget):
        # login
        if fn.check_package_installed("sddm"):
            sddm.pop_box(self, self.sessions_sddm)
        if fn.check_package_installed("lightdm"):
            lightdm.pop_box_sessions_lightdm(self, self.sessions_lightdm)
        # terminal
        if fn.check_package_installed("termite"):
            terminals.get_themes(self.term_themes)
        # themes
        if fn.check_package_installed("arcolinux-leftwm-git"):
            terminals.get_themes(self.term_themes)
        # populate all cursors dropdowns
        if fn.check_package_installed("sddm"):
            sddm.pop_gtk_cursor_names(self, self.sddm_cursor_themes)
        if fn.check_package_installed("lightdm"):
            lightdm.pop_gtk_cursor_names(self, self.cursor_themes_lightdm)
        fixes.pop_gtk_cursor_names(self.cursor_themes)
        # populate cursor themes - some themes include a cursor
        if fn.check_package_installed("sddm"):
            sddm.pop_gtk_cursor_names(self, self.sddm_cursor_themes)
        if fn.check_package_installed("lightdm"):
            lightdm.pop_gtk_cursor_names(self, self.cursor_themes_lightdm)
        fixes.pop_gtk_cursor_names(self.cursor_themes)
        # populate lightdm page
        if fn.check_package_installed("lightdm"):
            lightdm.pop_gtk_theme_names_lightdm(self, self.gtk_theme_names_lightdm)
        # populate lxdm page
        if fn.check_package_installed("lxdm"):
            lxdm.pop_gtk_theme_names_lxdm(self.lxdm_gtk_theme)
        print("Reloaded")

    # ================================================================================
    # ================================================================================
    # ================================================================================
    # ================================================================================
    # ================================================================================
    # ================================================================================
    #                END OF MAIN FUNCTIONS
    # ================================================================================
    # ================================================================================
    # ================================================================================
    # ================================================================================
    # ================================================================================
    # ================================================================================


# ====================================================================
#                       MAIN
# ====================================================================


def signal_handler(sig, frame):
    print("\nATT is Closing.")
    fn.unlink("/tmp/att.lock")
    Gtk.main_quit(0)


if __name__ == "__main__":
    signal.signal(signal.SIGINT, signal_handler)
    # These lines offer protection and grace when a kernel has obfuscated or removed basic OS functionality.
    os_function_support = True
    try:
        fn.getlogin()
    except:
        os_function_support = False
    if not fn.path.isfile("/tmp/att.lock") and os_function_support:
        with open("/tmp/att.pid", "w", encoding="utf-8") as f:
            f.write(str(fn.getpid()))
            f.close()
        style_provider = Gtk.CssProvider()
        style_provider.load_from_path(base_dir + "/att.css")

        Gtk.StyleContext.add_provider_for_screen(
            Gdk.Screen.get_default(),
            style_provider,
            Gtk.STYLE_PROVIDER_PRIORITY_APPLICATION,
        )
        w = Main()
        w.show_all()
        Gtk.main()
    else:
        md = ""

        if os_function_support:
            md = Gtk.MessageDialog(
                parent=Main(),
                flags=0,
                message_type=Gtk.MessageType.INFO,
                buttons=Gtk.ButtonsType.YES_NO,
                text="Lock File Found",
            )
            md.format_secondary_markup(
                "The lock file has been found. This indicates there is already an instance of <b>Athena Tweak Tool</b> running.\n\
Click yes to remove the lock file\n\
and try running ATT again"
            )
        else:
            md = Gtk.MessageDialog(
                parent=Main(),
                flags=0,
                message_type=Gtk.MessageType.INFO,
                buttons=Gtk.ButtonsType.CLOSE,
                text="Kernel Not Supported",
            )
            md.format_secondary_markup(
                "Your current kernel does not support basic os function calls. <b>Athena Tweak Tool</b> \
requires these to work."
            )

        result = md.run()
        md.destroy()

        if result in (Gtk.ResponseType.OK, Gtk.ResponseType.YES):
            pid = ""
            with open("/tmp/att.pid", "r", encoding="utf-8") as f:
                line = f.read()
                pid = line.rstrip().lstrip()
                f.close()

            try:
                if fn.check_if_process_is_running(int(pid)):
                    md = Gtk.MessageDialog(
                        parent=Main(),
                        flags=0,
                        message_type=Gtk.MessageType.INFO,
                        buttons=Gtk.ButtonsType.CLOSE,
                        text="You first need to close the existing application",
                    )
                    md.format_secondary_markup(
                        "You first need to close the existing application"
                    )
                    result = md.run()
                    md.destroy()
                else:
                    fn.unlink("/tmp/att.lock")
            except:
                print(
                    "Make sure there is just one instance of Athena Tweak Tool running"
                )
                print("Then you can restart the application")
