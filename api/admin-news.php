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

// GET - list all news (active + inactive for admin)
if ($method === 'GET' && !isset($_GET['id'])) {
    $result = $conn->query("SELECT id, title, dateHour, idState FROM news ORDER BY dateHour DESC");
    $news = [];
    while ($row = $result->fetch_assoc()) $news[] = $row;
    echo json_encode($news);
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
    $titulo   = $_POST['titulo'] ?? '';
    $conteudo = $_POST['conteudo'] ?? '';
    if (!$titulo || !$conteudo) {
        http_response_code(400); echo json_encode(['error' => 'Campos obrigatórios em falta']); exit();
    }
    $stmt = $conn->prepare("INSERT INTO news (title, content, dateHour, idState) VALUES (?, ?, NOW(), 1)");
    $stmt->bind_param('ss', $titulo, $conteudo);
    $stmt->execute();
    $newsId = $conn->insert_id;

    // Handle images
    if (!empty($_FILES['img']['name'][0])) {
        $uploadDir = __DIR__ . '/../uploads/';
        $totalFiles = count($_FILES['img']['name']);
        for ($i = 0; $i < $totalFiles; $i++) {
            if ($_FILES['img']['error'][$i] === 0) {
                $nome = basename($_FILES['img']['name'][$i]);
                move_uploaded_file($_FILES['img']['tmp_name'][$i], $uploadDir . $nome);
                $stmt2 = $conn->prepare("INSERT INTO images (url, idNews) VALUES (?, ?)");
                $stmt2->bind_param('si', $nome, $newsId);
                $stmt2->execute();
            }
        }
    }

    // Log
    $opId = 1; $uid = $user['user_id'];
    $stmt3 = $conn->prepare("INSERT INTO logs (dateHour, idUtilizador, idOperacao, idNoticia) VALUES (NOW(), ?, ?, ?)");
    $stmt3->bind_param('iii', $uid, $opId, $newsId);
    $stmt3->execute();

    echo json_encode(['success' => true, 'id' => $newsId]);
    exit();
}

// PUT - update news (title + content only; images added separately)
if ($method === 'PUT') {
    $body = json_decode(file_get_contents('php://input'), true);
    $id       = (int)($body['id'] ?? 0);
    $titulo   = $body['titulo'] ?? '';
    $conteudo = $body['conteudo'] ?? '';
    if (!$id || !$titulo || !$conteudo) {
        http_response_code(400); echo json_encode(['error' => 'Campos obrigatórios em falta']); exit();
    }
    $stmt = $conn->prepare("UPDATE news SET title = ?, content = ? WHERE id = ?");
    $stmt->bind_param('ssi', $titulo, $conteudo, $id);
    $stmt->execute();

    $opId = 2; $uid = $user['user_id'];
    $stmt2 = $conn->prepare("INSERT INTO logs (dateHour, idUtilizador, idOperacao, idNoticia) VALUES (NOW(), ?, ?, ?)");
    $stmt2->bind_param('iii', $uid, $opId, $id);
    $stmt2->execute();

    echo json_encode(['success' => true]);
    exit();
}

// DELETE - toggle state
if ($method === 'DELETE') {
    $id = (int)($_GET['id'] ?? 0);
    if (!$id) { http_response_code(400); echo json_encode(['error' => 'ID inválido']); exit(); }

    $conn->query("UPDATE news SET idState = CASE WHEN idState = 1 THEN 2 ELSE 1 END WHERE id = $id");

    $opId = 3; $uid = $user['user_id'];
    $stmt = $conn->prepare("INSERT INTO logs (dateHour, idUtilizador, idOperacao, idNoticia) VALUES (NOW(), ?, ?, ?)");
    $stmt->bind_param('iii', $uid, $opId, $id);
    $stmt->execute();

    echo json_encode(['success' => true]);
    exit();
}

http_response_code(405);
echo json_encode(['error' => 'Método não permitido']);
