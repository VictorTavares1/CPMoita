<?php
require_once 'db.php';

$id = isset($_GET['id']) ? (int)$_GET['id'] : 0;

if ($id <= 0) {
    http_response_code(400);
    echo json_encode(['error' => 'ID inválido']);
    exit();
}

$stmt = $conn->prepare("
    SELECT n.id, n.title, n.content, n.dateHour, i.url
    FROM news n
    LEFT JOIN images i ON i.idNews = n.id
    WHERE n.id = ? AND n.idState = 1
");
$stmt->bind_param('i', $id);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows === 0) {
    http_response_code(404);
    echo json_encode(['error' => 'Notícia não encontrada']);
    exit();
}

$news = null;
$images = [];

while ($row = $result->fetch_assoc()) {
    if ($news === null) {
        $news = [
            'id' => $row['id'],
            'title' => $row['title'],
            'content' => $row['content'],
            'dateHour' => $row['dateHour'],
        ];
    }
    if (!empty($row['url']) && !in_array($row['url'], $images)) {
        $images[] = $row['url'];
    }
}

$news['images'] = $images;

echo json_encode($news);
