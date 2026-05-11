<?php
require_once 'db.php';

// Conteúdo de página muda raramente — cache de 5 minutos no browser
header('Cache-Control: public, max-age=300');

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
    $valor = $row['conteudoPagina'];
    if ($row['tipoConteudo'] === 'link') {
        $decoded = json_decode($valor, true);
        $valor = is_array($decoded) ? $decoded : $valor;
    }
    $contents[$row['chaveSecção']] = [
        'tipo'  => $row['tipoConteudo'],
        'valor' => $valor,
    ];
}

echo json_encode($contents);
