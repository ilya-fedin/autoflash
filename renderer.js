// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.

var {ipcRenderer} = require('electron');
var remote = require('electron').remote;
var os = require('os');
var fs = require('fs');
var exec = require('child_process').exec;
var spawn = require('child_process').spawn;
var path = require('path');
var iconv = require('iconv-lite');
var SerialPort = require('serialport');
var wmi = require('node-wmi');
var $ = require('jQuery');
require('bootstrap');

function _ajaxReadFile(src, callback) {
	$.ajax({
		url: src,
		dataType: 'text',
		success: function(data, textStatus, jqXHR) {
			if(typeof(callback) == 'function') callback(data, textStatus, jqXHR);
		}
	});
}

function _addScript(src, callback) {
	$.ajax({
		url: src,
		dataType: 'script',
		success: function(data, textStatus, jqXHR) {
			if(typeof(callback) == 'function') callback();
		}
	});
}

function _addZero(i) {
	return (i < 10)? "0" + i: i;
}

function _updateLog(level, data) {
	if(level) 
		logbuffer += '[' + level + '] ' + data + '\r\n';
	else
		logbuffer += data + '\r\n';
	fs.writeFile(logfile, logbuffer);
}

function error_handler(func, args, callback) {
	_updateLog('error', func + ' ' + JSON.stringify(args));
	var error_mess = '<p>' + DIALOG_ERROR + '! '+ DIALOG_WHAT_TO_DO + ' [s(' + DIALOG_WHAT_TO_DO_SKIP + ')/R(' + DIALOG_WHAT_TO_DO_RETRY + ')/e(' + DIALOG_WHAT_TO_DO_EXIT + ')/a(' + DIALOG_WHAT_TO_DO_SKIP_ALL + ')] ';
	if(skip_all === true)
		error_mess += 'a';
	else
		error_mess += '<input id="error_handler" type="text">';
	error_mess += '</p>';
	$('body > div.container').append('<br>');
	$('body > div.container').append(error_mess);
	if(!skip_all) {
		$('input#error_handler').on('keydown', function(e) {
			if (e.which == 13) {
				var action = $(this).val();
				$(this).replaceWith('<span>' + $(this).val() + '</span>');
				switch(action) {
					case 's':
					case 'S':
						if(typeof(callback) == 'function') callback();
						break;
					case 'e':
					case 'E':
						ipcRenderer.send('quit');
						break;
					case 'a':
					case 'A':
						skip_all = true;
						break;
					default:
						if(typeof(args) == 'object') func.apply(...args);
						else func();
						break;
				}
			}
		});
	}
}

function _detectSuccess(callback) {
	exec('atscr ' + port + ' "AT^HWVER"', function(error, stdout, stderr) {
		model = /.*:\"(.*)\"/.exec($.grep(stdout.split('\n'), function(elem, idx) {
			if(!/AT/.test(elem) && /HWVER/.test(elem))
				return true;
			else
				return false;
		})[0]);
		if(model) model = model[1];
		exec('atscr ' + port + ' "AT^DLOADINFO?"', function(error, stdout, stderr) {
			if(!model) {
				model = /product name:(.*)/.exec($.grep(stdout.split('\n'), function(elem, idx) {
					return /product name/.test(elem);
				})[0]);
				if(model) model = model[1];
				else model = '';
			}
			version = /swver:(.*)/.exec($.grep(stdout.split('\n'), function(elem, idx) {
				return /swver/.test(elem);
			})[0]);
			if(version) version = version[1];
			else version = '';
			if(typeof(callback) == 'function') callback();
		});
	});
}

// function _detectSuccess(callback) {
	// var atscr = new SerialPort(port, function() {
		// atscr.flush(function() {
			// atscr.write('AT^HWVER', function() {
				// atscr.drain(function() {
					// model = /.*:\"(.*)\"/.exec($.grep(atscr.read(4096).toString().split('\n'), function(elem, idx) {
						// if(!/AT/.test(elem) && /HWVER/.test(elem))
							// return true;
						// else
							// return false;
					// })[0]);
					// if(model) model = model[1];
					// else model = '';
					// atscr.flush(function() {
						// atscr.write('AT^DLOADINFO?', function() {
							// atscr.drain(function() {
								// if(!model) {
									// model = /product name:(.*)/.exec($.grep(atscr.read(4096).toString().split('\n'), function(elem, idx) {
										// return /product name/.test(elem);
									// })[0]);
									// if(model) model = model[1];
									// else model = '';
								// }
								// atscr.flush(function() {
									// atscr.write('AT^DLOADINFO?', function() {
										// atscr.drain(function() {
											// version = /swver:(.*)/.exec($.grep(atscr.read(4096).toString().split('\n'), function(elem, idx) {
												// return /swver/.test(elem);
											// })[0]);
											// if(version) version = version[1];
											// else version = '';
											// atscr.close(function() {
												// if(typeof(callback) == 'function') callback();
											// });
										// });
									// });
								// });
							// });
						// });
					// });
				// });
			// });
		// });
	// });
