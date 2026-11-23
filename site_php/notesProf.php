<?php
require_once('auth.php');
require_once('connect.inc.php');

// Page réservée au professeur / administrateur
exigerProf();

$erreur   = '';
$succes   = '';
$editEtu  = (int) ($_GET['edit_etu'] ?? 0);
$editEp   = (int) ($_GET['edit_ep'] ?? 0);
$editNote = '';

// Chargement d'une note à modifier depuis le tableau
if ($editEtu > 0 && $editEp > 0) {
    $stmt = $dbh->prepare('SELECT note FROM notation WHERE numetu = :numetu AND numepreuve = :numepreuve');
    $stmt->execute([':numetu' => $editEtu, ':numepreuve' => $editEp]);
    $ligne = $stmt->fetch(PDO::FETCH_ASSOC);
    if ($ligne) {
        $editNote = (string) $ligne['note'];
    }
}

// Traitement des actions POST (enregistrement ou suppression d'une note)
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if (!verifierCsrf($_POST['csrf'] ?? null)) {
        $erreur = 'Session expirée, veuillez recharger la page et réessayer.';
    } elseif (isset($_POST['save_note'])) {
        $numetu     = (int) ($_POST['numetu'] ?? 0);
        $numepreuve = (int) ($_POST['numepreuve'] ?? 0);
        $noteBrute  = str_replace(',', '.', trim((string) ($_POST['note'] ?? '')));

        if ($numetu <= 0 || $numepreuve <= 0) {
            $erreur = 'Veuillez choisir un étudiant et une épreuve.';
        } elseif (!is_numeric($noteBrute) || (float) $noteBrute < 0 || (float) $noteBrute > 20) {
            $erreur = 'La note doit être un nombre compris entre 0 et 20.';
        } else {
            $stmtEp = $dbh->prepare('SELECT numepreuve FROM epreuve WHERE numepreuve = :ep LIMIT 1');
            $stmtEp->execute([':ep' => $numepreuve]);

            if (!trouverEtudiantParId($dbh, $numetu) || !$stmtEp->fetch(PDO::FETCH_ASSOC)) {
                $erreur = 'Étudiant ou épreuve introuvable dans la base de données.';
            } else {
                $note = round((float) $noteBrute, 2);
                $stmt = $dbh->prepare(
                    'INSERT INTO notation (numetu, numepreuve, note)
                     VALUES (:numetu, :numepreuve, :note)
                     ON DUPLICATE KEY UPDATE note = VALUES(note)'
                );
                $stmt->execute([
                    ':numetu'     => $numetu,
                    ':numepreuve' => $numepreuve,
                    ':note'       => $note,
                ]);
                $succes   = 'Note enregistrée avec succès (' . formaterNote($note) . ' / 20).';
                $editEtu  = 0;
                $editEp   = 0;
                $editNote = '';
            }
        }
    } elseif (isset($_POST['delete_note'])) {
        $delEtu = (int) ($_POST['del_numetu'] ?? 0);
        $delEp  = (int) ($_POST['del_numepreuve'] ?? 0);
        if ($delEtu > 0 && $delEp > 0) {
            $stmt = $dbh->prepare('DELETE FROM notation WHERE numetu = :numetu AND numepreuve = :numepreuve');
            $stmt->execute([':numetu' => $delEtu, ':numepreuve' => $delEp]);
            $succes = 'La note a été supprimée.';
        }
    }
}

// Listes pour le formulaire et le tableau récapitulatif
$etudiants = $dbh->query(
    'SELECT numetu, nom, prenom, classe FROM etudiant ORDER BY nom ASC, prenom ASC'
)->fetchAll(PDO::FETCH_ASSOC);

$epreuves = $dbh->query(
    'SELECT e.numepreuve, e.datepreuve, e.type_eval, e.codemat, m.libelle
     FROM epreuve e
     INNER JOIN matiere m ON m.codemat = e.codemat
     ORDER BY e.datepreuve DESC, e.numepreuve DESC'
)->fetchAll(PDO::FETCH_ASSOC);

$notes = $dbh->query(
    'SELECT n.numetu, n.numepreuve, n.note,
            et.cin, et.nom, et.prenom, et.classe,
            ep.datepreuve, ep.type_eval, ep.codemat,
            m.libelle
     FROM notation n
     INNER JOIN etudiant et ON et.numetu = n.numetu
     INNER JOIN epreuve ep ON ep.numepreuve = n.numepreuve
     LEFT JOIN matiere m ON m.codemat = ep.codemat
     ORDER BY et.nom ASC, ep.datepreuve DESC'
)->fetchAll(PDO::FETCH_ASSOC);

$pageTitle = 'Saisie des notes (Professeur)';
$active    = 'notes-prof';
include('header.php');
?>
<div class="page-header">
  <div>
    <h1>Saisie des notes (Professeur)</h1>
    <p>Ajoutez, modifiez ou supprimez les notes des étudiants pour chaque épreuve.</p>
  </div>
  <div class="header-actions">
    <a href="formInsertNote.php" class="btn btn-primary">+ Ajouter par CIN</a>
    <a href="notesEtudiant.php" class="btn btn-secondary">Voir la vue Étudiant</a>
  </div>
</div>

<?php if ($succes !== ''): ?>
  <div class="alert alert-success"><?= e($succes) ?></div>
