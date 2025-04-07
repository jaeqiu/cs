@echo off
::standard push
color 0e
git fetch && git pull 
cls

::gitignore update
color 0e
git rm -r --cached .  && git status 
cls

color 0b
git add . 
cls

color 0a
git status 
cls
::git ignore update

::standard push
color 0b
git status && git add . 
cls

color 0a
git commit -m "autosave" && git push 
cls

exit