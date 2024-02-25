import json
import subprocess
import re
import requests # to get image from the web
import shutil # to save it locally
import os
import base64, zlib
import argparse
import pathlib

#### VARIABLE SETTING ####
input_config = os.path.expandvars("$HOME/.fly.txt")
output_config = os.path.expandvars("$HOME/.flyout.txt")
machine_config = os.path.expandvars("$HOME/.machine.json")
htb_config = os.path.expandvars("$HOME/.htb.conf")
Xdisplay = os.path.expandvars("$DISPLAY")
detect_virt = subprocess.getoutput("systemd-detect-virt")
fly_new = ""

class ParseDataArgs(argparse.Action):
    def __call__(self, parser, namespace, values, option_string=None):
        setattr(namespace, self.dest, dict())
        d = dict(x.split("=") for x in values.split("&"))
        for key, value in d.items():
            getattr(namespace, self.dest)[key] = value

def print_banner():
    #cat banner.txt | gzip | base64
    # In Python, the Base64 encoded string must come from an echo -ne. Without -e argument, the color patterns are not expanded.
    encoded_data = "H4sIAAAAAAAAA+1ayw4CIQy8+wteuGgMIWC8GT/Fb9j/v7ruJgor1aLAToVeHBOj05lueVil8saG97Ht9Xg5n4bD+DpwsPPf5OFhUjnUxL/lRyrXGjbfSYhAncJ2DLjSdUkaWwTKIX3rBQIj0n2OxnCPvLGRwKO5FNcXFoEfB6uY1I/Aaxw2IjcCMbJGPsbdAegUQrkh2t1nVZ+hEQjjSZicAUdrBKLtWZPTSriOL8dyh93GfWzmZSdYhhB4peIyHadMeRhZLdI744gpDT3zzXZQKFoIMHsTDha0MHg9TU4hiGoNNfFimRLmqEW8tvCxjmwB5Wlc7Okhdspdoa5QV6gr1BVqU6HVDkSxLCX/Trryu7VocHB1axTescyZ0LAp4PbAup5LCOlS2J93ePlbGPpyQpX2DvrSazmnEh9NQWBKYVumvCzemJbbR6yhZ4ngWuU/YU2p/n78r2lPYiNETN2mQMgheB7J4bOEpNhVYZhfdgPFVDw7WCsAAA=="
    banner = zlib.decompress(base64.b64decode(encoded_data), 16 + zlib.MAX_WBITS).decode('utf-8')
    print(f"{banner}")

def help():
   # Display Help
   print_banner()
   print("HTB Update helps you to connect your machine to the Hack The Box platform.\n")

   print("List of arguments:\n")
   
   print("-d, --delete                 delete the Hack The Box API Token from the keyring")
   print("-h, --help                   show this help message and exit")
   print("-p, --prompt <true|false>    set if the shell prompt should be changed")
   print("-r, --reset                  reset the Hack The Box API Token")

def arg_parse():
    parser = argparse.ArgumentParser(add_help=False)
    parser.add_argument("-d", "--delete", action='store_true', help="delete the Hack The Box API Token from the key vault")
    parser.add_argument("-h", "--help", action='store_true', help="show this help message and exit")
    parser.add_argument("-p", "--prompt", choices=["true", "false"], help="set if the shell prompt should be changed")
    parser.add_argument("-r", "--reset", action='store_true', help="reset the Hack The Box API Token")

    args = parser.parse_args()
    return args

