#!/usr/bin/env bash
#
#  Copyright (c) 2022: Jacob.Lundqvist@gmail.com
#  License: MIT
#
#  Part of https://github.com/jaclu/tmux-mouse-swipe
#
#  Version: 1.0.2 2022-04-14
#
#  Does shellcheck on all relevant scripts in this project
#

#  shellcheck disable=SC1007
CURRENT_DIR=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)

cd "$CURRENT_DIR" || return


checkables=(

    #  Obviously self exam should be done :)
    shellchecker.sh

    mouse-swipe.tmux

    scripts/*.sh
)

for script in "${checkables[@]}"; do
    # abort as soon as one gives warnings
    echo "Checking: $script"
    shellcheck -x "$script" || exit 1

done
