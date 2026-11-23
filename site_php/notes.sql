CREATE DATABASE IF NOT EXISTS `notes` CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;
USE `notes`;

CREATE TABLE IF NOT EXISTS `matiere` (
    `codemat` VARCHAR(3) NOT NULL,
    `libelle` VARCHAR(20) NOT NULL,
    `coef` FLOAT NOT NULL,
    PRIMARY KEY (`codemat`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE IF NOT EXISTS `epreuve` (
    `numepreuve` INT NOT NULL,
    `datepreuve` DATE DEFAULT NULL,
    `Lieu` VARCHAR(100) DEFAULT NULL,
    `type_eval` VARCHAR(20) NOT NULL DEFAULT 'Examen',
    `codemat` VARCHAR(3) NOT NULL,
    PRIMARY KEY (`numepreuve`),
    KEY `fk_epreuve_matiere` (`codemat`),
    CONSTRAINT `fk_epreuve_matiere` FOREIGN KEY (`codemat`) REFERENCES `matiere` (`codemat`)
        ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE IF NOT EXISTS `etudiant` (
    `numetu` INT NOT NULL,
    `cin` VARCHAR(20) DEFAULT NULL,
    `nom` VARCHAR(100) NOT NULL,
    `prenom` VARCHAR(100) NOT NULL,
    `email` VARCHAR(150) DEFAULT NULL,
    `telephone` VARCHAR(30) DEFAULT NULL,
    `datenaiss` DATE DEFAULT NULL,
    `sexe` VARCHAR(20) DEFAULT NULL,
    `departement` VARCHAR(100) DEFAULT NULL,
    `specialite` VARCHAR(120) DEFAULT NULL,
    `classe` VARCHAR(50) DEFAULT NULL,
    `annee_univ` VARCHAR(20) DEFAULT NULL,
    `rue` VARCHAR(255) DEFAULT NULL,
    `cp` INT DEFAULT NULL,
    `ville` VARCHAR(100) DEFAULT NULL,
    `photo` VARCHAR(255) DEFAULT NULL,
    `profil_complete` TINYINT(1) NOT NULL DEFAULT 0,
    PRIMARY KEY (`numetu`),
    UNIQUE KEY `uk_etudiant_cin` (`cin`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE IF NOT EXISTS `notation` (
    `numetu` INT NOT NULL,
    `numepreuve` INT NOT NULL,
    `note` FLOAT DEFAULT NULL,
    PRIMARY KEY (`numetu`, `numepreuve`),
    KEY `fk_notation_epreuve` (`numepreuve`),
    CONSTRAINT `fk_notation_epreuve` FOREIGN KEY (`numepreuve`) REFERENCES `epreuve` (`numepreuve`)
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT `fk_notation_etudiant` FOREIGN KEY (`numetu`) REFERENCES `etudiant` (`numetu`)
        ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE IF NOT EXISTS `utilisateurs` (
    `id` INT NOT NULL AUTO_INCREMENT,
    `login` VARCHAR(50) NOT NULL,
    `mot_de_passe` VARCHAR(255) NOT NULL,
    `role` VARCHAR(20) NOT NULL DEFAULT 'prof',
    `numetu` INT DEFAULT NULL,
    PRIMARY KEY (`id`),
    UNIQUE KEY `login` (`login`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

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

INSERT IGNORE INTO `epreuve` (`numepreuve`, `datepreuve`, `Lieu`, `type_eval`, `codemat`) VALUES
(11031, '2026-02-15', 'Salle 191L',  'DS',     'STA'),
(11032, '2026-04-01', 'Amphi G',     'Examen', 'STA'),
(21031, '2026-01-30', 'Salle 191L',  'DS',     'INF'),
(21032, '2026-06-01', 'Salle 192L',  'Examen', 'INF'),
(31030, '2026-06-02', 'Salle 05R',   'TP',     'ECO'),
(50001, '2026-02-10', 'Salle 101',   'DS',     'ALG'),
(50002, '2026-04-12', 'Salle 102',   'Examen', 'ALG'),
(50003, '2026-03-18', 'Amphi A',     'DS',     'MAT'),
(31031, '2026-05-14', 'Salle 08R',   'Examen', 'CPT'),
(21033, '2026-05-20', 'Labo Web 2',  'TP',     'WEB'),
(41001, '2026-03-25', 'Labo Réseau', 'DS',     'RES'),
(41002, '2026-05-28', 'Amphi B',     'Examen', 'SEC');

INSERT IGNORE INTO `etudiant`
(`numetu`, `cin`, `nom`, `prenom`, `email`, `telephone`, `datenaiss`, `sexe`, `departement`, `specialite`, `classe`, `annee_univ`, `rue`, `cp`, `ville`, `photo`, `profil_complete`) VALUES
(1001, '09841001', 'Ben Ali',  'Youssef', 'youssef.benali@isetjb.rnu.tn',  '+216 22 410 101', '2004-03-14', 'Masculin', "Technologies de l'Informatique", "DSI — Développement des Systèmes d'Information", 'DSI-1', '2025-2026', 'Avenue Habib Bourguiba', 4180, 'Houmt Souk', NULL, 1),
(1002, '09841002', 'Trabelsi', 'Meriem',  'meriem.trabelsi@isetjb.rnu.tn', '+216 55 318 204', '2004-09-22', 'Féminin',  "Technologies de l'Informatique", 'MDW — Multimédia et Développement Web',         'MDW-1', '2025-2026', 'Route de Midoun',        4116, 'Midoun',     NULL, 1),
(1003, '09841003', 'Gharbi',   'Ahmed',   'ahmed.gharbi@isetjb.rnu.tn',    '+216 98 612 309', '2003-11-05', 'Masculin', "Technologies de l'Informatique", 'RSI — Réseaux et Systèmes Informatiques',       'RSI-2', '2025-2026', 'Rue de la Liberté',      4180, 'Houmt Souk', NULL, 1),
(1004, '09841004', 'Jaziri',   'Salma',   'salma.jaziri@isetjb.rnu.tn',    '+216 29 740 412', '2005-01-19', 'Féminin',  'Sciences Économiques et Gestion', 'CF — Comptabilité et Finance',                 'CF-1',  '2025-2026', 'Zone Touristique',       4116, 'Ajim',       NULL, 0),
(1005, '09841005', 'Mansouri', 'Ines',    'ines.mansouri@isetjb.rnu.tn',   '+216 24 815 505', '2006-06-08', 'Féminin',  "Technologies de l'Informatique", "Tronc Commun — Technologies de l'Informatique", 'TI-1',  '2025-2026', 'Route de l\'Aéroport',   4180, 'Houmt Souk', NULL, 1);

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
('admin',   '$2y$10$L1mTNN4Ew2pp302fN1SY9O17q3Y0R87TXib4H.2vqY5p1g0.c4ESO', 'prof', NULL),
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
