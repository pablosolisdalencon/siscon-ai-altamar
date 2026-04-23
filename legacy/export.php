<?php
$enlace = "docs/tmp_export.csv"; 
header ("Content-Disposition: attachment; filename=tmp_export.csv"); 
header ("Content-Type: application/octet-stream");
header ("Content-Length: ".filesize($enlace));
readfile($enlace);
?>
