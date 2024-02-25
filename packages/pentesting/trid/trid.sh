#!/usr/bin/env bash

function _help(){
    echo -e "\nTrID: File Identifier\n"
    echo -e "USAGE:\n    trid [OPTIONS] [file]\n"
    echo "OPTIONS:"
    echo -e "    trid -ae\n\tadd the guessed extensions to the filenames"
    echo -e "    trid -ce\n\tchange the current extension to the guessed one"
    echo -e "    trid -r:nn\n\treplace 'nn' with the maximum number of matches to show"
    echo -e "    trid -d:custom.trd\n\treplace 'custom.trd' with a definitions DB to use"
    echo -e "    trid -v\n\tactivate verbose mode\n"
    exit 0
}

[[ -n "$1" ]] && [[ "$1" = "--help" ]] && _help

/usr/share/trid/trid "$@"
