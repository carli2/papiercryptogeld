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
		$scope.$apply();
	}
	$scope.qrtext = 'Hello World';

	function refresh() {
		$scope.$apply();
	}

	$scope.pocket = [
		new Token(),
		new Token('priv:cYG0SPLU2pGDeBmsF8R1WKAf9RL4E27eO/ZMIW2gJEA=', refresh), //new Token('priv:7181b448f2d4da91837819ac17c47558a01ff512f8136ede3bf64c216da02440'),
		new Token('pub:AzGQ50Pam9ZhllEm52JvQLopzN5yxwJziybk6tkZjG5X', refresh) //new Token('pub:033190e743da9bd661965126e7626f40ba29ccde72c702738b26e4ead9198c6e57')*/
	];

	$scope.opts = {
		nopriv: true // TODO: localStorage
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

	$scope.refreshAll = function () {
		Token.refreshAll($scope.pocket);
	}

	$scope.removeSelected = function () {
		if (confirm('Mit dem Löschen der Scheine verlieren Sie das Geld, wenn Sie es vorher nicht ausgedruckt haben')) {
			$scope.pocket = $scope.pocket.filter(function (bill) {
				return !bill.selected;
			});
		}
	}

	$scope.removeInvalid = function () {
		$scope.pocket = $scope.pocket.filter(function (bill) {
			return bill.amount > 0;
		});
	}

	$scope.removePublics = function () {
		$scope.pocket = $scope.pocket.filter(function (bill) {
			return bill.priv;
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
			var nextOutput = Number(prompt('Bitte geben Sie den Wert für einen Schein ein:', amount));
			if (nextOutput === undefined) return alert('Stückelungsvorgang abgebrochen');
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
		Token.performTransaction(input, output, $scope.pocket);
	}

	$scope.create = function () {
		var amount = prompt('Welchen Geldbetrag soll der Schein haben?', '0');
		if (amount > 0) {
			var token = new Token(undefined, refresh);
			token.register(amount);
			$scope.pocket.splice(0, 0, token);
		}
	}

	$scope.addToPocket = function (bill) {
		for (var i = 0; i < $scope.pocket.length; i++) {
			if ($scope.pocket[i].pub == bill.pub) {
				alert('Der Schein ist schon in der Geldbörse');
				return false;
			}
		}
		$scope.pocket.splice(0, 0, bill);
	}

	$scope.print = function () {
		var oldopts = $scope.opts.nopriv;
		$scope.opts.nopriv = false;
		window.setTimeout(function () {
			window.print();
			$scope.opts.nopriv = oldopts;
			$scope.$apply();
		}, 0);
	}
});
