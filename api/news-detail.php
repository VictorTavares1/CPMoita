<?php
require_once 'db.php';

// Detalhe de notícia — cache de 5 minutos
header('Cache-Control: public, max-age=300');

$id = isset($_GET['id']) ? (int)$_GET['id'] : 0;

if ($id <= 0) {
    http_response_code(400);
    echo json_encode(['error' => 'ID inválido']);
    exit();
}

$stmt = $conn->prepare("SELECT id, title, content, dateHour FROM news WHERE id = ? AND idState = 1");
$stmt->bind_param('i', $id);
$stmt->execute();
$news = $stmt->get_result()->fetch_assoc();

if (!$news) {
    http_response_code(404);
    echo json_encode(['error' => 'Notícia não encontrada']);
    exit();
}

$news['id'] = (int)$news['id'];

$imgStmt = $conn->prepare("SELECT url FROM images WHERE idNews = ?");
$imgStmt->bind_param('i', $id);
$imgStmt->execute();
$imgResult = $imgStmt->get_result();

$images = [];
while ($img = $imgResult->fetch_assoc()) {
    $images[] = $img['url'];
}
$news['images'] = $images;

echo json_encode($news);