def htb_machines_to_flypie(data,param):
    fly_new = ""

    for machine in data[param]:
        machine_name=machine["name"]
        machine_avatar=machine["avatar"]

        avatar_url = "https://www.hackthebox.com"+machine_avatar
        avatar_filename = os.path.expandvars("$HOME/.local/share/icons/hackthebox/avatar/"+machine_name+".png")

        shell=os.path.expandvars('$SHELL')

        machine_command = 'gnome-terminal -- /usr/bin/bash -c \\\\\\\\\\\"htb-spawn '+machine_name+';'+shell+'\\\\\\\\\\\"'

        # Open the url image, set stream to True, this will return the stream content.
        r = requests.get(avatar_url, stream = True)

        # Check if the image was retrieved successfully
        if r.status_code == 200:
            # Set decode_content value to True, otherwise the downloaded image file's size will be zero.
            r.raw.decode_content = True

            # Open a local file with wb ( write binary ) permission.
            with open(avatar_filename,'wb') as f:
                shutil.copyfileobj(r.raw, f)

            #print('Image successfully Downloaded: ',avatar_filename)
            subprocess.call("convert "+avatar_filename+" -resize 200x "+avatar_filename,shell=True)
        else:
            print('Image Couldn\'t be retreived')


        fly_object = '{\\"name\\":\\"'+machine_name+'\\",\\"icon\\":\\"'+avatar_filename+'\\",\\"type\\":\\"Command\\",\\"data\\":{\\"command\\":\\"'+machine_command+'\\"},\\"angle\\":-1},'
        fly_new = fly_new + fly_object

    fly_new = "[" + fly_new[:-1] + "]"
    return fly_new

args = arg_parse()

if args.help:
    help()
    exit()

if args.delete:
    print("Deleting the stored Hack The Box API Key...")
    if ("docker" in detect_virt or "podman" in detect_virt) and not Xdisplay:
        print("You are in a container. For deleting the API token on the host machine, run: [docker|podman] secret rm htb-api")
    else:
        subprocess.call("secret-tool clear htb-api user-htb-api",shell=True)
        print("Hack The Box API Key successfully deleted.")
    exit()

if ("docker" in detect_virt or "podman" in detect_virt) and not Xdisplay:
    with open('/run/secrets/htb-api') as f:
        appkey = f.read().replace('\n','')
else:
    appkey = subprocess.getoutput("secret-tool lookup htb-api user-htb-api")

file = pathlib.Path(htb_config)
if not file.exists ():
    # Creating HTB config file
    with open(htb_config, "w") as file:
        lines = ["# HTB configuration file.\n\n", "# Enable/Disable shell prompt change\n", "prompt_change=false" ]
        file.writelines(lines)
        file.close()

if (detect_virt == "wsl" and Xdisplay == ":0"):
    subprocess.call("source /etc/X11/xinit/xinitrc.d/50-systemd-user.sh 2> /dev/null",shell=True)

if args.reset:
    print("Resetting the Hack The Box API Key...")
    if ("docker" in detect_virt or "podman" in detect_virt) and not Xdisplay:
        print("You are in a container. For resetting the API token on the host machine, run: [docker|podman] secret rm htb-api; [docker|podman] secret create htb-api htb-api-file")
        exit()
    else:
        subprocess.call("secret-tool clear htb-api user-htb-api",shell=True)
        print("Please, insert your App Token after the 'Password' label, it will be stored in a secure keyring.")
        subprocess.call("secret-tool store --label='HTB API key' htb-api user-htb-api",shell=True)
        appkey = subprocess.getoutput("secret-tool lookup htb-api user-htb-api")

if args.prompt == "false":
    print("Shell prompt change disabled.")
    subprocess.call("sed -i 's/prompt_change=.*/prompt_change=false/g' "+htb_config,shell=True)
elif args.prompt == "true":
    subprocess.call("sed -i 's/prompt_change=.*/prompt_change=true/g' "+htb_config,shell=True)

if not appkey:
    if ("docker" in detect_virt or "podman" in detect_virt) and not Xdisplay:
        print("API token not set. On the host machine, store the HTB API token in the htb-api-file and run: [docker|podman] secret create htb-api htb-api-file")
        exit()
    else:
        print("Hack The Box API Key not set. Please, insert your App Token after the 'Password' label, it will be stored in a secure keyring.")
        subprocess.call("secret-tool store --label='HTB API key' htb-api user-htb-api",shell=True)
        appkey = subprocess.getoutput("secret-tool lookup htb-api user-htb-api")

