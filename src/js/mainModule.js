var mainModule = angular.module('mainModule', ['cordovaModule', 'ngResource']);

// Routing

mainModule.config(['$routeProvider', function ($routeProvider) {

	$routeProvider.when('/launch', {
		templateUrl: 'tpl/launch.html',
		controller: 'MainCtrl'
	});

	$routeProvider.when('/home', {
		templateUrl: 'tpl/home.html',
		controller: 'MainCtrl'
	});

	$routeProvider.when('/settings', {
		templateUrl: 'tpl/settings.html',
		controller: 'MainCtrl'
	});

	$routeProvider.when('/help', {
		templateUrl: 'tpl/help.html',
		controller: 'MainCtrl'
	});

	$routeProvider.when('/about', {
		templateUrl: 'tpl/about.html',
		controller: 'MainCtrl'
	});

	$routeProvider.otherwise({
		redirectTo: '/launch'
	});
}]);


// Filters

// Services

mainModule.constant('urls', {
	authenticationTokenUrl: 'http://mafreebox.free.fr/api/v1/login/authorize',
	wifiStatus: 'http://localhost:3000/stopwifi/dispatcher/api/wifi/status',
	rateUrl: '',
	helpGuideUrl: '',
	onlineSupportUrl: '',
	emailFormUrl: ''
});

mainModule.constant('appInfo', {
	id: 'fr.furiousapps.stopwifi',
	name: 'StopWifi',
	codename: 'STW',
	version: '1.0.0',
	author: {name: 'FuriousApps', email: 'http://www.furiousapps.fr'}
});

mainModule.constant('helpInfo', {
	help1: "Vous rencontrez des problèmes?",
	help2: "Utilisez le menu 'aide' ou contactez le support (support@furiousapps.fr).",
	helpGuideUrl: '',
	supportUrl: '',
	supportEmail: ''
});

// MainService

mainModule.factory('mainService', ['$http', '$resource', '$log', 'urls', 'appInfo', function ($http, $resource, $log, urls, appInfo) {
	return {

		// ------------------------------------------------------------------------
		// Wifi
		// ------------------------------------------------------------------------

		getWifiStatus: function (url, appToken, deviceName) {
			$log.debug('IN getWifiStatus.');
			return $http({method: 'POST', url: urls.wifiStatus,
				params: {
					'url': url,
					'appToken': appToken,
					'deviceName': deviceName
				},
				timeout: 15000
			});
		},

		setWifiStatus: function (status, url, appToken, deviceName) {
			$log.debug('IN setWifiStatus.');
			return $http({method: 'POST', url: urls.wifiStatus + '/' + status,
				params: {
					'url': url,
					'appToken': appToken,
					'deviceName': deviceName
				},
				timeout: 15000
			});
		},

		// ------------------------------------------------------------------------
		// Settings
		// ------------------------------------------------------------------------

		checkBoxAvailability: function (boxUrl) {
			$log.debug('IN checkBoxAvailability.');
			return $http({method: 'GET', url: boxUrl, timeout: 15000});
		},

		getAuthorizationToken: function (deviceName) {
			$log.debug('IN getAuthorizationToken.');
			return $http({method: 'POST', url: urls.authenticationTokenUrl,
				data: {
					'app_id': appInfo.id,
					'app_name': appInfo.name,
					'app_version': appInfo.version,
					'device_name': deviceName
				},
				timeout: 5000
			});
		},

		getAuthorizationTokenStatus: function (authorizationRequestId) {
			$log.debug('IN getAuthorizationStatus.');
			return $http({method: 'GET', url: urls.authenticationTokenUrl + '/' + authorizationRequestId, timeout: 5000});
		}
	};
}]);

// Controllers

