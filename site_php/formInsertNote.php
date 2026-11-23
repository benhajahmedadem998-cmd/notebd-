<?php
require_once('auth.php');
require_once('connect.inc.php');

// Page réservée au professeur / administrateur
exigerProf();

$typesEval = getTypesEval();

// Chargement des matières et indexation par code matière
$matieres = $dbh->query(
    'SELECT codemat, libelle, coef FROM matiere ORDER BY libelle ASC'
)->fetchAll(PDO::FETCH_ASSOC);

$matiereParCode = [];
foreach ($matieres as $m) {
    $matiereParCode[$m['codemat']] = $m;
}

$erreur       = '';
$succes       = '';
$foundStudent = null;

$form = [
    'cin'       => nettoyerCin((string) ($_GET['cin'] ?? '')),
    'codemat'   => '',
    'type_eval' => 'DS',
    'note'      => '',
    'date_eval' => date('Y-m-d'),
];

if ($form['cin'] !== '') {
    $foundStudent = trouverEtudiantParCin($dbh, $form['cin']);
}

// Traitement de l'enregistrement d'une note par CIN et matière
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['save_note_cin'])) {
    $form['cin']       = nettoyerCin((string) ($_POST['cin'] ?? ''));
    $form['codemat']   = strtoupper(trim((string) ($_POST['codemat'] ?? '')));
    $form['type_eval'] = trim((string) ($_POST['type_eval'] ?? ''));
    $form['note']      = str_replace(',', '.', trim((string) ($_POST['note'] ?? '')));
    $form['date_eval'] = trim((string) ($_POST['date_eval'] ?? ''));

    $foundStudent = $form['cin'] !== '' ? trouverEtudiantParCin($dbh, $form['cin']) : null;

    if (!verifierCsrf($_POST['csrf'] ?? null)) {
        $erreur = 'Session expirée, veuillez recharger la page et réessayer.';
    } elseif ($form['cin'] === '') {
        $erreur = "Veuillez saisir le numéro CIN de l'étudiant.";
    } elseif (!$foundStudent) {
        $erreur = "Aucun étudiant trouvé avec le numéro CIN « {$form['cin']} ».";
    } elseif ($form['codemat'] === '' || !isset($matiereParCode[$form['codemat']])) {
        $erreur = 'Veuillez sélectionner une matière valide dans la liste.';
    } elseif (!in_array($form['type_eval'], $typesEval, true)) {
        $erreur = "Veuillez choisir un type d'évaluation valide (DS, Examen, TP ou Projet).";
    } elseif ($form['note'] === '' || !is_numeric($form['note']) || (float) $form['note'] < 0 || (float) $form['note'] > 20) {
        $erreur = 'La note doit être un nombre compris entre 0 et 20.';
    } elseif (!dateValide($form['date_eval'])) {
        $erreur = "Veuillez indiquer une date d'évaluation valide.";
    } else {
        $numetu  = (int) $foundStudent['numetu'];
        $noteVal = round((float) $form['note'], 2);
        $matiere = $matiereParCode[$form['codemat']];

        try {
            $dbh->beginTransaction();

            // 1. Rechercher si une épreuve identique existe déjà
            $stmtEp = $dbh->prepare(
                'SELECT numepreuve
                 FROM epreuve
                 WHERE codemat = :codemat AND type_eval = :type_eval AND datepreuve = :datepreuve
                 LIMIT 1'
            );
            $stmtEp->execute([
                ':codemat'    => $form['codemat'],
                ':type_eval'  => $form['type_eval'],
                ':datepreuve' => $form['date_eval'],
            ]);
            $epreuveExistante = $stmtEp->fetch(PDO::FETCH_ASSOC);

            if ($epreuveExistante) {
                $numepreuve = (int) $epreuveExistante['numepreuve'];

                // Vérifier l'absence de doublon pour cet étudiant et cette épreuve
                $stmtDup = $dbh->prepare(
                    'SELECT COUNT(*) FROM notation WHERE numetu = :numetu AND numepreuve = :numepreuve'
                );
                $stmtDup->execute([':numetu' => $numetu, ':numepreuve' => $numepreuve]);

                if ((int) $stmtDup->fetchColumn() > 0) {
                    $dbh->rollBack();
                    $erreur = "Doublon détecté : {$foundStudent['prenom']} {$foundStudent['nom']} possède déjà une note en {$matiere['libelle']} ({$form['type_eval']} du " . formaterDate($form['date_eval']) . ').';
                }
            } else {
                // 2. Créer automatiquement l'épreuve si elle n'existe pas encore
                $numepreuve = (int) $dbh->query('SELECT COALESCE(MAX(numepreuve), 50000) + 1 FROM epreuve')->fetchColumn();
                $stmtInsEp = $dbh->prepare(
                    'INSERT INTO epreuve (numepreuve, datepreuve, Lieu, type_eval, codemat)
                     VALUES (:numepreuve, :datepreuve, :lieu, :type_eval, :codemat)'
                );
                $stmtInsEp->execute([
                    ':numepreuve' => $numepreuve,
                    ':datepreuve' => $form['date_eval'],
                    ':lieu'       => 'ISET Djerba',
                    ':type_eval'  => $form['type_eval'],
                    ':codemat'    => $form['codemat'],
                ]);
            }

            // 3. Enregistrer la note une seule fois si aucun doublon n'a été détecté
            if ($erreur === '') {
                $stmtNote = $dbh->prepare(
                    'INSERT INTO notation (numetu, numepreuve, note) VALUES (:numetu, :numepreuve, :note)'
                );
                $stmtNote->execute([
                    ':numetu'     => $numetu,
                    ':numepreuve' => $numepreuve,
                    ':note'       => $noteVal,
                ]);
                $dbh->commit();

                $succes = 'Note enregistrée avec succès : ' . formaterNote($noteVal)
                    . " / 20 pour {$foundStudent['prenom']} {$foundStudent['nom']} (CIN {$foundStudent['cin']}) en {$matiere['libelle']} ({$form['type_eval']}).";
                $form['note'] = '';
            }
        } catch (PDOException $ex) {
            if ($dbh->inTransaction()) {
                $dbh->rollBack();
            }
            $erreur = "Impossible d'enregistrer la note. Vérifiez les informations saisies.";
        }
    }
}