# Use htb_user only for checking the validity of the HTB APP TOKEN
htb_user=subprocess.getoutput("curl -s --location --request GET https://www.hackthebox.com/api/v4/user/info -H \"Authorization: Bearer "+appkey+"\" | jq '.info.name'")
htb_user=htb_user.replace('"','')

if "parse error: Invalid numeric literal" in htb_user or not htb_user: # htb_user could be empty if appkey has a \n at the end of APP Token
    if ("docker" in detect_virt or "podman" in detect_virt) and not Xdisplay:
        print("Error. Maybe your API key is incorrect or expired. Renew your API key, store it in the htb-api-file and, on the host machine, run: [docker|podman] secret create htb-api htb-api-file")
        exit()
    else:
        print("Error. Maybe your API key is incorrect or expired. Renew your API key and rerun 'htb-update', or insert the new API key in the 'Password' field.")
        subprocess.call("secret-tool store --label='HTB API key' htb-api user-htb-api",shell=True)
        appkey = subprocess.getoutput("secret-tool lookup htb-api user-htb-api")

htb_user=subprocess.getoutput("curl -s --location --request GET https://www.hackthebox.com/api/v4/user/info -H \"Authorization: Bearer "+appkey+"\" | jq '.info.name'")
htb_user=htb_user.replace('"','')

if "parse error: Invalid numeric literal" in htb_user:
    if ("docker" in detect_virt or "podman" in detect_virt) and not Xdisplay:
        print("Error. Maybe your API key is incorrect or expired. Renew your API key, store it in the htb-api-file and, on the host machine, run: [docker|podman] secret create htb-api htb-api-file")
        exit()
    else:
        print("Error. Maybe your API key is incorrect or expired. Renew your API key and rerun 'htb-update', or insert the new API key in the 'Password' field. Closing...")
        exit()

subprocess.call("mkdir -p $HOME/.local/share/icons/hackthebox/avatar",shell=True)

############ Retrieving the list of available machines and generate a flypie string of objects ############
print("Retrieving updated data from Hack The Box... Gimme some time hackerzzz...")

subprocess.call("curl -s --location --request GET https://www.hackthebox.com/api/v4/machine/list -H \"Authorization: Bearer "+appkey+"\" | jq > "+machine_config,shell=True)

with open(machine_config) as json_file:
    data = json.load(json_file)

subprocess.call("rm -rf "+machine_config,shell=True)

param = "info"
fly_new = htb_machines_to_flypie(data,param)

subprocess.call("dconf dump /org/gnome/shell/extensions/flypie/ > "+input_config,shell=True)
with open(input_config,'r') as fly_file:
    contents = fly_file.read()
subprocess.call("rm -rf "+input_config,shell=True)

#NOTE: if you change the icon of Available Machine, REMEMBER to change the path here below
fly_out = re.sub(r'(?<=\{\\"name\\":\\"Available Machines\\",\\"icon\\":\\"\/usr\/share\/icons\/htb-tools\/htb-machines.png\\",\\"type\\":\\"CustomMenu\\",\\"children\\":)(.*?)(?=,\\"angle\\":-1,\\"data\\":\{\}\})', fly_new, contents)

with open(output_config, 'w') as f:
    f.write(fly_out)

subprocess.call("dconf load /org/gnome/shell/extensions/flypie/ < "+output_config,shell=True)
subprocess.call("rm -rf "+output_config,shell=True)

############ Retrieving the list of Tier 0 starting point machines and generate a flypie string of objects but first, query APIs ############

subprocess.call("curl -s --location --request GET https://www.hackthebox.com/api/v4/sp/tier/1 -H \"Authorization: Bearer "+appkey+"\" | jq '.data' > "+machine_config,shell=True)

with open(machine_config) as json_file:
    data = json.load(json_file)

subprocess.call("rm -rf "+machine_config,shell=True)

