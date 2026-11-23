<?php
// Protection des pages privées : démarre la session, vérifie la connexion et crée le jeton CSRF
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

if (empty($_SESSION['user_id'])) {
    header('Location: login.php?error=auth_required');
    exit();
}

if (empty($_SESSION['csrf']) || !is_string($_SESSION['csrf'])) {
    $_SESSION['csrf'] = bin2hex(random_bytes(32));
}
