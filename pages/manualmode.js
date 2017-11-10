app.controller('ManualModeController', function($scope) {
	$scope.model = model;
	$scope.version = version;
	$scope.unknownModel = unknownModel;

	$scope.e3372h = function() {
		manualMode = e3372h;
		start();
	}

	$scope.e3372h_dload = function() {
		manualMode = e3372h_dload;
		start();
	}

	$scope.e3372s = function() {
		manualMode = e3372s;
		start();
	}

	$scope.e3372s_old = function() {
		manualMode = e3372s_old;
		start();
	}

	$scope.e3372s_dload = function() {
		manualMode = e3372s_dload;
		start();
	}

	$scope.main = main;
});