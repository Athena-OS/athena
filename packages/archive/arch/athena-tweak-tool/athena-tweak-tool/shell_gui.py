# ============================================================
# Authors: Brad Heffernan - Erik Dubois - Cameron Percival
# ============================================================


def gui(self, Gtk, vboxstack23, zsh_theme, base_dir, GdkPixbuf, fn):
    """create a gui"""

    hbox1 = Gtk.Box(orientation=Gtk.Orientation.HORIZONTAL, spacing=10)
    hbox1_lbl = Gtk.Label(xalign=0)
    hbox1_lbl.set_markup("Shells")
    hbox1_lbl.set_name("title")
    hbox1.pack_start(hbox1_lbl, False, False, 10)

    hbox0 = Gtk.Box(orientation=Gtk.Orientation.HORIZONTAL, spacing=10)
    hseparator = Gtk.Separator(orientation=Gtk.Orientation.HORIZONTAL)
    hbox0.pack_start(hseparator, True, True, 0)

    vbox = Gtk.Box(orientation=Gtk.Orientation.VERTICAL, spacing=10)

    vboxstack1 = Gtk.Box(orientation=Gtk.Orientation.VERTICAL, spacing=10)
    vboxstack2 = Gtk.Box(orientation=Gtk.Orientation.VERTICAL, spacing=10)
    vboxstack3 = Gtk.Box(orientation=Gtk.Orientation.VERTICAL, spacing=10)
    vboxstack4 = Gtk.Box(orientation=Gtk.Orientation.VERTICAL, spacing=10)

    stack = Gtk.Stack()
    stack.set_transition_type(Gtk.StackTransitionType.SLIDE_UP_DOWN)
    stack.set_transition_duration(350)
    stack.set_hhomogeneous(False)
    stack.set_vhomogeneous(False)

    stack_switcher = Gtk.StackSwitcher()
    stack_switcher.set_orientation(Gtk.Orientation.HORIZONTAL)
    stack_switcher.set_stack(stack)
    stack_switcher.set_homogeneous(True)

    if fn.check_package_installed("bash"):
        # ======================================================================
        #                              BASH
        # ======================================================================

        hbox5 = Gtk.Box(orientation=Gtk.Orientation.HORIZONTAL, spacing=10)
        hbox5_lbl = Gtk.Label(xalign=0)
        if fn.get_shell() == "bash":
            hbox5_lbl.set_markup("Bash (active)")
        else:
            hbox5_lbl.set_markup("Bash (not active)")
        hbox5_lbl.set_name("title")
        hbox5.pack_start(hbox5_lbl, False, False, 0)

        hbox6 = Gtk.Box(orientation=Gtk.Orientation.HORIZONTAL, spacing=10)
        hseparator = Gtk.Separator(orientation=Gtk.Orientation.HORIZONTAL)
        hbox6.pack_start(hseparator, True, True, 0)

        hbox7 = Gtk.Box(orientation=Gtk.Orientation.HORIZONTAL, spacing=0)
        hbox7_lbl = Gtk.Label()
        if fn.check_package_installed("bash"):
            hbox7_lbl.set_markup("Bash is already <b>installed</b>")
        else:
            hbox7_lbl.set_markup("Bash is not installed")
        if fn.check_package_installed("bash-completion"):
            hbox7_lbl.set_markup(
                "Bash and bash-completion are already <b>installed</b>"
            )
        else:
            hbox7_lbl.set_markup(
                "Bash is already installed and  bash-completion is not installed"
            )
        install_bash_completion = Gtk.Button("Install bash-completion")
        install_bash_completion.connect(
            "clicked", self.on_install_bash_completion_clicked
        )
        remove_bash_completion = Gtk.Button("Remove bash-completion")
        remove_bash_completion.connect(
            "clicked", self.on_remove_bash_completion_clicked
        )
        hbox7.pack_start(hbox7_lbl, False, False, 10)
        hbox7.pack_end(remove_bash_completion, False, False, 10)
        hbox7.pack_end(install_bash_completion, False, False, 10)

        hbox8 = Gtk.Box(orientation=Gtk.Orientation.HORIZONTAL, spacing=0)
        hbox8_lbl = Gtk.Label()
        hbox8_lbl.set_markup("Overwrite your ~/.bashrc with the ATT bashrc")
        self.arcolinux_bash = Gtk.Button("Install the ATT bashrc configuration")
        self.arcolinux_bash.connect("clicked", self.on_arcolinux_bash_clicked)
        self.bash_reset = Gtk.Button("Reset back to the original ~/.bashrc")
        self.bash_reset.connect("clicked", self.on_bash_reset_clicked)
        hbox8.pack_start(hbox8_lbl, False, False, 10)
        hbox8.pack_end(self.bash_reset, False, False, 10)
        hbox8.pack_end(self.arcolinux_bash, False, False, 10)

        hbox9 = Gtk.Box(orientation=Gtk.Orientation.HORIZONTAL, spacing=10)
        hbox9_lbl = Gtk.Label()
        hbox9_lbl.set_markup("\n<b>If you just switched shell, log-out first</b>")
        # hbox9_lbl.set_margin_top(30)
        hbox9.pack_start(hbox9_lbl, False, False, 10)

        # ==========================================================
        #                     BUTTONS
        # ==========================================================

        hbox10 = Gtk.Box(orientation=Gtk.Orientation.HORIZONTAL, spacing=10)
        tobash = Gtk.Button(label="Apply bash")
        tobash.connect("clicked", self.tobash_apply)
        tofish = Gtk.Button(label="Apply fish")
        tofish.connect("clicked", self.tofish_apply)
        tozsh = Gtk.Button(label="Apply zsh")
        tozsh.connect("clicked", self.tozsh_apply)
        # bashreset = Gtk.Button(label="Reset bash")
        # bashreset.connect("clicked", self.on_bash_reset_clicked)

        hbox10.pack_start(tobash, False, False, 0)
        if not fn.distr == "archcraft":
            hbox10.pack_start(tofish, False, False, 0)
        hbox10.pack_start(tozsh, False, False, 0)
        # hbox10.pack_end(bashreset, False, False, 0)

        # ==========================================================
        #                     VBOXSTACK
        # ==========================================================

        vboxstack1.pack_start(hbox5, False, False, 0)  # Combobox
        vboxstack1.pack_start(hbox6, False, False, 0)  # Combobox
        vboxstack1.pack_start(hbox7, False, False, 0)  # fish
        vboxstack1.pack_start(hbox8, False, False, 0)  # oh-my-fish
        vboxstack1.pack_start(hbox9, False, False, 0)  # image
        vboxstack1.pack_end(hbox10, False, False, 0)  # Buttons

    else:
        # no bash installed
        hbox36 = Gtk.Box(orientation=Gtk.Orientation.HORIZONTAL, spacing=10)
        hbox36_lbl = Gtk.Label(xalign=0)
        hbox36_lbl.set_markup("Bash is not installed")
        hbox36_lbl.set_name("title")
        hbox36.pack_start(hbox36_lbl, False, False, 0)

        hbox37 = Gtk.Box(orientation=Gtk.Orientation.HORIZONTAL, spacing=10)
        hseparator = Gtk.Separator(orientation=Gtk.Orientation.HORIZONTAL)
        hbox37.pack_start(hseparator, True, True, 0)

        message = Gtk.Label()
        message.set_markup("<b>Bash does not seem to be installed</b>")

        vboxstack1.pack_start(hbox36, False, False, 0)
        vboxstack1.pack_start(hbox37, False, False, 0)
        vboxstack1.pack_start(message, False, False, 0)

    # ==================================================================
    #                       ZSH
    # ==================================================================

    if fn.check_package_installed("zsh"):
        hbox19 = Gtk.Box(orientation=Gtk.Orientation.HORIZONTAL, spacing=10)
        hbox19_lbl = Gtk.Label(xalign=0)
        hbox19_lbl.set_markup("Zsh (inactive)")
        if fn.get_shell() == "zsh":
            hbox19_lbl.set_markup("ZSH THEMES (Zsh active)")
        else:
            hbox19_lbl.set_markup("ZSH THEMES (Zsh not active)")
        hbox19_lbl.set_name("title")
        hbox19.pack_start(hbox19_lbl, False, False, 0)

        hbox20 = Gtk.Box(orientation=Gtk.Orientation.HORIZONTAL, spacing=10)
        hseparator = Gtk.Separator(orientation=Gtk.Orientation.HORIZONTAL)
        hbox20.pack_start(hseparator, True, True, 0)

        # ==========================================================

        hbox26 = Gtk.Box(orientation=Gtk.Orientation.HORIZONTAL, spacing=0)
        hbox26_lbl = Gtk.Label()
        if fn.check_package_installed("zsh"):
            hbox26_lbl.set_markup("Zsh is already <b>installed</b>")
        else:
            hbox26_lbl.set_markup("Zsh is not installed")
        if fn.check_package_installed("zsh-completions"):
            hbox26_lbl.set_markup("Zsh and Zsh-completion are already <b>installed</b>")

        self.install_zsh_completions = Gtk.Button("Install zsh-completion")
        self.install_zsh_completions.connect(
            "clicked", self.on_install_zsh_completions_clicked
        )
        self.remove_zsh_completions = Gtk.Button("Remove zsh-completion")
        self.remove_zsh_completions.connect(
            "clicked", self.on_remove_zsh_completions_clicked
        )
        hbox26.pack_start(hbox26_lbl, False, False, 10)
        hbox26.pack_end(self.remove_zsh_completions, False, False, 10)
        hbox26.pack_end(self.install_zsh_completions, False, False, 10)

        hbox27 = Gtk.Box(orientation=Gtk.Orientation.HORIZONTAL, spacing=0)
        hbox27_lbl = Gtk.Label()
        if fn.check_package_installed("zsh-syntax-highlighting"):
            hbox27_lbl.set_markup("Zsh-syntax-highlighting is already <b>installed</b>")
        else:
            hbox27_lbl.set_markup("Zsh-syntax-highlighting is not installed")
        self.install_zsh_syntax_highlighting = Gtk.Button(
            "Install Zsh-syntax-highlighting"
        )
        self.install_zsh_syntax_highlighting.connect(
            "clicked", self.on_install_zsh_syntax_highlighting_clicked
        )
        self.remove_zsh_syntax_highlighting = Gtk.Button(
            "Remove Zsh-syntax-highlighting"
        )
        self.remove_zsh_syntax_highlighting.connect(
            "clicked", self.on_remove_zsh_syntax_highlighting_clicked
        )
        hbox27.pack_start(hbox27_lbl, False, False, 10)
        hbox27.pack_end(self.remove_zsh_syntax_highlighting, False, False, 10)
        hbox27.pack_end(self.install_zsh_syntax_highlighting, False, False, 10)

        hbox28 = Gtk.Box(orientation=Gtk.Orientation.HORIZONTAL, spacing=0)
        hbox28_lbl = Gtk.Label()
        if fn.check_package_installed("oh-my-zsh-git"):
            hbox28_lbl.set_markup("Oh-my-zsh-git is already <b>installed</b>")
        else:
            hbox28_lbl.set_markup("Oh-my-zsh-git is not installed")
        self.install_zsh_omz = Gtk.Button("Install Oh-my-zsh")
        self.install_zsh_omz.connect("clicked", self.install_oh_my_zsh)
        self.remove_zsh_omz = Gtk.Button("Remove Oh-my-zsh")
        self.remove_zsh_omz.connect("clicked", self.remove_oh_my_zsh)
        hbox28.pack_start(hbox28_lbl, False, False, 10)
        hbox28.pack_end(self.remove_zsh_omz, False, False, 10)
        hbox28.pack_end(self.install_zsh_omz, False, False, 10)

        hbox25 = Gtk.Box(orientation=Gtk.Orientation.HORIZONTAL, spacing=0)
        hbox25_lbl = Gtk.Label()
        hbox25_lbl.set_markup("Overwrite your ~/.zshrc with the ATT zshrc")
        self.arcolinux_zsh = Gtk.Button("Install the ATT zshrc configuration")
        self.arcolinux_zsh.connect("clicked", self.on_arcolinux_zshrc_clicked)
        self.zsh_reset = Gtk.Button("Reset back to the original ~/.zshrc")
        self.zsh_reset.connect("clicked", self.on_zshrc_reset_clicked)
        hbox25.pack_start(hbox25_lbl, False, False, 10)
        hbox25.pack_end(self.zsh_reset, False, False, 10)
        hbox25.pack_end(self.arcolinux_zsh, False, False, 10)

        hbox21 = Gtk.Box(orientation=Gtk.Orientation.HORIZONTAL, spacing=0)
        hbox21_lbl = Gtk.Label()
        hbox21_lbl.set_markup("Zsh themes")
        self.zsh_themes = Gtk.ComboBoxText()
        self.zsh_themes.set_size_request(300, 20)
        zsh_theme.get_themes(self.zsh_themes)
        hbox21.pack_start(hbox21_lbl, False, False, 10)
        hbox21.pack_end(self.zsh_themes, False, False, 10)

        hbox29 = Gtk.Box(orientation=Gtk.Orientation.HORIZONTAL, spacing=0)
        self.termset = Gtk.Button(label="Apply Zsh theme")
        self.termset.connect("clicked", self.on_zsh_apply_theme)
        if not fn.check_package_installed("zsh"):
            self.termset.set_sensitive(False)
        hbox29.pack_end(self.termset, False, False, 10)

        # image dimensions - this will (in time) allow the image changing function
        # to be re-usable by other parts of the app
        image_width = 500
        image_height = 380
        pixbuf = GdkPixbuf.Pixbuf().new_from_file_at_size(
            base_dir + "/images/zsh-sample.jpg", image_width, image_height
        )
        if self.zsh_themes.get_active_text() is None:
            pass
        elif fn.path.isfile(
            base_dir
            + "/images/zsh_previews/"
            + self.zsh_themes.get_active_text()
            + ".jpg"
        ):
            pixbuf = GdkPixbuf.Pixbuf().new_from_file_at_size(
                base_dir
                + "/images/zsh_previews/"
                + self.zsh_themes.get_active_text()
                + ".jpg",
                image_width,
                image_height,
            )
        image = Gtk.Image().new_from_pixbuf(pixbuf)
        image.set_margin_top(0)

        self.zsh_themes.connect(
            "changed",
            self.update_image,
            image,
            "zsh",
            base_dir,
            image_width,
            image_height,
        )

        hbox23 = Gtk.Box(orientation=Gtk.Orientation.HORIZONTAL, spacing=10)
        hbox23_lbl = Gtk.Label()
        hbox23_lbl.set_markup(
            "Restart your terminal to apply the new Zsh theme\n\n<b>\
If you just switched shell, log-out first</b>\n"
        )
        hbox23_lbl.set_margin_top(30)
        hbox23.pack_start(hbox23_lbl, False, False, 10)

        hbox24 = Gtk.Box(orientation=Gtk.Orientation.HORIZONTAL, spacing=10)
        tozsh = Gtk.Button(label="Apply zsh")
        tobash = Gtk.Button(label="Apply bash")
        tofish = Gtk.Button(label="Apply fish")
        termreset = Gtk.Button(label="Reset or create ~/.zshrc")

        tozsh.connect("clicked", self.tozsh_apply)
        tobash.connect("clicked", self.tobash_apply)
        tofish.connect("clicked", self.tofish_apply)
        termreset.connect("clicked", self.on_zsh_reset)

        hbox24.pack_start(tozsh, False, False, 0)
        hbox24.pack_start(tobash, False, False, 0)
        if not fn.distr == "archcraft":
            hbox24.pack_start(tofish, False, False, 0)
        hbox24.pack_end(termreset, False, False, 0)

        vboxstack2.pack_start(hbox19, False, False, 0)
        vboxstack2.pack_start(hbox20, False, False, 0)
        vboxstack2.pack_start(hbox26, False, False, 0)
        vboxstack2.pack_start(hbox27, False, False, 0)
        vboxstack2.pack_start(hbox28, False, False, 0)
        vboxstack2.pack_start(hbox25, False, False, 0)
        vboxstack2.pack_start(hbox21, False, False, 0)
        vboxstack2.pack_start(hbox29, False, False, 0)
        vboxstack2.pack_start(image, False, False, 0)
        vboxstack2.pack_start(hbox23, False, False, 0)
        vboxstack2.pack_end(hbox24, False, False, 0)

        if not fn.check_package_installed("oh-my-zsh-git") or not fn.path.isfile(
            fn.zsh_config
        ):
            self.termset.set_sensitive(False)
            termreset.set_sensitive(False)
        if not fn.path.isfile(fn.zsh_config):
            termreset.set_sensitive(True)

    else:
        # no zsh installed
        hbox32 = Gtk.Box(orientation=Gtk.Orientation.HORIZONTAL, spacing=10)
        hbox32_lbl = Gtk.Label(xalign=0)
        hbox32_lbl.set_markup("Zsh is not installed")
        hbox32_lbl.set_name("title")
        hbox32.pack_start(hbox32_lbl, False, False, 0)

        hbox41 = Gtk.Box(orientation=Gtk.Orientation.HORIZONTAL, spacing=10)
        hseparator = Gtk.Separator(orientation=Gtk.Orientation.HORIZONTAL)
        hbox41.pack_start(hseparator, True, True, 0)

        message = Gtk.Label()
        message.set_markup("<b>Zsh does not seem to be installed</b>")

        install_only_zsh = Gtk.Button(
            label="Install only Zsh and restart ATT to configure"
        )
        install_only_zsh.connect("clicked", self.on_clicked_install_only_zsh)

        vboxstack2.pack_start(hbox32, False, False, 0)
        vboxstack2.pack_start(hbox41, False, False, 0)
        vboxstack2.pack_start(message, False, False, 0)
        vboxstack2.pack_start(install_only_zsh, False, False, 0)

    # ==================================================================
    #                       FISH
    # ==================================================================

    if fn.check_package_installed("fish"):
        hbox30 = Gtk.Box(orientation=Gtk.Orientation.HORIZONTAL, spacing=10)
        hbox30_lbl = Gtk.Label(xalign=0)
        if fn.get_shell() == "fish":
            hbox30_lbl.set_markup("Fish (active)")
        else:
            hbox30_lbl.set_markup("Fish (not active)")
        hbox30_lbl.set_name("title")
        hbox30.pack_start(hbox30_lbl, False, False, 0)

        hbox31 = Gtk.Box(orientation=Gtk.Orientation.HORIZONTAL, spacing=10)
        hseparator = Gtk.Separator(orientation=Gtk.Orientation.HORIZONTAL)
        hbox31.pack_start(hseparator, True, True, 0)

        hbox32 = Gtk.Box(orientation=Gtk.Orientation.HORIZONTAL, spacing=0)
        hbox32_lbl = Gtk.Label()
        if fn.check_package_installed("fish"):
            hbox32_lbl.set_markup("Fish is already <b>installed</b>")
        else:
            hbox32_lbl.set_markup("Fish is not installed")
        install_fish = Gtk.Button("Install Fish")
        install_fish.connect("clicked", self.on_install_only_fish_clicked)
        remove_fish = Gtk.Button("Remove Fish")
        remove_fish.connect("clicked", self.on_remove_only_fish_clicked)
        hbox32.pack_start(hbox32_lbl, False, False, 10)
        hbox32.pack_end(remove_fish, False, False, 10)
        hbox32.pack_end(install_fish, False, False, 10)

        hbox33 = Gtk.Box(orientation=Gtk.Orientation.HORIZONTAL, spacing=0)
        hbox33_lbl = Gtk.Label()
        if fn.check_package_installed("arcolinux-fish-git"):
            hbox33_lbl.set_markup(
                "ATT fish incl. oh-my-fish, themes and plugins is already <b>installed</b>"
            )
        else:
            hbox33_lbl.set_markup(
                "ATT fish incl. oh-my-fish, themes and plugins is not installed"
            )
        self.arcolinux_fish = Gtk.Button("Install the ATT Fish package")
        self.arcolinux_fish.connect("clicked", self.on_arcolinux_fish_package_clicked)
        hbox33.pack_start(hbox33_lbl, False, False, 10)
        hbox33.pack_end(self.arcolinux_fish, False, False, 10)

        hbox38 = Gtk.Box(orientation=Gtk.Orientation.HORIZONTAL, spacing=0)
        hbox38_lbl = Gtk.Label()
        hbox38_lbl.set_markup("Overwrite your config.fish with the ATT config")
        self.arcolinux_fish = Gtk.Button("Install just the ATT config.fish")
        self.arcolinux_fish.connect("clicked", self.on_arcolinux_only_fish_clicked)
        self.fish_reset = Gtk.Button("Reset back to the original ~/.config/config.fish")
        self.fish_reset.connect("clicked", self.on_fish_reset_clicked)
        hbox38.pack_start(hbox38_lbl, False, False, 10)
        hbox38.pack_end(self.fish_reset, False, False, 10)
        hbox38.pack_end(self.arcolinux_fish, False, False, 10)

        hbox34 = Gtk.Box(orientation=Gtk.Orientation.HORIZONTAL, spacing=10)
        hbox34_lbl = Gtk.Label()
        hbox34_lbl.set_markup(
            "Restart your terminal to apply the new Fish theme\n\
\nYou will find scripts in your ~/.config/fish \
folder to install oh-my-fish, theme and plugins\n\
if you installed the ATT Fish configuration\n\n<b>If you just switched shell, log-out first</b>\n"
        )
        hbox34_lbl.set_margin_top(20)
        hbox34.pack_start(hbox34_lbl, False, False, 10)

        # ==========================================================
        #                     BUTTONS
        # ==========================================================

        hbox35 = Gtk.Box(orientation=Gtk.Orientation.HORIZONTAL, spacing=10)
        tofish = Gtk.Button(label="Apply fish")
        tofish.connect("clicked", self.tofish_apply)
        tobash = Gtk.Button(label="Apply bash")
        tobash.connect("clicked", self.tobash_apply)
        tozsh = Gtk.Button(label="Apply zsh")
        tozsh.connect("clicked", self.tozsh_apply)
        termreset = Gtk.Button(label="Reset fish")
        termreset.connect("clicked", self.on_fish_reset_clicked)
        remove_fish_all = Gtk.Button(label="Remove all Fish related packages")
        remove_fish_all.connect("clicked", self.on_remove_fish_all)

        if not fn.distr == "archcraft":
            hbox35.pack_start(tofish, False, False, 0)
        hbox35.pack_start(tobash, False, False, 0)
        hbox35.pack_start(tozsh, False, False, 0)
        hbox35.pack_end(remove_fish_all, False, False, 0)
        hbox35.pack_end(termreset, False, False, 0)

        # ==========================================================
        #                     VBOXSTACK
        # ==========================================================

        vboxstack3.pack_start(hbox30, False, False, 0)  # Combobox
        vboxstack3.pack_start(hbox31, False, False, 0)  # Combobox
        vboxstack3.pack_start(hbox32, False, False, 0)  # fish
        vboxstack3.pack_start(hbox38, False, False, 0)  # oh-my-fish
        vboxstack3.pack_start(hbox33, False, False, 0)  # oh-my-fish
        vboxstack3.pack_start(hbox34, False, False, 0)  # image
        vboxstack3.pack_end(hbox35, False, False, 0)  # Buttons

    else:
        # no fish installed
        hbox36 = Gtk.Box(orientation=Gtk.Orientation.HORIZONTAL, spacing=10)
        hbox36_lbl = Gtk.Label(xalign=0)
        hbox36_lbl.set_markup("Fish is not installed")
        hbox36_lbl.set_name("title")
        hbox36.pack_start(hbox36_lbl, False, False, 0)

        hbox37 = Gtk.Box(orientation=Gtk.Orientation.HORIZONTAL, spacing=10)
        hseparator = Gtk.Separator(orientation=Gtk.Orientation.HORIZONTAL)
        hbox37.pack_start(hseparator, True, True, 0)

        message = Gtk.Label()
        message.set_markup(
            "<b>Fish does not seem to be installed\n\
Restart Att to see the information</b>"
        )

        install_only_fish = Gtk.Button(label="Install Fish - auto reboot")
        install_only_fish.connect("clicked", self.on_install_only_fish_clicked_reboot)

        vboxstack3.pack_start(hbox36, False, False, 0)
        vboxstack3.pack_start(hbox37, False, False, 0)
        vboxstack3.pack_start(message, False, False, 0)
        vboxstack3.pack_start(install_only_fish, False, False, 0)

    # ==================================================================
    #                       EXTRA
    # ==================================================================

    hbox51 = Gtk.Box(orientation=Gtk.Orientation.HORIZONTAL, spacing=10)
    hbox51_lbl = Gtk.Label()
    hbox51_lbl.set_markup(
        "The shell configurations of the ATT contain\
 aliases that require certain applications\n\
\nHere you can select the missing applications and install them\n\
Activate the ArcoLinux repos to install all of them\n\n\
Applications that were NOT installed will be <b>unselected</b> again\n\
Activate the necessary repos"
    )
    self.select_all = Gtk.CheckButton(label="Select them all")
    self.select_all.connect("notify::active", self.on_select_all_toggle)
    hbox51_lbl.set_margin_top(20)
    hbox51.pack_start(hbox51_lbl, False, False, 10)
    hbox51.pack_end(self.select_all, False, False, 10)

    # hbox52 = Gtk.Box(orientation=Gtk.Orientation.HORIZONTAL, spacing=10)
    # self.select_all = Gtk.CheckButton(label="Select them all")
    # #hbox52.set_margin_top(20)
    # hbox52.pack_start(self.select_all, False, False, 10)

    self.expac = Gtk.CheckButton(label="expac")
    self.ripgrep = Gtk.CheckButton(label="ripgrep")
    self.yay = Gtk.CheckButton(label="yay")
    self.paru = Gtk.CheckButton(label="paru")
    self.bat = Gtk.CheckButton(label="bat")
    self.downgrade = Gtk.CheckButton(label="downgrade")
    self.hw_probe = Gtk.CheckButton(label="hw-probe")
    self.rate_mirrors = Gtk.CheckButton(label="rate-mirrors")
    self.most = Gtk.CheckButton(label="most")

    flowbox = Gtk.FlowBox()
    flowbox.set_valign(Gtk.Align.START)
    flowbox.set_max_children_per_line(2)
    flowbox.set_selection_mode(Gtk.SelectionMode.NONE)

    flowbox.add(self.expac)
    flowbox.add(self.ripgrep)
    flowbox.add(self.yay)
    flowbox.add(self.paru)
    flowbox.add(self.bat)
    flowbox.add(self.downgrade)
    flowbox.add(self.hw_probe)
    flowbox.add(self.rate_mirrors)
    flowbox.add(self.most)

    extra_shell_applications = Gtk.Button(label="Install these applications")
    extra_shell_applications.connect(
        "clicked", self.on_extra_shell_applications_clicked
    )

    vboxstack4.pack_start(hbox51, False, False, 0)
    # vboxstack4.pack_start(hbox52, False, False, 0)
    vboxstack4.pack_start(flowbox, False, False, 0)
    vboxstack4.pack_start(extra_shell_applications, False, False, 0)
    # vboxstack4.pack_start(install_only_fish, False, False, 0)

    # ==================================================================
    #                       PACK TO STACK
    # ==================================================================

    stack.add_titled(vboxstack1, "stack1", "BASH")
    stack.add_titled(vboxstack2, "stack2", "ZSH")
    if not fn.distr == "archcraft":
        stack.add_titled(vboxstack3, "stack3", "FISH")
    stack.add_titled(vboxstack4, "stack4", "EXTRA")

    vbox.pack_start(stack_switcher, False, False, 0)
    vbox.pack_start(stack, True, True, 0)

    vboxstack23.pack_start(hbox1, False, False, 0)
    vboxstack23.pack_start(hbox0, False, False, 0)
    vboxstack23.pack_start(vbox, True, True, 0)
