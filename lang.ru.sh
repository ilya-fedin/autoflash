#!/bin/sh
# Language: Russian
# Translater: ilya-fedin
# Original Language

# Lang Variable
LANG=ru

# Title
DIALOG_TITLE='Автоматический прошивальщик для E3372'

# Hello Screen
DIALOG_HELLO='Здравствуйте! Добро пожаловать в автоматический прошивальщик E3372, он поможет Вам прошить модем без траты нервов :)'
DIALOG_MODE='Итак, выберите режим прошивальщика (по умолчанию первый режим):'
DIALOG_MODE_ONE='1 - полностью автоматическая прошивка'
DIALOG_MODE_ONE_DESC_LINE_ONE='За исключением действий, которые требуют вашего физического вмешательства. Например, замыкание иглы.'
DIALOG_MODE_ONE_DESC_LINE_TWO='Также будут запросы, если не удастся распознать модем автоматически.'
DIALOG_MODE_ONE_DESC_LINE_THREE='Выбирается младший порт, имеющий в названии PC UI Interface.'
DIALOG_MODE_TWO='2 - с указанием порта'
DIALOG_MODE_TWO_DESC_LINE_ONE='Вам придется ввести номера портов вручную, однако в этом режиме можно шить сразу несколько модемов.'
DIALOG_MODE_TWO_DESC_LINE_TWO='Всегда вписывайте номер порта PC UI Interface!'
DIALOG_MODE_THREE='3 - полностью ручной режим'
DIALOG_MODE_THREE_DESC_LINE_ONE='Вы получаете доступ к оболочке прошивальщика.'
DIALOG_MODE_THREE_DESC_LINE_TWO='Учтите, что работают как внутренние команды, так и системные - можно навредить системе!'
DIALOG_END='Для выхода в главное меню нажмите любую клавишу'

# Modem Verify
DIALOG_MODEL='Модель'
DIALOG_FIRMWARE_VERSION='Версия прошивки'
DIALOG_IS_MODDED='На этом модеме сейчас стоит модифицированная прошивка?'

# Unknown Model
DIALOG_UNKNOWN_MODEL='ВНИМАНИЕ!!! Обнаружена неизвестная модель! Вы уверены, что это E3372?'
DIALOG_UNKNOWN_MODEL_WARNING_LINE_ONE='Если Вы уверены, что у вас E3372, и все же хотите продолжить, введите код.'
DIALOG_UNKNOWN_MODEL_WARNING_LINE_TWO='Но лучше обратитесь на 4PDA в тему E3372 с указанием того, что написано в полях Модель и Версия прошивки!'

# Codes
DIALOG_CODES='Коды'
DIALOG_CODES_MODE_PORT='установить режим с указанием портов'
DIALOG_CODES_E3372H='прошить E3372h'
DIALOG_CODES_E3372H_DLOAD='прошить E3372h через иглу'
DIALOG_CODES_E3372S='прошить E3372s'
DIALOG_CODES_E3372S_OLD='прошить E3372s <2x.300.xx.xx.xx (или прошитый)'
DIALOG_CODES_E3372S_DLOAD='прошить E3372s через иглу'
DIALOG_CODES_FUNCTIONS='подробное описание всех команд прошивальщика'
DIALOG_CODES_HELP='системные команды'
DIALOG_CODES_RETURN='вернуться в главное меню'
DIALOG_CODES_EXIT='выйти из программы'
DIALOG_CODES_ENTER='Введите код и нажмите Enter.'

# Detect
DIALOG_PORT_NUMBER='Введите номер порта (пример: COM9) и нажмите Enter'
DIALOG_MODEM_SEARCH='Ищу модем...'
DIALOG_SHORT_DLOAD_POINT='Замкните контакт аварийной загрузки и нажмите любую клавишу'
DIALOG_HILINK_IP='Введите IP модема (пример: 192.168.8.1) и нажмите Enter'
DIALOG_TRY_OPEN_PORT='Пытаюсь открыть порт...'

# Flashing
DIALOG_FLASH_TECHNOLOGICAL='Шью переходную...'
DIALOG_FLASH_HEALTH='Шью лечебную...'
DIALOG_FLASH_FIRMWARE='Шью рабочую...'
DIALOG_FLASH_WEBUI='Шью веб-интерфейс...'
DIALOG_DLOAD='Загружаю загрузчик...'
DIALOG_FACTORY='Вхожу в Factory Mode...'
DIALOG_GODLOAD='Переключаю режим загрузки...'

# Error Handler
DIALOG_WHAT_TO_DO='Что делать?'
DIALOG_WHAT_TO_DO_SKIP='пропустить'
DIALOG_WHAT_TO_DO_RETRY='повторить'
DIALOG_WHAT_TO_DO_EXIT='выйти'
DIALOG_WHAT_TO_DO_SKIP_ALL='пропустить всё'
DIALOG_SUCCESS='УСПЕХ'
DIALOG_ERROR='ОШИБКА'