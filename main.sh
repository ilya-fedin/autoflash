#!/bin/sh
# Autoflasher for E3372
# © Ilya Fedin, 2016-2017
# Email: fedin-ilja2010@ya.ru

PATH=".;$PATH"

agr_mode="$1"
agr_cmd="$2"
agr_port="$3"
agr_flash_port="$4"
agr_dload_port="$5"

case "$(wmic path Win32_OperatingSystem get Locale /format:value | grep '^Locale=' | awk -F[=] '{print $2}')" in
	0419)
			. lang.ru.sh
			;;
	*)
			. lang.en.sh
			;;
esac

cmd /C title $DIALOG_TITLE
cmd /C mode con:cols=131 lines=30

error_handler() {
	echo "[error] $1" >> "$logfile"
	echo -n "$DIALOG_ERROR! $DIALOG_WHAT_TO_DO [s($DIALOG_WHAT_TO_DO_SKIP)/R($DIALOG_WHAT_TO_DO_RETRY)/e($DIALOG_WHAT_TO_DO_EXIT)/a($DIALOG_WHAT_TO_DO_SKIP_ALL)] "
	if [ -n "$skip_all" ]; then
		echo 'a'
	else
		read action
	fi
	echo
	[ -n "$skip_all" ] || {
		case $action in
			[sS]) ;;
			[eE]) exit 1;;
			[aA]) skip_all='true';;
			*) eval "$1";;
		esac
	}
}

detect() {
	echo "[start] detect $@" >> "$logfile"
	case $mode in
		port)
			if [ -n "$agr_port" ]; then
				port="$agr_port"
			else
				echo -n "$DIALOG_PORT_NUMBER: "
				read port
				echo
			fi
			;;
		*)
			echo $DIALOG_MODEM_SEARCH
			while true; do
				hilink_index="$(wmic path Win32_NetworkAdapter where "PNPDeviceID like '%VID_12D1&PID_14DC%'" get Index /FORMAT:value 2>nul | grep '^Index=' | head -n1)"
				[ -n "$hilink_index" ] && {
					hilink_ip="$(wmic path Win32_NetworkAdapterConfiguration where $hilink_index GET DefaultIPGateway /format:value 2>nul | grep '^DefaultIPGateway=' | awk -F[=] '{print $2}' | sed -r 's/^{"(.*)"}$/\1/g')"
					[ -n "$hilink_ip" ] && {
						echo $DIALOG_TRY_OPEN_PORT
						curl -X POST -d @sw_project_mode.xml http://$hilink_ip/CGI >> "$logfile" 2>&1
						[ $? -eq 0 -o $? -eq 56 ] || { error_handler "detect $@"; return 1; }
					}
				}
				port="$(wmic path Win32_PnPEntity where "ClassGuid='{4d36e978-e325-11ce-bfc1-08002be10318}' and Name like '%PC UI Interface%'" get Name /FORMAT:value 2>nul | grep '^Name=' | head -n1 | awk -F[=] '{print $2}' | sed -r 's/.* \((COM[0-9]*)\)/\1/')"
				if [ "$1" = true ]; then
					[ -n "$port" ] && break
				else
					[ -n "$port" ] && {
						[ -n "$(atscr $port AT^DLOADINFO? | grep 'dload type:0')" ] && break
					}
				fi
			done
			echo -e "$DIALOG_SUCCESS!\n"
			;;
	esac
	echo "[info] Port: $port" >> "$logfile"
	port_number="$(echo $port | sed -r 's/COM([0-9]*)/\1/')"
	model="$(atscr $port AT^HWVER | grep -v AT | grep HWVER | sed -r 's/.*:\"(.*)\"/\1/')"
	[ -n "$model" ] || model="$(atscr $port AT^DLOADINFO? | grep 'product name' | sed -r 's/product name:(.*)/\1/')"
	version="$(atscr $port AT^DLOADINFO? | grep swver | sed -r 's/swver:(.*)/\1/')"
	echo "[success] detect $@" >> "$logfile"
}

