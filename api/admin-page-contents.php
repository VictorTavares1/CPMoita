<?php
require_once 'db.php';
require_once 'auth-check.php';

$user = validateToken($conn);
if (!$user) {
    http_response_code(401);
    echo json_encode(['error' => 'Não autorizado']);
    exit();
}

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    $result = $conn->query("SELECT id, nomePagina, chaveSecção, tipoConteudo, conteudoPagina, atualizadoEm FROM page_contents ORDER BY nomePagina, id ASC");
    $rows = [];
    while ($row = $result->fetch_assoc()) $rows[] = $row;
    echo json_encode($rows);

} elseif ($method === 'PUT') {
    $data   = json_decode(file_get_contents('php://input'), true);
    $id     = intval($data['id']     ?? 0);
    $valor  = trim($data['conteudoPagina'] ?? '');

    if (!$id) { http_response_code(400); echo json_encode(['error' => 'ID inválido']); exit(); }

    $stmt = $conn->prepare("UPDATE page_contents SET conteudoPagina=?, atualizadoEm=NOW() WHERE id=?");
    $stmt->bind_param('si', $valor, $id);
    $stmt->execute();
    echo json_encode(['success' => true]);
}
