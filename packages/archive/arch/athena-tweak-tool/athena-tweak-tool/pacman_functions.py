# ============================================================
# Authors: Brad Heffernan - Erik Dubois - Cameron Percival
# ============================================================

import functions as fn


def append_repo(self, text):
    """Append a new repo"""
    with open(fn.pacman, "a", encoding="utf-8") as myfile:
        myfile.write("\n\n")
        myfile.write(text)

    fn.show_in_app_notification(self, "Settings Saved Successfully")


def append_mirror(self, text):
    """Append a new mirror"""
    with open(fn.athena_mirrorlist, "a", encoding="utf-8") as myfile:
        myfile.write("\n\n")
        myfile.write(text)

    fn.show_in_app_notification(self, "Settings Saved Successfully")


def insert_repo(self, text):
    """insert a repo"""
    with open(fn.pacman, "r", encoding="utf-8") as f:
        lines = f.readlines()
        f.close()
    pos = fn.get_position(lines, "[custom]")
    num = pos + 3

    lines.insert(num, "\n" + text + "\n")

    with open(fn.pacman, "w", encoding="utf-8") as f:
        f.writelines(lines)
        f.close()


def check_repo(value):
    """check if repo is there and active"""
    with open(fn.pacman, "r", encoding="utf-8") as myfile:
        lines = myfile.readlines()
        myfile.close()

    for line in lines:
        if value in line:
            if "#" + value in line:
                return False
            else:
                return True
    return False


def check_mirror(value):
    """check if mirror is there and active"""
    with open(fn.athena_mirrorlist, "r", encoding="utf-8") as myfile:
        lines = myfile.readlines()
        myfile.close()

    for line in lines:
        if value in line:
            if "#" + value in line:
                return False
            else:
                return True
    return False


def repo_exist(value):
    """check repo_exists"""
    with open(fn.pacman, "r", encoding="utf-8") as myfile:
        lines = myfile.readlines()
        myfile.close()

    for line in lines:
        if value in line:
            return True
    return False


def mirror_exist(value):
    """check mirror exists"""
    with open(fn.athena_mirrorlist, "r", encoding="utf-8") as myfile:
        lines = myfile.readlines()
        myfile.close()

    for line in lines:
        if value in line:
            return True
    return False


def pacman_on(repo, lines, i, line):
    """set pacman on a given repo"""
    if repo in line:
        lines[i] = line.replace("#", "")
        if (i + 1) < len(lines):
            lines[i + 1] = lines[i + 1].replace("#", "")
        if (i + 2) < len(lines) and "Include" in lines[i + 2]:
            lines[i + 2] = lines[i + 2].replace("#", "")


def mirror_on(mirror, lines, i, line):
    """set mirror on"""
    if mirror in line:
        lines[i] = line.replace("#", "")
        if (i + 1) < len(lines):
            lines[i + 1] = lines[i + 1].replace("#", "")
        if (i + 2) < len(lines) and "Include" in lines[i + 2]:
            lines[i + 2] = lines[i + 2].replace("#", "")


def pacman_off(repo, lines, i, line):
    """set pacman off"""
    if repo in line:
        if "#" not in lines[i]:
            lines[i] = line.replace(lines[i], "#" + lines[i])
        if (i + 1) < len(lines):
            if "#" not in lines[i + 1]:
                lines[i + 1] = lines[i + 1].replace(lines[i + 1], "#" + lines[i + 1])
        if (i + 2) < len(lines) and "Include" in lines[i + 2]:
            if "#" not in lines[i + 2]:
                lines[i + 2] = lines[i + 2].replace(lines[i + 2], "#" + lines[i + 2])


def mirror_off(mirror, lines, i, line):
    """set mirror off"""
    if mirror in line:
        if "#" not in lines[i]:
            lines[i] = line.replace(lines[i], "#" + lines[i])


def spin_on(repo, lines, i, line):
    """set spin on repo"""
    if repo in line:
        lines[i] = line.replace("#", "")
        if (i + 1) < len(lines):
            lines[i + 1] = lines[i + 1].replace("#", "")
        if (i + 2) < len(lines):
            lines[i + 2] = lines[i + 2].replace("#", "")


def spin_off(repo, lines, i, line):
    """set spin off"""
    if repo in line:
        if "#" not in lines[i]:
            lines[i] = line.replace(lines[i], "#" + lines[i])
        if (i + 1) < len(lines):
            if "#" not in lines[i + 1]:
                lines[i + 1] = lines[i + 1].replace(lines[i + 1], "#" + lines[i + 1])
        if (i + 2) < len(lines):
            if "#" not in lines[i + 2]:
                lines[i + 2] = lines[i + 2].replace(lines[i + 2], "#" + lines[i + 2])


