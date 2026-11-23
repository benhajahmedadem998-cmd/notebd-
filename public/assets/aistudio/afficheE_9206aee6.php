<?php
include('connect.inc.php');

$epreuves = $db->query("SELECT e.*, m.libelle
                        FROM epreuve e LEFT JOIN matiere m ON e.codemat = m.codemat
                        ORDER BY e.datepreuve DESC, e.numepreuve DESC")->fetchAll();

$pageTitle = 'Épreuves';
$active = 'epreuves';
include('header.php');
?>
    <div class="page-header">
        <div>
            <h1>Planning des épreuves</h1>
            <p>Dates, salles et matières associées aux examens.</p>
        </div>
        <a href="formInsertE.php" class="btn btn-primary">+ Planifier une épreuve</a>
    </div>

    <?php if (($_GET['msg'] ?? '') === 'added'): ?>
        <div class="alert alert-success">Épreuve planifiée avec succès.</div>
    <?php endif; ?>

    <div class="toolbar">
        <div class="search-box">
            <input type="search" id="tableSearch" placeholder="Rechercher par numéro, lieu, matière…" aria-label="Rechercher">
        </div>
        <span class="muted">Total : <strong><?= count($epreuves) ?></strong> épreuve(s)</span>
    </div>

    <div class="table-card">
        <table id="dataTable">
            <thead><tr><th>N° épreuve</th><th>Date</th><th>Lieu / salle</th><th>Matière</th></tr></thead>
            <tbody>
            <?php foreach ($epreuves as $ep): ?>
                <tr>
                    <td><strong>#<?= e($ep['numepreuve']) ?></strong></td>
                    <td><?= $ep['datepreuve'] ? e(date('d/m/Y', strtotime($ep['datepreuve']))) : '—' ?></td>
                    <td><?= e($ep['Lieu'] ?? '—') ?></td>
                    <td>
                        <span class="badge"><?= e($ep['codemat']) ?></span>
                        <?php if (!empty($ep['libelle'])): ?><span class="muted"><?= e($ep['libelle']) ?></span><?php endif; ?>
                    </td>
                </tr>
            <?php endforeach; ?>
            <?php if (!$epreuves): ?>
                <tr><td colspan="4" class="empty">Aucune épreuve planifiée.</td></tr>
            <?php endif; ?>
            </tbody>
        </table>
    </div>
<?php include('footer.php'); ?>
