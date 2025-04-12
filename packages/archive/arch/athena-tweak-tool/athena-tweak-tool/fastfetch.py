# ============================================================
# Authors: Brad Heffernan - Erik Dubois - Cameron Percival
# ============================================================

import os
import subprocess
import functions as fn
import re
import json
import utilities

# ====================================================================
#                       Fastfetch
# ====================================================================

def get_fastfetch():
    """Get data from fastfetch_config JSONC file."""
    data = {}
    if fn.path.isfile(fn.fastfetch_config):
        with open(fn.fastfetch_config, "r", encoding="utf-8") as f:
            jsonc_content = f.read()
    
    return data


def toggle_fastfetch(enable):
    """Toggle fastfetch in shell config file"""
    shell_config = fn.get_shell_config()
    if not shell_config:
        return False

    try:
        with open(shell_config, "r", encoding="utf-8") as f:
            lines = f.readlines()
        
        # Find the reporting tools section
        reporting_section_start = -1
        for i, line in enumerate(lines):
            if "# reporting tools" in line.lower():
                reporting_section_start = i
                break

        if reporting_section_start == -1:
            return False  # Exit if the reporting tools section is not found

        # Find the fastfetch line within the reporting tools section
        fastfetch_line = -1
        for i in range(reporting_section_start, len(lines)):
            if lines[i].strip().startswith(("fastfetch", "#fastfetch")):
                fastfetch_line = i
                break

        if fastfetch_line == -1:
            return False  # Exit if fastfetch line is not found

        # Check if the line is commented out
        if lines[fastfetch_line].strip().startswith("#"):
            if enable:
                return False  # Do not enable if it's commented out
            # If disabling, we can proceed to comment it out

        # Toggle only the fastfetch line
        if enable:
            lines[fastfetch_line] = lines[fastfetch_line].lstrip('#')  # Uncomment
        else:
            if not lines[fastfetch_line].strip().startswith('#'):
                lines[fastfetch_line] = '#' + lines[fastfetch_line]  # Comment out

        with open(shell_config, "w", encoding="utf-8") as f:
            f.writelines(lines)
        return True
    except Exception:
        return False

def toggle_lolcat(enable):
    """Toggle lolcat for fastfetch in shell config file"""
    shell_config = fn.get_shell_config()
    if not shell_config:
        return False

    try:
        with open(shell_config, "r", encoding="utf-8") as f:
            lines = f.readlines()
        
        lolcat_lines = [i for i, line in enumerate(lines) 
                        if "| lolcat" in line.lower()]
        
        for line in lolcat_lines:
            # Skip updating the alias line and the line above it
            if "| lolcat" in lines[line] or line > 0 and "| lolcat" in lines[line - 1]:
                continue
        
        with open(shell_config, "w", encoding="utf-8") as f:
            f.writelines(lines)
        return True
    except Exception:
        return False

def check_backend():
    """See if image backend is active."""
    if fn.path.isfile(fn.fastfetch_config):
        config = get_fastfetch()
        if config:
            image_backend = config.get("image_backend", None)
            if image_backend and not image_backend.startswith("#"):
                return image_backend.strip('"')
    return "ascii"

def apply_config(self, backend, ascii_size):
    """Apply fastfetch configuration"""
    if fn.path.isfile(fn.fastfetch_config):
        with open(fn.fastfetch_config, "r", encoding="utf-8") as f:
            lines = f.readlines()

        # Mapping keys to checkboxes
        key_to_checkbox = {
            '"os"': self.os,
            '"host"': self.host,
            '"kernel"': self.kernel,
            '"uptime"': self.uptime,
            '"packages"': self.packages,
            '"shell"': self.shell,
            '"display"': self.display,
            '"de"': self.de,
            '"wm"': self.wm,
            '"wmtheme"': self.wmtheme,
            '"theme"': self.themes,
            '"icons"': self.icons,
            '"font"': self.font,
            '"cursor"': self.cursor,
            '"terminal"': self.term,
            '"terminalfont"': self.termfont,
            '"cpu"': self.cpu,
            '"gpu"': self.gpu,
            '"memory"': self.mem,
            '"swap"': self.swap,
            '"disk"': self.disks,
            '"localIP"': self.lIP,
            '"battery"': self.batt,
            '"poweradapter"': self.pwr,
            '"locale"': self.local,
            '"title"': self.title,
            '"underline"': self.title,
            '"colors"': self.cblocks,
        }
 
        # Comment or uncomment each key based on the checkbox state
        for i in range(len(lines)):
            for key, checkbox in key_to_checkbox.items():
                if key.lower() in lines[i].lower():
                    if checkbox.get_active() and lines[i].startswith("//"):
                        lines[i] = lines[i][2:]  # Uncomment the line
                    elif not checkbox.get_active() and not lines[i].startswith("//"):
                        lines[i] = "//" + lines[i]  # Comment the line

        # Write the updated lines back to the file
        with open(fn.fastfetch_config, "w", encoding="utf-8") as f:
            f.writelines(lines)

        fn.show_in_app_notification(self, "fastfetch settings saved successfully")

