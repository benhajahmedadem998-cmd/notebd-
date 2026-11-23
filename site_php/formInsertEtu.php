<?php
require_once('auth.php');
require_once('connect.inc.php');

// Page réservée au professeur / administrateur
exigerProf();

$departements = getDepartements();
$specialites  = getSpecialites();
$annees       = getAnnees();

$editId     = isset($_GET['edit']) ? (int) $_GET['edit'] : (int) ($_POST['edit_numetu'] ?? 0);
$isEditMode = false;
$error      = '';

$form = [
    'numetu'      => '',
    'cin'         => '',
    'nom'         => '',
    'prenom'      => '',
    'email'       => '',
    'telephone'   => '',
    'datenaiss'   => '',
    'sexe'        => '',
    'departement' => '',
    'specialite'  => '',
    'classe'      => '',
    'annee_univ'  => '2025-2026',
];

// Chargement de l'étudiant existant en mode modification
if ($editId > 0) {
    $etudiantExistant = trouverEtudiantParId($dbh, $editId);
    if ($etudiantExistant) {
        $isEditMode = true;
        foreach ($form as $cle => $defaut) {
            $form[$cle] = (string) ($etudiantExistant[$cle] ?? $defaut);
        }
    } else {
        $editId = 0;
    }
}

// Traitement du formulaire d'ajout ou de modification
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['submit'])) {
    foreach ($form as $cle => $defaut) {
        $form[$cle] = ($isEditMode && $cle === 'numetu')
            ? (string) $editId
            : trim((string) ($_POST[$cle] ?? ''));
    }
    $form['cin'] = nettoyerCin($form['cin']);

    // Vérification des champs obligatoires
    $champsObligatoires = [
        'numetu', 'nom', 'prenom', 'email', 'telephone',
        'datenaiss', 'sexe', 'departement', 'specialite', 'classe', 'annee_univ',
    ];
    $champVide = false;
    foreach ($champsObligatoires as $champ) {
        if ($form[$champ] === '') {
            $champVide = true;
            break;
        }
    }

    if (!verifierCsrf($_POST['csrf'] ?? null)) {
        $error = 'Session expirée, veuillez recharger la page et réessayer.';
    } elseif ($champVide) {
        $error = 'Veuillez remplir tous les champs obligatoires du formulaire.';
    } elseif (!preg_match('/^\d{1,9}$/', $form['numetu']) || (int) $form['numetu'] <= 0) {
        $error = "Le numéro d'inscription doit être un nombre entier positif.";
    } elseif (!estEmailValide($form['email'])) {
        $error = "Le format de l'adresse e-mail est invalide.";
    } elseif (!estTelValide($form['telephone'])) {
        $error = 'Veuillez saisir un numéro de téléphone valide (8 chiffres minimum).';
    } elseif (!dateValide($form['datenaiss'])) {
        $error = 'Veuillez indiquer une date de naissance valide.';
    } elseif (!in_array($form['sexe'], ['Masculin', 'Féminin'], true)) {
        $error = 'Veuillez sélectionner le sexe.';
    } elseif ($form['cin'] !== '' && !preg_match('/^[0-9A-Za-z]{6,20}$/', $form['cin'])) {
        $error = 'Le numéro CIN doit contenir entre 6 et 20 caractères alphanumériques (ex : 09841005).';
    } else {
        $numetuInt = $isEditMode ? $editId : (int) $form['numetu'];
        $cinValeur = $form['cin'] !== '' ? $form['cin'] : null;

        // Vérification d'unicité du CIN
        $cinExiste = false;
        if ($cinValeur !== null) {
            $sqlCin = $isEditMode
                ? 'SELECT COUNT(*) FROM etudiant WHERE cin = :cin AND numetu <> :id'
                : 'SELECT COUNT(*) FROM etudiant WHERE cin = :cin';
            $stmtCin = $dbh->prepare($sqlCin);
            $paramsCin = [':cin' => $cinValeur];
            if ($isEditMode) {
                $paramsCin[':id'] = $numetuInt;
            }
            $stmtCin->execute($paramsCin);
            $cinExiste = (int) $stmtCin->fetchColumn() > 0;
        }

        // Vérification d'unicité du numéro d'inscription en mode ajout
        $idExiste = !$isEditMode && trouverEtudiantParId($dbh, $numetuInt) !== null;

        if ($idExiste) {
            $error = "Ce numéro d'inscription (#{$numetuInt}) existe déjà dans la base de données.";
        } elseif ($cinExiste) {
            $error = "Ce numéro CIN ({$cinValeur}) est déjà attribué à un autre étudiant.";
        } else {
            $donnees = [
                ':numetu'      => $numetuInt,
                ':cin'         => $cinValeur,
                ':nom'         => $form['nom'],
                ':prenom'      => $form['prenom'],
                ':email'       => $form['email'],
                ':telephone'   => $form['telephone'],
                ':datenaiss'   => $form['datenaiss'],
                ':sexe'        => $form['sexe'],
                ':departement' => $form['departement'],
                ':specialite'  => $form['specialite'],
                ':classe'      => $form['classe'],
                ':annee_univ'  => $form['annee_univ'],
            ];

            try {
                if ($isEditMode) {
                    $stmt = $dbh->prepare(
                        'UPDATE etudiant
                         SET cin = :cin, nom = :nom, prenom = :prenom, email = :email,
                             telephone = :telephone, datenaiss = :datenaiss, sexe = :sexe,
                             departement = :departement, specialite = :specialite,
                             classe = :classe, annee_univ = :annee_univ
                         WHERE numetu = :numetu'
                    );
                    $stmt->execute($donnees);
                    rediriger('afficheEtu.php?msg=updated&numetu=' . $numetuInt);
                } else {
                    $donnees[':ville'] = 'Djerba';
                    $stmt = $dbh->prepare(
                        'INSERT INTO etudiant
                            (numetu, cin, nom, prenom, email, telephone, datenaiss, sexe,
                             departement, specialite, classe, annee_univ, ville)
                         VALUES
                            (:numetu, :cin, :nom, :prenom, :email, :telephone, :datenaiss, :sexe,
                             :departement, :specialite, :classe, :annee_univ, :ville)'
                    );
                    $stmt->execute($donnees);

                    // Création automatique d'un compte d'accès Étudiant (mot de passe par défaut : etu123)
                    $login = strtolower(preg_replace('/[^a-zA-Z0-9]/', '', $form['prenom']) ?? '');
                    if ($login === '') {
                        $login = 'etu' . $numetuInt;
                    }
                    $checkLogin = $dbh->prepare('SELECT COUNT(*) FROM utilisateurs WHERE login = :login');
                    $checkLogin->execute([':login' => $login]);
                    if ((int) $checkLogin->fetchColumn() > 0) {
                        $login = 'etu' . $numetuInt;
                    }

                    $stmtCompte = $dbh->prepare(
                        "INSERT IGNORE INTO utilisateurs (login, mot_de_passe, role, numetu)
                         VALUES (:login, :pwd, 'etudiant', :numetu)"
                    );
                    $stmtCompte->execute([
                        ':login'  => $login,
                        ':pwd'    => password_hash('etu123', PASSWORD_DEFAULT),
                        ':numetu' => $numetuInt,
                    ]);

                    rediriger('afficheEtu.php?msg=added&numetu=' . $numetuInt);
                }
            } catch (PDOException $ex) {
                $error = $isEditMode
                    ? "Erreur lors de la modification de l'étudiant. Vérifiez les données saisies."
                    : "Erreur lors de l'enregistrement de l'étudiant. Vérifiez les données saisies.";
            }
        }
    }
}

