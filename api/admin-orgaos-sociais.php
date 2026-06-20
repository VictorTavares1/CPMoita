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
    $result = $conn->query("SELECT id, cargo, secao, nome, idState FROM orgaos_sociais ORDER BY secao ASC, id ASC");
    $rows = [];
    while ($row = $result->fetch_assoc()) {
        $row['id']      = (int)$row['id'];
        $row['idState'] = (int)$row['idState'];
        $rows[] = $row;
    }
    echo json_encode($rows);

} elseif ($method === 'POST') {
    $data  = json_decode(file_get_contents('php://input'), true);
    $cargo = trim($data['cargo'] ?? '');
    $secao = trim($data['secao'] ?? '');
    $nome  = trim($data['nome']  ?? '');

    if (!$cargo || !$secao || !$nome) {
        http_response_code(400);
        echo json_encode(['error' => 'Campos obrigatórios em falta']);
        exit();
    }
    if (!in_array($secao, ['direcao', 'conselho_fiscal'])) {
        http_response_code(400);
        echo json_encode(['error' => 'Secção inválida']);
        exit();
    }

    $stmt = $conn->prepare("INSERT INTO orgaos_sociais (cargo, secao, nome, idState) VALUES (?, ?, ?, 1)");
    $stmt->bind_param('sss', $cargo, $secao, $nome);
    $stmt->execute();
    echo json_encode(['success' => true, 'id' => $conn->insert_id]);

} elseif ($method === 'PUT') {
    $data  = json_decode(file_get_contents('php://input'), true);
    $id    = intval($data['id']    ?? 0);
    $cargo = trim($data['cargo']   ?? '');
    $secao = trim($data['secao']   ?? '');
    $nome  = trim($data['nome']    ?? '');

    if (!$id || !$cargo || !$secao || !$nome) {
        http_response_code(400);
        echo json_encode(['error' => 'Campos obrigatórios em falta']);
        exit();
    }
    if (!in_array($secao, ['direcao', 'conselho_fiscal'])) {
        http_response_code(400);
        echo json_encode(['error' => 'Secção inválida']);
        exit();
    }

    $stmt = $conn->prepare("UPDATE orgaos_sociais SET cargo=?, secao=?, nome=? WHERE id=?");
    $stmt->bind_param('sssi', $cargo, $secao, $nome, $id);
    $stmt->execute();
    echo json_encode(['success' => true]);

} elseif ($method === 'DELETE') {
    $id = intval($_GET['id'] ?? 0);
    if (!$id) { http_response_code(400); echo json_encode(['error' => 'ID inválido']); exit(); }

    $stmt = $conn->prepare("UPDATE orgaos_sociais SET idState = IF(idState=1, 2, 1) WHERE id=?");
    $stmt->bind_param('i', $id);
    $stmt->execute();
    echo json_encode(['success' => true]);
}
