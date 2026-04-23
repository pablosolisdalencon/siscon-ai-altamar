---
description: Generador masivo autónomo de requerimientos y estudio de mercado para todas las aplicaciones (Mass Requirements Factory)
---

# Workflow: Generador Autónomo de Requerimientos (Mass Requirements Factory)

Este workflow está diseñado para ser ejecutado por un agente de IA. Su objetivo es leer el manifiesto del ecosistema (`d:\EPIC\eric\README.md`), iterar autónomamente sobre TODAS las aplicaciones listadas en el documento y crear la documentación fundacional basándose en investigación web en tiempo real.

## Pre-requisitos
Asegurarse de que exista el directorio base donde se guardará la documentación:
`d:\EPIC\eric\ARTEFACTOS\REQUERIMIENTOS`

## Paso 1: Extracción del Listado
Lee detenidamente la tabla de aplicaciones presente en `d:\EPIC\eric\README.md`. Almacena en memoria el nombre y la descripción de cada una de forma ordenada.

## Paso 2: Iteración Autónoma por Aplicación
Para cada aplicación listada, ejecuta secuencialmente los siguientes sub-pasos. **Debes iterar autónomamente aplicación por aplicación**.

### Sub-paso A: Estudio de Mercado e Identificación de Funcionalidades
1. **Estudio de Mercado:** Emplea herramientas de búsqueda web (`search_web`) o tu base de conocimiento profunda para investigar competidores directos en el nicho de la aplicación. Considera los líderes globales y locales.
2. **Top 5 Populares (Core):** Analizando a las 10 aplicaciones más exitosas de ese tipo, abstrae e identifica las 5 funcionalidades fundamentales e imprescindibles que soportan su éxito de mercado.
3. **Top 5 Nicho / Ausentes (Gaps):** Investiga foros (Reddit, App Store reviews, Twitter) y tendencias para encontrar las 5 peticiones, problemas o funcionalidades abstractas que los usuarios más exigen en ese tipo de aplicaciones pero que aún no se cubren satisfactoriamente por ninguna herramienta del mercado actual.
4. **Generación de Artefacto 1:** Genera el documento de investigación combinando ambos estudios. Debe ser escrito obligatoriamente en la ruta `d:\EPIC\eric\ARTEFACTOS\REQUERIMIENTOS\estudioMercado[NombreApp].md`.

### Sub-paso B: Ingeniería de Producto (10 Funcionalidades)
1. Toma el sub-conjunto exacto de las 10 funcionalidades consolidadas anteriormente (5 Populares + 5 Gaps).
2. Para cada una de las 10 funcionalidades, investiga e idea la metodología UX y estrategia de abordaje de diseño que otorgue el resultado más satisfactorio y fluido.
3. Estructura y desarrolla, para cada funcionalidad, los siguientes apartados:
    * **Requerimiento específico** (Definición técnica abstracta).
    * **Reglas de negocio** (Limitaciones, roles, transacciones y lógica de estado).
    * **Historias de usuario** (De acuerdo a estándar "Como [Rol], Quiero [Acción], Para [Valor]").
    * **Propuesta Gráfica / UX** (Descripción descriptiva de la interfaz, flujos en pantalla, componentes Tailwind/shadcn sugeridos).
4. **Generación de Artefacto 2:** Alimenta esta data al sistema creando o sobreescribiendo el documento en la ruta `d:\EPIC\eric\ARTEFACTOS\REQUERIMIENTOS\requerimientos[NombreApp].md`.

## Fin de Iteración
El ciclo se repite hasta completar la última aplicación del listado original, entregando finalmente 2 documentos markdown sumamente detallados por cada plataforma en la carpeta ARTEFACTOS.