// 8 dernières notes ajoutées
$dernieresNotes = $dbh->query(
    'SELECT n.numetu, n.numepreuve, n.note,
            et.cin, et.nom, et.prenom, et.classe,
            ep.datepreuve, ep.type_eval, ep.codemat,
            m.libelle, m.coef
     FROM notation n
     INNER JOIN etudiant et ON et.numetu = n.numetu
     INNER JOIN epreuve ep ON ep.numepreuve = n.numepreuve
     INNER JOIN matiere m ON m.codemat = ep.codemat
     ORDER BY ep.datepreuve DESC, n.numepreuve DESC
     LIMIT 8'
)->fetchAll(PDO::FETCH_ASSOC);

$selectedCoef = isset($matiereParCode[$form['codemat']])
    ? (string) $matiereParCode[$form['codemat']]['coef']
    : '';

$pageTitle = 'Ajouter une note par CIN';
$active    = 'add-note-cin';
include('header.php');
?>
<div class="page-header">
  <div>
    <h1>Ajouter une note par CIN &amp; Matière</h1>
    <p>Saisissez le numéro CIN de l'étudiant, choisissez la matière et enregistrez la note directement dans MySQL.</p>
  </div>
  <a href="notesProf.php" class="btn btn-secondary">Toutes les notes</a>
</div>

<?php if ($succes !== ''): ?>
  <div class="alert alert-success" role="status"><?= e($succes) ?></div>
<?php endif; ?>
<?php if ($erreur !== ''): ?>
  <div class="alert alert-error" role="alert"><?= e($erreur) ?></div>
<?php endif; ?>

