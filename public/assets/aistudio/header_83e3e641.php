<?php
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

// Variables attendues : $pageTitle (string), $active (index|matieres|epreuves|add-matiere|add-epreuve)
$pageTitle = $pageTitle ?? 'EduManager';
$active = $active ?? '';
$userLogin = $_SESSION['user_login'] ?? '';

$nav = [
    'index'       => ['dashboard.php', 'Dashboard'],
    'matieres'    => ['afficheM.php', 'Matières'],
    'epreuves'    => ['afficheE.php', 'Épreuves'],
    'add-matiere' => ['formInsertM.php', '+ Matière'],
    'add-epreuve' => ['formInsertE.php', '+ Épreuve'],
];
?>
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title><?= e($pageTitle) ?> | ISET Djerba</title>
    <link rel="stylesheet" href="style.css">
</head>
<body>
<div class="space-bg" aria-hidden="true">
    <div class="stars s1"></div><div class="stars s2"></div><div class="stars s3"></div>
</div>

<nav class="navbar">
    <a href="index.html" class="logo" aria-label="ISET Djerba">
        <img src="img/logo.png" alt="ISET Djerba"
             onerror="this.replaceWith(document.createTextNode('ISET Djerba'))">
    </a>
    <ul class="nav-links">
        <?php foreach ($nav as $key => [$url, $label]): ?>
            <li><a href="<?= $url ?>"<?= $key === $active ? ' class="active" aria-current="page"' : '' ?>><?= e($label) ?></a></li>
        <?php endforeach; ?>
        <?php if ($userLogin !== ''): ?>
            <li><a href="logout.php" class="logout">Déconnexion (<?= e($userLogin) ?>)</a></li>
        <?php else: ?>
            <li><a href="login.php" class="logout">Connexion</a></li>
        <?php endif; ?>
    </ul>
</nav>

<main class="container">