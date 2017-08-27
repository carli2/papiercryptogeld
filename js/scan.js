$(function () {
	let scanner = new Instascan.Scanner({ video: document.getElementById('preview'), mirror: false });
	scanner.addListener('scan', onScan);
	Instascan.Camera.getCameras().then(function (cameras) {
		if (cameras.length > 0) {
			var favourite = 0;
			for (var i = 0; i < cameras.length; i++) {
				if (cameras[i].name.indexOf('back') != -1) favourite = i;
			}
			scanner.start(cameras[favourite]);
		} else {
			console.error('No Cameras found');
		}
	}).catch(function (e) {
		console.error(e);
	});
});