// }

function detect(callback) {
	_updateLog('start', 'detect');
	switch(mode) {
		case 'port':
			if(typeof(agr_port) != 'undefined') {
				port = agr_port;
				port_number = /COM(\d*)/.exec(port);
				if(port_number) port_number = port_number[1];
				else port_number = '';
				_updateLog('info', 'Port: ' + port);
				$('body > div.container').append('<p>' + DIALOG_SUCCESS + '!</p>');
				$('body > div.container').append('<br>');
				_updateLog('success', 'detect');
				_detectSuccess();
			} else {
				$('body > div.container').append('<p>' + DIALOG_PORT_NUMBER + ': <input id="port" type="text"></p>');
				$('input#port').on('keydown', function(e) {
					if (e.which == 13) {
						port = $(this).val();
						port_number = /COM(\d*)/.exec(port);
						if(port_number) port_number = port_number[1];
						_updateLog('info', 'Port: ' + port);
						$('body > div.container').append('<p>' + DIALOG_SUCCESS + '!</p>');
						$('body > div.container').append('<br>');
						_updateLog('success', 'detect');
						$(this).replaceWith('<span>' + $(this).val() + '</span>');
						_detectSuccess();
					}
				});
			}
			break;
		default:
			$('body > div.container').append('<p>' + DIALOG_MODEM_SEARCH + '</p>');
			setTimeout(function(callback) {
				(function whileFunc(callback) {
					wmi.Query({
						class: 'Win32_NetworkAdapter',
						where: 'PNPDeviceID like "%VID_12D1&PID_14DC%"'
					}, function(err, result) {
						if(result) hilink_index = result[0].Index;
						else hilink_index = '';
						if(hilink_index) {
							wmi.Query({
								class: 'Win32_NetworkAdapterConfiguration',
								where: 'Index=' + hilink_index
							}, function(err, result) {
								if(result) if(result[0].DefaultIPGateway) hilink_ip = result[0].DefaultIPGateway[0];
								else hilink_ip = '';
								if(hilink_ip) {
									$('body > div.container').append('<p>' + DIALOG_TRY_OPEN_PORT + '</p>');
									_ajaxReadFile('sw_project_mode.xml', function(data, textStatus, jqXHR) {
										$.ajax({
											type: "POST",
											url: 'http://' + hilink_ip + '/CGI',
											data: data
										});
									});
								}
							});
						}
						wmi.Query({
							class: 'Win32_PnPEntity',
							where: 'ClassGuid="{4d36e978-e325-11ce-bfc1-08002be10318}" and Name like "%PC UI Interface%"'
						}, function(err, result) {
							if(result) port = /.* \((COM\d*)\)/.exec(result[0].Name);
							else port = '';
							if(port) port = port[1];
							if(port) {
								port_number = /COM(\d*)/.exec(port);
								if(port_number) port_number = port_number[1];
								else port_number = '';
								_updateLog('info', 'Port: ' + port + '');
								$('body > div.container').append('<p>' + DIALOG_SUCCESS + '!</p>');
								$('body > div.container').append('<br>');
								_updateLog('success', 'detect');
								_detectSuccess(callback);
							}
							else {
								port_number = '';
								setTimeout(whileFunc, 0, callback);
							}
						}); 
					});
				})(callback);
			}, 0, callback);
			break;
	}
}

