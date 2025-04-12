# ============================================================
# Authors: Brad Heffernan - Erik Dubois - Cameron Percival
# ============================================================
# pylint:disable=R0911,R1705,

import functions as fn

# This function has one job, and one job only; ensure that check
# boxes match what is passed to it, based on the logic from the calling function


def set_util_state_arco_switch(self):
    """set utility state"""
    if fn.check_arco_repos_active():
        self.ufetch_util.set_sensitive(True)
        self.ufetch_arco_util.set_sensitive(True)
        self.pfetch_util.set_sensitive(True)
        self.paleofetch_util.set_sensitive(True)
        self.alsi_util.set_sensitive(True)
        self.hfetch_util.set_sensitive(True)
        self.fetch_util.set_sensitive(True)
        self.sfetch_util.set_sensitive(True)
        self.sysinfo_util.set_sensitive(True)
        self.sysinfo_retro_util.set_sensitive(True)
        self.cpufetch_util.set_sensitive(True)
        self.hyfetch_util.set_sensitive(True)
        self.colorscript.set_sensitive(True)

        self.ufetch_lolcat.set_sensitive(True)
        self.ufetch_arco_lolcat.set_sensitive(True)
        self.pfetch_lolcat.set_sensitive(True)
        self.paleofetch_lolcat.set_sensitive(True)
        self.alsi_lolcat.set_sensitive(True)
        self.hfetch_lolcat.set_sensitive(True)
        self.fetch_lolcat.set_sensitive(True)
        self.sfetch_lolcat.set_sensitive(True)
        self.sysinfo_lolcat.set_sensitive(True)
        self.sysinfo_retro_lolcat.set_sensitive(True)
        self.cpufetch_lolcat.set_sensitive(True)
        self.hyfetch_lolcat.set_sensitive(True)
        self.colorscript.set_sensitive(True)
    else:
        if fn.check_package_installed("ufetch-git"):
            self.ufetch_util.set_sensitive(True)
        else:
            self.ufetch_util.set_sensitive(False)

        if fn.check_package_installed("ufetch-arco-git"):
            self.ufetch_arco_util.set_sensitive(True)
        else:
            self.ufetch_arco_util.set_sensitive(False)

        if fn.check_package_installed("pfetch"):
            self.pfetch_util.set_sensitive(True)
        else:
            self.pfetch_util.set_sensitive(False)

        if fn.check_package_installed("arcolinux-paleofetch-git"):
            self.paleofetch_util.set_sensitive(True)
        else:
            self.paleofetch_util.set_sensitive(False)

        if fn.check_package_installed("alsi"):
            self.alsi_util.set_sensitive(True)
        else:
            self.alsi_util.set_sensitive(False)

        if fn.check_package_installed("arcolinux-bin-git"):
            self.hfetch_util.set_sensitive(True)
        else:
            self.hfetch_util.set_sensitive(False)

        if fn.check_package_installed("arcolinux-bin-git"):
            self.fetch_util.set_sensitive(True)
        else:
            self.fetch_util.set_sensitive(False)

        if fn.check_package_installed("arcolinux-bin-git"):
            self.sfetch_util.set_sensitive(True)
        else:
            self.sfetch_util.set_sensitive(False)

        if fn.check_package_installed("arcolinux-bin-git"):
            self.sysinfo_util.set_sensitive(True)
        else:
            self.sysinfo_util.set_sensitive(False)

        if fn.check_package_installed("arcolinux-bin-git"):
            self.sysinfo_retro_util.set_sensitive(True)
        else:
            self.sysinfo_retro_util.set_sensitive(False)

        if fn.check_package_installed("cpufetch"):
            self.cpufetch_util.set_sensitive(True)
        else:
            self.cpufetch_util.set_sensitive(False)

        if fn.check_package_installed("hyfetch"):
            self.hyfetch_util.set_sensitive(True)
        else:
            self.hyfetch_util.set_sensitive(False)

        if fn.check_package_installed("shell-color-scripts"):
            self.colorscript.set_sensitive(True)
        else:
            self.colorscript.set_sensitive(False)

        # lolcat_state

        if fn.check_package_installed("ufetch-git"):
            self.ufetch_lolcat.set_sensitive(True)
        else:
            self.ufetch_lolcat.set_sensitive(False)

        if fn.check_package_installed("ufetch-arco-git"):
            self.ufetch_arco_lolcat.set_sensitive(True)
        else:
            self.ufetch_arco_lolcat.set_sensitive(False)

        if fn.check_package_installed("pfetch"):
            self.pfetch_lolcat.set_sensitive(True)
        else:
            self.pfetch_lolcat.set_sensitive(False)

        if fn.check_package_installed("arcolinux-paleofetch-git"):
            self.paleofetch_lolcat.set_sensitive(True)
        else:
            self.paleofetch_lolcat.set_sensitive(False)

        if fn.check_package_installed("alsi"):
            self.alsi_lolcat.set_sensitive(True)
        else:
            self.alsi_lolcat.set_sensitive(False)

        if fn.check_package_installed("arcolinux-bin-git"):
            self.hfetch_lolcat.set_sensitive(True)
        else:
            self.hfetch_lolcat.set_sensitive(False)

        if fn.check_package_installed("arcolinux-bin-git"):
            self.fetch_lolcat.set_sensitive(True)
        else:
            self.fetch_lolcat.set_sensitive(False)

        if fn.check_package_installed("arcolinux-bin-git"):
            self.sfetch_lolcat.set_sensitive(True)
        else:
            self.sfetch_lolcat.set_sensitive(False)

        if fn.check_package_installed("arcolinux-bin-git"):
            self.sysinfo_lolcat.set_sensitive(True)
        else:
            self.sysinfo_lolcat.set_sensitive(False)

        if fn.check_package_installed("arcolinux-bin-git"):
            self.sysinfo_retro_lolcat.set_sensitive(True)
        else:
            self.sysinfo_retro_lolcat.set_sensitive(False)

        if fn.check_package_installed("cpufetch"):
            self.cpufetch_lolcat.set_sensitive(True)
        else:
            self.cpufetch_lolcat.set_sensitive(False)
        if fn.check_package_installed("hyfetch"):
            self.hyfetch_lolcat.set_sensitive(True)
        else:
            self.hyfetch_lolcat.set_sensitive(False)
        if fn.check_package_installed("shell-color-scripts"):
            self.colorscript.set_sensitive(True)
        else:
            self.colorscript.set_sensitive(False)


