<?php
function GetRand($longitud) {
 $key = '';
 $pattern = '1234567890abcdefghijklmnopqrstuvwxyz';
 $max = strlen($pattern)-1;
 for($i=0;$i < $longitud;$i++) $key .= $pattern{mt_rand(0,$max)};
 return $key;
}
echo('<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml">
 <head>
	<title>SisCon</title>
	<link rel="stylesheet" href="https://use.fontawesome.com/releases/v5.0.13/css/all.css" integrity="sha384-DNOHZ68U8hZfKXOrtjWvjxusGo9WQnrNx2sqG0tfsghAvtVlRW3tvkXWZh58N9jp" crossorigin="anonymous">
	<script type="text/javascript" src="js.js?c='.GetRand(20).'"></script>
	<link rel="stylesheet" href="css.css?c='.GetRand(20).'" />
  <script type="text/javascript" src="js/sortable/jquery-latest.js?c='.GetRand(20).'"></script>
	<script type="text/javascript" src="js/sortable/jquery.tablesorter.js?c='.GetRand(20).'"></script>
 </head>
 <body> 
');
?>