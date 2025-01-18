#!/usr/bin/env python3

# I hate this but i don't want to make it a pip package, its a script.
import sys
from typing import List, Optional, Tuple
sys.path.append('scripts/')

from pathlib import Path
from path_utils import get_exclusive_paths, Pane

def _fake_pane(path: str, program: Optional[str]):
    return Pane({'pane_current_path': path}, program)

def _check(expected: List[Tuple[str, Optional[str], str]]):
    """check expected displayed paths

    Args:
        expected (List[Tuple[str, Optional[str], str]]): list of (full_path, program, expected_display)
    E.g:
        _check([
            ('a/dir', 'p1', 'dir'), # Program p1 in a/dir will display dir (will be formated to p1:dir)
            ('b/dir', None, 'b/dir'), # Shell in b/dir will display b/dir
            ('c/dir', None', 'c/dir'), # Shell in c/dir will display c/dir
        ])
    """
    panes = [_fake_pane(full, program) for full, program, _ in expected]
    exclusive_panes = get_exclusive_paths(panes)
    for (full, _, expected_display), (_, display) in zip(expected, exclusive_panes):
        assert str(display) == expected_display

def test_not_intersect():
    _check([
        ('a/a_dir', None, 'a_dir'),
        ('b/b_dir', None, 'b_dir'),
    ])

    _check([
        ('a', None, 'a'),
        ('b', None, 'b'),
    ])

    _check([
        ('a', None, 'a'),
        ('b', None, 'b'),
        ('c', None, 'c'),
    ])

def test_basic_intersect():
    _check([
        ('a/dir', None, 'a/dir'),
        ('b/dir', None, 'b/dir'),
    ])

def test_not_same_length():
    _check([
        ('a/b/dir', None, 'a/b/dir'),
        ('b/dir', None, 'b/dir'),
    ])

def test_reacurring_dir():
    _check([
        ('a/dir', None, 'a/dir'),
        ('b/dir', None, 'b/dir'),
        ('c/dir', None, 'c/dir'),
    ])

def test_same_path_twice_dir():
    _check([
        ('a/dir', None, 'a/dir'),
        ('a/dir', None, 'a/dir'),
        ('b/dir', None, 'b/dir'),
    ])

    _check([
        ('a/dir', None, 'a/dir'),
        ('b/dir', None, 'b/dir'),
        ('a/dir', None, 'a/dir'),
    ])

    _check([
        ('a/dir', None, 'a/dir'),
        ('b/dir', None, 'b/dir'),
        ('b/dir', None, 'b/dir'),
        ('a/dir', None, 'a/dir'),
    ])

    _check([
        ('a/dir', None, 'a/dir'),
        ('b/dir', None, 'b/dir'),
        ('a/dir', None, 'a/dir'),
        ('b/dir', None, 'b/dir'),
    ])

    _check([
        ('a/dir', None, 'a/dir'),
        ('b/dir', None, 'b/dir'),
        ('c/dir', None, 'c/dir'),
        ('a/dir', None, 'a/dir'),
        ('b/dir', None, 'b/dir'),
        ('c/dir', None, 'c/dir'),
    ])

def test_mixed_basic():
    _check([
        ('a/dir', None, 'a/dir'),
        ('b/dir', None, 'b/dir'),
        ('c/c_dir', None, 'c_dir'),
    ])

    _check([
        ('a/b/c/d', None, 'a/b/c/d'),
        ('b/c/d', None, 'b/c/d'),
        ('dirrr', None, 'dirrr'),
    ])

def test_program_basic():
    _check([
        ('a/dir', 'p1', 'dir'),
        ('b/dir', None, 'dir'),
    ])

    _check([
        ('a/dir', 'p1', 'dir'),
        ('b/dir', 'p2', 'dir'),
    ])

    _check([
        ('a/dir', 'p1', 'a/dir'),
        ('b/dir', 'p1', 'b/dir'),
    ])

    _check([
        ('a/dir', 'p1', 'dir'),
        ('b/dir', 'p2', 'dir'),
    ])

def test_program_mixed():
    _check([
        ('a/dir', 'p1', 'dir'),
        ('b/dir', None, 'dir'),
        ('c/dir', 'p2', 'dir'),
    ])

    _check([
        ('a/dir', 'p1', 'dir'),
        ('b/dir', None, 'dir'),
        ('a/dir', 'p1', 'dir'),
        ('c/dir', 'p2', 'dir'),
    ])

    _check([
        ('a/dir', 'p1', 'a/dir'),
        ('b/dir', 'p1', 'b/dir'),
        ('a/dir', 'p1', 'a/dir'),
        ('c/dir', 'p2', 'dir'),
    ])