$pageTitle = $isEditMode ? 'Modifier un étudiant' : 'Ajouter un étudiant';
$active    = $isEditMode ? 'etudiants' : 'add-etudiant';
include('header.php');
?>
<div class="page-header">
  <div>
    <h1><?= $isEditMode ? 'Modifier un étudiant (#' . (int) $editId . ')' : 'Ajouter un étudiant' ?></h1>
    <p>
      <?= $isEditMode
          ? "Mettez à jour le dossier et les informations universitaires de l'étudiant."
          : "Enregistrez un nouvel étudiant dans le répertoire académique de l'ISET Djerba." ?>
    </p>
  </div>
  <a href="afficheEtu.php" class="btn btn-secondary">Liste des étudiants</a>
</div>

<?php if ($error !== ''): ?>
  <div class="alert alert-error" role="alert"><?= e($error) ?></div>
<?php endif; ?>

<div class="form-card form-card--wide">
  <form action="<?= $isEditMode ? 'formInsertEtu.php?edit=' . (int) $editId : 'formInsertEtu.php' ?>" method="post" id="etudiantForm" novalidate>
    <input type="hidden" name="csrf" value="<?= e($_SESSION['csrf']) ?>">
    <?php if ($isEditMode): ?>
      <input type="hidden" name="edit_numetu" value="<?= (int) $editId ?>">
    <?php endif; ?>

    <div class="form-section-head">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
      </svg>
      <span>01. Identité &amp; Coordonnées</span>
    </div>

    <div class="form-grid-2">
      <div class="form-group">
        <label for="numetu">Numéro d'inscription (ID étudiant) *</label>
        <input type="number" id="numetu" name="numetu" min="1" required
               class="<?= $isEditMode ? 'input-readonly' : '' ?>"
               <?= $isEditMode ? 'readonly' : '' ?>
               value="<?= e($form['numetu']) ?>" placeholder="Ex : 1006">
        <small class="field-error"></small>
      </div>

      <div class="form-group">
        <label for="cin">Numéro CIN</label>
        <input type="text" id="cin" name="cin" maxlength="20"
               value="<?= e($form['cin']) ?>" placeholder="Ex : 09841006">
        <small class="field-error"></small>
      </div>

      <div class="form-group">
        <label for="sexe">Sexe *</label>
        <select id="sexe" name="sexe" required>
          <option value="">— Sélectionner —</option>
          <option value="Masculin" <?= $form['sexe'] === 'Masculin' ? 'selected' : '' ?>>Masculin</option>
          <option value="Féminin" <?= $form['sexe'] === 'Féminin' ? 'selected' : '' ?>>Féminin</option>
        </select>
        <small class="field-error"></small>
      </div>

      <div class="form-group">
        <label for="nom">Nom *</label>
        <input type="text" id="nom" name="nom" maxlength="100" required
               value="<?= e($form['nom']) ?>" placeholder="Ex : Ben Salah">
        <small class="field-error"></small>
      </div>

      <div class="form-group">
        <label for="prenom">Prénom *</label>
        <input type="text" id="prenom" name="prenom" maxlength="100" required
               value="<?= e($form['prenom']) ?>" placeholder="Ex : Amine">
        <small class="field-error"></small>
      </div>

      <div class="form-group">
        <label for="email">Adresse e-mail *</label>
        <input type="email" id="email" name="email" maxlength="150" required
               value="<?= e($form['email']) ?>" placeholder="Ex : amine.bensalah@isetjb.rnu.tn">
        <small class="field-error"></small>
      </div>

      <div class="form-group">
        <label for="telephone">Numéro de téléphone *</label>
        <input type="tel" id="telephone" name="telephone" maxlength="30" required
               value="<?= e($form['telephone']) ?>" placeholder="Ex : +216 22 345 678">
        <small class="field-error"></small>
      </div>

      <div class="form-group">
        <label for="datenaiss">Date de naissance *</label>
        <input type="date" id="datenaiss" name="datenaiss" required
               value="<?= e($form['datenaiss']) ?>">
        <small class="field-error"></small>
      </div>
    </div>

    <div class="form-section-head form-section-head--spaced">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/>
      </svg>
      <span>02. Parcours universitaire — ISET Djerba</span>
    </div>

    <div class="form-grid-2">
      <div class="form-group">
        <label for="departement">Département *</label>
        <select id="departement" name="departement" required>
          <option value="">— Choisir un département —</option>
          <?php foreach ($departements as $dep): ?>
            <option value="<?= e($dep) ?>" <?= $form['departement'] === $dep ? 'selected' : '' ?>><?= e($dep) ?></option>
          <?php endforeach; ?>
        </select>
        <small class="field-error"></small>
      </div>

      <div class="form-group">
        <label for="specialite">Spécialité *</label>
        <select id="specialite" name="specialite" required>
          <option value="">— Choisir une spécialité —</option>
          <?php foreach ($specialites as $spec): ?>
            <option value="<?= e($spec) ?>" <?= $form['specialite'] === $spec ? 'selected' : '' ?>><?= e($spec) ?></option>
          <?php endforeach; ?>
        </select>
        <small class="field-error"></small>
      </div>

      <div class="form-group">
        <label for="classe">Classe / Groupe *</label>
        <input type="text" id="classe" name="classe" maxlength="50" required
               value="<?= e($form['classe']) ?>" placeholder="Ex : DSI-1 ou MDW-1">
        <small class="field-error"></small>
      </div>

      <div class="form-group">
        <label for="annee_univ">Année universitaire *</label>
        <select id="annee_univ" name="annee_univ" required>
          <option value="">— Choisir une année —</option>
          <?php foreach ($annees as $an): ?>
            <option value="<?= e($an) ?>" <?= $form['annee_univ'] === $an ? 'selected' : '' ?>><?= e($an) ?></option>
          <?php endforeach; ?>
        </select>
        <small class="field-error"></small>
      </div>
    </div>

    <div class="form-actions">
      <button type="submit" name="submit" class="btn btn-primary">
        <?= $isEditMode ? 'Enregistrer les modifications' : "Ajouter l'étudiant" ?>
      </button>
      <a href="afficheEtu.php" class="btn btn-secondary">Annuler</a>
    </div>
  </form>
</div>
<?php include('footer.php'); ?>
