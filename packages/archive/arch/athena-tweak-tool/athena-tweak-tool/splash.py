# ============================================================
# Authors: Brad Heffernan - Erik Dubois - Cameron Percival
# ============================================================
# pylint:disable=C0115,I1101

from gi.repository import Gtk, GdkPixbuf
import gi
import functions as fn


gi.require_version("Gtk", "3.0")

base_dir = fn.path.dirname(fn.path.realpath(__file__))


class SplashScreen(Gtk.Window):
    def __init__(self):
        Gtk.Window.__init__(self, Gtk.WindowType.POPUP, title="")
        self.set_decorated(False)
        self.set_resizable(False)
        self.set_size_request(500, 250)
        self.set_position(Gtk.WindowPosition.CENTER)

        main_vbox = Gtk.Box(orientation=Gtk.Orientation.HORIZONTAL, spacing=1)
        self.add(main_vbox)

        self.image = Gtk.Image()
        pimage = GdkPixbuf.Pixbuf().new_from_file_at_size(
            base_dir + "/images/athenaos-logo.svg", 341, 416
        )
        self.image.set_from_pixbuf(pimage)

        main_vbox.pack_start(self.image, True, True, 0)

        self.show_all()
