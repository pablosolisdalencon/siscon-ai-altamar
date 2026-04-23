---
description: Multi-Agent App Factory (MAF) - Workflow de desarrollo de apps punta a punta.
---

# Workflow: Multi-Agent App Factory (MAF)

Este flujo de trabajo coordina múltiples roles especializados para llevar una idea de app desde la investigación de mercado hasta el marketing viral.

## Fases y Comandos

### 1. /maf-scout (Investigación Activa)
**Agente**: [⚙️ INVOCANDO SKILL: maf_scout]
**Tarea**: Investigar nichos en alta demanda y extraer oportunidades.
**Protocolo**: [scout_protocol.md](file:///C:/Users/pablo/.gemini/antigravity/brain/58d6707d-a53f-4ba6-a2ee-04a7787cc2bc/protocols/scout_protocol.md)
**Input**: Tendencias globales 2024-2025.
**Output**: `market_discovery.md`

### 2. /maf-spec (Especialista de Producto)
**Agente**: [⚙️ INVOCANDO SKILL: maf_product]
**Tarea**: Investigar el nicho elegido, identificar pros/contras y generar lista de funcionalidades "killer".
**Protocolo**: [specialist_protocol.md](file:///C:/Users/pablo/.gemini/antigravity/brain/58d6707d-a53f-4ba6-a2ee-04a7787cc2bc/protocols/specialist_protocol.md)
**Input**: Un nicho de `market_discovery.md`.
**Output**: `product_blueprint.md`

### 3. /maf-ux (Arquitecto de Experiencia)
**Agente**: [⚙️ INVOCANDO SKILL: maf_ux]
**Tarea**: Diseñar la UX completa basada en las funcionalidades.
**Protocolo**: [ux_protocol.md](file:///C:/Users/pablo/.gemini/antigravity/brain/58d6707d-a53f-4ba6-a2ee-04a7787cc2bc/protocols/ux_protocol.md)
**Input**: `product_blueprint.md`.
**Output**: `ux_design.md`

### 4. /maf-agile (Planificación Agile)
**Agente**: [⚙️ INVOCANDO SKILL: maf_agile]
**Tarea**: Planificar sprints, épicas y tareas.
**Protocolo**: [agile_protocol.md](file:///C:/Users/pablo/.gemini/antigravity/brain/58d6707d-a53f-4ba6-a2ee-04a7787cc2bc/protocols/agile_protocol.md)
**Input**: `ux_design.md` + Contexto de producto.
**Output**: `sprint_plan.md`

### 5. /maf-engine (Ejecución)
**Agente**: Architect Node (Engineering Core)
**Tarea**: Implementar el código base siguiendo el sprint plan.
**Output**: Código fuente funcional.

### 6. /maf-ops (Despliegue)
**Agente**: DevOps Sentinel
**Tarea**: Preparar y ejecutar el despliegue (Vercel, Netlify, Cloud).
**Output**: URL de producción.

### 7. /maf-growth (Marketing Viral)
**Agente**: Growth Node
**Tarea**: Generar campañas de marketing y programar en Meta/RRSS.
**Protocolo**: [growth_protocol.md](file:///C:/Users/pablo/.gemini/antigravity/brain/58d6707d-a53f-4ba6-a2ee-04a7787cc2bc/protocols/growth_protocol.md)
**Output**: `marketing_strategy.md`

---

## Cómo usar este flujo
1. El usuario invoca `/maf-scout` para iniciar el ciclo.
2. Tras la revisión de cada output, se invoca el siguiente comando.
3. El **Master Orchestrator** mantiene la persistencia del contexto entre fases.