function detect_flash(callback) {
	_updateLog('start', 'detect_flash');
	switch(mode) {
		case 'port':
			if(typeof(agr_flash_port) != 'undefined') {
				flash_port = agr_flash_port;
				flash_port_number = /COM(\d*)/.exec(flash_port);
				if(flash_port_number) flash_port_number = flash_port_number[1];
				else flash_port_number = '';
				_updateLog('info', 'Download port: ' + flash_port);
				$('body > div.container').append('<p>' + DIALOG_SUCCESS + '!</p>');
				$('body > div.container').append('<br>');
				_updateLog('success', 'detect_flash');
				if(typeof(callback) == 'function') callback();
			} else {
				$('body > div.container').append('<p>' + DIALOG_PORT_NUMBER + ': <input id="flash_port" type="text"></p>');
				$('input#flash_port').on('keydown', function(e) {
					if (e.which == 13) {
						flash_port = $(this).val();
						flash_port_number = /COM(\d*)/.exec(flash_port);
						if(flash_port_number) flash_port_number = flash_port_number[1];
						else flash_port_number = '';
						_updateLog('info', 'Download port: ' + flash_port);
						$('body > div.container').append('<p>' + DIALOG_SUCCESS + '!</p>');
						$('body > div.container').append('<br>');
						_updateLog('success', 'detect_flash');
						$(this).replaceWith('<span>' + $(this).val() + '</span>');
						if(typeof(callback) == 'function') callback();
					}
				});
			}
			break;
		default:
			$('body > div.container').append('<p>' + DIALOG_MODEM_SEARCH + '</p>');
			setTimeout(function(callback) {
				(function whileFunc(callback) {
					wmi.Query({
						class: 'Win32_PnPEntity',
						where: 'ClassGuid="{4d36e978-e325-11ce-bfc1-08002be10318}" and (PNPDeviceID like "%VID_12D1&PID_1C05&MI_02%" or PNPDeviceID like "%VID_12D1&PID_1442&MI_00%")'
					}, function(err, result) {
						if(result) flash_port = /.* \((COM\d*)\)/.exec(result[0].Name);
						else flash_port = '';
						if(flash_port) flash_port = flash_port[1];
						if(flash_port) {
							exec('atscr ' + flash_port + ' "AT^DLOADINFO?"', function(error, stdout, stderr) {
								if(stdout.indexOf('dload type:1') != -1) {
									flash_port_number = /COM(\d*)/.exec(flash_port);
									if(flash_port_number) flash_port_number = flash_port_number[1];
									else flash_port_number = '';
									_updateLog('info', 'Download port: ' + flash_port);
									$('body > div.container').append('<p>' + DIALOG_SUCCESS + '!</p>');
									$('body > div.container').append('<br>');
									_updateLog('success', 'detect_flash');
									if(typeof(callback) == 'function') callback();
								}
								else {
									flash_port_number = '';
									setTimeout(whileFunc, 0, callback);
								}
							});
						}
						else {
							flash_port_number = '';
							setTimeout(whileFunc, 0, callback);
						}
					}); 
				})(callback);
			}, 0, callback);
			break;
	}
}

function detect_dload(callback) {
	_updateLog('start', 'detect_dload');
	$('body > div.container').append('<p>' + DIALOG_SHORT_DLOAD_POINT + '</p>');
	$(document).on('keydown', function(e) {
		$(document).off('keydown');
		switch(mode) {
			case 'port':
				if(typeof(agr_dload_port) != 'undefined') {
					dload_port = agr_dload_port;
					dload_port_number = /COM(\d*)/.exec(dload_port);
					if(dload_port_number) dload_port_number = dload_port_number[1];
					else dload_port_number = '';
					_updateLog('info', 'Boot port: ' + dload_port);
					$('body > div.container').append('<p>' + DIALOG_SUCCESS + '!</p>');
					$('body > div.container').append('<br>');
					_updateLog('success', 'detect_dload');
					if(typeof(callback) == 'function') callback();
				} else {
					$('body > div.container').append('<p>' + DIALOG_PORT_NUMBER + ': <input id="dload_port" type="text"></p>');
					$('input#dload_port').on('keydown', function(e) {
						if (e.which == 13) {
							dload_port = $(this).val();
							dload_port_number = /COM(\d*)/.exec(dload_port);
							if(dload_port_number) dload_port_number = dload_port_number[1];
							else dload_port_number = '';
							_updateLog('info', 'Boot port: ' + dload_port + '');
							$('body > div.container').append('<p>' + DIALOG_SUCCESS + '!</p>');
							$('body > div.container').append('<br>');
							_updateLog('success', 'detect_dload');
							$(this).replaceWith('<span>' + $(this).val() + '</span>');
							if(typeof(callback) == 'function') callback();
						}
					});
				}
				break;
			default:
				$('body > div.container').append('<p>' + DIALOG_MODEM_SEARCH + '</p>');
				setTimeout(function(callback) {
					(function whileFunc(callback) {
						wmi.Query({
							class: 'Win32_PnPEntity',
							where: 'ClassGuid="{4d36e978-e325-11ce-bfc1-08002be10318}" and PNPDeviceID like "%VID_12D1&PID_1443%"'
						}, function(err, result) {
							if(result) dload_port = /.* \((COM\d*)\)/.exec(result[0].Name);
							else dload_port = '';
							if(dload_port) dload_port = dload_port[1];
							if(dload_port) {
								dload_port_number = /COM(\d*)/.exec(dload_port);
								if(dload_port_number) dload_port_number = dload_port_number[1];
								else dload_port_number = '';
								_updateLog('info', 'Boot port: ' + dload_port);
								$('body > div.container').append('<p>' + DIALOG_SUCCESS + '!</p>');
								$('body > div.container').append('<br>');
								_updateLog('success', 'detect_dload');
								if(typeof(callback) == 'function') callback();
							}
							else {
								dload_port_number = '';
								setTimeout(whileFunc, 0, callback);
							}
						}); 
					})(callback);
				}, 0, callback);
				break;
		}
	});
}

