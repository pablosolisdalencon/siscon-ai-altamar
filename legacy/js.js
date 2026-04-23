// CREA UN OBJETO AJAX PARA CARGA ASINCRONA DE PAGINAS DENTRO DE UN DIV
function objetoAjax() {
	var xmlhttp = false;
	try {
		xmlhttp = new ActiveXObject("Msxml2.XMLHTTP");
	} catch (e) {
		try {
			xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
		} catch (E) {
			xmlhttp = false;
		}
	}

	if (!xmlhttp && typeof XMLHttpRequest != 'undefined') {
		xmlhttp = new XMLHttpRequest();
	}
	return xmlhttp;
}

// CARGA UNA PAGINA EN UN DIV MEDIANTE OBJETO AJAX
function ver(link, div) {
	divResultado = top.document.getElementById(div);
	ajax = objetoAjax();
	ajax.open("GET", link);
	ajax.onreadystatechange = function () {
		if (ajax.readyState == 4) {
			divResultado.innerHTML = ajax.responseText
		}
	}
	ajax.send(null);
	/*location.href="/";*/
}


// MUESTRA EL DETALLE EN TABLAS DE EMPRESAS
function detalle(id) {
	document.getElementById('cliente_' + id).style.display = 'block';
	document.getElementById('tr_' + id).style.background = '#819FF7';

	document.getElementById('proveedor_' + id).style.display = 'block';
}


// OCULTA EL DETALLE EN TABLAS DE EMPRESAS
function hdetalle(id) {
	document.getElementById('cliente_' + id).style.display = 'none';
	document.getElementById('tr_' + id).style.background = '#ddd';
}

// PREGUNTA PARA CONFIRMAR ELIMINACION DE ITEMS EN BD
function preguntar(dato, item) {
	confirmar = confirm("Eliminar? " + item + " id=" + dato);
	if (confirmar)
		//Aquí pones lo que quieras si da a Aceptar 
		ver(item + "s.php?del=1&id=" + dato, "main");
	else
		//Aquí pones lo que quieras Cancelar 
		nada
}



// FILTRADO EN SECCION VENTAS
function filtrar(FiltrO, ValoR) {
	/* Set value of input actioner */
	if (FiltrO == "fvfd") {
		document.getElementById("fvfh").value = ValoR;
	}
	if (FiltrO == "f_pagado") {
		document.getElementById("f_pagado_s").value = ValoR;
	}


	/* Get All Form Values*/
	estado = top.document.getElementById("estado").value;
	fvfd = top.document.getElementById("fvfd").value;
	fvfh = top.document.getElementById("fvfh").value;
	fcr = top.document.getElementById("fcr").value;
	f_pagado = top.document.getElementById("f_pagado_s").value;


	f_cot = top.document.getElementById("f_cot").value;
	f_fac = top.document.getElementById("f_fac").value;

	/* Debug */
	/*alert("FiltrO: "+FiltrO+"  |  ValoR:"+ValoR+"   -->fcr:"+fcr+" fvfd:"+fvfd+" fvfh:"+fvfh);
	
		/* Pass Data By GET Linked to main div */

	loadVentas("ventas.php?estado=" + estado + "&f_fac=" + f_fac + "&f_cot=" + f_cot + "&fcr=" + fcr + "&fvfd=" + fvfd + "&fvfh=" + fvfh + "&f_pagado=" + f_pagado, "main");


}

// FILTRADO EN SECCION F-COBROS
function f_filtrar(FiltrO, ValoR) {
	/* Set value of input actioner */
	if (FiltrO == "fvfd") {
		document.getElementById("fvfh").value = ValoR;
	}
	if (FiltrO == "f_pagado") {
		document.getElementById("f_pagado_s").value = ValoR;
	}

	/* Get All Form Values*/
	estado = top.document.getElementById("estado").value;
	fvfd = top.document.getElementById("fvfd").value;
	fvfh = top.document.getElementById("fvfh").value;
	fcr = top.document.getElementById("fcr").value;
	f_pagado = top.document.getElementById("f_pagado_s").value;


	f_cot = top.document.getElementById("f_cot").value;
	f_fac = top.document.getElementById("f_fac").value;


	/* Pass Data By GET Linked to main div */

	loadVentas("f-cobros.php?estado=" + estado + "&f_fac=" + f_fac + "&f_cot=" + f_cot + "&fcr=" + fcr + "&fvfd=" + fvfd + "&fvfh=" + fvfh + "&f_pagado=" + f_pagado, "main");


}


