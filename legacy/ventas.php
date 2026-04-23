<?php
include "c.php";
function GetRand($longitud) {
 $key = '';
 $pattern = '1234567890abcdefghijklmnopqrstuvwxyz';
 $max = strlen($pattern)-1;
 for($i=0;$i < $longitud;$i++) $key .= $pattern{mt_rand(0,$max)};
 return $key;
}

$sql_cant_ventas="SELECT * FROM registros_ventas WHERE id=0";
$query_cant_ventas = mysql_query($sql_cant_ventas, $conexion);		
$cant_ventas=mysql_fetch_array($query_cant_ventas);
$CANTIDAD_VENTAS=$cant_ventas["cantidad"];

echo('<script type="text/javascript" src="js.js?c='.GetRand(20).'"></script>');


		////////////////////////////
		////////////////////////////
		// ESTADO UPDATER
		////////////////////////////
		////////////////////////////
		$ESTADO=$_GET["ue"];
		if($_GET["ue"]!=""){
			$sql="UPDATE ventas SET estado='".$ESTADO."' WHERE id_venta='".$_GET["id"]."'";
			$query = mysql_query($sql, $conexion);
			if($sql){
				echo('UPDATE ESTADO OK. NOW IS '.$ESTADO);
			}
		}
		// ESTADO UPDATER *
		////////////////////////////