def set_util_state(self, util, util_state, lolcat_state):
    """set utility state"""
     
    if util == "fastfetch":
        self.fastfetch_lolcat.set_state(lolcat_state)
        self.fastfetch_util.set_state(util_state)
    elif util == "screenfetch":
        self.screenfetch_lolcat.set_state(lolcat_state)
        self.screenfetch_util.set_state(util_state)
    elif util == "ufetch":
        self.ufetch_lolcat.set_state(lolcat_state)
        self.ufetch_util.set_state(util_state)
    elif util == "ufetch-arco":
        self.ufetch_arco_lolcat.set_state(lolcat_state)
        self.ufetch_arco_util.set_state(util_state)
    elif util == "pfetch":
        self.pfetch_lolcat.set_state(lolcat_state)
        self.pfetch_util.set_state(util_state)
    elif util == "paleofetch":
        self.paleofetch_lolcat.set_state(lolcat_state)
        self.paleofetch_util.set_state(util_state)
    elif util == "alsi":
        self.alsi_lolcat.set_state(lolcat_state)
        self.alsi_util.set_state(util_state)
    elif util == "hfetch":
        self.hfetch_lolcat.set_state(lolcat_state)
        self.hfetch_util.set_state(util_state)
    elif util == "fetch":
        self.fetch_lolcat.set_state(lolcat_state)
        self.fetch_util.set_state(util_state)
    elif util == "sfetch":
        self.sfetch_lolcat.set_state(lolcat_state)
        self.sfetch_util.set_state(util_state)
    elif util == "sysinfo":
        self.sysinfo_lolcat.set_state(lolcat_state)
        self.sysinfo_util.set_state(util_state)
    elif util == "sysinfo-retro":
        self.sysinfo_retro_lolcat.set_state(lolcat_state)
        self.sysinfo_retro_util.set_state(util_state)
    elif util == "cpufetch":
        self.cpufetch_lolcat.set_state(lolcat_state)
        self.cpufetch_util.set_state(util_state)
    elif util == "hyfetch":
        self.hyfetch_lolcat.set_state(lolcat_state)
        self.hyfetch_util.set_state(util_state)
    elif util == "colorscript random":
        self.colorscript.set_state(util_state)
    else:
        return

    # Write configs for all utilities except colorscript
    if util != "colorscript random":
        write_configs(util, util_state, lolcat_state)