function factory(callback) {
	_updateLog('start', 'factory');
	detect(function() {
		$('body > div.container').append('<p>' + DIALOG_FACTORY + '</p>');
		exec('atscr ' + port + ' "AT^SFM=1"', function(error,stdout, stderr) {
			if(stdout.indexOf('OK') != -1) {
				$('body > div.container').append('<p>' + DIALOG_SUCCESS + '!</p>');
				$('body > div.container').append('<br>');
			} else {
				error_handler(factory, null, callback);
				return false;
			}
			_updateLog('success', 'factory');
			if(typeof(callback) == 'function') callback();
		});
	});
}

function godload(callback) {
	_updateLog('start', 'godload');
	detect(function() {
		$('body > div.container').append('<p>' + DIALOG_GODLOAD + '</p>');
		exec('atscr ' + port + ' "AT^GODLOAD"', function(error, stdout, stderr) {
			if(stdout.indexOf('OK') != -1) {
				$('body > div.container').append('<p>' + DIALOG_SUCCESS + '!</p>');
				$('body > div.container').append('<br>');
			} else {
				error_handler(godload, null, callback);
				return false;
			}
			_updateLog('success', 'godload');
			if(typeof(callback) == 'function') callback();
		});
	});
}

function _dload(dload_model, callback) {
	$('body > div.container').append('<p>' + DIALOG_DLOAD + '</p>');
	if(dload_model == 'e3372h') {
		var balong_usbdload = spawn('balong_usbdload', ['-p' + dload_port_number, '-t', 'ptable-hilink.bin', 'usblsafe-3372h.bin']);
		var balong_usbdload_html = document.createElement('pre');
		document.querySelector('body > div.container').appendChild(balong_usbdload_html);
		balong_usbdload.stdout.on('data', function(data) {
			$(balong_usbdload_html).append(iconv.decode(data, 'cp866'));
			$(balong_usbdload_html).html($(balong_usbdload_html).html().replace(/\r\n/g, '\n').replace(/.*\r/g, ''));
		});
		balong_usbdload.on('close', function(code) {
			if(code == 0) {
				$('body > div.container').append('<p>' + DIALOG_SUCCESS + '!</p>');
				$('body > div.container').append('<br>');
				_updateLog('success', 'dload ' + dload_model + '');
			} else {
				error_handler(dload, [dload_model, callback], callback);
				return false;
			}
			if(typeof(callback) == 'function') callback();
		});
	} else if(dload_model == 'e3372s') {
		var balong_usbdload = spawn('balong_usbdload', ['-p' + dload_port_number, 'usblsafe-3372s.bin']);
		var balong_usbdload_html = document.createElement('pre');
		document.querySelector('body > div.container').appendChild(balong_usbdload_html);
		balong_usbdload.stdout.on('data', function(data) {
			$(balong_usbdload_html).append(iconv.decode(data, 'cp866'));
			$(balong_usbdload_html).html($(balong_usbdload_html).html().replace(/\r\n/g, '\n').replace(/.*\r/g, ''));
		});
		balong_usbdload.on('close', function(code) {
			if(code == 0) {
				$('body > div.container').append('<p>' + DIALOG_SUCCESS + '!</p>');
				$('body > div.container').append('<br>');
				_updateLog('success', 'dload ' + dload_model + '');
			} else {
				error_handler(dload, [dload_model, callback], callback);
				return false;
			}
			if(typeof(callback) == 'function') callback();
		});
	}
}

function dload(dload_model, callback) {
	_updateLog('start', 'dload ' + dload_model + '');
	detect_dload(function() {
		_dload(dload_model, callback);
	});
}

function _flash_technological(flash_model, flash_special, callback) {
	$('body > div.container').append('<p>' + DIALOG_FLASH_TECHNOLOGICAL + '</p>');
	if(flash_model == 'e3372s') {
		var balong_flash = spawn('balong_flash', ['-p' + flash_port_number, '-g1', 'technological_e3372s.bin']);
		var balong_flash_html = document.createElement('pre');
		document.querySelector('body > div.container').appendChild(balong_flash_html);
		balong_flash.stdout.on('data', function(data) {
			$(balong_flash_html).append(iconv.decode(data, 'cp866'));
			$(balong_flash_html).html($(balong_flash_html).html().replace(/\r\n/g, '\n').replace(/.*\r/g, ''));
		});
		balong_flash.on('close', function(code) {
			if(code == 0) {
				$('body > div.container').append('<p>' + DIALOG_SUCCESS + '!</p>');
				$('body > div.container').append('<br>');
				_updateLog('success', 'flash_technological ' + flash_model + ' ' + flash_special);
			} else {
				error_handler(flash_technological, [flash_model, flash_special, callback], callback);
				return false;
			}
			if(typeof(callback) == 'function') callback();
		});
	}
}

