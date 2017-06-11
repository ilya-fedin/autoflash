sh genversioninfo.sh
ResourceHacker -open autoflash.rc -save autoflash.res -action compile -log NUL
ResourceHacker -script autoflash.txt
upx --best autoflash.sfx
copy /b autoflash.sfx + autoflash.7z autoflash.exe
del /Q autoflash.rc autoflash.res autoflash.sfx
@echo.
@pause