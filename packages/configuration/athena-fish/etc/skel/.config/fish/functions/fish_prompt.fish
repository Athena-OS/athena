function fish_prompt
    set -l var (tty)
    switch $var
        case '*/dev/tty*'
            set_color 00ff00
            echo -n "[HQ:"
            set_color ff00d7
            echo -n "$(ip -4 addr | grep -v '127.0.0.1' | grep -v 'secondary' | grep -oP '(?<=inet\s)\d+(\.\d+){3}' | sed -z 's/\n/|/g;s/|\$/\n/' | rev | cut -c 2- | rev)"
            echo -n " | $USER"
            set_color 00ff00
            echo "]"
            set_color 00ff00
            echo -n "[>]"
            set_color 00ffff
            echo (pwd) '$' (set_color normal)
        case '*'
            set_color 00ff00
            echo -n "┌──[HQ🚀🌐"
            set_color ff00d7
            echo -n "$(ip -4 addr | grep -v '127.0.0.1' | grep -v 'secondary' | grep -oP '(?<=inet\s)\d+(\.\d+){3}' | sed -z 's/\n/|/g;s/|\$/\n/' | rev | cut -c 2- | rev)"
            echo -n "🔥$USER"
            set_color 00ff00
            echo "]"
            set_color 00ff00
            echo -n "└──╼[👾]"
            set_color 00ffff
            echo (pwd) '$' (set_color normal)
    end
    end