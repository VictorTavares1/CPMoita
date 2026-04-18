<?php
require_once 'db.php';

$pagina = isset($_GET['pagina']) ? trim($_GET['pagina']) : '';

if (empty($pagina)) {
    http_response_code(400);
    echo json_encode(['error' => 'Parâmetro pagina obrigatório']);
    exit();
}

$stmt = $conn->prepare("
    SELECT chaveSecção, tipoConteudo, conteudoPagina
    FROM page_contents
    WHERE nomePagina = ?
    ORDER BY id ASC
");
$stmt->bind_param('s', $pagina);
$stmt->execute();
$result = $stmt->get_result();

$contents = [];
while ($row = $result->fetch_assoc()) {
    $contents[$row['chaveSecção']] = [
        'tipo' => $row['tipoConteudo'],
        'valor' => $row['conteudoPagina'],
    ];
}

echo json_encode($contents);
