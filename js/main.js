var app = angular.module('app', ['monospaced.qrcode']);

app.controller('Main', function ($scope) {
	$scope.vh = function () {
		if (window.innerWidth > 400) return 400;
		return window.innerWidth - 20;
	}
	window.onresize = function () {
		$scope.$apply();
	}
	window.onScan = function (qrtext) {
		$scope.qrtext = qrtext;
		$scope.qrbill = null;
		try {
			$scope.qrbill = new Token(qrtext, function () {
				$scope.$apply();
			});
		} catch (e) {
		}
		$(window).scrollTo('#scan2');
		$scope.$apply();
	}
	$scope.qrtext = 'Hello World';

	$scope.pocket = [];

	function refreshLocalStorage() {
		var bills = {};
		var billsp = {};
		$scope.pocket.forEach(function (bill) {
			bills[bill.pub] = bill;
			if (bill.priv) {
				billsp[bill.priv] = bill;
				// meinen Schein im localStorage sichern
				localStorage['priv:' + bill.priv] = bill.amount;
			} else {
				localStorage['pub:' + bill.pub] = bill.amount;
			}
		});
		// Sachen aus dem localStorage aufnehmen
		for (var i in localStorage) {
			if (i.startsWith('pub:')) {
				if (!bills[i.substr(4)]) {
					$scope.pocket.push(new Token(i, refresh));
				}
			} else if (i.startsWith('priv:')) {
				if (!billsp[i.substr(5)]) {
					$scope.pocket.push(new Token(i, refresh));
				}
			}
		}
	}

	// Scheine aus dem Storage laden
	refreshLocalStorage();

	function refresh() {
		// auf neue Scheine aus anderen Tabs reagieren; eigene Scheine abspeichern
		refreshLocalStorage();
		$scope.$apply();
	}

	function performTransaction(input, output, onSuccess) {
		Token.performTransaction(input, output, function () {
			// Pocket nach Transaktion updaten
			for (var i = 0; i < input.length; i++) {
				var bill = input[i];
				// ungültige Scheine aus localStorage raus
				delete localStorage['pub:' + bill.pub];
				delete localStorage['priv:' + bill.priv];
				var idx = $scope.pocket.indexOf(bill);
				if (idx != -1) $scope.pocket.splice(idx, 1);
			}
			// Neue Scheine in Pocket eintragen
			for (var i = 0; i < output.length; i++) {
				$scope.pocket.splice(0, 0, output[i]);
			}
			// Scope applien und localStorage abspeichern
			if (onSuccess) onSuccess();
			refresh();
		});
	}

	$scope.opts = {
		nopriv: true
	};

	$scope.sum = function (selected) {
		var result = 0;
		for (var i = 0; i < $scope.pocket.length; i++) {
			if (selected ? $scope.pocket[i].selected : $scope.pocket[i].priv) {
				result += Number($scope.pocket[i].amount) || 0;
			}
		}
		return result;
	}

	$scope.numSelected = function () {
		var result = 0;
		for (var i = 0; i < $scope.pocket.length; i++) {
			if ($scope.pocket[i].selected) {
				result++;
			}
		}
		return result;
	}

	$scope.refreshAll = function () {
		Token.refreshAll($scope.pocket);
	}

	$scope.offer = function (bill) {
		$scope.qrtext = 'priv:' + bill.priv;
		$scope.qrbill = bill;
		$(window).scrollTo('#scan2');
	}

	$scope.has = function (pub) {
		for (var i = 0; i < $scope.pocket.length; i++) {
			if ($scope.pocket[i].pub == pub) return true;
		}
		return false;		
	}

	$scope.remove = function (pub) {
		if (confirm('Mit dem Löschen des Scheins verlieren Sie das Geld, wenn Sie es vorher nicht eingescant haben')) {
			for (var i = 0; i < $scope.pocket.length; i++) {
				var bill = $scope.pocket[i];
				if (bill.pub == pub) {
					delete localStorage['pub:' + bill.pub];
					delete localStorage['priv:' + bill.priv];
					$scope.pocket.splice(i, 1);
					return;
				}
			}
		}
	}

	$scope.removeSelected = function () {
		if (confirm('Mit dem Löschen der Scheine verlieren Sie das Geld, wenn Sie es vorher nicht ausgedruckt haben')) {
			$scope.pocket = $scope.pocket.filter(function (bill) {
				if (bill.selected) {
					delete localStorage['pub:' + bill.pub];
					delete localStorage['priv:' + bill.priv];
				}
				return !bill.selected;
			});
		}
	}

	$scope.removeInvalid = function () {
		$scope.pocket = $scope.pocket.filter(function (bill) {
			if (bill.amount > 0) {
				return true;
			} else {
				delete localStorage['pub:' + bill.pub];
				delete localStorage['priv:' + bill.priv];
				return false;
			}
		});
	}

	$scope.removePublics = function () {
		$scope.pocket = $scope.pocket.filter(function (bill) {
			if (bill.priv) {
				return true;
			} else {
				delete localStorage['pub:' + bill.pub];
				delete localStorage['priv:' + bill.priv];
				return false;
			}
		});
	}

	$scope.fuse = function (bill2) {
		var amount = Number(bill2.amount);
		var input = $scope.pocket.filter(function (bill) {
			if (bill.priv && bill.selected && bill.amount > 0 && bill.pub != bill2.pub) {
				amount += Number(bill.amount);
				return true;
			} else return false;
		});
		input.push(bill2);
		var output = [];

		var newToken = new Token(undefined, refresh);
		newToken.amount = amount;
		performTransaction(input, [newToken], function () {
			$scope.qrtext = 'Erfolg';
			$scope.qrbill = null;
			$(window).scrollTo('#pocket');
		});
	}

	$scope.slice = function () {
		var amount = 0;
		var input = $scope.pocket.filter(function (bill) {
			if (bill.priv && bill.selected && bill.amount > 0) {
				amount += Number(bill.amount);
				return true;
			} else return false;
		});
		if (input.length == 0) return alert('Keine Scheine ausgewählt');
		var output = [];
		while (amount > 0) {
			var nextOutput = prompt('Bitte geben Sie den Wert für einen Schein ein:', amount);
			if (nextOutput === undefined || nextOutput === null) return alert('Stückelungsvorgang abgebrochen');
			nextOutput = Number(nextOutput);
			if (nextOutput <= 0) {
				alert('Bitte geben Sie einen gültigen Wert ein');
				continue;
			}
			if (nextOutput > amount) {
				alert('Der eingegebene Betrag ist zu groß');
				continue;
			}
			if (nextOutput != Math.round(nextOutput)) {
				alert('Es sind keine Kommawerte erlaubt');
				continue;
			}
			var newToken = new Token(undefined, refresh);
			newToken.amount = nextOutput;
			amount -= nextOutput;
			output.push(newToken);
		}
		performTransaction(input, output);
		$(window).scrollTo('#pocket');
	}

	$scope.offerPayment = function () {
		var amount = 0;
		var input = $scope.pocket.filter(function (bill) {
			if (bill.priv && bill.selected && bill.amount > 0) {
				amount += Number(bill.amount);
				return true;
			} else return false;
		});
		if (input.length == 0) return alert('Keine Scheine ausgewählt');
		var output = [];
		var nextOutput = prompt('Bitte geben Sie an, welchen Wert Sie anbieten wollen:', amount);
		if (nextOutput === undefined || nextOutput === null) return alert('Vorgang abgebrochen');
		nextOutput = Number(nextOutput);
		if (nextOutput <= 0) {
			alert('Bitte geben Sie einen gültigen Wert ein');
			return;
		}
		if (nextOutput > amount) {
			alert('Der eingegebene Betrag ist zu groß. Bitte wählen Sie mehr Scheine aus.');
			return;
		}
		if (nextOutput != Math.round(nextOutput)) {
			alert('Es sind keine Kommawerte erlaubt');
			return;
		}
		if (amount == nextOutput && input.length == 1) {
			// Schein direkt anbieten
			$scope.qrtext = 'pub:' + input[0].pub;
			$scope.qrbill = input[0];
			$(window).scrollTo('#scan2');
			return;
		}
		var newToken = new Token(undefined, refresh);
		newToken.amount = nextOutput;
		output.push(newToken);
		if (nextOutput < amount) {
			var restToken = new Token(undefined, refresh);
			restToken.amount = amount - nextOutput;
			output.push(restToken);
		}
		
		performTransaction(input, output, function () {
			// abgespaltenen Geldbetrag anzeigen
			$scope.qrtext = 'pub:' + newToken.pub;
			$scope.qrbill = newToken;
			$(window).scrollTo('#scan2');
		});
	}

	$scope.create = function () {
		var amount = prompt('Welchen Geldbetrag soll der Schein haben?', '0');
		if (amount > 0) {
			var token = new Token(undefined, refresh);
			token.register(amount);
			$scope.pocket.splice(0, 0, token);
			$(window).scrollTo('#pocket');
		}
	}

	$scope.addToPocket = function (bill) {
		for (var i = 0; i < $scope.pocket.length; i++) {
			if ($scope.pocket[i].pub == bill.pub) {
				if (!$scope.pocket[i].priv && bill.priv) {
					// Private Key nachrüsten
					$scope.pocket[i] = bill;
					return true;
				}
				alert('Der Schein ist schon in der Geldbörse');
				return false;
			}
		}
		$scope.pocket.splice(0, 0, bill);
		refreshLocalStorage();
		return true;
	}

	$scope.print = function (onlySelected) {
		var oldopts = $scope.opts.nopriv;
		$scope.opts.nopriv = false;
		if (onlySelected) $scope.opts.printMode = true;
		window.setTimeout(function () {
			window.print();
			$scope.opts.nopriv = oldopts;
			$scope.opts.printMode = false;
			$scope.$apply();
		}, 0);
	}
});
