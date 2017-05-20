// Language: Russian
// Translater: ilya-fedin
// Original Language

// Lang Variable
var LANG='ru';

// Title
var DIALOG_TITLE='Автоматический прошивальщик для E3372';

// Hello Screen
var DIALOG_HELLO='Здравствуйте! Добро пожаловать в автоматический прошивальщик E3372, он поможет Вам прошить модем без траты нервов :)';
var DIALOG_MODE='Итак, выберите режим прошивальщика (по умолчанию первый режим):';
var DIALOG_MODE_ONE='1 - полностью автоматическая прошивка';
var DIALOG_MODE_ONE_DESC_LINE_ONE='За исключением действий, которые требуют вашего физического вмешательства. Например, замыкание иглы.';
var DIALOG_MODE_ONE_DESC_LINE_TWO='Также будут запросы, если не удастся распознать модем автоматически.';
var DIALOG_MODE_ONE_DESC_LINE_THREE='Выбирается младший порт, имеющий в названии PC UI Interface.';
var DIALOG_MODE_TWO='2 - с указанием порта';
var DIALOG_MODE_TWO_DESC_LINE_ONE='Вам придется ввести номера портов вручную, однако в этом режиме можно шить сразу несколько модемов.';
var DIALOG_MODE_TWO_DESC_LINE_TWO='Всегда вписывайте номер порта PC UI Interface!';
var DIALOG_MODE_THREE='3 - полностью ручной режим';
var DIALOG_MODE_THREE_DESC_LINE_ONE='Вы получаете доступ к оболочке прошивальщика.';
var DIALOG_MODE_THREE_DESC_LINE_TWO='Учтите, что работают как внутренние команды, так и системные - можно навредить системе!';
var DIALOG_END='Для выхода в главное меню нажмите любую клавишу';

// Modem Verify
var DIALOG_MODEL='Модель';
var DIALOG_FIRMWARE_VERSION='Версия прошивки';
var DIALOG_IS_MODDED='На этом модеме сейчас стоит модифицированная прошивка?';

// Unknown Model
var DIALOG_UNKNOWN_MODEL='ВНИМАНИЕ!!! Обнаружена неизвестная модель! Вы уверены, что это E3372?';
var DIALOG_UNKNOWN_MODEL_WARNING_LINE_ONE='Если Вы уверены, что у вас E3372, и все же хотите продолжить, введите код.';
var DIALOG_UNKNOWN_MODEL_WARNING_LINE_TWO='Но лучше обратитесь на 4PDA в тему E3372 с указанием того, что написано в полях Модель и Версия прошивки!';

// Codes
var DIALOG_CODES='Коды';
var DIALOG_CODES_MODE_PORT='установить режим с указанием портов';
var DIALOG_CODES_E3372H='прошить E3372h';
var DIALOG_CODES_E3372H_DLOAD='прошить E3372h через иглу';
var DIALOG_CODES_E3372S='прошить E3372s';
var DIALOG_CODES_E3372S_OLD='прошить E3372s <2x.300.xx.xx.xx (или прошитый)';
var DIALOG_CODES_E3372S_DLOAD='прошить E3372s через иглу';
var DIALOG_CODES_FUNCTIONS='подробное описание всех команд прошивальщика';
var DIALOG_CODES_HELP='системные команды';
var DIALOG_CODES_RETURN='вернуться в главное меню';
var DIALOG_CODES_EXIT='выйти из программы';
var DIALOG_CODES_ENTER='Введите код и нажмите Enter.';

// Detect
var DIALOG_PORT_NUMBER='Введите номер порта (пример: COM9) и нажмите Enter';
var DIALOG_MODEM_SEARCH='Ищу модем...';
var DIALOG_SHORT_DLOAD_POINT='Замкните контакт аварийной загрузки и нажмите любую клавишу';
var DIALOG_HILINK_IP='Введите IP модема (пример: 192.168.8.1) и нажмите Enter';
var DIALOG_TRY_OPEN_PORT='Пытаюсь открыть порт...';

// Flashing
var DIALOG_FLASH_TECHNOLOGICAL='Шью переходную...';
var DIALOG_FLASH_HEALTH='Шью лечебную...';
var DIALOG_FLASH_FIRMWARE='Шью рабочую...';
var DIALOG_FLASH_WEBUI='Шью веб-интерфейс...';
var DIALOG_DLOAD='Загружаю загрузчик...';
var DIALOG_FACTORY='Вхожу в Factory Mode...';
var DIALOG_GODLOAD='Переключаю режим загрузки...';

// Error Handler
var DIALOG_WHAT_TO_DO='Что делать?';
var DIALOG_WHAT_TO_DO_SKIP='пропустить';
var DIALOG_WHAT_TO_DO_RETRY='повторить';
var DIALOG_WHAT_TO_DO_EXIT='выйти';
var DIALOG_WHAT_TO_DO_SKIP_ALL='пропустить всё';
var DIALOG_SUCCESS='УСПЕХ';
var DIALOG_ERROR='ОШИБКА';