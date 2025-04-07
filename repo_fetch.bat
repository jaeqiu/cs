@echo off
color 0b
git fetch && git pull && git status && timeout /t 2 /nobreak >nul
exit