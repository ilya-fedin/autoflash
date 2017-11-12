// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.

var {BrowserWindow} = require('electron').remote;
var remote = require('electron').remote;
var os = require('os');
var fs = require('fs');
var exec = require('child_process').exec;
var spawn = require('child_process').spawn;
var path = require('path');
var iconv = require('iconv-lite');
var SerialPort = require('serialport');
var wmi = require('node-wmi');
var osLocale = require('os-locale');
var winston = require('winston');

var app = angular.module('autoflash', ['ngMaterial', 'ngRoute', 'localize']);

var asarPath, logger, skip_all, agr_mode, agr_cmd, agr_port, agr_flash_port, agr_dload_port, mode, port, port_number, flash_port, flash_port_number, dload_port, dload_port_number, model, version, manualMode, unknownModel;

function readFile(src, callback) {
	if(typeof asarPath == 'undefined' || asarPath === null)
		fs.readFile(src, callback);
	else
		fs.readFile(path.join(asarPath, src), callback);
}

function addZero(i) {
	return (i < 10)? "0" + i: i;
}

function error_handler(func, args, callback) {
	logger.error(func.name + ' ' + JSON.stringify(args));
	if(skip_all === true) {
		var localize = angular.injector(["ng", "localize"]).get("localize");
		var processing = angular.element(document.querySelector('#processing'));
		processing.append('<p>' + localize('Получена ошибка, но мы её пропускаем.') + '</p>');
		processing.append('<br>');
	} else {
		var $mdDialog = angular.element(document.querySelector('div[ng-controller="MainController"]')).injector().get("$mdDialog");
		$mdDialog.show({
			controller: function($scope, $mdDialog) {
				$scope.setAction = function(action) {
					$mdDialog.hide();
					switch(action) {
						case 's':
						case 'S':
							if(typeof(callback) == 'function') callback();
							break;
						case 'e':
						case 'E':
							main();
							break;
						case 'a':
						case 'A':
							skip_all = true;
							break;
						default:
							if(args && typeof(args) == 'object') func.apply(this, args);
							else func();
							break;
					}
				}
			},
			templateUrl: 'dialogs/errorhandler.html'
		});
	}
}

function sendcmd(command, port, callback) {
	return new Promise(function(resolve, reject) {
		setTimeout(function() {
			try {
				var atscr = new SerialPort(port, function(err) {
					if(err) {
						if(typeof(callback) == 'function') error_handler(sendcmd, [command, port, callback], callback);
						else error_handler(sendcmd, [command, port, resolve], resolve);
						return false;
					}
					atscr.flush(function(err) {
						if(err) {
							if(typeof(callback) == 'function') error_handler(sendcmd, [command, port, callback], callback);
							else error_handler(sendcmd, [command, port, resolve], resolve);
							return false;
						}
						atscr.write(command + '\r', function(err) {
							if(err) {
								if(typeof(callback) == 'function') error_handler(sendcmd, [command, port, callback], callback);
								else error_handler(sendcmd, [command, port, resolve], resolve);
								return false;
							}
							atscr.drain(function(err) {
								if(err) {
									if(typeof(callback) == 'function') error_handler(sendcmd, [command, port, callback], callback);
									else error_handler(sendcmd, [command, port, resolve], resolve);
									return false;
								}
								var answer_timeout = setTimeout(function() {
									atscr.close(function() {
										if(typeof(callback) == 'function') error_handler(sendcmd, [command, port, callback], callback);
										else error_handler(sendcmd, [command, port, resolve], resolve);
									});
								}, 1000);
								atscr.once('data', function(data) {
									atscr.close(function() {
										clearTimeout(answer_timeout);
										if(typeof(callback) == 'function') callback(data);
										else resolve(data);
									});
								});
							});
						});
					});
				});
				atscr.on('error', function(err) {
					if(typeof(callback) == 'function') error_handler(sendcmd, [command, port, callback], callback);
					else error_handler(sendcmd, [command, port, resolve], resolve);
				});
			} catch(e) {
				if(typeof(callback) == 'function') error_handler(sendcmd, [command, port, callback], callback);
				else error_handler(sendcmd, [command, port, resolve], resolve);
			}
		}, 100);
	});
}

function e3372h(callback) {
	logger.info('Flashing mode: E3372h Normal');
	var flash = new Flash();
	flash.flash_firmware('e3372h', null, function() {
		flash.flash_webui('e3372h', null, function() {
			if(typeof(callback) == 'function') callback();
		});
	});
}

function e3372h_dload(callback) {
	logger.info('Flashing mode: E3372h BOOT');
	var flash = new Flash();
	flash.dload('e3372h', function() {
		flash.flash_firmware('e3372h', 'dload', function() {
			flash.flash_webui('e3372h', null, function() {
				if(typeof(callback) == 'function') callback();
			});
		});
	});
}

function e3372s(callback) {
	logger.info('Flashing mode: E3372s Normal');
	var flash = new Flash();
	flash.flash_technological('e3372s', null, function() {
		flash.flash_health('e3372s', null, function() {
			flash.flash_firmware('e3372s', null, function() {
				flash.flash_webui('e3372s', null, function() {
					if(typeof(callback) == 'function') callback();
				});
			});
		});
	});
}

