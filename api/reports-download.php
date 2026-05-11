<?php
require_once 'db.php';

$year = isset($_GET['year']) ? (int)$_GET['year'] : 0;
if (!$year) { http_response_code(400); exit(); }

$stmt = $conn->prepare("SELECT title, url FROM docs WHERE year = ? AND idState = 1 ORDER BY title ASC");
$stmt->bind_param('i', $year);
$stmt->execute();
$result = $stmt->get_result();

$docs = [];
while ($row = $result->fetch_assoc()) {
    $docs[] = $row;
}

if (empty($docs)) { http_response_code(404); exit(); }

$docsBase = realpath(__DIR__ . '/../docs');
if ($docsBase === false) { http_response_code(500); exit(); }
$yearBase = $docsBase . DIRECTORY_SEPARATOR . $year;

function resolveDocPath(string $base, string $url): string|false {
    $candidate = realpath($base . DIRECTORY_SEPARATOR . basename($url));
    if ($candidate === false) return false;
    if (strpos($candidate, $base . DIRECTORY_SEPARATOR) !== 0) return false;
    return $candidate;
}

// If single file, serve directly
if (count($docs) === 1) {
    $resolved = resolveDocPath($yearBase, $docs[0]['url']);
    if ($resolved === false || !is_file($resolved)) { http_response_code(404); exit(); }
    $safeName = preg_replace('/[^\w.\-]/', '_', basename($resolved));
    header('Content-Type: application/pdf');
    header('Content-Disposition: inline; filename="' . $safeName . '"');
    header('Content-Length: ' . filesize($resolved));
    readfile($resolved);
    exit();
}

// Multiple files — create ZIP on the fly
$zipName = 'Relatorios_' . $year . '.zip';
$tmpZip  = sys_get_temp_dir() . DIRECTORY_SEPARATOR . $zipName;

$zip = new ZipArchive();
if ($zip->open($tmpZip, ZipArchive::CREATE | ZipArchive::OVERWRITE) !== true) {
    http_response_code(500); exit();
}

foreach ($docs as $doc) {
    $resolved = resolveDocPath($yearBase, $doc['url']);
    if ($resolved !== false && file_exists($resolved)) {
        $entryName = preg_replace('/[^\w.\-]/', '_', $doc['title']) . '.' . pathinfo($resolved, PATHINFO_EXTENSION);
        $zip->addFile($resolved, $entryName);
    }
}
$zip->close();

header('Content-Type: application/zip');
header('Content-Disposition: attachment; filename="' . $zipName . '"');
header('Content-Length: ' . filesize($tmpZip));
readfile($tmpZip);
unlink($tmpZip);
exit();
