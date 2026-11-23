<?php
require_once('auth.php');
require_once('connect.inc.php');
exigerProf();

// Liste des matières avec le nombre d'épreuves associées
$sth = $dbh->query(
    'SELECT m.codemat, m.libelle, m.coef, COUNT(e.numepreuve) AS nb_epreuves
     FROM matiere m
     LEFT JOIN epreuve e ON e.codemat = m.codemat
     GROUP BY m.codemat, m.libelle, m.coef
     ORDER BY m.codemat ASC'
);
$matieres = $sth->fetchAll(PDO::FETCH_ASSOC);

$msg = $_GET['msg'] ?? '';
$pageTitle = 'Matières';
$active    = 'matieres';
include('header.php');
?>
<div class="page-header">
  <div>
    <h1>Gestion des matières</h1>
    <p>Consultez et administrez l'ensemble des modules académiques et leurs coefficients.</p>
  </div>
  <a href="formInsertM.php" class="btn btn-primary">+ Ajouter une matière</a>
</div>

<?php if ($msg === 'deleted'): ?>
  <div class="alert alert-success">La matière a été supprimée.</div>
<?php elseif ($msg === 'added'): ?>
  <div class="alert alert-success">Matière ajoutée avec succès.</div>
<?php endif; ?>

<div class="toolbar">
  <div class="search-box">
    <input type="search" id="tableSearch" placeholder="Rechercher par code ou libellé…" aria-label="Rechercher">
  </div>
  <span class="muted">Total : <strong id="visibleCount"><?= count($matieres) ?></strong> matière(s)</span>
</div>

<div class="table-card">
  <table id="dataTable">
    <thead>
      <tr>
        <th>Code</th>
        <th>Libellé</th>
        <th>Coefficient</th>
        <th>Épreuves liées</th>
        <th class="right">Actions</th>
      </tr>
    </thead>
    <tbody>
      <?php foreach ($matieres as $m): ?>
        <tr>
          <td data-label="Code"><span class="badge"><?= e($m['codemat']) ?></span></td>
          <td data-label="Libellé"><strong><?= e($m['libelle']) ?></strong></td>
          <td data-label="Coefficient"><?= e($m['coef']) ?></td>
          <td data-label="Épreuves liées"><?= (int) $m['nb_epreuves'] ?></td>
          <td data-label="Actions" class="right">
            <button type="button"
                    class="btn btn-danger delete-trigger"
                    data-code="<?= e($m['codemat']) ?>"
                    data-name="<?= e($m['libelle']) ?>"
                    data-count="<?= (int) $m['nb_epreuves'] ?>">
              Supprimer
            </button>
          </td>
        </tr>
      <?php endforeach; ?>
      <?php if (!$matieres): ?>
        <tr><td colspan="5" class="empty">Aucune matière enregistrée pour le moment.</td></tr>
      <?php endif; ?>
    </tbody>
  </table>
</div>

<div class="modal-overlay" id="deleteModal" role="dialog" aria-modal="true" aria-labelledby="deleteModalTitle">
  <div class="modal-box">
    <h3 id="deleteModalTitle">Confirmer la suppression</h3>
    <p id="modalText">Voulez-vous vraiment supprimer cette matière ?</p>
    <form method="post" action="suppM.php">
      <input type="hidden" name="csrf" value="<?= e($_SESSION['csrf']) ?>">
      <input type="hidden" name="codemat" id="deleteCode" value="">
      <div class="modal-actions">
        <button type="button" class="btn btn-secondary" id="cancelDeleteBtn">Annuler</button>
        <button type="submit" class="btn btn-danger-solid">Supprimer</button>
      </div>
    </form>
  </div>
</div>
<?php include('footer.php'); ?>
