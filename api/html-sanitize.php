<?php

/**
 * Sanitiza HTML produzido pelo editor Quill antes de persistir na BD.
 * Defesa em profundidade: os dados ficam limpos na BD independentemente
 * do que o Angular faça na renderização.
 */
function sanitizeHtml(string $html): string {
    if (trim($html) === '') return '';

    // 1. Allowlist de tags — remove <script>, <iframe>, <form>, <object>, etc.
    $allowedTags = '<p><br><strong><em><u><s><h1><h2><h3><h4><h5><h6>'
                 . '<ul><ol><li><blockquote><pre><code>'
                 . '<a><img><span><div>';
    $html = strip_tags($html, $allowedTags);

    // 2. Remover event handlers com aspas: onclick="...", onerror='...'
    $html = preg_replace('/\s+on\w+\s*=\s*(["\'])[^"\']*\1/i', '', $html);
    // Remover event handlers SEM aspas: onclick=alert(1)
    $html = preg_replace('/\s+on\w+\s*=\s*[^\s>]+/i', '', $html);

    // 3. Remover javascript: em href/src com aspas
    $html = preg_replace('/\s+(href|src)\s*=\s*(["\'])\s*javascript:[^"\']*\2/i', '', $html);
    // Remover javascript: em href/src SEM aspas
    $html = preg_replace('/\s+(href|src)\s*=\s*javascript:[^\s>]*/i', '', $html);

    // 4. Remover data:text/html (vetor de XSS via data URIs)
    $html = preg_replace('/\s+(href|src)\s*=\s*(["\'])?\s*data:text\/html[^"\'>\s]*/i', '', $html);

    // 5. Remover style= (CSS injection / expression())
    $html = preg_replace('/\s+style\s*=\s*(["\'])[^"\']*\1/i', '', $html);
    $html = preg_replace('/\s+style\s*=\s*[^\s>]+/i', '', $html);

    // 6. Garantir rel="noopener noreferrer" em todos os links
    $html = preg_replace_callback(
        '/<a\s([^>]*)>/i',
        function (array $m): string {
            $attrs = $m[1];
            if (!str_contains($attrs, 'rel=')) {
                $attrs .= ' rel="noopener noreferrer"';
            }
            return '<a ' . $attrs . '>';
        },
        $html
    );

    return $html;
}
