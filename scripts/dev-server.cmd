@echo off
cd /d "%~dp0.."
set PATH=
"C:\Program Files\nodejs\node.exe" "%CD%\node_modules\vite\bin\vite.js" --configLoader runner > "%CD%\vite.log" 2> "%CD%\vite.err"