def get_util_state(self, util):
    """get utility state"""
    if util == "neofetch":
        return self.neofetch_util.get_active()
    elif util == "fastfetch":
        return self.fastfetch_util.get_active()
    elif util == "screenfetch":
        return self.screenfetch_util.get_active()
    elif util == "ufetch":
        return self.ufetch_util.get_active()
    elif util == "ufetch-arco":
        return self.ufetch_arco_util.get_active()
    elif util == "pfetch":
        return self.pfetch_util.get_active()
    elif util == "paleofetch":
        return self.paleofetch_util.get_active()
    elif util == "alsi":
        return self.alsi_util.get_active()
    elif util == "hfetch":
        return self.hfetch_util.get_active()
    elif util == "fetch":
        return self.fetch_util.get_active()
    elif util == "sfetch":
        return self.sfetch_util.get_active()
    elif util == "sysinfo":
        return self.sysinfo_util.get_active()
    elif util == "sysinfo-retro":
        return self.sysinfo_retro_util.get_active()
    elif util == "cpufetch":
        return self.cpufetch_util.get_active()
    elif util == "hyfetch":
        return self.hyfetch_util.get_active()
    elif util == "colorscript random":
        return self.colorscripts.get_active()
    else:
        return False


def get_lolcat_state(self, util):
    """get lolcat state"""
    if util == "neofetch":
        return self.neofetch_lolcat.get_active()
    elif util == "fastfetch":
        return self.fastfetch_lolcat.get_active()
    elif util == "screenfetch":
        return self.screenfetch_lolcat.get_active()
    elif util == "ufetch":
        return self.ufetch_lolcat.get_active()
    elif util == "ufetch-arco":
        return self.ufetch_arco_lolcat.get_active()
    elif util == "pfetch":
        return self.pfetch_lolcat.get_active()
    elif util == "paleofetch":
        return self.paleofetch_lolcat.get_active()
    elif util == "alsi":
        return self.alsi_lolcat.get_active()
    elif util == "hfetch":
        return self.hfetch_lolcat.get_active()
    elif util == "fetch":
        return self.fetch_lolcat.get_active()
    elif util == "sfetch":
        return self.sfetch_lolcat.get_active()
    elif util == "sysinfo":
        return self.sysinfo_lolcat.get_active()
    elif util == "sysinfo-retro":
        return self.sysinfo_retro_lolcat.get_active()
    elif util == "cpufetch":
        return self.cpufetch_lolcat.get_active()
    elif util == "hyfetch":
        return self.hyfetch_lolcat.get_active()
    elif util == "colorscript random":  # no lolcat for colorscripts
        return False
    else:
        return False


def install_util(util):
    """install utility"""
    command = ""
    if util == "neofetch":
        if fn.check_arco_repos_active():
            command = "pacman -S neofetch arcolinux-neofetch-git --noconfirm --needed"
        else:
            command = "pacman -S neofetch --noconfirm --needed"
    elif util == "fastfetch":
        if fn.check_arco_repos_active():
            command = "pacman -S fastfetch arcolinux-fastfetch-git --noconfirm --needed"
        else:
            command = "pacman -S fastfetch --noconfirm --needed"
    elif util == "screenfetch":
        command = "pacman -S screenfetch --noconfirm --needed"
    elif util == "ufetch":
        command = "pacman -S ufetch-git --noconfirm --needed"
    elif util == "ufetch-arco":
        command = "pacman -S ufetch-arco-git --noconfirm --needed"
    elif util == "pfetch":
        command = "pacman -S pfetch --noconfirm --needed"
    elif util == "paleofetch":
        command = "pacman -S arcolinux-paleofetch-git --noconfirm --needed"
    elif util == "alsi":
        command = "pacman -S alsi --noconfirm --needed"
    elif util == "hfetch":
        command = "pacman -S arcolinux-bin-git --noconfirm --needed"
    elif util == "sfetch":
        command = "pacman -S arcolinux-bin-git --noconfirm --needed"
    elif util == "fetch":
        command = "pacman -S arcolinux-bin-git --noconfirm --needed"
    elif util == "sysinfo":
        command = "pacman -S arcolinux-bin-git --noconfirm --needed"
    elif util == "sysinfo-retro":
        command = "pacman -S arcolinux-bin-git --noconfirm --needed"
    elif util == "lolcat":
        command = "pacman -S lolcat --noconfirm --needed"
    elif util == "cpufetch":
        command = "pacman -S cpufetch --noconfirm --needed"
    elif util == "hyfetch":
        command = "pacman -S hyfetch --noconfirm --needed"
    elif util == "colorscript random":
        command = "pacman -S shell-color-scripts --noconfirm --needed"
    else:
        pass

    # This is just protection to avoid unneeded errors.
    if len(command) > 0:
        fn.subprocess.call(
            command.split(" "),
            shell=False,
            stdout=fn.subprocess.PIPE,
            stderr=fn.subprocess.STDOUT,
        )


