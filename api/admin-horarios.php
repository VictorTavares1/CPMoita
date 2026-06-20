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
    $result = $conn->query("SELECT id, nome, entradas, ordem, idState FROM horarios ORDER BY ordem ASC, id ASC");
    $rows = [];
    while ($row = $result->fetch_assoc()) {
        $row['id']      = (int)$row['id'];
        $row['ordem']   = (int)$row['ordem'];
        $row['idState'] = (int)$row['idState'];
        $row['entradas'] = $row['entradas'] ? (json_decode($row['entradas'], true) ?? []) : [];
        $rows[] = $row;
    }
    echo json_encode($rows);

} elseif ($method === 'POST') {
    $data    = json_decode(file_get_contents('php://input'), true);
    $nome    = trim($data['nome'] ?? '');
    $entradas = isset($data['entradas']) && is_array($data['entradas']) ? $data['entradas'] : [];
    $ordem   = intval($data['ordem'] ?? 0);

    if (!$nome) {
        http_response_code(400);
        echo json_encode(['error' => 'Nome obrigatório']);
        exit();
    }

    $entradasJson = json_encode($entradas, JSON_UNESCAPED_UNICODE);
    $stmt = $conn->prepare("INSERT INTO horarios (nome, entradas, ordem, idState) VALUES (?, ?, ?, 1)");
    $stmt->bind_param('ssi', $nome, $entradasJson, $ordem);
    $stmt->execute();
    echo json_encode(['success' => true, 'id' => $conn->insert_id]);

} elseif ($method === 'PUT') {
    $data    = json_decode(file_get_contents('php://input'), true);
    $id      = intval($data['id'] ?? 0);
    $nome    = trim($data['nome'] ?? '');
    $entradas = isset($data['entradas']) && is_array($data['entradas']) ? $data['entradas'] : [];
    $ordem   = intval($data['ordem'] ?? 0);

    if (!$id || !$nome) {
        http_response_code(400);
        echo json_encode(['error' => 'Campos obrigatórios em falta']);
        exit();
    }

    $entradasJson = json_encode($entradas, JSON_UNESCAPED_UNICODE);
    $stmt = $conn->prepare("UPDATE horarios SET nome=?, entradas=?, ordem=? WHERE id=?");
    $stmt->bind_param('ssii', $nome, $entradasJson, $ordem, $id);
    $stmt->execute();
    echo json_encode(['success' => true]);

} elseif ($method === 'DELETE') {
    $id = intval($_GET['id'] ?? 0);
    if (!$id) { http_response_code(400); echo json_encode(['error' => 'ID inválido']); exit(); }

    $stmt = $conn->prepare("UPDATE horarios SET idState = IF(idState=1, 2, 1) WHERE id=?");
    $stmt->bind_param('i', $id);
    $stmt->execute();
    echo json_encode(['success' => true]);
}
