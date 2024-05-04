import argparse
import base64, zlib
import os
import random
import subprocess

home = os.path.expandvars("$HOME")
keybind = "gsettings set org.gnome.settings-daemon.plugins.media-keys.custom-keybinding:/org/gnome/settings-daemon/plugins/media-keys/custom-keybindings/custom1/"

class colors:
    '''Colors class:reset all colors with colors.reset; two
    sub classes fg for foreground
    and bg for background; use as colors.subclass.colorname.
    i.e. colors.fg.red or colors.bg.greenalso, the generic bold, disable,
    underline, reverse, strike through,
    and invisible work with the main class i.e. colors.bold'''
    reset='\033[0m'
    bold='\033[01m'
    disable='\033[02m'
    underline='\033[04m'
    reverse='\033[07m'
    strikethrough='\033[09m'
    invisible='\033[08m'
    class fg:
        black='\033[30m'
        red='\033[31m'
        green='\033[32m'
        orange='\033[33m'
        blue='\033[34m'
        purple='\033[35m'
        cyan='\033[36m'
        lightgrey='\033[37m'
        darkgrey='\033[90m'
        lightred='\033[91m'
        lightgreen='\033[92m'
        yellow='\033[93m'
        lightblue='\033[94m'
        pink='\033[95m'
        lightcyan='\033[96m'
        random='\033['+random.choice(['0','33','92','93','94','96'])+'m'
    class bg:
        black='\033[40m'
        red='\033[41m'
        green='\033[42m'
        orange='\033[43m'
        blue='\033[44m'
        purple='\033[45m'
        cyan='\033[46m'
        lightgrey='\033[47m'

def arg_parse():
    parser = argparse.ArgumentParser(add_help=False)
    parser.add_argument("-b", "--browser", action='store_true', help="set the current browser logo in Red Team menu")
    parser.add_argument("-c", "--colored", action='store_true', help="let's give some random colored output")
    parser.add_argument("-e", "--emulator", choices=["alacritty", "cool-retro-term", "foot", "gnome-terminal", "kitty", "konsole", "terminator", "terminology", "urxvt", "xfce4-terminal", "xterm"], help="specify a terminal emulator to be set [alacritty|cool-retro-term|foot|gnome-terminal|kitty|konsole|terminator|terminology|urxvt|xfce4-terminal|xterm]")
    parser.add_argument("-h", "--help", action='store_true', help="show this help message and exit")
    parser.add_argument("-l", "--list", action='store_true', help="list all available Athena themes")
    parser.add_argument("-t", "--theme", choices=["AkameGaKill", "Cyborg", "Graphite", "HackTheBox", "SamuraiGirl", "SweetDark"], help="specify an Athena theme to be set [AkameGaKill|Cyborg|Graphite|HackTheBox|SamuraiGirl|SweetDark]")
    

    args = parser.parse_args()
    return args

def help():
   # Display Help
   print("Athena Theme Tweak\n")

   print("List of arguments:\n")
   
   print("-b, --browser                 set the current browser logo in Red Team menu")
   print("-c, --colored                 let's give some random colored output")
   print("-e, --emulator                specify a terminal emulator to be set [alacritty|cool-retro-term|foot|gnome-terminal|kitty|konsole|urxvt|xterm]")
   print("-h, --help                    show this help message and exit")
   print("-l, --list                    list all available Athena themes")
   print("-t, --theme <theme-name>      specify an Athena theme to be set [AkameGaKill|Cyborg|Graphite|HackTheBox|SamuraiGirl|SweetDark]")
   print("\n")
   print("Usage Examples:")
   print("athena-theme-tweak -l")
   print("athena-theme-tweak -e alacritty")
   print("athena-theme-tweak -t SamuraiGirl")
   print("athena-theme-tweak -b")

