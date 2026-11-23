<?php
require_once('auth.php');
require_once('connect.inc.php');
exigerProf();

// Liste complète des épreuves triées de la plus récente à la plus ancienne
$sth = $dbh->query(
    'SELECT e.numepreuve, e.datepreuve, e.Lieu, e.type_eval, e.codemat, m.libelle
     FROM epreuve e
     LEFT JOIN matiere m ON m.codemat = e.codemat
     ORDER BY e.datepreuve DESC, e.numepreuve DESC'
);
$epreuves = $sth->fetchAll(PDO::FETCH_ASSOC);

$pageTitle = 'Épreuves';
$active    = 'epreuves';
include('header.php');
?>
<div class="page-header">
  <div>
    <h1>Calendrier des épreuves</h1>
    <p>Liste complète des épreuves et examens programmés par matière.</p>
  </div>
  <a href="formInsertE.php" class="btn btn-primary">+ Planifier une épreuve</a>
</div>

<?php if (($_GET['msg'] ?? '') === 'added'): ?>
  <div class="alert alert-success">Épreuve ajoutée avec succès.</div>
<?php endif; ?>

<div class="toolbar">
  <div class="search-box">
    <input type="search" id="tableSearch" placeholder="Rechercher par numéro, lieu ou matière…" aria-label="Rechercher">
  </div>
  <span class="muted">Total : <strong id="visibleCount"><?= count($epreuves) ?></strong> épreuve(s)</span>
</div>

<div class="table-card">
  <table id="dataTable">
    <thead>
      <tr>
        <th>N° épreuve</th>
        <th>Date</th>
        <th>Lieu / salle</th>
        <th>Matière</th>
      </tr>
    </thead>
    <tbody>
      <?php foreach ($epreuves as $ep): ?>
        <tr>
          <td data-label="N° épreuve">
            <span class="type-tag"><?= e($ep['type_eval'] ?? 'Examen') ?></span>
            <strong>#<?= e($ep['numepreuve']) ?></strong>
          </td>
          <td data-label="Date"><?= e(formaterDate($ep['datepreuve'])) ?></td>
          <td data-label="Lieu / salle"><?= e($ep['Lieu'] ?? '—') ?></td>
          <td data-label="Matière"><span class="badge"><?= e($ep['codemat']) ?></span><?= e($ep['libelle'] ?? '—') ?></td>
        </tr>
      <?php endforeach; ?>
      <?php if (!$epreuves): ?>
        <tr><td colspan="4" class="empty">Aucune épreuve planifiée pour le moment.</td></tr>
      <?php endif; ?>
    </tbody>
  </table>
</div>
<?php include('footer.php'); ?>
