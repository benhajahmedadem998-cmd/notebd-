<?php
// En-tête commun (menu latéral + barre supérieure) inclus sur toutes les pages privées
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

$pageTitle    = $pageTitle ?? 'ISET Djerba — NOTES DB';
$active       = $active ?? '';
$userLogin    = $_SESSION['user_login'] ?? '';
$isStudent    = estEtudiant();
$userInitials = $userLogin !== '' ? strtoupper(substr($userLogin, 0, 2)) : 'IS';

// Charge la photo de profil dans le menu si l'étudiant en a une
$studentPhoto = '';
if ($isStudent && !empty($_SESSION['numetu']) && isset($dbh) && $dbh instanceof PDO) {
    $etuMenu = trouverEtudiantParId($dbh, (int) $_SESSION['numetu']);
    if ($etuMenu && !empty($etuMenu['photo']) && is_file(__DIR__ . '/' . $etuMenu['photo'])) {
        $studentPhoto = (string) $etuMenu['photo'];
    }
}

// Définition des groupes de navigation selon le rôle
$menuGroupes = $isStudent
    ? [
        'Mon espace' => [
            'notes-etudiant'  => ['notesEtudiant.php', 'Mon relevé complet'],
            'profil-etudiant' => ['profilEtudiant.php', 'Mon profil'],
        ],
    ]
    : [
        'Principal' => [
            'index'          => ['dashboard.php', 'Tableau de bord'],
            'notes-prof'     => ['notesProf.php', 'Notes (Professeur)'],
            'notes-etudiant' => ['notesEtudiant.php', 'Aperçu Relevé Étudiant'],
        ],
        'Gestion académique' => [
            'etudiants' => ['afficheEtu.php', 'Étudiants'],
            'matieres'  => ['afficheM.php', 'Matières'],
            'epreuves'  => ['afficheE.php', 'Épreuves'],
        ],
        'Actions rapides' => [
            'add-note-cin' => ['formInsertNote.php', 'Ajouter une note (CIN)'],
            'add-etudiant' => ['formInsertEtu.php', 'Ajouter un étudiant'],
            'add-matiere'  => ['formInsertM.php', 'Ajouter une matière'],
            'add-epreuve'  => ['formInsertE.php', 'Planifier une épreuve'],
        ],
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
<div class="space-bg" aria-hidden="true"></div>
<div class="sidebar-backdrop" id="sidebarBackdrop"></div>

<div class="app-shell">
  <aside class="sidebar" id="appSidebar" aria-label="Menu principal">
    <div class="sidebar-header">
      <a href="<?= $isStudent ? 'notesEtudiant.php' : 'dashboard.php' ?>" class="sidebar-brand" aria-label="ISET Djerba NOTES DB">
        <img src="img/logo.png" alt="Logo ISET Djerba" class="sidebar-brand-logo"
             onerror="this.onerror=null;this.src='img/logo.svg';">
        <span class="sidebar-brand-text">
          <span class="sidebar-brand-iset">ISET DJERBA</span>
          <span class="sidebar-brand-title">NOTES <span>DB</span></span>
        </span>
      </a>
      <button type="button" class="sidebar-close" id="sidebarClose" aria-label="Fermer le menu">&times;</button>
    </div>

    <nav class="sidebar-nav">
      <?php foreach ($menuGroupes as $titreGroupe => $liens): ?>
        <div>
          <div class="sidebar-group-title"><?= e($titreGroupe) ?></div>
          <ul class="sidebar-list">
            <?php foreach ($liens as $cle => [$url, $libelle]): ?>
              <li>
                <a href="<?= e($url) ?>"
                   class="sidebar-link<?= $cle === $active ? ' active' : '' ?>"
                   <?= $cle === $active ? 'aria-current="page"' : '' ?>>
                  <?= e($libelle) ?>
                </a>
              </li>
            <?php endforeach; ?>
          </ul>
        </div>
      <?php endforeach; ?>
    </nav>

    <div class="sidebar-footer">
      <?php if ($userLogin !== ''): ?>
        <div class="sidebar-user">
          <div class="sidebar-avatar">
            <?php if ($studentPhoto !== ''): ?>
              <img src="<?= e($studentPhoto) ?>" alt="Avatar" class="sidebar-avatar-img">
            <?php else: ?>
              <?= e($userInitials) ?>
            <?php endif; ?>
          </div>
          <div>
            <div class="sidebar-user-name"><?= e($userLogin) ?></div>
            <div class="sidebar-user-role"><?= $isStudent ? 'Espace Étudiant · ISET' : 'Espace Professeur · ISET' ?></div>
          </div>
        </div>
        <a href="logout.php" class="sidebar-logout">Déconnexion</a>
      <?php else: ?>
        <a href="login.php" class="sidebar-logout">Connexion</a>
      <?php endif; ?>
    </div>
  </aside>

  <div class="app-main">
    <header class="topbar">
      <div class="topbar-left">
        <button type="button" class="menu-toggle" id="menuToggle" aria-label="Ouvrir le menu">&#9776;</button>
        <div class="topbar-breadcrumb">
          <span>ISET Djerba</span>
          <span>/</span>
          <strong><?= e($pageTitle) ?></strong>
        </div>
      </div>
      <?php if (!$isStudent): ?>
        <a href="notesProf.php" class="btn btn-primary btn-sm">Saisir des notes</a>
      <?php else: ?>
        <a href="profilEtudiant.php" class="btn btn-secondary btn-sm">Mon profil</a>
      <?php endif; ?>
    </header>

    <main class="container">
