<?php
error_reporting(0);
$DBNAME="contable";

$dbhost="localhost";
$dbusuario="altamarm_god";
$dbpassword="kowlkowl.1";
$db="altamarm_".$DBNAME;



//1. Crear conexi&#65533;n a la Base de Datos

$conexion = mysql_connect($dbhost, $dbusuario, $dbpassword);

if (!$conexion) {

die("Fallo la conexi&oacute;n a la Base de Datos: " . mysql_error());

}

//2. Seleccionar la Base de Datos a utilizar

$seleccionar_bd = mysql_select_db($db, $conexion);

if (!$seleccionar_bd) {

die("Fallo la selecci&oacute;n de la Base de Datos: " . mysql_error());

}

?>
