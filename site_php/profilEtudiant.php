<?php
require_once('auth.php');
require_once('connect.inc.php');

// Seul l'étudiant connecté peut consulter et modifier son propre profil
exigerEtudiant();

$sessionNumetu = (int) $_SESSION['numetu'];
$etudiant      = trouverEtudiantParId($dbh, $sessionNumetu);

if (!$etudiant) {
    http_response_code(404);
    die('Profil étudiant introuvable. Contactez la scolarité ISET Djerba.');
}

$departements = getDepartements();
$specialites  = getSpecialites();
$annees       = getAnnees();

$erreur       = '';
$succes       = '';
$isIncomplete = ((int) ($etudiant['profil_complete'] ?? 0) === 0)
    || empty($etudiant['email'])
    || empty($etudiant['telephone'])
    || empty($etudiant['datenaiss']);

$editMode = (isset($_GET['edit']) && $_GET['edit'] === '1') || $isIncomplete;

// Valeurs affichées dans le formulaire (conservées en cas d'erreur de saisie)
$valeurs = [
    'cin'         => (string) ($etudiant['cin'] ?? ''),
    'nom'         => (string) ($etudiant['nom'] ?? ''),
    'prenom'      => (string) ($etudiant['prenom'] ?? ''),
    'email'       => (string) ($etudiant['email'] ?? ''),
    'telephone'   => (string) ($etudiant['telephone'] ?? ''),
    'datenaiss'   => (string) ($etudiant['datenaiss'] ?? ''),
    'ville'       => (string) ($etudiant['ville'] ?? ''),
    'departement' => (string) ($etudiant['departement'] ?? ''),
    'specialite'  => (string) ($etudiant['specialite'] ?? ''),
    'classe'      => (string) ($etudiant['classe'] ?? ''),
    'annee_univ'  => (string) ($etudiant['annee_univ'] ?? ''),
];

// Champs administratifs verrouillés dès qu'ils sont renseignés dans la base
$cinLocked  = !empty($etudiant['cin']);
$depLocked  = !empty($etudiant['departement']);
$specLocked = !empty($etudiant['specialite']);
$clsLocked  = !empty($etudiant['classe']);
$anLocked   = !empty($etudiant['annee_univ']);

