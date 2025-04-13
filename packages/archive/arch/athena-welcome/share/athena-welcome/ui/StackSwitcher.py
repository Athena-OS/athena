import gi

gi.require_version("Gtk", "3.0")
from gi.repository import Gtk


class StackSwitcher(Gtk.StackSwitcher):
    def __init__(self, stack):
        super(StackSwitcher, self).__init__()
        self.set_orientation(Gtk.Orientation.HORIZONTAL)
        self.set_stack(stack)
        self.set_halign(Gtk.Align.CENTER)
