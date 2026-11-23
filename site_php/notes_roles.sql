-- Script de mise à jour non-destructif pour une base "notes" déjà existante
-- Préserve toutes les données des étudiants, matières, épreuves et notes.
-- (Pour une nouvelle installation vide, importez simplement notes.sql)
USE `notes`;

ALTER TABLE `utilisateurs`
  ADD COLUMN IF NOT EXISTS `role` VARCHAR(20) NOT NULL DEFAULT 'prof',
  ADD COLUMN IF NOT EXISTS `numetu` INT DEFAULT NULL;

ALTER TABLE `etudiant`
  ADD COLUMN IF NOT EXISTS `cin` VARCHAR(20) DEFAULT NULL AFTER `numetu`,
  ADD COLUMN IF NOT EXISTS `email` VARCHAR(150) DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS `telephone` VARCHAR(30) DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS `sexe` VARCHAR(20) DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS `departement` VARCHAR(100) DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS `specialite` VARCHAR(120) DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS `classe` VARCHAR(50) DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS `annee_univ` VARCHAR(20) DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS `photo` VARCHAR(255) DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS `profil_complete` TINYINT(1) NOT NULL DEFAULT 0;

ALTER TABLE `epreuve`
  ADD COLUMN IF NOT EXISTS `type_eval` VARCHAR(20) NOT NULL DEFAULT 'Examen' AFTER `Lieu`;

-- =========================================================================
-- SUPPRESSION OPTIONNELLE DES COLONNES "niveau" (APRÈS VÉRIFICATION)
-- Décommentez et exécutez les 2 blocs suivants uniquement après avoir
-- sauvegardé votre base et vérifié qu'aucun autre outil n'utilise `niveau`.
-- Aucune donnée d'étudiant, de matière ni de note ne sera perdue.
-- =========================================================================
-- ALTER TABLE `matiere`
--   DROP INDEX IF EXISTS `idx_matiere_niveau`,
--   DROP COLUMN IF EXISTS `niveau`;
--
-- ALTER TABLE `etudiant`
--   DROP INDEX IF EXISTS `idx_etudiant_niveau`,
--   DROP COLUMN IF EXISTS `niveau`;

INSERT IGNORE INTO `matiere` (`codemat`, `libelle`, `coef`) VALUES
('STA', 'Statistique',       0.4),
('INF', 'Informatique',      0.4),
('ECO', 'Econométrie',       0.2),
('ALG', 'Algorithmique',     0.5),
('MAT', 'Mathématiques',     0.5),
('CPT', 'Comptabilité',      0.5),
('WEB', 'Développement Web', 0.5),
('RES', 'Réseaux Avancés',   0.5),
('SEC', 'Sécurité SI',       0.5);

UPDATE `epreuve` SET `type_eval` = 'DS'     WHERE `numepreuve` IN (11031, 21031);
UPDATE `epreuve` SET `type_eval` = 'Examen' WHERE `numepreuve` IN (11032, 21032);
UPDATE `epreuve` SET `type_eval` = 'TP'     WHERE `numepreuve` = 31030;

INSERT IGNORE INTO `epreuve` (`numepreuve`, `datepreuve`, `Lieu`, `type_eval`, `codemat`) VALUES
(50001, '2026-02-10', 'Salle 101',   'DS',     'ALG'),
(50002, '2026-04-12', 'Salle 102',   'Examen', 'ALG'),
(50003, '2026-03-18', 'Amphi A',     'DS',     'MAT'),
(31031, '2026-05-14', 'Salle 08R',   'Examen', 'CPT'),
(21033, '2026-05-20', 'Labo Web 2',  'TP',     'WEB'),
(41001, '2026-03-25', 'Labo Réseau', 'DS',     'RES'),
(41002, '2026-05-28', 'Amphi B',     'Examen', 'SEC');

