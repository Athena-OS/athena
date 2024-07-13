#!/bin/sh
#
# Description:	Utility shell file to migrate old genmon .rc configuration files
#               to xfconf database entries
#
# Notes: 		This experiemental script has two options: one to show the old rc
#				settings and display the commands that need to be run to migrate to
#				xfconf (NOTE: xfce4-panel must not be running if migrating manually),
#				and one to auto-migrate the settings 
#
# Script options:
#   show - will show the existing rc entries and the xfconf-query commands that will
#           need to be run
#   doit - will migrte the rc config files to xfconf database entries
#
# Additional Notes:
# config files located at ~/.config/xfce4/panel/genmon-*.rc
# xfconf keys:
#   - /plugins/plugin-x/command = Command (String)
#   - /plugins/plugin-x/enable-single-row = EnableSingleRow (Boolean)
#   - /plugins/plugin-x/font = Font (String)
#   - /plugins/plugin-x/text = Text (String)
#   - /plugins/plugin-x/update-period = UpdatePeriod (Integer)
#   - /plugins/plugin-x/use-label = UseLabel (Boolean)

# check for arguments and display usage if required
if [ $# -lt 1 ]; then
    echo "Usage: $0 [option]"
    echo "Options:"
    echo "   show - show the existing rc values and the xfconf-query commands"
    echo "   doit - update the xfconf database with the old rc values"
    exit 1
fi

# location of existing genmon rc files
RCLOCATION="$HOME/.config/xfce4/panel"

# loop through each genmon instance
for f in $(ls $RCLOCATION/genmon*.rc)
do
    # get settings
    ID=$(echo ${f%.*} | sed 's/.*-//')
    echo "Processing genmon ID $ID"
    COMMAND=$(grep Command $f | awk -F'=' '{print $2}')
    ENABLESINGLEROW=$(grep EnableSingleRow $f | awk -F'=' '{print $2}')
    FONT=$(grep Font $f | awk -F'=' '{print $2}')
    TEXT=$(grep Text $f | awk -F'=' '{print $2}')
    UPDATEPERIOD=$(grep UpdatePeriod $f | awk -F'=' '{print $2}')
    USELABEL=$(grep UseLabel $f | awk -F'=' '{print $2}')

    # additional int to bool processing
    [[ $ENABLESINGLEROW = "0" ]] && ENABLESINGLEROW=false || ENABLESINGLEROW=true
    [[ $USELABEL = "0" ]] && USELABEL=false || USELABEL=true

    # show output if "show" paramater used
    if [ "$1" == "show" ]; then
        echo
        echo $f
        echo -e "   ID=\t\t$ID"
        echo -e "   COMMAND=\t$COMMAND"
        echo -e "   SINGLEROW=\t$ENABLESINGLEROW"
        echo -e "   FONT=\t$FONT"
        echo -e "   TEXT=\t$TEXT"
        echo -e "   UPDATEPERIOD=$UPDATEPERIOD"
        echo -e "   USELABEL=\t$USELABEL"
        echo
        echo "COMMANDS TO BE RUN:"
        echo "xfconf-query -c xfce4-panel -p /plugins/plugin-$ID/command -t string -s \"$COMMAND\" --create"
        echo "xfconf-query -c xfce4-panel -p /plugins/plugin-$ID/enable-single-row -t bool -s $ENABLESINGLEROW --create"
        echo "xfconf-query -c xfce4-panel -p /plugins/plugin-$ID/font -t string -s \"$FONT\" --create"
        echo "xfconf-query -c xfce4-panel -p /plugins/plugin-$ID/text -t string -s \"$TEXT\" --create"
        echo "xfconf-query -c xfce4-panel -p /plugins/plugin-$ID/update-period -t int -s $UPDATEPERIOD --create"
        echo "xfconf-query -c xfce4-panel -p /plugins/plugin-$ID/use-label -t bool -s $USELABEL --create"
    fi

    # do the migration if the "doit" parameter is used
    if [ "$1" == "doit" ]; then
        # if panel is running, quit it
		[[ $(pgrep xfce4-panel) ]] && xfce4-panel -q
        echo -n "...updating xfconf database for genmon-$ID..."
        xfconf-query -c xfce4-panel -p /plugins/plugin-$ID/command -t string -s "$COMMAND" --create
		sleep .25
        xfconf-query -c xfce4-panel -p /plugins/plugin-$ID/enable-single-row -t bool -s $ENABLESINGLEROW --create
		sleep .25
        xfconf-query -c xfce4-panel -p /plugins/plugin-$ID/font -t string -s "$FONT" --create
		sleep .25
        xfconf-query -c xfce4-panel -p /plugins/plugin-$ID/text -t string -s "$TEXT" --create
		sleep .25
        xfconf-query -c xfce4-panel -p /plugins/plugin-$ID/update-period -t int -s $UPDATEPERIOD --create
		sleep .25
        xfconf-query -c xfce4-panel -p /plugins/plugin-$ID/use-label -t bool -s $USELABEL --create
        echo "updated genmon-$ID"
        echo
    fi
done

# if panel is not running, start it
[[ $(pgrep xfce4-panel) ]] || xfce4-panel &

exit 0


