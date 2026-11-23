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
    `codemat` VARCHAR(3) NOT NULL,
    PRIMARY KEY (`numepreuve`),
    KEY `fk_epreuve_matiere` (`codemat`),
    CONSTRAINT `fk_epreuve_matiere` FOREIGN KEY (`codemat`) REFERENCES `matiere` (`codemat`)
        ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE IF NOT EXISTS `etudiant` (
    `numetu` INT NOT NULL,
    `nom` VARCHAR(100) NOT NULL,
    `prenom` VARCHAR(100) NOT NULL,
    `datenaiss` DATE DEFAULT NULL,
    `rue` VARCHAR(255) DEFAULT NULL,
    `cp` INT DEFAULT NULL,
    `ville` VARCHAR(100) DEFAULT NULL,
    PRIMARY KEY (`numetu`)
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
    PRIMARY KEY (`id`),
    UNIQUE KEY `login` (`login`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Compte administrateur : login = admin / mot de passe = admin123 (hash bcrypt)
INSERT INTO `utilisateurs` (`login`, `mot_de_passe`) VALUES
('admin', '$2y$10$L1mTNN4Ew2pp302fN1SY9O17q3Y0R87TXib4H.2vqY5p1g0.c4ESO')
ON DUPLICATE KEY UPDATE `mot_de_passe` = VALUES(`mot_de_passe`);

INSERT IGNORE INTO `matiere` (`codemat`, `libelle`, `coef`) VALUES
('STA', 'Statistique', 0.4), ('INF', 'Informatique', 0.4), ('ECO', 'Econométrie', 0.2);

INSERT IGNORE INTO `epreuve` (`numepreuve`, `datepreuve`, `Lieu`, `codemat`) VALUES
(11031, '2003-12-15', 'Salle 191L', 'STA'),
(11032, '2004-04-01', 'Amphi G', 'STA'),
(21031, '2003-10-30', 'Salle 191L', 'INF'),
(21032, '2004-06-01', 'Salle 192L', 'INF'),
(31030, '2004-06-02', 'Salle 05R', 'ECO');