param = "machines"
fly_new = htb_machines_to_flypie(data,param)

subprocess.call("dconf dump /org/gnome/shell/extensions/flypie/ > "+input_config,shell=True)
with open(input_config,'r') as fly_file:
    contents = fly_file.read()
subprocess.call("rm -rf "+input_config,shell=True)

#NOTE: if you change the icon of Tier-0, REMEMBER to change the path here below
fly_out = re.sub(r'(?<=\{\\"name\\":\\"Tier 0\\",\\"icon\\":\\"\/usr\/share\/icons\/htb-tools\/Tier-0.svg\\",\\"type\\":\\"CustomMenu\\",\\"children\\":)(.*?)(?=,\\"angle\\":-1,\\"data\\":\{\}\})', fly_new, contents)

with open(output_config, 'w') as f:
    f.write(fly_out)

subprocess.call("dconf load /org/gnome/shell/extensions/flypie/ < "+output_config,shell=True)
subprocess.call("rm -rf "+output_config,shell=True)

############ Retrieving the list of Tier 1 starting point machines and generate a flypie string of objects but first, query APIs ############

subprocess.call("curl -s --location --request GET https://www.hackthebox.com/api/v4/sp/tier/2 -H \"Authorization: Bearer "+appkey+"\" | jq '.data' > "+machine_config,shell=True)

with open(machine_config) as json_file:
    data = json.load(json_file)

subprocess.call("rm -rf "+machine_config,shell=True)

param = "machines"
fly_new = htb_machines_to_flypie(data,param)

subprocess.call("dconf dump /org/gnome/shell/extensions/flypie/ > "+input_config,shell=True)
with open(input_config,'r') as fly_file:
    contents = fly_file.read()
subprocess.call("rm -rf "+input_config,shell=True)

#NOTE: if you change the icon of Tier-1, REMEMBER to change the path here below
fly_out = re.sub(r'(?<=\{\\"name\\":\\"Tier 1\\",\\"icon\\":\\"\/usr\/share\/icons\/htb-tools\/Tier-1.svg\\",\\"type\\":\\"CustomMenu\\",\\"children\\":)(.*?)(?=,\\"angle\\":-1,\\"data\\":\{\}\})', fly_new, contents)

with open(output_config, 'w') as f:
    f.write(fly_out)

subprocess.call("dconf load /org/gnome/shell/extensions/flypie/ < "+output_config,shell=True)
subprocess.call("rm -rf "+output_config,shell=True)

############ Retrieving the list of Tier 2 starting point machines and generate a flypie string of objects but first, query APIs ############

subprocess.call("curl -s --location --request GET https://www.hackthebox.com/api/v4/sp/tier/3 -H \"Authorization: Bearer "+appkey+"\" | jq '.data' > "+machine_config,shell=True)

with open(machine_config) as json_file:
    data = json.load(json_file)

subprocess.call("rm -rf "+machine_config,shell=True)

param = "machines"
fly_new = htb_machines_to_flypie(data,param)

subprocess.call("dconf dump /org/gnome/shell/extensions/flypie/ > "+input_config,shell=True)
with open(input_config,'r') as fly_file:
    contents = fly_file.read()
subprocess.call("rm -rf "+input_config,shell=True)

#NOTE: if you change the icon of Tier-2, REMEMBER to change the path here below
fly_out = re.sub(r'(?<=\{\\"name\\":\\"Tier 2\\",\\"icon\\":\\"\/usr\/share\/icons\/htb-tools\/Tier-2.svg\\",\\"type\\":\\"CustomMenu\\",\\"children\\":)(.*?)(?=,\\"angle\\":-1,\\"data\\":\{\}\})', fly_new, contents)

with open(output_config, 'w') as f:
    f.write(fly_out)

subprocess.call("dconf load /org/gnome/shell/extensions/flypie/ < "+output_config,shell=True)
subprocess.call("rm -rf "+output_config,shell=True)

input("Done. Press Enter to continue...")