// Traitement des formulaires POST (suppression photo ou mise à jour du profil)
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if (!verifierCsrf($_POST['csrf'] ?? null)) {
        $erreur   = 'Session expirée, veuillez recharger la page et réessayer.';
        $editMode = true;
    } elseif (isset($_POST['delete_photo'])) {
        supprimerPhotoAvatar($etudiant['photo'] ?? null);
        $stmt = $dbh->prepare('UPDATE etudiant SET photo = NULL WHERE numetu = :numetu');
        $stmt->execute([':numetu' => $sessionNumetu]);
        $etudiant = trouverEtudiantParId($dbh, $sessionNumetu) ?? $etudiant;
        $succes   = 'Votre photo de profil a été supprimée.';
        $editMode = true;
    } elseif (isset($_POST['save_profile'])) {
        $editMode = true;

        // Récupération des champs saisis (en respectant les champs verrouillés)
        $valeurs['nom']         = trim((string) ($_POST['nom'] ?? ''));
        $valeurs['prenom']      = trim((string) ($_POST['prenom'] ?? ''));
        $valeurs['email']       = trim((string) ($_POST['email'] ?? ''));
        $valeurs['telephone']   = trim((string) ($_POST['telephone'] ?? ''));
        $valeurs['datenaiss']   = trim((string) ($_POST['datenaiss'] ?? ''));
        $valeurs['ville']       = trim((string) ($_POST['ville'] ?? ''));
        $valeurs['cin']         = $cinLocked  ? (string) $etudiant['cin']         : nettoyerCin((string) ($_POST['cin'] ?? ''));
        $valeurs['departement'] = $depLocked  ? (string) $etudiant['departement'] : trim((string) ($_POST['departement'] ?? ''));
        $valeurs['specialite']  = $specLocked ? (string) $etudiant['specialite']  : trim((string) ($_POST['specialite'] ?? ''));
        $valeurs['classe']      = $clsLocked  ? (string) $etudiant['classe']      : trim((string) ($_POST['classe'] ?? ''));
        $valeurs['annee_univ']  = $anLocked   ? (string) $etudiant['annee_univ']  : trim((string) ($_POST['annee_univ'] ?? ''));

        if ($valeurs['nom'] === '' || $valeurs['prenom'] === '' || $valeurs['email'] === '' || $valeurs['telephone'] === '' || $valeurs['datenaiss'] === '') {
            $erreur = 'Veuillez remplir tous vos champs personnels obligatoires (Nom, Prénom, E-mail, Téléphone, Date de naissance).';
        } elseif (mb_strlen($valeurs['nom']) > 100 || mb_strlen($valeurs['prenom']) > 100) {
            $erreur = 'Le nom et le prénom ne doivent pas dépasser 100 caractères.';
        } elseif (!estEmailValide($valeurs['email'])) {
            $erreur = "Le format de l'adresse e-mail est invalide.";
        } elseif (!estTelValide($valeurs['telephone'])) {
            $erreur = 'Veuillez saisir un numéro de téléphone valide (8 chiffres minimum).';
        } elseif (!dateValide($valeurs['datenaiss'])) {
            $erreur = 'Veuillez indiquer une date de naissance valide.';
        } elseif (!$cinLocked && $valeurs['cin'] !== '' && !preg_match('/^[0-9A-Za-z]{6,20}$/', $valeurs['cin'])) {
            $erreur = 'Le numéro CIN doit contenir entre 6 et 20 caractères alphanumériques.';
        } else {
            // Contrôle d'unicité du CIN s'il est saisi pour la première fois
            $cinConflit = false;
            if (!$cinLocked && $valeurs['cin'] !== '') {
                $stmtCin = $dbh->prepare('SELECT COUNT(*) FROM etudiant WHERE cin = :cin AND numetu <> :numetu');
                $stmtCin->execute([':cin' => $valeurs['cin'], ':numetu' => $sessionNumetu]);
                $cinConflit = (int) $stmtCin->fetchColumn() > 0;
            }

            if ($cinConflit) {
                $erreur = 'Ce numéro CIN est déjà associé à un autre dossier étudiant.';
            } else {
                // Gestion sécurisée de la photo de profil (suppression ou téléversement)
                $nouvellePhoto = $etudiant['photo'] ?? null;
                if (($_POST['remove_photo_flag'] ?? '0') === '1') {
                    supprimerPhotoAvatar($nouvellePhoto);
                    $nouvellePhoto = null;
                }
                if (isset($_FILES['photo'])) {
                    $nouvellePhoto = enregistrerPhotoAvatar($_FILES['photo'], $sessionNumetu, $nouvellePhoto, $erreur);
                }

                if ($erreur === '') {
                    try {
                        $stmtUpd = $dbh->prepare(
                            'UPDATE etudiant
                             SET nom = :nom, prenom = :prenom, email = :email, telephone = :telephone,
                                 datenaiss = :datenaiss, ville = :ville, cin = :cin,
                                 departement = :departement, specialite = :specialite,
                                 classe = :classe, annee_univ = :annee_univ,
                                 photo = :photo, profil_complete = 1
                             WHERE numetu = :numetu'
                        );
                        $stmtUpd->execute([
                            ':nom'         => $valeurs['nom'],
                            ':prenom'      => $valeurs['prenom'],
                            ':email'       => $valeurs['email'],
                            ':telephone'   => $valeurs['telephone'],
                            ':datenaiss'   => $valeurs['datenaiss'],
                            ':ville'       => $valeurs['ville'] !== '' ? $valeurs['ville'] : ($etudiant['ville'] ?? 'Djerba'),
                            ':cin'         => $valeurs['cin'] !== '' ? $valeurs['cin'] : null,
                            ':departement' => $valeurs['departement'] !== '' ? $valeurs['departement'] : null,
                            ':specialite'  => $valeurs['specialite'] !== '' ? $valeurs['specialite'] : null,
                            ':classe'      => $valeurs['classe'] !== '' ? $valeurs['classe'] : null,
                            ':annee_univ'  => $valeurs['annee_univ'] !== '' ? $valeurs['annee_univ'] : null,
                            ':photo'       => $nouvellePhoto,
                            ':numetu'      => $sessionNumetu,
                        ]);

                        $etudiant     = trouverEtudiantParId($dbh, $sessionNumetu) ?? $etudiant;
                        $isIncomplete = false;
                        $editMode     = false;
                        $succes       = 'Votre profil étudiant a été mis à jour avec succès.';
                    } catch (PDOException $ex) {
                        $erreur = 'Impossible de sauvegarder les modifications pour le moment.';
                    }
                }
            }
        }
    }
}

// Re-synchronisation de l'affichage du bandeau et des verrous après une éventuelle mise à jour
$cinLocked  = !empty($etudiant['cin']);
$depLocked  = !empty($etudiant['departement']);
$specLocked = !empty($etudiant['specialite']);
$clsLocked  = !empty($etudiant['classe']);
$anLocked   = !empty($etudiant['annee_univ']);