def toggle_test_repos(self, state, widget):
    """toggle test repo"""
    if not fn.os.path.isfile(fn.pacman + ".bak"):
        fn.shutil.copy(fn.pacman, fn.pacman + ".bak")
    lines = ""
    if state is True:
        with open(fn.pacman, "r", encoding="utf-8") as f:
            lines = f.readlines()
            f.close()
        try:
            # TODO enumerate
            for i in range(0, len(lines)):
                line = lines[i]
                if widget == "reborn":
                    spin_on("[Reborn-OS]", lines, i, line)
                if widget == "blackarch":
                    spin_on("[blackarch]", lines, i, line)
                if widget == "garuda":
                    spin_on("[garuda]", lines, i, line)
                if widget == "chaotics":
                    spin_on("[chaotic-aur]", lines, i, line)
                if widget == "endeavouros":
                    spin_on("[endeavouros]", lines, i, line)
                if widget == "nemesis":
                    spin_on("[nemesis_repo]", lines, i, line)
                # if widget == "xero":
                #     spin_on("[xerolinux_repo]", lines, i, line)
                # if widget == "xero_xl":
                #     spin_on("[xerolinux_repo_xl]", lines, i, line)
                # if widget == "xero_nv":
                #     spin_on("[xerolinux_nvidia_repo]", lines, i, line)
                
                if widget == "athena":
                    pacman_on("[athena]", lines, i, line)
                if widget == "arco_testing":
                    pacman_on("[arcolinux_repo_testing]", lines, i, line)
                if widget == "arco_base":
                    pacman_on("[arcolinux_repo]", lines, i, line)
                if widget == "arco_a3p":
                    pacman_on("[arcolinux_repo_3party]", lines, i, line)
                if widget == "arco_axl":
                    pacman_on("[arcolinux_repo_xlarge]", lines, i, line)

                if widget == "testing":
                    pacman_on("[core-testing]", lines, i, line)
                if widget == "core":
                    pacman_on("[core]", lines, i, line)
                if widget == "extra":
                    pacman_on("[extra]", lines, i, line)
                if widget == "community-testing":
                    pacman_on("[extra-testing]", lines, i, line)
                if widget == "community":
                    pacman_on("[extra-testing]", lines, i, line)
                if widget == "multilib-testing":
                    pacman_on("[multilib-testing]", lines, i, line)
                if widget == "multilib":
                    pacman_on("[multilib]", lines, i, line)

            with open(fn.pacman, "w", encoding="utf-8") as f:
                # lines = f.readlines()
                f.writelines(lines)
                f.close()
        except Exception as error:
            print(error)
            fn.messagebox(
                self,
                "ERROR!!",
                "An error has occurred setting this setting 'toggle_test_repos On'",
            )
    else:
        with open(fn.pacman, "r", encoding="utf-8") as f:
            lines = f.readlines()
            f.close()
        try:
            # TODO enumerate
            for i in range(0, len(lines)):
                line = lines[i]
                if widget == "reborn":
                    spin_off("[Reborn-OS]", lines, i, line)
                if widget == "blackarch":
                    spin_off("[blackarch]", lines, i, line)
                if widget == "garuda":
                    spin_off("[garuda]", lines, i, line)
                if widget == "chaotics":
                    spin_off("[chaotic-aur]", lines, i, line)
                if widget == "endeavouros":
                    spin_off("[endeavouros]", lines, i, line)
                if widget == "nemesis":
                    spin_off("[nemesis_repo]", lines, i, line)
                # if widget == "xero":
                #     spin_off("[xerolinux_repo]", lines, i, line)
                # if widget == "xero_xl":
                #     spin_off("[xerolinux_repo_xl]", lines, i, line)
                # if widget == "xero_nv":
                #     spin_off("[xerolinux_nvidia_repo]", lines, i, line)

                if widget == "athena":
                    pacman_off("[athena]", lines, i, line)
                if widget == "arco_testing":
                    pacman_off("[arcolinux_repo_testing]", lines, i, line)
                if widget == "arco_base":
                    pacman_off("[arcolinux_repo]", lines, i, line)
                if widget == "arco_a3p":
                    pacman_off("[arcolinux_repo_3party]", lines, i, line)
                if widget == "arco_axl":
                    pacman_off("[arcolinux_repo_xlarge]", lines, i, line)

                if widget == "testing":
                    pacman_off("[core-testing]", lines, i, line)
                if widget == "core":
                    pacman_off("[core]", lines, i, line)
                if widget == "extra":
                    pacman_off("[extra]", lines, i, line)
                if widget == "community-testing":
                    pacman_off("[extra-testing]", lines, i, line)
                if widget == "community":
                    pacman_off("[extra-testing]", lines, i, line)
                if widget == "multilib-testing":
                    pacman_off("[multilib-testing]", lines, i, line)
                if widget == "multilib":
                    pacman_off("[multilib]", lines, i, line)

            with open(fn.pacman, "w", encoding="utf-8") as f:
                f.writelines(lines)
                f.close()
        except:
            fn.messagebox(
                self,
                "ERROR!!",
                "An error has occurred setting this setting 'toggle_test_repos Off'",
            )


