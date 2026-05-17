<?php
/**
 * SISCON-AI Database Manager v1.4 - DIRECT DOWNLOAD
 * Herramienta técnica: Descarga directa de Backup (Sin almacenamiento en servidor)
 */

// Desactivar límites y activar errores (solo para debug, no en descarga)
set_time_limit(0);
ini_set('memory_limit', '512M');

// --- CONFIGURACIÓN ---
$DBNAME = "contable";
$db_host = "localhost";
$db_user = "altamarm_god";
$db_pass = "kowlkowl.1";
$db_name = "altamarm_" . $DBNAME;

// --- LÓGICA DE EXPORTACIÓN (DESCARGA DIRECTA) ---
if (isset($_POST['action']) && $_POST['action'] == 'export') {
    $filename = "backup_" . $db_name . "_" . date("Y-m-d_H-i-s") . ".sql";
    
    $use_mysqli = extension_loaded('mysqli');
    $use_mysql = function_exists('mysql_connect');

    if ($use_mysql) {
        $conn = @mysql_connect($db_host, $db_user, $db_pass);
        if ($conn) @mysql_select_db($db_name, $conn);
    } else {
        $conn = @mysqli_connect($db_host, $db_user, $db_pass, $db_name);
    }

    if (!$conn) {
        die("Error de conexión: " . ($use_mysql ? mysql_error() : mysqli_connect_error()));
    }

    // Cabeceras para descarga forzada
    header('Content-Type: application/octet-stream');
    header('Content-Disposition: attachment; filename="' . $filename . '"');
    header('Pragma: no-cache');
    header('Expires: 0');

    $output = fopen('php://output', 'w');
    fwrite($output, "-- SISCON-AI Direct Download Export\n-- Date: " . date("Y-m-d H:i:s") . "\n\n");

    // Obtener tablas
    $tables = array();
    $result = $use_mysql ? mysql_query("SHOW TABLES", $conn) : mysqli_query($conn, "SHOW TABLES");
    while ($row = ($use_mysql ? mysql_fetch_row($result) : mysqli_fetch_row($result))) {
        $tables[] = $row[0];
    }

    foreach ($tables as $table) {
        // Estructura
        $res = $use_mysql ? mysql_query("SHOW CREATE TABLE `$table`", $conn) : mysqli_query($conn, "SHOW CREATE TABLE `$table` ");
        $row2 = $use_mysql ? mysql_fetch_row($res) : mysqli_fetch_row($res);
        fwrite($output, "DROP TABLE IF EXISTS `$table`;\n" . $row2[1] . ";\n\n");
        
        // Datos
        $res = $use_mysql ? mysql_query("SELECT * FROM `$table` ", $conn) : mysqli_query($conn, "SELECT * FROM `$table` ");
        $num_fields = $use_mysql ? mysql_num_fields($res) : mysqli_num_fields($res);
        
        while ($row_data = ($use_mysql ? mysql_fetch_row($res) : mysqli_fetch_row($res))) {
            $line = "INSERT INTO `$table` VALUES(";
            for ($j = 0; $j < $num_fields; $j++) {
                if (is_null($row_data[$j])) {
                    $line .= "NULL";
                } else {
                    $val = $use_mysql ? mysql_real_escape_string($row_data[$j], $conn) : mysqli_real_escape_string($conn, $row_data[$j]);
                    $val = str_replace("\n", "\\n", $val);
                    $line .= '"' . $val . '"';
                }
                if ($j < ($num_fields - 1)) $line .= ',';
            }
            $line .= ");\n";
            fwrite($output, $line);
        }
        fwrite($output, "\n\n\n");
    }
    
    fclose($output);
    if ($use_mysql) mysql_close($conn); else mysqli_close($conn);
    exit; // Importante: Salir para no enviar el HTML inferior
}