$fullName = trim((string) ($etudiant['prenom'] ?? '') . ' ' . (string) ($etudiant['nom'] ?? ''));
$initials = strtoupper(
    mb_substr((string) ($etudiant['prenom'] ?? 'E'), 0, 1)
    . mb_substr((string) ($etudiant['nom'] ?? 'T'), 0, 1)
);
$hasPhoto = !empty($etudiant['photo']) && is_file(__DIR__ . '/' . $etudiant['photo']);
$photoUrl = $hasPhoto ? $etudiant['photo'] : '';

$pageTitle = 'Mon profil';
$active    = 'profil-etudiant';
include('header.php');
?>
<div class="page-header">
  <div>
    <h1>Mon profil étudiant</h1>
    <p>Consultez et personnalisez vos informations personnelles sur la plateforme NOTES DB – ISET Djerba.</p>
  </div>
  <div class="header-actions">
    <a href="notesEtudiant.php" class="btn btn-secondary">Mon relevé de notes</a>
    <?php if (!$editMode): ?>
      <a href="profilEtudiant.php?edit=1" class="btn btn-primary">Modifier mon profil</a>
    <?php else: ?>
      <a href="profilEtudiant.php" class="btn btn-secondary">Voir mon profil</a>
    <?php endif; ?>
  </div>
</div>

<?php if ($isIncomplete): ?>
  <div class="profile-invite" role="status">
    <div>
      <strong>Bienvenue ! Complétez votre profil étudiant</strong>
      <p>Ajoutez votre photo de profil et vérifiez vos coordonnées personnelles pour finaliser votre espace ISET Djerba.</p>
    </div>
  </div>
<?php endif; ?>

<?php if ($succes !== ''): ?>
  <div class="alert alert-success" role="status"><?= e($succes) ?></div>
<?php endif; ?>
<?php if ($erreur !== ''): ?>
  <div class="alert alert-error" role="alert"><?= e($erreur) ?></div>
<?php endif; ?>

<section class="profile-hero-card">
  <div class="profile-hero-main">
    <div class="profile-avatar-frame" id="profileHeroAvatar">
      <?php if ($hasPhoto): ?>
        <img src="<?= e($photoUrl) ?>" alt="Photo de <?= e($fullName) ?>" class="profile-avatar-img">
      <?php else: ?>
        <span class="profile-avatar-initials"><?= e($initials) ?></span>
      <?php endif; ?>
    </div>
    <div class="profile-hero-info">
      <div class="profile-hero-top">
        <h2><?= e($fullName) ?></h2>
        <span class="profile-status-tag <?= $isIncomplete ? 'profile-status-tag--warn' : 'profile-status-tag--ok' ?>">
          <?= $isIncomplete ? 'Profil à compléter' : 'Profil vérifié' ?>
        </span>
      </div>
      <div class="profile-hero-meta">
        <span>N° d'inscription <strong>#<?= (int) $etudiant['numetu'] ?></strong></span>
        <span>&middot;</span>
        <span>CIN <strong><?= e($etudiant['cin'] ?: 'Non renseigné') ?></strong></span>
        <?php if (!empty($etudiant['classe'])): ?>
          <span>&middot;</span>
          <span><strong><?= e($etudiant['classe']) ?></strong></span>
        <?php endif; ?>
      </div>
      <?php if (!empty($etudiant['departement']) || !empty($etudiant['specialite'])): ?>
        <p class="profile-hero-sub muted">
          <?= e($etudiant['departement'] ?: '') ?><?= (!empty($etudiant['departement']) && !empty($etudiant['specialite'])) ? ' — ' : '' ?><?= e($etudiant['specialite'] ?: '') ?>
        </p>
      <?php endif; ?>
    </div>
  </div>
  <?php if (!$editMode): ?>
    <a href="profilEtudiant.php?edit=1" class="btn btn-primary">Modifier mon profil</a>
  <?php endif; ?>
</section>