def toggle_mirrorlist(self, state, widget):
    """toggle mirrorlist"""
    if not fn.os.path.isfile(fn.athena_mirrorlist + ".bak"):
        fn.shutil.copy(fn.athena_mirrorlist, fn.athena_mirrorlist + ".bak")
    lines = ""
    if state is True:
        with open(fn.athena_mirrorlist, "r", encoding="utf-8") as f:
            lines = f.readlines()
            f.close()
        try:
            # TODO enumerate
            for i in range(0, len(lines)):
                line = lines[i]
                if widget == "arco_mirror_seed":
                    mirror_on(
                        "Server = https://ant.seedhost.eu/arcolinux/$repo/$arch",
                        lines,
                        i,
                        line,
                    )
                if widget == "arco_mirror_gitlab":
                    mirror_on(
                        "Server = https://gitlab.com/arcolinux/$repo/-/raw/main/$arch",
                        lines,
                        i,
                        line,
                    )
                if widget == "arco_mirror_belnet":
                    mirror_on(
                        "Server = https://ftp.belnet.be/arcolinux/$repo/$arch",
                        lines,
                        i,
                        line,
                    )
                if widget == "arco_mirror_accum":
                    mirror_on(
                        "Server = https://mirror.accum.se/mirror/arcolinux.info/$repo/$arch",
                        lines,
                        i,
                        line,
                    )
                if widget == "arco_mirror_funami":
                    mirror_on(
                        "Server = https://mirror.funami.tech/arcolinux/$repo/$arch",
                        lines,
                        i,
                        line,
                    )
                if widget == "arco_mirror_jingk":
                    mirror_on(
                        "Server = https://mirror.jingk.ai/arcolinux/$repo/$arch",
                        lines,
                        i,
                        line,
                    )
                if widget == "arco_mirror_github":
                    mirror_on(
                        "Server = https://arcolinux.github.io/$repo/$arch",
                        lines,
                        i,
                        line,
                    )
                if widget == "arco_mirror_aarnet":
                    mirror_on(
                        "Server = https://mirror.aarnet.edu.au/pub/arcolinux/$repo/$arch",
                        lines,
                        i,
                        line,
                    )

                # if widget == "arch":
                #     pacman_on("[testing]", lines, i, line)
                # if widget == "multilib":
                #     pacman_on("[multilib-testing]", lines, i, line)
                # if widget == "community":
                #     pacman_on("[community-testing]", lines, i, line)

            with open(fn.athena_mirrorlist, "w", encoding="utf-8") as f:
                # lines = f.readlines()
                f.writelines(lines)
                f.close()
        except Exception as error:
            print(error)
            fn.messagebox(
                self,
                "ERROR!!",
                "An error has occurred setting this setting 'toggle_test_repos On'",
            )
    else:
        with open(fn.athena_mirrorlist, "r", encoding="utf-8") as f:
            lines = f.readlines()
            f.close()
        try:
            # TODO enumerate
            for i in range(0, len(lines)):
                line = lines[i]

                if widget == "arco_mirror_seed":
                    mirror_off(
                        "Server = https://ant.seedhost.eu/arcolinux/$repo/$arch",
                        lines,
                        i,
                        line,
                    )
                if widget == "arco_mirror_gitlab":
                    mirror_off(
                        "Server = https://gitlab.com/arcolinux/$repo/-/raw/main/$arch",
                        lines,
                        i,
                        line,
                    )
                if widget == "arco_mirror_belnet":
                    mirror_off(
                        "Server = https://ftp.belnet.be/arcolinux/$repo/$arch",
                        lines,
                        i,
                        line,
                    )
                if widget == "arco_mirror_accum":
                    mirror_off(
                        "Server = https://mirror.accum.se/mirror/arcolinux.info/$repo/$arch",
                        lines,
                        i,
                        line,
                    )
                if widget == "arco_mirror_funami":
                    mirror_off(
                        "Server = https://mirror.funami.tech/arcolinux/$repo/$arch",
                        lines,
                        i,
                        line,
                    )
                if widget == "arco_mirror_jingk":
                    mirror_off(
                        "Server = https://mirror.jingk.ai/arcolinux/$repo/$arch",
                        lines,
                        i,
                        line,
                    )
                if widget == "arco_mirror_github":
                    mirror_off(
                        "Server = https://arcolinux.github.io/$repo/$arch",
                        lines,
                        i,
                        line,
                    )
                if widget == "arco_mirror_aarnet":
                    mirror_off(
                        "Server = https://mirror.aarnet.edu.au/pub/arcolinux/$repo/$arch",
                        lines,
                        i,
                        line,
                    )

                # if widget == "arch":
                #     pacman_off("[testing]", lines, i, line)
                # if widget == "multilib":
                #     pacman_off("[multilib-testing]", lines, i, line)
                # if widget == "community":
                #     pacman_off("[community-testing]", lines, i, line)

            with open(fn.athena_mirrorlist, "w", encoding="utf-8") as f:
                f.writelines(lines)
                f.close()
        except:
            fn.messagebox(
                self,
                "ERROR!!",
                "An error has occurred setting this setting 'toggle_test_repos Off'",
            )
