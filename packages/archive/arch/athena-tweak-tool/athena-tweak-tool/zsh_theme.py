# ============================================================
# Authors: Brad Heffernan - Erik Dubois - Cameron Percival
# ============================================================

import functions as fn


def get_themes(combo):
    """get themes"""
    if fn.check_package_installed("oh-my-zsh-git"):
        try:
            # lists = [x for x in fn.listdir("/usr/share/oh-my-zsh/themes")]
            lists = list(fn.listdir("/usr/share/oh-my-zsh/themes"))
            lists_sorted = sorted(lists)
            with open(fn.zsh_config, "r", encoding="utf-8", errors="ignore") as f:
                theme_list = f.readlines()
                f.close()
            pos = fn.get_position(theme_list, "ZSH_THEME=")
            # stripping whitespace, and quotation marks
            name = theme_list[pos].split("=")[1].strip().strip('"')
            active = 0
            combo.append_text("random")
            # TODO:enumerate
            for x in range(len(lists_sorted)):
                if name in lists_sorted[x].replace(".zsh-theme", ""):
                    active = x + 1  # remember; arrays start at ZERO
                combo.append_text(lists_sorted[x].split(".")[0].strip())
            combo.set_active(active)
        except OSError:
            print(
                "ATT was unable to locate your ~/.zshrc file. We have placed a working\
                ~/.zshrc in your base home directory (~/.zshrc)"
            )
            print("You may need to reload ATT to set the options in the zsh tab")
        except Exception as error:
            print(error)


def set_config(self, theme):
    """set configuration"""
    try:
        with open(fn.zsh_config, "r", encoding="utf-8") as f:
            theme_list = f.readlines()
            f.close()

        pos = fn.get_position(theme_list, "ZSH_THEME=")

        theme_list[pos] = 'ZSH_THEME="' + theme + '"\n'

        with open(fn.zsh_config, "w", encoding="utf-8") as f:
            f.writelines(theme_list)
            f.close()

        fn.show_in_app_notification(self, "Settings Saved Successfully")

    except Exception as error:
        print(error)
        fn.messagebox(self, "Error!!", "Something went wrong setting this theme.")
