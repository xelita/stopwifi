var cordovaModule = angular.module('cordovaModule', []);


// Filters

// Services

// cordovaConnectionService

cordovaModule.factory('cordovaConnectionService', ['$timeout', '$log', function ($timeout, $log) {
	return {
		getConnectionType: function (valueIfUnavailable) {
			$log.debug('cordovaDeviceService.getConnectionType.');
			var value = valueIfUnavailable;
			if (angular.isDefined(navigator.connection)) {
				value = navigator.connection.type;
			}
			return value;
		},

		isConnectionAvailable: function (valueIfUnavailable) {
			$log.debug('cordovaDeviceService.isConnectionAvailable.');
			var value = valueIfUnavailable;
			if (angular.isDefined(navigator.connection)) {
				value = navigator.connection.type != Connection.NONE;
			}
			return value;
		},

		isConnectionOfTypeAvailable: function (type, valueIfUnavailable) {
			$log.debug('cordovaDeviceService.isConnectionOfTypeAvailable.');
			var value = valueIfUnavailable;
			if (angular.isDefined(navigator.connection)) {
				value = navigator.connection.type != Connection.NONE;
			}
			return value;
		}
	};
}]);

// cordovaNotificationService

cordovaModule.factory('cordovaNotificationService', ['$timeout', '$log', function ($timeout, $log) {
	return {
		alert: function (message, callback, title, buttonLabel) {
			$log.debug('cordovaNotificationService.alert.');
			if (angular.isDefined(navigator.notification)) {
				if (angular.isDefined(callback)) {
					navigator.notification.alert(message, $timeout(callback), title, buttonLabel);
				}
				else {
					navigator.notification.alert(message, null, title, buttonLabel);
				}
			}
			else {
				if (angular.isDefined(title)) {
					alert(title + ": " + message);
				}
				else {
					alert(message);
				}

				if (angular.isDefined(callback)) {
					navigator.notification.alert(message, $timeout(callback), title, buttonLabel);
				}
			}
		},

		confirm: function (message, callback, title, buttonLabels) {
			$log.debug('cordovaNotificationService.confirm.');
			if (angular.isDefined(navigator.notification)) {
				if (angular.isDefined(callback)) {
					navigator.notification.confirm(message, $timeout(callback), title, buttonLabels);
				}
				else {
					navigator.notification.confirm(message, null, title, buttonLabels);
				}
			}
			else {
				var fullMessage = null;
				if (angular.isDefined(title)) {
					fullMessage = title + ": " + message;
				}
				else {
					fullMessage = message;
				}

				if (confirm(fullMessage)) {
					$timeout(callback(true));
				}
				else {
					$timeout(callback(false));
				}
			}
		},

		beep: function (times) {
			$log.debug('cordovaNotificationService.beep.');
			if (angular.isDefined(navigator.notification)) {
				navigator.notification.beep(times);
			}
			else {
				for (var i = 0; i < times; i++) {
					alert("beep " + (i + 1) + " on " + times + " !");
				}
			}
		},

		vibrate: function (milliseconds) {
			$log.debug('cordovaNotificationService.vibrate.');
			if (angular.isDefined(navigator.notification)) {
				navigator.notification.vibrate(milliseconds);
			}
			else {
				alert("vibrate during " + milliseconds + " ms!");
			}
		}
	}
}]);

// cordovaDeviceService

cordovaModule.factory('cordovaDeviceService', ['$log', function ($log) {
	return {
		getDeviceName: function (valueIfUnavailable) {
			$log.debug('cordovaDeviceService.getDeviceName.');
			var value = valueIfUnavailable;
			if (angular.isDefined(window.device)) {
				value = window.device.name;
			}
			return value;
		},

		getDeviceVersion: function (valueIfUnavailable) {
			$log.debug('cordovaDeviceService.getDeviceVersion.');
			var value = valueIfUnavailable;
			if (angular.isDefined(window.device)) {
				value = window.device.version;
			}
			return value;
		},

		getDeviceUUID: function (valueIfUnavailable) {
			$log.debug('cordovaDeviceService.getDeviceUUID.');
			var value = valueIfUnavailable;
			if (angular.isDefined(window.device)) {
				value = window.device.uuid;
			}
			return value;
		},

		getCordovaVersion: function (valueIfUnavailable) {
			$log.debug('cordovaDeviceService.getCordovaVersion.');
			var value = valueIfUnavailable;
			if (angular.isDefined(window.device)) {
				value = window.device.cordova;
			}
			return value;
		},

		getTargetPlatform: function (valueIfUnavailable) {
			$log.debug('cordovaDeviceService.getTargetPlatform.');
			var value = valueIfUnavailable;
			if (angular.isDefined(window.device)) {
				value = window.device.platform;
			}
			return value;
		}
	};
}]);

// Controllers

cordovaModule.controller('cordovaCtrl', ['$scope', '$log', 'cordovaConnectionService', 'cordovaNotificationService', 'cordovaDeviceService', function ($scope, $log, cordovaConnectionService, cordovaNotificationService, cordovaDeviceService) {

	// cordovaConnectionService

	$scope.executeGetConnectionTypeSample = function () {
		cordovaConnectionService.getConnectionType('Mock value');
	},

	$scope.executeIsConnectionAvailableSample = function () {
		cordovaConnectionService.isConnectionAvailable(false);
	},

	$scope.executeIsConnectionOfTypeAvailableSample = function () {
		cordovaConnectionService.isConnectionOfTypeAvailable('Mock value', true);
	},

	// cordovaNotificationService

	$scope.executeAlertSample = function () {
		cordovaNotificationService.alert("This is an alert message!", function () {
			alert("This is the callback function!");
		}, "Information", "I got it!");
	},

	$scope.executeConfirmSample = function () {
		cordovaNotificationService.confirm("This is a confirmation message! Do you understand?", function (value) {
			alert("This is the callback function! You choose: " + value);
		}, "Confirmation", "I got it!");
	},

	$scope.executeBeepSample = function () {
		cordovaNotificationService.beep(1);
	},

	$scope.executeVibrateSample = function () {
		cordovaNotificationService.vibrate(1000);
	},

	// cordovaDeviceService

	$scope.executeGetDeviceNameSample = function () {
		cordovaDeviceService.getDeviceName('getDeviceName');
	},

	$scope.executeGetDeviceVersionSample = function () {
		cordovaDeviceService.getDeviceVersion('getDeviceVersion');
	},

	$scope.executeGetDeviceUUIDSample = function () {
		cordovaDeviceService.getDeviceUUID('getDeviceUUID');
	},

	$scope.executeGetCordovaVersionSample = function () {
		cordovaDeviceService.getCordovaVersion('getCordovaVersion');
	},

	$scope.executeGetTargetPlatformSample = function () {
		cordovaDeviceService.getTargetPlatform('getTargetPlatform');
	}
}
]);