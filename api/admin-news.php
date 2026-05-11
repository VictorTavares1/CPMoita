<?php
require_once 'db.php';
require_once 'auth-check.php';
require_once 'html-sanitize.php';

$user = validateToken($conn);
if (!$user) {
    http_response_code(401);
    echo json_encode(['error' => 'Não autorizado']);
    exit();
}

$method = $_SERVER['REQUEST_METHOD'];

// GET - list news with server-side pagination and search
if ($method === 'GET' && !isset($_GET['id'])) {
    $page   = max(1, (int)($_GET['page']   ?? 1));
    $limit  = min(100, max(1, (int)($_GET['limit'] ?? 20)));
    $search = trim($_GET['search'] ?? '');
    $state  = isset($_GET['state']) ? (int)$_GET['state'] : null; // 1=ativas, 2=inativas, null=todas
    $offset = ($page - 1) * $limit;

    $where  = '1=1';
    $params = [];
    $types  = '';

    if ($search !== '') {
        $where   .= ' AND title LIKE ?';
        $params[] = '%' . $search . '%';
        $types   .= 's';
    }
    if ($state !== null) {
        $where   .= ' AND idState = ?';
        $params[] = $state;
        $types   .= 'i';
    }

    // Total para paginação
    $countStmt = $conn->prepare("SELECT COUNT(*) AS total FROM news WHERE $where");
    if ($types) $countStmt->bind_param($types, ...$params);
    $countStmt->execute();
    $total = (int)$countStmt->get_result()->fetch_assoc()['total'];

    // Dados paginados
    $dataStmt = $conn->prepare("SELECT id, title, dateHour, idState FROM news WHERE $where ORDER BY dateHour DESC LIMIT ? OFFSET ?");
    $params[] = $limit;
    $params[] = $offset;
    $types   .= 'ii';
    $dataStmt->bind_param($types, ...$params);
    $dataStmt->execute();

    $news = [];
    $r = $dataStmt->get_result();
    while ($row = $r->fetch_assoc()) {
        $row['id']      = (int)$row['id'];
        $row['idState'] = (int)$row['idState'];
        $news[] = $row;
    }
    echo json_encode(['data' => $news, 'total' => $total, 'page' => $page, 'limit' => $limit]);
    exit();
}

// GET single news with images
if ($method === 'GET' && isset($_GET['id'])) {
    $id = (int)$_GET['id'];
    $stmt = $conn->prepare("SELECT id, title, content, dateHour, idState FROM news WHERE id = ?");
    $stmt->bind_param('i', $id);
    $stmt->execute();
    $row = $stmt->get_result()->fetch_assoc();
    if (!$row) { http_response_code(404); echo json_encode(['error' => 'Não encontrado']); exit(); }

    $stmt2 = $conn->prepare("SELECT id, url FROM images WHERE idNews = ?");
    $stmt2->bind_param('i', $id);
    $stmt2->execute();
    $imgs = [];
    $r2 = $stmt2->get_result();
    while ($img = $r2->fetch_assoc()) $imgs[] = $img;
    $row['images'] = $imgs;
    echo json_encode($row);
    exit();
}

// POST - create news
if ($method === 'POST') {
    $titulo   = trim($_POST['titulo'] ?? '');
    $conteudo = sanitizeHtml($_POST['conteudo'] ?? '');
    if (!$titulo || !$conteudo) {
        http_response_code(400); echo json_encode(['error' => 'Campos obrigatórios em falta']); exit();
    }
    $stmt = $conn->prepare("INSERT INTO news (title, content, dateHour, idState) VALUES (?, ?, NOW(), 1)");
    $stmt->bind_param('ss', $titulo, $conteudo);
    $stmt->execute();
    $newsId = $conn->insert_id;

    // Handle images
    if (!empty($_FILES['img']['name'][0])) {
        $allowedMimes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
        $allowedExts  = ['jpg', 'jpeg', 'png', 'gif', 'webp'];
        $maxImgBytes  = 5 * 1024 * 1024; // 5 MB por imagem
        $uploadDir    = __DIR__ . '/../uploads/';
        $finfo        = new finfo(FILEINFO_MIME_TYPE);
        $totalFiles   = count($_FILES['img']['name']);
        for ($i = 0; $i < $totalFiles; $i++) {
            if ($_FILES['img']['error'][$i] !== 0) continue;
            if ($_FILES['img']['size'][$i] > $maxImgBytes) continue;
            $mime = $finfo->file($_FILES['img']['tmp_name'][$i]);
            if (!in_array($mime, $allowedMimes, true)) continue;
            $ext = strtolower(pathinfo($_FILES['img']['name'][$i], PATHINFO_EXTENSION));
            if (!in_array($ext, $allowedExts, true)) continue;
            $nome = uniqid('img_', true) . '.' . $ext;
            move_uploaded_file($_FILES['img']['tmp_name'][$i], $uploadDir . $nome);
            $stmt2 = $conn->prepare("INSERT INTO images (url, idNews) VALUES (?, ?)");
            $stmt2->bind_param('si', $nome, $newsId);
            $stmt2->execute();
        }
    }

    // Log
    $opId = 1; $uid = $user['user_id'];
    $stmt3 = $conn->prepare("INSERT INTO logs (idUser, idOperation, idNews) VALUES (?, ?, ?)");
    $stmt3->bind_param('iii', $uid, $opId, $newsId);
    $stmt3->execute();

    echo json_encode(['success' => true, 'id' => $newsId]);
    exit();
}

// PUT - update news (title + content only; images added separately)
if ($method === 'PUT') {
    $body = json_decode(file_get_contents('php://input'), true);
    $id       = (int)($body['id'] ?? 0);
    $titulo   = trim($body['titulo'] ?? '');
    $conteudo = sanitizeHtml($body['conteudo'] ?? '');
    if (!$id || !$titulo || !$conteudo) {
        http_response_code(400); echo json_encode(['error' => 'Campos obrigatórios em falta']); exit();
    }
    $stmt = $conn->prepare("UPDATE news SET title = ?, content = ? WHERE id = ?");
    $stmt->bind_param('ssi', $titulo, $conteudo, $id);
    $stmt->execute();

    $opId = 2; $uid = $user['user_id'];
    $stmt2 = $conn->prepare("INSERT INTO logs (idUser, idOperation, idNews) VALUES (?, ?, ?)");
    $stmt2->bind_param('iii', $uid, $opId, $id);
    $stmt2->execute();

    echo json_encode(['success' => true]);
    exit();
}

// DELETE - toggle state
if ($method === 'DELETE') {
    $id = (int)($_GET['id'] ?? 0);
    if (!$id) { http_response_code(400); echo json_encode(['error' => 'ID inválido']); exit(); }

    $stmt = $conn->prepare("UPDATE news SET idState = CASE WHEN idState = 1 THEN 2 ELSE 1 END WHERE id = ?");
    $stmt->bind_param('i', $id);
    $stmt->execute();

    $opId = 3; $uid = $user['user_id'];
    $stmt = $conn->prepare("INSERT INTO logs (idUser, idOperation, idNews) VALUES (?, ?, ?)");
    $stmt->bind_param('iii', $uid, $opId, $id);
    $stmt->execute();

    echo json_encode(['success' => true]);
    exit();
}

http_response_code(405);
echo json_encode(['error' => 'Método não permitido']);
