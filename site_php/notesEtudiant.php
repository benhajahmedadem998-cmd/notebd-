<?php
require_once('auth.php');
require_once('connect.inc.php');

$isStudentRole = estEtudiant();

// Liste des étudiants (utilisée par le professeur pour changer d'étudiant)
$etudiants = $dbh->query(
    'SELECT numetu, nom, prenom, classe, ville FROM etudiant ORDER BY nom ASC, prenom ASC'
)->fetchAll(PDO::FETCH_ASSOC);

// Détermination de l'étudiant affiché (un étudiant ne voit que son propre relevé)
if ($isStudentRole && !empty($_SESSION['numetu'])) {
    $numetu = (int) $_SESSION['numetu'];
} elseif (isset($_GET['numetu'])) {
    $numetu = (int) $_GET['numetu'];
} elseif ($etudiants) {
    $numetu = (int) $etudiants[0]['numetu'];
} else {
    $numetu = 0;
}

$filtreMat = strtoupper(trim((string) ($_GET['matiere'] ?? 'ALL')));
$etudiant  = $numetu > 0 ? trouverEtudiantParId($dbh, $numetu) : null;

$matieres = $dbh->query(
    'SELECT codemat, libelle, coef FROM matiere ORDER BY codemat ASC'
)->fetchAll(PDO::FETCH_ASSOC);

// Récupération de toutes les épreuves et de la note éventuelle de l'étudiant
$stmtNotes = $dbh->prepare(
    'SELECT e.numepreuve, e.datepreuve, e.Lieu, e.type_eval, e.codemat, n.note
     FROM epreuve e
     LEFT JOIN notation n ON n.numepreuve = e.numepreuve AND n.numetu = :numetu
     ORDER BY e.datepreuve DESC'
);
$stmtNotes->execute([':numetu' => $numetu]);
$epreuvesEtudiant = $stmtNotes->fetchAll(PDO::FETCH_ASSOC);

// Regroupement des épreuves par code matière
$parMatiere      = [];
$nbEpreuvesNotees = 0;
foreach ($epreuvesEtudiant as $row) {
    $parMatiere[$row['codemat']][] = $row;
    if ($row['note'] !== null) {
        $nbEpreuvesNotees++;
    }
}

// Calcul de la moyenne par matière et de la moyenne générale pondérée par les coefficients
$sommePonderee      = 0.0;
$sommeCoefs         = 0.0;
$nbMatieresValidees = 0;
$bilanMatieres      = [];

foreach ($matieres as $m) {
    $liste   = $parMatiere[$m['codemat']] ?? [];
    $somme   = 0.0;
    $nbNotes = 0;

    foreach ($liste as $ep) {
        if ($ep['note'] !== null) {
            $somme += (float) $ep['note'];
            $nbNotes++;
        }
    }

    $moyenneMat = $nbNotes > 0 ? ($somme / $nbNotes) : null;
    if ($moyenneMat !== null) {
        $sommePonderee += $moyenneMat * (float) $m['coef'];
        $sommeCoefs    += (float) $m['coef'];
        if ($moyenneMat >= 10) {
            $nbMatieresValidees++;
        }
    }

    $bilanMatieres[] = [
        'matiere'  => $m,
        'epreuves' => $liste,
        'moyenne'  => $moyenneMat,
    ];
}

$moyenneGenerale = $sommeCoefs > 0 ? ($sommePonderee / $sommeCoefs) : null;
$mention         = calculerMention($moyenneGenerale);

$pageTitle = 'Relevé de notes';
$active    = 'notes-etudiant';
include('header.php');
?>
<div class="page-header">
  <div>
    <h1><?= $etudiant ? e($etudiant['prenom'] . ' ' . $etudiant['nom']) : 'Relevé de notes' ?></h1>
    <?php if ($etudiant): ?>
      <p>
        Relevé officiel ISET Djerba ·
        N° Étudiant #<?= (int) $etudiant['numetu'] ?>
        <?= !empty($etudiant['classe']) ? ' · ' . e($etudiant['classe']) : '' ?>
        <?= !empty($etudiant['ville']) ? ' · ' . e($etudiant['ville']) : '' ?>
      </p>
    <?php endif; ?>
  </div>

  <div class="header-actions no-print">
    <?php if (!$isStudentRole): ?>
      <form method="get" action="notesEtudiant.php" class="inline-form">
        <select name="numetu" onchange="this.form.submit()" aria-label="Choisir un étudiant" class="select-compact">
          <?php foreach ($etudiants as $eItem): ?>
            <option value="<?= (int) $eItem['numetu'] ?>" <?= ((int) $eItem['numetu'] === $numetu) ? 'selected' : '' ?>>
              #<?= (int) $eItem['numetu'] ?> — <?= e($eItem['prenom']) ?> <?= e($eItem['nom']) ?>
            </option>
          <?php endforeach; ?>
        </select>
      </form>
    <?php endif; ?>
    <button type="button" onclick="window.print()" class="btn btn-secondary">Imprimer le relevé</button>
    <?php if ($isStudentRole): ?>
      <a href="profilEtudiant.php" class="btn btn-primary">Mon profil</a>
    <?php endif; ?>
  </div>
