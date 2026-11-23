<?php

include('connect.inc.php');

$nbMatieres = (int)$db->query("SELECT COUNT(*) FROM matiere")->fetchColumn();
$nbEpreuves = (int)$db->query("SELECT COUNT(*) FROM epreuve")->fetchColumn();
$prochaines = $db->query("SELECT e.numepreuve, e.datepreuve, e.Lieu, m.libelle
                          FROM epreuve e LEFT JOIN matiere m ON m.codemat = e.codemat
                          ORDER BY e.datepreuve DESC LIMIT 5")->fetchAll();

$pageTitle = 'Tableau de bord';
$active = 'index';
include('header.php');
?>
    <div class="stats-grid">
        <div class="stat-card">
            <h3>Matières</h3>
            <div class="number"><?= $nbMatieres ?></div>
            <p class="muted">Modules enregistrés</p>
            <a href="afficheM.php" class="btn btn-secondary">Voir les matières</a>
        </div>
        <div class="stat-card">
            <h3>Épreuves</h3>
            <div class="number"><?= $nbEpreuves ?></div>
            <p class="muted">Examens et contrôles planifiés</p>
            <a href="afficheE.php" class="btn btn-secondary">Voir les épreuves</a>
        </div>
    </div>

    <h2 class="section-title">Dernières épreuves</h2>
    <div class="table-card">
        <table>
            <thead><tr><th>N°</th><th>Date</th><th>Lieu</th><th>Matière</th></tr></thead>
            <tbody>
            <?php foreach ($prochaines as $p): ?>
                <tr>
                    <td><strong>#<?= e($p['numepreuve']) ?></strong></td>
                    <td><?= $p['datepreuve'] ? e(date('d/m/Y', strtotime($p['datepreuve']))) : '—' ?></td>
                    <td><?= e($p['Lieu'] ?? '—') ?></td>
                    <td><?= e($p['libelle'] ?? '—') ?></td>
                </tr>
            <?php endforeach; ?>
            <?php if (!$prochaines): ?>
                <tr><td colspan="4" class="empty">Aucune épreuve pour le moment.</td></tr>
            <?php endif; ?>
            </tbody>
        </table>
    </div>
<?php include('footer.php'); ?>