detect_flash() {
	echo "[start] detect_flash" >> "$logfile"
	case $mode in
		port)
			if [ -n "$agr_flash_port" ]; then
				flash_port="$agr_flash_port"
			else
				echo -n "$DIALOG_PORT_NUMBER: "
				read flash_port
				echo
			fi
			;;
		*)
			echo $DIALOG_MODEM_SEARCH
			while true; do
				flash_port="$(wmic path Win32_PnPEntity where "ClassGuid='{4d36e978-e325-11ce-bfc1-08002be10318}' and (PNPDeviceID like '%VID_12D1&PID_1C05&MI_02%' or PNPDeviceID like '%VID_12D1&PID_1442&MI_00%')" get Name /FORMAT:value 2>nul | grep '^Name=' | head -n1 | awk -F[=] '{print $2}' | sed -r 's/.* \((COM[0-9]*)\)/\1/')"
				[ -n "$flash_port" ] && {
					[ -n "$(atscr $flash_port AT^DLOADINFO? | grep 'dload type:1')" ] && break
				}
			done
			echo -e "$DIALOG_SUCCESS!\n"
			;;
	esac
	echo "[info] Download port: $flash_port" >> "$logfile"
	flash_port_number="$(echo $flash_port | sed -r 's/COM([0-9]*)/\1/')"
	echo "[success] detect_flash" >> "$logfile"
}

detect_dload() {
	echo "[start] detect_dload" >> "$logfile"
	echo -n "$DIALOG_SHORT_DLOAD_POINT "
	cmd /C pause > nul
	echo
	echo
	case $mode in
		port)
			if [ -n "$agr_dload_port" ]; then
				dload_port="$agr_dload_port"
			else
				echo -n "$DIALOG_PORT_NUMBER: "
				read dload_port
				echo
			fi
			;;
		*)
			echo $DIALOG_MODEM_SEARCH
			while true; do
				dload_port="$(wmic path Win32_PnPEntity where "ClassGuid='{4d36e978-e325-11ce-bfc1-08002be10318}' and PNPDeviceID like '%VID_12D1&PID_1443%'" get Name /FORMAT:value 2>nul | grep '^Name=' | head -n1 | awk -F[=] '{print $2}' | sed -r 's/.* \((COM[0-9]*)\)/\1/')"
				[ -n "$dload_port" ] && break
			done
			echo -e "$DIALOG_SUCCESS!\n"
			;;
	esac
	echo "[info] Boot port: $dload_port" >> "$logfile"
	dload_port_number="$(echo $dload_port | sed -r 's/COM([0-9]*)/\1/')"
	echo "[success] detect_dload" >> "$logfile"
}

factory() {
	echo "[start] factory" >> "$logfile"
	detect false
	echo $DIALOG_FACTORY
	factory="$(atscr $port AT^SFM=1 | grep OK)"
	if [ -n "$factory" ]; then
		echo -e "$DIALOG_SUCCESS!\n"
	else
		error_handler "factory"
		return 1
	fi
	echo "[success] factory" >> "$logfile"
}

godload() {
	echo "[start] godload" >> "$logfile"
	detect false
	echo $DIALOG_GODLOAD
	godload="$(atscr $port AT^GODLOAD | grep OK)"
	if [ -n "$godload" ]; then
		echo -e "$DIALOG_SUCCESS!\n"
	else
		error_handler "godload"
		return 1
	fi
	echo "[success] godload" >> "$logfile"
}

dload() {
	echo "[start] dload $@" >> "$logfile"
	detect_dload
	echo -n $DIALOG_DLOAD
	if [ "$1" = e3372h ]; then
		balong_usbdload -p$dload_port_number -t ptable-hilink.bin usblsafe-3372h.bin
		[ $? -eq 0 ] && echo -e "$DIALOG_SUCCESS!\n" || { error_handler "dload $@"; return 1; }
	elif [ "$1" = e3372s ]; then
		balong_usbdload -p$dload_port_number usblsafe-3372s.bin
		[ $? -eq 0 ] && echo -e "$DIALOG_SUCCESS!\n" || { error_handler "dload $@"; return 1; }
	fi
	echo "[success] dload $@" >> "$logfile"
}

flash_technological() {
	echo "[start] flash_technological $@" >> "$logfile"
	[ "$2" != dload ] && {
		[ "$1" = e3372h ] && factory
		godload
	}
	detect_flash
	echo -n $DIALOG_FLASH_TECHNOLOGICAL
	if [ "$1" = e3372s ]; then
		balong_flash -p$flash_port_number -g1 technological_e3372s.bin
		[ $? -eq 0 ] && echo -e "$DIALOG_SUCCESS!\n" || { error_handler "flash_technological $@"; return 1; }
	fi
	echo "[success] flash_technological $@" >> "$logfile"
}

flash_health() {
	echo "[start] flash_health $@" >> "$logfile"
	[ "$2" != dload ] && {
		[ "$1" = e3372h ] && factory
		godload
	}
	detect_flash
	echo -n $DIALOG_FLASH_HEALTH
	if [ "$1" = e3372s ]; then
		balong_flash -p$flash_port_number health_e3372s.bin
		[ $? -eq 0 ] && echo -e "$DIALOG_SUCCESS!\n" || { error_handler "flash_health $@"; return 1; }
	fi
	echo "[success] flash_health $@" >> "$logfile"
}

