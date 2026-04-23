<?php
error_reporting(0);

// --- CONFIGURACIÓN DE CONEXIÓN (Hardcoded) ---
$DBNAME     = "contable";
$dbhost     = "localhost";
$dbusuario  = "altamarm_god";
$dbpassword = "kowlkowl.1";
$db         = "altamarm_" . $DBNAME;

/**
 * Función que realiza el export de la base de datos
 */
function exportarBaseDeDatos($host, $user, $pass, $name) {
    // Definir nombre y ruta del archivo
    $fecha = date("Y-m-d_H-i-s");
    $nombreArchivo = "backup_{$name}_{$fecha}.sql";
    $rutaCompleta = __DIR__ . DIRECTORY_SEPARATOR . $nombreArchivo;

    // Construcción del comando mysqldump
    // Se usa escapeshellarg para manejar caracteres especiales en la contraseña o nombres
    $comando = sprintf(
        "mysqldump --opt -h %s -u %s -p%s %s > %s",
        escapeshellarg($host),
        escapeshellarg($user),
        escapeshellarg($pass),
        escapeshellarg($name),
        escapeshellarg($rutaCompleta)
    );

    // Ejecutar comando
    system($comando, $resultado);

    return ($resultado === 0) ? $rutaCompleta : false;
}

// --- EJECUCIÓN ---
$respaldo = exportarBaseDeDatos($dbhost, $dbusuario, $dbpassword, $db);

if ($respaldo) {
    echo "Respaldo completo de la base de datos '{$db}' generado con éxito.<br>";
    echo "Archivo: " . basename($respaldo);
} else {
    echo "Error: No se pudo realizar el export. Verifica los permisos de la carpeta y la ruta de mysqldump.";
}
?>