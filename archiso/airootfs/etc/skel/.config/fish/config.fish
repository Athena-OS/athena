if status is-interactive
    # Commands to run in interactive sessions can go here
end
neofetch | lolcat

sudo rm -rf /etc/pacman.d/gnupg
sudo pacman-key --init
sudo pacman-key --populate

sed -i '/pacman/d' $HOME/.config/fish/config.fish
