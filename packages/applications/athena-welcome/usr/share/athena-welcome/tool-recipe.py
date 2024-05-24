import gi

gi.require_version("Gtk", "3.0")
from gi.repository import Gtk

# list of tuples for each variable, containing the environment variable name, its path, and the security category
variable_list = [
    ("asciinema", "Record and share your terminal sessions."),
    ("athena-cyber-hub", "Running vulnerable labs and Cyber Security platforms."),
    ("athena-theme-tweak", "Switch to different Athena themes."),
    ("athena-welcome", "Welcome application that allows main security tools installation and mirrorlist update."),
    ("bashtop", "Resource monitor that shows usage and stats for processor, memory, disks, network and processes."),
    ("bat", "A 'cat' clone with syntax highlighting and Git integration."),
    ("bfetch", "SuperB general-purpose fetch displayer."),
    ("bless", "High-quality, full-featured hex editor."),
    ("btrfs-assistant", "GUI management tool to make managing a Btrfs filesystem easier."),
    ("chat-gpt", "ChatGPT Desktop application."),
    ("cmatrix", "Text flying in and out in a terminal like as seen in 'The Matrix' movie."),
    ("code", "Core engine of Visual Studio Code."),
    ("convert", "Convert between image formats as well as resize an image, blur, crop, despeckle, dither, draw on, flip, join, re-sample, and much more."),
    ("cowsay", "Print messages, warnings, or character strings with various animals and other creatures."),
    ("cpc", "Copy the entire content of the input file to the clipboard."),
    ("devil", "Quotes by devil eyes."),
    ("downgrade", "Downgrade one (or multiple) packages, by using the pacman cache or the Arch Rollback Machine."),
    ("eog", "Image viewer."),
    ("figlet", "Create ASCII text banners from terminal."),
    ("fortune", "Print out a random epigram."),
    ("git", "Fast, scalable, distributed revision control system."),
    ("gnome-extensions", "Gnome Extension manager."),
    ("gnome-tweaks", "Configure looks and functionality of your desktop."),
    ("goofcord", "Cross-platform, all-in-one voice and text chat application."),
    ("gparted", "GNOME Partition Editor for creating, reorganizing, and deleting disk partitions."),
    ("htb-tookit", "Play Hack The Box directly on your system."),
    ("la", "An lsd -a alias"),
    ("ll", "An lsd -alFh alias."),
    ("lolcat", "Concatenate like similar to 'cat' command and adds rainbow coloring to it."),
    ("lsd", "An ls command with a lot of pretty colors and some other stuff."),
    ("myman", "Text-mode videogame inspired by Namco's Pac-Man."),
    ("nano", "Simple terminal-based text editor."),
    ("nautilus", "File Manager."),
    ("ncdu", "Check which directories are using your disk space."),
    ("neofetch", "CLI system information tool written in BASH."),
    ("nist-feed", "NIST notifier about the newest published CVEs according to your filters."),
    ("nvim", "Vim-fork focused on extensibility and usability."),
    ("nyancat", "Nyancat rendered in your terminal."),
    ("octopi", "A powerful Pacman (Package Manager) front end using Qt libs."),
    ("orca", "Screen reader that provides access to the graphical desktop via speech and refreshable braille."),
    ("pacman", "Arch Linux package manager."),
    ("pactree", "Package dependency tree viewer."),
    ("paru", "Pacman wrapping AUR helper with lots of features and minimal interaction."),
    ("pfetch", "A pretty system information tool written in POSIX sh."),
    ("probe", "Probe for hardware, check operability and find drivers."),
    ("pywhat", "Identify anything. It easily lets you identifying emails, IP addresses, and more."),
    ("sl", "A steam locomotive running across your screen. Next time write 'ls' in a good manner."),
    ("timeline", "Cross-platform application for displaying and navigating events on a timeline."),
    ("tmux", "Terminal multiplexer that allow you switch easily between several programs in one terminal, detach them and reattach them to a different terminal."),
    ("toilet", "Display large colourful characters."),
    ("tree", "Recursive directory listing program that produces a depth indented listing of files."),
    ("troubleshoot", "Generate logs links about your system in order to investigate any issue."),
    ("vim", "Highly configurable text editor built to make creating and changing any kind of text very efficient."),
    ("vnstat", "Console-based network traffic monitor."),
    ("xcp", "An extended cp command."),
    ("z", "A smarter cd command for your terminal for BASH and ZSH.")
]


class TreeViewFilterWindow(Gtk.Window):
    def __init__(self):
        super().__init__(title="Tool Recipe")
        self.set_border_width(10)

        # Setting up the self.grid in which the elements are to be positioned
        self.grid = Gtk.Grid()
        self.grid.set_column_homogeneous(True)
        self.grid.set_row_homogeneous(True)
        self.grid.set_row_spacing(10)
        self.grid.set_column_spacing(10)
        self.add(self.grid)

        # Creating the ListStore model
        self.variable_liststore = Gtk.ListStore(str, str)
        for variable_ref in variable_list:
            self.variable_liststore.append(list(variable_ref))
        self.current_filter_category = None

        # Creating the filter, feeding it with the liststore model
        self.liststore_model = self.variable_liststore.filter_new()

        # creating the treeview, making it use the filter as a model, and adding the columns
        self.treeview = Gtk.TreeView(model=self.liststore_model)
        for i, column_title in enumerate(
            ["Tool", "Description"]
        ):
            renderer = Gtk.CellRendererText()
            column = Gtk.TreeViewColumn(column_title, renderer, text=i)
            self.treeview.append_column(column)

        # setting up the layout, putting the treeview in a scrollwindow
        self.scrollable_treelist = Gtk.ScrolledWindow()
        self.scrollable_treelist.set_vexpand(True)
        self.grid.attach(self.scrollable_treelist, 0, 0, 100, 50) #Set the size of the window
        self.scrollable_treelist.add(self.treeview)

        self.show_all()


win = TreeViewFilterWindow()
win.connect("destroy", Gtk.main_quit)
win.show_all()
Gtk.main()
