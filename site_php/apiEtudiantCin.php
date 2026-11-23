<?php
// API JSON : recherche instantanée d'un étudiant par son numéro CIN
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

header('Content-Type: application/json; charset=utf-8');
header('X-Content-Type-Options: nosniff');
header('Cache-Control: no-store');

// Accès réservé aux professeurs / administrateurs connectés
if (empty($_SESSION['user_id']) || (($_SESSION['user_role'] ?? 'prof') === 'etudiant')) {
    http_response_code(403);
    echo json_encode(['found' => false, 'error' => 'Accès non autorisé.'], JSON_UNESCAPED_UNICODE);
    exit();
}

require_once('connect.inc.php');

$cin = nettoyerCin((string) ($_GET['cin'] ?? ''));

if ($cin === '' || strlen($cin) > 20) {
    echo json_encode(['found' => false, 'student' => null, 'suggestions' => []], JSON_UNESCAPED_UNICODE);
    $dbh = null;
    $db  = null;
    exit();
}

try {
    // 1. Recherche exacte par CIN
    $student = trouverEtudiantParCin($dbh, $cin);

    // 2. Suggestions rapides (CIN, nom ou prénom)
    $like = '%' . $cin . '%';
    $stmtSug = $dbh->prepare(
        'SELECT numetu, cin, nom, prenom, classe
         FROM etudiant
         WHERE cin LIKE :q1 OR nom LIKE :q2 OR prenom LIKE :q3
         ORDER BY (cin = :exact) DESC, nom ASC, prenom ASC
         LIMIT 6'
    );
    $stmtSug->execute([
        ':q1'    => $like,
        ':q2'    => $like,
        ':q3'    => $like,
        ':exact' => $cin,
    ]);

    echo json_encode([
        'found'       => $student !== null,
        'student'     => $student,
        'suggestions' => $stmtSug->fetchAll(PDO::FETCH_ASSOC),
    ], JSON_UNESCAPED_UNICODE);
} catch (PDOException $ex) {
    http_response_code(500);
    echo json_encode([
        'found' => false,
        'error' => "Erreur lors de la recherche de l'étudiant.",
    ], JSON_UNESCAPED_UNICODE);
} finally {
    $dbh = null;
    $db  = null;
}
