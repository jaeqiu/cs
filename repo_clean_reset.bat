@echo off
color 0c
cls
echo Final warning: by pressing any key you will lose all changes and revert to the remote version. Close this window to cancel.
pause
git fetch origin && git reset --hard origin/main && git clean -fd && git rm -r --cached .  && git add . && timeout /t 2 /nobreak >nul
exit