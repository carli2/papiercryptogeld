/* Library for browser and node.js */

if (typeof $ === 'undefined') $ = require('jQuery');
if (typeof elliptic === 'undefined') elliptic = require('elliptic');
ec = new elliptic.ec('secp256k1');

var baseurl = 'tokens.php';

var currency = {
	bank: 'Not set up',
	bankurl: 'https://launix.de',
	unit: '??'
}

$.getJSON(baseurl + '?bank').then(function (currencyLoaded) {
	for (var i in currencyLoaded) currency[i] = currencyLoaded[i];
});

function hexToBase(hex) { return btoa(String.fromCharCode.apply(null, hex.match(/\w{2}/g).map(function(a) { return parseInt(a, 16) }))); }
function baseToHex(base) { return elliptic.utils.toHex(atob(base).split('').map(function (x) { return x.charCodeAt(0); })); } 

/* Konstruktor: erstellt Schein neu oder aus Daten */
function Token(qrtext, onLoad) {
	var self = this;
	this.checkValidity = function () {
		return $.get(baseurl + '?pub=' + escape(this.pub)).then(function (result) {
			self.amount = result;
			if (onLoad) onLoad(self);
			return result;
		});
	}

	if (!qrtext) {
		// neu generieren
		var key = ec.genKeyPair();
		this.key = key;
		this.pub = hexToBase(elliptic.utils.toHex(key.getPublic().encodeCompressed()));
		this.priv = hexToBase(elliptic.utils.toHex(key.getPrivate().toArray()));
		this.register = function (amount) {
			$.get(baseurl + '?pub=' + escape(this.pub) + '&amount=' + escape(amount)).then(function (answer) {
				alert(answer);
				self.checkValidity();
			});
		}
	} else {
		// priv vs pub unterscheiden
		if (qrtext.startsWith('priv:')) {
			var key = ec.keyFromPrivate(baseToHex(qrtext.substr(5)));
			this.key = key;
			this.pub = hexToBase(elliptic.utils.toHex(key.getPublic().encodeCompressed()));
			this.priv = hexToBase(elliptic.utils.toHex(key.getPrivate().toArray()));
			this.checkValidity();
		} else if (qrtext.startsWith('pub:')) {
			var key = ec.keyFromPublic(ec.curve.decodePoint(baseToHex(qrtext.substr(4)), 'hex'));
			this.key = key;
			this.pub = hexToBase(elliptic.utils.toHex(key.getPublic().encodeCompressed()));
			this.priv = undefined;
			this.checkValidity();
		} else {
			throw new Error('QR-Code stellt keinen Schein dar');
		}
	}
}

Token.refreshAll = function (pocket) {
	for (var i = 0; i < pocket.length; i++) {
		pocket[i].checkValidity();
	}
}

if (typeof module !== 'undefined') module.exports = Token;

// AngularJS-Direktive zur Darstellung der Scheine
if (typeof app !== 'undefined') {
	app.directive('bill', function () {
		return {
			restrict: 'E',
			scope: { ngModel: '=', hidePriv: '=' },
			controller: function ($scope) {
				$scope.bank = 'Werkraum Zittau e.V.';
				$scope.bankurl = 'https://launix.de/';
			},
			template: '<div class="bill" ng-class="{selected: ngModel.selected}" ng-click="ngModel.selected = !ngModel.selected"><qrcode version="4" size="400" data="pub:{{ngModel.pub}}"></qrcode><div class="main">'
			+'Seriennummer: {{ngModel.pub}}<br><span class="wert"><span ng-if="ngModel.amount > 0">Wert: {{ngModel.amount|money}}</span><span ng-if="!(ngModel.amount > 0)" class="invalid">unbekannt / ungültig</span></span><br>{{bank}}<br><a ng-href="bankurl" target="_blank">{{bankurl}}</a>'
			+'</div><div class="trenner" ng-if="ngModel.priv && !hidePriv"><span>hier knicken</span></div><img src="scramble.png" class="scramble" ng-if="ngModel.priv && !hidePriv"><div class="trenner" ng-if="ngModel.priv && !hidePriv"><span>hier knicken</span></div><qrcode version="4" size="400" data="priv:{{ngModel.priv}}" ng-if="ngModel.priv && !hidePriv"></qrcode></div>'
		};
	});

	app.filter('money', function () {
		return function (x) {
			if (typeof x === 'number') x = x.toFixed(0);
			return currency.unit + ' ' + x.replace(/(\d)(?=(\d{3})+$)/g, '$1.');
		};
	});
}
