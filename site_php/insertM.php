<?php
require_once('auth.php');
require_once('connect.inc.php');
exigerProf();

// Exercice Chapitre 5 (p. 26–27) : requête préparée PDO avec bindParam()
$sql = 'INSERT INTO matiere (codemat, libelle, coef)
        VALUES (:codemat, :libelle, :coef)
        ON DUPLICATE KEY UPDATE libelle = VALUES(libelle), coef = VALUES(coef)';

$stmt = $dbh->prepare($sql);
$stmt->bindParam(':codemat', $codemat);
$stmt->bindParam(':libelle', $libelle);
$stmt->bindParam(':coef', $coef);

$matieresCours = [
    ['STA', 'Statistique',  0.4],
    ['INF', 'Informatique', 0.4],
    ['ECO', 'Econométrie',  0.2],
];

foreach ($matieresCours as [$codemat, $libelle, $coef]) {
    $stmt->execute();
}

rediriger('afficheM.php?msg=added');