mainModule.controller('MainCtrl', ['$rootScope', '$scope', '$location', '$log', 'mainService', 'cordovaNotificationService', 'cordovaDeviceService', 'urls', 'appInfo', 'helpInfo', function ($rootScope, $scope, $location, $log, mainService, cordovaNotificationService, cordovaDeviceService, urls, appInfo, helpInfo) {

	// Menu
	$scope.homeEnabled = false;
	$scope.rateEnabled = false;

	// Spinner
	$scope.loading = false;

	// Constants service
	$scope.urls = urls;
	$scope.appInfo = appInfo;
	$scope.helpInfo = helpInfo;

	// Wifi
	$scope.wifiStatus = true;
	$scope.wifiStatusLabel = 'n/a';
	$scope.wifiStatusActionCSS = '';
	$scope.wifiStatusIconCSS = '';

	// Settings
	$scope.associationStatus = false;
	$scope.associationStatusLabel = 'n/a';
	$scope.associationStatusActionCSS = '';
	$scope.associationStatusIconCSS = '';

	// ------------------------------------------------------------------------
	// Navigation
	// ------------------------------------------------------------------------

	$scope.$on('$routeChangeSuccess', function (event, currentRoute, previousRoute) {
		var associationStatusEnabled = app.account != null && app.account.url != '' && app.account.appToken != '' && app.account.deviceName != '';
		$scope.homeEnabled = associationStatusEnabled;
		$scope.rateEnabled = associationStatusEnabled;

		if (app.account != null) {
			$scope.user = {url: app.account.url, appToken: app.account.appToken, deviceName: app.account.deviceName};
		}
		else {
			$scope.user = {url: 'http://', appToken: '', deviceName: ''};
		}
	});

	$scope.goHome = function () {
		$log.debug('IN goHome.');
		$location.path('/home');
	}

	$scope.goSettings = function () {
		$log.debug('IN goSettings.');
		$location.path('/settings');
	};

	$scope.goHelp = function () {
		$log.debug('IN goHelp.');
		$location.path('/help');
	};

	$scope.goAbout = function () {
		$log.debug('IN goAbout.');
		$location.path('/about');
	};

	$scope.launch = function () {
		$log.debug('IN launch.');
		var associationStatusEnabled = app.account != null && app.account.url != '' && app.account.appToken != '' && app.account.deviceName != '';
		if (associationStatusEnabled) {
			$scope.goHome();
		}
		else {
			$scope.goSettings();
		}
	};

	// ------------------------------------------------------------------------
	// Wifi
	// ------------------------------------------------------------------------

	$scope.getWifiStatus = function () {
		$log.debug('IN getWifiStatus.');
		getWifiStatus();
	};

	$scope.switchWifiStatus = function () {
		$log.debug('IN switchWifiStatus.');

		// Next status
		var nextStatus = $scope.wifiStatus ? 0 : 1;
		var nextStatusLabel = $scope.wifiStatus ? 'arrêter' : 'démarrer';

		// Confirmation
		var confirmationHandler = function (buttonIndex) {

			// Change wifi status
			if (buttonIndex == 1) {
				$scope.$apply(function () {
					setWifiStatus(nextStatus, 0);
				});
			}
		};

		confirm('Confirmation', 'Etes-vous sûr(e) de vouloir ' + nextStatusLabel + ' votre wifi?', 'Oui,Non', confirmationHandler);
	};

	// ------------------------------------------------------------------------
	// Settings
	// ------------------------------------------------------------------------

	$scope.getAssociationStatus = function () {
		$log.debug('IN getAssociationStatus.');

		var associationStatusEnabled = app.account != null && app.account.url != '' && app.account.appToken != '' && app.account.deviceName != '';
		updateAssociationStatusFields(associationStatusEnabled);
	};

	$scope.associateAppWithBox = function () {
		$log.debug('IN associateAppWithBox.');

		// Get the authorization token
		if (checkConnection()) {
			$scope.user.deviceName = getDeviceUUID();

			if ($scope.user.url.indexOf('http://') == -1) {
				warn("L'adresse de votre box doit commencer par 'http://'.");
				return;
			}
			if ($scope.user.url.substr(7) == '') {
				warn("L'adresse de votre box doit être renseignée.");
				return;
			}
			if ($scope.user.url.lastIndexOf('/') != 6) {
				warn("L'adresse de votre box ne doit pas contenir de '/'.");
				return;
			}

			// Check url accessibility
			$scope.loading = true;
			mainService.checkBoxAvailability($scope.user.url).then(function (response) {

				// Token request
				mainService.getAuthorizationToken($scope.user.deviceName).then(function (response) {
					// AppToken: not usable for the moment
					var appToken = response.data.result.app_token;
					$log.debug('appToken is: ' + appToken);

					// The id to track the AppToken status
					var trackId = response.data.result.track_id;
					$log.debug('trackId is: ' + trackId);

					// Watch the authorization token status
					waitForAuthorizationStatus(trackId, $scope.user.url, appToken, $scope.user.deviceName);
				}, function (reason) {
					$scope.loading = false;
					error("Votre box ne semble pas être accessible sur votre réseau local. Vous devez être sur votre réseau pour le processus d'association. Consultez l'aide pour plus d'informations" + showErrorDetails(reason));
				});
			}, function (reason) {
				$scope.loading = false;
				error("Votre box ne semble pas être accessible par Internet. Veuillez vérifier vos informations et essayez à nouveau." + showErrorDetails(reason));
			});
		}
	};

	$scope.removeAssociateBetweenAppAndBox = function () {
		$log.debug('IN removeAssociateBetweenAppAndBox.');

		// Confirmation
		var confirmationHandler = function (buttonIndex) {
			if (buttonIndex == 1) {

				// Remove token from DB
				$scope.loading = true;
				deleteAccount(app.account, function (result) {
					$scope.$apply(function () {
						if (result) {
							// Menu
							$scope.homeEnabled = false;
							$scope.rateEnabled = false;

							// Update UI
							updateAssociationStatusFields(false);
							app.account = null;
							$scope.user = {url: 'http://', appToken: '', deviceName: getDeviceUUID()};

							// Notification
							info('Association retirée avec succès.');
						}

						$scope.loading = false;
					})
				});
			}
		};

		confirm('Confirmation', "Etes-vous sûr(e) de vouloir supprimer l'association entre votre application et votre box? L'association est nécéssaire pour pouvoir utiliser correctement l'application.", 'Oui,Non', confirmationHandler);
	};

	// ------------------------------------------------------------------------
	// Links
	// ------------------------------------------------------------------------

	$scope.rateApplication = function () {
		$log.debug('IN rateApplication.');
		if (checkConnection()) {
			openBrowser(urls.rateUrl, '_system');
		}
	};

	$scope.showUserGuide = function () {
		$log.debug('IN showUserGuide.');
		if (checkConnection()) {
			openBrowser(urls.helpGuideUrl, '_system');
		}
	};

	$scope.showOnlineSupport = function () {
		$log.debug('IN showOnlineSupport.');
		if (checkConnection()) {
			openBrowser(urls.onlineSupportUrl, '_system');
		}
	};

	$scope.showEmailForm = function () {
		$log.debug('IN showEmailForm.');
		if (checkConnection()) {
			var subject = '?subject=[Demande de support] [' + appInfo.name + ' ' + appInfo.version + '] [' + getDevicePlatform() + ' ' + getDeviceVersion() + ']';
			var body = "&body=Bonjour, je rencontre un problème avec votre application. Le problème est le suivant:";
			var url = 'mailto:' + urls.emailFormUrl + subject + body;
			openBrowser(url, '_system');
		}
	};

	$scope.showWebsite = function (url) {
		$log.debug('IN showWebsite.');
		if (checkConnection()) {
			openBrowser(url, '_system');
		}
	};

	$scope.showBoxUrl = function () {
		$log.debug('IN showBoxUrl.');
		if (checkConnection()) {
			openBrowser($scope.user.url, '_system');
		}
	};

	// ------------------------------------------------------------------------
	// Convenience methods
	// ------------------------------------------------------------------------

	var waitForAuthorizationStatus = function (trackId, boxUrl, boxToken, boxDeviceName) {
		$log.debug('IN waitForAuthorizationStatus.');

		// Get the final authorization status
		if (checkConnection()) {
			mainService.getAuthorizationTokenStatus(trackId).then(function (response) {
				var status = response.data.result.status;
				if (status == 'pending') {
					sleepMs(2000);
					waitForAuthorizationStatus(trackId, boxUrl, boxToken, boxDeviceName);
				}
				else {
					if (status == 'granted') {
						// Save token in db
						var account = {name: 'default', url: boxUrl, appToken: boxToken, deviceName: boxDeviceName};
						this.saveAccount(account, function (result) {
							$scope.$apply(function () {
								if (result) {
									// Store account for further usage
									app.account = account;

									// Menu
									$scope.homeEnabled = true;
									$scope.rateEnabled = true;

									// Notification
									info("StopWifi a été associée avec succès à votre box. Vous pouvez désormais utiliser l'application. Avant d'aller plus loin, veuillez lire les informations en rouge sur cette page.");

									$scope.loading = false;

									// Update UI
									updateAssociationStatusFields(true);
								}
							});
						});
					}
					else if (status == 'denied') {
						$scope.loading = false;

						// Notification
						error("Impossible d'associer l'application et votre box car vous avez refusé l'association. Veuillez essayer à nouveau.");
					}
					else if (status == 'timeout') {
						$scope.loading = false;

						// Notification
						error("Impossible d'associer l'application et votre box car le temps d'attente pour l'autorisation est écoulé.  Veuillez essayer à nouveau.");
					}
					else {
						$scope.loading = false;

						// Notification
						error("Impossible d'associer l'application et votre box. Veuillez essayer à nouveau. Si le problème persiste, veuillez contacter le support ou consultez l'aide.");
					}
				}
			}, function (reason) {
				$scope.loading = false;
				error("Problème rencontré lors de l'association entre l'application et votre box. Veuillez essayer à nouveau. Si le problème persiste, veuillez contacter le support ou consultez l'aide." + showErrorDetails(reason));
			});
		}
	};

	var updateAssociationStatusFields = function (status) {
		$scope.associationStatus = status;
		$scope.associationStatusLabel = status ? 'OK' : 'KO';
		$scope.associationStatusActionCSS = status ? 'link-disabled' : 'link-enabled';
		$scope.associationStatusIconCSS = status ? 'link-enabled' : 'link-disabled';
	};

	var getWifiStatus = function () {
		$log.debug('IN getWifiStatus.');

		if (checkConnection()) {
			$scope.loading = true;
			mainService.getWifiStatus(app.account.url, app.account.appToken, app.account.deviceName).then(function (response) {
				var status = response.data == 'true';
				$scope.wifiStatus = status;
				updateWifiStatusFields(status);
				$scope.loading = false;
			}, function (reason) {
				$scope.loading = false;
				error("Problème rencontré lors de la récupération du statut wifi. Veuillez essayer à nouveau. Si le problème persiste, veuillez contacter le support ou consultez l'aide." + showErrorDetails(reason));
			});
		}
	};

	var setWifiStatus = function (status, retryNumber) {
		$log.debug('IN setWifiStatus.');

		if (checkConnection()) {
			$scope.loading = true;
			mainService.setWifiStatus(status, app.account.url, app.account.appToken, app.account.deviceName).then(function (response) {
				var status = response.data == 'true';
				updateWifiStatusFields(status);
				$scope.loading = false;
			}, function (reason) {
				if (retryNumber < 5) {
					sleepMs(2000);
					setWifiStatus(status, retryNumber + 1);
				}
				else {
					$scope.loading = false;
					error("Problème rencontré lors de la modification du statut wifi. Veuillez vérifier que l'application à bien accès aux modification des réglages de la box (console Freebox OS) et essayez à nouveau. Si le problème persiste, veuillez contacter le support ou consultez l'aide." + showErrorDetails(reason));
				}
			});
		}
	};

	var updateWifiStatusFields = function (status) {
		$log.debug('IN updateWifiStatusFields.');
		$scope.wifiStatus = status;
		$scope.wifiStatusLabel = status ? 'Actif' : 'Inactif';
		$scope.wifiStatusActionCSS = status ? 'wifi-disabled' : 'wifi-enabled';
		$scope.wifiStatusIconCSS = status ? 'wifi-enabled' : 'wifi-disabled';
	};

	var getDeviceUUID = function () {
		$log.debug('IN getDeviceUUID.');
		return 'StopWifi-' + Math.floor((Math.random() * 1000) + 1);
	};

	var getDevicePlatform = function () {
		$log.debug('IN getDevicePlatform.');
		if (device && device.platform) {
			return device.platform;
		}
		else {
			return 'n/a';
		}
	};

	var getDeviceVersion = function () {
		$log.debug('IN getDeviceVersion.');
		if (device && device.version) {
			return device.version;
		}
		else {
			return 'n/a';
		}
	}
}]);