$add=$_POST["add"];
switch($add){
	case(1):
	////////////////////////////
	////////////////////////////
	// ADD  VENTA
	////////////////////////////

	$monto=$_POST["monto"];
	$iva=$_POST["iva"];
	$total=$_POST["total"];
	
	
				////////////////////////////
				////////////////////////////
				///  UPLOADS
				
					
					$ar_f_factura=$_FILES['f_factura']['name'];

					$at_f_factura=$_FILES['f_factura']['type'];

					$as_f_factura=$_FILES['f_factura']['size'];

					//////////////////// REPLACER 1
					$a_f_factura=$_POST["fecha"].'-FAC'.$_POST["n_factura"].'.'.end(explode(".",$ar_f_factura));
					
	/*DEBUG	echo('<script>alert("ar_f_oc:'.$ar_f_oc=$_FILES['f_oc']['name'].'");</script>');*/
					
					$ar_f_oc=$_FILES['f_oc']['name'];

					$at_f_oc=$_FILES['f_oc']['type'];

					$as_f_oc=$_FILES['f_oc']['size'];

					//////////////////// REPLACER 1
					$a_f_oc=$_POST["fecha"].'-OC'.$_POST["n_oc"].'.'.end(explode(".",$ar_f_oc));
					

					//////////////////// REPLACER 1
					
					$ar_f_cot=$_FILES['f_cot']['name'];

					$at_f_cot=$_FILES['f_cot']['type'];

					$as_f_cot=$_FILES['f_cot']['size'];

					//////////////////// REPLACER 1
					$a_f_cot=$_POST["fecha"].'-COT'.$_POST["n_cot"].'.'.end(explode(".",$ar_f_cot));
    
    
		
		if($_POST["pagado"]==""){$_POST["pagado"]="NO";}
		
		///CLIENTE
			$sql_cli="SELECT * FROM clientes WHERE razon LIKE '%".$_POST["id_cliente"]."%'";
			$query_cli = mysql_query($sql_cli, $conexion);
			$cli=mysql_fetch_array($query_cli);
			$cliente=$cli["id_cliente"];
		
		////////////////////////////
		////////////////////////////
		// SQL ADD VENTA:
		$sql=mysql_query("INSERT INTO ventas (
		n_factura,
		n_cot,
		n_oc,
		f_factura,
		f_cot,
		f_oc,
		fecha,
		fecha_entrega,
		fecha_pago,
		id_cliente,
		pagado,
		item,
		detalle,
		monto,
		iva,
		total)
		VALUES(
		'".$_POST["n_factura"]."',
		'".$_POST["n_cot"]."',
		'".$_POST["n_oc"]."',
		'".$a_f_factura."',
		'".$a_f_cot."',
		'".$a_f_oc."',
		'".$_POST["fecha"]."',
		'".$_POST["fecha_entrega"]."',
		'".$_POST["fecha_pago"]."',
		'".$cliente."',
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
			
			
				///////////////////////////////////
				///////////////////////////////////
				///////////////////////////
				

					///////////////// TAMAÑO Y EXTENCION //////////////////////////////

					$allowedExtensions = array("swf","flv","jpg","jpeg","gif","png","doc","docx","xls","xlsx","pdf","txt"); 
					  foreach ($_FILES as $file) { 
						if ($file['tmp_name'] > '') { 
						  if (!in_array(end(explode(".", 
								strtolower($file['name']))), 
								$allowedExtensions)) { 
						   die('El Archivo: <strong>'.$file['name'].'</strong> ha sido rechazado. <script>alert("Solo se permiten los siguientes tipos de archivos: *.gif, *.jpg, *.png, *.pdf, *.swf, *.flv, *.doc, *.docx, *.xls, *.xlsx, *.pdf, *.txt);</script>'); 
						  } 
						} 
					  } 

					if($as_f_cot>=50000000){echo('<script>alert("COT Tamaño maximo de archivos: (40 Mb)");</script>');}else{}
					if($as_f_factura>=50000000){echo('<script>alert("FACTURA Tamaño maximo de archivos: (40 Mb)");</script>');}else{}
					if($as_f_oc>=50000000){echo('<script>alert("OC Tamaño maximo de archivos: (40 Mb)");</script>');}else{}
					///////////////// TAMAÑO Y EXTENCION ///////////////////////////////////////////////////////////////////////////////////////>

					
		
								/////////////////////////////////////////////
								/////////////////////////////////////////////
								/// MOVIMIENTO DE LOS ARCHIVOS
								$origen_f_oc = $_FILES['f_oc']['tmp_name'];
								 $destino_f_oc = 'docs/ORDENES-DE-COMPRA/'.$a_f_oc;
								 move_uploaded_file($origen_f_oc, $destino_f_oc);
								$origen_f_cot = $_FILES['f_cot']['tmp_name'];
								 $destino_f_cot = 'docs/COTIZACIONES/'.$a_f_cot;
								 move_uploaded_file($origen_f_cot, $destino_f_cot);
								 $origen_f_factura =$_FILES['f_factura']['tmp_name'];
								 $destino_f_factura = 'docs/FACTURAS/'.$a_f_factura;
								 move_uploaded_file($origen_f_factura, $destino_f_factura);
								 ///* MOVIMIENTO DE LOS ARCHIVOS
								 
								 

		
					echo('
					
					
					venta agregada!
					
					
					<br>
					 FACTURA : <a href="'.$destino_f_factura.'">'.$destino_f_factura.'</a>
					 <br>
					 
					 COT : <a href="'.$destino_f_cot.'">'.$destino_f_cot.'</a>
					  <br>
					  
					 OC : <a href="'.$destino_f_oc.'">'.$destino_f_oc.'</a>
					<script>ver(\'ventas.php\',\'main\');</script>');
		}
		else
		{
					echo('ERROR:'.mysql_error());
		}
	/*
	}else{
			echo('Esa Factura ya fue ingresada');
	}
	*/
	break;
	case(""):
	
	
	
	//////////////////////////////////////////
	//////////////////////////////////////////
	//////////////////////////////////////////
	// NO ES ADD
	
	
	if($_GET["p"]==1){
		
		switch($_GET["SN"]){
		case("NO"): $SN="SI";
		break;
		case(""): $SN="SI";
		break;
		case("SI"): $SN="NO";
		break;
		}
		
		$sql="UPDATE ventas SET pagado='".$SN."' WHERE id_venta='".$_GET["id"]."'";
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
		
		
		

		
		$sql="UPDATE ventas SET entregado='".$SN."' WHERE id_venta='".$_GET["id"]."'";
		$query = mysql_query($sql, $conexion);
		if($sql){
		//echo('<h1> UPDATE '.$_GET["id"].'</h1>');
		
				
		
		}else{
			echo('<h1>ERROR UPDATE</h1>');
		}
	}
	
	if($_GET["u"]==1){
	
		
		
		if($_GET["ul"]==1){
		$sql_ver="SELECT * FROM ventas WHERE id_venta='".$_GET["id"]."'";
		$query_ver = mysql_query($sql_ver, $conexion);
		$v=mysql_fetch_array($query_ver);
		
		
		
		$sql_c="SELECT * FROM clientes WHERE id_cliente='".$v["id_cliente"]."'";
		$query_c = mysql_query($sql_c, $conexion);
		$c=mysql_fetch_array($query_c);
		
		
		
		
		
		
		    if($_GET["f"]=='0'){
          echo('<div id="close-f-console"><i class="fas fa-eye-slash hover-red" onclick="top.document.getElementById(\'f-console\').style.display=\'none\';" title="Ocultar Editor"></i></div>');
        }

		echo('
			<form id="update_v" action="ventas.php?u=1&f='.$_GET["f"].'" enctype="multipart/form-data" method="post" target="consola"/> 
      <table>
				  <tr>
            <th colspan="6" ><i style="font-size:80px;" class="fas fa-edit"></i></th>   
          </tr>
		  <tr>
            <th colspan="6" style="color:#58ACFA;font-size:18px;">
			'.$c["razon"].' - '.$c["rut"].'</th>   
          </tr>
				 <tr>
         <th>
            <label for="n_factura">Factura</label></th><th>
					  <!--i class="fas fa-file-invoice-dollar"></i-->
            <input style="width:100px" name="f_factura" type="file" value=""/>
					  </th>
				   <th><label for="n_cot">Cotizacion</label></th><th>
				    <!--i class="fas fa-file-invoice"></i-->
            <input style="width:100px" name="f_cot" type="file" value=""/>
				   </th>
					 <th><label for="n_oc">Orden de Compra</label></th><th>
					  <!--i class="fas fa-clipboard-check"></i-->
            <input style="width:100px" name="f_oc" type="file" value="'.$v["f_oc"].'"/>
					 </th>
					  
				  </tr>
				 <tr>
				  <th><label for="n_factura">N° Factura</label></th><th><input name="n_factura" type="number" value="'.$v["n_factura"].'"/></th>
				  <th><label for="n_cot">N° Cotización</label></th><th><input name="n_cot" type="number" value="'.$v["n_cot"].'"/></th>
				  <th><label for="n_oc">N° Orden de Compra</label></th><th><input name="n_oc" type="number" value="'.$v["n_oc"].'"/></th>
				  
			</tr>
			
				 
			<tr>
				 <th>
				  <label for="id_cliente">Cliente</label></th>
         <th >
				  <select name="id_cliente" style="width:200px">
					  <option value="0">Cliente...</option>
              ');
              $sql_c="SELECT * FROM clientes ORDER BY razon ASC";
              $query_c = mysql_query($sql_c, $conexion);
              while($c=mysql_fetch_array($query_c)){
              if($v["id_cliente"]==$c["id_cliente"]){$Cthis="selected";}else{$Cthis="";}
              echo('
                <option value="'.$c["id_cliente"].'" '.$Cthis.'>'.utf8_encode($c["razon"]).'</option>
              ');
              }
            $pagado_no="";
            $pagado_ok="";
            if($v["pagado"]=="SI"){$pagado_ok=" checked";}else{$pagado_no=" checked";}

				echo('
					</select>
				 </th>
				 <th>
					<label for="item">Item</label></th>
				<th>
					<input name="item" type="text" value="'.$v["item"].'"/>
				 <th><label for="detalle">Detalle</label></th><th><textarea name="detalle">'.$v["detalle"].'</textarea>
				</th>
			</tr>
			<tr>
					
				  <th><label for="monto">Monto</label></th><th>
				  
				  <input id="monto'.$v["id_venta"].'" name="monto" type="number" value="'.$v["monto"].'"/>
					<img onclick="calcular(\''.$v["id_venta"].'\');" src="img/calc.png" style="width:30px;vertical-align: middle;cursor:pointer;" title="CALCULAR" />
				  
				  </th>
                  <th><label for="iva">IVA</label></th><th><input id="iva'.$v["id_venta"].'" name="iva" type="number" value="'.$v["iva"].'"/></th>
				  <th><label for="total">Total</label></th><th><input id="total'.$v["id_venta"].'" name="total" type="number" value="'.$v["total"].'"/></th>		
			</tr>
			<tr>
					<th>
						<label for="fecha">Fecha</label>
					</th>
					<th>
						<input name="fecha" type="date" value="'.$v["fecha"].'"/>
					</th>
					<th>
						<label for="fecha_pago">Fecha Pago</label>
					</th>
					<th>
						<input name="fecha_pago" type="date" value="'.$v["fecha_pago"].'"/>
					</th>
				
					 <th>
						<label for="fecha_entrega">Fecha Entrega</label>
					</th>
					<th>
						<input name="fecha_entrega" type="date" value="'.$v["fecha_entrega"].'"/>
					 </th>
				  </th>
				 
					
			 </tr>
		
			 <tr>
					<th><label for="pagado">Pagado: </label></th><th>SI<input name="pagado" type="radio" value="SI" '.$pagado_ok.'/> NO<input name="pagado" type="radio" value="NO" '.$pagado_no.'/></th>
					
					<th></th>
          

					<th>
					<input type="hidden" value="'.$v["id_venta"].'" name="id" />
					<input type="submit" value="Guardar Cambios"/>
					</th> 
					<th></th>
					<th></th>
				 </tr>
				 
				</table>
        ');
      if($_GET["f"]!="0"){
        echo('
				<input type="button" value="Cancelar Edicion" onclick="ver(\'null.php\',\'update_view\');"/>
        ');
      }
        echo('
				</form>
				<hr>

		');
		
		exit;
		
		}
		
		////////////////////////////
				////////////////////////////
				///  UPLOADS
				
					/*DEBUG
					if($_FILES['f_factura']['name']==""){
						echo('
						<script>
						alert("$ar_f_factura:'.$ar_f_factura.'");
						alert("$ar_f_oc:'.$ar_f_oc.'");
						alert("$ar_f_cot:'.$ar_f_cot.'");
						</script>
						');
					}
					DEBUG*/
					
					
					$ar_f_factura=$_FILES['f_factura']['name'];

					$at_f_factura=$_FILES['f_factura']['type'];

					$as_f_factura=$_FILES['f_factura']['size'];

					//////////////////// REPLACER 1
					$a_f_factura=$_POST["fecha"].'-FAC'.$_POST["n_factura"].'.'.end(explode(".",$ar_f_factura));
					
	/*DEBUG	echo('<script>alert("ar_f_oc:'.$ar_f_oc=$_FILES['f_oc']['name'].'");</script>');*/
					
					$ar_f_oc=$_FILES['f_oc']['name'];

					$at_f_oc=$_FILES['f_oc']['type'];

					$as_f_oc=$_FILES['f_oc']['size'];

					//////////////////// REPLACER 1
					$a_f_oc=$_POST["fecha"].'-OC'.$_POST["n_oc"].'.'.end(explode(".",$ar_f_oc));
					
 
					//////////////////// REPLACER 1
					
					$ar_f_cot=$_FILES['f_cot']['name'];

					$at_f_cot=$_FILES['f_cot']['type'];

					$as_f_cot=$_FILES['f_cot']['size'];

					//////////////////// REPLACER 1
					$a_f_cot=$_POST["fecha"].'-COT'.$_POST["n_cot"].'.'.end(explode(".",$ar_f_cot));
			
			///////////////// TAMAÑO Y EXTENCION //////////////////////////////

					$allowedExtensions = array("swf","flv","jpg","jpeg","gif","png","doc","docx","xls","xlsx","pdf","txt"); 
					  foreach ($_FILES as $file) { 
						if ($file['tmp_name'] > '') { 
						  if (!in_array(end(explode(".", 
								strtolower($file['name']))), 
								$allowedExtensions)) { 
						   die('El Archivo: <strong>'.$file['name'].'</strong> ha sido rechazado. <script>alert("Solo se permiten los siguientes tipos de archivos: *.gif, *.jpg, *.png, *.pdf, *.swf, *.flv, *.doc, *.docx, *.xls, *.xlsx, *.pdf, *.txt);</script>'); 
						  } 
						} 
					  } 

					if($as_f_cot>=50000000){echo('<script>alert("COT Tamaño maximo de archivos: (40 Mb)");</script>');}else{}
					if($as_f_factura>=50000000){echo('<script>alert("FACTURA Tamaño maximo de archivos: (40 Mb)");</script>');}else{}
					if($as_f_oc>=50000000){echo('<script>alert("OC Tamaño maximo de archivos: (40 Mb)");</script>');}else{}
					///////////////// TAMAÑO Y EXTENCION ///////////////////////////////////////////////////////////////////////////////////////>

					
		$sql_fver="SELECT * FROM ventas WHERE id_venta='".$_POST["id"]."'";
		$query_fver = mysql_query($sql_fver, $conexion);
		$fv=mysql_fetch_array($query_fver);
		
		//echo('<script>alert("'.$a_f_factura.'-'.$a_f_cot.'-'.$a_f_oc.'");</script>');
		
		if($at_f_cot==""){
			$a_f_cot=$fv["f_cot"];
			/*echo('
				<script>alert("at_f_cot:'.$at_f_cot.'-a_f_cot:'.$a_f_cot.'-v:'.$fv["f_cot"].'");</script>
			');*/
		}
		if($at_f_oc==""){
			$a_f_oc=$fv["f_oc"];
			/*echo('
				<script>alert("at_f_oc:'.$at_f_oc.'-a_f_oc:'.$a_f_oc.'-v:'.$fv["f_oc"].'");</script>
			');*/
			}
		if($at_f_factura==""){
			$a_f_factura=$fv["f_factura"];
			/*echo('
				<script>alert("at_f_factura:'.$at_f_factura.'-a_f_factura:'.$a_f_factura.'-v:'.$fv["f_factura"].'");</script>
			');*/
			}
		
		$sql="UPDATE ventas SET
		n_factura='".$_POST["n_factura"]."',
		n_cot='".$_POST["n_cot"]."',
		n_oc='".$_POST["n_oc"]."',
		f_factura='".$a_f_factura."',
		f_cot='".$a_f_cot."',
		f_oc='".$a_f_oc."',	
		fecha='".$_POST["fecha"]."',
		fecha_entrega='".$_POST["fecha_entrega"]."',
		fecha_pago='".$_POST["fecha_pago"]."',
		id_cliente='".$_POST["id_cliente"]."',
		razon='".$_POST["razon"]."',
		item='".$_POST["item"]."',
		detalle='".$_POST["detalle"]."',
		pagado='".$_POST["pagado"]."',
		monto='".$_POST["monto"]."',
		iva='".$_POST["iva"]."',
		total='".$_POST["total"]."'

		WHERE

		id_venta=".$_POST["id"];
		$query = mysql_query($sql, $conexion);
		if($sql){
			echo('VENTA '.$_POST["id"].' ACTUALIZADA  '.mysql_error().'
			
			');

								/////////////////////////////////////////////
								/////////////////////////////////////////////
								/// MOVIMIENTO DE LOS ARCHIVOS
					
					/*-------------------------------------------------*/
					if($ar_f_oc!=""){
						
						echo('<script>alert("'.$ar_f_oc.'");</script>');
						unlink($v_f_oc);					
								$origen_f_oc = $_FILES['f_oc']['tmp_name'];
								 $destino_f_oc = 'docs/ORDENES-DE-COMPRA/'.$a_f_oc;
								 move_uploaded_file($origen_f_oc, $destino_f_oc);
					}
					/*-------------------------------------------------*/
					
					if($ar_f_cot!=""){
						echo('<script>alert("'.$ar_f_cot.'");</script>');
						unlink($v_f_cot);
								$origen_f_cot = $_FILES['f_cot']['tmp_name'];
								 $destino_f_cot = 'docs/COTIZACIONES/'.$a_f_cot;
								 move_uploaded_file($origen_f_cot, $destino_f_cot);
					}	
					
					/*-------------------------------------------------*/			
					if($ar_f_factura!=""){
						//echo('<script>alert("'.$ar_f_factura.'");</script>');
						unlink($v_f_factura);
								$origen_f_factura =$_FILES['f_factura']['tmp_name'];
								 $destino_f_factura = 'docs/FACTURAS/'.$a_f_factura;
								 move_uploaded_file($origen_f_factura, $destino_f_factura);
					}
					
					/*-------------------------------------------------*/
								 ///* MOVIMIENTO DE LOS ARCHIVOS
			
			
			if($_GET["f"]=='0'){
		  ///////////////////////////////////
		  //////// DEBUGIN //////////////////
		  //////////////////////////////////
		  /*echo('<script>alert("testing:f==0");</script>');*/
		  //////////////////////////////////
		  /////////// * debug //////////////
		  ////////////////////////////////

			
			
            echo('<script>f_EditVenta(0,1);</script>
			f-cobros reloaded...
			');
			exit;
      }
      else
      {
		  ///////////////////////////////////
		  //////// DEBUGIN //////////////////
		  //////////////////////////////////
		  /*echo('<script>alert("testing:f!=0");</script>');*/
		  //////////////////////////////////
		  /////////// * debug //////////////
			////////////////////////////////
		  echo('
		  
        <script>
		ver(\'null.php\',\'update_view\');
		filtrar(\'all\',0);</script>
        ');
		exit;
      }      
		}else{
			echo('<h1>ERROR ACTUALIZANDO LA VENTA: '.mysql_error().'</h1>');
			exit;
		}
	}
	
	if($_GET["del"]==1){
		
		$sql_v="SELECT * FROM ventas WHERE id_venta='".$_GET["id"]."'";
		$query_v = mysql_query($sql_v, $conexion);
		$v=mysql_fetch_array($query_v);
		$v_f_factura="docs/FACTURAS/".$v["f_factura"];
		$v_f_cot="docs/COTIZACIONES/".$v["f_cot"];
		$v_f_oc="docs/ORDENES-DE-COMPRA/".$v["f_oc"];
		
		$sql_del="DELETE FROM ventas WHERE id_venta= '".$_GET["id"]."'";
		$query_del = mysql_query($sql_del, $conexion);
		if ($sql_del){
			echo('Eliminado correctamente');
					unlink($v_f_factura);
					unlink($v_f_cot);
					unlink($v_f_oc);
		}
		else
		{
			echo('ERROR ELIMINANDO');
			exit;
		}
	}
	
	
	$fvfd=$_GET["fvfd"];
	$fvfh=$_GET["fvfh"];
	
	$Grazon=$_GET["fcr"];
	$sql_fcr="SELECT * FROM clientes WHERE razon='$Grazon'";
	$query_fcr = mysql_query($sql_fcr, $conexion);
	$fcrd=mysql_fetch_array($query_fcr);
	$fcr=$fcrd["id_cliente"];
	
	$f_pagado=$_GET["f_pagado"];
	$f_cot=$_GET["f_cot"];
	$f_fac=$_GET["f_fac"];
	$estado=$_GET["estado"];
	
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

	
	/* Valor SQL del Filtro  */
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
		$f_sql_F=" WHERE fecha!=''";
		break;

		
	}
	
	switch(true){
		case($fcr!=""):$fcr_sql=" AND id_cliente ='$fcr'";break;
		case($fcr==""):$fcr_sql="";break;
	}
	switch(true){
		case($f_cot!=""):$f_cot_sql=" AND n_cot ='$f_cot'";break;
		case($f_cot==""):$f_cot_sql="";break;
	}	
		switch(true){
		case($f_fac!=""):$f_fac_sql=" AND n_factura ='$f_fac'";break;
		case($f_fac==""):$f_fac_sql="";break;
	}	

	// PAGADO SI/NO	
	switch(true){
		case($f_pagado!=""):$f_pagado_sql=" AND pagado ='$f_pagado'";break;
		case($f_pagado==""):$f_pagado_sql="";break;
	}		
	
		switch(true){
		case($f_pagado=="SI"):$fvspC=" checked";
		break;
		case($f_pagado=="NO"):$fvnpC=" checked";
		break;
	}

	
	switch(true){
		case($estado!=""):$estado_sql=" AND estado ='$estado'";break;
		case($estado==""):$estado_sql="";break;
	}

	$FILTRO_SQL=$f_sql_F.$fcr_sql.$f_fac_sql.$f_cot_sql.$f_pagado_sql.$estado_sql;

	
	//////////////////////////////////////////////
	//////////////////////////////////////////////
	//////////////////////////////////////////////
	          ///  NUEVA 
	
	//////////////////////////////////////////////
	//////////////////////////////////////////////
	//////////////////////////////////////////////
	//////////////////////////////////////////////
	
	//              FILTROS  IN
	//////////////////////////////////////////////
	//////////////////////////////////////////////
echo('

<h1>Ventas</h1>

<input type="button" value="Nueva Venta" onclick="document.getElementById(\'add_venta\').style.display=\'block\';"/>

N FAC <input size="3" type="text" name="f_fac" id="f_fac" onchange="filtrar(\'f_fac\',this.value)"/>
N COT <input size="3" type="text" name="f_cot" id="f_cot" onchange="filtrar(\'f_cot\',this.value)"/>
Desde <input type="date" name="fvfd" id="fvfd" value="'.$fvfd.'" onchange="filtrar(\'fvfd\',this.value)"/> 
Hasta <input type="date" name="fvfh" id="fvfh" value="'.$fvfh.'" onchange="filtrar(\'fvfh\',this.value)"/> 


Cliente 
<input type="text" list="Cliente_List"  name="fcr" id="fcr" value="'.$Grazon.'">
<img src="img/lupa.png" width="20" onclick="filtrar(\'fcr\',document.getElementById(\'fcr\').value)">
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





');

echo('
<label for="pagado">Pagado: </label></th><th>SI<input onclick="filtrar(\'f_pagado\',\'SI\')" name="f_pagado" id="f_pagado" type="radio" value="SI" '.$fvspC.'/> NO<input onclick="filtrar(\'f_pagado\',\'NO\')" name="f_pagado" id="f_pagado" type="radio" value="NO" '.$fvnpC.'/>
<input type="hidden" name="f_pagado_s" id="f_pagado_s" value="'.$f_pagado.'" />




<select style="font-size:9px;border-radius:3px;"  id="estado" name="estado" onchange="filtrar(\'estado\',this.value);">
	<option value="">TODAS</option>
  
  ');
 $sql_ev="SELECT * FROM estados_venta";
	$query_ev = mysql_query($sql_ev, $conexion);		
	while($ev=mysql_fetch_array($query_ev))
	{
		if($estado==$ev["id_estado"]){$selected_ev=" selected";}else{$selected_ev="";}
		echo utf8_encode(' 
		<option style="color:black;text-shadow:1px 1px 1px white;background-color:'.$ev["color"].';" value="'.$ev["id_estado"].'" '.$selected_ev.'>
			'.$ev["estado"].'
		</option>
		');
	}
	
	echo('
  </select>



<!-- filtros -->
');


$archivo="docs/tmp_export.csv";



echo('
<a href="export.php" target="blank"><img style="width:30px;" src="img/export.png"/></a>
');






echo('

<!-- filtros por estado -->

<!-- ////////////////  NUEVA VENTA   ////////////////////  -->



<form id="add_venta" action="ventas.php" method="post" enctype="multipart/form-data" target="consola" style="display:none;"/> 
<table>
 <tr>
 <th><label for="n_factura">N° Factura</label></th><th><input name="n_factura" type="number" value="N° Factura"/>
	  <input style="width:20px;" name="f_factura" type="file" value="Factura"/>
	  </th>
   <th><label for="n_cot">N° Cotizacion</label></th><th><input name="n_cot" type="number" value="N° Cotizacion"/>
   <input style="width:20px;" name="f_cot" type="file" value="Cotizacion"/>
   </th>
     <th><label for="n_oc">N° Orden de Compra</label></th><th><input name="n_oc" type="number" value="N° oc"/>
	 <input style="width:20px;" name="f_oc" type="file" value="oc"/>
	 </th>
	  
  </tr>
  <tr>
  
  <th>
    <label for="id_cliente">Cliente</label></th><th>
	
	<input type="text" name="id_cliente" list="Cliente_List">
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
  </th>
  <th>
	<label for="item">Item</label></th><th>
	<input name="item" type="text" value="Item"/>
  </th>
  <th><label for="detalle">Detalle</label></th><th><textarea name="detalle" >Detalle</textarea></th>
  
 </tr>
 
 <tr>
  
<th><label for="monto">Monto</label></th>
<th>
	<input id="monto" name="monto" type="number" value="Monto"/>
	<img onclick="calcular();" src="img/calc.png" style="width:30px;vertical-align: middle;cursor:pointer;" title="CALCULAR" />
</th>
   <th><label for="iva">IVA</label></th><th><input id="iva" name="iva" type="number" value="IVA"/></th>
   <th><label for="total">Total</label></th><th><input id="total" name="total" type="number" value="Total"/></th> 
 </tr>
 
<tr>
 <th>
	<label for="fecha">Fecha</label></th><th>
	<input name="fecha" type="date" value="'.date("Y-m-d").'"/>
	</th>
    <th><label for="fecha_pago">Fecha Pago</label></th><th><input name="fecha_pago" type="date" value="Fecha Pago"/></th>
	 <th><label for="fecha_entrega">Fecha Entrega</label></th><th><input name="fecha_entrega" type="date" value="Fecha Entrega"/></th>
</tr>
<tr>
    <th><label for="pagado">Pagado: </label></th><th>SI<input name="pagado" type="radio" value="SI"/> NO<input name="pagado" type="radio" value="NO"/></th>
    <th></th><th>
	<input type="hidden" value="1" name="add"/>
	<input type="submit" value="Ingresar Venta"/>
	</th> 
	<th></th>
	<th></th>

 </tr>
 
</table>
<input type="button" value="Ocultar Formulario" onclick="document.getElementById(\'add_venta\').style.display=\'none\';"/>
</form>

<hr>
<div id="update_view"></div>
<table id="myTable" class="tablesorter">
<thead> 
 <tr>
  <th width="75">fecha</th>
  <th>N°<br>Cot</th>
  <th>N°<br>OC</th>
  <th>N°<br>Fac</th>
  <th width="200" style="text-align:left;">Cliente</th>
  <th width="200" style="text-align:left;">Rut</th>
  <th width="60">Item</th>
  <th width="150" style="text-align:left;">Detalle</th>
  <th style="text-align:right;">Monto $</th>
  <th style="text-align:right;">IVA $</th>
  <th style="text-align:right;">Total $</th>
  <th width="95" style="cursor:pointer;" >Fecha Entrega</th>
  <th width="20" style="font-size:9px;">Dias<br>Entrega</th>
  <th>Estado</th>
  <th width="75">Fecha de pago</th>
  <th>Pagado</th>
  <th width="20" style="font-size:9px;">Dias<br>Vencidos</th>
  <th width="140">Accion</th>
</tr>
</thead>
<tbody> 
');

////////////////////////////////////////////
////////////////////////////////////////////
///////////  EXPORT     ////////////////////
////////////////////////////////////////////
////////////////////////////////////////////
$EXPORT_HEAD="fecha;Fac;Cot;OC;Cliente;Item;Detalle;Monto $;IVA $;Total $;Fecha Entrega;Dias Entrega;Estado;Fecha de pago;Pagado;Dias Vencidos
";
////////////////////////////////////////////
////////////////////////////////////////////
////////////////////////////////////////////
////////////////////////////////////////////



/// ORDER
$ORDER="ORDER BY id_venta DESC";
if($_GET["f_fecha_pago"]=="1"){
	$ORDER="ORDER BY fecha_pago DESC";
}
if($_GET["f_fecha_entrega"]=="1"){
	$ORDER="ORDER BY fecha_entrega DESC";
}



$fecha_actual=date("y:m:d");
$sql_v="SELECT *, TO_DAYS( fecha_entrega) - TO_DAYS('".$fecha_actual."') AS dias, TO_DAYS('".$fecha_actual."') - TO_DAYS(fecha_pago) AS dias_pago FROM ventas ".$FILTRO_SQL." ".$ORDER." LIMIT ".$CANTIDAD_VENTAS;
$query_v = mysql_query($sql_v, $conexion);
while($v=mysql_fetch_array($query_v)){
	$sql_c="SELECT * FROM clientes WHERE id_cliente='".$v["id_cliente"]."'";
	$query_c = mysql_query($sql_c, $conexion);
	$c=mysql_fetch_array($query_c);

	$color_entrega="#ccc";
	
	
	
	$sql_ev="SELECT * FROM estados_venta WHERE id_estado='".$v["estado"]."'";
	$query_ev = mysql_query($sql_ev, $conexion);		
	$ev=mysql_fetch_array($query_ev);
	
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

	switch(true){
			case($v["pagado"]=="SI"): $color_pagado="green";
			break;
			case($v["pagado"]=="NO"): $color_pagado="red";
			break;
	}
	switch(true){
			case($v["entregado"]=="SI"): $color_entregado="green";
			break;
			case($v["entregado"]=="NO"): $color_entregado="red";
			break;
	}
	$pagado_check="";
	
	
	
	// FILTRO POR AUTORIZACION
	$pass=1;
/*	if($v["pagado"]=="SI"){
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
/////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////
////////////       LISTADO      /////////////////////////
/////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////

////////////////////////////////////////////
////////////////////////////////////////////
///////////  EXPORT     ////////////////////
////////////////////////////////////////////
////////////////////////////////////////////
  
$EXPORT_DATA.=$v["fecha"].';'.$v["n_factura"].';'.$v["n_cot"].';'.$v["n_oc"].';'.utf8_encode($c["razon"]).';'.preg_replace("/[\r\n|\n|\r]+/", " ", utf8_encode($v["item"])).';'.preg_replace("/[\r\n|\n|\r]+/", " ", utf8_encode($v["detalle"])).';$'.str_ireplace(',','.',number_format($v["monto"])).';$'.str_ireplace(',','.',number_format($v["iva"])).';$'.str_ireplace(',','.',number_format($v["total"])).';'.$v["fecha_entrega"].';'.$v["dias"].';'.$v["estado"].';'.$v["fecha_pago"].';'.$v["pagado"].';'.$v["dias_pago"].'
';
  
  
////////////////////////////////////////////
////////////////////////////////////////////
////////////////////////////////////////////
////////////////////////////////////////////

echo('
 <tr>
	<td style="min-width:90px">
		<i style="opacity:1;color:'.$ev["color"].';" class="fas fa-stop" title="'.$ev["estado"].'"></i>
		'.$v["fecha"].'
	</td>
	 <td><a href="docs/COTIZACIONES/'.$v["f_cot"].'" target="blank">'.$v["n_cot"].'</a></td>
	 <td><a href="docs/ORDENES-DE-COMPRA/'.$v["f_oc"].'" target="blank">'.$v["n_oc"].'</a></td>
	 <td><a href="docs/FACTURAS/'.$v["f_factura"].'" target="blank">'.$v["n_factura"].'</a></td>
	 <td style="text-align:left;">'.utf8_encode($c["razon"]).'</td>
	 <td style="text-align:left;">'.str_ireplace(".","",$c["rut"]).'</td>
	 <td>'.utf8_encode($v["item"]).'</td>
	 <td style="text-align:left;">'.utf8_encode($v["detalle"]).'</td>
   

	
	 <td style="text-align:right;">'.number_format($v["monto"]).'</td>
	 <td style="text-align:right;">'.number_format($v["iva"]).'</td>
	 <td style="text-align:right;">'.number_format($v["total"]).'</td>
  
     <td style="padding:5px;">'.$v["fecha_entrega"].'</td>
	 <td style="color:'.$color_entrega.';">'.$v["dias"].'</td>
	 <td  style="color:'.$color_entregado.';">
	 
	 
	 
	 
	 
	 
	 
	 <select style="font-size:9px;border-radius:3px;"  onchange="ver(\'ventas.php?id='.$v["id_venta"].'&ue=\'+this.value,\'main\');">
	<option value="">TODAS</option>
  
  ');
 $sql_ev="SELECT * FROM estados_venta";
	$query_ev = mysql_query($sql_ev, $conexion);		
	while($ev=mysql_fetch_array($query_ev))
	{
		if($v["estado"]==$ev["id_estado"]){$selected_ev=" selected";}else{$selected_ev="";}
		echo utf8_encode(' 
		<option style="color:black;text-shadow:1px 1px 1px white;background-color:'.$ev["color"].';" value="'.$ev["id_estado"].'" '.$selected_ev.'>
			'.$ev["estado"].'
		</option>
		');
	}
	
	echo('
  </select>



	  
	  
	  
	  
	  
	  
	  
	  
	  
	  
	 </td>
	 <td>'.$v["fecha_pago"].'</td>
	  <td style="color:'.$color_pagado.';">'.$v["pagado"].'</td>
	 <td style="color:'.$color_pago.';">'.$v["dias_pago"].'</td>
	 <td>
	 
		<img title="PAGADO: '.$v["pagado"].'" onclick="ver(\'ventas.php?p=1&SN='.$v["pagado"].'&id='.$v["id_compra"].'\',\'main\');" class="'.$v["pagado"].'" src="img/pago.png">
		<img title="ENTREGADO: '.$v["entregado"].'" onclick="ver(\'ventas.php?e=1&SN='.$v["entregado"].'&id='.$v["id_compra"].'\',\'main\');" class="'.$v["entregado"].'" src="img/entrega.png">
		<img onclick="update(\''.$v["id_venta"].'\');" title="EDITAR" src="img/edit.png">
		<img onclick="preguntar(\''.$v["id_venta"].'\',\'venta\');" title="ELIMINAR" src="img/del.png">
	 </td>
	 </tr>
');

		//FECHAS
		$entrega_count="";
		
		$dias_vencidos="";
		
		
		// CONTADORES SIMPLES
		$facturas_count=$facturas_count+1;
		if($v["pagado"]=="NO"){$pagados_count=$pagados_count+1;}
		if($v["entregado"]=="NO"){$entregados_count=$entregados_count+1;}
		if($dias_vencidos<=1){$vencidos_count=$vencidos_count+1;}
		
		
		
		// TOTALES
		$total_monto=$total_monto+$v["monto"];
		$total_iva=$total_iva+$v["iva"];
		$total_total=$total_total+$v["total"];
		
}//CIERRA PASS

}
////////////////////////////////////////////
////////////////////////////////////////////
///////////  EXPORT     ////////////////////
////////////////////////////////////////////
////////////////////////////////////////////
$EXPORT_TOTALS='Ventas:'.$facturas_count.';;;;;;Totales : ;$'.str_ireplace(',','.',number_format($total_monto)).';$'.str_ireplace(',','.',number_format($total_iva)).';$'.str_ireplace(',','.',number_format($total_total)).';'.$pagados_count.';;;'.$entregados_count.';;;
';
////////////////////////////////////////////
////////////////////////////////////////////




echo('
</tbody>
 <tr style="background:#fff;">
	 <td></td>
	 <td>Ventas:'.$facturas_count.'</td>
	 <td></td>
	 <td></td>
	 <td></td>
	 <td></td>
	 <td></td>
  	 <td><strong>Totales : </strong></td>
	 <td style="text-align:right;"><strong>$'.str_ireplace(',','.',number_format($total_monto)).'</strong></td>
	 <td style="text-align:right;"><strong>$'.str_ireplace(',','.',number_format($total_iva)).'</strong></td>
	 <td style="text-align:right;"><strong>$'.str_ireplace(',','.',number_format($total_total)).'</strong></td>
	 <td style="color:red;font-weight:bolder;">'.$pagados_count.'</td>
	 <td></td>
	 <td></td>
	 <td style="color:red;font-weight:bolder;">'.$entregados_count.'</td>
	 <td></td>
	 <td></td>
	 <td></td>
 </tr>
  
 </table>
 <hr>

<hr>
');

 

/* DEBUG EXPORT DATA
echo('$EXPORT_HEAD:'.$EXPORT_HEAD.'<hr>');
echo('$EXPORT_DATA:'.$EXPORT_DATA.'</hr>');
echo('$EXPORT_TOTALS:'.$EXPORT_TOTALS.'<hr>');
*/
unlink("docs/tmp_export.csv");
$fp=fopen($archivo, "a");
fwrite($fp, $EXPORT_HEAD);
fwrite($fp, $EXPORT_DATA);
fwrite($fp, $EXPORT_TOTALS);
fclose($fp);

break;
}
?>