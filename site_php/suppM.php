<?php
require_once('auth.php');
require_once('connect.inc.php');
exigerProf();

// Suppression sécurisée d'une matière (POST + jeton CSRF + requête préparée PDO)
if ($_SERVER['REQUEST_METHOD'] === 'POST' && verifierCsrf($_POST['csrf'] ?? null)) {
    $codemat = strtoupper(trim((string) ($_POST['codemat'] ?? '')));
    if ($codemat !== '') {
        $stmt = $dbh->prepare('DELETE FROM matiere WHERE codemat = :codemat');
        $stmt->execute([':codemat' => $codemat]);
        rediriger('afficheM.php?msg=deleted');
    }
}

rediriger('afficheM.php');