def print_banner():
    #cat banner.txt | gzip | base64
    encoded_data = "H4sIAAAAAAAAA7WWvY7rOAyF+zyF1d1KrgQBwmIJpAmgyq0AQ36RQM++51DyXyY/9myuMBPbMc3PJA+pdN3fX5fjptaG7L03xeRg/xLEluhuuobBpSimHEadiKTrggwg4D+55JxLScL3ITPmlkhI/Izl+5Cuy+k23BgGAMqRz0k7Dem6CAjKwgWOG+TbEFWYRMQAzuAGft4+Uk6oK+RcDARsDIXsvaThpjpw/xsC35BQKCalgh4hgxT9FNX01X2qyluIDYbevM1wG50v2aQhCVnEIJhBVWZ+C0EExYtINEWECfK+aCi6MnsfnFxNfwUJIZu2pBRBeyM1SL/kMlMKITkf6sYnEBtKKS3x8JQBSSmyCePC4H1BbPlIL/6EWEjItwU3YrKPGFpXMBKrINqCSXAPmFKOzK8HCBD6/qXq1GAMFo2j9kVrwuiGGFEfhnI6khYFu4EU9VLE6fAwKIpHVFRThMaisFf8oUG8g+SWKKSadVWGd5Spp5YBxNRKBqAbhMxQz0/hwCCaSmuDQL7uNkQlQ0pZEEFGvDKIZnONw74LaQPROMw+V1HnYERxBNshlB34z84hZROHNezR8Jy1QrKps8JoP0NWwLAYaHUXMRMhJR1ees9zSsZd1TPLVa0eWQskIIaSaxz0gyY02VBTQ910b9erbrwOHeOgLSps58pKUlUIXynKRtwLpAhCWcoh/LnQdai6Iq4Yt8prMkZw3jtnOkxmJJAjCI/RN/WuiK0kVojXNqYxZ5TRFwni5kDqLqU7O9IXhwE9aoQi43ATPpGlQnx5EN0CsVmHxQya041MD/NPlHXxx4R2Z+Lcyc3YalWeyHotfPCqKYO6ALJ+bYQS058py4Iq2D8Iy29kbFCq/ExeK6RoZ3C+oiOKtTXRDE/SJgRGxKkYmJhd6oO8GmSbSLJmqgQ8yFnOgoIUjE6SlNaaJM6EAKnufb5sx00vwh8aze5swW2ItqIuFBrT+fBP1U9bfEZHSvUcUwNoz5amv29AQhVc21x0XrXt9+Cm+Bli4Qnelu2wXuaif+E7EPXISu3zkjWO4yV5C5kZj95CPhPGewjHun06uu2JeryF2J8RbCkvNo6TkA/rDOPXkDOLjIlLj3hBPXu1pnW9N9xavjJo+B7nXTdOON6nOz+m9vx8WLyM9YCr/pnh5nJjOan/5ma24+M4v5DeTyMeUOtR7/BdYDTyJq7U16gvfZ8/7k8M18uN5diNPf/6eqv54uP47tIvpkrmWdLzFqJ6qE9OD/i9Ydpc7l60vnc/36q+9O4/3WVkMjSNPY5MKAvQj5qif+vVn5ower1P9aufhvft5dYSb6+VXV02GN5ikffYr7Jo508Pu/Vw643lC8+X/wAALQtT9hEAAA=="
    banner = zlib.decompress(base64.b64decode(encoded_data), 16 + zlib.MAX_WBITS).decode('utf-8')
    print(banner)

args = arg_parse()
#### Print help message if no arguments are supplied
flag_args = False

#Get all argument values. If you find a not False/None arg value, go out from the loop and continue.
for arg in vars(args):
    #print(arg, getattr(args, arg))
    if getattr(args, arg): #It is true if this value is different from False or None
        flag_args = True
        break

if not flag_args:
    help()
    exit()
###############

if args.colored:
    print(colors.fg.random)

if args.help:
    help()
    exit()

