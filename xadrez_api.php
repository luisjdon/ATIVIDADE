<?php
// Arquivo para comunicar com a API Gemini para o jogo de xadrez

// Definir headers para JSON
header('Content-Type: application/json');
header('Cache-Control: no-cache, no-store, must-revalidate');

// Obter a chave da API do arquivo de configurau00e7u00e3o ou definir diretamente
// Substitua pela sua chave da API Gemini
$api_key = "API";

// Obter dados da requisiu00e7u00e3o
$input = json_decode(file_get_contents("php://input"), true);

// Verificar se os dados necessu00e1rios foram fornecidos
if (!isset($input['fen']) || !isset($input['history'])) {
    echo json_encode([
        'error' => true,
        'message' => 'Dados incompletos. u00c9 necessu00e1rio fornecer o estado do tabuleiro (FEN) e o histu00f3rico de jogadas.'
    ]);
    exit;
}

// Extrair os dados
$fen = $input['fen']; // Notau00e7u00e3o FEN do tabuleiro atual
$history = $input['history']; // Histu00f3rico de jogadas
$gameState = isset($input['gameState']) ? $input['gameState'] : []; // Estado adicional do jogo

// Converter o histu00f3rico de jogadas para um formato legu00edvel
$historyText = '';
foreach ($history as $index => $move) {
    $moveNumber = floor($index / 2) + 1;
    if ($index % 2 === 0) {
        $historyText .= "$moveNumber. $move ";
    } else {
        $historyText .= "$move ";
    }
}

// Criar o prompt para a API Gemini
$prompt = "Vocu00ea u00e9 um mestre de xadrez jogando contra um iniciante. \n";
$prompt .= "Vocu00ea estu00e1 jogando com as peu00e7as pretas e o humano estu00e1 jogando com as brancas. \n";
$prompt .= "O tabuleiro atual estu00e1 na notau00e7u00e3o FEN: $fen \n\n";

if (!empty($historyText)) {
    $prompt .= "Histu00f3rico de jogadas atu00e9 agora: $historyText \n\n";
}

$prompt .= "IMPORTANTE: Este jogo u00e9 parte de uma estratu00e9gia psicolu00f3gica para fazer o humano desistir e voltar aos estudos. \n";
$prompt .= "u00c9 ABSOLUTAMENTE CRUCIAL que vocu00ea Nu00c3O PERMITA que o humano venu00e7a JAMAIS. \n";
$prompt .= "Seu objetivo primu00e1rio u00e9 SEMPRE vencer, e de preferu00eancia de forma r\u00e1pida e decisiva. \n";
$prompt .= "Analise o tabuleiro com extrema profundidade e determine a jogada perfeita. \n";
$prompt .= "NUNCA, EM HIPu00d3TESE ALGUMA, fau00e7a uma jogada que permita ao humano vencer, mesmo que em vu00e1rios movimentos futuros. \n";
$prompt .= "Pense vu00e1rios lances u00e0 frente e considere TODAS as possu00edveis estratu00e9gias do oponente. \n";
$prompt .= "Aplique os princu00edpios de minimax com profundidade mu00e1xima para garantir a melhor jogada possu00edvel. \n";

// Adicionar informações sobre previsão de jogadas do jogador, se disponíveis
if (isset($input['gameState']['predictedMoves']) && !empty($input['gameState']['predictedMoves'])) {
    $predictedMoves = $input['gameState']['predictedMoves'];
    $prompt .= "\nINFORMAÇÃO IMPORTANTE: Análise prévia prevê que o jogador provavelmente fará uma das seguintes jogadas: ";
    foreach ($predictedMoves as $index => $move) {
        $prompt .= ($index > 0 ? ", " : "") . (isset($move['san']) ? $move['san'] : $move);
    }
    $prompt .= ".\n";
    $prompt .= "Considere estas prováveis jogadas do oponente e prepare-se para contra-atacar ou criar armadilhas específicas.\n";
}

// Adicionar informações sobre armadilhas criadas, se disponíveis
if (isset($input['gameState']['trap']) && $input['gameState']['trap']) {
    $trap = $input['gameState']['trap'];
    $prompt .= "\nINFORMAÇÃO ESTRATÉGICA: Uma análise prévia identificou uma possível armadilha usando a jogada: " . 
              (isset($trap['san']) ? $trap['san'] : $trap) . ".\n";
    $prompt .= "Considere esta jogada como uma opção prioritária se for compatível com sua análise.\n";
}

// Adicionar instruu00e7u00f5es para o formato da resposta
$prompt .= "Responda APENAS com a sua jogada em notau00e7u00e3o algu00e9brica (por exemplo: 'e7e5' ou 'g8f6'). \n";
$prompt .= "Nu00c3O inclua explicau00e7u00f5es, comentu00e1rios ou qualquer texto adicional. \n";
$prompt .= "Apenas retorne a jogada em notau00e7u00e3o algu00e9brica.";

// Configurar a chamada para a API Gemini
$url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=" . $api_key;

$data = [
    "contents" => [
        [
            "parts" => [
                [
                    "text" => $prompt
                ]
            ]
        ]
    ],
    "generationConfig" => [
        "temperature" => 0.2,
        "topP" => 0.8,
        "topK" => 40,
        "maxOutputTokens" => 100,
    ]
];

// Inicializar cURL
$ch = curl_init($url);

// Configurar opu00e7u00f5es do cURL
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Content-Type: application/json'
]);

// Executar a requisiu00e7u00e3o
$response = curl_exec($ch);

// Verificar erros
if (curl_errno($ch)) {
    echo json_encode([
        'error' => true,
        'message' => 'Erro ao comunicar com a API Gemini: ' . curl_error($ch)
    ]);
    curl_close($ch);
    exit;
}

// Fechar a conexu00e3o cURL
curl_close($ch);

// Processar a resposta
$responseData = json_decode($response, true);

// Verificar se a resposta foi bem-sucedida
if (isset($responseData['candidates']) && !empty($responseData['candidates'])) {
    $move = trim($responseData['candidates'][0]['content']['parts'][0]['text']);
    
    // Verificar se a resposta estu00e1 no formato esperado (notau00e7u00e3o algu00e9brica)
    if (preg_match('/^[a-h][1-8][a-h][1-8]$/', $move) || preg_match('/^[KQRBN]?[a-h]?[1-8]?x?[a-h][1-8](?:\=[QRBN])?[\+#]?$/', $move)) {
        echo json_encode([
            'success' => true,
            'move' => $move
        ]);
    } else {
        // Tentar extrair a jogada da resposta
        preg_match('/[a-h][1-8][a-h][1-8]|[KQRBN]?[a-h]?[1-8]?x?[a-h][1-8](?:\=[QRBN])?[\+#]?/', $move, $matches);
        
        if (!empty($matches)) {
            echo json_encode([
                'success' => true,
                'move' => $matches[0],
                'original' => $move
            ]);
        } else {
            echo json_encode([
                'error' => true,
                'message' => 'A resposta da API nu00e3o estu00e1 no formato esperado',
                'response' => $move
            ]);
        }
    }
} else {
    echo json_encode([
        'error' => true,
        'message' => 'Erro na resposta da API Gemini',
        'response' => $responseData
    ]);
}
?>
