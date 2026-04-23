<?php
include "c.php";


$sql_e="SELECT * FROM empresa WHERE id_empresa=1";
				$query_e = mysql_query($sql_e, $conexion);
				$e=mysql_fetch_array($query_e);

echo('
				<h1>s-Cobros</h1>
				<script type="text/javascript" src="js.js?c='.GetRand(2).'"></script>
				');

		

switch($_GET["s"]){
	case(""):
		/// START LOOP
		$sql_c="SELECT * FROM clientes";
		$query_c = mysql_query($sql_c, $conexion);
		while($c=mysql_fetch_array($query_c))
		{
			$loop=$c["id_cliente"];
				echo('
				<div id="update_view"></div>
				');
				$fecha_actual=date("y:m:d");
				$sql_v="SELECT *, TO_DAYS('".$fecha_actual."') - TO_DAYS(fecha_pago) AS dias_pago FROM ventas WHERE pagado='NO' AND n_factura!=0 AND id_cliente='".$loop."'";
				$query_v = mysql_query($sql_v, $conexion);
				
			if(mysql_num_rows($query_v)!="0"){

				$TABLA_COBRO='
				<table id="table-'.$c["id_cliente"].'" name="table-'.$c["id_cliente"].'">
				  <tr>
            <th colspan="8" style="background-color:#333;font-size:24px;padding:10px;">'.$c["razon"].'</th>
            <th><i class="fas fa-user-edit" onclick="s-EditCliente(\''.$c['id_cliente'].'\');" title="Editar Cliente"></i></th>
            <th id="send_cobro"> <i class="fas fa-envelope" onclick="view_mail_cobro(\''.$c['id_cliente'].'\');"></i></th>
          </tr>
					<tr>
					  <th width="75">fecha</th>
					  <th>N°<br>Cot</th>
					  <th>N°<br>OC</th>
					  <th>N°<br>Fac</th>
					  <th style="text-align:right;">Monto $</th>
					  <th style="text-align:right;">IVA $</th>
					  <th style="text-align:right;">Total $</th>
					  <th width="75" onclick="filtrar_cobros(\'all\',\'fecha_pago\');">
							Fecha de pago		
							<input type="hidden" name="f_fecha_pago" id="f_fecha_pago" value="'.$_GET["f_fecha_pago"].'"/>
					  </th>
					  <th width="20" style="font-size:9px;">Dias<br>Vencidos</th>
            <th><i class="fas fa-wrench" title="Herramientas"></th>
					</tr>
				';
				$TABLA_MAIL='
				<table>
				<tr><th colspan="8" style="background-color:#333;font-size:24px;padding:10px;">'.$c["razon"].'</th><th id="send_cobro"> </th></tr>
					<tr>
					  <th width="75">fecha</th>
					  <th>N°<br>Cot</th>
					  <th>N°<br>OC</th>
					  <th>N°<br>Fac</th>
					  <th style="text-align:right;">Monto $</th>
					  <th style="text-align:right;">IVA $</th>
					  <th style="text-align:right;">Total $</th>
					  <th width="75" onclick="filtrar_cobros(\'all\',\'fecha_pago\');">
							Fecha de pago		
							<input type="hidden" name="f_fecha_pago" id="f_fecha_pago" value="'.$_GET["f_fecha_pago"].'"/>
					  </th>
					  <th width="20" style="font-size:9px;">Dias<br>Vencidos</th>
					</tr>
				';

				while($v=mysql_fetch_array($query_v)){
					
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
					 <tr>
					  <td>'.$v["fecha"].'</td>	 
						 <td><a href="docs/COTIZACIONES/'.$v["f_cot"].'" target="blank">'.$v["n_cot"].'</a></td>
						 <td><a href="docs/ORDENES-DE-COMPRA/'.$v["f_oc"].'" target="blank">'.$v["n_oc"].'</a></td>
						 <td><a href="docs/FACTURAS/'.$v["f_factura"].'" target="blank">'.$v["n_factura"].'</a></td>
						 <td style="text-align:right;">$'.str_ireplace(',','.',number_format($v["monto"])).'</td>
						 <td style="text-align:right;">$'.str_ireplace(',','.',number_format($v["iva"])).'</td>
						 <td style="text-align:right;">$'.str_ireplace(',','.',number_format($v["total"])).'</td>
						 <td>'.$v["fecha_pago"].'</td>
						 <td style="color:'.$color_pago.';">'.$v["dias_pago"].'</td>
             <td>
              <i class="fas fa-edit hover-blue" onclick="s-EditVenta(\''.$v['id_venta'].'\');" title="Editar esta Venta"></i>
             </td>
						 </tr>
					';
					$TABLA_MAIL.='
					 <tr>
					  <td>'.$v["fecha"].'</td>	 
						 <td><a href="docs/COTIZACIONES/'.$v["f_cot"].'" target="blank">'.$v["n_cot"].'</a></td>
						 <td><a href="docs/ORDENES-DE-COMPRA/'.$v["f_oc"].'" target="blank">'.$v["n_oc"].'</a></td>
						 <td><a href="docs/FACTURAS/'.$v["f_factura"].'" target="blank">'.$v["n_factura"].'</a></td>
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
					 <td>Pendientes:'.mysql_num_rows($query_v).'</td>
					 <td></td>
					 <td></td>
					 <td><strong>Total : </strong></td>
					 <td style="text-align:right;"><strong>$'.str_ireplace(',','.',number_format($total_monto)).'</strong></td>
					 <td style="text-align:right;"><strong>$'.str_ireplace(',','.',number_format($total_iva)).'</strong></td>
					 <td style="text-align:right;"><strong>$'.str_ireplace(',','.',number_format($total_total)).'</strong></td>
					 <td></td>
					 <td></td>
				 </tr>
				 </table>
				<br><br><br><br>
				';
				$TABLA_MAIL.='
				 <tr style="background:#fff;">
					 <td>Pendientes:'.mysql_num_rows($query_v).'</td>

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
						<div style="width:90%">
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
					   <input onclick="send_mail_cobro('.$c["id_cliente"].');" class="mailing_button send" type="button" value="Enviar Cobro"/>
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
					$headers .= "Content-type: text/html; charset=iso-8859-1\r\n"; 

					//dirección del remitente 
					//$headers .= "From: $FROM@hosty12.dnshosty.net\r\n"; 
					$headers .= "From: ".$e["razon"]."<".$e["pago_mail"].">\n";

					//dirección de respuesta, si queremos que sea distinta que la del remitente 
					$headers .= "Reply-To: ".$e["pago_mail"]."\r\n";

					//ruta del mensaje desde origen a destino 
					$headers .= "Return-path: ".$e["pago_mail"]."\r\n"; 

					$mail_cliente=$c["pago_mail"];
					$cuerpo=$BODY_MAIL;
					$asunto = "Pagos Pendientes a la fecha"; 
	 
					if(mail($mail_cliente,$asunto,$cuerpo,$headers)){
						echo('<h2>Cobro enviado a '.$c['razon'].'!</h2>

						');
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