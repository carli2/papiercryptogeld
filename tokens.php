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

die($db->query('SELECT amount FROM tokens WHERE pubkey = ' . $db->quote($_GET['pub']))->fetchColumn() ?: 0);

/*
use Mdanter\Ecc\EccFactory;
use Mdanter\Ecc\Serializer\PrivateKey\PemPrivateKeySerializer;
use Mdanter\Ecc\Serializer\PrivateKey\DerPrivateKeySerializer;

$adapter = EccFactory::getAdapter();
$generator = EccFactory::getNistCurves()->
// https://github.com/phpecc/phpecc/tree/master/src/Curves
*/
