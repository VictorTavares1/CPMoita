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

// POST - upload image to existing news
if ($method === 'POST') {
    $newsId = (int)($_POST['newsId'] ?? 0);
    if (!$newsId || empty($_FILES['img']['name'][0])) {
        http_response_code(400); echo json_encode(['error' => 'Dados inválidos']); exit();
    }
    $uploadDir = __DIR__ . '/../uploads/';
    $inserted = [];
    $totalFiles = count($_FILES['img']['name']);
    for ($i = 0; $i < $totalFiles; $i++) {
        if ($_FILES['img']['error'][$i] === 0) {
            $nome = basename($_FILES['img']['name'][$i]);
            move_uploaded_file($_FILES['img']['tmp_name'][$i], $uploadDir . $nome);
            $stmt = $conn->prepare("INSERT INTO images (url, idNews) VALUES (?, ?)");
            $stmt->bind_param('si', $nome, $newsId);
            $stmt->execute();
            $inserted[] = ['id' => $conn->insert_id, 'url' => $nome];
        }
    }
    echo json_encode(['success' => true, 'images' => $inserted]);
    exit();
}

// DELETE - delete single image
if ($method === 'DELETE') {
    $id = (int)($_GET['id'] ?? 0);
    if (!$id) { http_response_code(400); echo json_encode(['error' => 'ID inválido']); exit(); }
    $stmt = $conn->prepare("SELECT url FROM images WHERE id = ?");
    $stmt->bind_param('i', $id);
    $stmt->execute();
    $row = $stmt->get_result()->fetch_assoc();
    if ($row) {
        $file = __DIR__ . '/../uploads/' . $row['url'];
        if (file_exists($file)) unlink($file);
        $del = $conn->prepare("DELETE FROM images WHERE id = ?");
        $del->bind_param('i', $id);
        $del->execute();
    }
    echo json_encode(['success' => true]);
    exit();
}

http_response_code(405);
echo json_encode(['error' => 'Método não permitido']);
