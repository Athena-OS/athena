#!/usr/bin/bash

LOCAL_CONFIG="${HOME}/.config/metasploitavevasion"

[[ -d "$LOCAL_CONFIG" ]] || install -d "$LOCAL_CONFIG"
cd "$LOCAL_CONFIG" && avoid.sh
echo -e "Script complete, press <enter> to exit"; read
