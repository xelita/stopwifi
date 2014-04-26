/*************************************************************************************************
 * Connection management
 ************************************************************************************************/

/* Check the user connectivity */
function checkConnection(quiet) {
	if (!quiet) {
		quiet = false;
	}

	if (!isConnectionAvailable()) {
		if (quiet == false) {
			warn("Vous n'êtes pas connecté à Internet.\nConnectez-vous et Essayez à nouveau.");
			navigator.notification.vibrate(1000);
		}
		return false;
	}
	return true;
}

function isConnectionAvailable() {
	return Connection.NONE != navigator.connection.type;
}

/*************************************************************************************************
 * Notification management
 ************************************************************************************************/

/* Display an error message to the end user */
function error(message) {
	notify("Erreur", message);
}

/* Display a warning message to the end user */
function warn(message) {
	notify("Attention", message);
}

/* Display an information message to the end user */
function info(message) {
	notify("Information", message);
}

/* Display a notification to the end user */
function notify(title, message) {
	navigator.notification.alert(message, null, title, "OK");
}

/* Display a confirmation to the end user */
function confirm(title, message, buttons, confirmHandler) {
	if (!title) {
		title = 'Confirmation';
	}
	if (!message) {
		message = 'Etes-vous sûr(e) de vouloir continuer?';
	}
	if (!buttons) {
		buttons = 'Oui,Non';
	}

	navigator.notification.confirm(message, confirmHandler, title, buttons);
}

/*************************************************************************************************
 * Events management
 ************************************************************************************************/

function registerOnPauseHandler(onPauseHandler) {
	document.addEventListener("pause", onPauseHandler, false);
}

function registerOnResumeHandler(onResumeHandler) {
	document.addEventListener("resume", onResumeHandler, false);
}

/*************************************************************************************************
 * Device management
 ************************************************************************************************/

function getDeviceFriendlyDescription() {
	return device.name + " (" + device.platform + " " + device.version + ")";
}

/*************************************************************************************************
 * Contacts management
 ************************************************************************************************/

function findContactByPhone(phoneNumber) {
	// Filter to be executed
	var options = new ContactFindOptions();
	options.filter = phoneNumber;
	options.multiple = false;

	// Query execution
	var contacts = navigator.contacts.find(fields, function (contacts) {
		alert("OK!");
	}, function (error) {
		alert("KO" + error.code);
	}, ["displayName", "phoneNumbers"]);
}

/*************************************************************************************************
 * Media management
 ************************************************************************************************/

function openMedia(url) {
	// Initialize the media to be loaded
	var media = new Media(url, function () {
		alert("OK!");
	}, function (error) {
		alert("KO" + error.code + ": " + error.message);
	});

	// Load the media
	media.play();
}

/*************************************************************************************************
 * InAppBrowser management
 ************************************************************************************************/

function openBrowser(url, target, options) {
	target = target != null ? target : '_self';
	options = options != null ? options : 'location=no';
	window.open(encodeURI(url), target, options);
}

/*************************************************************************************************
 * File management
 ************************************************************************************************/

function downloadAndStoreFile(remoteURL, targetPath) {
	var fileTransfer = new FileTransfer();
	var uri = encodeURI(remoteURL);

	fileTransfer.download(uri, targetPath, function (entry) {
		console.log("download complete: " + entry.fullPath);
	}, function (error) {
		console.log("download error source " + error.source);
		console.log("download error target " + error.target);
		console.log("upload error code" + error.code);
	});
}

/*************************************************************************************************
 * DB management
 ************************************************************************************************/

	// Account related methods

function findAccountByName(accountName, callback) {
	// Get a connection to the database
	var db = getDb();

	// Query execution
	db.transaction(function (tx) {
		tx.executeSql('SELECT * FROM ACCOUNT WHERE name = ?', [accountName], function (tx, results) {
			var item = null;
			if (results.rows && results.rows.length > 0) {
				item = results.rows.item(0);
			}
			callback(item);
		}, function (tx, error) {
			displayError('findAccountByName', error);
		});
	});
}

function saveAccount(account, callback) {
	// Get a connection to the database
	var db = getDb();

	// Query execution
	db.transaction(function (tx) {
		tx.executeSql('INSERT INTO ACCOUNT (name, url, appToken, deviceName) VALUES (?, ?, ?, ?)', [account.name, account.url, account.appToken, account.deviceName], function (tx, results) {
			callback(true);
		}, function (tx, error) {
			displayError('saveAccount', error);
			callback(false);
		});
	});
}

function deleteAccount(account, callback) {
	// Get a connection to the database
	var db = getDb();

	// Query execution
	db.transaction(function (tx) {
		tx.executeSql('DELETE FROM ACCOUNT WHERE name = ?', [account.name], function (tx, results) {
			callback(true);
		}, function (tx, error) {
			displayError('deleteAccount', error);
			callback(false);
		});
	});
}

/*************************************************************************************************
 * Database management
 ************************************************************************************************/

function getDb() {
	return window.openDatabase("stopwifi", "1.0.0", "StopWifi", 5 * 1024 * 1024);
}

function initDb() {
	getDb().transaction(populateDb, initErrorCB, initSuccessCB);
}

function initSuccessCB() {
}

function initErrorCB(error) {
	displayError('initDb', error);
}

function clearDb(tx) {
	getDb().transaction(clearDb, clearErrorCB, clearSuccessCB);
}

function clearSuccessCB() {
}

function clearErrorCB(error) {
	displayError('clearDb', error);
}

function clearDb(tx) {
	tx.executeSql('DROP TABLE IF EXISTS ACCOUNT');
}

function populateDb(tx) {
	// Table destruction
	//tx.executeSql('DROP TABLE IF EXISTS ACCOUNT');

	//Table creation
	tx.executeSql('CREATE TABLE IF NOT EXISTS ACCOUNT (name TEXT PRIMARY KEY,  url TEXT, appToken TEXT, deviceName TEXT)');
}

function displayError(context, errorObj) {
	error('[' + context + ']: Code: ' + errorObj.code + ' - Message: ' + errorObj.message);
}