<?php if (!$editMode): ?>
  <div class="profile-cards-grid">
    <article class="profile-info-card">
      <div class="form-section-head">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
        </svg>
        <span>Informations personnelles</span>
      </div>
      <dl class="profile-dl">
        <div><dt>Nom</dt><dd><?= e($etudiant['nom'] ?: '—') ?></dd></div>
        <div><dt>Prénom</dt><dd><?= e($etudiant['prenom'] ?: '—') ?></dd></div>
        <div><dt>CIN</dt><dd><?= e($etudiant['cin'] ?: '—') ?></dd></div>
        <div><dt>Numéro d'inscription</dt><dd>#<?= (int) $etudiant['numetu'] ?></dd></div>
        <div><dt>Adresse e-mail</dt><dd><?= e($etudiant['email'] ?: '—') ?></dd></div>
        <div><dt>Numéro de téléphone</dt><dd><?= e($etudiant['telephone'] ?: '—') ?></dd></div>
        <div><dt>Date de naissance</dt><dd><?= e(formaterDate($etudiant['datenaiss'] ?? null)) ?></dd></div>
        <div><dt>Ville</dt><dd><?= e($etudiant['ville'] ?: '—') ?></dd></div>
      </dl>
    </article>

    <article class="profile-info-card">
      <div class="form-section-head">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/>
        </svg>
        <span>Informations universitaires</span>
      </div>
      <dl class="profile-dl">
        <div><dt>Établissement</dt><dd>ISET Djerba</dd></div>
        <div><dt>Département</dt><dd><?= e($etudiant['departement'] ?: '—') ?></dd></div>
        <div><dt>Spécialité</dt><dd><?= e($etudiant['specialite'] ?: '—') ?></dd></div>
        <div><dt>Classe / Groupe</dt><dd><?= e($etudiant['classe'] ?: '—') ?></dd></div>
        <div><dt>Année universitaire</dt><dd><?= e($etudiant['annee_univ'] ?: '—') ?></dd></div>
      </dl>
      <p class="profile-lock-note">
        Le CIN, le numéro d'inscription, les notes et les données administratives sont protégés par l'administration.
      </p>
    </article>
  </div>
