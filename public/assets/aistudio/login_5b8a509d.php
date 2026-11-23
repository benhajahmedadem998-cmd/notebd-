<?php

declare(strict_types=1);

if (session_status() === PHP_SESSION_NONE) {
    session_set_cookie_params([
        'httponly' => true,
        'samesite' => 'Lax',
    ]);
    session_start();
}

include('connect.inc.php');

if (isset($_SESSION['user_id'])) {
    header("Location: dashboard.php");
    exit();
}

$error = '';
if (isset($_GET['error']) && $_GET['error'] === 'auth_required') {
    $error = "Veuillez vous connecter pour accéder à l'application.";
}

const MAX_ATTEMPTS = 5;
const LOCK_SECONDS = 60;

if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['login_submit'])) {
    $login = trim((string) ($_POST['login'] ?? ''));
    $password = (string) ($_POST['password'] ?? '');
    $now = time();
    $lockUntil = (int) ($_SESSION['lock_until'] ?? 0);

    if ($lockUntil > $now) {
        $remaining = $lockUntil - $now;
        $error = "Trop de tentatives. Réessayez dans {$remaining} secondes.";
    } elseif ($login === '' || $password === '') {
        $error = "Veuillez saisir votre identifiant et votre mot de passe.";
    } elseif (mb_strlen($login) > 50) {
        $error = "L'identifiant ne doit pas dépasser 50 caractères.";
    } else {
        $stmt = $db->prepare("SELECT id, login, mot_de_passe FROM utilisateurs WHERE login = :login LIMIT 1");
        $stmt->execute([':login' => $login]);
        $user = $stmt->fetch();

        $storedPassword = is_array($user) ? (string) ($user['mot_de_passe'] ?? '') : '';
        $authenticated = false;

        if ($user && $storedPassword !== '') {
            if (password_verify($password, $storedPassword)) {
                $authenticated = true;
            } elseif (
                !str_starts_with($storedPassword, '$2y$')
                && !str_starts_with($storedPassword, '$argon2')
                && hash_equals($storedPassword, $password)
            ) {
                // Secours si le mot de passe en base n'est pas encore haché
                $authenticated = true;
            }
        }

        if ($authenticated) {
            session_regenerate_id(true);
            unset($_SESSION['attempts'], $_SESSION['lock_until']);
            $_SESSION['user_id'] = $user['id'];
            $_SESSION['user_login'] = $user['login'];
            header("Location: dashboard.php");
            exit();
        }

        $_SESSION['attempts'] = (int) ($_SESSION['attempts'] ?? 0) + 1;
        if ($_SESSION['attempts'] >= MAX_ATTEMPTS) {
            $_SESSION['lock_until'] = time() + LOCK_SECONDS;
            $_SESSION['attempts'] = 0;
        }

        $error = "Identifiant ou mot de passe incorrect.";
    }
}
?>
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Connexion | ISET Djerba</title>
    <link rel="stylesheet" href="login.css">
</head>
<body class="login-page">

<!-- Décor -->
<div class="scene-left" aria-hidden="true">
    <svg class="palm p1" viewBox="0 0 200 300" fill="currentColor"><path d="M96 300c2-70 4-130 12-190h8c-6 60-8 125-6 190z"/><g><path d="M110 108C80 70 40 70 8 96c36-10 66-2 102 12z"/><path d="M110 108C84 52 50 36 14 44c34 8 62 30 96 64z"/><path d="M112 106C118 50 146 22 186 22c-32 12-52 44-74 84z"/><path d="M112 108c34-34 66-42 100-30-34-2-62 8-100 30z"/><path d="M110 110c-8-30 0-56 24-74-12 26-14 48-24 74z"/></g></svg>
    <svg class="palm p2" viewBox="0 0 200 300" fill="currentColor"><path d="M96 300c2-70 4-130 12-190h8c-6 60-8 125-6 190z"/><g><path d="M110 108C80 70 40 70 8 96c36-10 66-2 102 12z"/><path d="M110 108C84 52 50 36 14 44c34 8 62 30 96 64z"/><path d="M112 106C118 50 146 22 186 22c-32 12-52 44-74 84z"/><path d="M112 108c34-34 66-42 100-30-34-2-62 8-100 30z"/></g></svg>
</div>
<div class="scene-right" aria-hidden="true">
    <svg class="cap" viewBox="0 0 340 260">
        <rect x="10" y="190" width="300" height="38" rx="4" fill="#0f2147"/>
        <rect x="26" y="150" width="280" height="38" rx="4" fill="#13295a"/>
        <text x="60" y="176" fill="#9fb3d9" font-size="15" font-family="sans-serif" font-weight="700">ISET DJERBA</text>
        <path d="M30 110L170 50l150 56-150 52z" fill="#0b1226"/>
        <path d="M90 134v26c0 12 160 12 160 0v-26l-80 30z" fill="#0b1226"/>
        <path d="M300 110v58" stroke="#e5b84a" stroke-width="4"/>
        <path d="M292 168h16l-4 40h-8z" fill="#e5b84a"/>
    </svg>
