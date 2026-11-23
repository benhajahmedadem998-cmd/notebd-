<?php
// Script de jeu de données initial (accessible uniquement connecté)
require_once('auth.php');
include('connect.inc.php');
$stmt = $db->prepare("INSERT IGNORE INTO epreuve (numepreuve, datepreuve, Lieu, codemat) VALUES (:n, :d, :l, :c)");
foreach ([
    [11031, '2003-12-15', 'Salle 191L', 'STA'],
    [11032, '2004-04-01', 'Amphi G', 'STA'],
    [21031, '2003-10-30', 'Salle 191L', 'INF'],
    [21032, '2004-06-01', 'Salle 192L', 'INF'],
    [31030, '2004-06-02', 'Salle 05R', 'ECO'],
] as $p) {
    $stmt->execute([':n' => $p[0], ':d' => $p[1], ':l' => $p[2], ':c' => $p[3]]);
}
header("Location: afficheE.php?msg=added");
exit();