function e3372s_old(callback) {
	logger.info('Flashing mode: E3372s Old');
	var flash = new Flash();
	flash.flash_health('e3372s', null, function() {
		flash.flash_firmware('e3372s', null, function() {
			flash.flash_webui('e3372s', null, function() {
				if(typeof(callback) == 'function') callback();
			});
		});
	});
}

function e3372s_dload(callback) {
	logger.info('Flashing mode: E3372s BOOT');
	var flash = new Flash();
	flash.dload('e3372s', function() {
		flash.flash_health('e3372s', 'dload', function() {
			flash.flash_firmware('e3372s', null, function() {
				flash.flash_webui('e3372s', null, function() {
					if(typeof(callback) == 'function') callback();
				});
			});
		});
	});
}

function start() {
	location.hash = '#!Processing';
}

function manualmode() {
	location.hash = '#!ManualMode';
}

function unknown_model() {
	logger.warn('Unknown model!');
	logger.info('Model: ' + model);
	logger.info('Firmware: ' + version);
	unknownModel = true;
	manualmode();
}

function end() {
	var localize = angular.injector(["ng", "localize"]).get("localize");
	var processing = angular.element(document.querySelector('#processing'));
	processing.append('<br>');
	processing.append('<p>' + localize('Для выхода в главное меню нажмите любую клавишу') + '</p>');
	setTimeout(function() {
		angular.element(document).on('keydown', function(e) {
			angular.element(document).off('keydown');
			main();
		});
	}, 0);
}

function main() {
	function _main($rootScope) {
		var logTitle = 'autoflash - ' + now.toString();

		fs.writeFile(logfile,
			new Array(logTitle.length + 1).join('*') + "\r\n" +
			logTitle + "\r\n" +
			new Array(logTitle.length + 1).join('*') + "\r\n" +
			"\r\n");

		logger = winston.createLogger({
			format: winston.format.printf(info => {
				return `[${info.level}] ${info.message}`;
			}),
			transports: [
				new winston.transports.Console(),
				new winston.transports.File({ filename: logfile })
			]
		});

		mode = 'auto';
		unknownModel = false;
		skip_all = false;

		port = '';
		port_number = '';
		flash_port = '';
		flash_port_numer = '';
		dload_port = '';
		dload_port_number = '';

		if(!agr_mode) {
			location.hash = '#!MainMenu';
		} else {
			mode = agr_mode;
			logger.info('Autoflash mode: ' + mode );
			start();
		}
	}

	var now = new Date();

	var logfile = os.homedir() + '/autoflash/autoflash.' + String(now.getFullYear()) +
	String(addZero(now.getMonth()+1)) + String(addZero(now.getDate())) + '-' +
	String(addZero(now.getHours())) + String(addZero(now.getMinutes()) +
	String(addZero(now.getSeconds()))) + '.log';

	fs.access(path.dirname(logfile), fs.constants.R_OK | fs.constants.W_OK, function(err) {
		if(err) fs.mkdir(path.dirname(logfile), _main);
		else _main();
	});

	_main();
}

app.directive('localizeTitle', function(localizeFactory) {
	return localizeFactory();
});

app.config(function($routeProvider, $locationProvider, $mdThemingProvider) {
	if(/.asar$/.test(__dirname)) {
		asarPath = __dirname;
		process.chdir(__dirname + '.unpacked');
	} else
		process.chdir(__dirname);

	if(path.basename(remote.process.argv[0]) == 'autoflash.exe') {
		agr_mode = remote.process.argv[1];
		agr_cmd = remote.process.argv[2];
		agr_port = remote.process.argv[3];
		agr_flash_port = remote.process.argv[4];
		agr_dload_port = remote.process.argv[5];
	} else if(path.basename(remote.process.argv[0]) == 'electron.exe') {
		agr_mode = remote.process.argv[2];
		agr_cmd = remote.process.argv[3];
		agr_port = remote.process.argv[4];
		agr_flash_port = remote.process.argv[5];
		agr_dload_port = remote.process.argv[6];
	}

	switch(osLocale.sync()) {
		case 'ru_RU': window.i18n = require('./langs/ru.js'); break;
		default: window.i18n = require('./langs/en.js'); break;
	}

	$mdThemingProvider.theme('default')
		.primaryPalette('teal')
		.accentPalette('lime');

	$routeProvider
		.when('/MainMenu', {
			templateUrl: 'pages/mainmenu.html',
			controller: 'MainMenuController'
		})
		.when('/ManualMode', {
			templateUrl: 'pages/manualmode.html',
			controller: 'ManualModeController'
		})
		.when('/Processing', {
			templateUrl: 'pages/processing.html',
			controller: 'ProcessingController'
		});
});

app.run(main);

app.controller('MainController', function($scope) {
	$scope.minimize = function() {
		BrowserWindow.getFocusedWindow().minimize();
	}

	$scope.close = function() {
		BrowserWindow.getFocusedWindow().close();
	}
});