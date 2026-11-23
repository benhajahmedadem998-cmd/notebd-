<?php
include('connect.inc.php');

if (session_status() === PHP_SESSION_NONE) {
    session_start();
}
if (empty($_SESSION['csrf']) || !is_string($_SESSION['csrf'])) {
    $_SESSION['csrf'] = bin2hex(random_bytes(32));
}

$matieres = $db->query("SELECT m.*, COUNT(e.numepreuve) AS nb_epreuves
                        FROM matiere m LEFT JOIN epreuve e ON e.codemat = m.codemat
                        GROUP BY m.codemat, m.libelle, m.coef
                        ORDER BY m.codemat ASC")->fetchAll();

$pageTitle = 'Matières';
$active = 'matieres';
include('header.php');
?>
    <div class="page-header">
        <div>
            <h1>Gestion des matières</h1>
            <p>Consultez, recherchez ou supprimez les matières enregistrées.</p>
        </div>
        <a href="formInsertM.php" class="btn btn-primary">+ Ajouter une matière</a>
    </div>

    <?php if (($_GET['msg'] ?? '') === 'deleted'): ?>
        <div class="alert alert-success">La matière a été supprimée.</div>
    <?php elseif (($_GET['msg'] ?? '') === 'added'): ?>
        <div class="alert alert-success">Matière ajoutée avec succès.</div>
    <?php endif; ?>

    <div class="toolbar">
        <div class="search-box">
            <input type="search" id="tableSearch" placeholder="Rechercher par code ou libellé…" aria-label="Rechercher">
        </div>
        <span class="muted">Total : <strong><?= count($matieres) ?></strong> matière(s)</span>
    </div>

    <div class="table-card">
        <table id="dataTable">
            <thead>
                <tr><th>Code</th><th>Libellé</th><th>Coefficient</th><th>Épreuves liées</th><th class="right">Actions</th></tr>
            </thead>
            <tbody>
            <?php foreach ($matieres as $m): ?>
                <tr>
                    <td><span class="badge"><?= e($m['codemat']) ?></span></td>
                    <td><strong><?= e($m['libelle']) ?></strong></td>
                    <td><?= e($m['coef']) ?></td>
                    <td><?= (int)$m['nb_epreuves'] ?></td>
                    <td class="right">
                        <button type="button" class="btn btn-danger delete-trigger"
                                data-code="<?= e($m['codemat']) ?>"
                                data-name="<?= e($m['libelle']) ?>"
                                data-count="<?= (int)$m['nb_epreuves'] ?>">Supprimer</button>
                    </td>
                </tr>
            <?php endforeach; ?>
            <?php if (!$matieres): ?>
                <tr><td colspan="5" class="empty">Aucune matière enregistrée.</td></tr>
            <?php endif; ?>
            </tbody>
        </table>
    </div>

    <div class="modal-overlay" id="deleteModal" role="dialog" aria-modal="true" aria-labelledby="modalTitle">
        <div class="modal-box">
            <h3 id="modalTitle">Confirmer la suppression</h3>
            <p id="modalText"></p>
            <form method="post" action="suppM.php" class="modal-actions">
                <input type="hidden" name="csrf" value="<?= e($_SESSION['csrf']) ?>">
                <input type="hidden" name="codemat" id="deleteCode">
                <button type="button" class="btn btn-secondary" id="cancelDeleteBtn">Annuler</button>
                <button type="submit" class="btn btn-danger-solid">Supprimer</button>
            </form>
        </div>
    </div>
<?php include('footer.php'); ?>
