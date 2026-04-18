<?php
header('Access-Control-Allow-Origin: http://localhost:4200');
header('Content-Type: application/json; charset=utf-8');

$docsBase = __DIR__ . '/../../centro-paroquial-moita/docs/';

if (!is_dir($docsBase)) {
    echo json_encode([]);
    exit;
}

$items = scandir($docsBase);
$years = [];

foreach ($items as $item) {
    if ($item === '.' || $item === '..') continue;
    if (is_dir($docsBase . $item) && preg_match('/^[0-9]{4}$/', $item)) {
        $years[] = (int)$item;
    }
}

rsort($years);

echo json_encode($years);
