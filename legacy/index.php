<?php 
session_start();
/* if($_SESSION["usr"]!=""){
	 
 }else{
	 exit;
 }

*/


$S=$_GET["s"];

switch($S){
	case(0|""):
		// STEP 0 (LOGIN)
		include "head.php";
		echo('
		<div style="margin-top:40px;border-radius:30px;background-color:#ccc;width:10%;margin-left:auto;margin-right:auto;padding:50px;">
			<h1>Login</h1>

			<form method="POST" action="index.php?s=1">
			 <input id="datos-login" name="user" type="text" value="Usuario" onfocus="if(this.value==\'Usuario\')this.value=\'\'" onblur="if(this.value==\'\')this.value=\'Usuario\'">
			 <input id="datos-login" name="pass" type="password" value="Contraseña" onfocus="if(this.value==\'Contraseña\')this.value=\'\'" onblur="if(this.value==\'\')this.value=\'Contraseña\'">
			 <input type="submit" value="Ingresar" />
			</form>
		</div>

		');
	break;
	case(1):
		// STEP 2 (Validar Usuario)
		include "head.php";
		
		echo('<div style="margin-top:40px;border-radius:30px;background-color:#ccc;width:10%;margin-left:auto;margin-right:auto;padding:50px;"><h2>Validando Usuario</h2>');
		
		echo('<h3>Conectando...</h3>');
		
		include "c.php";
		
		echo('<h3>Conecxi&oacute;n establecida!</h3>');
		
		$s="SELECT * FROM usuarios WHERE user='".$_POST["user"]."'";
		$q = mysql_query($s, $conexion);
		$d=mysql_fetch_array($q);
		
		echo('<h3>Verificando credenciales</h3>');
		if($d["user"]==$_POST["user"]){
			echo('<h3>Validando contrase&ntilde;a para usuario: '.$d["user"].'</h3>');
			// pass
			if($d["pass"]==$_POST["pass"]){
				// OK
				echo('<h3>Autentificaci&oacute;n correcta. Bienvenido!<br>Ser&aacute;s Redirigido automaticamente...</h3>');
				$_SESSION["usr"]=$d["user"];
				echo('<script>location.href=\'index.php?s=2\';</script>');
			}
			else{
				$_SESSION["usr"]="";
				echo('<h3>Contrase&ntilde;a incorrecta!</h3>');
				echo('<input type="button" onclick="location.href=\'index.php\';" value="Reintentar"/>');
			}
		}
		else{
			echo('<h3>Usuario no existe!</h3>');
			echo('<input type="button" onclick="location.href=\'index.php\';" value="Reintentar"/>');
		}
		echo('</div>');
	break;
	case(2):
		if($_SESSION["usr"]!=""){

			// INICIO
			include "head.php";
			include "menu.php";
			include "main.php";     
			include "footer.php";
		}
		else
		{
			echo('<script>location.href=\'index.php\';</script>');
		}
}
?>