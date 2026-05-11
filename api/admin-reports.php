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
    $ano    = (int)($_POST['ano'] ?? 0);
    $idType = (int)($_POST['idType'] ?? 1);

    if (!$titulo) {
        http_response_code(400);
        echo json_encode(['error' => 'Título é obrigatório']);
        exit();
    }
    // Ano válido: 1900–2100 apenas (impede path traversal via valor numérico)
    if ($ano < 1900 || $ano > 2100) {
        http_response_code(400);
        echo json_encode(['error' => 'Ano inválido']);
        exit();
    }

    if (empty($_FILES['doc']['name'])) {
        http_response_code(400);
        echo json_encode(['error' => 'Ficheiro obrigatório']);
        exit();
    }

    // Limite de tamanho: 20 MB
    $maxBytes = 20 * 1024 * 1024;
    if ($_FILES['doc']['size'] > $maxBytes) {
        http_response_code(400);
        echo json_encode(['error' => 'Ficheiro demasiado grande. Máximo 20 MB.']);
        exit();
    }

    // Validação de tipo via finfo (mais fiável que mime_content_type)
    $allowedMimes = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ];
    $allowedExts = ['pdf', 'doc', 'docx'];
    $ext  = strtolower(pathinfo($_FILES['doc']['name'], PATHINFO_EXTENSION));
    $finfo = new finfo(FILEINFO_MIME_TYPE);
    $mime  = $finfo->file($_FILES['doc']['tmp_name']);

    if (!in_array($ext, $allowedExts, true) || !in_array($mime, $allowedMimes, true)) {
        http_response_code(400);
        echo json_encode(['error' => 'Tipo de ficheiro não permitido. Use PDF ou Word.']);
        exit();
    }

    // Construir path seguro: usar apenas o ano já validado como inteiro
    $docsBase = realpath(__DIR__ . '/../public/docs');
    if ($docsBase === false) {
        http_response_code(500);
        echo json_encode(['error' => 'Diretoria de documentos não encontrada']);
        exit();
    }
    $yearDir = $docsBase . DIRECTORY_SEPARATOR . $ano;

    // Confirmar que yearDir é filho direto de docsBase
    if (strpos($yearDir . DIRECTORY_SEPARATOR, $docsBase . DIRECTORY_SEPARATOR) !== 0) {
        http_response_code(400);
        echo json_encode(['error' => 'Caminho inválido']);
        exit();
    }

    if (!is_dir($yearDir)) {
        mkdir($yearDir, 0755, true);
    }

    // Nome do ficheiro: apenas caracteres seguros + extensão validada
    $safeName = preg_replace('/[^a-zA-Z0-9_\-]/', '_', pathinfo($_FILES['doc']['name'], PATHINFO_FILENAME));
    $safeName = substr($safeName, 0, 80);
    $nome     = time() . '_' . $safeName . '.' . $ext;

    if (!move_uploaded_file($_FILES['doc']['tmp_name'], $yearDir . DIRECTORY_SEPARATOR . $nome)) {
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
