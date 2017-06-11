#!/bin/sh
. ./variables.sh

cat <<EOF > autoflash.rc
1 VERSIONINFO
FILEVERSION $VERSION
PRODUCTVERSION $VERSION
FILEOS 0x40004
FILETYPE 0x1
{
BLOCK "StringFileInfo"
{
	BLOCK "040904b0"
	{
		VALUE "CompanyName", "Ilya Fedin"
		VALUE "FileDescription", "Autoflasher for E3372"
		VALUE "FileVersion", "$STRINGVERSION"
		VALUE "InternalName", "autoflash.exe"
		VALUE "LegalCopyright", "Copyright (C) 2016-2017 Ilya Fedin. All rights reserved."
		VALUE "OriginalFilename", "autoflash.exe"
		VALUE "ProductName", "Autoflasher for E3372"
		VALUE "ProductVersion", "$STRINGVERSION"
		VALUE "SquirrelAwareVersion", "1"
	}
}

BLOCK "VarFileInfo"
{
	VALUE "Translation", 0x0409 0x04B0  
}
}
EOF