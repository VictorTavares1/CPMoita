<?php
require_once 'db.php';
require_once 'auth-check.php';

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    $result = $conn->query("SELECT id, tipo, valor, icone, idState FROM contacts ORDER BY id ASC");
    $rows = [];
    while ($row = $result->fetch_assoc()) $rows[] = $row;
    echo json_encode($rows);

} elseif ($method === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true);
    $tipo  = trim($data['tipo']  ?? '');
    $valor = trim($data['valor'] ?? '');
    $icone = trim($data['icone'] ?? '');

    if (!$tipo || !$valor || !$icone) {
        http_response_code(400);
        echo json_encode(['error' => 'Campos obrigatórios em falta']);
        exit();
    }

    $stmt = $conn->prepare("INSERT INTO contacts (tipo, valor, icone, idState) VALUES (?, ?, ?, 1)");
    $stmt->bind_param('sss', $tipo, $valor, $icone);
    $stmt->execute();
    echo json_encode(['success' => true, 'id' => $conn->insert_id]);

} elseif ($method === 'PUT') {
    $data = json_decode(file_get_contents('php://input'), true);
    $id    = intval($data['id']    ?? 0);
    $tipo  = trim($data['tipo']    ?? '');
    $valor = trim($data['valor']   ?? '');
    $icone = trim($data['icone']   ?? '');

    if (!$id || !$tipo || !$valor || !$icone) {
        http_response_code(400);
        echo json_encode(['error' => 'Campos obrigatórios em falta']);
        exit();
    }

    $stmt = $conn->prepare("UPDATE contacts SET tipo=?, valor=?, icone=? WHERE id=?");
    $stmt->bind_param('sssi', $tipo, $valor, $icone, $id);
    $stmt->execute();
    echo json_encode(['success' => true]);

} elseif ($method === 'DELETE') {
    $id = intval($_GET['id'] ?? 0);
    if (!$id) { http_response_code(400); echo json_encode(['error' => 'ID inválido']); exit(); }

    $stmt = $conn->prepare("UPDATE contacts SET idState = IF(idState=1, 2, 1) WHERE id=?");
    $stmt->bind_param('i', $id);
    $stmt->execute();
    echo json_encode(['success' => true]);
}
