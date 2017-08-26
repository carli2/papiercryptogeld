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
});

