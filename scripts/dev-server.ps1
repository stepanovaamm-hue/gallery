$root = Split-Path -Parent $PSScriptRoot
Set-Location $root

# The Codex Windows environment can contain both PATH and Path, which breaks
# child process startup in PowerShell. Keep the normal Path entry and drop PATH.
[Environment]::SetEnvironmentVariable('PATH', $null, 'Process')

& 'C:\Program Files\nodejs\node.exe' "$root\node_modules\vite\bin\vite.js" --configLoader runner *>&1 |
  Tee-Object -FilePath "$root\vite.log"
