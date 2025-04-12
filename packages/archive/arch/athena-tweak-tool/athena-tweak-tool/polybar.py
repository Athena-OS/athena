# #============================================================
# # Authors: Brad Heffernan - Erik Dubois - Cameron Percival
# #============================================================

# from Functions import home, polybar, config_dir, os, show_in_app_notification, shutil

# launch = home + "/.config/polybar/launch.sh"
# images = config_dir


# def import_config(self, config, new_image):
#     if len(config) > 1:

#         try:
#             name = os.path.basename(config)
#             if "config" not in name:
#                 name = "config_" + name

#             shutil.copy(config, polybar + name)
#             if len(new_image) > 1:
#                 shutil.copy(new_image, config_dir + "/images/" + os.path.basename(config) + ".jpg")
#         except:
#             pass

#         self.pbtextbox1.set_text("")
#         self.pbtextbox2.set_text("")
#         # self.frame2.hide()
#         pop_bar(self, imported=True, impname=name)


# def pop_bar(self, *args, **kwargs):
#     active = 0
#     name = ""
#     self.pbcombo.get_model().clear()
#     if os.path.isfile(launch):
#         with open(launch, "r", encoding="utf-8") as f:
#             lines = f.readlines()
#             f.close()

#         for j in range(len(lines)):
#             if "MONITOR=$m" in lines[j]:
#                 nline = lines[j].split(" ")
#                 for i in range(len(nline)):
#                     if "polybar/" in nline[i]:
#                         name = os.path.basename(nline[i])
#                         break
#     else:
#         self.pblabel4.set_markup("<span foreground=\"orange\">launch.sh <b>NOT</b> found!</span>")

#     if kwargs.get('imported', None) is not None:
#         name = kwargs.get('impname', None)

#     if os.path.isdir(home + "/.config/polybar"):
#         items = os.listdir(home + "/.config/polybar")
#         for i in range(len(items)):
#             if "config" in items[i]:
#                 if name.strip() == items[i].strip():
#                     active = i
#                 self.pbcombo.append_text(items[i])
#     self.pbcombo.set_active(active)


# def set_config(self, config, state):

#     lists = ["herbstluftwm)", "openbox)", "xmonad)", "i3)", "bspwm)"]

#     if os.path.isfile(launch):
#         with open(launch, "r", encoding="utf-8") as f:
#             lines = f.readlines()
#             f.close()
#         try:
#             for j in range(len(lines)):

#                 for wm in lists:
#                     if wm in lines[j]:
#                         if state:
#                             if "polybar " in lines[j + 3]:
#                                 nline3 = lines[j + 3].split(" ")
#                                 for i in range(len(nline3)):
#                                     if "/polybar/" in nline3[i]:
#                                         lines[j + 3] = lines[j + 3].replace("~/.config/polybar/" + os.path.basename(nline3[i]), "~/.config/polybar/" + config)
#                             if "polybar " in lines[j + 6]:
#                                 nline6 = lines[j + 6].split(" ")
#                                 for i in range(len(nline6)):
#                                     if "/polybar/" in nline6[i]:
#                                         lines[j + 6] = lines[j + 6].replace("~/.config/polybar/" + os.path.basename(nline6[i]), "~/.config/polybar/" + config)
#                         else:
#                             if "polybar " in lines[j + 11]:
#                                 nline3 = lines[j + 11].split(" ")
#                                 for i in range(len(nline3)):
#                                     if "/polybar/" in nline3[i]:
#                                         lines[j + 11] = lines[j + 11].replace("~/.config/polybar/" + os.path.basename(nline3[i]), "~/.config/polybar/" + config)
#                             if "polybar " in lines[j + 14]:
#                                 nline6 = lines[j + 14].split(" ")
#                                 for i in range(len(nline6)):
#                                     if "/polybar/" in nline6[i]:
#                                         lines[j + 14] = lines[j + 14].replace("~/.config/polybar/" + os.path.basename(nline6[i]), "~/.config/polybar/" + config)

#             with open(launch, "w") as f:
#                 f.writelines(lines)
#                 f.close()

#             # show_in_app_notification(self, "Config Applied Successfully")
#             # messagebox(self, "Success!!", "Config Applied Successfully")
#         except Exception as e:
#             print(e)