// FILTRADO EN SECCION COBROS
function filtrar_cobros(FiltrO, ValoR) {
	/* Set value of input actioner */
	if (FiltrO == "fvfd") {
		document.getElementById("fvfh").value = ValoR;
	}

	if (FiltrO != "all") {
		document.getElementById(FiltrO).value = ValoR;
	} else {
		if (ValoR == "fecha_pago") {
			top.document.getElementById("f_fecha_pago").value = "1";
			top.document.getElementById("f_fecha_entrega").value = "0";
		}
		if (ValoR == "fecha_entrega") {
			top.document.getElementById("f_fecha_pago").value = "0";
			top.document.getElementById("f_fecha_entrega").value = "1";
		}
	}
	/* Get All Form Values*/

	/* ORDER */
	f_fecha_pago = top.document.getElementById("f_fecha_pago").value;
	f_fecha_entrega = top.document.getElementById("f_fecha_entrega").value;


	estado = top.document.getElementById("estado").value;
	fvfd = top.document.getElementById("fvfd").value;
	fvfh = top.document.getElementById("fvfh").value;
	fcr = top.document.getElementById("fcr").value;

	f_cot = top.document.getElementById("f_cot").value;
	f_fac = top.document.getElementById("f_fac").value;

	/* Debug */
	/*alert("FiltrO: "+FiltrO+"  |  ValoR:"+ValoR+"   -->fcr:"+fcr+" fvfd:"+fvfd+" fvfh:"+fvfh);
	
		/* Pass Data By GET Linked to main div */

	ver("cobros.php?f_fecha_pago=" + f_fecha_pago + "&f_fecha_entrega=" + f_fecha_entrega + "&estado=" + estado + "&f_fac=" + f_fac + "&f_cot=" + f_cot + "&fcr=" + fcr + "&fvfd=" + fvfd + "&fvfh=" + fvfh, "main");


}


// ACTUALIZA LAS VENTAS EN LINEA
function update_venta(id) {

	n_factura = document.getElementById("n_factura" + id).value;
	fecha = document.getElementById("fecha" + id).value;
	fecha_entrega = document.getElementById("fecha_entrega" + id).value;
	fecha_pago = document.getElementById("fecha_pago" + id).value;
	id_cliente = document.getElementById("id_cliente" + id).value;
	razon = document.getElementById("razon" + id).value;
	item = document.getElementById("item" + id).value;
	detalle = document.getElementById("detalle" + id).value;
	monto = document.getElementById("monto" + id).value;
	iva = document.getElementById("iva" + id).value;
	total = document.getElementById("total" + id).value;

	/*alert("n_factura:"+n_factura+" monto:"+monto);*/
}



// ACTUALIZA LAS VENTAS en BD
function update(id) {

	loadVentas("ventas.php?u=1&ul=1&id=" + id, "update_view");
}



// REALIZA LOS CALCULOS EN LINEA DE EL MONTO/IVA/TOTAL
function calcular(id) {
	var str = "" + id + "---";
	var THEID = str.substring(0, 3);
	if (THEID == "und") {
		id = "";
	}
	/* DEBUG alert("THEID:"+THEID+" id:"+id); */
	monto = document.getElementById("monto" + id).value;
	iva = monto * 0.19;
	total = parseFloat(monto) + parseFloat(iva);
	pretotal = total * 1;
	miTotal = Math.round(pretotal);
	miIva = Math.round(iva);


	document.getElementById("iva" + id).value = miIva;
	document.getElementById("total" + id).value = miTotal;

}

// MUESTRA LA VISUALIZACION DEL MAIL DE COBRO
function view_mail_cobro(id) {
	document.getElementById("pre_mail_cobro_" + id).style.display = "block";
}

