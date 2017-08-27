<?php

/*

SQL Schema:
CREATE TABLE `test`.`tokens` ( `pubkey` VARCHAR(50) NOT NULL , `amount` BIGINT NOT NULL , PRIMARY KEY (`pubkey`)) ENGINE = InnoDB;

*/

require 'vendor/autoload.php';
include 'conf.php';

use Mdanter\Ecc\EccFactory;
use Mdanter\Ecc\Crypto\Signature\Signer;
use Mdanter\Ecc\Crypto\Key\PublicKey;
use Mdanter\Ecc\Serializer\Point\CompressedPointSerializer;
use Mdanter\Ecc\Serializer\Signature\DerSignatureSerializer;

if (isset($_GET['bank'])) {
	header('Content-Type: application/json');
	die(json_encode($bankinfo));
}

if (isset($_GET['amount'])) {
	if (!isset($_SERVER['PHP_AUTH_USER'])) {
		header('WWW-Authenticate: Basic realm="Zugang erforderlich"');
		header('HTTP/1.0 401 Unauthorized');
		die('Sie sind nicht dazu berechtigt');
	} else if ($_SERVER['PHP_AUTH_PW'] != $moneyPrintPassword) {
		header('WWW-Authenticate: Basic realm="Zugang erforderlich"');
		header('HTTP/1.0 401 Unauthorized');
		die('Zugriff verweigert');
	} else {
		$db->query('INSERT INTO tokens SET pubkey = ' . $db->quote($_GET['pub']) . ', amount = ' . $db->quote($_GET['amount']));
		die('OK');
	}
}

if (isset($_GET['tx']) && isset($_GET['sigs'])) {
	$lr = explode('=>', $_GET['tx']);
	if (count($lr) != 2) {
		header('HTTP/1.0 422 Unprocessable Entity');
		die('Falsches Transaktions-Format');
	}
	$inputs = explode(';', $lr[0]);
	$sigs = explode(';', $_GET['sigs']);
	if (count($inputs) != count($sigs)) {
		header('HTTP/1.0 422 Unprocessable Entity');
		die('Signaturen und Inputs stimmen nicht überein');
	}

	$adapter = EccFactory::getAdapter();
	$generator = EccFactory::getSecgCurves()->generator256k1();
	$algorithm = 'sha256';
	$sigSerializer = new DerSignatureSerializer();
	$pkSerializer = new CompressedPointSerializer($adapter);
	$signer = new Signer($adapter);
	$hash = $signer->hashData($generator, $algorithm, $_GET['tx']);

	foreach ($inputs AS $idx => $input) {
		// alle Inputs testen
		$sig = $sigSerializer->parse(base64_decode($sigs[$idx]));
		$key = new PublicKey($adapter, $generator, $pkSerializer->unserialize($generator->getCurve(), bin2hex(base64_decode($input))));
		$check = $signer->verify($key, $sig, $hash);
		if (!$check) {
			header('HTTP/1.0 401 Unauthorized');
			die('Signature at index ' . $idx . ': check has failed');
		}
	}

	$outputs = explode(';', $lr[1]);
	die('success');
}

die($db->query('SELECT amount FROM tokens WHERE pubkey = ' . $db->quote($_GET['pub']))->fetchColumn() ?: 0);
