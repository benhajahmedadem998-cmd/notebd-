<?php
// Connexion PDO à MySQL (conforme au Chapitre 5 — L'accès aux données)
$host = 'localhost';
$port = '3306';
$base = 'notes';
$user = 'root';
$pass = '';

$dsn = "mysql:host=$host;port=$port;dbname=$base;charset=utf8mb4";

try {
    $dbh = new PDO($dsn, $user, $pass);
    $dbh->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    $dbh->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
    $dbh->setAttribute(PDO::ATTR_EMULATE_PREPARES, false);
    $db = $dbh; // Alias de compatibilité
} catch (PDOException $e) {
    http_response_code(500);
    die('Erreur de connexion à la base de données. Vérifiez connect.inc.php et démarrez MySQL dans XAMPP.');
}

// Charge les fonctions utilitaires partagées (e(), verifierCsrf(), exigerProf(), etc.)
require_once(__DIR__ . '/fonctions.php');
