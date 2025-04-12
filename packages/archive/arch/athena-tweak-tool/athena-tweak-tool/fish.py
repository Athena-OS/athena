# ============================================================
# Authors: Brad Heffernan - Erik Dubois - Cameron Percival
# ============================================================

# import os
# import Functions as fn

# This function has one job, and one job only; ensure that check boxes match
# what is passed to it, based on the logic from the calling function
# def set_util_state(self, util, util_state):
#     if util == "fish":
#         self.fish.set_state(util_state)
#     elif util == "oh-my-fish":
#         self.ohmyfish.set_state(util_state)
#     else:
#         print("You should not be here. Something has been input incorrectly.")

# def get_util_state(self, util):
#     if util == "fish":
#         return self.fish.get_active()
#     elif util == "oh-my-fish":
#         return self.ohmyfish.get_active()
#     else:
#         print("Get Util State error. Something has been input incorrectly.")
#         return False

# def install_util(util):
#     command = ""
#     if util == "fish":
#         command = 'pacman -S fish --noconfirm --needed'
#     elif util == "oh-my-fish":
#         command = 'pacman -S fish --noconfirm --needed'
#     else:
#         pass

#     #This is just protection to avoid unneeded errors.
#     if len(command)>0:
#         fn.subprocess.call(command.split(" "),
#                         shell=False,
#                         stdout=fn.subprocess.PIPE,
#                         stderr=fn.subprocess.STDOUT)

# def _get_position(lists, value):
#     data = []
#     #Because we don't know EXACTLY how the app will process the rc file
#     #we need to account for every variation.
#     suffixes = [" | lolcat", "\n", " | lolcat\n"] #
#     prefix = "#"

#     for string in lists:
#         for item in suffixes:
#             if string == value+item or string == prefix+value+item\
#                 or string == value or string == prefix+value:
#                 data.append(string)

#     if len(data)>0:
#         position = lists.index(data[0])
#         return position
#     else:
#         return -1

# def write_configs(utility, util_str):
#     config = ""
#     try:
#         config = get_config_file()
#     except:
#         config = ""

#     if config != "":
#         with open(config, "r", encoding="utf-8") as f:
#             lines = f.readlines()
#             f.close()
#             try:
#                 pos = _get_position(lines, utility)
#                 if pos >= 0:
#                     lines[pos] = util_str + "\n"
#                 else:
#                     lines.append(util_str + "\n")
#             #this will cover use cases where the util is not in the rc files
#             except:
#                 lines.append("\n"+util_str)
#         with open(config, "w", encoding="utf-8") as f:
#             f.writelines(lines)
#             f.close()

# We only read the bashrc here,as this is used to turn on/off the lolcat option.
# Assumption; both .bashrc and .zshrc are set identically.
# def get_term_rc(value):
#     config_file = ""
#     pos = -1 #Essentially, if this doesn't update, we will return False
#     try:
#         config_file = get_config_file()
#     except:
#         config = ""
#     if config_file != "":
#         with open(config_file, "r", encoding="utf-8") as myfile:
#             lines = myfile.readlines()
#             myfile.close()
#             pos = _get_position(lines, value)

#     if pos > 0 and lines[pos].startswith("#"):
#         return False
#     elif pos >= 0:
#         return True
#     else:
#         return False

# def get_config_file():
#     #At the moment, this will only work for bash and zsh.
#     #Can be updated easily for fish/other shells. Update the fn.get_shell()
#     #function, and add a config file in fn.py
#     if fn.get_shell() == "bash":
#         return fn.bash_config
#     elif fn.get_shell() == "zsh":
#         return fn.zsh_config
