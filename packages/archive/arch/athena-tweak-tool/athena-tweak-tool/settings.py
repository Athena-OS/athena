# ============================================================
# Authors: Brad Heffernan - Erik Dubois - Cameron Percival
# ============================================================
# pylint:disable=W0621

import configparser
from functions import config

settings = config


def make_file(section, key):
    """make file"""
    config = configparser.ConfigParser()
    config[section] = key
    with open(settings, "w", encoding="utf-8") as configfile:
        config.write(configfile)


def new_settings(section, key):
    """new settings"""
    config = configparser.ConfigParser()
    config.read(settings)
    config[section] = key

    with open(settings, "w", encoding="utf-8") as configfile:
        config.write(configfile)


def write_settings(section, key, value):
    """write settings"""
    config = configparser.ConfigParser()
    config.read(settings)

    config[section][key] = value
    with open(settings, "w", encoding="utf-8") as configfile:
        config.write(configfile)


def read_section():
    """read section"""
    config = configparser.ConfigParser()
    config.read(settings)

    return config.sections()


def read_settings(section, key):
    """read settings"""
    config = configparser.ConfigParser()
    config.read(settings)

    return config[section][key]
