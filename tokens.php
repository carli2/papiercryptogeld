<?php

/*

SQL Schema:
CREATE TABLE `test`.`tokens` ( `pubkey` VARCHAR(50) NOT NULL , `amount` BIGINT NOT NULL , PRIMARY KEY (`pubkey`)) ENGINE = InnoDB;

*/

require 'vendor/autoload.php';
include 'conf.php';

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

die($db->query('SELECT amount FROM tokens WHERE pubkey = ' . $db->quote($_GET['pub']))->fetchColumn() ?: 0);

/*
use Mdanter\Ecc\EccFactory;
use Mdanter\Ecc\Serializer\PrivateKey\PemPrivateKeySerializer;
use Mdanter\Ecc\Serializer\PrivateKey\DerPrivateKeySerializer;

$adapter = EccFactory::getAdapter();
$generator = EccFactory::getNistCurves()->
// https://github.com/phpecc/phpecc/tree/master/src/Curves
*/
