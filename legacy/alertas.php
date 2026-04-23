<?php
echo('<h1>Alertas</h1>'); 
// CONFIG
echo('
<form>
 ON <input name="on_off" type="radio" value="1"/>
 OFF <input name="on_off" type="radio" value="0"/>
 <br>
 <hr>
 <br>
 Frecuencia (Veces al día):<br>
 <input onchange="getElementById(\'view_frec\').innerHTML=this.value;" type="range" min="1" max="100" /><div id="view_frec">1</div><br>
 Limite (Cantidad de dias):<br>
 <input onchange="getElementById(\'view_limit\').innerHTML=this.value;" type="range" min="1" max="100" /><div id="view_limit">1</div><br>
</form>
');

// VERIFY
// GET CFG
	$sql_cfg="SELECT * FROM CFG";
	$query_cfg=mysql_query($sql_cfg,$conexion);
	
	$fecha_actual=date("y:m:d");
$sql_v="SELECT *, TO_DAYS( fecha_entrega) - TO_DAYS('".$fecha_actual."') AS dias_entrega, TO_DAYS( fecha_pago) - TO_DAYS('".$fecha_actual."') AS dias_pago FROM ventas ORDER BY fecha DESC";
$query_v = mysql_query($sql_v, $conexion);
while($v=mysql_fetch_array($query_v)){
	
	if($v["dias_pago"]>=$CFG_LIMIT_V){
		
	}
}
// SEND MSJ

?>