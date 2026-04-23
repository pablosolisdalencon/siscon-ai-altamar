<?php 
session_start();
function GetRand($longitud) {
 $key = '';
 $pattern = '1234567890abcdefghijklmnopqrstuvwxyz';
 $max = strlen($pattern)-1;
 for($i=0;$i < $longitud;$i++) $key .= $pattern{mt_rand(0,$max)};
 return $key;
}
echo('
<h1>Configuraciones</h1>
<p>
	Aqui se configuran algunas variables y combos globales.
	
</p>
<div id="sub-menu">
	<div onclick="ver(\'mods/estados_venta.php?c='.GetRand(20).'\',\'sub-main\');" class="sub-menu-btn">Estados Ventas</div>
	<div onclick="ver(\'mods/registros_ventas.php?c='.GetRand(20).'\',\'sub-main\');" class="sub-menu-btn">Registros Ventas</div>
	<div class="sub-menu-btn unable">Estados Compras</div>
	<div class="sub-menu-btn unable">Estados Empresas</div>
	<div class="sub-menu-btn unable">Alarmas Ventas</div>
	<div class="sub-menu-btn unable">Alarmas Compras</div>
</div>
<div id="sub-main"></div>
');

?>