function flash_technological(flash_model, flash_special, callback) {
	_updateLog('start', 'flash_technological ' + flash_model + ' ' + flash_special);
	if(flash_special != 'dload') {
		if(flash_model == 'e3372h') factory(function() {
			godload(function() {
				detect_flash(function() {
					_flash_technological(flash_model, flash_special, callback);
				});
			});
		});
		else godload(function() {
			detect_flash(function() {
				_flash_technological(flash_model, flash_special, callback);
			});
		});
	} else {
		detect_flash(function() {
			_flash_technological(flash_model, flash_special, callback);
		});
	}
}

function _flash_health(flash_model, flash_special, callback) {
	$('body > div.container').append('<p>' + DIALOG_FLASH_HEALTH + '</p>');
	if(flash_model == 'e3372s') {
		var balong_flash = spawn('balong_flash', ['-p' + flash_port_number, 'health_e3372s.bin']);
		var balong_flash_html = document.createElement('pre');
		document.querySelector('body > div.container').appendChild(balong_flash_html);
		balong_flash.stdout.on('data', function(data) {
			$(balong_flash_html).append(iconv.decode(data, 'cp866'));
			$(balong_flash_html).html($(balong_flash_html).html().replace(/\r\n/g, '\n').replace(/.*\r/g, ''));
		});
		balong_flash.on('close', function(code) {
			if(data == 0) {
				$('body > div.container').append('<p>' + DIALOG_SUCCESS + '!</p>');
				$('body > div.container').append('<br>');
				_updateLog('success', 'flash_health ' + flash_model + ' ' + flash_special);
			} else {
				error_handler(flash_health, [flash_model, flash_special, callback], callback);
				return false;
			}
			if(typeof(callback) == 'function') callback();
		});
	}
}

function flash_health(flash_model, flash_special, callback) {
	_updateLog('start', 'flash_health ' + flash_model + ' ' + flash_special);
	if(flash_special != 'dload') {
		if(flash_model == 'e3372h') factory(function() {
			godload(function() {
				detect_flash(function() {
					_flash_health(flash_model, flash_special, callback);
				});
			});
		});
		else godload(function() {
			detect_flash(function() {
				_flash_health(flash_model, flash_special, callback);
			});
		});
	} else {
		detect_flash(function() {
			_flash_health(flash_model, flash_special, callback);
		});
	}
}

function _flash_firmware(flash_model, flash_special, callback) {
	$('body > div.container').append('<p>' + DIALOG_FLASH_FIRMWARE + '</p>');
	if(flash_model == 'e3372h') {
		var balong_flash = spawn('balong_flash', ['-p' + flash_port_number, '-g0', 'firmware_e3372h.bin']);
		var balong_flash_html = document.createElement('pre');
		document.querySelector('body > div.container').appendChild(balong_flash_html);
		balong_flash.stdout.on('data', function(data) {
			$(balong_flash_html).append(iconv.decode(data, 'cp866'));
			$(balong_flash_html).html($(balong_flash_html).html().replace(/\r\n/g, '\n').replace(/.*\r/g, ''));
		});
		balong_flash.on('close', function(code) {
			if(code == 0) {
				$('body > div.container').append('<p>' + DIALOG_SUCCESS + '!</p>');
				$('body > div.container').append('<br>');
				_updateLog('success', 'flash_firmware ' + flash_model + ' ' + flash_special);
			} else {
				error_handler(flash_firmware, [flash_model, flash_special, callback], callback);
				return false;
			}
			if(typeof(callback) == 'function') callback();
		});
	} else if(flash_model == 'e3372s') {
		var balong_flash = spawn('balong_flash', ['-p' + flash_port_number, 'firmware_e3372s.bin']);
		var balong_flash_html = document.createElement('pre');
		document.querySelector('body > div.container').appendChild(balong_flash_html);
		balong_flash.stdout.on('data', function(data) {
			$(balong_flash_html).append(iconv.decode(data, 'cp866'));
			$(balong_flash_html).html($(balong_flash_html).html().replace(/\r\n/g, '\n').replace(/.*\r/g, ''));
		});
		balong_flash.on('close', function(code) {
			if(code == 0) {
				$('body > div.container').append('<p>' + DIALOG_SUCCESS + '!</p>');
				$('body > div.container').append('<br>');
				_updateLog('success', 'flash_firmware ' + flash_model + ' ' + flash_special);
			} else {
				error_handler(flash_firmware, [flash_model, flash_special, callback], callback);
				return false;
			}
			if(typeof(callback) == 'function') callback();
		});
	}
}

