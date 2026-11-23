<?php
require_once('auth.php');
require_once('connect.inc.php');
exigerProf();

// Statistiques globales du tableau de bord
$nbEtudiants = (int) $dbh->query('SELECT COUNT(*) FROM etudiant')->fetchColumn();
$nbMatieres  = (int) $dbh->query('SELECT COUNT(*) FROM matiere')->fetchColumn();
$nbEpreuves  = (int) $dbh->query('SELECT COUNT(*) FROM epreuve')->fetchColumn();
$nbNotes     = (int) $dbh->query('SELECT COUNT(*) FROM notation')->fetchColumn();
$moyRaw      = $dbh->query('SELECT AVG(note) FROM notation')->fetchColumn();
$moyClasse   = ($moyRaw !== false && $moyRaw !== null) ? (float) $moyRaw : null;

// 6 dernières épreuves planifiées
$sth = $dbh->query(
    'SELECT e.numepreuve, e.datepreuve, e.Lieu, e.type_eval, e.codemat, m.libelle
     FROM epreuve e
     LEFT JOIN matiere m ON m.codemat = e.codemat
     ORDER BY e.datepreuve DESC, e.numepreuve DESC
     LIMIT 6'
);
$prochaines = $sth->fetchAll(PDO::FETCH_ASSOC);

$pageTitle = 'Tableau de bord';
$active    = 'index';
include('header.php');
?>
<div class="page-header">
  <div>
    <h1>Tableau de bord Professeur</h1>
    <p>Vue globale des étudiants, des matières, des épreuves et des résultats enregistrés.</p>
  </div>
  <div class="header-actions">
    <a href="formInsertEtu.php" class="btn btn-secondary">+ Ajouter un étudiant</a>
    <a href="formInsertNote.php" class="btn btn-primary">+ Note par CIN</a>
  </div>
</div>

<div class="stats-grid stats-grid--3">
  <div class="stat-card">
    <h3>Étudiants</h3>
    <div class="number"><?= $nbEtudiants ?></div>
    <p class="muted">Étudiants inscrits</p>
    <a href="afficheEtu.php" class="btn btn-secondary">Gérer les étudiants</a>
  </div>
  <div class="stat-card">
    <h3>Matières</h3>
    <div class="number"><?= $nbMatieres ?></div>
    <p class="muted">Modules académiques actifs</p>
    <a href="afficheM.php" class="btn btn-secondary">Voir les matières</a>
  </div>
  <div class="stat-card">
    <h3>Épreuves</h3>
    <div class="number"><?= $nbEpreuves ?></div>
    <p class="muted">Examens et contrôles planifiés</p>
    <a href="afficheE.php" class="btn btn-secondary">Voir les épreuves</a>
  </div>
  <div class="stat-card">
    <h3>Notes saisies</h3>
    <div class="number"><?= $nbNotes ?></div>
    <p class="muted">Moy. globale <?= $moyClasse !== null ? formaterNote($moyClasse) . '/20' : '—' ?></p>
    <a href="notesProf.php" class="btn btn-primary">Gérer les notes</a>
  </div>
</div>

<h2 class="section-title">Dernières épreuves planifiées</h2>
<div class="table-card">
  <table>
    <thead>
      <tr>
        <th>N° épreuve</th>
        <th>Date</th>
        <th>Lieu / salle</th>
        <th>Matière</th>
      </tr>
    </thead>
    <tbody>
      <?php foreach ($prochaines as $p): ?>
        <tr>
          <td data-label="N° épreuve">
            <span class="type-tag"><?= e($p['type_eval'] ?? 'Examen') ?></span>
            <strong>#<?= e($p['numepreuve']) ?></strong>
          </td>
          <td data-label="Date"><?= e(formaterDate($p['datepreuve'])) ?></td>
          <td data-label="Lieu / salle"><?= e($p['Lieu'] ?? '—') ?></td>
          <td data-label="Matière"><span class="badge"><?= e($p['codemat']) ?></span><?= e($p['libelle'] ?? '—') ?></td>
        </tr>
      <?php endforeach; ?>
      <?php if (!$prochaines): ?>
        <tr><td colspan="4" class="empty">Aucune épreuve pour le moment.</td></tr>
      <?php endif; ?>
    </tbody>
  </table>
</div>
<?php include('footer.php'); ?>
