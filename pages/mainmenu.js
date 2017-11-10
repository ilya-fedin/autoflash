app.controller('MainMenuController', function($scope) {
	$scope.modeOne = function() {
		logger.info('Autoflash mode: AUTO');
		mode = 'auto';
		start();
	}

	$scope.modeTwo = function() {
		logger.info('Autoflash mode: PORT');
		mode = 'port';
		start();
	}

	$scope.modeThree = function() {
		logger.info('Autoflash mode: CHOICE_AUTO');
		mode = 'auto';
		manualmode();
	}

	$scope.modeFour = function() {
		logger.info('Autoflash mode: CHOICE_PORT');
		mode = 'port';
		manualmode();
	}
});