</div>

<?php if ($isStudentRole && $etudiant && ((int) ($etudiant['profil_complete'] ?? 0) === 0)): ?>
  <div class="profile-invite no-print" role="status">
    <div>
      <strong>Votre profil étudiant n'est pas encore complété</strong>
      <p>Ajoutez votre photo de profil et vérifiez vos informations personnelles.</p>
    </div>
    <a href="profilEtudiant.php?edit=1" class="btn btn-primary btn-sm">Compléter mon profil</a>
  </div>
<?php endif; ?>

<div class="stats-grid stats-grid--3">
  <div class="stat-card">
    <h3>Moyenne générale</h3>
    <div class="number <?= ($moyenneGenerale !== null && $moyenneGenerale < 10) ? 'text-danger' : '' ?>">
      <?= $moyenneGenerale !== null ? formaterNote($moyenneGenerale) . ' / 20' : '—' ?>
    </div>
    <p class="<?= ($moyenneGenerale !== null && $moyenneGenerale >= 10) ? 'text-ok' : (($moyenneGenerale !== null) ? 'text-danger' : 'muted') ?>">
      <strong><?= e($mention) ?></strong>
    </p>
  </div>

  <div class="stat-card">
    <h3>Matières suivies</h3>
    <div class="number text-navy"><?= count($matieres) ?></div>
    <p class="muted"><?= $nbMatieresValidees ?> matière(s) validée(s)</p>
  </div>

  <div class="stat-card">
    <h3>Épreuves notées</h3>
    <div class="number text-navy"><?= $nbEpreuvesNotees ?> / <?= count($epreuvesEtudiant) ?></div>
    <p class="muted">Moyenne pondérée par coefficients</p>
  </div>
</div>

<div class="filter-bar no-print">
  <a href="notesEtudiant.php?numetu=<?= $numetu ?>&matiere=ALL"
     class="btn btn-xs <?= $filtreMat === 'ALL' ? 'btn-primary' : 'btn-secondary' ?>">Toutes les matières</a>
  <?php foreach ($matieres as $m): ?>
    <a href="notesEtudiant.php?numetu=<?= $numetu ?>&matiere=<?= urlencode($m['codemat']) ?>"
       class="btn btn-xs <?= $filtreMat === $m['codemat'] ? 'btn-primary' : 'btn-secondary' ?>">
      <?= e($m['codemat']) ?> · <?= e($m['libelle']) ?>
    </a>
  <?php endforeach; ?>
</div>

<?php if (!$bilanMatieres): ?>
  <div class="table-card">
    <table>
      <tbody>
        <tr><td class="empty">Aucune matière enregistrée pour le moment.</td></tr>
      </tbody>
    </table>
  </div>
<?php endif; ?>

<?php foreach ($bilanMatieres as $bloc): ?>
  <?php $m = $bloc['matiere']; ?>
  <?php if ($filtreMat !== 'ALL' && $m['codemat'] !== $filtreMat) continue; ?>
  <h2 class="section-title section-title--split">
    <span>
      <span class="badge"><?= e($m['codemat']) ?></span>
      <?= e($m['libelle']) ?>
      <span class="muted coef-note">(Coef. <?= e($m['coef']) ?>)</span>
    </span>
    <span class="<?= ($bloc['moyenne'] !== null && $bloc['moyenne'] < 10) ? 'text-danger' : 'text-blue' ?>">
      Moyenne : <?= $bloc['moyenne'] !== null ? formaterNote($bloc['moyenne']) . ' / 20' : 'En attente' ?>
    </span>
  </h2>

  <div class="table-card table-card--spaced">
    <table>
      <thead>
        <tr>
          <th>N° épreuve</th>
          <th>Date</th>
          <th>Lieu / salle</th>
          <th>Note / 20</th>
        </tr>
      </thead>
      <tbody>
        <?php foreach ($bloc['epreuves'] as $ep): ?>
          <tr>
            <td data-label="Épreuve">
              <span class="type-tag"><?= e($ep['type_eval'] ?? 'Examen') ?></span>
              <strong>#<?= (int) $ep['numepreuve'] ?></strong>
            </td>
            <td data-label="Date"><?= e(formaterDate($ep['datepreuve'])) ?></td>
            <td data-label="Lieu / salle"><?= e($ep['Lieu'] ?? '—') ?></td>
            <td data-label="Note / 20">
              <?php if ($ep['note'] !== null): ?>
                <strong class="<?= ((float) $ep['note'] < 10) ? 'text-danger' : 'text-ok' ?>">
                  <?= formaterNote((float) $ep['note']) ?> / 20
                </strong>
              <?php else: ?>
                <span class="muted">Non notée</span>
              <?php endif; ?>
            </td>
          </tr>
        <?php endforeach; ?>
        <?php if (!$bloc['epreuves']): ?>
          <tr><td colspan="4" class="empty">Aucune épreuve dans cette matière.</td></tr>
        <?php endif; ?>
      </tbody>
    </table>
  </div>
<?php endforeach; ?>
<?php include('footer.php'); ?>