browser_map = {
    "Brave": "athena-brave-config",
    "Firefox ESR": "athena-firefox-config",
    "Mullvad": "athena-mullvad-config"
}

if args.browser:
    print("Detecting the primary installed browser...")
    for i in browser_map:
        current_browser_package = subprocess.getoutput("pacman -Qq "+browser_map[i])
        if not "error" in current_browser_package:
            print("The browser "+current_browser_package+" is installed.")
            break

    subprocess.call("dconf dump /org/gnome/shell/ > "+home+"/.tmp.txt", shell=True)
    
    if current_browser_package == "athena-firefox-config":
        subprocess.call("sed -i 's#{\\\\\"name\\\\\":\\\\\"Brave\\\\\",\\\\\"icon\\\\\":\\\\\"/usr/share/icons/hicolor/scalable/apps/brave.svg\\\\\",\\\\\"type\\\\\":\\\\\"Command\\\\\",\\\\\"data\\\\\":{\\\\\"command\\\\\":\\\\\"brave\\\\\"},\\\\\"angle\\\\\":-1}#{\\\\\"name\\\\\":\\\\\"Firefox ESR\\\\\",\\\\\"icon\\\\\":\\\\\"/usr/share/icons/hicolor/scalable/apps/firefox-logo.svg\\\\\",\\\\\"type\\\\\":\\\\\"Command\\\\\",\\\\\"data\\\\\":{\\\\\"command\\\\\":\\\\\"firefox-esr\\\\\"},\\\\\"angle\\\\\":-1}#g' "+home+"/.tmp.txt", shell=True)
        subprocess.call("sed -i 's#{\\\\\"name\\\\\":\\\\\"Mullvad\\\\\",\\\\\"icon\\\\\":\\\\\"/usr/share/icons/hicolor/scalable/apps/mullvad-browser.svg\\\\\",\\\\\"type\\\\\":\\\\\"Command\\\\\",\\\\\"data\\\\\":{\\\\\"command\\\\\":\\\\\"mullvad-browser\\\\\"},\\\\\"angle\\\\\":-1}#{\\\\\"name\\\\\":\\\\\"Firefox ESR\\\\\",\\\\\"icon\\\\\":\\\\\"/usr/share/icons/hicolor/scalable/apps/firefox-logo.svg\\\\\",\\\\\"type\\\\\":\\\\\"Command\\\\\",\\\\\"data\\\\\":{\\\\\"command\\\\\":\\\\\"firefox-esr\\\\\"},\\\\\"angle\\\\\":-1}#g' "+home+"/.tmp.txt", shell=True)
    elif current_browser_package == "athena-brave-config":
        subprocess.call("sed -i 's#{\\\\\"name\\\\\":\\\\\"Firefox ESR\\\\\",\\\\\"icon\\\\\":\\\\\"/usr/share/icons/hicolor/scalable/apps/firefox-logo.svg\\\\\",\\\\\"type\\\\\":\\\\\"Command\\\\\",\\\\\"data\\\\\":{\\\\\"command\\\\\":\\\\\"firefox-esr\\\\\"},\\\\\"angle\\\\\":-1}#{\\\\\"name\\\\\":\\\\\"Brave\\\\\",\\\\\"icon\\\\\":\\\\\"/usr/share/icons/hicolor/scalable/apps/brave.svg\\\\\",\\\\\"type\\\\\":\\\\\"Command\\\\\",\\\\\"data\\\\\":{\\\\\"command\\\\\":\\\\\"brave\\\\\"},\\\\\"angle\\\\\":-1}#g' "+home+"/.tmp.txt", shell=True)
        subprocess.call("sed -i 's#{\\\\\"name\\\\\":\\\\\"Mullvad\\\\\",\\\\\"icon\\\\\":\\\\\"/usr/share/icons/hicolor/scalable/apps/mullvad-browser.svg\\\\\",\\\\\"type\\\\\":\\\\\"Command\\\\\",\\\\\"data\\\\\":{\\\\\"command\\\\\":\\\\\"mullvad-browser\\\\\"},\\\\\"angle\\\\\":-1}#{\\\\\"name\\\\\":\\\\\"Brave\\\\\",\\\\\"icon\\\\\":\\\\\"/usr/share/icons/hicolor/scalable/apps/brave.svg\\\\\",\\\\\"type\\\\\":\\\\\"Command\\\\\",\\\\\"data\\\\\":{\\\\\"command\\\\\":\\\\\"brave\\\\\"},\\\\\"angle\\\\\":-1}#g' "+home+"/.tmp.txt", shell=True)
    elif current_browser_package == "athena-mullvad-config":
        subprocess.call("sed -i 's#{\\\\\"name\\\\\":\\\\\"Firefox ESR\\\\\",\\\\\"icon\\\\\":\\\\\"/usr/share/icons/hicolor/scalable/apps/firefox-logo.svg\\\\\",\\\\\"type\\\\\":\\\\\"Command\\\\\",\\\\\"data\\\\\":{\\\\\"command\\\\\":\\\\\"firefox-esr\\\\\"},\\\\\"angle\\\\\":-1}#{\\\\\"name\\\\\":\\\\\"Mullvad\\\\\",\\\\\"icon\\\\\":\\\\\"/usr/share/icons/hicolor/scalable/apps/mullvad-browser.svg\\\\\",\\\\\"type\\\\\":\\\\\"Command\\\\\",\\\\\"data\\\\\":{\\\\\"command\\\\\":\\\\\"mullvad-browser\\\\\"},\\\\\"angle\\\\\":-1}#g' "+home+"/.tmp.txt", shell=True)
        subprocess.call("sed -i 's#{\\\\\"name\\\\\":\\\\\"Brave\\\\\",\\\\\"icon\\\\\":\\\\\"/usr/share/icons/hicolor/scalable/apps/brave.svg\\\\\",\\\\\"type\\\\\":\\\\\"Command\\\\\",\\\\\"data\\\\\":{\\\\\"command\\\\\":\\\\\"brave\\\\\"},\\\\\"angle\\\\\":-1}#{\\\\\"name\\\\\":\\\\\"Mullvad\\\\\",\\\\\"icon\\\\\":\\\\\"/usr/share/icons/hicolor/scalable/apps/mullvad-browser.svg\\\\\",\\\\\"type\\\\\":\\\\\"Command\\\\\",\\\\\"data\\\\\":{\\\\\"command\\\\\":\\\\\"mullvad-browser\\\\\"},\\\\\"angle\\\\\":-1}#g' "+home+"/.tmp.txt", shell=True)
    
    subprocess.call("dconf load /org/gnome/shell/ < "+home+"/.tmp.txt", shell=True)
    subprocess.call("rm -rf "+home+"/.tmp.txt", shell=True)
    print("Done.")
    exit()

