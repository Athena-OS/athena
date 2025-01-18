import gi

gi.require_version("Gtk", "3.0")
from gi.repository import Gtk

# list of tuples for each variable, containing the environment variable name, its path, and the security category
variable_list = [
    ("$PAYLOADS", "/usr/share/payloads", "Generic"),
    ("$AUTOWORDLISTS", "$PAYLOADS/Auto_Wordlists", "Generic"),
    ("$FUZZDB", "$PAYLOADS/FuzzDB", "Generic"),
    ("$PAYLOADSALLTHETHINGS", "$PAYLOADS/PayloadsAllTheThings", "Generic"),
    ("$SECLISTS", "$PAYLOADS/SecLists", "Generic"),
    ("$SECURITYWORDLIST", "$PAYLOADS/Security-Wordlist", "Generic"),
    ("$MIMIKATZ", "/usr/share/windows/mimikatz", "Post Exploitation"),
    ("$POWERSPLOIT", "/usr/share/windows/powersploit", "Post Exploitation"),
    ("$DIRBIG", "$SECLISTS/Discovery/Web-Content/directory-list-2.3-big.txt", "Web Analysis"),
    ("$DIRMEDIUM", "$SECLISTS/Discovery/Web-Content/directory-list-2.3-medium.txt", "Web Analysis"),
    ("$DIRSMALL", "$SECLISTS/Discovery/Web-Content/directory-list-2.3-small.txt", "Web Analysis"),
    ("$ROCKYOU", "$SECLISTS/Passwords/Leaked-Databases/rockyou.txt", "Password Cracking"),
    ("$WEBAPI_COMMON", "$SECLISTS/Discovery/Web-Content/api/api-endpoints.txt", "Web Analysis"),
    ("$WEBAPI_MAZEN", "$SECLISTS/Discovery/Web-Content/common-api-endpoints-mazen160.txt", "Web Analysis"),
    ("$WEBCOMMON", "$SECLISTS/Discovery/Web-Content/common.txt", "Web Analysis"),
    ("$WEBPARAM", "$SECLISTS/Discovery/Web-Content/burp-parameter-names.txt", "Web Analysis")
]


class TreeViewFilterWindow(Gtk.Window):
    def __init__(self):
        super().__init__(title="Hacking Variable View")
        self.set_border_width(10)

        # Setting up the self.grid in which the elements are to be positioned
        self.grid = Gtk.Grid()
        self.grid.set_column_homogeneous(True)
        self.grid.set_row_homogeneous(True)
        self.add(self.grid)

        # Creating the ListStore model
        self.variable_liststore = Gtk.ListStore(str, str, str)
        for variable_ref in variable_list:
            self.variable_liststore.append(list(variable_ref))
        self.current_filter_category = None

        # Creating the filter, feeding it with the liststore model
        self.category_filter = self.variable_liststore.filter_new()
        # setting the filter function, note that we're not using the
        self.category_filter.set_visible_func(self.category_filter_func)

        # creating the treeview, making it use the filter as a model, and adding the columns
        self.treeview = Gtk.TreeView(model=self.category_filter)
        for i, column_title in enumerate(
            ["Variable", "Path", "Category"]
        ):
            renderer = Gtk.CellRendererText()
            column = Gtk.TreeViewColumn(column_title, renderer, text=i)
            self.treeview.append_column(column)

        # creating buttons to filter by Category, and setting up their events
        self.buttons = list()
        for var_category in ["Generic", "Password Cracking", "Post Exploitation", "Web Analysis", "None"]:
            button = Gtk.Button(label=var_category)
            self.buttons.append(button)
            button.connect("clicked", self.on_selection_button_clicked)

        # setting up the layout, putting the treeview in a scrollwindow, and the buttons in a row
        self.scrollable_treelist = Gtk.ScrolledWindow()
        self.scrollable_treelist.set_vexpand(True)
        self.grid.attach(self.scrollable_treelist, 0, 0, 5, 10)
        self.grid.attach_next_to(
            self.buttons[0], self.scrollable_treelist, Gtk.PositionType.BOTTOM, 1, 1
        )
        for i, button in enumerate(self.buttons[1:]):
            self.grid.attach_next_to(
                button, self.buttons[i], Gtk.PositionType.RIGHT, 1, 1
            )
        self.scrollable_treelist.add(self.treeview)

        self.show_all()

    def category_filter_func(self, model, iter, data):
        """Tests if the Category in the row is the one in the filter"""
        if (
            self.current_filter_category is None
            or self.current_filter_category == "None"
        ):
            return True
        else:
            return model[iter][2] == self.current_filter_category

    def on_selection_button_clicked(self, widget):
        """Called on any of the button clicks"""
        # we set the current category filter to the button's label
        self.current_filter_category = widget.get_label()
        print("%s category selected!" % self.current_filter_category)
        # we update the filter, which updates in turn the view
        self.category_filter.refilter()


win = TreeViewFilterWindow()
win.connect("destroy", Gtk.main_quit)
win.show_all()
Gtk.main()
