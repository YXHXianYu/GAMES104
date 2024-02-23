@echo off

Remove-Item .\bin -Recurse -Force -Confirm:$false
Remove-Item .\build -Recurse -Force -Confirm:$false

cmake -S . -B build
cmake --build build --config Release