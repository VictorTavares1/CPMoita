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

if (empty($_FILES['image']['name'])) {
    http_response_code(400);
    echo json_encode(['error' => 'Nenhum ficheiro enviado']);
    exit();
}

$maxBytes = 10 * 1024 * 1024;
if ($_FILES['image']['size'] > $maxBytes) {
    http_response_code(400);
    echo json_encode(['error' => 'Ficheiro demasiado grande. Máximo 10 MB.']);
    exit();
}

$allowedMimes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
$allowedExts  = ['jpg', 'jpeg', 'png', 'webp', 'gif'];
$ext   = strtolower(pathinfo($_FILES['image']['name'], PATHINFO_EXTENSION));
$finfo = new finfo(FILEINFO_MIME_TYPE);
$mime  = $finfo->file($_FILES['image']['tmp_name']);

if (!in_array($ext, $allowedExts, true) || !in_array($mime, $allowedMimes, true)) {
    http_response_code(400);
    echo json_encode(['error' => 'Tipo de ficheiro não permitido. Use JPG, PNG ou WebP.']);
    exit();
}

$uploadDir = realpath(__DIR__ . '/../uploads');
if ($uploadDir === false) {
    http_response_code(500);
    echo json_encode(['error' => 'Diretoria de uploads não encontrada']);
    exit();
}
$uploadDir .= '/';

$originalName = basename($_FILES['image']['name']);
$safeName = preg_replace('/[^a-zA-Z0-9._\-\(\) ]/', '_', $originalName);

if (file_exists($uploadDir . $safeName)) {
    $info = pathinfo($safeName);
    $safeName = $info['filename'] . '_' . time() . '.' . $info['extension'];
}

if (!move_uploaded_file($_FILES['image']['tmp_name'], $uploadDir . $safeName)) {
    http_response_code(500);
    echo json_encode(['error' => 'Erro ao guardar a imagem']);
    exit();
}

echo json_encode(['success' => true, 'filename' => $safeName]);
