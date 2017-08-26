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
			$scope.qrbill = new Token(qrtext);
			console.log($scope.qrbill);
		} catch (e) {
		}
		$scope.$apply();
	}
	$scope.qrtext = 'Hello World';

	$scope.pocket = [
		new Token(),
		new Token('priv:7181b448f2d4da91837819ac17c47558a01ff512f8136ede3bf64c216da02440'),
		new Token('pub:033190e743da9bd661965126e7626f40ba29ccde72c702738b26e4ead9198c6e57')
	];

	$scope.opts = {
		nopriv: true // TODO: localStorage
	};

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

app.directive('bill', function () {
	return {
		restrict: 'E',
		scope: { ngModel: '=', hidePriv: '=' },
		controller: function ($scope) {
			$scope.bank = 'Werkraum Zittau e.V.';
			$scope.bankurl = 'https://launix.de/';
		},
		template: '<div class="bill"><qrcode size="400" data="pub:{{ngModel.pub}}"></qrcode><div class="main">'
		+'Seriennummer: {{ngModel.pub}}<br><span class="wert">Wert: {{ngModel.amount|number:2}}</span><br>{{bank}}<br><a ng-href="bankurl" target="_blank">{{bankurl}}</a>'
		+'</div><img src="scramble.png" class="scramble" ng-if="ngModel.priv && !hidePriv"><div class="trenner" ng-if="ngModel.priv && !hidePriv"><span>hier knicken</span></div><qrcode size="400" data="priv:{{ngModel.priv}}" ng-if="ngModel.priv && !hidePriv"></qrcode></div>'
	};
});
