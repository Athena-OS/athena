if status is-interactive
    # Commands to run in interactive sessions can go here
end

set -U fish_greeting ""

source ~/.bash_aliases

zoxide init fish | source

set -x BFETCH_INFO "pfetch"
set -x BFETCH_ART "cowsay '<3 Athena OS'"
set -x BFETCH_COLOR "$HOME/.local/textart/color/icon/panes.textart"

set -x PAYLOADS "/usr/share/payloads"
set -x SECLISTS "$PAYLOADS/seclists"
set -x PAYLOADSALLTHETHINGS "$PAYLOADS/payloadsallthethings"
set -x FUZZDB "$PAYLOADS/fuzzdb"
set -x AUTOWORDLISTS "$PAYLOADS/autowordlists"
set -x SECURITYWORDLIST "$PAYLOADS/security-wordlist"

set -x MIMIKATZ "/usr/share/windows/mimikatz/"
set -x POWERSPLOIT "/usr/share/windows/powersploit/"

set -x ROCKYOU "$SECLISTS/Passwords/Leaked-Databases/rockyou.txt"
set -x DIRSMALL "$SECLISTS/Discovery/Web-Content/directory-list-2.3-small.txt"
set -x DIRMEDIUM "$SECLISTS/Discovery/Web-Content/directory-list-2.3-medium.txt"
set -x DIRBIG "$SECLISTS/Discovery/Web-Content/directory-list-2.3-big.txt"
set -x WEBAPI_COMMON "$SECLISTS/Discovery/Web-Content/api/api-endpoints.txt"
set -x WEBAPI_MAZEN "$SECLISTS/Discovery/Web-Content/common-api-endpoints-mazen160.txt"
set -x WEBCOMMON "$SECLISTS/Discovery/Web-Content/common.txt"
set -x WEBPARAM "$SECLISTS/Discovery/Web-Content/burp-parameter-names.txt"


if status is-interactive
    # Commands to run in interactive sessions can go here
    if not set -q NO_REPETITION
        fastfetch
    end
end