theme_map = {
    "AkameGaKill": "athena-akame-theme",
    "Cyborg": "athena-cyborg-theme",
    "Graphite": "athena-graphite-theme",
    "HackTheBox": "athena-htb-theme",
    "SamuraiGirl": "athena-samurai-theme",
    "SweetDark": "athena-sweetdark-theme"
}

if args.list:
    print("Theme List:")
    for i in theme_map:
        print(i)

if args.theme:
    chosen_theme=args.theme
    theme_package=theme_map[chosen_theme]
    
    print("Detecting the current installed theme...")
    for i in theme_map:
        current_theme_package = subprocess.getoutput("pacman -Qq "+theme_map[i])
        if not "error" in current_theme_package:
            print("The theme "+current_theme_package+" is installed.")
            break

    if current_theme_package != theme_package:
        print("Uninstalling the previous installed Athena theme: "+current_theme_package+"...")
        subprocess.call("sudo pacman -Rs --noconfirm "+current_theme_package, shell=True)
    
    subprocess.call("sudo pacman -S --noconfirm --overwrite \\* "+theme_package, shell=True)

    subprocess.run(["theme-switcher", chosen_theme], stderr=subprocess.DEVNULL)

    exit()

terminal_map = {
    "alacritty": "alacritty",
    "cool-retro-term": "cool-retro-term",
    "foot": "foot",
    "gnome-terminal": "gnome-terminal",
    "kitty": "kitty",
    "konsole": "konsole",
    "urxvt": "rxvt-unicode",
    "xterm": "xterm"
}

