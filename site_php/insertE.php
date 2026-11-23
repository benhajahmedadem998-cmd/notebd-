<?php
require_once('auth.php');
require_once('connect.inc.php');
exigerProf();

// Requête préparée PDO avec bindParam() et exécutions multiples (Chapitre 5)
$sql = 'INSERT IGNORE INTO epreuve (numepreuve, datepreuve, Lieu, type_eval, codemat)
        VALUES (:numepreuve, :datepreuve, :lieu, :type_eval, :codemat)';

$stmt = $dbh->prepare($sql);
$stmt->bindParam(':numepreuve', $numepreuve, PDO::PARAM_INT);
$stmt->bindParam(':datepreuve', $datepreuve);
$stmt->bindParam(':lieu', $lieu);
$stmt->bindParam(':type_eval', $typeEval);
$stmt->bindParam(':codemat', $codemat);

$epreuvesCours = [
    [11031, '2026-02-15', 'Salle 191L', 'DS',     'STA'],
    [11032, '2026-04-01', 'Amphi G',    'Examen', 'STA'],
    [21031, '2026-01-30', 'Salle 191L', 'DS',     'INF'],
    [21032, '2026-06-01', 'Salle 192L', 'Examen', 'INF'],
    [31030, '2026-06-02', 'Salle 05R',  'TP',     'ECO'],
];

foreach ($epreuvesCours as [$numepreuve, $datepreuve, $lieu, $typeEval, $codemat]) {
    $stmt->execute();
}

rediriger('afficheE.php?msg=added');
