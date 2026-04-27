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

// GET - list all docs
if ($method === 'GET') {
    $result = $conn->query("SELECT id, title, url, year, idType, idState FROM docs ORDER BY year DESC, title ASC");
    $docs = [];
    while ($row = $result->fetch_assoc()) {
        $row['id']      = (int)$row['id'];
        $row['idType']  = (int)$row['idType'];
        $row['idState'] = (int)$row['idState'];
        $row['year']    = $row['year'] ? (int)$row['year'] : null;
        $docs[] = $row;
    }
    echo json_encode($docs);
    exit();
}

// POST - upload new doc
if ($method === 'POST') {
    $titulo = trim($_POST['titulo'] ?? '');
    $ano    = $_POST['ano'] ?? '';
    $idType = (int)($_POST['idType'] ?? 1);

    if (!$titulo || !$ano) {
        http_response_code(400);
        echo json_encode(['error' => 'Título e ano são obrigatórios']);
        exit();
    }

    if (empty($_FILES['doc']['name'])) {
        http_response_code(400);
        echo json_encode(['error' => 'Ficheiro obrigatório']);
        exit();
    }

    $allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    $allowedExts  = ['pdf', 'doc', 'docx'];
    $ext  = strtolower(pathinfo($_FILES['doc']['name'], PATHINFO_EXTENSION));
    $mime = mime_content_type($_FILES['doc']['tmp_name']);

    if (!in_array($ext, $allowedExts) || !in_array($mime, $allowedTypes)) {
        http_response_code(400);
        echo json_encode(['error' => 'Tipo de ficheiro não permitido. Use PDF ou Word.']);
        exit();
    }

    $yearDir = __DIR__ . '/../docs/' . $ano;
    if (!is_dir($yearDir)) {
        mkdir($yearDir, 0777, true);
    }

    $nome = time() . '_' . basename($_FILES['doc']['name']);
    if (!move_uploaded_file($_FILES['doc']['tmp_name'], $yearDir . '/' . $nome)) {
        http_response_code(500);
        echo json_encode(['error' => 'Erro ao guardar o ficheiro']);
        exit();
    }

    $stmt = $conn->prepare("INSERT INTO docs (title, url, idType, year, idState) VALUES (?, ?, ?, ?, 1)");
    $stmt->bind_param('ssii', $titulo, $nome, $idType, $ano);
    $stmt->execute();
    $docId = $conn->insert_id;

    $opId = 4; $uid = $user['user_id'];
    $stmt2 = $conn->prepare("INSERT INTO logs (idUser, idOperation, idReport) VALUES (?, ?, ?)");
    $stmt2->bind_param('iii', $uid, $opId, $docId);
    $stmt2->execute();

    echo json_encode(['success' => true, 'id' => $docId]);
    exit();
}

// DELETE - toggle state
if ($method === 'DELETE') {
    $id = (int)($_GET['id'] ?? 0);
    if (!$id) { http_response_code(400); echo json_encode(['error' => 'ID inválido']); exit(); }

    $stmt = $conn->prepare("UPDATE docs SET idState = CASE WHEN idState = 1 THEN 2 ELSE 1 END WHERE id = ?");
    $stmt->bind_param('i', $id);
    $stmt->execute();

    echo json_encode(['success' => true]);
    exit();
}

http_response_code(405);
echo json_encode(['error' => 'Método não permitido']);
