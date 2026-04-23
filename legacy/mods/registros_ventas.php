<?php 
include "../c.php";
function GetRand($longitud) {
 $key = '';
 $pattern = '1234567890abcdefghijklmnopqrstuvwxyz';
 $max = strlen($pattern)-1;
 for($i=0;$i < $longitud;$i++) $key .= $pattern{mt_rand(0,$max)};
 return $key;
}
echo('<script type="text/javascript" src="../js.js?c='.GetRand(20).'"></script>');

if($_GET["mode"]=="update"){

		//SQL		
		$cantidad=$_GET["cantidad"];		
		$sql="UPDATE registros_ventas SET cantidad=$cantidad WHERE id=0";
			$query = mysql_query($sql, $conexion);
			if($query){
				//OK
				echo('<h1>UPDATED</h1>');
				echo('
					<script>
						alert("cantidad:'.$cantidad.' ");
					</script>
				');
			}else{
				echo('<h1>FULL UPDATE ERROR'.mysql_error().'</h1>');
				exit;
			}
}
	
	
	/***/////////// DEFAULT //////////////***/
	
	echo('
	<h2>Cantidad de Ventas en listado</h2>
	<form id="registros_ventas" action="mods/registros_ventas.php" method="post" target="sub-console" /> 	
			<table style="width:auto;">
				<tr>
				 <th>
				   <label for="cantidad">Cantidad de Ventas en Pagina</label>
				  </th>
				  <th></th>
				</tr>
                ');
                    $sql_e="SELECT * FROM registros_ventas WHERE id=0";
                    $query_e = mysql_query($sql_e, $conexion);		
                    $e=mysql_fetch_array($query_e);
		        echo utf8_encode('
			<tr>
			  <td>Cantidad Actual '.$e["cantidad"].'
			   <input id="cantidad" name="cantidad" type="number" value="'.$e["cantidad"].'"/>
			  </td>
			  <td>  
			  
			  <i class="fas fa-save hover-green" onclick="update_registros_venta(document.getElementById(\'cantidad\').value)" title="Guardar Cambios"></i>
			  
				</td>
			 </tr>
			</table>					
			</form>
		
		<iframe frameborder="0" width="1" height="1" id="sub-console" name="sub-console" src=""></iframe>
		');


?>