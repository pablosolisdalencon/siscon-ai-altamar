
<?php
include "c.php";
$add=$_POST["add"];
switch($add){
	case(1):

	$monto=$_POST["monto"];
	$iva=$_POST["iva"];
	$total=$_POST["total"];
	switch(true){
		case($_POST["monto"]!=""):
		$iva=$_POST["monto"]*0.19;
		$total=$_POST["monto"]+$iva;
		break;
		case($iva!=""):
		$monto=$_POST["iva"]*5.2;
		$total=$monto+$_POST["iva"];
		break;
		case($total!=""):
		$iva=$_POST["total"]/1.19;
		$monto=$_POST["total"]-$iva;
		break;
	}
	$sql_ver="SELECT * FROM compras WHERE n_oc='".$_POST["n_oc"]."'";
	$query_ver = mysql_query($sql_ver, $conexion);
	$ver=mysql_fetch_array($query_ver);
	if($ver["n_oc"]==""){
		
	
		$sql_rc="SELECT * FROM proveedors WHERE id_proveedor='".$_POST["id_proveedor"]."'";
		$query_rc = mysql_query($sql_rc, $conexion);
		$rc=mysql_fetch_array($query_rc);	
		
		$razon_proveedor=$rc["razon"];
		if($_POST["pagado"]==""){$_POST["pagado"]="NO";}
		// SQL ADD VENTA:
		$sql=mysql_query("INSERT INTO compras (
		n_oc,
		fecha,
		fecha_entrega,
		fecha_pago,
		id_proveedor,
		razon,
		pagado,
		item,
		detalle,
		monto,
		iva,
		total)
		VALUES(
		'".$_POST["n_oc"]."',
		'".$_POST["fecha"]."',
		'".$_POST["fecha_entrega"]."',
		'".$_POST["fecha_pago"]."',
		'".$_POST["id_proveedor"]."',
		'".$razon_proveedor."',
		'".$_POST["pagado"]."',
		'".$_POST["item"]."',
		'".$_POST["detalle"]."',
		'".$monto."',
		'".$iva."',
		'".$total."'
		)
		"
		);
		
		if ($sql){
		echo('
		compra agregada!
		<script type="text/javascript" src="js.js"></script>
		<script>ver(\'compras.php\',\'main\');</script>');
		}
		else
		{
			echo('ERROR:'.mysql_error());
		}
	}else{
			echo('Esa OC ya fue ingresada');
	}
	break;
	case(""):
	
	if($_GET["p"]==1){
		
		switch($_GET["SN"]){
		case("NO"): $SN="SI";
		break;
		case(""): $SN="SI";
		break;
		case("SI"): $SN="NO";
		break;
		}
		
		$sql="UPDATE compras SET pagado='".$SN."' WHERE id_compra='".$_GET["id"]."'";
		$query = mysql_query($sql, $conexion);
		if($sql){
			//echo('<h1> UPDATE '.$_GET["id"].'</h1>');
		}else{
			echo('<h1>ERROR UPDATE</h1>');
		}
	}
	if($_GET["e"]==1){
		
		switch($_GET["SN"]){
		case("NO"): $SN="SI";
		break;
		case(""): $SN="SI";
		break;
		case("SI"): $SN="NO";
		break;
		}
		
		$sql="UPDATE compras SET entregado='".$SN."' WHERE id_compra='".$_GET["id"]."'";
		$query = mysql_query($sql, $conexion);
		if($sql){
		//echo('<h1> UPDATE '.$_GET["id"].'</h1>');
		}else{
			echo('<h1>ERROR UPDATE</h1>');
		}
	}
	
	if($_GET["u"]==1){
	
		
		
		if($_GET["ul"]==1){
		$sql_ver="SELECT * FROM compras WHERE id_compra='".$_GET["id"]."'";
		$query_ver = mysql_query($sql_ver, $conexion);
		$v=mysql_fetch_array($query_ver);
		echo('
		
		<h2>Editar Registro de Compra</h2>
			<form id="update_v" action="compras.php?u=1" method="post" target="consola"/> 
				<table>
				 <tr>
				  <th><label for="n_oc">N° OC</label></th><th><input name="n_oc" type="number" value="'.$v["n_oc"].'"/></th>
			  <th>
				<label for="id_proveedor">Proveedor</label></th><th>
				<select name="id_proveedor">
					<option value="0">Proveedor...</option>
				');
				$sql_c="SELECT * FROM proveedors";
				$query_c = mysql_query($sql_c, $conexion);
				while($c=mysql_fetch_array($query_c)){
				if($v["id_proveedor"]==$c["id_proveedor"]){$Cthis="selected";}else{$Cthis="";}
				echo('
					<option value="'.$c["id_proveedor"].'" '.$Cthis.'>'.$c["razon"].'</option>
				');
				}
				echo('
					</select>
				  </th>
				  <th><label for="monto">Monto</label></th><th><input name="monto" type="number" value="'.$v["monto"].'"/></th>
				 </tr>
				 
				 <tr>
				  <th>
					<label for="fecha">Fecha</label></th><th>
					<input name="fecha" type="date" value="'.$v["fecha"].'"/>
					</th>
					  <th>
					<label for="item">Item</label></th><th>
					<input name="item" type="text" value="'.$v["item"].'"/>
				  </th>
				   <th><label for="iva">IVA</label></th><th><input name="iva" type="number" value="'.$v["iva"].'"/></th>
				 </tr>
				 
				 <tr>
				  <th><label for="fecha_entrega">Fecha Entrega</label></th><th><input name="fecha_entrega" type="date" value="'.$v["fecha_entrega"].'"/></th>
				  <th><label for="detalle">Detalle</label></th><th><input name="detalle" type="text" value="'.$v["detale"].'"/></th>
				  <th><label for="total">Total</label></th><th><input name="total" type="number" value="'.$v["total"].'"/></th> 
				 </tr>
				 
				 <tr>
					<th><label for="fecha_pago">Fecha Pago</label></th><th><input name="fecha_pago" type="date" value="'.$v["fecha_pago"].'"/></th>
					<th><label for="pagado">Pagado</label></th><th><input name="pagado" type="checkbox" value="'.$v["pagado"].'"/></th>
					<th></th><th>
					<input type="hidden" value="'.$v["id_compra"].'" name="id" />
					<input type="submit" value="Guardar Cambios"/>
					</th> 

				 </tr>
				 
				</table>
				<input type="button" value="Cancelar Edicion" onclick="ver(\'null.php\',\'update_view\');"/>
				</form>
				<hr>

		');
		
		exit;
		
		}
		
		
		
		$sql="UPDATE compras SET
		n_oc='".$_POST["n_oc"]."',
		fecha='".$_POST["fecha"]."',
		fecha_entrega='".$_POSTT["fecha_entrega"]."',
		fecha_pago='".$_POST["fecha_pago"]."',
		id_proveedor='".$_POST["id_proveedor"]."',
		razon='".$_POST["razon"]."',
		item='".$_POST["item"]."',
		detalle='".$_POST["detalle"]."',
		monto='".$_POST["monto"]."', iva='".$_POST["iva"]."',
		total='".$_POST["total"]."'

		WHERE

		id_compra=".$_POST["id"];
		$query = mysql_query($sql, $conexion);
		if($sql){
			echo('<p> UPDATE '.$_POST["id"].' ('.$_POST["item"].')  '.mysql_error().'</p>
			<script type="text/javascript" src="js.js"></script>
			<script>ver(\'compras.php\',\'main\');</script>
			');
			exit;
		}else{
			echo('<h1>FULL UPDATE ERROR'.mysql_error().'</h1>');
			exit;
		}
	}
	
	if($_GET["del"]==1){
		
		$sql_del="DELETE FROM compras WHERE id_compra= '".$_GET["id"]."'";
		$query_del = mysql_query($sql_del, $conexion);
		if ($sql_del){
			echo('Eliminado correctamente');
		}
		else
		{
			echo('ERROR ELIMINANDO');
			exit;
		}
	}
	
	
	$fvfd=$_GET["fvfd"];
	$fvfh=$_GET["fvfh"];
	$fvsp=$_GET["fvsp"];
	$fvnp=$_GET["fvnp"];
	if($_GET["fvsp"]=="")
	{
		$fvsp="1";
	}
	if($_GET["fvnp"]=="")
	{
		$fvnp="1";
	}
	
	$fcr=$_GET["fcr"];
	
	/* Filtro CLASS */
	switch($fvfd){
		case(1):$fvfdC=" selected";$fvfd_switch=0;break;
		case(0):$fvfdC="";$fvfd_switch=1;break;
		
	}
		
	switch($fvfh){
		case(1):$fvfhC=" selected";$fvfh_switch=0;break;
		case(0):$fvfhC="";$fvfh_switch=1;break;
	}
	switch($fcr){
		case(''):$fcrC=" selected";$fcr_switch="";break;
		case(''):$fcrC="";break;
	}
	switch($fvsp){
		case(1):$fvspC=" selected";$fvsp_switch=0;break;
		case(0):$fvspC="";$fvsp_switch=1;break;
	}
	switch($fvnp){
		case(1):$fvnpC=" selected";$fvnp_switch=0;break;
		case(0):$fvnpC="";$fvnp_switch=1;break;
	}
	
	
	/* Valor SQL del Filtro  */
	$start=date("y-m-1");
	$stop=date("y-m-31");
	switch(true){
		case($fvfd!="" && $fvfh!=""):
		 $f_sql_F=" WHERE fecha BETWEEN '$fvfd' AND '$fvfh'";
		break;
		case($fvfd!="" && $fvfh==""):
		$f_sql_F=" WHERE fecha BETWEEN '$fvfd' AND '$fvfd'";
		break;
		case($fvfd=="" && $fvfh!=""):
		$f_sql_F=" WHERE fecha BETWEEN '$fvfh' AND '$fvfh'";
		break;
		case($fvfd=="" && $fvfh==""):
		$f_sql_F=" WHERE fecha BETWEEN '$start' AND '$stop'";
		break;

		
	}
	
	switch(true){
		case($fcr!=""):$fcr_sql=" AND razon LIKE \"%$fcr%\"";break;
		case($fcr==""):$fcr_sql="";break;
	}
	
	
	

	$FILTRO_SQL=$f_sql_F.$fcr_sql;

	
	
	/* DEBUG
echo('<h2>('.$fvfd.'-'.$fvfh.')'.$f_sql_F.'|'.$fcr_sql.'|'.$f_sql_P.'('.$fvnp.'-'.$fvsp.'-'.$fvt.')</h2>');	
echo("<h2>SELECT *, TO_DAYS( fecha_entrega) - TO_DAYS('".$fecha_actual."') AS dias, TO_DAYS( fecha_pago) - TO_DAYS('".$fecha_actual."') AS dias_pago FROM compras ".$FILTRO_SQL." ORDER BY fecha DESC</h2>");
*/
	
	
echo('
<h1>Compras</h1>
<script type="text/javascript" src="js.js"></script>

<input type="button" value="Nueva Compra" onclick="document.getElementById(\'add_compra\').style.display=\'block\';"/>





Desde <input type="date" name="fvfd" id="fvfd" value="'.$fvfd.'" onchange="filtrar(\'fvfd\',this.value)"/> 
Hasta <input type="date" name="fvfh" id="fvfh" value="'.$fvfh.'" onchange="filtrar(\'fvfh\',this.value)"/> 


Proveedor <input type="text" name="fcr" id="fcr" value="'.$fcr.'" onchange="filtrar(\'fcr\',this.value)"/>





<!-- filtros por esto -->



<img title="PAGADO: '.$pagado.'" Class="SI'.$fvspC.'" onclick="filtrar(\'fvsp\',\''.$fvsp_switch.'\')" width="25" heigth="25" src="img/pago.png"  />
<img title="PAGADO: '.$pagado.'" Class="NO'.$fvnpC.'" onclick="filtrar(\'fvnp\',\''.$fvnp_switch.'\')" width="25" heigth="25" src="img/pago.png"  />

<input type="hidden" name="fvsp" id="fvsp" value="'.$fvsp.'" /> 
<input type="hidden" name="fvnp" id="fvnp" value="'.$fvnp.'" /> 




<!-- filtros por estado -->





<form id="add_compra" action="compras.php" method="post" target="consola" style="display:none;"/> 
<table>
 <tr>
  <th><label for="n_oc">N° OC</label></th><th><input name="n_oc" type="number" value="N° OC"/></th>
  <th>
    <label for="id_proveedor">Proveedor</label></th><th>
	<select name="id_proveedor">
		<option value="0">Proveedor...</option>
	');
	$sql_c="SELECT * FROM proveedores";
	$query_c = mysql_query($sql_c, $conexion);
	while($c=mysql_fetch_array($query_c)){
	echo('
		<option value="'.$c["id_proveedor"].'">'.$c["razon"].'</option>
	');
	}
	echo('
	</select>
  </th>
  <th><label for="monto">Monto</label></th><th><input name="monto" type="number" value="Monto"/></th>
 </tr>
 
 <tr>
  <th>
	<label for="fecha">Fecha</label></th><th>
	<input name="fecha" type="date" value="fecha"/>
	</th>
	  <th>
	<label for="item">Item</label></th><th>
	<input name="item" type="text" value="Item"/>
  </th>
   <th><label for="iva">IVA</label></th><th><input name="iva" type="number" value="IVA"/></th>
 </tr>
 
 <tr>
  <th><label for="fecha_entrega">Fecha Entrega</label></th><th><input name="fecha_entrega" type="date" value="Fecha Entrega"/></th>
  <th><label for="detalle">Detalle</label></th><th><input name="detalle" type="text" value="Detalle"/></th>
  <th><label for="total">Total</label></th><th><input name="total" type="number" value="Total"/></th> 
 </tr>
 
 <tr>
    <th><label for="fecha_pago">Fecha Pago</label></th><th><input name="fecha_pago" type="date" value="Fecha Pago"/></th>
    <th><label for="pagado">Pagado</label></th><th><input name="pagado" type="checkbox" value="SI"/></th>
    <th></th><th>
	<input type="hidden" value="1" name="add"/>
	<input type="submit" value="Ingresar Compra"/>
	</th> 

 </tr>
 
</table>
<input type="button" value="Ocultar Formulario" onclick="document.getElementById(\'add_compra\').style.display=\'none\';"/>
</form>

<hr>
<div id="update_view"></div>
<table>
 <tr>
  <th width="75">fecha</th>
  <th>N° OC</th>
  <th>Proveedor</th>
  <th>Item</th>
  <th>Detalle</th>
  <th>Monto $</th>
  <th>IVA $</th>
  <th>Total $</th>
  
  <th>Pagado</th>
  <th width="75">Fecha Entrega</th>
  <th>Dias Para la entrega</th>
  <th>Entregado</th>
  <th width="75">Fecha de pago</th>
  <th>Dias Vencidos</th>
  <th width="140">Accion</th>
</tr>
');
$fecha_actual=date("y:m:d");
$sql_v="SELECT *, TO_DAYS( fecha_entrega) - TO_DAYS('".$fecha_actual."') AS dias, TO_DAYS( fecha_pago) - TO_DAYS('".$fecha_actual."') AS dias_pago FROM compras ".$FILTRO_SQL." ORDER BY fecha DESC";
$query_v = mysql_query($sql_v, $conexion);
while($v=mysql_fetch_array($query_v)){
	$sql_c="SELECT * FROM proveedores WHERE id_proveedor='".$v["id_proveedor"]."'";
	$query_c = mysql_query($sql_c, $conexion);
	$c=mysql_fetch_array($query_c);

	$color_entrega="#ccc";
	
	switch(true){
		case($v["dias"]<=2): $color_entrega="red";	break;
		case($v["dias"]<=5): $color_entrega="orange"; break;
		case($v["dias"]<=10): $color_entrega="green"; break;
		break;
	}
	$color_pago="green";
	switch(true){
		case($v["dias_pago"]>=1): $color_pago="yellow";	
		case($v["dias_pago"]>=5): $color_pago="orange";
		case($v["dias_pago"]>=10): $color_pago="red";
		break;
	}

	$pagado_check="";
	
	
	
	// FILTRO POR AUTORIZACION
	$pass=1;
	if($v["pagado"]=="SI"){
		if($fvsp==1){$pass=1;}else{$pass=0;}
	}else{
		
		if($v["pagado"]=="NO"){
			if($fvnp==1){$pass=1;}else{$pass=0;}
		}else{}
		
	}
	
/*	
if($fvnp==1&&$v["pagado"]=="NO"){$pass=1;}
if($fvnp==0&&$v["pagado"]=="NO"){$pass=0;}
if($fvsp==1&&$v["pagado"]=="SI"){$pass=1;}
if($fvsp==0&&$v["pagado"]=="NO"){$pass=0;}
*/
if($pass==1){

echo('
 <tr>
  <td>'.$v["fecha"].'</td>
	 <td>'.$v["n_oc"].'</td>
	 <td>'.$c["razon"].'</td>
	 <td>'.$v["item"].'</td>
	 <td>'.$v["detalle"].'</td>
	 <td>$'.$v["monto"].'</td>
	 <td>$'.$v["iva"].'</td>
	 <td>$'.$v["total"].'</td>
	 <td>'.$v["pagado"].'</td>
     <td>'.$v["fecha_entrega"].'</td>
	 <td style="color:'.$color_entrega.';">'.$v["dias"].'</td>
	 <td>'.$v["entregado"].'</td>
	 <td>'.$v["fecha_pago"].'</td>
	 <td style="color:'.$color_pago.';">'.$v["dias_pago"].'</td>
	 <td>
		<img title="PAGADO: '.$v["pagado"].'"
		onclick="ver(\'compras.php?p=1&SN='.$v["pagado"].'&id='.$v["id_compra"].'\',\'main\');"
		class="'.$v["pagado"].'" src="img/pago.png">
		<img title="ENTREGADO: '.$v["entregado"].'" onclick="ver(\'compras.php?e=1&SN='.$v["entregado"].'&id='.$v["id_compra"].'\',\'main\');" class="'.$v["entregado"].'" src="img/entrega.png">
		<img onclick="update(\''.$v["id_compra"].'\');" title="EDITAR" src="img/edit.png">
		<img onclick="preguntar(\''.$v["id_compra"].'\',\'compra\');" title="ELIMINAR" src="img/del.png">
	 </td>
	 </tr>
');

		//FECHAS
		$entrega_count="";
		
		$dias_vencidos="";
		
		
		// CONTADORES SIMPLES
		$ocs_count=$ocs_count+1;
		if($v["pagado"]=="SI"){$pagados_count=$pagados_count+1;}
		if($dias_vencidos<=1){$vencidos_count=$vencidos_count+1;}
		
		
		
		// TOTALES
		$total_monto=$total_monto+$v["monto"];
		$total_iva=$total_iva+$v["iva"];
		$total_total=$total_total+$v["total"];
		
}//CIERRA PASS

}
echo('
 <tr style="background:#fff;">
	 <td>Compras:'.$ocs_count.'</td>
	 <td></td>
	 <td></td>
	 <td></td>
  	 <td><strong>Totales : </strong></td>
	 <td><strong>$'.$total_monto.'</strong></td>
	 <td><strong>$'.$total_iva.'</strong></td>
	 <td><strong>$'.$total_total.'</strong></td>
	 <td></td>
	 <td></td>
	 <td></td>
	 <td></td>
	 <td></td>
	 <td></td>
	 <td></td>
 </tr>
 </table>
 <hr>
 <table>
 <tr>
  <th>OCs </th>
	 <th>'.$ocs_count.'</th>
	 <td></td>
	 <td></td>
	 <th></th>
	 <th></th>
	 <th></th>
	 <th></th>
	 <th></th>
     <td></td>
	 <th></th>
	 <td></td>
	 <th>'.$vencidos_count.'</th>
	 <td>
	  
	 </td>
	 </tr>
</table>

<hr>
');
break;
}
?>