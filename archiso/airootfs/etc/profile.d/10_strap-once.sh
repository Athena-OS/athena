#!/bin/sh

if [ "$(whoami)" != "liveuser" ]; then
   /usr/local/bin/strap.sh   
fi