def get_checkboxes(self):
    """Read the state of the checkboxes from the JSONC configuration."""
    config = get_fastfetch()

    # Setting the active state of checkboxes based on configuration
    self.title.set_active(config.get("info", {}).get("title", False))
    self.os.set_active(config.get("info", {}).get("OS", False))
    self.host.set_active(config.get("info", {}).get("Host", False))
    self.kernel.set_active(config.get("info", {}).get("Kernel", False))
    self.uptime.set_active(config.get("info", {}).get("Uptime", False))
    self.packages.set_active(config.get("info", {}).get("Packages", False))
    self.shell.set_active(config.get("info", {}).get("Shell", False))
    self.display.set_active(config.get("info", {}).get("Display", False))
    self.de.set_active(config.get("info", {}).get("DE", False))
    self.wm.set_active(config.get("info", {}).get("WM", False))
    self.wmtheme.set_active(config.get("info", {}).get("WM Theme", False))
    self.themes.set_active(config.get("info", {}).get("Theme", False))
    self.icons.set_active(config.get("info", {}).get("Icons", False))
    self.font.set_active(config.get("info", {}).get("Font", False))
    self.cursor.set_active(config.get("info", {}).get("Cursor", False))
    self.term.set_active(config.get("info", {}).get("Terminal", False))
    self.termfont.set_active(config.get("info", {}).get("Terminal Font", False))
    self.cpu.set_active(config.get("info", {}).get("CPU", False))
    self.gpu.set_active(config.get("info", {}).get("GPU", False))
    self.mem.set_active(config.get("info", {}).get("Memory", False))
    self.swap.set_active(config.get("info", {}).get("Swap", False))
    self.disks.set_active(config.get("info", {}).get("Disk", False))
    self.lIP.set_active(config.get("info", {}).get("Local IP", False))
    self.batt.set_active(config.get("info", {}).get("Battery", False))
    self.pwr.set_active(config.get("info", {}).get("Power Adapter", False))
    self.local.set_active(config.get("info", {}).get("Locale", False))
    self.cblocks.set_active(config.get("info", {}).get("Color Blocks", False))

def set_checkboxes_normal(self):
    """set the state of the checkboxes and ensure separator is uncommented"""
    self.title.set_active(True)
    self.os.set_active(True)
    self.host.set_active(True)
    self.kernel.set_active(True)
    self.uptime.set_active(True)
    self.packages.set_active(True)
    self.shell.set_active(True)
    self.display.set_active(True)
    self.de.set_active(True)
    self.wm.set_active(True)
    self.wmtheme.set_active(True)
    self.themes.set_active(True)
    self.icons.set_active(True)
    self.font.set_active(True)
    self.cursor.set_active(True)
    self.term.set_active(True)
    self.termfont.set_active(True)
    self.cpu.set_active(True)
    self.gpu.set_active(True)
    self.mem.set_active(True)
    self.swap.set_active(True)
    self.disks.set_active(True)
    self.lIP.set_active(False)
    self.batt.set_active(True)
    self.pwr.set_active(True)
    self.local.set_active(False)
    self.cblocks.set_active(False)
    
    _ensure_separator_uncommented()