// --- LÓGICA DE IMPORTACIÓN ---
$message = "";
$error = false;
if (isset($_POST['action']) && $_POST['action'] == 'import' && isset($_FILES['sql_file'])) {
    $use_mysqli = extension_loaded('mysqli');
    $use_mysql = function_exists('mysql_connect');

    if ($use_mysql) {
        $conn = @mysql_connect($db_host, $db_user, $db_pass);
        if ($conn) @mysql_select_db($db_name, $conn);
    } else {
        $conn = @mysqli_connect($db_host, $db_user, $db_pass, $db_name);
    }

    if (!$conn) {
        $error = true;
        $message = "Error de conexión: " . ($use_mysql ? mysql_error() : mysqli_connect_error());
    } else {
        $query = "";
        $sqlScript = file($_FILES['sql_file']['tmp_name']);
        foreach ($sqlScript as $line) {
            $startWith = substr(trim($line), 0, 2);
            $endWith = substr(trim($line), -1, 1);
            if (empty($line) || $startWith == '--' || $startWith == '/*' || $startWith == '//') continue;
            
            $query = $query . $line;
            if ($endWith == ';') {
                if ($use_mysql) {
                    if (!mysql_query($query, $conn)) {
                        $error = true;
                        $message = "Error: " . mysql_error() . "<br><br><b>En la query:</b><br><pre style='color:#f87171'>" . htmlspecialchars($query) . "</pre>";
                        break;
                    }
                } else {
                    if (!mysqli_query($conn, $query)) {
                        $error = true;
                        $message = "Error: " . mysqli_error($conn) . "<br><br><b>En la query:</b><br><pre style='color:#f87171'>" . htmlspecialchars($query) . "</pre>";
                        break;
                    }
                }
                $query = "";
            }
        }
        if (!$error) $message = "Importación completada con éxito.";
        if ($use_mysql) mysql_close($conn); else mysqli_close($conn);
    }
}
?>
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <title>SISCON-AI | DB Manager v1.4</title>
    <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: #0f172a; color: #f8fafc; display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; }
        .card { background: #1e293b; padding: 2rem; border-radius: 12px; box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1); width: 450px; border: 1px solid #334155; }
        h1 { font-size: 1.5rem; margin-bottom: 0.5rem; color: #38bdf8; text-align: center; }
        p.version { font-size: 0.7rem; text-align: center; color: #64748b; margin-bottom: 1.5rem; }
        .btn { display: block; width: 100%; padding: 0.75rem; margin-top: 1rem; border: none; border-radius: 6px; cursor: pointer; font-weight: bold; transition: background 0.2s; }
        .btn-export { background: #0ea5e9; color: white; }
        .btn-export:hover { background: #0284c7; }
        .btn-import { background: #10b981; color: white; }
        .btn-import:hover { background: #059669; }
        .alert { padding: 1rem; margin-bottom: 1rem; border-radius: 6px; font-size: 0.9rem; word-break: break-all; }
        .alert-success { background: #064e3b; color: #34d399; border: 1px solid #065f46; }
        .alert-error { background: #450a0a; color: #f87171; border: 1px solid #7f1d1d; }
        label { font-size: 0.85rem; color: #94a3b8; }
        input[type="file"] { margin-top: 0.5rem; width: 100%; color: #94a3b8; }
        hr { border: 0; border-top: 1px solid #334155; margin: 1.5rem 0; }
    </style>
</head>
<body>
    <div class="card">
        <h1>ERIC DB Manager</h1>
        <p class="version">Versión 1.4 Descarga Directa</p>
        
        <?php if ($message): ?>
            <div class="alert <?= $error ? 'alert-error' : 'alert-success' ?>">
                <?= $message ?>
            </div>
        <?php endif; ?>

        <form method="post">
            <input type="hidden" name="action" value="export">
            <button type="submit" class="btn btn-export">DESCARGAR BACKUP (.SQL)</button>
        </form>

        <hr>

        <form method="post" enctype="multipart/form-data">
            <input type="hidden" name="action" value="import">
            <label>Subir archivo SQL para restaurar:</label>
            <input type="file" name="sql_file" required>
            <button type="submit" class="btn btn-import">RESTAURAR BASE DE DATOS</button>
        </form>
    </div>
</body>
</html>