// OCULTA LA VISUALIZACION DEL MAIL DE COBRO
function hidde_mail_cobro(id) {
	document.getElementById("pre_mail_cobro_" + id).style.display = "none";
}

// ENVIA EL MAIL DE F-COBRO
function send_mail_cobro(id, pagado) {

	/* ORDER */

	estado = document.getElementById("estado").value;
	fvfd = document.getElementById("fvfd").value;
	fvfh = document.getElementById("fvfh").value;
	fcr = document.getElementById("fcr").value;
	f_pagado = pagado;
	f_cot = document.getElementById("f_cot").value;
	f_fac = document.getElementById("f_fac").value;

	/* Debug */
	/*alert("FiltrO: "+FiltrO+"  |  ValoR:"+ValoR+"   -->fcr:"+fcr+" fvfd:"+fvfd+" fvfh:"+fvfh);
	
		/* Pass Data By GET Linked to main div */
	alert("f-cobros.php?confirm_cobro=" + id + "&estado=" + estado + "&f_fac=" + f_fac + "&f_cot=" + f_cot + "&fcr=" + fcr + "&fvfd=" + fvfd + "&fvfh=" + fvfh + "&f_pagado=" + f_pagado);
	ver("f-cobros.php?confirm_cobro=" + id + "&estado=" + estado + "&f_fac=" + f_fac + "&f_cot=" + f_cot + "&fcr=" + fcr + "&fvfd=" + fvfd + "&fvfh=" + fvfh + "&f_pagado=" + f_pagado, "main");
}

// DEBUG EN CONSOLA VIRTUAL
function ConsoleLog(msj) {
	plog = document.getElementById("log_console").innerHTML;
	mylog = "<span> > " + msj + "</span><br>" + plog;
	document.getElementById("log_console").innerHTML = mylog;
}



// CARGA LA PAGINA VENTAS Y LLAMA  A LA FUNCOIN DE ORDENADO DE TABLA
function loadVentas(link, div) {
	divResultado = top.document.getElementById(div);
	ajax = objetoAjax();
	ajax.open("GET", link);
	ajax.onreadystatechange = function () {
		if (ajax.readyState == 4) {
			divResultado.innerHTML = ajax.responseText;
			StartSorter();
		}
	}
	ajax.send(null)
	parent.log.location.href = "index.html";

}


// INICIA LA FUNCIONALIDAD DE ORDEN DE TABLA
function StartSorter() {

	$(document).ready(function () {
		$("#myTable").tablesorter();
	}
	);
}
function f_EditCliente(id, step) {
	if (step === 0) {
		top.document.getElementById('f-console').style.display = "block";
		ver('clientes.php?f=0&u=1&id=' + id, 'f-console');
	} else if (step == 1) {
		top.document.getElementById('f-console').style.display = "none";
		f_filtrar();
	}

}
function f_EditVenta(id, step) {
	/*alert("testing:edit venta "+id+" step"+step );*/
	if (step === 0) {
		top.document.getElementById('f-console').style.display = "block";
		ver('ventas.php?f=0&u=1&ul=1&id=' + id, 'f-console');
	} else if (step == 1) {
		top.document.getElementById('f-console').style.display = "none";
		f_filtrar();
	}
}
function update_estado_venta(id, estado, color) {

	var ccolor = color.replace("#", "");
	var eestado = estado.replace(" ", "-magic-");
	link = "mods/estados_venta.php?mode=update&id=" + id + "&estado=" + eestado + "&color=" + ccolor;
	/*alert("error en javascript: "+link);*/
	ver(link, "sub-main");
}
function update_registros_venta(cantidad) {

	link = "mods/registros_ventas.php?mode=update&id=0&cantidad=" + cantidad;
	/*alert("error en javascript: "+link);*/
	ver(link, "sub-main");
}
function delete_estado_venta(id) {
	link = "mods/estados_venta.php?mode=del&id=" + id;
	/*alert("error en javascript: "+link);*/
	ver(link, "sub-main");
}