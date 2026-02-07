function fish_prompt
    set -l last_status $status
    set -l ip (ip -4 addr | grep -v '127.0.0.1' | grep -v 'secondary' | grep -oP '(?<=inet\s)\d+(\.\d+){3}' | sed -z 's/\n/|/g;s/|\$/\n/' | rev | cut -c 2- | rev)
    set -l user (whoami)
    set -l host (prompt_hostname)
    set -l path (pwd)
    set -l branch
    set -l hq_prefix
    set -l flame
    set -l robot

    if type -q git
        set branch (git symbolic-ref --short HEAD 2>/dev/null)
    end

    set -l use_emoji 1
    if string match -q '/dev/tty*' (tty)
        set use_emoji 0
    end

    # Emojis only if not in TTY
    if test $use_emoji -eq 1
        set hq_prefix "HQ🚀🌐"
        set flame "🔥"
        set robot "[👾]"
    else
        set hq_prefix "HQ─"
        set flame ""
        set robot "[>]"
    end

    # First line
    set_color 00ff00
    echo -n "╭─[$hq_prefix"
    set_color red
    echo -n "$ip"
    set_color 00ff00
    echo -n "$flame]─("

    if test $last_status -eq 0
        set_color blue
    else
        set_color red
    end
    echo -n "$user@$host"
    set_color 00ff00
    echo -n ")"

    if test -n "$branch"
        set_color yellow
        echo -n "[ $branch]"
    end

    echo

    # Second line
    set_color 00ff00
    echo -n "╰─>$robot"
    set_color 00ffff
    echo -n "$path"
    echo -n ' $ '
    set_color normal
end
