-- SCRIPT DE ACTUALIZACIÓN SISCON-AI (VERSION LEGACY COMPATIBLE)
-- Este script adapta la base de datos legacy para el nuevo sistema SISCON-AI
-- Se utiliza CHARSET=latin1 para máxima compatibilidad con el esquema existente.

-- 1. Actualización de tabla 'ventas'
-- Nota: Si los campos ya existen, el script podría dar un error que puede ignorarse.
ALTER TABLE `ventas` ADD `comicion` FLOAT DEFAULT 0;
ALTER TABLE `ventas` ADD `id_agente` INT DEFAULT NULL;

-- 2. Actualización de tabla 'usuarios'
ALTER TABLE `usuarios` ADD `role` VARCHAR(255) DEFAULT 'user';
ALTER TABLE `usuarios` ADD `comicion` FLOAT DEFAULT 0;

-- 3. Creación de tabla 'agentes'
CREATE TABLE IF NOT EXISTS `agentes` (
  `id_agente` int(11) NOT NULL AUTO_INCREMENT,
  `nombre` varchar(255) NOT NULL,
  `rut` varchar(255) DEFAULT NULL,
  `mail` varchar(255) DEFAULT NULL,
  `fono` varchar(255) DEFAULT NULL,
  `comision_default` float DEFAULT 0,
  PRIMARY KEY (`id_agente`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- 4. Creación de tabla 'configuraciones'
CREATE TABLE IF NOT EXISTS `configuraciones` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `clave` varchar(255) NOT NULL,
  `valor` text DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `clave` (`clave`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- 5. Insertar configuración por defecto
INSERT IGNORE INTO `configuraciones` (`clave`, `valor`) VALUES ('cantidad de registros ventas', '100');
INSERT IGNORE INTO `configuraciones` (`clave`, `valor`) VALUES ('system_name', 'SISCON-AI Altamar');

-- Fin del script.
