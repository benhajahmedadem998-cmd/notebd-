<?php
// Page de connexion (Professeur et Étudiant) avec protection contre les tentatives répétées
if (session_status() === PHP_SESSION_NONE) {
    session_set_cookie_params(['httponly' => true, 'samesite' => 'Lax']);
    session_start();
}

require_once('connect.inc.php');

// Si l'utilisateur est déjà connecté, on le renvoie vers son espace
if (!empty($_SESSION['user_id'])) {
    rediriger(estEtudiant() ? 'notesEtudiant.php' : 'dashboard.php');
}

$error = (($_GET['error'] ?? '') === 'auth_required')
    ? "Veuillez vous connecter pour accéder à l'application."
    : '';

// Vérifie un mot de passe haché (bcrypt/argon2) ou texte simple (comptes de test)
function motDePasseValide(string $saisi, string $stocke): bool
{
    if ($stocke === '') {
        return false;
    }
    if (str_starts_with($stocke, '$2y$') || str_starts_with($stocke, '$argon2')) {
        return password_verify($saisi, $stocke);
    }
    return hash_equals($stocke, $saisi);
}

if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['login_submit'])) {
    $login     = trim((string) ($_POST['login'] ?? ''));
    $password  = (string) ($_POST['password'] ?? '');
    $lockUntil = (int) ($_SESSION['lock_until'] ?? 0);

    if ($lockUntil > time()) {
        $reste = $lockUntil - time();
        $error = "Trop de tentatives. Réessayez dans {$reste} secondes.";
    } elseif ($login === '' || $password === '') {
        $error = 'Veuillez saisir votre identifiant et votre mot de passe.';
    } elseif (mb_strlen($login) > 50) {
        $error = "L'identifiant ne doit pas dépasser 50 caractères.";
    } else {
        $stmt = $dbh->prepare('SELECT * FROM utilisateurs WHERE login = :login LIMIT 1');
        $stmt->execute([':login' => $login]);
        $user = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($user && motDePasseValide($password, (string) ($user['mot_de_passe'] ?? ''))) {
            session_regenerate_id(true);
            unset($_SESSION['attempts'], $_SESSION['lock_until']);

            $_SESSION['user_id']    = $user['id'];
            $_SESSION['user_login'] = $user['login'];
            $_SESSION['user_role']  = $user['role'] ?? 'prof';
            $_SESSION['numetu']     = isset($user['numetu']) ? (int) $user['numetu'] : null;

            // Redirection selon le rôle (et profil à compléter lors de la 1re connexion)
            $dest = 'dashboard.php';
            if (estEtudiant()) {
                $dest = 'notesEtudiant.php';
                if (!empty($_SESSION['numetu'])) {
                    $etu = trouverEtudiantParId($dbh, (int) $_SESSION['numetu']);
                    if ($etu && (int) ($etu['profil_complete'] ?? 0) === 0) {
                        $dest = 'profilEtudiant.php?edit=1';
                    }
                }
            }
            rediriger($dest);
        }

        // Compte les échecs (blocage de 60 s après 5 tentatives)
        $_SESSION['attempts'] = (int) ($_SESSION['attempts'] ?? 0) + 1;
        if ($_SESSION['attempts'] >= 5) {
            $_SESSION['lock_until'] = time() + 60;
            $_SESSION['attempts']   = 0;
        }
        $error = 'Identifiant ou mot de passe incorrect.';
    }
}
?>
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Connexion | ISET Djerba — NOTES DB</title>
  <link rel="stylesheet" href="login.css">
</head>
<body class="login-page">

<header class="brand">
  <a href="index.html" class="brand-link">
    <img src="img/logo.png" alt="Logo ISET Djerba" class="brand-logo"
         onerror="this.onerror=null;this.src='img/logo.svg';">
    <span class="sep" aria-hidden="true"></span>
    <div>
      <h2>ISET DJERBA · NOTES DB</h2>
      <p>Institut Supérieur des Études Technologiques de Djerba</p>
    </div>
  </a>
</header>

<main class="login-card">
  <h1>Espace <span>Connexion</span></h1>
  <p class="lead">Connectez-vous en tant que Professeur ou Étudiant pour accéder à vos notes.</p>

  <?php if ($error !== ''): ?>
    <div class="alert alert-error" role="alert"><?= e($error) ?></div>
  <?php endif; ?>

  <form action="" method="post" id="loginForm" novalidate>
    <div class="form-group">
      <span class="icon" aria-hidden="true">
        <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 12a5 5 0 1 0 0-10 5 5 0 0 0 0 10zm0 2c-4.4 0-8 2.2-8 5v1h16v-1c0-2.8-3.6-5-8-5z"/></svg>
      </span>
      <input type="text" id="login" name="login" maxlength="50" required
             autocomplete="username" aria-label="Identifiant"
             value="<?= e($_POST['login'] ?? '') ?>"
             placeholder="Identifiant (ex : prof ou youssef)">
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

    <button type="submit" name="login_submit" class="btn-signin">Se connecter</button>
  </form>

  <p class="demo-hint">
    Comptes démo : <strong>prof / prof123</strong> (Professeur) · <strong>youssef / etu123</strong> ou <strong>ines / etu123</strong> (Étudiant)
  </p>
</main>

<footer class="page-footer">
  &copy; <?= date('Y') ?> ISET Djerba — Système de Gestion des Notes &amp; Épreuves
</footer>

<script src="app.js"></script>
</body>
</html>
<?php
$dbh = null;
$db  = null;
