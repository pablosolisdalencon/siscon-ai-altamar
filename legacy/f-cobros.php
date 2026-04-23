<?php
include "c.php";
function GetRand($longitud) {
 $key = '';
 $pattern = '1234567890abcdefghijklmnopqrstuvwxyz';
 $max = strlen($pattern)-1;
 for($i=0;$i < $longitud;$i++) $key .= $pattern{mt_rand(0,$max)};
 return $key;
}


$sql_e="SELECT * FROM empresa WHERE id_empresa=1";
				$query_e = mysql_query($sql_e, $conexion);
				$e=mysql_fetch_array($query_e);

echo('<div id="f-console"></div>
<h1>f-Cobros</h1>
<script type="text/javascript" src="js.js?k='.GetRand(20).'"></script>
');
////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////
//////       SECCION VENTAS Y FILTROS /////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////

/*******************************************************************************************/
/********************** SET SQL  FILTROS WITH GET DATA   ***********************************/
/******************************************************************************************/

	
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
	

	
	
/*	switch($fvsp){
		case(1):$fvspC=" selected";$fvsp_switch=0;break;
		case(0):$fvspC="";$fvsp_switch=1;break;
	}
	switch($fvnp){
		case(1):$fvnpC=" selected";$fvnp_switch=0;break;
		case(0):$fvnpC="";$fvnp_switch=1;break;
	}
	*/
	
	/* Valor SQL del Filtro  */
	$F_WHERE=" WHERE n_factura!='0'";
	switch(true){
		case($fvfd!="" && $fvfh!=""):
		 $f_sql_F=" AND fecha BETWEEN '$fvfd' AND '$fvfh'";
		break;
		case($fvfd!="" && $fvfh==""):
		$f_sql_F=" AND fecha BETWEEN '$fvfd' AND '$fvfd'";
		break;
		case($fvfd=="" && $fvfh!=""):
		$f_sql_F=" AND fecha BETWEEN '$fvfh' AND '$fvfh'";
		break;
		case($fvfd=="" && $fvfh==""):
		$f_sql_F=" AND fecha!=''";
		break;

		
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

	$FILTRO_SQL=$F_WHERE.$f_sql_F.$f_fac_sql.$f_cot_sql.$f_pagado_sql.$estado_sql;

  /* FILTRO CLIENTE PARA EL LOOP */
	switch(true){
		case($fcr!=""):$fcr_sql=" WHERE id_cliente ='$fcr'";break;
		case($fcr==""):$fcr_sql="";break;
	}
	



/*********************************************************************************************/
/***********************    INPUT FORM FILTROS      *******************************************/
/*********************************************************************************************/


echo('
N FAC <input size="3" type="text" name="f_fac" id="f_fac" onchange="f_filtrar(\'f_fac\',this.value)" value="'.$f_fac.'"/>
N COT <input size="3" type="text" name="f_cot" id="f_cot" onchange="f_filtrar(\'f_cot\',this.value)" value="'.$f_cot.'"/>
Desde <input type="date" name="fvfd" id="fvfd" value="'.$fvfd.'" onchange="f_filtrar(\'fvfd\',this.value)"/> 
Hasta <input type="date" name="fvfh" id="fvfh" value="'.$fvfh.'" onchange="f_filtrar(\'fvfh\',this.value)"/> 


Cliente 
<input type="text" list="Cliente_List"  name="fcr" id="fcr" value="'.$Grazon.'">
<i class="fas fa-search btn-search" onclick="f_filtrar(\'fcr\',document.getElementById(\'fcr\').value)"></i>
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
  <label for="pagado">Pagado: </label>
</th>
<th>
  SI
  <input onclick="f_filtrar(\'f_pagado\',\'SI\')" name="f_pagado" id="f_pagado" type="radio" value="SI" '.$fvspC.'/>
  NO
  <input onclick="f_filtrar(\'f_pagado\',\'NO\')" name="f_pagado" id="f_pagado" type="radio" value="NO" '.$fvnpC.'/>
  <input type="hidden" name="f_pagado_s" id="f_pagado_s" value="'.$f_pagado.'" />
  <select style="font-size:9px;border-radius:3px;"  id="estado" name="estado" onchange="f_filtrar(\'estado\',this.value);">
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


////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////              FIN SECCION VENTAS Y FILTROS  /////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////

switch($_GET["s"]){
	case(""):
		/// START LOOP
		$sql_c="SELECT * FROM clientes".$fcr_sql;
		$query_c = mysql_query($sql_c, $conexion);
		while($c=mysql_fetch_array($query_c))
		{
			$loop=$c["id_cliente"];
				echo('
				<div id="update_view"></div>
				');
      
      
                        // ORDER
          $ORDER="ORDER BY id_venta DESC";
          if($_GET["f_fecha_pago"]=="1"){
            $ORDER="ORDER BY fecha_pago DESC";
          }
          if($_GET["f_fecha_entrega"]=="1"){
            $ORDER="ORDER BY fecha_entrega DESC";
          }
      
        $fecha_actual=date("y:m:d");
        $sql_v="SELECT *, TO_DAYS( fecha_entrega) - TO_DAYS('".$fecha_actual."') AS dias, TO_DAYS('".$fecha_actual."') - TO_DAYS(fecha_pago) AS dias_pago FROM ventas ".$FILTRO_SQL." AND id_cliente='".$loop."' ".$ORDER;
        $query_v = mysql_query($sql_v, $conexion);
		
		if(mysql_num_rows($query_v)!="0"){
		//id="table-'.$c["id_cliente"].'"
				$TABLA_COBRO='
        <table id="table-'.$c["id_cliente"].'" name="table-'.$c["id_cliente"].'">
				  <tr>
            <th colspan="10" style="background-color:#333;font-size:24px;padding:10px;">'.$c["razon"].'</th>
            <th><i class="fas fa-user-edit" onclick="f_EditCliente(\''.$c['id_cliente'].'\',0);" title="Editar Cliente"></i></th>
            <th id="send_cobro"> <i class="fas fa-envelope" onclick="view_mail_cobro(\''.$c['id_cliente'].'\');"></i></th>
          </tr>
        </table>
				<table id="myTable" class="tablesorter"  name="myTable">
         <thead>
					<tr>
					  <th width="75">fecha</th>
					  <th>N°<br>Cot</th>
					  <th>N°<br>OC</th>
					  <th>N°<br>Fac</th>
					  <th>Item</th>
					  <th>Detalle</th>  
					  <th style="width:100px;text-align:right;">Monto $</th>
					  <th style="width:100px;text-align:right;">IVA $</th>
					  <th style="width:100px;text-align:right;">Total $</th>
					  <th width="75" onclick="filtrar_cobros(\'all\',\'fecha_pago\');">
							Fecha de pago		
							<input type="hidden" name="f_fecha_pago" id="f_fecha_pago" value="'.$_GET["f_fecha_pago"].'"/>
					  </th>
					  <th width="20" style="font-size:9px;">Dias<br>Vencidos</th>
            <th><i class="fas fa-wrench" title="Herramientas"></th>
					</tr>
         </thead>
				';
				$TABLA_MAIL='
				<table>
				<tr><th colspan="10" style="background-color:#333;font-size:24px;padding:10px;">'.$c["razon"].'</th><th id="send_cobro"> </th></tr>
					<tr>
					  <th width="75">fecha</th>
					  <th>N°<br>Cot</th>
					  <th>N°<br>OC</th>
					  <th>N°<br>Fac</th>
					  <th>Item</th>
					  <th>Detalle</th> 
					  <th style="width:100px;text-align:right;">Monto $</th>
					  <th style="width:100px;text-align:right;">IVA $</th>
					  <th style="width:100px;text-align:right;">Total $</th>
					  <th width="75" onclick="filtrar_cobros(\'all\',\'fecha_pago\');">
							Fecha de pago		
							<input type="hidden" name="f_fecha_pago" id="f_fecha_pago" value="'.$_GET["f_fecha_pago"].'"/>
					  </th>
					  <th width="20" style="font-size:9px;">Dias<br>Vencidos</th>
					</tr>
				';

				while($v=mysql_fetch_array($query_v)){
					$sql_ev="SELECT * FROM estados_venta WHERE id_estado='".$v["estado"]."'";
					$query_ev = mysql_query($sql_ev, $conexion);		
					$ev=mysql_fetch_array($query_ev);
					
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

					switch(true){
							case($v["pagado"]=="SI"): $color_pagado="green";
							break;
							case($v["pagado"]=="NO"): $color_pagado="red";
							break;
					}
					
					$TABLA_COBRO.='
          <tbody>
					 <tr>
					  <td>
						<i style="opacity:1;color:'.$ev["color"].';" class="fas fa-stop" title="'.$ev["estado"].'"></i>
						'.$v["fecha"].'
					  </td>	 
						 <td><a href="docs/COTIZACIONES/'.$v["f_cot"].'" target="blank">'.$v["n_cot"].'</a></td>
						 <td><a href="docs/ORDENES-DE-COMPRA/'.$v["f_oc"].'" target="blank">'.$v["n_oc"].'</a></td>
						 <td><a href="docs/FACTURAS/'.$v["f_factura"].'" target="blank">'.$v["n_factura"].'</a></td>
						 
						 <td>'.$v["item"].'</td>
						 <td>'.$v["detalle"].'</td>
						 
						 <td style="text-align:right;">$'.str_ireplace(',','.',number_format($v["monto"])).'</td>
						 <td style="text-align:right;">$'.str_ireplace(',','.',number_format($v["iva"])).'</td>
						 <td style="text-align:right;">$'.str_ireplace(',','.',number_format($v["total"])).'</td>
						 <td>'.$v["fecha_pago"].'</td>
						 <td style="color:'.$color_pago.';">'.$v["dias_pago"].'</td>
             <td>
              <i class="fas fa-edit hover-blue" onclick="f_EditVenta(\''.$v['id_venta'].'\',0);" title="Editar esta Venta"></i>
             </td>
						 </tr>
            </tbody>
					';
					$TABLA_MAIL.='
					 <tr>
					  <td>
						<i style="opacity:1;color:'.$ev["color"].';" class="fas fa-stop" title="'.$ev["estado"].'"></i>
						'.$v["fecha"].'
					  </td>	 
						 <td><a href="docs/COTIZACIONES/'.$v["f_cot"].'" target="blank">'.$v["n_cot"].'</a></td>
						 <td><a href="docs/ORDENES-DE-COMPRA/'.$v["f_oc"].'" target="blank">'.$v["n_oc"].'</a></td>
						 <td><a href="docs/FACTURAS/'.$v["f_factura"].'" target="blank">'.$v["n_factura"].'</a></td>
						 
						 <td>'.$v["item"].'</td>
						 <td>'.$v["detalle"].'</td>
						 
						 <td style="text-align:right;">$'.str_ireplace(',','.',number_format($v["monto"])).'</td>
						 <td style="text-align:right;">$'.str_ireplace(',','.',number_format($v["iva"])).'</td>
						 <td style="text-align:right;">$'.str_ireplace(',','.',number_format($v["total"])).'</td>
						 <td>'.$v["fecha_pago"].'</td>
						 <td style="color:'.$color_pago.';">'.$v["dias_pago"].'</td>
						 </tr>
					';

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
						

				}
				$TABLA_COBRO.='
				 <tr style="background:#fff;">
					 <td>Registros:'.mysql_num_rows($query_v).'</td>
					 <td></td>
					 <td></td>
					 <td></td>
					 <td></td>
					 <td><strong>Total : </strong></td>
					 <td style="text-align:right;"><strong>$'.str_ireplace(',','.',number_format($total_monto)).'</strong></td>
					 <td style="text-align:right;"><strong>$'.str_ireplace(',','.',number_format($total_iva)).'</strong></td>
					 <td style="text-align:right;"><strong>$'.str_ireplace(',','.',number_format($total_total)).'</strong></td>
					 <td colspan="3"></td>           
				 </tr>
				 </table>
				<br><br><br><br>
				';
				$TABLA_MAIL.='
				 <tr style="background:#fff;">
					 <td>Registros:'.mysql_num_rows($query_v).'</td>
					 <td></td>
					 <td></td>
					 <td colspan="3"><strong>Total : </strong></td>
					 <td style="text-align:right;"><strong>$'.str_ireplace(',','.',number_format($total_monto)).'</strong></td>
					 <td style="text-align:right;"><strong>$'.str_ireplace(',','.',number_format($total_iva)).'</strong></td>
					 <td style="text-align:right;"><strong>$'.str_ireplace(',','.',number_format($total_total)).'</strong></td>
					 <td></td>
					 <td></td>
				 </tr>
				 </table>
				<br><br><br><br>
				';
				
				/// SCREEN PRINT
				echo($TABLA_COBRO);
				/// MSJ PRINT
				echo ('
				 
					<div id="pre_mail_cobro_'.$c['id_cliente'].'" class="mail_view">
					<div style="background-color:#FFF;padding:30px;width:90%">
					MIME-Version: 1.0<br>
					Content-type: text/html; charset=iso-8859-1<br><br>

					From: '.$e["razon"].' '.$e["pago_mail"].'<br>
					Reply-To: '.$e["pago_mail"].'<br>
					Return-path: '.$e["pago_mail"].'<br> 
					asunto: Pagos Pendientes a la fecha<br> 
					<br>
					<br>
					<br>
					
						'.utf8_encode($c["mensaje_cobro"]).'
					<br>
					<br>
					<br>
						<div style="width:100%">
							'.$TABLA_MAIL.'
						</div>
 
						<img src="http://'.$_SERVER["HTTP_HOST"].'/altamar/img/'.$e["pago_firma"].'"/>
					<br><br><br><br>					
					<table style="background-color:none;">
					 <tr  style="background-color:none;">
					  <td  style="background-color:none;">
					   <input onclick="hidde_mail_cobro('.$c["id_cliente"].');" class="mailing_button close" type="button" value="Cancelar"/>
					  </td>
					  <td  style="background-color:none;">
					  </td>
					  <td  style="background-color:none;">
					  
					   <input onclick="send_mail_cobro('.$c["id_cliente"].',\''.$f_pagado.'\');" class="mailing_button send" type="button" value="Enviar Cobro"/>
					  </td>
					 </tr>
					</table>	
					</div>
					
					</div>
				');
				
				if($_GET["confirm_cobro"]==$c['id_cliente']){
				$BODY_MAIL='
					<html>
					<head>
					<style>
					body{
						color:#333;
						font-size:10px;
						font-family:Verdana;
						padding:0;
						margin:0;
					}
					a{color:#0080FF;} 
					ul li{
						display: inline;
						background-color:#58ACFA;
						color:#fff;
						margin:3px;
						padding:15px;
						border-radius:3px;
						cursor:pointer;
						box-shadow:1px 1px 3px black;
					}
					ul li:hover{
						background-color:#0080FF;
					}
					ul li img{
						width:200px;
					}
					h1{
						font-size:18px;
						color:blue;
					}
					h2{padding:5px;}
					.SI{background-color:green;}
					.NO{background-color:red;}
					.selected{border: 3px solid #58ACFA;}
					#main{padding:30px;}
					#consola{
						width:60%;
						height:50px;
						border:none;
						padding:5px;
					}
					input[type="submit"]{
						background-color:green;
						color:#FFF;
						padding:5px;
						font-weight:bolder;
					}

					table{
						border:1px solid #0080FF;
						background:#ddd;
						cellspacing:0px 2px;
						border-spacing: 0px 2px;
						width:100%;
					}
					table th {
						background-color:#0080FF;
						color:#fff;
						padding:5px;
						text-align:center;
					}
					table tr:hover{
						background-color:#FFF;
					}
					table td{
						text-align:center;
					}
					table tr td img{
						width:20px;
						height:20px;
						border-radius:5px;
					}
					table .detalle{
						transition:3s;
						display:none;
						background-color:#819FF7;
						padding:10px;
					}
					table .detalle table th{
						background-color:#A9D0F5;
						color:#333;
						font-size:10px;
					}
					table .detalle table{
						width:90%;
						margin-left:auto;
						margin-right:auto;
						
					}
					#send_cobro{
						background-color:#333;
						font-size:24px;
						padding:10px;
						color:#FFcc0b;
						cursor:pointer;
					}
					</style>
					</head>
					<body>
				 
					<div id="pre_mail_cobro_'.$c['id_cliente'].'" class="mail_view">
					<div style="background-color:#FFF;padding:30px;width:90%">
						'.utf8_encode($c["mensaje_cobro"]).'
					<br>
					<br>
					<br>
						<div style="width:90%">
							'.$TABLA_MAIL.'
						</div>
 
						<img src="http://'.$_SERVER["HTTP_HOST"].'/altamar/img/'.$e["pago_firma"].'"/>
					
					</div>
					
					</div>
					</body>
				';
				
				
					//para el envío en formato HTML 
					$headers = "MIME-Version: 1.0\r\n"; 
					$headers .= "Content-type: text/html; charset=utf-8\r\n"; 
					//charset=iso-8859-1

					//dirección del remitente 
					//$headers .= "From: $FROM@hosty12.dnshosty.net\r\n"; 
					$headers .= "From: ".$e["razon"]."<".$e["pago_mail"].">\r\n";

					//dirección de respuesta, si queremos que sea distinta que la del remitente 
					$headers .= "Reply-To: ".$e["pago_mail"]."\r\n";

					//ruta del mensaje desde origen a destino 
					$headers .= "Return-path: ".$e["pago_mail"]."\r\n"; 

					$mail_cliente=$c["pago_mail"];
					$cuerpo=$BODY_MAIL;
					$asunto = "Facturas Pendientes "; 
	 
					if(mail($mail_cliente,$asunto.$e["razon"],$cuerpo,$headers)){
						echo('<h2>Cobro enviado a '.$c['razon'].'!</h2>
						<p>'.$headers.'</p>
						
						');
						mail($e["pago_mail"],$asunto.$c["razon"],$cuerpo,$headers);
					}
				
				}
				
				// CALCS RESETS
				$total_monto=0;
				$total_iva=0;
				$total_total=0;
			}
		}// CLOSE LOOP
break;
}
?>