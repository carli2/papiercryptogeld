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

	$scope.sum = function () {
		var result = 0;
		for (var i = 0; i < $scope.pocket.length; i++) {
			if ($scope.pocket[i].priv) {
				result += Number($scope.pocket[i].amount) || 0;
			}
		}
		return result;
	}

	$scope.refreshAll = function () {
		Token.refreshAll($scope.pocket);
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