function flash_firmware(flash_model, flash_special, callback) {
	_updateLog('start', 'flash_firmware ' + flash_model + ' ' + flash_special);
	if(flash_special != 'dload') {
		if(flash_model == 'e3372h') factory(function() {
			godload(function() {
				detect_flash(function() {
					_flash_firmware(flash_model, flash_special, callback);
				});
			});
		});
		else godload(function() {
			detect_flash(function() {
				_flash_firmware(flash_model, flash_special, callback);
			});
		});
	} else {
		detect_flash(function() {
			_flash_firmware(flash_model, flash_special, callback);
		});
	}
}

function _flash_webui(flash_model, flash_special, callback) {
	$('body > div.container').append('<p>' + DIALOG_FLASH_WEBUI + '</p>');
	if(flash_model == 'e3372h') {
		var balong_flash = spawn('balong_flash', ['-p' + flash_port_number, '-g3', 'webui.bin']);
		var balong_flash_html = document.createElement('pre');
		document.querySelector('body > div.container').appendChild(balong_flash_html);
		balong_flash.stdout.on('data', function(data) {
			$(balong_flash_html).append(iconv.decode(data, 'cp866'));
			$(balong_flash_html).html($(balong_flash_html).html().replace(/\r\n/g, '\n').replace(/.*\r/g, ''));
		});
		balong_flash.on('close', function(code) {
			if(code == 0) {
				$('body > div.container').append('<p>' + DIALOG_SUCCESS + '!</p>');
				$('body > div.container').append('<br>');
				_updateLog('success', 'flash_webui ' + flash_model + ' ' + flash_special);
			} else {
				error_handler(flash_webui, [flash_model, flash_special, callback], callback);
				return false;
			}
			if(typeof(callback) == 'function') callback();
		});
	} else if(flash_model == 'e3372s') {
		var balong_flash = spawn('balong_flash', ['-p' + flash_port_number, 'webui.bin']);
		var balong_flash_html = document.createElement('pre');
		document.querySelector('body > div.container').appendChild(balong_flash_html);
		balong_flash.stdout.on('data', function(data) {
			$(balong_flash_html).append(iconv.decode(data, 'cp866'));
			$(balong_flash_html).html($(balong_flash_html).html().replace(/\r\n/g, '\n').replace(/.*\r/g, ''));
		});
		balong_flash.on('close', function(code) {
			if(code == 0) {
				$('body > div.container').append('<p>' + DIALOG_SUCCESS + '!</p>');
				$('body > div.container').append('<br>');
				_updateLog('success', 'flash_webui ' + flash_model + ' ' + flash_special);
			} else {
				error_handler(flash_webui, [flash_model, flash_special, callback], callback);
				return false;
			}
			if(typeof(callback) == 'function') callback();
		});
	}
}

function flash_webui(flash_model, flash_special, callback) {
	_updateLog('start', 'flash_webui ' + flash_model + ' ' + flash_special);
	if(flash_special != dload) {
		godload(function() {
			detect_flash(function() {
				_flash_webui(flash_model, flash_special, callback);
			});
		});
	} else {
		detect_flash(function() {
			_flash_webui(flash_model, flash_special, callback);
		});
	}
}

function e3372h(callback) {
	_updateLog('info', 'Flashing mode: E3372h Normal');
	flash_firmware('e3372h', null, function() {
		flash_webui('e3372h', null, function() {
			if(typeof(callback) == 'function') callback();
		});
	});
}

function e3372h_dload(callback) {
	_updateLog('info', 'Flashing mode: E3372h BOOT');
	dload('e3372h', function() {
		flash_firmware('e3372h', 'dload', function() {
			flash_webui('e3372h', null, function() {
				if(typeof(callback) == 'function') callback();
			});
		});
	});
}

function e3372s(callback) {
	_updateLog('info', 'Flashing mode: E3372s Normal');
	flash_technological('e3372s', null, function() {
		flash_health('e3372s', null, function() {
			flash_firmware('e3372s', null, function() {
				flash_webui('e3372s', null, function() {
					if(typeof(callback) == 'function') callback();
				});
			});
		});
	});
}

function e3372s_old(callback) {
	_updateLog('info', 'Flashing mode: E3372s Old');
	flash_health('e3372s', null, function() {
		flash_firmware('e3372s', null, function() {
			flash_webui('e3372s', null, function() {
				if(typeof(callback) == 'function') callback();
			});
		});
	});
}

function e3372s_dload(callback) {
	_updateLog('info', 'Flashing mode: E3372s BOOT');
	dload('e3372s', function() {
		flash_health('e3372s', 'dload', function() {
			flash_firmware('e3372s', null, function() {
				flash_webui('e3372s', null, function() {
					if(typeof(callback) == 'function') callback();
				});
			});
		});
	});
}

