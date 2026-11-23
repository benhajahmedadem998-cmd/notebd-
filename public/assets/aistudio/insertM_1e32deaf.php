<?php
// Script de jeu de données initial (accessible uniquement connecté)
require_once('auth.php');
include('connect.inc.php');
$stmt = $db->prepare("INSERT IGNORE INTO matiere (codemat, libelle, coef) VALUES (:codemat, :libelle, :coef)");
foreach ([['STA', 'Statistique', 0.4], ['INF', 'Informatique', 0.4], ['ECO', 'Econométrie', 0.2]] as $m) {
    $stmt->execute([':codemat' => $m[0], ':libelle' => $m[1], ':coef' => $m[2]]);
}
header("Location: afficheM.php?msg=added");
exit();
