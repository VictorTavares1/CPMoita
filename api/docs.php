<?php
require_once 'db.php';

$file = trim($_GET['file'] ?? '');

if (!$file) {
    http_response_code(400);
    echo 'Ficheiro não especificado';
    exit();
}

// Bases de dados permitidas (resolvidas em absoluto, sem symlinks)
$bases = [
    realpath(__DIR__ . '/../docs_upload'),
    realpath(__DIR__ . '/../public/docs'),
];

$resolvedPath = null;
foreach ($bases as $base) {
    if ($base === false) continue;
    // Candidato: juntar base + ficheiro SEM manipulação de strings
    $candidate = realpath($base . DIRECTORY_SEPARATOR . $file);
    // realpath() devolve false se o ficheiro não existir ou se for simbólico para fora
    if ($candidate === false) continue;
    // Verificar que o path real começa exactamente na base autorizada
    if (strpos($candidate, $base . DIRECTORY_SEPARATOR) === 0 || $candidate === $base) {
        $resolvedPath = $candidate;
        break;
    }
}

if ($resolvedPath === null || !is_file($resolvedPath)) {
    http_response_code(404);
    echo 'Ficheiro não encontrado';
    exit();
}

// Apenas extensões de documento são servidas
$ext  = strtolower(pathinfo($resolvedPath, PATHINFO_EXTENSION));
$mime = match($ext) {
    'pdf'  => 'application/pdf',
    'doc'  => 'application/msword',
    'docx' => 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    default => null,
};

if ($mime === null) {
    http_response_code(403);
    echo 'Tipo de ficheiro não permitido';
    exit();
}

// Sanitizar o nome para o header Content-Disposition
$safeName = preg_replace('/[^\w.\-]/', '_', basename($resolvedPath));

header('Content-Type: ' . $mime);
header('Content-Disposition: inline; filename="' . $safeName . '"');
header('Content-Length: ' . filesize($resolvedPath));
readfile($resolvedPath);
