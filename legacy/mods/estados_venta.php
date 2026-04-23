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
echo('<script>alert("Estados Ventas:  ID:: '.$_GET["id"].' mode:'.$_GET["mode"].'")</script>');
if($_GET["mode"]=="del"){
	
		//////// DELETE

		$sql_del="DELETE FROM estados_venta WHERE id_estado='".$_GET["id"]."'";
		$query_del = mysql_query($sql_del, $conexion);
		if ($sql_del){
			echo('Eliminado correctamente');
			echo('<script>alert("Eliminado correctamente : '.$_GET["id"].'")</script>');
		}
		else
		{
			echo('ERROR ELIMINANDO');
			echo('<script>alert("Error Eliminado : '.$_GET["id"].'")</script>');
		}
	/////////////////////////////
}
if($_GET["mode"]=="update"){

		//SQL
		
		
		$color="#".$_GET["color"];
		$id=$_GET["id"];
		$estado=str_ireplace("-magic-"," ",$_GET["estado"]);
		
		
		$sql="UPDATE estados_venta SET
			estado='".$estado."',
			color='".$color."'
						
			WHERE

			id_estado='".$id."'";
			$query = mysql_query($sql, $conexion);
			if($sql){
				//OK
				echo('<h1>UPDATED</h1>');
				echo('
					<script>
						alert("color:'.$color.' ('.$estado.')  ");
					</script>
				');
			}else{
				echo('<h1>FULL UPDATE ERROR'.mysql_error().'</h1>');
				exit;
			}
}
if($_POST["mode"]=="add"){
		/***/////// AGREGAR:  ///////***/
		$sql=mysql_query("INSERT INTO estados_venta (
		id_estado,
		estado,
		color
		)
		VALUES(	
		'".$_POST["id_estado"]."',
		'".utf8_decode($_POST["estado"])."',
		'".$_POST["color"]."'
		)
		"
		);
		
		if ($sql){
		echo('
		Agregado!
		
		<script>ver(\'estados_venta.php\',\'sub-main\');</script>');
		}
		else
		{
			echo('ERROR:'.mysql_error());
		}
	}
	
	
	/***/////////// DEFAULT //////////////***/
	
	echo('
	<h2>Estados Ventas</h2>
	<h4>'.$_GET["mode"].' '.$_GET["id"].' '.$_GET["estado"].' '.$_GET["color"].'</h4>
	
	<input type="button" value="Nuevo Estado" onclick="document.getElementById(\'nuevo\').style.display=\'block\';"/>

		<form id="nuevo" action="mods/estados_venta.php" method="post" target="sub-console" style="display:none;"/> 
		
		<table style="width:auto;">
		 <tr>
		  <th>
		   <label for="estado">Estado</label>
		  </th>
		  <th>
		   <label for="color">Color</label>
		  </th>
		  <th></th>
		 </tr>
		 <tr>
		  <td>
		   <input name="estado" type="text" value="estado"/>
		  </td>
		  <td>
		   <input name="color" type="color" value="color"/>
		  </th>
		  <td colspan="6">
		   <input type="hidden" name="mode" value="add"/>
		   <input type="submit" value="Agregar"/></td>
		 </tr>
		</table>
		<input type="button" value="Ocultar" onclick="document.getElementById(\'nuevo\').style.display=\'none\';"/>
		
		</form>
		
				<form id="estados" action="mods/estados_venta.php" method="post" target="sub-console" /> 	
			<table style="width:auto;">
				<tr>
				 <th>
				   <label for="estado">estado</label>
				  </th>
				  <th>
				   <label for="color">color</label>
				  </th>
				  <th></th>
				</tr>
	');
	$sql_e="SELECT * FROM estados_venta";
	$query_e = mysql_query($sql_e, $conexion);		
	while($e=mysql_fetch_array($query_e))
	{
		echo utf8_encode('
		
			<tr>
			  <td>
			   '.$e["id_estado"].'<input id="estado_'.$e["id_estado"].'" type="estado" value="'.$e["estado"].'"/>
			  </td>
			  <td>'.$e["color"].'
			   <input id="color_'.$e["id_estado"].'" name="color_'.$e["id_estado"].'" type="color" value="'.$e["color"].'"/>
			  </td>
			  <td colspan="6">  
			  
			  <i class="fas fa-save hover-green" onclick="
			  
			  update_estado_venta('.$e["id_estado"].',
				document.getElementById(\'estado_'.$e["id_estado"].'\').value,
				document.getElementById(\'color_'.$e["id_estado"].'\').value)" title="Guardar Cambios en '.$e["id_estado"].'"></i>
			  <i class="fas fa-trash hover-red" onclick="delete_estado_venta('.$e["id_estado"].');" title="Eliminar '.$e["id_estado"].'"></i>
			  
				</td>
			 </tr>
			');
			
		}	
			echo('			
			</table>					
			<input type="hidden" name="mode" value="update"/>
			<input type="button" value="Finalizar" onclick="ver(\'null.php\',\'sub-main\');"/>
			</form>
		
		<iframe frameborder="0" width="1" height="1" id="sub-console" name="sub-console" src=""></iframe>
		');


?>