def get_position(lists, value):
    """get position"""
    data = []
    # Because we don't know EXACTLY how the app will process the rc file,
    # we need to account for every variation.
    suffixes = [" | lolcat", "\n", " | lolcat\n"]
    prefix = "#"

    for string in lists:
        for item in suffixes:
            if string in (value + item, prefix + value + item, value, prefix + value):
                data.append(string)

    if len(data) > 0:
        position = lists.index(data[0])
        return position
    else:
        return -1

def write_configs(utility, util_enabled, lolcat_enabled):
    """write config"""
    config = get_config_file()
    if not config:
        return

    with open(config, "r", encoding="utf-8") as f:
        lines = f.readlines()

    # Find the reporting tools section
    reporting_section_start = -1
    for i, line in enumerate(lines):
        if "# reporting tools" in line.lower():
            reporting_section_start = i
            break

    if reporting_section_start == -1:
        return  # Exit if the reporting tools section is not found

    # Check if the fastfetch line exists within the reporting tools section
    fastfetch_line = -1
    for i in range(reporting_section_start, len(lines)):
        if lines[i].strip().startswith(("fastfetch", "#fastfetch")):
            fastfetch_line = i
            break

    if fastfetch_line == -1:
        return  # Exit if fastfetch line is not found

    # Determine the new state of the fastfetch line
    current_line = lines[fastfetch_line].strip()
    if util_enabled:
        new_state = "fastfetch | lolcat" if lolcat_enabled else "fastfetch"
    else:
        new_state = "#fastfetch"

    # Update the line if necessary, but do not update any lines above the reporting tools section
    if current_line != new_state and fastfetch_line >= reporting_section_start:
        lines[fastfetch_line] = new_state + "\n"

        # Write the changes back to the file
        with open(config, "w", encoding="utf-8") as f:
            f.writelines(lines)
 


    # Remove or comment out the following lines to stop the debug output
    # with open(config, "r", encoding="utf-8") as f:
    #     updated_content = f.read()
    #     print(f"Updated fastfetch lines: {[line for line in updated_content.split('\n') if 'fastfetch' in line]}")


def get_term_rc(value):
    """get term value"""
    config_file = ""
    pos = -1  # Essentially, if this doesn't update, we will return False
    try:
        config_file = get_config_file()
    except:
        config_file = ""
    if config_file != "":
        with open(config_file, "r", encoding="utf-8") as myfile:
            lines = myfile.readlines()
            myfile.close()
            pos = get_position(lines, value)

    if pos > 0 and lines[pos].startswith("#"):
        return False
    elif pos >= 0:
        return True
    else:
        return False


def get_config_file():
    """get config file"""
    if fn.get_shell() == "bash":
        return fn.bash_config
    elif fn.get_shell() == "zsh":
        return fn.zsh_config
    else:
        return fn.fish_config

def comment_out_command_in_file(file_path, command):
    with open(file_path, 'r') as file:
        lines = file.readlines()

    with open(file_path, 'w') as file:
        for line in lines:
            if command in line and not line.strip().startswith('#'):
                # Comment out the line if it contains the command
                file.write('#' + line)
            else:
                file.write(line)
