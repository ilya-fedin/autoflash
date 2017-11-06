app.controller('ProcessingController', function($mdDialog, localize) {
	var detect = new Detect();
	var processing = angular.element(document.querySelector('#processing'));

	var processingObserver = new MutationObserver(function(mutations) {
		mutations.forEach(function(mutation) {
			processing.prop('scrollTop', processing.prop('scrollHeight'));
		});    
	});

	processingObserver.observe(document.querySelector('#processing'), {attributes: true, childList: true, characterData: true});

	detect.detect(true, function() {
		if(model.indexOf('CL2E3372HM') != -1) {
			logger.info('Model: Huawei E3372h');
			logger.info('Firmware: ' + version);
			processing.append('<p>' + localize('Модель') + ': Huawei E3372h</p>');
			processing.append('<p>' + localize('Версия прошивки') + ': ' + version + '</p>');
			processing.append('<br>');
		} else if(model.indexOf('CL1E3372SM') != -1) {
			logger.info('Model: Huawei E3372s');
			logger.info('Firmware: ' + version);
			processing.append('<p>' + localize('Модель') + ': Huawei E3372s</p>');
			processing.append('<p>' + localize('Версия прошивки') + ': ' + version + '</p>');
			processing.append('<br>');
		}
		if(typeof manualMode == 'function') {
			manualMode(end);
			manualMode = undefined;
		} else if(agr_cmd) {
			eval(agr_cmd + '(end)')
		} else {
			if(model.indexOf('CL2E3372HM') != -1 || model.indexOf('CL1E3372SM') != -1) {
				$mdDialog.show(
					$mdDialog.confirm()
						.title(localize('На этом модеме сейчас стоит модифицированная прошивка?'))
						.ok(localize('Да'))
						.cancel(localize('Нет'))
				).then(function() {
					logger.info('Modded firmware: true');
					if(model.indexOf('CL2E3372HM') != -1)
						e3372h(end);
					else if(model.indexOf('CL1E3372SM') != -1)
						e3372s_old(end)
					else
						unknown_model();
				}).then(function() {
					logger.info('Modded firmware: false');
					var versionArr = /([0-9]*)\.([0-9]*)\.([0-9]*)\.([0-9]*)\.([0-9]*)/.exec(version);
					if(model.indexOf('CL2E3372HM') != -1) {
						if((typeof(versionArr) != 'undefined' && versionArr[2] > 315) || ((typeof(versionArr) != 'undefined' && versionArr[2] == 315) && (typeof(versionArr) != 'undefined' && versionArr[4] > 0))) // игла
							e3372h_dload(end);
						else
							e3372h(end)
					}
					else if(model.indexOf('CL1E3372SM') != -1) {
						if(typeof(versionArr) != 'undefined' && versionArr[2] < 300) // старые модели без проверки подписи
							e3372s_old(end);
						else
							e3372s(end);
					}
					else
						unknown_model();
				});
			}
			else
				unknown_model();
		}
	});
});