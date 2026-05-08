<?php
require_once 'db.php';

$file = trim($_GET['file'] ?? '');

if (!$file) {
    http_response_code(400);
    echo 'Ficheiro não especificado';
    exit();
}

// Prevent directory traversal
$file = str_replace(['..', '\\', chr(0)], '', $file);
$file = ltrim($file, '/');

// Check docs_upload first (runtime uploads), then public/docs (static files)
$path = __DIR__ . '/../docs_upload/' . $file;
if (!file_exists($path)) {
    $path = __DIR__ . '/../public/docs/' . $file;
}

if (!file_exists($path) || !is_file($path)) {
    http_response_code(404);
    echo 'Ficheiro não encontrado';
    exit();
}

$ext  = strtolower(pathinfo($path, PATHINFO_EXTENSION));
$mime = match($ext) {
    'pdf'  => 'application/pdf',
    'doc'  => 'application/msword',
    'docx' => 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    default => 'application/octet-stream',
};

header('Content-Type: ' . $mime);
header('Content-Disposition: inline; filename="' . basename($path) . '"');
header('Content-Length: ' . filesize($path));
readfile($path);
