cd $HOME
mkdir zsh_preview
cp .zshrc .zshrc_original
for ix in /usr/share/oh-my-zsh/themes/*.zsh-theme
do
#    echo $ix #this is to confirm the iterator works
    cd $HOME
	theme=$(basename "$ix" ".zsh-theme")
#	echo $theme #this is to confirm that the basename assignment works
	sed -e "s/.*ZSH_THEME.*/ZSH_THEME=\"$theme\"/g" .zshrc > temp
    cd $HOME
    cp temp .zshrc
    wait
# I set this to create the images in a subfolder off my home directory for easy access. If running periodically on user machines,
# I suggest putting the files somewhere the ATT can access directly, OR in a file buffer, with the intent of updating via a cron job.
# for 144 themes (when I created this) it took ~10 minutes to generate a screenshot for every theme. This script will need updating
# IF the zsh-themes directory ever changes.
    cd $HOME
	cd zsh_preview
    alacritty &
	sleep 2
	termite -e "scrot -u $theme.jpg" &
	sleep 2
	killall alacritty
done	
cd $HOME
rm .zshrc
mv .zshrc_original .zshrc
