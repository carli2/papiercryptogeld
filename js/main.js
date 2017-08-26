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
		$scope.$apply();
	}
	$scope.qrtext = 'Hello World';

	$scope.pocket = [
		{pub: 'pub1', amount: 1.3, priv: 'priv1'},
		{pub: 'pub2', amount: 0.7, priv: 'priv2'},
		{pub: 'pub3', amount: 6, priv: 'priv3'}
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
		template: '<div class="bill"><qrcode size="400" data="{{ngModel.pub}}"></qrcode><div class="main">'
		+'Seriennummer: {{ngModel.pub}}<br><span class="wert">Wert: {{ngModel.amount|number:2}}</span><br>{{bank}}<br><a ng-href="bankurl" target="_blank">{{bankurl}}</a>'
		+'</div><img src="scramble.png" class="scramble" ng-if="ngModel.priv && !hidePriv"><div class="trenner" ng-if="ngModel.priv && !hidePriv"><span>hier knicken</span></div><qrcode size="400" data="{{ngModel.pub}}" ng-if="ngModel.priv && !hidePriv"></qrcode></div>'
	};
});
