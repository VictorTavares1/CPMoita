<?php
require_once 'db.php';
require_once 'auth-check.php';

$user = validateToken($conn);
if (!$user) {
    http_response_code(401);
    echo json_encode(['error' => 'Não autorizado']);
    exit();
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Método não permitido']);
    exit();
}

if (empty($_FILES['doc']['name'])) {
    http_response_code(400);
    echo json_encode(['error' => 'Nenhum ficheiro enviado']);
    exit();
}

$allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
$mime = mime_content_type($_FILES['doc']['tmp_name']);
if (!in_array($mime, $allowedTypes)) {
    http_response_code(400);
    echo json_encode(['error' => 'Tipo de ficheiro não permitido. Use PDF ou Word.']);
    exit();
}

$uploadDir = __DIR__ . '/../docs_upload/';
if (!is_dir($uploadDir)) mkdir($uploadDir, 0755, true);

$originalName = basename($_FILES['doc']['name']);
$safeName = preg_replace('/[^a-zA-Z0-9._\-\(\) ]/', '_', $originalName);

if (file_exists($uploadDir . $safeName)) {
    $info = pathinfo($safeName);
    $safeName = $info['filename'] . '_' . time() . '.' . $info['extension'];
}

if (!move_uploaded_file($_FILES['doc']['tmp_name'], $uploadDir . $safeName)) {
    http_response_code(500);
    echo json_encode(['error' => 'Erro ao guardar o ficheiro']);
    exit();
}

echo json_encode([
    'success'  => true,
    'filename' => $safeName,
    'name'     => pathinfo($safeName, PATHINFO_FILENAME),
]);
