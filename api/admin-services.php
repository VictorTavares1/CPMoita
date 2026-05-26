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
    $result = $conn->query("SELECT id, titulo, descricao, coordenador, capacidade, funcionamento, servicosPrestados, descricaoCentroDia, links, iconeOuImagem, idState FROM services ORDER BY id ASC");
    $rows = [];
    while ($row = $result->fetch_assoc()) {
        $row['id']                = (int)$row['id'];
        $row['idState']           = (int)$row['idState'];
        $row['servicosPrestados'] = $row['servicosPrestados'] ? (json_decode($row['servicosPrestados'], true) ?? []) : [];
        $row['links']             = $row['links']             ? (json_decode($row['links'],             true) ?? []) : [];
        $rows[] = $row;
    }
    echo json_encode($rows);

} elseif ($method === 'POST') {
    $data         = json_decode(file_get_contents('php://input'), true);
    $titulo       = trim($data['titulo']       ?? '');
    $descricao    = trim($data['descricao']    ?? '');
    $iconeOuImagem = trim($data['iconeOuImagem'] ?? '');

    if (!$titulo || !$descricao || !$iconeOuImagem) {
        http_response_code(400);
        echo json_encode(['error' => 'Campos obrigatórios em falta']);
        exit();
    }

    $stmt = $conn->prepare("INSERT INTO services (titulo, descricao, iconeOuImagem, idState) VALUES (?, ?, ?, 1)");
    $stmt->bind_param('sss', $titulo, $descricao, $iconeOuImagem);
    $stmt->execute();
    echo json_encode(['success' => true, 'id' => $conn->insert_id]);

} elseif ($method === 'PUT') {
    $data          = json_decode(file_get_contents('php://input'), true);
    $id            = intval($data['id']            ?? 0);
    $titulo        = trim($data['titulo']          ?? '');
    $descricao     = trim($data['descricao']       ?? '');
    $coordenador        = isset($data['coordenador'])        && $data['coordenador']        !== '' ? trim($data['coordenador'])        : null;
    $capacidade         = isset($data['capacidade'])         && $data['capacidade']         !== '' ? trim($data['capacidade'])         : null;
    $funcionamento      = isset($data['funcionamento'])      && $data['funcionamento']      !== '' ? trim($data['funcionamento'])      : null;
    $servicosPrestados  = isset($data['servicosPrestados'])  && is_array($data['servicosPrestados']) ? json_encode($data['servicosPrestados'], JSON_UNESCAPED_UNICODE) : null;
    $descricaoCentroDia = isset($data['descricaoCentroDia']) && $data['descricaoCentroDia'] !== '' ? trim($data['descricaoCentroDia']) : null;
    $links              = isset($data['links'])              && is_array($data['links'])              ? json_encode($data['links'],             JSON_UNESCAPED_UNICODE) : null;
    $iconeOuImagem      = trim($data['iconeOuImagem'] ?? '');

    if (!$id || !$titulo || !$descricao || !$iconeOuImagem) {
        http_response_code(400);
        echo json_encode(['error' => 'Campos obrigatórios em falta']);
        exit();
    }

    $stmt = $conn->prepare("UPDATE services SET titulo=?, descricao=?, coordenador=?, capacidade=?, funcionamento=?, servicosPrestados=?, descricaoCentroDia=?, links=?, iconeOuImagem=?, atualizadoEm=NOW() WHERE id=?");
    $stmt->bind_param('sssssssssi', $titulo, $descricao, $coordenador, $capacidade, $funcionamento, $servicosPrestados, $descricaoCentroDia, $links, $iconeOuImagem, $id);
    $stmt->execute();
    echo json_encode(['success' => true]);

} elseif ($method === 'DELETE') {
    $id = intval($_GET['id'] ?? 0);
    if (!$id) { http_response_code(400); echo json_encode(['error' => 'ID inválido']); exit(); }

    $stmt = $conn->prepare("UPDATE services SET idState = IF(idState=1, 2, 1), atualizadoEm=NOW() WHERE id=?");
    $stmt->bind_param('i', $id);
    $stmt->execute();
    echo json_encode(['success' => true]);
}