flash_firmware() {
	echo "[start] flash_firmware $@" >> "$logfile"
	[ "$2" != dload ] && {
		[ "$1" = e3372h ] && factory
		godload
	}
	detect_flash
	echo -n $DIALOG_FLASH_FIRMWARE
	if [ "$1" = e3372h ]; then
		balong_flash -p$flash_port_number -g0 firmware_e3372h.bin
		[ $? -eq 0 ] && echo -e "$DIALOG_SUCCESS!\n" || { error_handler "flash_firmware $@"; return 1; }
	elif [ "$1" = e3372s ]; then
		balong_flash -p$flash_port_number firmware_e3372s.bin
		[ $? -eq 0 ] && echo -e "$DIALOG_SUCCESS!\n" || { error_handler "flash_firmware $@"; return 1; }
	fi
	echo "[success] flash_firmware $@" >> "$logfile"
}

flash_webui() {
	echo "[start] flash_webui $@" >> "$logfile"
	[ "$2" != dload ] && {
		godload
	}
	detect_flash
	echo -n $DIALOG_FLASH_WEBUI
	if [ "$1" = e3372h ]; then
		balong_flash -p$flash_port_number -g3 webui.bin
		[ $? -eq 0 ] && echo -e "$DIALOG_SUCCESS!\n" || { error_handler "flash_webui $@"; return 1; }
	elif [ "$1" = e3372s ]; then
		balong_flash -p$flash_port_number webui.bin
		[ $? -eq 0 ] && echo -e "$DIALOG_SUCCESS!\n" || { error_handler "flash_webui $@"; return 1; }
	fi
	echo "[success] flash_webui $@" >> "$logfile"
}

e3372h() {
	echo "[info] Flashing mode: E3372h Normal" >> "$logfile"
	flash_firmware e3372h
	flash_webui e3372h
}

e3372h_dload() {
	echo "[info] Flashing mode: E3372h BOOT" >> "$logfile"
	dload e3372h
	flash_firmware e3372h dload
	flash_webui e3372h
}

e3372s() {
	echo "[info] Flashing mode: E3372s Normal" >> "$logfile"
	flash_technological e3372s
	flash_health e3372s
	flash_firmware e3372s
	flash_webui e3372s
}

e3372s_old() {
	echo "[info] Flashing mode: E3372s Old" >> "$logfile"
	flash_health e3372s
	flash_firmware e3372s
	flash_webui e3372s
}

e3372s_dload() {
	echo "[info] Flashing mode: E3372s BOOT" >> "$logfile"
	dload e3372s
	flash_health e3372s dload
	flash_firmware e3372s
	flash_webui e3372s
}

codes() {
	echo "$DIALOG_CODES:"
	echo "	mode=port - $DIALOG_CODES_MODE_PORT"
	echo "	e3372h - $DIALOG_CODES_E3372H"
	echo "	e3372h_dload - $DIALOG_CODES_E3372H_DLOAD"
	echo "	e3372s - $DIALOG_CODES_E3372S"
	echo "	e3372s_old - $DIALOG_CODES_E3372S_OLD"
	echo "	e3372s_dload - $DIALOG_CODES_E3372S_DLOAD"
	echo "	functions - $DIALOG_CODES_FUNCTIONS"
	echo "	help - $DIALOG_CODES_HELP"
	echo "	return - $DIALOG_CODES_RETURN"
	echo "	exit - $DIALOG_CODES_EXIT"
	echo $DIALOG_CODES_ENTER
	echo
}

functions() {
	less functions.$LANG.txt
	echo
}

shell() {
	[ "$start_dir" ] || start_dir=$(echo $PWD | sed -r 's/\//\\\//g')
	while true; do
		echo -n "$USER@$COMPUTERNAME $(echo $PWD | sed -r "s/$start_dir/~/g") $ "
		read command
		eval "$command"
	done
}

unknown_model() {
	echo "[warning] Unknown model!" >> "$logfile"
	echo "[info] Model: $model" >> "$logfile"
	echo "[info] Firmware: $version" >> "$logfile"
	echo $DIALOG_UNKNOWN_MODEL
	echo "	$DIALOG_MODEL: $model"
	echo "	$DIALOG_FIRMWARE_VERSION: $version"
	echo
	echo $DIALOG_UNKNOWN_MODEL_WARNING_LINE_ONE
	echo $DIALOG_UNKNOWN_MODEL_WARNING_LINE_TWO
	echo
	codes
	shell
}

