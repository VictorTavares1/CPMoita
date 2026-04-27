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

// If single file, serve directly
if (count($docs) === 1) {
    $file = __DIR__ . '/../docs/' . $year . '/' . $docs[0]['url'];
    if (!file_exists($file)) { http_response_code(404); exit(); }
    header('Content-Type: application/pdf');
    header('Content-Disposition: inline; filename="' . basename($file) . '"');
    readfile($file);
    exit();
}

// Multiple files — create ZIP on the fly
$zipName = 'Relatorios_' . $year . '.zip';
$tmpZip  = sys_get_temp_dir() . '/' . $zipName;

$zip = new ZipArchive();
if ($zip->open($tmpZip, ZipArchive::CREATE | ZipArchive::OVERWRITE) !== true) {
    http_response_code(500); exit();
}

foreach ($docs as $doc) {
    $file = __DIR__ . '/../docs/' . $year . '/' . $doc['url'];
    if (file_exists($file)) {
        $zip->addFile($file, $doc['title'] . '.' . pathinfo($file, PATHINFO_EXTENSION));
    }
}
$zip->close();

header('Content-Type: application/zip');
header('Content-Disposition: attachment; filename="' . $zipName . '"');
header('Content-Length: ' . filesize($tmpZip));
readfile($tmpZip);
unlink($tmpZip);
exit();
