<?php
require_once('auth.php');
require_once('connect.inc.php');
exigerProf();

// Liste des étudiants triés par numéro d'inscription décroissant
$sth = $dbh->query(
    'SELECT numetu, cin, nom, prenom, email, telephone, datenaiss, sexe,
            departement, specialite, classe, annee_univ, ville
     FROM etudiant
     ORDER BY numetu DESC'
);
$etudiants = $sth->fetchAll(PDO::FETCH_ASSOC);

$msg      = $_GET['msg'] ?? '';
$addedNum = (int) ($_GET['numetu'] ?? 0);

$pageTitle = 'Gestion des étudiants';
$active    = 'etudiants';
include('header.php');
?>
<div class="page-header">
  <div>
    <h1>Gestion des étudiants</h1>
    <p>Consultez, recherchez, modifiez et enregistrez les étudiants de l'ISET Djerba.</p>
  </div>
  <a href="formInsertEtu.php" class="btn btn-primary">+ Ajouter un étudiant</a>
</div>

<?php if ($msg === 'added'): ?>
  <div class="alert alert-success" role="status">
    L'étudiant<?= $addedNum > 0 ? ' #' . $addedNum : '' ?> a été ajouté avec succès dans la base de données.
  </div>
<?php elseif ($msg === 'updated'): ?>
  <div class="alert alert-success" role="status">
    Le dossier de l'étudiant<?= $addedNum > 0 ? ' #' . $addedNum : '' ?> a été mis à jour avec succès.
  </div>
<?php endif; ?>

<div class="toolbar">
  <div class="search-box">
    <input type="search" id="tableSearch"
           placeholder="Rechercher par N° inscription, CIN, nom, spécialité ou classe…"
           aria-label="Rechercher un étudiant">
  </div>
  <span class="muted">Total : <strong id="visibleCount"><?= count($etudiants) ?></strong> étudiant(s)</span>
</div>

<div class="table-card">
  <table id="dataTable">
    <thead>
      <tr>
        <th>N° inscription</th>
        <th>Étudiant</th>
        <th>Contact</th>
        <th>Département &amp; Spécialité</th>
        <th>Classe &amp; Année</th>
        <th class="right">Actions</th>
      </tr>
    </thead>
    <tbody>
      <?php foreach ($etudiants as $et): ?>
        <?php $dateNaissFr = formaterDate($et['datenaiss'] ?? null); ?>
        <tr>
          <td data-label="N° / CIN">
            <span class="badge">#<?= (int) $et['numetu'] ?></span>
            <?php if (!empty($et['cin'])): ?>
              <div class="cell-sub muted">CIN <?= e($et['cin']) ?></div>
            <?php endif; ?>
          </td>
          <td data-label="Étudiant">
            <strong><?= e($et['prenom']) ?> <?= e($et['nom']) ?></strong>
            <div class="cell-sub muted"><?= e($et['sexe'] ?: '—') ?> · Né(e) le <?= e($dateNaissFr) ?></div>
          </td>
          <td data-label="Contact">
            <div><?= e($et['email'] ?: '—') ?></div>
            <div class="cell-sub muted"><?= e($et['telephone'] ?: '—') ?></div>
          </td>
          <td data-label="Filière">
            <div><strong><?= e($et['departement'] ?: '—') ?></strong></div>
            <div class="cell-sub muted"><?= e($et['specialite'] ?: '—') ?></div>
          </td>
          <td data-label="Classe & Année">
            <div><strong><?= e($et['classe'] ?: '—') ?></strong></div>
            <div class="cell-sub muted"><?= e($et['annee_univ'] ?: '—') ?></div>
          </td>
          <td data-label="Actions" class="right actions-cell">
            <button type="button"
                    class="btn btn-secondary btn-xs student-detail-trigger"
                    data-numetu="<?= (int) $et['numetu'] ?>"
                    data-cin="<?= e($et['cin'] ?: '—') ?>"
                    data-nom="<?= e($et['prenom'] . ' ' . $et['nom']) ?>"
                    data-email="<?= e($et['email'] ?: '—') ?>"
                    data-telephone="<?= e($et['telephone'] ?: '—') ?>"
                    data-datenaiss="<?= e($dateNaissFr) ?>"
                    data-sexe="<?= e($et['sexe'] ?: '—') ?>"
                    data-departement="<?= e($et['departement'] ?: '—') ?>"
                    data-specialite="<?= e($et['specialite'] ?: '—') ?>"
                    data-classe="<?= e($et['classe'] ?: '—') ?>"
                    data-annee="<?= e($et['annee_univ'] ?: '—') ?>">
              Consulter
            </button>
            <a href="formInsertEtu.php?edit=<?= (int) $et['numetu'] ?>" class="btn btn-secondary btn-xs">Modifier</a>
            <?php if (!empty($et['cin'])): ?>
              <a href="formInsertNote.php?cin=<?= urlencode($et['cin']) ?>" class="btn btn-primary btn-xs">+ Note</a>
            <?php endif; ?>
            <a href="notesEtudiant.php?numetu=<?= (int) $et['numetu'] ?>" class="btn btn-secondary btn-xs">Relevé</a>
          </td>
        </tr>
      <?php endforeach; ?>
      <?php if (!$etudiants): ?>
        <tr><td colspan="6" class="empty">Aucun étudiant enregistré pour le moment.</td></tr>
      <?php endif; ?>
    </tbody>
  </table>
</div>

<div class="modal-overlay" id="studentDetailModal" role="dialog" aria-modal="true" aria-labelledby="detailStudentTitle">
  <div class="modal-box modal-box--left">
    <h3 id="detailStudentTitle">Fiche étudiant</h3>
    <p id="detailStudentSub" class="muted" style="margin-bottom:1rem;"></p>
    <dl class="detail-list" id="detailStudentList"></dl>
    <div class="modal-actions" style="margin-top:1.25rem;">
      <button type="button" class="btn btn-secondary" id="closeDetailBtn">Fermer</button>
      <a href="notesEtudiant.php" class="btn btn-primary" id="detailReleveLink">Voir le relevé</a>
    </div>
  </div>
</div>
<?php include('footer.php'); ?>