// Directives

mainModule.directive('spinner', function () {
	return {
		restrict: 'A',
		link: function (scope, elem, attrs) {
			scope.$watch('loading', function (newValue, oldValue) {
				if (newValue == true) {
					// Disable scroll during spinner activation
					document.ontouchmove = function (e) {
						e.preventDefault();
					};

					var scrollX = window.pageXOffset;
					var scrollY = window.pageYOffset;
					$('#spinner').css({left: scrollX, top: scrollY });
				}
				else if (newValue == false) {
					// Enable scroll again
					document.ontouchmove = function (e) {
						return true;
					}
				}
			});
		}
	}
});

// Spinner: <spinner image="spinner.image" active="spinner.active"/>
mainModule.directive('spinnernew', function ($timeout) {
	return {
		templateUrl: "tpl/spinner.html",
		replace: true,
		priority: 0,
		restrict: 'AE',
		scope: {
			image: '=',
			message: '=',
			active: '='
		},

		link: function (scope, element, attr) {
			scope.$watch('active', function (newValue) {
				if (newValue == true) {
					// Center spinner container
					var scrollX = window.pageXOffset;
					var scrollY = window.pageYOffset;
					element.css({left: scrollX, top: scrollY });

					// Display spinner message
					var spinnerLoaderTop = $('.spinner-loader', element).offset().top;
					$('.spinner-message', element).css({'margin-top': spinnerLoaderTop + 50});
					$('.spinner-message', element).css({display: 'block'});
				}
			});
		}
	};
});