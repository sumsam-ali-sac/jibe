#!/usr/bin/env bash
# Installs Jibe (the template/ folder) into a project. Never overwrites by default.
#
# Usage:
#   bash install.sh /path/to/project          # safe: skips existing files
#   bash install.sh /path/to/project --force  # overwrite kit files
#
# Then open the project in Claude Code and run:  /adapt-setup
set -euo pipefail

target="${1:-}"
force="${2:-}"
if [[ -z "$target" ]]; then
  echo "Usage: bash install.sh /path/to/project [--force]" >&2
  exit 1
fi
script_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source_dir="$script_dir/template"
[[ -d "$source_dir" ]] || { echo "Template folder not found: $source_dir" >&2; exit 1; }
[[ -d "$target" ]] || { echo "Target folder not found: $target" >&2; exit 1; }
target="$(cd "$target" && pwd)"

# Files a project often already has: Jibe's version is saved next to them as a
# *.starter.* copy instead of being skipped, and /adapt-setup merges it in.
merge_name() {
  case "$1" in
    "CLAUDE.md") echo "CLAUDE.starter.md" ;;
    ".claude/settings.json") echo ".claude/settings.starter.json" ;;
    *) echo "" ;;
  esac
}

created=0; skipped=0; overwritten=0; to_merge=()
while IFS= read -r -d '' file; do
  rel="${file#"$source_dir"/}"
  dest="$target/$rel"
  mkdir -p "$(dirname "$dest")"
  alt="$(merge_name "$rel")"

  if [[ -e "$dest" && "$force" != "--force" && -n "$alt" ]]; then
    if [[ -e "$target/$alt" ]] || cmp -s "$dest" "$file"; then
      echo "  skipped    $rel (exists)"; skipped=$((skipped + 1))
    else
      cp "$file" "$target/$alt"
      echo "  merge      $rel exists -> kit version saved as $alt"
      to_merge+=("$alt"); created=$((created + 1))
    fi
  elif [[ -e "$dest" ]]; then
    if [[ "$force" == "--force" ]]; then
      cp "$file" "$dest"; echo "  overwrote  $rel"; overwritten=$((overwritten + 1))
    else
      echo "  skipped    $rel (exists)"; skipped=$((skipped + 1))
    fi
  else
    cp "$file" "$dest"; echo "  created    $rel"; created=$((created + 1))
  fi
done < <(find "$source_dir" -type f -print0 | sort -z)

# Personal/local files must not be committed (idempotent append).
gitignore="$target/.gitignore"
touch "$gitignore"
missing=()
for entry in "CLAUDE.local.md" ".claude/settings.local.json" ".claude/worktrees/"; do
  grep -qxF "$entry" "$gitignore" || missing+=("$entry")
done
if (( ${#missing[@]} > 0 )); then
  { echo ""; echo "# Claude Code (personal files)"; printf '%s\n' "${missing[@]}"; } >> "$gitignore"
  echo "  updated    .gitignore (+${#missing[@]} entries)"
fi

echo ""
echo "Done: $created created, $overwritten overwritten, $skipped skipped."
if (( ${#to_merge[@]} > 0 )); then
  echo "Needs merging (/adapt-setup does this): ${to_merge[*]}"
fi

# The hooks run on Node. Without it, the guard hooks silently do nothing.
node_major=0
if command -v node >/dev/null 2>&1; then
  node_major="$(node --version | sed -E 's/^v([0-9]+).*/\1/')"
fi
if (( node_major < 20 )); then
  echo ""
  echo "WARNING: Node 20+ was not found on PATH."
  echo "         The hooks in .claude/hooks (command blocking, file protection, auto-format) will NOT run."
  echo "         Install Node 20+ from https://nodejs.org or remove the hooks from .claude/settings.json."
fi

echo "Next: open $target in Claude Code and run /adapt-setup"