</div>
<svg class="swoosh top" viewBox="0 0 400 200" fill="none" aria-hidden="true">
    <defs><linearGradient id="g1" x1="0" x2="1"><stop offset="0" stop-color="#4ade80" stop-opacity="0"/><stop offset="1" stop-color="#4ade80"/></linearGradient></defs>
    <path d="M0 200C120 150 260 70 400 0" stroke="url(#g1)" stroke-width="5" stroke-linecap="round"/>
</svg>
<svg class="swoosh bottom" viewBox="0 0 400 160" fill="none" aria-hidden="true">
    <defs><linearGradient id="g2" x1="0" x2="1"><stop offset="0" stop-color="#4ade80" stop-opacity="0"/><stop offset="1" stop-color="#4ade80"/></linearGradient></defs>
    <path d="M0 160C140 130 280 80 400 20" stroke="url(#g2)" stroke-width="4" stroke-linecap="round"/>
</svg>

<!-- En-tête -->
<header class="brand">
    <svg viewBox="0 0 64 64" aria-hidden="true">
        <path d="M6 40c10 10 30 14 50 2-14 2-30-2-50-2z" fill="#2f6fe0"/>
        <path d="M12 46c8 8 24 10 38 2-12 0-26-2-38-2z" fill="#1d4ea8"/>
        <circle cx="38" cy="16" r="7" fill="#4ade80"/>
        <path d="M18 34c10-14 24-14 36-10-12 0-22 4-36 10z" fill="#4ade80"/>
    </svg>
    <span class="sep"></span>
    <div>
        <h2>ISET DJERBA</h2>
        <p>Institut Supérieur des Études Technologiques de Djerba</p>
    </div>
</header>
<div class="tagline">Votre avenir commence ici</div>

<!-- Carte de connexion -->
<main class="login-card">
    <svg class="emblem" viewBox="0 0 96 96" fill="none" aria-hidden="true">
        <path d="M30 70c-12-6-18-18-16-32M34 74C20 70 10 56 12 40" stroke="#4ade80" stroke-width="3" stroke-linecap="round"/>
        <path d="M66 70c12-6 18-18 16-32M62 74c14-4 24-18 22-34" stroke="#4ade80" stroke-width="3" stroke-linecap="round"/>
        <path d="M48 22L22 36l26 14 26-14z" fill="#fff"/>
        <path d="M32 46v12c0 6 32 6 32 0V46L48 54z" fill="#fff"/>
        <path d="M74 36v16" stroke="#e5b84a" stroke-width="2.5"/>
    </svg>

    <h1>Espace <span>Connexion</span></h1>
    <p class="lead">Bon retour ! Connectez-vous pour accéder à votre compte.</p>

    <?php if ($error !== ''): ?>
        <div class="alert alert-error" role="alert"><?= htmlspecialchars($error, ENT_QUOTES, 'UTF-8') ?></div>
    <?php endif; ?>

    <form action="" method="post" id="loginForm" novalidate>
        <div class="form-group">
            <span class="icon" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 12a5 5 0 1 0 0-10 5 5 0 0 0 0 10zm0 2c-4.4 0-8 2.2-8 5v1h16v-1c0-2.8-3.6-5-8-5z"/></svg>
            </span>
            <input type="text" id="login" name="login" maxlength="50" required
                   autocomplete="username" aria-label="Identifiant"
                   value="<?= htmlspecialchars((string) ($_POST['login'] ?? ''), ENT_QUOTES, 'UTF-8') ?>"
                   placeholder="Identifiant">
            <small class="field-error"></small>
        </div>

        <div class="form-group">
            <span class="icon" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="currentColor"><path d="M17 9V7a5 5 0 0 0-10 0v2H5v12h14V9zm-8-2a3 3 0 0 1 6 0v2H9z"/></svg>
            </span>
            <input type="password" id="password" name="password" required
                   autocomplete="current-password" aria-label="Mot de passe"
                   placeholder="Mot de passe">
            <button type="button" class="toggle" id="togglePwd" aria-label="Afficher le mot de passe">
                <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 5C6.5 5 2.7 9 1 12c1.7 3 5.5 7 11 7s9.3-4 11-7c-1.7-3-5.5-7-11-7zm0 11a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm0-6a2 2 0 1 0 0 4 2 2 0 0 0 0-4z"/></svg>
            </button>
            <small class="field-error"></small>
        </div>

        <button type="submit" name="login_submit" class="btn-signin">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg>
            Se connecter
        </button>
    </form>
</main>

<footer class="page-footer">
    &copy; <?= date('Y') ?> ISET Djerba — Système de Gestion des Notes &amp; Épreuves
</footer>

<script src="app.js"></script>
<script>
    document.getElementById('togglePwd').addEventListener('click', function () {
        const input = document.getElementById('password');
        const show = input.type === 'password';
        input.type = show ? 'text' : 'password';
        this.setAttribute('aria-label', show ? 'Masquer le mot de passe' : 'Afficher le mot de passe');
    });
</script>
</body>
</html>