<?php else: ?>
  <div class="form-card form-card--wide">
    <form method="post" action="profilEtudiant.php?edit=1" enctype="multipart/form-data" id="studentProfileForm" novalidate>
      <input type="hidden" name="csrf" value="<?= e($_SESSION['csrf']) ?>">
      <input type="hidden" name="remove_photo_flag" id="removePhotoFlag" value="0">

      <div class="form-section-head">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/>
        </svg>
        <span>01. Photo de profil</span>
      </div>

      <div class="photo-upload-box">
        <div class="profile-avatar-frame profile-avatar-frame--lg" id="photoPreviewFrame" data-initials="<?= e($initials) ?>">
          <?php if ($hasPhoto): ?>
            <img src="<?= e($photoUrl) ?>" alt="Aperçu photo" class="profile-avatar-img" id="photoPreviewImg">
          <?php else: ?>
            <span class="profile-avatar-initials" id="photoPreviewInitials"><?= e($initials) ?></span>
          <?php endif; ?>
        </div>

        <div class="photo-upload-controls">
          <div class="photo-upload-actions">
            <label for="profilePhotoInput" class="btn btn-secondary btn-sm">Choisir une photo</label>
            <input type="file" id="profilePhotoInput" name="photo" accept=".jpg,.jpeg,.png,image/jpeg,image/png" class="sr-only">
            <button type="button" id="removePhotoBtn" class="btn btn-danger btn-sm" <?= $hasPhoto ? '' : 'style="display:none;"' ?>>
              Supprimer la photo
            </button>
          </div>
          <p class="muted photo-upload-hint">Formats acceptés : JPG, JPEG ou PNG · Taille maximale : 2 Mo.</p>
          <small class="field-error" id="photoFieldError"></small>
        </div>
      </div>

      <div class="form-section-head form-section-head--spaced">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
        </svg>
        <span>02. Informations personnelles</span>
      </div>

      <div class="form-grid-2">
        <div class="form-group">
          <label for="profNumetu">Numéro d'inscription (verrouillé)</label>
          <input type="text" id="profNumetu" class="input-readonly" readonly value="#<?= (int) $etudiant['numetu'] ?>">
        </div>

        <div class="form-group">
          <label for="profCin">CIN <?= $cinLocked ? '(verrouillé)' : '' ?></label>
          <input type="text" id="profCin" name="cin" maxlength="20"
                 class="<?= $cinLocked ? 'input-readonly' : '' ?>"
                 <?= $cinLocked ? 'readonly' : '' ?>
                 value="<?= e($valeurs['cin']) ?>" placeholder="Ex : 09841005">
          <small class="field-error"></small>
        </div>

        <div class="form-group">
          <label for="profNom">Nom *</label>
          <input type="text" id="profNom" name="nom" maxlength="100" required
                 value="<?= e($valeurs['nom']) ?>">
          <small class="field-error"></small>
        </div>

        <div class="form-group">
          <label for="profPrenom">Prénom *</label>
          <input type="text" id="profPrenom" name="prenom" maxlength="100" required
                 value="<?= e($valeurs['prenom']) ?>">
          <small class="field-error"></small>
        </div>

        <div class="form-group">
          <label for="profEmail">Adresse e-mail *</label>
          <input type="email" id="profEmail" name="email" maxlength="150" required
                 value="<?= e($valeurs['email']) ?>" placeholder="prenom.nom@isetjb.rnu.tn">
          <small class="field-error"></small>
        </div>

        <div class="form-group">
          <label for="profTel">Numéro de téléphone *</label>
          <input type="tel" id="profTel" name="telephone" maxlength="30" required
                 value="<?= e($valeurs['telephone']) ?>" placeholder="+216 22 000 000">
          <small class="field-error"></small>
        </div>

        <div class="form-group">
          <label for="profDateNaiss">Date de naissance *</label>
          <input type="date" id="profDateNaiss" name="datenaiss" required
                 value="<?= e($valeurs['datenaiss']) ?>">
          <small class="field-error"></small>
        </div>

        <div class="form-group">
          <label for="profVille">Ville</label>
          <input type="text" id="profVille" name="ville" maxlength="100"
                 value="<?= e($valeurs['ville']) ?>" placeholder="Ex : Houmt Souk, Midoun…">
          <small class="field-error"></small>
        </div>
      </div>

      <div class="form-section-head form-section-head--spaced">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/>
        </svg>
        <span>03. Informations universitaires (administration)</span>
      </div>

      <div class="form-grid-2">
        <div class="form-group">
          <label for="profDep">Département <?= $depLocked ? '(verrouillé)' : '' ?></label>
          <?php if ($depLocked): ?>
            <input type="text" id="profDep" class="input-readonly" readonly value="<?= e($etudiant['departement']) ?>">
          <?php else: ?>
            <select id="profDep" name="departement">
              <option value="">— Choisir un département —</option>
              <?php foreach ($departements as $dep): ?>
                <option value="<?= e($dep) ?>" <?= $valeurs['departement'] === $dep ? 'selected' : '' ?>><?= e($dep) ?></option>
              <?php endforeach; ?>
            </select>
          <?php endif; ?>
        </div>

        <div class="form-group">
          <label for="profSpec">Spécialité <?= $specLocked ? '(verrouillé)' : '' ?></label>
          <?php if ($specLocked): ?>
            <input type="text" id="profSpec" class="input-readonly" readonly value="<?= e($etudiant['specialite']) ?>">
          <?php else: ?>
            <select id="profSpec" name="specialite">
              <option value="">— Choisir une spécialité —</option>
              <?php foreach ($specialites as $sp): ?>
                <option value="<?= e($sp) ?>" <?= $valeurs['specialite'] === $sp ? 'selected' : '' ?>><?= e($sp) ?></option>
              <?php endforeach; ?>
            </select>
          <?php endif; ?>
        </div>

        <div class="form-group">
          <label for="profClasse">Classe / Groupe <?= $clsLocked ? '(verrouillé)' : '' ?></label>
          <input type="text" id="profClasse" name="classe" maxlength="50"
                 class="<?= $clsLocked ? 'input-readonly' : '' ?>"
                 <?= $clsLocked ? 'readonly' : '' ?>
                 value="<?= e($valeurs['classe']) ?>" placeholder="Ex : DSI-1 ou MDW-1">
        </div>

        <div class="form-group">
          <label for="profAnnee">Année universitaire <?= $anLocked ? '(verrouillé)' : '' ?></label>
          <?php if ($anLocked): ?>
            <input type="text" id="profAnnee" class="input-readonly" readonly value="<?= e($etudiant['annee_univ']) ?>">
          <?php else: ?>
            <select id="profAnnee" name="annee_univ">
              <option value="">— Choisir une année —</option>
              <?php foreach ($annees as $an): ?>
                <option value="<?= e($an) ?>" <?= $valeurs['annee_univ'] === $an ? 'selected' : '' ?>><?= e($an) ?></option>
              <?php endforeach; ?>
            </select>
          <?php endif; ?>
        </div>
      </div>

      <div class="form-actions">
        <button type="submit" name="save_profile" class="btn btn-primary">Enregistrer les modifications</button>
        <a href="profilEtudiant.php" class="btn btn-secondary">Annuler</a>
      </div>
    </form>
  </div>
<?php endif; ?>
<?php include('footer.php'); ?>