INSERT INTO `etudiant`
(`numetu`, `cin`, `nom`, `prenom`, `email`, `telephone`, `datenaiss`, `sexe`, `departement`, `specialite`, `classe`, `annee_univ`, `rue`, `cp`, `ville`, `profil_complete`) VALUES
(1001, '09841001', 'Ben Ali',  'Youssef', 'youssef.benali@isetjb.rnu.tn',  '+216 22 410 101', '2004-03-14', 'Masculin', "Technologies de l'Informatique", "DSI — Développement des Systèmes d'Information", 'DSI-1', '2025-2026', 'Avenue Habib Bourguiba', 4180, 'Houmt Souk', 1),
(1002, '09841002', 'Trabelsi', 'Meriem',  'meriem.trabelsi@isetjb.rnu.tn', '+216 55 318 204', '2004-09-22', 'Féminin',  "Technologies de l'Informatique", 'MDW — Multimédia et Développement Web',         'MDW-1', '2025-2026', 'Route de Midoun',        4116, 'Midoun',     1),
(1003, '09841003', 'Gharbi',   'Ahmed',   'ahmed.gharbi@isetjb.rnu.tn',    '+216 98 612 309', '2003-11-05', 'Masculin', "Technologies de l'Informatique", 'RSI — Réseaux et Systèmes Informatiques',       'RSI-2', '2025-2026', 'Rue de la Liberté',      4180, 'Houmt Souk', 1),
(1004, '09841004', 'Jaziri',   'Salma',   'salma.jaziri@isetjb.rnu.tn',    '+216 29 740 412', '2005-01-19', 'Féminin',  'Sciences Économiques et Gestion', 'CF — Comptabilité et Finance',                 'CF-1',  '2025-2026', 'Zone Touristique',       4116, 'Ajim',       0),
(1005, '09841005', 'Mansouri', 'Ines',    'ines.mansouri@isetjb.rnu.tn',   '+216 24 815 505', '2006-06-08', 'Féminin',  "Technologies de l'Informatique", "Tronc Commun — Technologies de l'Informatique", 'TI-1',  '2025-2026', 'Route de l\'Aéroport',   4180, 'Houmt Souk', 1)
ON DUPLICATE KEY UPDATE
  `cin` = COALESCE(`cin`, VALUES(`cin`)),
  `email` = COALESCE(`email`, VALUES(`email`)),
  `telephone` = COALESCE(`telephone`, VALUES(`telephone`)),
  `sexe` = COALESCE(`sexe`, VALUES(`sexe`)),
  `departement` = COALESCE(`departement`, VALUES(`departement`)),
  `specialite` = COALESCE(`specialite`, VALUES(`specialite`)),
  `classe` = COALESCE(`classe`, VALUES(`classe`)),
  `annee_univ` = COALESCE(`annee_univ`, VALUES(`annee_univ`));

INSERT IGNORE INTO `notation` (`numetu`, `numepreuve`, `note`) VALUES
(1001, 21031, 15.50),
(1001, 21032, 17.00),
(1001, 11031, 13.00),
(1001, 11032, 14.50),
(1001, 31030, 16.00),
(1002, 21031, 18.00),
(1002, 21032, 16.50),
(1002, 11031, 15.00),
(1002, 31030, 17.50),
(1003, 41001, 12.50),
(1003, 41002, 11.00),
(1004, 31031, 12.50),
(1004, 21033, 14.00),
(1005, 50001, 15.00),
(1005, 50002, 16.50),
(1005, 50003, 14.00);

INSERT INTO `utilisateurs` (`login`, `mot_de_passe`, `role`, `numetu`) VALUES
('prof',    'prof123', 'prof',     NULL),
('youssef', 'etu123',  'etudiant', 1001),
('meriem',  'etu123',  'etudiant', 1002),
('ahmed',   'etu123',  'etudiant', 1003),
('salma',   'etu123',  'etudiant', 1004),
('ines',    'etu123',  'etudiant', 1005)
ON DUPLICATE KEY UPDATE
  `mot_de_passe` = VALUES(`mot_de_passe`),
  `role` = VALUES(`role`),
  `numetu` = VALUES(`numetu`);