function codes() {
	$('body > div.container').append("<p>" + DIALOG_CODES + ":</p>");
	$('body > div.container').append("<p>	mode=port - " + DIALOG_CODES_MODE_PORT + "</p>");
	$('body > div.container').append("<p>	e3372h - " + DIALOG_CODES_E3372H + "</p>");
	$('body > div.container').append("<p>	e3372h_dload - " + DIALOG_CODES_E3372H_DLOAD + "</p>");
	$('body > div.container').append("<p>	e3372s - " + DIALOG_CODES_E3372S + "</p>");
	$('body > div.container').append("<p>	e3372s_old - " + DIALOG_CODES_E3372S_OLD + "</p>");
	$('body > div.container').append("<p>	e3372s_dload - " + DIALOG_CODES_E3372S_DLOAD + "</p>");
	$('body > div.container').append("<p>	functions - " + DIALOG_CODES_FUNCTIONS + "</p>");
	$('body > div.container').append("<p>	help - " + DIALOG_CODES_HELP + "</p>");
	$('body > div.container').append("<p>	return - " + DIALOG_CODES_RETURN + "</p>");
	$('body > div.container').append("<p>	exit - " + DIALOG_CODES_EXIT + "</p>");
	$('body > div.container').append("<p>" + DIALOG_CODES_ENTER + "</p>");
	$('body > div.container').append('<br>');
}

function functions() {
	_ajaxReadFile('functions.' + LANG + '.txt', function(data, textStatus, jqXHR) {
		$('body > div.container').append('<pre style="height: ' + ($(window).height() - 40) + 'px;">' + data + '</pre>');
		$('body > div.container').append('<br>');
	});
}

function shell() {
	$('body > div.container').append('<p>&gt; <input id="shell" type="text"></p>');
	$('input#shell').on('keydown', function(e) {
		if (e.which == 13) {
			if($(this).val() != 'return') eval($(this).val());
			$(this).replaceWith('<span>' + $(this).val() + '</span>');
			if($(this).val() == 'return') main();
		}
	});
}

function unknown_model() {
	_updateLog('warning', 'Unknown model!');
	_updateLog('info', 'Model: ' + model);
	_updateLog('info', 'Firmware: ' + version);
	$('body > div.container').append('<p>' + DIALOG_UNKNOWN_MODEL + '</p>');
	$('body > div.container').append('<p>	' + DIALOG_MODEL + ': ' + model + '</p>');
	$('body > div.container').append('<p>	' + DIALOG_FIRMWARE_VERSION + ': ' + version + '</p>');
	$('body > div.container').append('<br>');
	$('body > div.container').append('<p>' + DIALOG_UNKNOWN_MODEL_WARNING_LINE_ONE + '</p>');
	$('body > div.container').append('<p>' + DIALOG_UNKNOWN_MODEL_WARNING_LINE_TWO + '</p>');
	$('body > div.container').append('<br>');
	codes();
	shell();
}

function _end() {
	$('body > div.container').append('<br>');
	$('body > div.container').append('<p>' + DIALOG_END + '</p>');
	$(document).on('keydown', function(e) {
		$(document).off('keydown');
		main();
	});
}

function start() {
	$('body > div.container').html('');
	detect(function() {
		if(model.indexOf('CL2E3372HM') != -1) {
			_updateLog('info', 'Model: Huawei E3372h');
			_updateLog('info', 'Firmware: ' + version);
			$('body > div.container').append('<p>' + DIALOG_MODEL + ': Huawei E3372h</p>');
			$('body > div.container').append('<p>' + DIALOG_FIRMWARE_VERSION + ': ' + version + '</p>');
			$('body > div.container').append('<br>');
		} else if(model.indexOf('CL1E3372SM') != -1) {
			_updateLog('info', 'Model: Huawei E3372s');
			_updateLog('info', 'Firmware: ' + version);
			$('body > div.container').append('<p>' + DIALOG_MODEL + ': Huawei E3372s</p>');
			$('body > div.container').append('<p>' + DIALOG_FIRMWARE_VERSION + ': ' + version + '</p>');
			$('body > div.container').append('<br>');
		}
		if(agr_cmd) {
			eval(agr_cmd)
		} else {
			if(model.indexOf('CL2E3372HM') != -1 || model.indexOf('CL1E3372SM') != -1) {
				$('body > div.container').append('<p>' + DIALOG_IS_MODDED + ' [y/N] <input id="main" type="text"></p>');
				$('input#main').on('keydown', function(e) {
					if (e.which == 13) {
						var material = $(this).val();
						$(this).replaceWith('<span>' + $(this).val() + '</span>');
						$('body > div.container').append('<br>');
						switch(material) {
							case 'y':
							case 'Y':
								_updateLog('info', 'Modded firmware: true');
								if(model.indexOf('CL2E3372HM') != -1)
									e3372h(_end);
								else if(model.indexOf('CL1E3372SM') != -1)
									e3372s_old(_end)
								else
									unknown_model();
								break;
							default:
								_updateLog('info', 'Modded firmware: false');
								if(model.indexOf('CL2E3372HM') != -1) {
									if(/[0-9]*\.([0-9]*)\.[0-9]*\.[0-9]*\.[0-9]*/.exec(version)[1] > 315 || (/[0-9]*\.([0-9]*)\.[0-9]*\.[0-9]*\.[0-9]*/.exec(version) == 315 && /[0-9]*\.[0-9]*\.[0-9]*\.([0-9]*)\.[0-9]*/.exec(version) > 0)) // игла
										e3372h_dload(_end);
									else
										e3372h(_end)
								}
								else if(model.indexOf('CL1E3372SM') != -1) {
									if(/[0-9]*\.([0-9]*)\.[0-9]*\.[0-9]*\.[0-9]*/.exec(version) < 300) // старые модели без проверки подписи
										e3372s_old(_end);
									else
										e3372s(_end);
								}
								else
									unknown_model();
								break;
						}
					}
				});
			}
			else
				unknown_model();
		}
	});
}

