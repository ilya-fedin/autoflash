class Detect {
	constructor() {
		var $http = angular.injector(["ng"]).get("$http");
		var $mdDialog = angular.element(document.querySelector('div[ng-controller="MainController"]')).injector().get("$mdDialog");
		var localize = angular.injector(["ng", "localize"]).get("localize");

		var processing = angular.element(document.querySelector('#processing'));

		function _detectSuccess(type, callback) {
			switch(type) {
				case 'flash':
					flash_port_number = /COM(\d*)/.exec(flash_port);
					if(flash_port_number) flash_port_number = flash_port_number[1];
					else flash_port_number = '';
					logger.info('Download port: ' + flash_port);
					processing.append('<p>' + localize('УСПЕХ') + '!</p>');
					processing.append('<br>');
					logger.debug('detect_flash - success');
					if(typeof(callback) == 'function') callback();
					break;
				case 'dload':
					dload_port_number = /COM(\d*)/.exec(dload_port);
					if(dload_port_number) dload_port_number = dload_port_number[1];
					else dload_port_number = '';
					logger.info('Boot port: ' + dload_port);
					processing.append('<p>' + localize('УСПЕХ') + '!</p>');
					processing.append('<br>');
					logger.debug('detect_dload - success');
					if(typeof(callback) == 'function') callback();
					break;
				default:
					port_number = /COM(\d*)/.exec(port);
					if(port_number) port_number = port_number[1];
					else port_number = '';
					logger.info('Port: ' + port);
					sendcmd('AT^HWVER', port)
						.then(function(data) {
							model = /\^HWVER:\"(.*)\"/.exec(String(data));
							if(model) model = model[1];
							else model = '';
							return sendcmd('AT^DLOADINFO?', port);
						})
						.then(function(data) {
							if(!model) {
									model = /product name:(.*)/.exec(String(data));
									if(model) model = model[1];
									else model = '';
							}
							version = /swver:(.*)/.exec(String(data));
							if(version) version = version[1];
							else version = '';
							processing.append('<p>' + localize('УСПЕХ') + '!</p>');
							processing.append('<br>');
							logger.debug('detect - success');
							if(typeof(callback) == 'function') callback();
						});
					break;
			}
		}

		function _detect(useInFlashMode, whileFunc, callback) {
			wmi.Query({
				class: 'Win32_PnPEntity',
				where: 'ClassGuid="{4d36e978-e325-11ce-bfc1-08002be10318}" and Name like "%PC UI Interface%"'
			}, function(err, result) {
				if(result && result[0] && result[0].Name) port = /.* \((COM\d*)\)/.exec(result[0].Name);
				else port = '';
				if(port) port = port[1];
				else port = '';
				if(port) {
					if(useInFlashMode === true) {
						_detectSuccess(null, callback);
					} else {
							sendcmd('AT^DLOADINFO?', port, function(data) {
								if(String(data).indexOf('dload type:0') != -1) {
									_detectSuccess(null, callback);
								} else {
									port_number = '';
									setTimeout(whileFunc, 0, callback);
								}
							});
					}
				} else {
					port_number = '';
					setTimeout(whileFunc, 0, callback);
				}
			});
		}

		this.detect = function(useInFlashMode, callback) {
			logger.debug('detect - start');
			switch(mode) {
				case 'port':
					if(typeof(agr_port) != 'undefined') {
						port = agr_port;
						_detectSuccess(null, callback);
					} else {
						$mdDialog.show({
							controller: function($scope, $mdDialog) {
								$scope.setPort = function(e) {
									if (e.which == 13) {
										port = angular.element(e.target).val();
										$mdDialog.hide();
										_detectSuccess(null, callback);
									}
								}
							},
							templateUrl: 'portdialog.html'
						});
					}
					break;
				default:
					processing.append('<p>' + localize('Ищу модем...') + '</p>');
					setTimeout(function(callback) {
						(function whileFunc(callback) {
							wmi.Query({
								class: 'Win32_NetworkAdapter',
								where: 'PNPDeviceID like "%VID_12D1&PID_14DC%"'
							}, function(err, result) {
								var hilink_index;
								if(result) hilink_index = result[0].Index;
								else hilink_index = '';
								if(hilink_index) {
									wmi.Query({
										class: 'Win32_NetworkAdapterConfiguration',
										where: 'Index=' + hilink_index
									}, function(err, result) {
										var hilink_ip;
										if(result && result[0] && result[0].DefaultIPGateway) hilink_ip = result[0].DefaultIPGateway[0];
										else hilink_ip = '';
										if(hilink_ip) {
											processing.append('<p>' + localize('Пытаюсь открыть порт...') + '</p>');
											readFile('sw_project_mode.xml', function(err, data) {
												if(!err) {
													$http({
														method: "POST",
														url: 'http://' + hilink_ip + '/CGI',
														data: String(data)
													}).then(function successCallback(response) {
														_detect(useInFlashMode, whileFunc, callback);
													}, function errorCallback(response) {
														_detect(useInFlashMode, whileFunc, callback);
													});
												} else _detect(useInFlashMode, whileFunc, callback);
											});
										} else _detect(useInFlashMode, whileFunc, callback);
									});
								} else _detect(useInFlashMode, whileFunc, callback);
							});
						})(callback);
					}, 0, callback);
					break;
			}
		}

		var detect = this.detect;

		this.detect_flash = function(callback) {
			logger.debug('detect_flash - start');
			switch(mode) {
				case 'port':
					if(typeof(agr_flash_port) != 'undefined') {
						flash_port = agr_flash_port;
						_detectSuccess('flash', callback);
					} else {
						$mdDialog.show({
							controller: function($scope, $mdDialog) {
								$scope.setPort = function(e) {
									if (e.which == 13) {
										flash_port = angular.element(e.target).val();
										$mdDialog.hide();
										_detectSuccess('flash', callback);
									}
								}
							},
							templateUrl: 'portdialog.html'
						});
					}
					break;
				default:
					processing.append('<p>' + localize('Ищу модем...') + '</p>');
					setTimeout(function(callback) {
						(function whileFunc(callback) {
							wmi.Query({
								class: 'Win32_PnPEntity',
								where: 'ClassGuid="{4d36e978-e325-11ce-bfc1-08002be10318}" and (PNPDeviceID like "%VID_12D1&PID_1C05&MI_02%" or PNPDeviceID like "%VID_12D1&PID_1442&MI_00%")'
							}, function(err, result) {
								if(result) flash_port = /.* \((COM\d*)\)/.exec(result[0].Name);
								else flash_port = '';
								if(flash_port) flash_port = flash_port[1];
								else flash_port = '';
								if(flash_port) {
									sendcmd('AT^DLOADINFO?', port, function(data) {
										if(String(data).indexOf('dload type:1') != -1) {
											_detectSuccess('flash', callback);
										} else {
											flash_port_number = '';
											setTimeout(whileFunc, 0, callback);
										}
									});
								} else {
									flash_port_number = '';
									setTimeout(whileFunc, 0, callback);
								}
							}); 
						})(callback);
					}, 0, callback);
					break;
			}
		}

		var detect_flash = this.detect_flash;

		this.detect_dload = function(callback) {
			logger.debug('detect_dload - start');
			processing.append('<p>' + localize('Замкните контакт аварийной загрузки и нажмите любую клавишу') + '</p>');
			exec('ShortBootPoint');
			setTimeout(function() {
				angular.element(document).on('keydown', function(e) {
					angular.element(document).off('keydown');
					switch(mode) {
						case 'port':
							if(typeof(agr_dload_port) != 'undefined') {
								dload_port = agr_dload_port;
								_detectSuccess('dload', callback);
							} else {
								$mdDialog.show({
									controller: function($scope, $mdDialog) {
									$scope.setPort = function(e) {
										if (e.which == 13) {
											dload_port = angular.element(e.target).val();
											$mdDialog.hide();
											_detectSuccess('dload', callback);
										}
									}
								},
									templateUrl: 'portdialog.html'
								});
							}
							break;
						default:
							processing.append('<p>' + localize('Ищу модем...') + '</p>');
							setTimeout(function(callback) {
								(function whileFunc(callback) {
									wmi.Query({
										class: 'Win32_PnPEntity',
										where: 'ClassGuid="{4d36e978-e325-11ce-bfc1-08002be10318}" and PNPDeviceID like "%VID_12D1&PID_1443%"'
									}, function(err, result) {
										if(result && result[0] && result[0].Name) dload_port = /.* \((COM\d*)\)/.exec(result[0].Name);
										else dload_port = '';
										if(dload_port) dload_port = dload_port[1];
										else dload_port = '';
										if(dload_port) {
											_detectSuccess('dload', callback);
										} else {
											dload_port_number = '';
											setTimeout(whileFunc, 0, callback);
										}
									}); 
								})(callback);
							}, 0, callback);
							break;
					}
				});
			}, 0);
		}

		var detect_dload = this.detect_dload;
	}
}