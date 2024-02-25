#!/usr/bin/env python3

# I hate this but i don't want to make it a pip package, its a script.
import sys
sys.path.append('scripts/')

from pathlib import Path
from path_utils import get_uncommon_path

def _check(a: str, b: str):
    new_a, new_b = get_uncommon_path(Path(a), Path(b))

    print(new_a, new_b)
    assert new_a != new_b

def test_differnet_child():
    _check('a/a_dir', 'b/b_dir')

def test_same_parent():
    _check('a/dir', 'b/dir')

def test_not_same_length():
    _check('a/dir', 'c/e/b/dir')

def test_not_same_length_exceed():
    _check('a/dir', 'c/e/a/dir')
