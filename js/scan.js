$(function () {
	let scanner = new Instascan.Scanner({ video: document.getElementById('preview') });
	scanner.addListener('scan', onScan);
	Instascan.Camera.getCameras().then(function (cameras) {
		if (cameras.length > 0) {
			scanner.start(cameras[0]);
		} else {
			console.error('No Cameras found');
		}
	}).catch(function (e) {
		console.error(e);
	});

	printQR('asdffj35iu348953904930239024324234324233432423', '12 Euro');
});

var currentQR = null;
function printQR(text, description) {
	if (currentQR) {
		currentQR.clear();
		currentQR.makeCode(text);
	} else {
		currentQR = new QRCode(document.getElementById('qrcode'), text);
	}
	$('#qrdescription').text(description);
}

function onScan(qrtext) {
	console.log('scanned '+qrtext);
	printQR(qrtext, 'Gelesener Text: ' + qrtext);
}
