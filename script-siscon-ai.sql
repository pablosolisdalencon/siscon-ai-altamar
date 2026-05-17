-- SCRIPT DE ACTUALIZACIÓN SISCON-AI (VERSION LEGACY COMPATIBLE)
-- Este script adapta la base de datos legacy para el nuevo sistema SISCON-AI
-- Se utiliza CHARSET=latin1 para máxima compatibilidad con el esquema existente.

-- 1. Actualización de tabla 'ventas' (Ya aplicadas)
-- ALTER TABLE `ventas` ADD `comicion` FLOAT DEFAULT 0;
-- ALTER TABLE `ventas` ADD `id_agente` INT DEFAULT NULL;

-- 2. Actualización de tabla 'usuarios' (Ya aplicadas)
-- ALTER TABLE `usuarios` ADD `role` VARCHAR(255) DEFAULT 'user';
-- ALTER TABLE `usuarios` ADD `comicion` FLOAT DEFAULT 0;

-- 3. Eliminación de tabla 'agentes' (Legacy)
DROP TABLE IF EXISTS `agentes`;

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

-- 6. Limpieza y Configuración de Usuarios (Ajuste estricto)
-- Eliminar a cualquier usuario que no sea carlos o psolis
DELETE FROM `usuarios` WHERE `user` NOT IN ('carlos', 'psolis');

-- Asegurar que carlos es admin
UPDATE `usuarios` SET `role` = 'admin', `comicion` = 0 WHERE `user` = 'carlos';

-- Asegurar que psolis existe y es agente (se inserta si no existe)
INSERT IGNORE INTO `usuarios` (`user`, `pass`, `mail`, `role`, `comicion`) VALUES ('psolis', 'CometaHalley.,2026', 'pablo.solis.dalencon@gmail.com', 'agente', 25);

-- Fin del script.
