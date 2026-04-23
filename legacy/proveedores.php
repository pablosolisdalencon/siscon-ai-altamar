<?php
include "c.php";

$add=$_POST["add"];
switch($add){
	case(1):
	// SQL ADD PROVEEDOR:
	$sql=mysql_query("INSERT INTO proveedores (
	rut,
	razon,
	giro,
	direccion,
	fono,
	mail,
	comercial_nombre,
	comercial_mail,
	comercial_fono,
	pago_nombre,
	pago_mail,
	pago_fono	
	)
	VALUES(	
	'".$_POST["rut"]."',
	'".$_POST["razon"]."',
	'".utf8_decode($_POST["giro"])."',
	'".$_POST["direccion"]."',
	'".$_POST["fono"]."',
	'".$_POST["mail"]."',
	'".$_POST["comercial_nombre"]."',
	'".$_POST["comercial_mail"]."',
	'".$_POST["comercial_fono"]."',
	'".$_POST["pago_nombre"]."',
	'".$_POST["pago_mail"]."',
	'".$_POST["pago_fono"]."'
	)
	"
	);
	
	if ($sql){
	echo('
	proveedor agregado!
	<script type="text/javascript" src="js.js"></script>
	<script>ver(\'proveedores.php\',\'main\');</script>');
	}
	else
	{
		echo('ERROR:'.mysql_error());
	}
	break;
	case(""):
	
	
	//////////// OTRAS ACCIONES
		if($_GET["del"]==1){
		
		$sql_del="DELETE FROM proveedores WHERE id_proveedor= '".$_GET["id"]."'";
		$query_del = mysql_query($sql_del, $conexion);
		if ($sql_del){
			echo('Eliminado correctamente');
		}
		else
		{
			echo('ERROR ELIMINANDO');
		}
	}
	
	/////////////////////////////
	
	if($_GET["u"]==1){
	
		if($_POST["u"]==1){
		//SQL
		echo('UPDATE PROVEEDOR ID:'.$_POST["id"]);
				
				$sql="UPDATE proveedores SET
			rut='".$_POST["rut"]."',
			razon='".$_POST["razon"]."',
			giro='".$_POST["giro"]."',
			direccion='".$_POST["direccion"]."',
			fono='".$_POST["fono"]."',
			mail='".$_POST["mail"]."',
			comercial_nombre='".$_POST["comercial_nombre"]."',
			comercial_mail='".$_POST["comercial_mail"]."',
			comercial_fono='".$_POST["comercial_fono"]."',
			pago_nombre='".$_POST["pago_nombre"]."',
			pago_mail='".$_POST["pago_mail"]."',
			pago_fono='".$_POST["pago_fono"]."'
			
			WHERE

			id_proveedor='".$_POST["id_proveedor"]."'";
			$query = mysql_query($sql, $conexion);
			if($sql){
				echo('<p>
				'.$sql.'
				<br>
				<hr>
				UPDATE '.$_POST["id"].' ('.$_POST["razon"].')  '.mysql_error().'</p>
				<script type="text/javascript" src="js.js"></script>
				<script>ver(\'proveedores.php\',\'main\');</script>
				');
				exit;
			}else{
				echo('<h1>FULL UPDATE ERROR'.mysql_error().'</h1>');
				exit;
			}
			
		
		exit;
		}
		// select proveedor
		$sql_c="SELECT * FROM proveedores WHERE id_proveedor='".$_GET["id"]."'";
		
		$query_c = mysql_query($sql_c, $conexion);


		$c=mysql_fetch_array($query_c);

		echo('
				<form id="update" action="proveedores.php?u=1" method="post" target="consola" /> 
			<table>
			 <tr>
			  <th>
			   <label for="rut">Rut</label>
			  </th>
			  <th>
			   <input name="rut" type="text" value="'.$c["rut"].'"/>
			  </th>
			  <th>
				<label for="razon">Razon</label>
			  </th>
			  <th>
				<input name="razon" type="text" value="'.$c["razon"].'"/>
			  </th>
			  <th>
			   <label for="giro">Giro</label>
			  </th>
			  <th>
			   <input name="giro" type="text" value="'.$c["giro"].'"/>
			  </th>
			 </tr> 
			 <tr>
			  <th>
				<label for="direccion">Direccion</label></th><th>
				<input name="direccion" type="text" value="'.$c["direccion"].'"/>
				</th>
			  <th>
			   <label for="fono">Fono</label></th><th>
			   <input name="fono" type="text" value="'.$c["fono"].'"/>
			  </th>
			   <th><label for="mail">Mail</label></th><th>
			   <input name="mail" type="text" value="'.$c["mail"].'"/>
			   </th>
			 </tr>
			 <tr>
			  <th>
			   <label for="comercial_nombre">Contacto Comercial</label>
			  </th>
			  <th>
			   <input name="comercial_nombre" type="text" value="'.$c["comercial_nombre"].'"/>
			  </th>
			  <th>
			   <label for="comercial_mail">Mail Comercial</label>
			  </th>
			  <th>
			   <input name="comercial_mail" type="text" value="'.$c["comercial_mail"].'"/>
			  </th>
			  <th>
			   <label for="comercial_fono">Fono Comercial</label>
			  </th>
			  <th>
			   <input name="comercial_fono" type="text" value="'.$c["comercial_fono"].'"/>
			  </th> 
			 </tr>
			 
			 <tr>
				<th>
				 <label for="pago_nombre">Contacto Pago</label>
				</th>
				<th>
				 <input name="pago_nombre" type="text" value="'.$c["pago_nombre"].'"/>
				</th>
				<th>
				 <label for="pago_mail">Mail Pago</label>
				</th>
				<th>
				 <input name="pago_mail" type="text" value="'.$c["pago_mail"].'"/>
				</th>
				<th>
				 <label for="pago_fono">Fono Pago</label>
				</th>
				<th>
				 <input name="pago_fono" type="text" value="'.$c["pago_fono"].'"/>
				</th> 

			 </tr>
			 <tr>
			  <td colspan="6">
			  <input name="id_proveedor" type="hidden" value="'.$c["id_proveedor"].'"/>
			   <input type="hidden" name="u" value="1"/>
			   <input type="submit" value="Guardar Cambios"/></td>
			 </tr>
			</table>
			<input type="button" value="Cancelar Edicion" onclick="ver(\'null.php\',\'update\');"/>
			</form>

	');
	}
	
	if($_GET["u"]!=1&&$_POST["u"]!=1){
		echo('<h1>Proveedores</h1>');
	}		
		echo('
		
		<script type="text/javascript" src="js.js"></script>

		<input type="button" value="Nuevo Proveedor" onclick="document.getElementById(\'add\').style.display=\'block\';"/>
		<form id="add" action="proveedores.php" method="post" target="consola" style="display:none;"/> 
		<table>
		 <tr>
		  <th>
		   <label for="rut">Rut</label>
		  </th>
		  <th>
		   <input name="rut" type="text" value="RUT"/>
		  </th>
		  <th>
			<label for="razon">Razon</label>
		  </th>
		  <th>
			<input name="razon" type="text" value="Razon Social"/>
		  </th>
		  <th>
		   <label for="giro">Giro</label>
		  </th>
		  <th>
		   <input name="giro" type="text" value="Giro"/>
		  </th>
		 </tr> 
		 <tr>
		  <th>
			<label for="direccion">Direccion</label></th><th>
			<input name="direccion" type="text" value="Direccion"/>
			</th>
		  <th>
		   <label for="fono">Fono</label></th><th>
		   <input name="fono" type="text" value="Fono"/>
		  </th>
		   <th><label for="mail">Mail</label></th><th><input name="mail" type="text" value="ejemplo@mail.com"/></th>
		 </tr>
		 <tr>
		  <th>
		   <label for="comercial_nombre">Contacto Comercial</label>
		  </th>
		  <th>
		   <input name="comercial_nombre" type="text" value="Contacto Comercial"/>
		  </th>
		  <th>
		   <label for="comercial_mail">Mail Comercial</label>
		  </th>
		  <th>
		   <input name="comercial_mail" type="text" value="Mail Comercial"/>
		  </th>
		  <th>
		   <label for="comercial_fono">Fono Comercial</label>
		  </th>
		  <th>
		   <input name="comercial_fono" type="text" value="Fono Comercial"/>
		  </th> 
		 </tr>
		 
		 <tr>
			<th>
			 <label for="pago_nombre">Contacto Pago</label>
			</th>
			<th>
			 <input name="pago_nombre" type="text" value="Contacto Pago"/>
			</th>
			<th>
			 <label for="pago_mail">Mail Pago</label>
			</th>
			<th>
			 <input name="pago_mail" type="text" value="Mail Pago"/>
			</th>
			<th>
			 <label for="pago_fono">Fono Pago</label>
			</th>
			<th>
			 <input name="pago_fono" type="text" value="Fono Pago"/>
			</th> 

		 </tr>
		 <tr>
		  <td colspan="6">
		   <input type="hidden" name="add" value="1"/>
		   <input type="submit" value="Agregar Proveedor"/></td>
		 </tr>
		</table>
		<input type="button" value="Ocultar Formulario" onclick="document.getElementById(\'add\').style.display=\'none\';"/>
		</form>

		<hr>
		<div id="update_proveedor" ></div>
		');


		////////////////////////////////////////////////////////////////////
		/// LIST
		if($_GET["u"]!=1&&$_POST["u"]!=1){

		$sql_c="SELECT * FROM proveedores";
		$query_c = mysql_query($sql_c, $conexion);
		echo('

		<table>
		 <tr>
		  <th>
		   <label for="rut">Rut</label>
		  </th>
		  <th>
			<label for="razon">Razon</label>
		  </th>
		  <th>
		   <label for="giro">Giro</label>
		  </th>
		  <th>
			<label for="direccion">Direccion</label>
		  </th>
		  <th>
		   <label for="fono">Fono</label>
		  </th>
		  <th>
		   <label for="mail">Mail</label>
		  </th>
		  <th>Acciones</th>
		 </tr>
		 
		 
		');
while($c=mysql_fetch_array($query_c)){
echo('
 
 
 <tr id="tr_'.$c["id_proveedor"].'">
  <td>
   '.$c["rut"].'
  </td> 
  <td>
	'.$c["razon"].'
  </td>
  <td>
   '.$c["giro"].'
  </td>
  <td>
	'.$c["direccion"].'
	</td>
  <td>
   '.$c["fono"].'
  </td>
  <td>
   '.$c["mail"].'
  </td>
  <td>
        <img title="EDITAR" src="img/edit.png" onclick="ver(\'proveedores.php?u=1&id='.$c["id_proveedor"].'\',\'update_proveedor\');">
		<img title="Ver Contactos" src="img/lupa.png" onclick="detalle(\''.$c["id_proveedor"].'\');">
		<img onclick="preguntar(\''.$c["id_proveedor"].'\',\'proveedor\');" title="ELIMINAR" src="img/del.png">
  </th>
   

 </tr>
 
 
 
 <!--  DETALLE -->
 <tr >
 <td colspan="7">
 <div class="detalle" id="cliente_'.$c["id_proveedor"].'">
  <table >
  <th>
   <label for="comercial_nombre">Contacto Comercial</label>
  </th> 
  <th>
   <label for="comercial_mail">Mail Comercial</label>
  </th>
  <th>
   <label for="comercial_fono">Fono Comercial</label>
  </th>
  <th>
   <label for="pago_nombre">Contacto Pago</label>
  </th>
  <th>
   <label for="pago_mail">Mail Pago</label>
  </th>
  <th>
   <label for="pago_fono">Fono Pago</label>
  </th>
 </tr>
 <tr>
 <th>
   '.$c["comercial_nombre"].'
  </th>
  <th>
   '.$c["comercial_mail"].'
  </th>
  <th>
   '.$c["comercial_fono"].'
  </th> 
  <th>
   '.$c["pago_nombre"].'
  </th>
  <th>
   '.$c["pago_mail"].'
  </th>
  <th>
   '.$c["pago_fono"].'
  </th>
 </tr>
 </table>
 <input type="button" value="Ocultar Detalle" onclick="hdetalle(\''.$c["id_proveedor"].'\');"/>
 </div>
 </td>
 </tr>
');
}

echo('
 
</table>

');
		}
break;
}



?>