<?php
require_once 'db.php';

// Serviços mudam raramente — cache de 10 minutos no browser
header('Cache-Control: public, max-age=600');

$result = $conn->query("SELECT id, titulo, descricao, coordenador, capacidade, funcionamento, servicosPrestados, descricaoCentroDia, links, imagens, iconeOuImagem FROM services WHERE idState = 1 ORDER BY id ASC");

$services = [];
while ($row = $result->fetch_assoc()) {
    $row['servicosPrestados'] = $row['servicosPrestados'] ? json_decode($row['servicosPrestados']) : [];
    $row['links']             = $row['links']             ? json_decode($row['links'])             : [];
    $row['imagens']           = $row['imagens']           ? json_decode($row['imagens'])           : [];
    $services[] = $row;
}

echo json_encode($services);
