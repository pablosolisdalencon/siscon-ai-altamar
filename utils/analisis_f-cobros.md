# Informe Técnico: Análisis de Query y Filtros - `f-cobros.php`

Este documento detalla el análisis del módulo legacy `f-cobros.php`, identificando la estructura de sus consultas a la base de datos, los filtros disponibles y sus limitaciones.

## 1. Query Inicial (Sin Filtros de Usuario)

Aunque el sistema legacy ejecuta la lógica dentro de un bucle por cliente, la consulta conceptual que genera el listado base para cada cliente es la siguiente:

```sql
SELECT *, 
       TO_DAYS(fecha_entrega) - TO_DAYS('[FECHA_ACTUAL]') AS dias, 
       TO_DAYS('[FECHA_ACTUAL]') - TO_DAYS(fecha_pago) AS dias_pago 
FROM ventas 
WHERE n_factura != '0' 
  AND id_cliente = '[ID_CLIENTE_LOOP]' 
ORDER BY id_venta DESC;
```

### Elementos Clave:
- **`n_factura != '0'`**: Es la condición base obligatoria. Si una venta no tiene número de factura asignado, nunca aparecerá en este módulo.
- **`dias`**: Calcula la diferencia entre la fecha de entrega y hoy.
- **`dias_pago`**: Calcula los días transcurridos desde la fecha de pago (Días Vencidos).
- **Orden**: Por defecto, las ventas más recientes (`id_venta DESC`) aparecen primero.

---

## 2. Filtros Posibles y Combinaciones

El módulo construye la cláusula `$FILTRO_SQL` dinámicamente basándose en parámetros `GET`.

### A. Filtros de Venta (Tabla `ventas`)
| Parámetro | Campo SQL | Lógica |
| :--- | :--- | :--- |
| `f_fac` | `n_factura` | Coincidencia exacta. |
| `f_cot` | `n_cot` | Coincidencia exacta. |
| `f_pagado` | `pagado` | Filtra por "SI" o "NO". |
| `estado` | `estado` | Filtra por ID de estado de venta. |

### B. Filtros de Fecha (`fecha`)
La lógica de fechas es excluyente y tiene una jerarquía definida por un `switch(true)`:
1. **Rango Completo**: Si `fvfd` (desde) y `fvfh` (hasta) existen: `BETWEEN '$fvfd' AND '$fvfh'`.
2. **Fecha Única (Desde)**: Si solo existe `fvfd`: `BETWEEN '$fvfd' AND '$fvfd'`.
3. **Fecha Única (Hasta)**: Si solo existe `fvfh`: `BETWEEN '$fvfh' AND '$fvfh'`.
4. **Sin Fecha**: Si ambos están vacíos, aplica `AND fecha != ''`.

### C. Filtro de Cliente
- Se aplica mediante el parámetro `fcr` (Razón Social).
- Si se proporciona, la consulta inicial de clientes se restringe a uno solo: `SELECT * FROM clientes WHERE id_cliente = '$fcr'`.

---

## 3. Limitaciones Identificadas

1. **Exclusión de Factura '0'**: No hay forma de ver registros que no tengan factura, incluso si están pendientes de cobro por otros conceptos (ej: anticipos sin factura aún).
2. **Búsqueda de Cliente Exacta**: El filtro de cliente requiere la razón social exacta para obtener el ID, lo que lo hace menos flexible que una búsqueda parcial (`LIKE`).
3. **Inconsistencia de Fechas**: El filtro de rango de fechas aplica sobre el campo `fecha` (creación de la venta), pero el cálculo de "Días Vencidos" y el ordenamiento opcional aplican sobre `fecha_pago`. Esto puede confundir al usuario al filtrar por un mes y ver días vencidos de otro.
4. **Carga por Bucle**: Al realizar una consulta SQL por cada cliente encontrado, el rendimiento se degrada linealmente con la cantidad de clientes (problema N+1), a diferencia de una sola query con `JOIN`.

---

**Analizado por:** Antigravity AI  
**Fecha de Análisis:** 2026-04-23
