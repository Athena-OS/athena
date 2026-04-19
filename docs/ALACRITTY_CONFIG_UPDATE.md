# Alacritty Configuration Update

## Overview
This document addresses the update needed for Alacritty configuration format due to version v0.12.0+ changes.

## Changes Made
- Updated wiki documentation from deprecated YAML format to TOML format
- Changed configuration filename reference from `alacritty.yaml` to `alacritty.toml`
- Updated shell configuration syntax from YAML to TOML format

## Before (YAML - deprecated):
```yaml
shell:
  program: /usr/bin/fish
  args:
    - --login
    - --init-command
    - neofetch
```

## After (TOML - current):
```toml
[shell]
program = "/usr/bin/fish"
args = ["--login", "--init-command", "neofetch"]
```

## References
- Alacritty v0.12.0 release notes: https://github.com/alacritty/alacritty/releases/tag/v0.12.0
- Wiki page updated: 5.-Troubleshooting
- Related issue: #333