start() {
	clear
	detect true
	if [ "$(echo $model | grep CL2E3372HM)" ]; then
		echo "[info] Model: Huawei E3372h" >> "$logfile"
		echo "[info] Firmware: $version" >> "$logfile"
		echo "$DIALOG_MODEL: Huawei E3372h"
		echo "$DIALOG_FIRMWARE_VERSION: $version"
		echo
	elif [ "$(echo $model | grep CL1E3372SM)" ]; then
		echo "[info] Model: Huawei E3372s" >> "$logfile"
		echo "[info] Firmware: $version" >> "$logfile"
		echo "$DIALOG_MODEL: Huawei E3372s"
		echo "$DIALOG_FIRMWARE_VERSION: $version"
		echo
	fi
	if [ -n "$agr_cmd" ]; then
		eval "$agr_cmd"
	else
		if [ -n "$(echo $model | grep CL2E3372HM)" -o -n "$(echo $model | grep CL1E3372SM)" ]; then
			echo -n "$DIALOG_IS_MODDED [y/N] "
			read material
			echo
			case $material in
				[yY])
					echo "[info] Modded firmware: true" >> "$logfile"
					if [ -n "$(echo $model | grep CL2E3372HM)" ]; then
						e3372h
					elif [ -n "$(echo $model | grep CL1E3372SM)" ]; then
						e3372s_old
					else
						unknown_model
					fi
					;;
				*)
					echo "[info] Modded firmware: false" >> "$logfile"
					if [ -n "$(echo $model | grep CL2E3372HM)" ]; then
						if [ $(echo $version | sed -r 's/[0-9]*\.([0-9]*)\.[0-9]*\.[0-9]*\.[0-9]*/\1/') -gt 315 -o $(echo $version | sed -r 's/[0-9]*\.([0-9]*)\.[0-9]*\.[0-9]*\.[0-9]*/\1/') -eq 315 -a $(echo $version | sed -r 's/[0-9]*\.[0-9]*\.[0-9]*\.([0-9]*)\.[0-9]*/\1/') -gt 0 ]; then # игла
							e3372h_dload
						else
							e3372h
						fi
					elif [ -n "$(echo $model | grep CL1E3372SM)" ]; then
						if [ $(echo $version | sed -r 's/[0-9]*\.([0-9]*)\.[0-9]*\.[0-9]*\.[0-9]*/\1/') -lt 300 ]; then # старые модели без проверки подписи
							e3372s_old
						else
							e3372s
						fi
					else
						unknown_model
					fi
					;;
			esac
		else
			unknown_model
		fi
	fi
	echo
	echo -n "$DIALOG_END "
	cmd /C pause > nul
	clear
}

while true; do
	clear

	logfile="$HOME/autoflash/autoflash.$(date -Iseconds | awk -F+ '{print $1}' | sed 's/://g' | sed 's/-//g' | sed 's/T/-/g').log"

	[ -d "$(dirname "$logfile")" ] || mkdir -p "$(dirname "$logfile")"

	: > "$logfile"

	echo "************************************************************" >> "$logfile"
	echo "autoflash - $(date -R)" >> "$logfile"
	echo "************************************************************" >> "$logfile"
	echo >> "$logfile"	

	skip_all=false

	port=''
	port_number=''
	flash_port=''
	flash_port_numer=''
	dload_port=''
	dload_port_number=''

	echo $DIALOG_HELLO
	echo
	if [ ! -n "$agr_mode" ]; then
		echo $DIALOG_MODE
		echo "	$DIALOG_MODE_ONE"
		echo "		$DIALOG_MODE_ONE_DESC_LINE_ONE"
		echo "		$DIALOG_MODE_ONE_DESC_LINE_TWO"
		echo "		$DIALOG_MODE_ONE_DESC_LINE_THREE"
		echo "	$DIALOG_MODE_TWO"
		echo "		$DIALOG_MODE_TWO_DESC_LINE_ONE"
		echo "		$DIALOG_MODE_TWO_DESC_LINE_TWO"
		echo "	$DIALOG_MODE_THREE"
		echo "		$DIALOG_MODE_THREE_DESC_LINE_ONE"
		echo "		$DIALOG_MODE_THREE_DESC_LINE_TWO"
		echo -n ': '
		read start_mode
		echo
		case $start_mode in
			2)
				echo "[info] Autoflash mode: PORT" >> "$logfile"
				mode='port'
				start
				;;
			3)
				echo "[info] Autoflash mode: SHELL" >> "$logfile"
				clear
				codes
				shell
				;;
			*)
				echo "[info] Autoflash mode: AUTO" >> "$logfile"
				start
				;;
		esac
	else
		mode="$agr_mode"
		echo "[info] Autoflash mode: $mode" >> "$logfile"
		start
	fi
done
