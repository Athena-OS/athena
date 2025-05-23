import os.path
import subprocess

import functions as fn


class Packages:
    def __init__(self):
        self.packages_file_name = "packages-x86_64.txt"
        self.export_dir = "{}/{}".format(fn.home, "att-exports")
        self.default_export_path = "{}/{}".format(
            self.export_dir, self.packages_file_name
        )
        self.process_timeout = 20
        self.install_process_timeout = 600  # 10m timeout on pacman package install
        # Create a queue for storing Packages status
        self.packages_status_queue = fn.Queue()
        # Create a queue for storing Package install failures messages
        self.packages_err_queue = fn.Queue()
        # Create a queue for storing pacman sync db status
        self.pacman_sync_db_queue = fn.Queue()
        # Create a queue for storing messages on
        self.messages_queue = fn.Queue()
        # Log file to store package install status
        self.logfile = "%spackages-install-status-%s-%s.log" % (
            fn.att_log_dir,
            fn.datetime.datetime.today().date(),
            fn.datetime.datetime.today().time().strftime("%H-%M-%S"),
        )

        # start thread to monitor messages queue

        thread_monitor_messages_queue = fn.threading.Thread(
            target=fn.monitor_messages_queue, args=(self,), daemon=True
        )

        thread_monitor_messages_queue.start()

    # export package list to file
    def export_packages(self, export_selected, gui_parts):
        try:
            self.textbuffer = gui_parts[4]
            self.textview = gui_parts[5]
            self.label_package_status = gui_parts[6]
            self.label_package_count = gui_parts[7]

            fn.logger.info("Exporting packages")
            event = (
                "%s [INFO]: Exporting packages\n"
                % fn.datetime.datetime.now().strftime("%Y-%m-%d-%H-%M-%S")
            )

            self.messages_queue.put(event)

            if not os.path.exists(self.export_dir):
                fn.mkdir(self.export_dir)
                fn.permissions(self.export_dir)

            # makes sure the local db are in sync
            thread_pacman_sync = fn.threading.Thread(
                target=self.pacman_sync,
                daemon=True,
            )

            thread_pacman_sync.start()

            pacman_sync_returncode = None

            while True:
                pacman_sync_returncode = self.pacman_sync_db_queue.get()
                try:
                    if pacman_sync_returncode == 0 or pacman_sync_returncode == 1:
                        break

                finally:
                    self.pacman_sync_db_queue.task_done()

            if pacman_sync_returncode == 0:
                event = (
                    "%s [INFO]: Synchronizing package databases completed\n"
                    % fn.datetime.datetime.now().strftime("%Y-%m-%d-%H-%M-%S")
                )

                self.messages_queue.put(event)

                # pacman -Qqen - for packages from pacman repos native and does not capture AUR
                # pacman -Qqem - for packages from the AUR
                query_str = None
                if export_selected == "export_all":
                    query_str = ["pacman", "-Qq"]
                if export_selected == "export_explicit":
                    query_str = ["pacman", "-Qqen"]

                fn.logger.info("Export option selected = %s" % export_selected)

                fn.logger.info("Running %s" % " ".join(query_str))

                event = "%s [INFO]: Running %s\n" % (
                    fn.datetime.datetime.now().strftime("%Y-%m-%d-%H-%M-%S"),
                    " ".join(query_str),
                )

                self.messages_queue.put(event)

                output = []

                with fn.subprocess.Popen(
                    query_str,
                    shell=False,
                    stdout=fn.subprocess.PIPE,
                    stderr=fn.subprocess.PIPE,
                    bufsize=1,
                    universal_newlines=True,
                ) as process:
                    while True:
                        if process.poll() is not None:
                            break

                        for line in process.stdout:
                            output.append(line)

                if process.returncode == 0:
                    with open(self.default_export_path, "w") as f:
                        f.write(
                            "# This file was auto-generated by the Athena Tweak Tool on %s at %s\n"
                            % (
                                fn.datetime.datetime.today().date(),
                                fn.datetime.datetime.now().strftime("%H:%M:%S"),
                            )
                        )
                        if export_selected == "export_all":
                            f.write(
                                "# Exported all installed packages using %s\n"
                                % " ".join(query_str)
                            )
                        if export_selected == "export_explicit":
                            f.write(
                                "# Exported explicitly installed packages using %s\n"
                                % " ".join(query_str)
                            )
                        for line in output:
                            f.write("%s" % line)

                    if fn.os.path.exists(self.default_export_path):
                        lines = []
                        with open(self.default_export_path, "r") as r:
                            lines = r.readlines()
                        if len(lines) > 1:
                            fn.permissions(self.default_export_path)
                            lines.clear()

                            event = (
                                "%s [INFO]: Package export completed\n"
                                % fn.datetime.datetime.now().strftime(
                                    "%Y-%m-%d-%H-%M-%S"
                                )
                            )

                            self.messages_queue.put(event)

                            event = "%s [INFO]: Package list exported to %s\n" % (
                                fn.datetime.datetime.now().strftime(
                                    "%Y-%m-%d-%H-%M-%S"
                                ),
                                self.default_export_path,
                            )

                            self.messages_queue.put(event)

                            return True
                        else:
                            event = (
                                "%s [INFO]: Package export failed\n"
                                % fn.datetime.datetime.now().strftime(
                                    "%Y-%m-%d-%H-%M-%S"
                                )
                            )

                            self.messages_queue.put(event)
                            return False
                    else:
                        event = (
                            "%s [INFO]: Package export failed\n"
                            % fn.datetime.datetime.now().strftime("%Y-%m-%d-%H-%M-%S")
                        )

                        self.messages_queue.put(event)
                        return False
                else:
                    event = (
                        "%s [INFO]: Package export failed\n"
                        % fn.datetime.datetime.now().strftime("%Y-%m-%d-%H-%M-%S")
                    )

                    self.messages_queue.put(event)
                    return False
            else:
                event = (
                    "%s [INFO]: Synchronising package databases failed\n"
                    % fn.datetime.datetime.now().strftime("%Y-%m-%d-%H-%M-%S")
                )

                self.messages_queue.put(event)

                event = (
                    "%s [INFO]: Package export failed\n"
                    % fn.datetime.datetime.now().strftime("%Y-%m-%d-%H-%M-%S")
                )

                self.messages_queue.put(event)
                return False

        except Exception as e:
            fn.logger.error("Exception in export_packages(): %s" % e)
            return False

    # install packages
    def install_packages(self, packages, button_install, gui_parts):
        try:
            fn.logger.info("Installing packages")
            event = (
                "%s [INFO]: Installing packages\n"
                % fn.datetime.datetime.now().strftime("%Y-%m-%d-%H-%M-%S")
            )

            fn.logger.info("Log file = %s" % self.logfile)

            self.messages_queue.put(event)

            self.textbuffer = gui_parts[4]
            self.textview = gui_parts[5]
            self.label_package_status = gui_parts[6]
            self.label_package_count = gui_parts[7]
            self.button_install = button_install
            self.packages = packages

            if self.packages is not None:
                # starts 2 threads one to install the packages, and another to check install status
                thread_install_packages = fn.threading.Thread(
                    target=self.pacman_install_packages,
                    daemon=True,
                )
                thread_install_packages.start()

                thread_check_install_packages = fn.threading.Thread(
                    target=self.log_package_status, daemon=True
                )
                thread_check_install_packages.start()

            else:
                fn.logger.error(
                    "Not a valid packages file, the Athena Tweak Tool header comment was not found"
                )

        except Exception as e:
            fn.logger.error("Exception in install_packages(): %s" % e)

    # package install completed now log status to log file
    def log_package_status(self):
        fn.logger.info("Logging package status")
        packages_status_list = None
        package_err = None
        while True:
            try:
                fn.time.sleep(0.2)
                packages_status_list = self.packages_status_queue.get()
                package_err = self.packages_err_queue.get()

            finally:
                self.packages_status_queue.task_done()
                self.packages_err_queue.task_done()
                with open(self.logfile, "w") as f:
                    f.write(
                        "# This file was auto-generated by the Athena Tweak Tool on %s at %s\n"
                        % (
                            fn.datetime.datetime.today().date(),
                            fn.datetime.datetime.now().strftime("%H:%M:%S"),
                        ),
                    )
                    if packages_status_list is not None:
                        for package in packages_status_list:
                            if package.split("->")[0].strip() in package_err:
                                f.write("%s\n" % package)
                                f.write(
                                    "\tERROR: %s\n"
                                    % package_err[package.split("->")[0].strip()]
                                )
                            else:
                                f.write("%s\n" % package)

                break

    # pacman synchronize database
    def pacman_sync(self):
        fn.logger.info("Synchronizing package databases")

        event = (
            "%s [INFO]: Synchronizing package databases\n"
            % fn.datetime.datetime.now().strftime("%Y-%m-%d-%H-%M-%S")
        )

        self.messages_queue.put(event)

        query_pacman_sync_str = ["pacman", "-Sy"]

        with fn.subprocess.Popen(
            query_pacman_sync_str,
            shell=False,
            stdout=fn.subprocess.PIPE,
            stderr=fn.subprocess.STDOUT,
            bufsize=1,
            universal_newlines=True,
        ) as process:
            while True:
                if process.poll() is not None:
                    break

                for line in process.stdout:
                    print(line.strip())
                    self.messages_queue.put(line)

                # fn.time.sleep(0.2)

            if process.returncode == 0:
                fn.logger.info("Synchronising package databases completed")
                self.pacman_sync_db_queue.put(process.returncode)
            else:
                fn.logger.error("Synchronising package databases failed")
                self.pacman_sync_db_queue.put(process.returncode)

    # this is run inside another thread
    def pacman_install_packages(self):
        try:
            packages_status_list = []
            package_failed = False
            package_err = {}

            count = 0

            # clean pacman cache

            if fn.os.path.exists(fn.pacman_cache_dir):
                query_pacman_clean_cache_str = ["pacman", "-Sc", "--noconfirm"]

                fn.logger.info(
                    "Cleaning Pacman cache directory = %s" % fn.pacman_cache_dir
                )

                event = (
                    "%s [INFO]: Cleaning pacman cache\n"
                    % fn.datetime.datetime.now().strftime("%Y-%m-%d-%H-%M-%S")
                )

                self.messages_queue.put(event)

                fn.GLib.idle_add(
                    fn.update_package_status_label,
                    self.label_package_status,
                    "Status: <b>Cleaning pacman cache</b>",
                )

                # clean the pacman cache, so we don't run into any invalid/corrupt package errors during install
                process_pacman_cc = fn.subprocess.Popen(
                    query_pacman_clean_cache_str,
                    shell=False,
                    stdout=fn.subprocess.PIPE,
                    stderr=fn.subprocess.PIPE,
                )

                out, err = process_pacman_cc.communicate(timeout=self.process_timeout)

                if process_pacman_cc.returncode == 0:
                    fn.logger.info("Pacman cache directory cleaned")
                else:
                    fn.logger.error("Failed to clean Pacman cache directory")

            fn.logger.info("Running full system upgrade")
            # run full system upgrade, Arch does not allow partial package updates
            query_str = ["pacman", "-Syu", "--noconfirm"]
            # query_str = ["pacman", "-Qqen"]
            fn.logger.info("Running %s" % " ".join(query_str))

            event = (
                "%s [INFO]:Running full system upgrade\n"
                % fn.datetime.datetime.now().strftime("%Y-%m-%d-%H-%M-%S")
            )

            self.messages_queue.put(event)

            fn.GLib.idle_add(
                fn.update_package_status_label,
                self.label_package_status,
                "Status: <b>Performing full system upgrade - do not power off your system</b>",
            )

            output = []

            with fn.subprocess.Popen(
                query_str,
                shell=False,
                stdout=fn.subprocess.PIPE,
                stderr=fn.subprocess.STDOUT,
                bufsize=1,
                universal_newlines=True,
            ) as process:
                while True:
                    if process.poll() is not None:
                        break

                    for line in process.stdout:
                        # print(line.strip())

                        self.messages_queue.put(line)

                        output.append(line)

                    fn.time.sleep(0.2)

            if process.returncode == 0:
                fn.logger.info("Pacman system upgrade completed")
                fn.GLib.idle_add(
                    fn.update_package_status_label,
                    self.label_package_status,
                    "Status: <b> Full system upgrade - completed</b>",
                )
            else:
                if len(output) > 0:
                    if "there is nothing to do" not in output:
                        fn.logger.error("Pacman system upgrade failed")
                        fn.GLib.idle_add(
                            fn.update_package_status_label,
                            self.label_package_status,
                            "Status: <b> Full system upgrade - failed</b>",
                        )

                        print("%s" % " ".join(output))

                        event = "%s [ERROR]: Installation of packages aborted due to errors\n" % fn.datetime.datetime.now().strftime(
                            "%Y-%m-%d-%H-%M-%S"
                        )

                        self.messages_queue.put(event)

                        fn.logger.error(
                            "Installation of packages aborted due to errors"
                        )

                        return

                    # do not proceed with package installs if system upgrade fails
                    else:
                        return

            # iterate through list of packages, calling pacman -S on each one
            for package in self.packages:
                process_output = []
                package = package.strip()
                if len(package) > 0:
                    if "#" not in package:
                        query_str = ["pacman", "-S", package, "--needed", "--noconfirm"]

                        count += 1

                        fn.logger.info("Running %s" % " ".join(query_str))

                        event = "%s [INFO]: Running %s\n" % (
                            fn.datetime.datetime.now().strftime("%Y-%m-%d-%H-%M-%S"),
                            " ".join(query_str),
                        )

                        self.messages_queue.put(event)

                        with fn.subprocess.Popen(
                            query_str,
                            shell=False,
                            stdout=fn.subprocess.PIPE,
                            stderr=fn.subprocess.STDOUT,
                            bufsize=1,
                            universal_newlines=True,
                        ) as process:
                            while True:
                                if process.poll() is not None:
                                    break
                                for line in process.stdout:
                                    process_output.append(line.strip())

                                    self.messages_queue.put(line)

                                fn.time.sleep(0.2)

                        if process.returncode == 0:
                            # since this is being run in another thread outside of main, use GLib to update UI component
                            fn.GLib.idle_add(
                                fn.update_package_status_label,
                                self.label_package_status,
                                "Status: <b>%s</b> -> <b>Installed</b>" % package,
                            )

                            fn.GLib.idle_add(
                                fn.update_package_status_label,
                                self.label_package_count,
                                "Progress: <b>%s/%s</b>" % (count, len(self.packages)),
                            )

                            packages_status_list.append("%s -> Installed" % package)

                        else:
                            fn.logger.error("%s --> Install failed" % package)
                            fn.GLib.idle_add(
                                fn.update_package_status_label,
                                self.label_package_status,
                                "Status: <b>%s</b> -> <b>Install failed</b>" % package,
                            )

                            fn.GLib.idle_add(
                                fn.update_package_status_label,
                                self.label_package_count,
                                "Progress: <b>%s/%s</b>" % (count, len(self.packages)),
                            )

                            if len(process_output) > 0:
                                if "there is nothing to do" not in process_output:
                                    fn.logger.error("%s" % " ".join(process_output))
                                    # store package error in dict
                                    package_err[package] = " ".join(process_output)

                            package_failed = True

                            packages_status_list.append("%s -> Failed" % package)

            if len(packages_status_list) > 0:
                self.packages_status_queue.put(packages_status_list)

            if package_failed is True:
                fn.GLib.idle_add(
                    fn.update_package_status_label,
                    self.label_package_status,
                    "<b>Some packages have failed to install see %s</b>" % self.logfile,
                )

            self.button_install.set_sensitive(True)

        except Exception as e:
            fn.logger.error("Exception in pacman_install_packages(): %s" % e)
            self.button_install.set_sensitive(True)

        finally:
            self.packages_err_queue.put(package_err)

    # read package file contents into memory
    def get_packages_file_content(self):
        try:
            if fn.os.path.exists(self.default_export_path):
                lines = []
                with open(self.default_export_path, "r") as r:
                    lines = r.readlines()

                # the line "# This file was auto-generated by the Athena Tweak Tool/Sofirem on should be present in the package list file
                # this is a form of check that we have a valid file
                if len(lines) > 1:
                    if (
                        "# This file was auto-generated by the Athena Tweak Tool on"
                        in lines[0]
                        or "# This file was auto-generated by Sofirem on" in lines[0]
                    ):
                        packages_list = []
                        for package in lines:
                            if len(package.strip()) and "#" not in package.strip():
                                packages_list.append(package.strip())

                        return packages_list

                    else:
                        return None
                else:
                    return None
            else:
                return None
        except Exception as e:
            fn.logger.error("Exception in get_packages_file_content(): %s" % e)
            return None