def set_checkboxes_small(self):
    """set the state of the checkboxes and ensure separator is uncommented"""
    self.title.set_active(True)
    self.os.set_active(False)
    self.host.set_active(False)
    self.kernel.set_active(True)
    self.uptime.set_active(True)
    self.packages.set_active(True)
    self.shell.set_active(True)
    self.display.set_active(False)
    self.de.set_active(True)
    self.wm.set_active(True)
    self.wmtheme.set_active(True)
    self.themes.set_active(True)
    self.icons.set_active(True)
    self.font.set_active(True)
    self.cursor.set_active(True)
    self.term.set_active(True)
    self.termfont.set_active(False)
    self.cpu.set_active(True)
    self.gpu.set_active(True)
    self.mem.set_active(True)
    self.swap.set_active(True)
    self.disks.set_active(False)
    self.lIP.set_active(False)
    self.batt.set_active(True)
    self.pwr.set_active(True)
    self.local.set_active(False)
    self.cblocks.set_active(False)
    
    _ensure_separator_uncommented()

def set_checkboxes_all(self):
    """set the state of the checkboxes and ensure separator is uncommented"""
    self.title.set_active(True)
    self.os.set_active(True)
    self.host.set_active(True)
    self.kernel.set_active(True)
    self.uptime.set_active(True)
    self.packages.set_active(True)
    self.shell.set_active(True)
    self.display.set_active(True)
    self.de.set_active(True)
    self.wm.set_active(True)
    self.wmtheme.set_active(True)
    self.themes.set_active(True)
    self.icons.set_active(True)
    self.font.set_active(True)
    self.cursor.set_active(True)
    self.term.set_active(True)
    self.termfont.set_active(True)
    self.cpu.set_active(True)
    self.gpu.set_active(True)
    self.mem.set_active(True)
    self.swap.set_active(True)
    self.disks.set_active(True)
    self.lIP.set_active(True)
    self.batt.set_active(True)
    self.pwr.set_active(True)
    self.local.set_active(True)
    self.cblocks.set_active(True)
    
    _ensure_separator_uncommented()
    
def set_checkboxes_none(self):
    """set the state of the checkboxes and comment out separator in config.jsonc"""
    self.title.set_active(False)
    self.os.set_active(False)
    self.host.set_active(False)
    self.kernel.set_active(False)
    self.uptime.set_active(False)
    self.packages.set_active(False)
    self.shell.set_active(False)
    self.display.set_active(False)
    self.de.set_active(False)
    self.wm.set_active(False)
    self.wmtheme.set_active(False)
    self.themes.set_active(False)
    self.icons.set_active(False)
    self.font.set_active(False)
    self.cursor.set_active(False)
    self.term.set_active(False)
    self.termfont.set_active(False)
    self.cpu.set_active(False)
    self.gpu.set_active(False)
    self.mem.set_active(False)
    self.swap.set_active(False)
    self.disks.set_active(False)
    self.lIP.set_active(False)
    self.batt.set_active(False)
    self.pwr.set_active(False)
    self.local.set_active(False)
    self.cblocks.set_active(False)
    
    _ensure_separator_commented()

def _ensure_separator_uncommented():
    """Ensure the separator in config.jsonc is uncommented"""
    if fn.path.isfile(fn.fastfetch_config):
        with open(fn.fastfetch_config, "r", encoding="utf-8") as f:
            lines = f.readlines()
        
        for i, line in enumerate(lines):
            if '"separator"' in line and line.strip().startswith('//'):
                lines[i] = line.lstrip('/')

        with open(fn.fastfetch_config, "w", encoding="utf-8") as f:
            f.writelines(lines)

def _ensure_separator_commented():
    """Ensure the separator in config.jsonc is commented out"""
    if fn.path.isfile(fn.fastfetch_config):
        with open(fn.fastfetch_config, "r", encoding="utf-8") as f:
            lines = f.readlines()
        
        for i, line in enumerate(lines):
            if '"separator"' in line and not line.strip().startswith('//'):
                lines[i] = '//' + line

        with open(fn.fastfetch_config, "w", encoding="utf-8") as f:
            f.writelines(lines)