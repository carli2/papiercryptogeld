ec = new elliptic.ec('secp256k1');

function hexToBase(hex) { return btoa(String.fromCharCode.apply(null, hex.match(/\w{2}/g).map(function(a) { return parseInt(a, 16) }))); }
function baseToHex(base) { return elliptic.utils.toHex(atob(base).split('').map(function (x) { return x.charCodeAt(0); })); } 

/* Konstruktor: erstellt Schein neu oder aus Daten */
function Token(qrtext, onLoad) {
	var self = this;
	this.checkValidity = function () {
		return $.get('tokens.php?pub=' + escape(this.pub)).then(function (result) {
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
