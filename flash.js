class Flash {
	constructor() {
		var localize = angular.injector(["ng", "localize"]).get("localize");

		var detect = new Detect();
		var processing = angular.element(document.querySelector('#processing'));

		this.factory = function(callback) {
			logger.debug('factory - start');
			detect.detect(false, function() {
				processing.append('<p>' + localize('Вхожу в Factory Mode...') + '</p>');
				sendcmd('AT^SFM=1', port, function(data) {
					if(String(data).indexOf('OK') != -1) {
						processing.append('<p>' + localize('УСПЕХ') + '!</p>');
						processing.append('<br>');
					} else {
						error_handler(factory, [callback], callback);
						return false;
					}
					logger.debug('factory - success');
					if(typeof(callback) == 'function') callback();
				});
			});
		}

		var factory = this.factory;

		this.godload = function(callback) {
			logger.debug('godload - start');
			detect.detect(false, function() {
				processing.append('<p>' + localize('Переключаю режим загрузки...') + '</p>');
				sendcmd('AT^GODLOAD', port, function(data) {
					if(String(data).indexOf('OK') != -1) {
						processing.append('<p>' + localize('УСПЕХ') + '!</p>');
						processing.append('<br>');
					} else {
						error_handler(godload, [callback], callback);
						return false;
					}
					logger.debug('godload - success');
					if(typeof(callback) == 'function') callback();
				});
			});
		}

		var godload = this.godload;

		function _dload(dload_model, callback) {
			processing.append('<p>' + localize('Загружаю загрузчик...') + '</p>');
			if(dload_model == 'e3372h') {
				var balong_usbdload = spawn('balong_usbdload', ['-p' + dload_port_number, '-t', 'ptable-hilink.bin', 'usblsafe-3372h.bin']);
				var balong_usbdload_html = document.createElement('pre');
				processing.append(balong_usbdload_html);
				balong_usbdload.stdout.on('data', function(data) {
					angular.element(balong_usbdload_html).append(iconv.decode(data, 'cp866'));
					angular.element(balong_usbdload_html).html(angular.element(balong_usbdload_html).html().replace(/\r\n/g, '\n').replace(/.*\r/g, ''));
				});
				balong_usbdload.on('close', function(code) {
					if(code == 0) {
						processing.append('<p>' + localize('УСПЕХ') + '!</p>');
						processing.append('<br>');
						logger.debug('dload ' + dload_model + ' - success');
					} else {
						error_handler(dload, [dload_model, callback], callback);
						return false;
					}
					if(typeof(callback) == 'function') callback();
				});
			} else if(dload_model == 'e3372s') {
				var balong_usbdload = spawn('balong_usbdload', ['-p' + dload_port_number, 'usblsafe-3372s.bin']);
				var balong_usbdload_html = document.createElement('pre');
				processing.append(balong_usbdload_html);
				balong_usbdload.stdout.on('data', function(data) {
					angular.element(balong_usbdload_html).append(iconv.decode(data, 'cp866'));
					angular.element(balong_usbdload_html).html(angular.element(balong_usbdload_html).html().replace(/\r\n/g, '\n').replace(/.*\r/g, ''));
				});
				balong_usbdload.on('close', function(code) {
					if(code == 0) {
						processing.append('<p>' + localize('УСПЕХ') + '!</p>');
						processing.append('<br>');
						logger.debug('dload ' + dload_model + ' - success');
					} else {
						error_handler(dload, [dload_model, callback], callback);
						return false;
					}
					if(typeof(callback) == 'function') callback();
				});
			}
		}

		this.dload = function(dload_model, callback) {
			logger.debug('dload ' + dload_model + ' - start');
			detect.detect_dload(function() {
				_dload(dload_model, callback);
			});
		}

		var dload = this.dload;

		function _flash_technological(flash_model, flash_special, callback) {
			processing.append('<p>' + localize('Шью переходную...') + '</p>');
			if(flash_model == 'e3372s') {
				var balong_flash = spawn('balong_flash', ['-p' + flash_port_number, '-g1', 'technological_e3372s.bin']);
				var balong_flash_html = document.createElement('pre');
				processing.append(balong_flash_html);
				balong_flash.stdout.on('data', function(data) {
					angular.element(balong_flash_html).append(iconv.decode(data, 'cp866'));
					angular.element(balong_flash_html).html(angular.element(balong_flash_html).html().replace(/\r\n/g, '\n').replace(/.*\r/g, ''));
				});
				balong_flash.on('close', function(code) {
					if(code == 0) {
						processing.append('<p>' + localize('УСПЕХ') + '!</p>');
						processing.append('<br>');
						logger.debug('flash_technological ' + flash_model + ' ' + flash_special + ' - success');
					} else {
						error_handler(flash_technological, [flash_model, flash_special, callback], callback);
						return false;
					}
					if(typeof(callback) == 'function') callback();
				});
			}
		}

		this.flash_technological = function(flash_model, flash_special, callback) {
			logger.debug('flash_technological ' + flash_model + ' ' + flash_special + ' - start');
			if(flash_special != 'dload') {
				if(flash_model == 'e3372h') factory(function() {
					godload(function() {
						detect.detect_flash(function() {
							_flash_technological(flash_model, flash_special, callback);
						});
					});
				});
				else godload(function() {
					detect.detect_flash(function() {
						_flash_technological(flash_model, flash_special, callback);
					});
				});
			} else {
				detect.detect_flash(function() {
					_flash_technological(flash_model, flash_special, callback);
				});
			}
		}

		var flash_technological = this.flash_technological;

		function _flash_health(flash_model, flash_special, callback) {
			processing.append('<p>' + localize('Шью лечебную...') + '</p>');
			if(flash_model == 'e3372s') {
				var balong_flash = spawn('balong_flash', ['-p' + flash_port_number, 'health_e3372s.bin']);
				var balong_flash_html = document.createElement('pre');
				processing.append(balong_flash_html);
				balong_flash.stdout.on('data', function(data) {
					angular.element(balong_flash_html).append(iconv.decode(data, 'cp866'));
					angular.element(balong_flash_html).html(angular.element(balong_flash_html).html().replace(/\r\n/g, '\n').replace(/.*\r/g, ''));
				});
				balong_flash.on('close', function(code) {
					if(code == 0) {
						processing.append('<p>' + localize('УСПЕХ') + '!</p>');
						processing.append('<br>');
						logger.debug('flash_health ' + flash_model + ' ' + flash_special + ' - success');
					} else {
						error_handler(flash_health, [flash_model, flash_special, callback], callback);
						return false;
					}
					if(typeof(callback) == 'function') callback();
				});
			}
		}

		this.flash_health = function(flash_model, flash_special, callback) {
			logger.debug('flash_health ' + flash_model + ' ' + flash_special + ' - start');
			if(flash_special != 'dload') {
				if(flash_model == 'e3372h') factory(function() {
					godload(function() {
						detect.detect_flash(function() {
							_flash_health(flash_model, flash_special, callback);
						});
					});
				});
				else godload(function() {
					detect.detect_flash(function() {
						_flash_health(flash_model, flash_special, callback);
					});
				});
			} else {
				detect.detect_flash(function() {
					_flash_health(flash_model, flash_special, callback);
				});
			}
		}

		var flash_health = this.flash_health;

		function _flash_firmware(flash_model, flash_special, callback) {
			processing.append('<p>' + localize('Шью рабочую...') + '</p>');
			if(flash_model == 'e3372h') {
				var balong_flash = spawn('balong_flash', ['-p' + flash_port_number, '-g0', 'firmware_e3372h.bin']);
				var balong_flash_html = document.createElement('pre');
				processing.append(balong_flash_html);
				balong_flash.stdout.on('data', function(data) {
					angular.element(balong_flash_html).append(iconv.decode(data, 'cp866'));
					angular.element(balong_flash_html).html(angular.element(balong_flash_html).html().replace(/\r\n/g, '\n').replace(/.*\r/g, ''));
				});
				balong_flash.on('close', function(code) {
					if(code == 0) {
						processing.append('<p>' + localize('УСПЕХ') + '!</p>');
						processing.append('<br>');
						logger.debug('flash_firmware ' + flash_model + ' ' + flash_special + ' - success');
					} else {
						error_handler(flash_firmware, [flash_model, flash_special, callback], callback);
						return false;
					}
					if(typeof(callback) == 'function') callback();
				});
			} else if(flash_model == 'e3372s') {
				var balong_flash = spawn('balong_flash', ['-p' + flash_port_number, 'firmware_e3372s.bin']);
				var balong_flash_html = document.createElement('pre');
				processing.append(balong_flash_html);
				balong_flash.stdout.on('data', function(data) {
					angular.element(balong_flash_html).append(iconv.decode(data, 'cp866'));
					angular.element(balong_flash_html).html(angular.element(balong_flash_html).html().replace(/\r\n/g, '\n').replace(/.*\r/g, ''));
				});
				balong_flash.on('close', function(code) {
					if(code == 0) {
						processing.append('<p>' + localize('УСПЕХ') + '!</p>');
						processing.append('<br>');
						logger.debug('flash_firmware ' + flash_model + ' ' + flash_special + ' - success');
					} else {
						error_handler(flash_firmware, [flash_model, flash_special, callback], callback);
						return false;
					}
					if(typeof(callback) == 'function') callback();
				});
			}
		}

		this.flash_firmware = function(flash_model, flash_special, callback) {
			logger.debug('flash_firmware ' + flash_model + ' ' + flash_special + ' - start');
			if(flash_special != 'dload') {
				if(flash_model == 'e3372h') factory(function() {
					godload(function() {
						detect.detect_flash(function() {
							_flash_firmware(flash_model, flash_special, callback);
						});
					});
				});
				else godload(function() {
					detect.detect_flash(function() {
						_flash_firmware(flash_model, flash_special, callback);
					});
				});
			} else {
				detect.detect_flash(function() {
					_flash_firmware(flash_model, flash_special, callback);
				});
			}
		}

		var flash_firmware = this.flash_firmware;

		function _flash_webui(flash_model, flash_special, callback) {
			processing.append('<p>' + localize('Шью веб-интерфейс...') + '</p>');
			if(flash_model == 'e3372h') {
				var balong_flash = spawn('balong_flash', ['-p' + flash_port_number, '-g3', 'webui.bin']);
				var balong_flash_html = document.createElement('pre');
				processing.append(balong_flash_html);
				balong_flash.stdout.on('data', function(data) {
					angular.element(balong_flash_html).append(iconv.decode(data, 'cp866'));
					angular.element(balong_flash_html).html(angular.element(balong_flash_html).html().replace(/\r\n/g, '\n').replace(/.*\r/g, ''));
				});
				balong_flash.on('close', function(code) {
					if(code == 0) {
						processing.append('<p>' + localize('УСПЕХ') + '!</p>');
						processing.append('<br>');
						logger.debug('flash_webui ' + flash_model + ' ' + flash_special + ' - success');
					} else {
						error_handler(flash_webui, [flash_model, flash_special, callback], callback);
						return false;
					}
					if(typeof(callback) == 'function') callback();
				});
			} else if(flash_model == 'e3372s') {
				var balong_flash = spawn('balong_flash', ['-p' + flash_port_number, 'webui.bin']);
				var balong_flash_html = document.createElement('pre');
				processing.append(balong_flash_html);
				balong_flash.stdout.on('data', function(data) {
					angular.element(balong_flash_html).append(iconv.decode(data, 'cp866'));
					angular.element(balong_flash_html).html(angular.element(balong_flash_html).html().replace(/\r\n/g, '\n').replace(/.*\r/g, ''));
				});
				balong_flash.on('close', function(code) {
					if(code == 0) {
						processing.append('<p>' + localize('УСПЕХ') + '!</p>');
						processing.append('<br>');
						logger.debug('flash_webui ' + flash_model + ' ' + flash_special + ' - success');
					} else {
						error_handler(flash_webui, [flash_model, flash_special, callback], callback);
						return false;
					}
					if(typeof(callback) == 'function') callback();
				});
			}
		}

		this.flash_webui = function(flash_model, flash_special, callback) {
			logger.debug('flash_webui ' + flash_model + ' ' + flash_special + ' - start');
			if(flash_special != dload) {
				godload(function() {
					detect.detect_flash(function() {
						_flash_webui(flash_model, flash_special, callback);
					});
				});
			} else {
				detect.detect_flash(function() {
					_flash_webui(flash_model, flash_special, callback);
				});
			}
		}

		var flash_webui = this.flash_webui;
	}
}