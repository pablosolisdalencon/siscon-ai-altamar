<?php
include "c.php";
function GetRand($longitud) {
 $key = '';
 $pattern = '1234567890abcdefghijklmnopqrstuvwxyz';
 $max = strlen($pattern)-1;
 for($i=0;$i < $longitud;$i++) $key .= $pattern{mt_rand(0,$max)};
 return $key;
}

echo('<script type="text/javascript" src="js.js?c='.GetRand(20).'"></script>');
$add=$_POST["add"];
switch($add){
	case(1):
	// SQL ADD CLIENTE:
	$sql=mysql_query("INSERT INTO clientes (
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
	pago_fono,
	mensaje_cobro
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
	'".$_POST["pago_fono"]."',
	'".$_POST["mensaje_cobro"]."'
	)
	"
	);
	
	if ($sql){
	echo('
	cliente agregado!
	
	<script>ver(\'clientes.php\',\'main\');</script>');
	}
	else
	{
		echo('ERROR:'.mysql_error());
	}
	break;
	case(""):
	
	
	//////////// OTRAS ACCIONES
		if($_GET["del"]==1){
		
		$sql_del="DELETE FROM clientes WHERE id_cliente= '".$_GET["id"]."'";
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
		echo('<p>
          UPDATED '.$_POST["id"].' ('.$_POST["razon"].')  '.mysql_error().'</p>');
		  
				$sql="UPDATE clientes SET
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
			pago_fono='".$_POST["pago_fono"]."',
			mensaje_cobro='".$_POST["mensaje_cobro"]."'
			
			WHERE

			id_cliente='".$_POST["id_cliente"]."'";
			$query = mysql_query($sql, $conexion);
			if($sql){
        if($_GET["f"]=='0'){
            echo('<script>f_EditCliente(0,1);</script>');
        }
        else
        {
          echo('
          <script>ver(\'clientes.php\',\'main\');</script>
          ');
        }
				exit;
			}else{
				echo('<h1>FULL UPDATE ERROR'.mysql_error().'</h1>');
				exit;
			}
			
		
		exit;
		}
		// select cliente
		$sql_c="SELECT * FROM clientes WHERE id_cliente='".$_GET["id"]."'";
		
		$query_c = mysql_query($sql_c, $conexion);


		$c=mysql_fetch_array($query_c);
     if($_GET["f"]=='0'){
          echo('<div id="close-f-console"><i class="fas fa-eye-slash hover-red" onclick="top.document.getElementById(\'f-console\').style.display=\'none\';" title="Ocultar Editor"></i></div>');
        }

		echo ('
				<form id="update" action="clientes.php?u=1&f='.$_GET["f"].'" method="post" target="consola" /> 
			<table>
      <tr>
            <th colspan="6"><i style="font-size:80px;" class="fas fa-user-edit"></i></th>   
          </tr>
			<tr>
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
				<th colspan="6">Mensaje Cobro<br>
				<textarea name="mensaje_cobro" cols="60" rows="5">'.utf8_encode($c["mensaje_cobro"]).'</textarea></th>
			 </tr>
			 <tr>
			  <td colspan="6">
			  <input name="id_cliente" type="hidden" value="'.$c["id_cliente"].'"/>
			   <input type="hidden" name="u" value="1"/>
			   <input type="submit" value="Guardar Cambios"/></td>
			 </tr>
			</table>
      ');
    if($_GET["f"]!="0"){
		echo('
			<input type="button" value="Cancelar Edicion" onclick="ver(\'null.php\',\'update\');"/>
   ');}
      echo('
			</form>

	');
	}else{
			echo('
			<h1>Clientes</h1>

		
		<input type="button" value="Nuevo Cliente" onclick="document.getElementById(\'add\').style.display=\'block\';"/>
		');
		}
	////////////////////////////////////////////////////////////////////
		/////////  FILTRO BUSQUEDA 
		
		if($_GET["f_razon"]==""){$f_razon="";}else{$f_razon=" WHERE razon='".$_GET["f_razon"]."'";}
		echo('
		<label for="f_razon">Buscar Cliente</label></th><th>
		
		<input type="text" id="f_razon" name="f_razon" list="Cliente_List" value="'.$_GET["f_razon"].'" />
			<datalist id="Cliente_List">
		');
		$sql_c="SELECT * FROM clientes";
		$query_c = mysql_query($sql_c, $conexion);
		while($c=mysql_fetch_array($query_c)){
			echo('
				<option value="'.$c["razon"].'">
		');
		}
		echo('
		</datalist>
		
		<img src="img/lupa.png" width="20" onclick="ver(\'clientes.php?f_razon=\'+getElementById(\'f_razon\').value,\'main\')">
		');
		
		
		echo utf8_encode('
		<form id="add" action="clientes.php" method="post" target="consola" style="display:none;"/> 
		
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
				<th colspan="6">Mensaje Cobro<br>
				<textarea name="mensaje_cobro" cols="60" rows="5"></textarea></th>
			 </tr>
		 <tr>
		  <td colspan="6">
		   <input type="hidden" name="add" value="1"/>
		   <input type="submit" value="Agregar Cliente"/></td>
		 </tr>
		</table>
		<input type="button" value="Ocultar Formulario" onclick="document.getElementById(\'add\').style.display=\'none\';"/>
		</form>

		<hr>
		<div id="update_cliente" ></div>
		');


		////////////////////////////////////////////////////////////////////
		/// LIST
		if($_GET["u"]!=1&&$_POST["u"]!=1){

		$sql_c="SELECT * FROM clientes".$f_razon;
		$query_c = mysql_query($sql_c, $conexion);
		echo utf8_encode('

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
 
 
 <tr id="tr_'.$c["id_cliente"].'">
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
        <img title="EDITAR" src="img/edit.png" onclick="ver(\'clientes.php?u=1&id='.$c["id_cliente"].'\',\'update_cliente\');">
		<img title="Ver Contactos" src="img/lupa.png" onclick="detalle(\''.$c["id_cliente"].'\');">
		<img onclick="preguntar(\''.$c["id_cliente"].'\',\'cliente\');" title="ELIMINAR" src="img/del.png">
  </th>
   

 </tr>
 
 
 
 <!--  DETALLE -->
 <tr >
 <td colspan="7">
 <div class="detalle" id="cliente_'.$c["id_cliente"].'">
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
 <input type="button" value="Ocultar Detalle" onclick="hdetalle(\''.$c["id_cliente"].'\');"/>
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