#
# ~/.bash_profile
#
# xinit <session> will look for ~/.xinitrc content
if [ -z "$DISPLAY" ] && [ "$XDG_VTNR" -eq 1 ]; then
  startx ~/.xinitrc xfce4 &>/dev/null
fi