<div class="form-card form-card--wide">
  <form method="post" action="formInsertNote.php" id="noteCinForm" novalidate>
    <input type="hidden" name="csrf" value="<?= e($_SESSION['csrf']) ?>">

    <div class="form-section-head">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="9" cy="10" r="2"/><path d="M15 8h2M15 12h2M7 16h10"/>
      </svg>
      <span>01. Identification de l'étudiant par CIN</span>
    </div>

    <div class="form-grid-2">
      <div class="form-group cin-lookup-wrap">
        <label for="cinInput">CIN étudiant *</label>
        <input type="text" id="cinInput" name="cin" maxlength="20" autocomplete="off" required
               value="<?= e($form['cin']) ?>"
               placeholder="Ex : 09841001 ou 09841005">
        <div class="cin-suggestions" id="cinSuggestions" role="listbox" aria-label="Suggestions d'étudiants"></div>
        <small class="field-error"></small>
      </div>

      <div class="form-group">
        <label for="studentFullName">Nom et prénom (automatique)</label>
        <input type="text" id="studentFullName" class="input-readonly" readonly
               value="<?= $foundStudent ? e($foundStudent['prenom'] . ' ' . $foundStudent['nom']) : '' ?>"
               placeholder="Chargé automatiquement après saisie du CIN">
        <div class="lookup-status <?= $foundStudent ? 'lookup-status--ok' : '' ?>" id="cinStatus" aria-live="polite">
          <?php if ($foundStudent): ?>
            Étudiant trouvé · #<?= (int) $foundStudent['numetu'] ?> · <?= e($foundStudent['classe'] ?: 'ISET Djerba') ?>
          <?php else: ?>
            Saisissez un numéro CIN valide pour charger automatiquement l'étudiant.
          <?php endif; ?>
        </div>
      </div>
    </div>

    <div class="form-section-head form-section-head--spaced">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
      </svg>
      <span>02. Matière &amp; Détails de l'évaluation</span>
    </div>

    <div class="form-grid-2">
      <div class="form-group">
        <label for="matiereFilter">Rechercher une matière</label>
        <input type="search" id="matiereFilter" autocomplete="off"
               placeholder="Filtrer par nom ou code (ex : Informatique, INF)…">
      </div>

      <div class="form-group">
        <label for="codematSelect">Matière *</label>
        <select id="codematSelect" name="codemat" required>
          <option value="" data-coef="">— Sélectionner une matière —</option>
          <?php foreach ($matieres as $m): ?>
            <option value="<?= e($m['codemat']) ?>"
                    data-coef="<?= e($m['coef']) ?>"
                    <?= $form['codemat'] === $m['codemat'] ? 'selected' : '' ?>>
              <?= e($m['libelle']) ?> (<?= e($m['codemat']) ?> · Coef. <?= e($m['coef']) ?>)
            </option>
          <?php endforeach; ?>
        </select>
        <small class="field-error"></small>
      </div>

      <div class="form-group">
        <label for="typeEvalSelect">Type d'évaluation *</label>
        <select id="typeEvalSelect" name="type_eval" required>
          <?php foreach ($typesEval as $type): ?>
            <option value="<?= e($type) ?>" <?= $form['type_eval'] === $type ? 'selected' : '' ?>><?= e($type) ?></option>
          <?php endforeach; ?>
        </select>
        <small class="field-error"></small>
      </div>

      <div class="form-group">
        <label for="coefAuto">Coefficient (automatique)</label>
        <input type="text" id="coefAuto" class="input-readonly" readonly
               value="<?= e($selectedCoef) ?>"
               placeholder="Récupéré depuis la matière">
      </div>

      <div class="form-group">
        <label for="noteCinVal">Note sur 20 *</label>
        <input type="number" id="noteCinVal" name="note" min="0" max="20" step="0.25" required
               value="<?= e($form['note']) ?>" placeholder="Ex : 16.50">
        <small class="field-error"></small>
      </div>

      <div class="form-group">
        <label for="dateEval">Date de l'évaluation *</label>
        <input type="date" id="dateEval" name="date_eval" required
               value="<?= e($form['date_eval']) ?>">
        <small class="field-error"></small>
      </div>
    </div>

    <div class="form-actions">
      <button type="submit" name="save_note_cin" class="btn btn-primary">Enregistrer la note</button>
      <a href="dashboard.php" class="btn btn-secondary">Annuler</a>
    </div>
  </form>
</div>

<h2 class="section-title">Dernières notes enregistrées</h2>
<div class="table-card">
  <table>
    <thead>
      <tr>
        <th>CIN &amp; Étudiant</th>
        <th>Matière</th>
        <th>Type</th>
        <th>Date</th>
        <th class="right">Note / 20</th>
      </tr>
    </thead>
    <tbody>
      <?php foreach ($dernieresNotes as $n): ?>
        <tr>
          <td data-label="Étudiant">
            <strong><?= e($n['prenom']) ?> <?= e($n['nom']) ?></strong>
            <div class="cell-sub muted">CIN <?= e($n['cin'] ?: '—') ?> · #<?= (int) $n['numetu'] ?></div>
          </td>
          <td data-label="Matière"><span class="badge"><?= e($n['codemat']) ?></span><?= e($n['libelle']) ?></td>
          <td data-label="Type"><span class="type-tag"><?= e($n['type_eval'] ?: 'Examen') ?></span></td>
          <td data-label="Date"><?= e(formaterDate($n['datepreuve'])) ?></td>
          <td data-label="Note / 20" class="right">
            <strong class="<?= ((float) $n['note'] < 10) ? 'text-danger' : 'text-ok' ?>">
              <?= formaterNote((float) $n['note']) ?> / 20
            </strong>
          </td>
        </tr>
      <?php endforeach; ?>
      <?php if (!$dernieresNotes): ?>
        <tr><td colspan="5" class="empty">Aucune note enregistrée pour le moment.</td></tr>
      <?php endif; ?>
    </tbody>
  </table>
</div>
<?php include('footer.php'); ?>