terminal_command = {
    "alacritty": "-e",
    "cool-retro-term": "-e",
    "foot": "-e",
    "gnome-terminal": "--",
    "kitty": "-e",
    "konsole": "-e",
    "urxvt": "-e",
    "xterm": "-e"
}

non_stf_terminal_array = ["terminator", "terminology", "xfce4-terminal"]

dconf_file = "/usr/share/athena-gnome-config/dconf-shell.ini"
check_file = os.path.isfile(dconf_file)

if args.emulator:
    chosen_emulator=args.emulator

    if check_file:
        subprocess.call("sudo cp -rf /usr/share/athena-gnome-config/dconf-shell.ini /usr/share/athena-gnome-config/dconf-shell.ini.bak", shell=True)
    
    for i in terminal_map:
        terminal_bin = i
        terminal_pkg = terminal_map[i]
        terminal_arg_cmd = terminal_command[i]
        
        if chosen_emulator == terminal_bin:
            terminal_check = subprocess.getoutput("command -v "+terminal_bin)
            if terminal_check:
                print("The package "+terminal_pkg+" is installed.")
            else:
                print("The package "+terminal_pkg+" is not installed. Installing...")
                subprocess.call("sudo pacman -S "+terminal_pkg, shell=True)
            subprocess.call(keybind + " command \""+terminal_bin+"\"", shell=True)
            subprocess.call("gsettings set org.gnome.desktop.default-applications.terminal exec "+terminal_bin, shell=True)

            subprocess.call("sudo sed -i -e 's/alacritty -e/"+terminal_bin+" "+terminal_arg_cmd+"/g' -e 's/cool-retro-term -e/"+terminal_bin+" "+terminal_arg_cmd+"/g' -e 's/foot -e/"+terminal_bin+" "+terminal_arg_cmd+"/g' -e 's/gnome-terminal --/"+terminal_bin+" "+terminal_arg_cmd+"/g' -e 's/kitty -e/"+terminal_bin+" "+terminal_arg_cmd+"/g' -e 's/konsole -e/"+terminal_bin+" "+terminal_arg_cmd+"/g' -e 's/urxvt -e/"+terminal_bin+" "+terminal_arg_cmd+"/g' -e 's/xterm -e/"+terminal_bin+" "+terminal_arg_cmd+"/g' /usr/bin/shell-rocket", shell=True)

            if check_file:
                subprocess.call("sudo sed -i -e 's/alacritty\\\\\"}/"+terminal_bin+"\\\\\"}/g' -e 's/cool-retro-term\\\\\"}/"+terminal_bin+"\\\\\"}/g' -e 's/foot\\\\\"}/"+terminal_bin+"\\\\\"}/g' -e 's/gnome-terminal\\\\\"}/"+terminal_bin+"\\\\\"}/g' -e 's/kitty\\\\\"}/"+terminal_bin+"\\\\\"}/g' -e 's/konsole\\\\\"}/"+terminal_bin+"\\\\\"}/g' -e 's/urxvt\\\\\"}/"+terminal_bin+"\\\\\"}/g' -e 's/xterm\\\\\"}/"+terminal_bin+"\\\\\"}/g' -e 's/terminator\\\\\"}/"+terminal_bin+"\\\\\"}/g' -e 's/terminology\\\\\"}/"+terminal_bin+"\\\\\"}/g' -e 's/xfce4-terminal\\\\\"}/"+terminal_bin+"\\\\\"}/g' /usr/share/athena-gnome-config/dconf-shell.ini", shell=True) #Used only for Terminal button in Red Team menu

            subprocess.call("sudo sed -i -e 's/alacritty/"+terminal_bin+"/g' -e 's/cool-retro-term/"+terminal_bin+"/g' -e 's/foot/"+terminal_bin+"/g' -e 's/gnome-terminal/"+terminal_bin+"/g' -e 's/kitty/"+terminal_bin+"/g' -e 's/konsole/"+terminal_bin+"/g' -e 's/urxvt/"+terminal_bin+"/g' -e 's/xterm/"+terminal_bin+"/g' -e 's/terminator/"+terminal_bin+"/g' -e 's/terminology/"+terminal_bin+"/g' -e 's/xfce4-terminal/"+terminal_bin+"/g' /usr/share/applications/shell.desktop", shell=True)            
        
    for i in non_stf_terminal_array:
        non_std_terminal_bin = i

        if chosen_emulator == non_std_terminal_bin:
            terminal_check = subprocess.getoutput("command -v "+non_std_terminal_bin)
            if terminal_check:
                print("The package "+non_std_terminal_bin+" is installed.")
            else:
                print("The package "+non_std_terminal_bin+" is not installed. Installing...")
                subprocess.call("sudo pacman -S "+non_std_terminal_bin, shell=True)

            subprocess.call("sudo sed -i -e 's/alacritty/"+non_std_terminal_bin+"/g' -e 's/cool-retro-term/"+non_std_terminal_bin+"/g' -e 's/foot/"+non_std_terminal_bin+"/g' -e 's/gnome-terminal/"+non_std_terminal_bin+"/g' -e 's/kitty/"+non_std_terminal_bin+"/g' -e 's/konsole/"+non_std_terminal_bin+"/g' -e 's/urxvt/"+non_std_terminal_bin+"/g' -e 's/xterm/"+non_std_terminal_bin+"/g' -e 's/terminator/"+non_std_terminal_bin+"/g' -e 's/terminology/"+non_std_terminal_bin+"/g' -e 's/xfce4-terminal/"+non_std_terminal_bin+"/g' /usr/share/applications/shell.desktop", shell=True)
            
            if check_file:
                subprocess.call("sudo sed -i -e 's/alacritty\\\\\"}/"+non_std_terminal_bin+"\\\\\"}/g' -e 's/cool-retro-term\\\\\"}/"+non_std_terminal_bin+"\\\\\"}/g' -e 's/foot\\\\\"}/"+non_std_terminal_bin+"\\\\\"}/g' -e 's/gnome-terminal\\\\\"}/"+non_std_terminal_bin+"\\\\\"}/g' -e 's/kitty\\\\\"}/"+non_std_terminal_bin+"\\\\\"}/g' -e 's/konsole\\\\\"}/"+non_std_terminal_bin+"\\\\\"}/g' -e 's/urxvt\\\\\"}/"+non_std_terminal_bin+"\\\\\"}/g' -e 's/xterm\\\\\"}/"+non_std_terminal_bin+"\\\\\"}/g' -e 's/terminator\\\\\"}/"+non_std_terminal_bin+"\\\\\"}/g' -e 's/terminology\\\\\"}/"+non_std_terminal_bin+"\\\\\"}/g' -e 's/xfce4-terminal\\\\\"}/"+non_std_terminal_bin+"\\\\\"}/g' /usr/share/athena-gnome-config/dconf-shell.ini", shell=True) #Used only for Terminal button in Red Team menu
    
    if check_file:
        subprocess.call("dconf load /org/gnome/shell/ < /usr/share/athena-gnome-config/dconf-shell.ini", shell=True)
