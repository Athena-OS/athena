if status is-interactive
    # Commands to run in interactive sessions can go here
end
neofetch | lolcat

sudo rm -rf /etc/pacman.d/gnupg
sudo pacman-key --init
sudo pacman-key --populate
sudo rm -rf /usr/share/pacman/keyrings/blackarch*

sed -i '/pacman/d' $HOME/.config/fish/config.fish
sed -i '/^$/d' $HOME/.config/fish/config.fish
sed -i '/sed/d' $HOME/.config/fish/config.fish