<?php endif; ?>
<?php if ($erreur !== ''): ?>
  <div class="alert alert-error" role="alert"><?= e($erreur) ?></div>
<?php endif; ?>

<div class="form-card form-card--wide">
  <h2><?= $editNote !== '' ? 'Modifier une note existante' : 'Ajouter ou modifier une note' ?></h2>
  <p class="muted form-intro">Sélectionnez un étudiant, une épreuve et saisissez une note comprise entre 0 et 20.</p>

  <form method="post" action="notesProf.php" id="gradeForm" novalidate>
    <input type="hidden" name="csrf" value="<?= e($_SESSION['csrf']) ?>">
    <div class="form-grid-3">
      <div class="form-group">
        <label for="numetu">Étudiant</label>
        <select id="numetu" name="numetu" required>
          <option value="">— Choisir un étudiant —</option>
          <?php foreach ($etudiants as $et): ?>
            <option value="<?= (int) $et['numetu'] ?>"
                    <?= ((int) $et['numetu'] === $editEtu) ? 'selected' : '' ?>>
              #<?= (int) $et['numetu'] ?> — <?= e($et['prenom']) ?> <?= e($et['nom']) ?>
            </option>
          <?php endforeach; ?>
        </select>
        <small class="field-error"></small>
      </div>

      <div class="form-group">
        <label for="numepreuve">Épreuve &amp; Matière</label>
        <select id="numepreuve" name="numepreuve" required>
          <option value="">— Choisir une épreuve —</option>
          <?php foreach ($epreuves as $ep): ?>
            <option value="<?= (int) $ep['numepreuve'] ?>"
                    <?= ((int) $ep['numepreuve'] === $editEp) ? 'selected' : '' ?>>
              #<?= (int) $ep['numepreuve'] ?> · <?= e($ep['codemat']) ?> (<?= e($ep['libelle']) ?>)
            </option>
          <?php endforeach; ?>
        </select>
        <small class="field-error"></small>
      </div>

      <div class="form-group">
        <label for="note">Note sur 20</label>
        <input type="number" id="note" name="note" step="0.25" min="0" max="20" required
               value="<?= e($editNote) ?>" placeholder="Ex : 15.5">
        <small class="field-error"></small>
      </div>
    </div>

    <div class="form-actions">
      <button type="submit" name="save_note" class="btn btn-primary">Enregistrer la note</button>
      <?php if ($editNote !== ''): ?>
        <a href="notesProf.php" class="btn btn-secondary">Annuler la modification</a>
      <?php endif; ?>
    </div>
  </form>
</div>

<div class="toolbar">
  <div class="search-box">
    <input type="search" id="tableSearch" placeholder="Rechercher un étudiant, un CIN ou une matière…">
  </div>
  <span class="muted">Total : <strong id="visibleCount"><?= count($notes) ?></strong> note(s)</span>
</div>

<div class="table-card">
  <table id="dataTable">
    <thead>
      <tr>
        <th>Étudiant</th>
        <th>Matière</th>
        <th>Épreuve</th>
        <th>Note / 20</th>
        <th class="right">Actions</th>
      </tr>
    </thead>
    <tbody>
      <?php foreach ($notes as $n): ?>
        <tr>
          <td data-label="Étudiant">
            <strong><?= e($n['prenom']) ?> <?= e($n['nom']) ?></strong>
            <div class="cell-sub muted"><?= $n['cin'] ? 'CIN ' . e($n['cin']) . ' · ' : '' ?>#<?= (int) $n['numetu'] ?></div>
          </td>
          <td data-label="Matière"><span class="badge"><?= e($n['codemat']) ?></span> <?= e($n['libelle']) ?></td>
          <td data-label="Épreuve">
            <span class="type-tag"><?= e($n['type_eval'] ?: 'Examen') ?></span>
            #<?= (int) $n['numepreuve'] ?> (<?= e(formaterDate($n['datepreuve'])) ?>)
          </td>
          <td data-label="Note / 20">
            <strong class="<?= ((float) $n['note'] < 10) ? 'text-danger' : 'text-ok' ?>">
              <?= formaterNote((float) $n['note']) ?> / 20
            </strong>
          </td>
          <td data-label="Actions" class="right actions-cell">
            <a href="notesEtudiant.php?numetu=<?= (int) $n['numetu'] ?>" class="btn btn-secondary btn-xs">Relevé</a>
            <a href="notesProf.php?edit_etu=<?= (int) $n['numetu'] ?>&edit_ep=<?= (int) $n['numepreuve'] ?>" class="btn btn-secondary btn-xs">Modifier</a>
            <form method="post" action="notesProf.php" class="inline-form">
              <input type="hidden" name="csrf" value="<?= e($_SESSION['csrf']) ?>">
              <input type="hidden" name="del_numetu" value="<?= (int) $n['numetu'] ?>">
              <input type="hidden" name="del_numepreuve" value="<?= (int) $n['numepreuve'] ?>">
              <button type="submit" name="delete_note" class="btn btn-danger btn-xs">Supprimer</button>
            </form>
          </td>
        </tr>
      <?php endforeach; ?>
      <?php if (!$notes): ?>
        <tr><td colspan="5" class="empty">Aucune note enregistrée pour le moment.</td></tr>
      <?php endif; ?>
    </tbody>
  </table>
</div>
<?php include('footer.php'); ?>