function _main() {
	logbuffer = '';

	var logTitle = 'autoflash - ' + now.toString();

	_updateLog(null, new Array(logTitle.length + 1).join('*'));
	_updateLog(null, logTitle);
	_updateLog(null, new Array(logTitle.length + 1).join('*'));
	_updateLog(null, '');

	skip_all = false;

	document.title = DIALOG_TITLE;

	document.querySelector('body > div.container').innerHTML = '<center><h3>' + DIALOG_HELLO + '</h3></center>';

	if(!agr_mode) {
		document.querySelector('body > div.container').innerHTML += '<p><center>' + DIALOG_MODE + '</center></p> \
								   <p><center> \
										<button id="mode_one" class="btn btn-primary" title="' + DIALOG_MODE_ONE_DESC_LINE_ONE + '\n' + DIALOG_MODE_ONE_DESC_LINE_TWO + '\n' + DIALOG_MODE_ONE_DESC_LINE_THREE + '">' + DIALOG_MODE_ONE + '</button> \
										<button id="mode_two" class="btn btn-primary" title="' + DIALOG_MODE_TWO_DESC_LINE_ONE + '\n' + DIALOG_MODE_TWO_DESC_LINE_TWO + '">' + DIALOG_MODE_TWO + '</button> \
										<button id="mode_three" class="btn btn-primary" title="' + DIALOG_MODE_THREE_DESC_LINE_ONE + '\n' + DIALOG_MODE_THREE_DESC_LINE_TWO + '">' + DIALOG_MODE_THREE + '</button> \
								   </center></p>';

		mode = 'auto';

		$('button#mode_one').on('click', function() {
			_updateLog('info', 'Autoflash mode: AUTO');
			mode = 'auto';
			start();
		});

		$('button#mode_two').on('click', function() {
			_updateLog('info', 'Autoflash mode: PORT');
			mode = 'port';
			start();
		});

		$('button#mode_three').on('click', function() {
			_updateLog('info', 'Autoflash mode: SHELL');
			$('body > div.container').html('');
			codes();
			shell();
		});
	} else {
		mode = agr_mode;
		_updateLog('info', 'Autoflash mode: ' + mode + '');
		start();
	}
}

function main() {
	now = new Date();

	logfile = os.homedir() + '/autoflash/autoflash.' + String(now.getFullYear()) + String(_addZero(now.getMonth()+1)) + String(_addZero(now.getDate())) + '-' + String(_addZero(now.getHours())) + String(_addZero(now.getMinutes()) + String(_addZero(now.getSeconds()))) + '.log'

	fs.access(path.dirname(logfile), fs.constants.R_OK | fs.constants.W_OK, function(err) {
		if(err) fs.mkdir(path.dirname(logfile), _main);
		else _main();
	});
}

if(/.asar$/.test(__dirname))
	process.chdir(__dirname + '.unpacked');
else
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

setTimeout(function() {
	(function whileFunc() {
		$(document.body).scrollTop(document.body.scrollHeight);
		setTimeout(whileFunc, 0);
	})();
}, 0);

$(document.body).on('keydown', function(e) {
	if (e.ctrlKey && (e.which == '1'.charCodeAt() || e.which == 13)) {
		_updateLog('info', 'Autoflash mode: AUTO');
		mode = 'auto';
		start();
	}
	if (e.ctrlKey && e.which == '2'.charCodeAt()) {
		_updateLog('info', 'Autoflash mode: PORT');
		mode = 'port';
		start();
	}
	if (e.ctrlKey && e.which == '3'.charCodeAt()) {
		_updateLog('info', 'Autoflash mode: SHELL');
		$('body > div.container').html('');
		codes();
		shell();
	}
});

wmi.Query({
	class: 'Win32_OperatingSystem'
}, function(err, result) {
	switch(result[0].Locale) {
		case '0419': _addScript('lang.ru.js', main); break;
		default: _addScript('lang.en.js', main); break;
	}
});