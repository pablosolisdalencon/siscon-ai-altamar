<?php
function GetRand($longitud){
 $key = '';
 $pattern = '1234567890abcdefghijklmnopqrstuvwxyz';
 $max = strlen($pattern)-1;
 for($i=0;$i < $longitud;$i++) $key .= $pattern{mt_rand(0,$max)};
 return $key;
}
include "c.php";

		$sql_e="SELECT * FROM empresa WHERE id_empresa=1";
		$query_e = mysql_query($sql_e, $conexion);
		$e=mysql_fetch_array($query_e);
	
		if($_POST["u"]==1){
		
		
		////////////////////////////
				////////////////////////////
				///  UPLOADS
				
					
					$ar_f_pago_firma=$_FILES['f_pago_firma']['name'];
					$at_f_pago_firma=$_FILES['f_pago_firma']['type'];
					$as_f_pago_firma=$_FILES['f_pago_firma']['size'];

					//////////////////// REPLACER 1 
					
					if($ar_f_pago_firma==""){
					  if($e["pago_firma"]==""){ $a_f_pago_firma=""; }else{
						  $a_f_pago_firma=$e["pago_firma"];
					  }
					}
					else
					{
						$a_f_pago_firma="pago_firma.".end(explode("/",$at_f_pago_firma));
						
					}
	/*DEBUG	echo('<script>alert("ar_f_oc:'.$ar_f_oc=$_FILES['f_oc']['name'].'");</script>');*/

		
		
		
		//SQL		
		echo('UPDATE EMPRESA');
				
			$sql="UPDATE empresa SET
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
			pago_firma='".$a_f_pago_firma."'
			
			WHERE

			id_empresa='1'";
			$query = mysql_query($sql, $conexion);
			if($sql){
				echo(' Done! '.$_POST["id"].' ('.$_POST["razon"].')  '.mysql_error().'</p>
				<script type="text/javascript" src="js.js"></script>
				');
				/////  FILES
				///////////////////////////////////
				///////////////////////////////////
				///////////////////////////
				

					///////////////// TAMAÑO Y EXTENCION //////////////////////////////

					$allowedExtensions = array("jpg","jpeg","gif","png"); 
					  foreach ($_FILES as $file) { 
						if ($file['tmp_name'] > '') { 
						  if (!in_array(end(explode(".", 
								strtolower($file['name']))), 
								$allowedExtensions)) { 
						   die('El Archivo: <strong>'.$file['name'].'</strong> ha sido rechazado. <script>alert("Solo se permiten los siguientes tipos de archivos: *.gif, *.jpg, *.jpeg, *.png");</script>'); 
						  } 
						} 
					  } 

					if($as_f_pago_firma>=1000000){echo('<script>alert("Cobro Firma: Tamaño maximo de archivos: (1 Mb)");</script>');}else{}
					///////////////// TAMAÑO Y EXTENCION ///////////////////////////////////////////////////////////////////////////////////////>

					
		
								/////////////////////////////////////////////
								/////////////////////////////////////////////
								/// MOVIMIENTO DE LOS ARCHIVOS
								 $origen_f_pago_firma =$_FILES['f_pago_firma']['tmp_name'];
								 $destino_f_pago_firma = 'img/'.$a_f_pago_firma;
								 move_uploaded_file($origen_f_pago_firma, $destino_f_pago_firma);
								 ///* MOVIMIENTO DE LOS ARCHIVOS
				
				
				
				
				echo('
				<script>ver(\'empresa.php\',\'main\');</script>
				');
				exit;
			}else{
				echo('<h1>FULL UPDATE ERROR'.mysql_error().'</h1>');
				exit;
			}
			
		
		}
		// select e
		

		echo utf8_encode('
		<h1>Empresa</h1>
				<form id="update" action="empresa.php" method="post" target="consola" enctype="multipart/form-data"/> 
			<table>
			 <tr>
			  <th colspan="5" style="background-color:#333;font-size:24px;padding:10px;">
				INFORMACION GLOBAL DE LA EMPRESA
			  </th>
			  <th style="background-color:#333;font-size:24px;padding:10px;">
			   <i class="fas fa-edit"></i>
			  </th>
			 <tr>
			  <th>
			   <label for="rut">Rut</label>
			  </th>
			  <th>
			   <input name="rut" type="text" value="'.$e["rut"].'"/>
			  </th>
			  <th>
				<label for="razon">Razon</label>
			  </th>
			  <th>
				<input name="razon" type="text" value="'.$e["razon"].'"/>
			  </th>
			  <th>
			   <label for="giro">Giro</label>
			  </th>
			  <th>
			   <input name="giro" type="text" value="'.$e["giro"].'"/>
			  </th>
			 </tr> 
			 <tr>
			  <th>
				<label for="direccion">Direccion</label></th><th>
				<input name="direccion" type="text" value="'.$e["direccion"].'"/>
				</th>
			  <th>
			   <label for="fono">Fono</label></th><th>
			   <input name="fono" type="text" value="'.$e["fono"].'"/>
			  </th>
			   <th><label for="mail">Mail</label></th><th>
			   <input name="mail" type="text" value="'.$e["mail"].'"/>
			   </th>
			 </tr>
			 <tr>
			  <th>
			   <label for="comercial_nombre">Contacto Comercial</label>
			  </th>
			  <th>
			   <input name="comercial_nombre" type="text" value="'.$e["comercial_nombre"].'"/>
			  </th>
			  <th>
			   <label for="comercial_mail">Mail Comercial</label>
			  </th>
			  <th>
			   <input name="comercial_mail" type="text" value="'.$e["comercial_mail"].'"/>
			  </th>
			  <th>
			   <label for="comercial_fono">Fono Comercial</label>
			  </th>
			  <th>
			   <input name="comercial_fono" type="text" value="'.$e["comercial_fono"].'"/>
			  </th> 
			 </tr>
			 
			 <tr>
				<th>
				 <label for="pago_nombre">Contacto Pago</label>
				</th>
				<th>
				 <input name="pago_nombre" type="text" value="'.$e["pago_nombre"].'"/>
				</th>
				<th>
				 <label for="pago_mail">Mail Pago</label>
				</th>
				<th>
				 <input name="pago_mail" type="text" value="'.$e["pago_mail"].'"/>
				</th>
				<th>
				 <label for="pago_fono">Fono Pago</label>
				</th>
				<th>
				 <input name="pago_fono" type="text" value="'.$e["pago_fono"].'"/>
				</th> 

			 </tr>
			  <tr>
			  <th>
			  <label for="mensaje_cobro">Firma Cobro</label>
			  </th>
			  <th>
			  <img src="img/'.$e["pago_firma"].'?k='.GetRand(20).'" />
			  
			 </th>
			 <th><input name="f_pago_firma" type="file"/></th>
			 <th colspan="3"></th>
			 </tr>
			<tr>
			  <th colspan="6">
			  <input type="hidden" name="u" value="1"/>
			   <input type="submit" value="Guardar Cambios"/></td>
			 </tr>
			</table>
			</form>
			
');
?>