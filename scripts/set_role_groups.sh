#!/bin/bash

# Check if directory is provided as an argument
if [ -z "$1" ]; then
  echo "Usage: $0 <directory>"
  exit 1
fi

# Directory to search in
SEARCH_DIR="$1"

# Function to add role to the groups array if necessary
add_role_if_needed() {
  local groups_line="$1"
  local role="$2"

  # Check if the role is already present
  if [[ ! "$groups_line" =~ "'$role'" ]]; then
    # Insert the role at the beginning of the list (you can also modify this for a different insertion point)
    groups_line="'$role' ${groups_line}"

    echo "$groups_line"
  else
    echo "$groups_line"
  fi
}

# Function to process each PKGBUILD file
process_pkgbuild() {
  local file="$1"
  local modified=0

  # Read the PKGBUILD file
  while IFS= read -r line; do
    # If a line contains "groups="
    if [[ "$line" =~ ^groups= ]]; then
      original_groups="$(awk '/^groups=/{g=1} g {if ($0 ~ /\)/) {g=0}; print}' $file)"
      aligned_groups="$(echo $original_groups | tr -d '\n' | sed -e "s/groups=(//" -e "s/)//" | tr -s ' ' '\n' | awk 'NF {printf "%s ", $0}' | sed 's/ $//')"

      # Check and add appropriate roles
      new_groups="$aligned_groups"
      if [[ "$aligned_groups" =~ athena-cracker|athena-crypto ]]; then
        new_groups=$(add_role_if_needed "$new_groups" "role-cracker")
      fi
      if [[ "$aligned_groups" =~ athena-dos ]]; then
        new_groups=$(add_role_if_needed "$new_groups" "role-dos")
      fi
      if [[ "$aligned_groups" =~ athena-forensic ]]; then
        new_groups=$(add_role_if_needed "$new_groups" "role-forensic")
      fi
      if [[ "$aligned_groups" =~ athena-binary|athena-debugger|athena-decompiler|athena-disassembler|athena-malware|athena-reversing ]]; then
        new_groups=$(add_role_if_needed "$new_groups" "role-malware")
      fi
      if [[ "$aligned_groups" =~ athena-mobile|athena-reversing ]]; then
        new_groups=$(add_role_if_needed "$new_groups" "role-mobile")
      fi
      if [[ "$aligned_groups" =~ athena-ids|athena-networking|athena-proxy|athena-radio|athena-sniffer|athena-spoof|athena-tunnel|athena-wireless ]]; then
        new_groups=$(add_role_if_needed "$new_groups" "role-network")
      fi
      if [[ "$aligned_groups" =~ athena-recon|athena-social ]]; then
        new_groups=$(add_role_if_needed "$new_groups" "role-osint")
      fi
      if [[ "$aligned_groups" =~ athena-cracker|athena-database|athena-debugger|athena-decompiler|athena-exploitation|athena-fuzzer|athena-networking|athena-recon|athena-scanner|athena-sniffer|athena-spoof|athena-webapp|athena-windows ]]; then
        new_groups=$(add_role_if_needed "$new_groups" "role-redteamer")
      fi
      if [[ "$aligned_groups" =~ athena-webapp|athena-fuzzer ]]; then
        new_groups=$(add_role_if_needed "$new_groups" "role-webpentester")
      fi

      # If the groups line was modified, write it back to the file
      if [[ "$new_groups" != "$aligned_groups" ]]; then
        modified=1
        new_groups="groups=($new_groups)"
        original_groups=$(echo "$original_groups" | sed ':a;N;$!ba;s/\n/\\n/g') # The next sed needs to have \n character explicitely written
        new_groups=$(echo -e "$new_groups" | awk '{line=""; first=1; for(i=1;i<=NF;i++) {if(length(line)+length($i)+1>80) {if(first) {print line} else {print "        " line} line=$i; first=0} else {line=(length(line)>0?line" ":"")$i}}} END {if(first) print line; else print "        " line}' | sed ':a;N;$!ba;s/\n/\\n/g') # Split on newlines when reached the 80th character and adding initial spaces on each new line. The last sed command is used to have \n character explicitely written because the next sed command needs raw \n string to work correctly.
        sed -zi "s/$original_groups/$new_groups/g" "$file"
      fi
    fi
  done < "$file"

  # If the file was modified, notify the user
  if [ $modified -eq 1 ]; then
    echo "Modified: $file"
  fi
}

# Recursively find all PKGBUILD files and process them
find "$SEARCH_DIR" -type f -name 'PKGBUILD' | while read -r pkgbuild_file; do
  process_pkgbuild "$pkgbuild_file"
done