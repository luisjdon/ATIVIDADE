<?php
// Set appropriate headers for JSON response
header('Content-Type: application/json');
header('Cache-Control: no-cache, no-store, must-revalidate');

// Include the API key file
require_once 'api-key.php';
$api_key = getGeminiApiKey();

// Get parameters from request
$input = json_decode(file_get_contents("php://input"), true);

// Obter a quantidade de perguntas
$quantidade = isset($input["quantidade"]) ? intval($input["quantidade"]) : 10; // Padrão de 10 perguntas

// Limitar o número máximo de perguntas
if ($quantidade > 10) {
    $quantidade = 10;
}

// Create prompt for logic questions
$prompt = "Crie exatamente {$quantidade} questões de raciocínio lógico e pegadinhas para um desafio educacional. \n";
$prompt .= "As questões devem ser desafiadoras, mas divertidas, com pegadinhas que fazem o aluno pensar de forma não convencional.\n";
$prompt .= "Cada questão deve ter 4 alternativas de múltipla escolha, onde apenas 1 está correta.\n";
$prompt .= "Formate a resposta como um array JSON com o seguinte formato para cada questão: \n";
$prompt .= "[\n";
$prompt .= "  {\n";
$prompt .= "    \"pergunta\": \"texto da pergunta\", \n";
$prompt .= "    \"alternativas\": [\"opção A\", \"opção B\", \"opção C\", \"opção D\"], \n";
$prompt .= "    \"resposta\": \"resposta correta\",\n";
$prompt .= "    \"explicacao\": \"explicação detalhada da resposta correta\"\n";
$prompt .= "  }\n";
$prompt .= "]\n\n";
$prompt .= "A resposta correta deve ser EXATAMENTE igual a uma das alternativas.\n";
$prompt .= "Inclua questões como: problemas de lógica matemática, pegadinhas de interpretação de texto, quebra-cabeças, sequências lógicas, etc.\n";
$prompt .= "Para cada questão, forneça uma explicação detalhada da resposta correta, que ajude o aluno a entender o raciocínio por trás da solução.\n";
$prompt .= "As questões devem ser adequadas para estudantes do 7º e 8º ano (12-14 anos).\n";
$prompt .= "IMPORTANTE: Certifique-se de que a resposta esteja em um formato JSON válido, sem caracteres de escape adicionais.";

// Set up the API call to Gemini
$url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=" . $api_key;

$ch = curl_init($url);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_HTTPHEADER, array('Content-Type: application/json'));

// Prepare the request body
$body = json_encode([
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
    "temperature" => 0.7,
    "topP" => 0.95,
    "topK" => 40
  ]
]);

curl_setopt($ch, CURLOPT_POSTFIELDS, $body);

// Execute cURL request
$response = curl_exec($ch);

// Check for errors
if (curl_errno($ch)) {
    echo json_encode([
        'error' => true,
        'message' => 'Erro na requisição cURL: ' . curl_error($ch)
    ]);
    exit;
}

curl_close($ch);

// Process the response
try {
    $data = json_decode($response, true);
    
    // Check if the response has the expected structure
    if (isset($data["candidates"][0]["content"]["parts"][0]["text"])) {
        $texto = $data["candidates"][0]["content"]["parts"][0]["text"];
        
        // Extract JSON from the text (in case the API returns markdown or additional text)
        preg_match('/\[\s*\{.*\}\s*\]/s', $texto, $matches);
        
        if (!empty($matches)) {
            $jsonText = $matches[0];
            
            // Clean up the text to ensure it's valid JSON
            $jsonText = preg_replace('/```json\s*|\s*```/', '', $jsonText);
            
            // Decode the JSON
            $perguntas = json_decode($jsonText, true);
            
            if (json_last_error() === JSON_ERROR_NONE) {
                // Verificar e corrigir cada pergunta
                foreach ($perguntas as &$pergunta) {
                    // Garantir que todos os campos necessários existam
                    if (!isset($pergunta['explicacao']) && isset($pergunta['resposta'])) {
                        $pergunta['explicacao'] = "A resposta correta é: " . $pergunta['resposta'];
                    }
                }
                
                // Return the questions
                echo json_encode(["perguntas" => $perguntas]);
            } else {
                // Fallback to predefined questions if JSON is invalid
                echo json_encode(["perguntas" => getBackupQuestions($quantidade)]);
            }
        } else {
            // Fallback to predefined questions if no JSON found
            echo json_encode(["perguntas" => getBackupQuestions($quantidade)]);
        }
    } else {
        // Fallback to predefined questions if response structure is unexpected
        echo json_encode(["perguntas" => getBackupQuestions($quantidade)]);
    }
} catch (Exception $e) {
    echo json_encode([
        'error' => true,
        'message' => 'Erro ao processar resposta: ' . $e->getMessage(),
        'response' => $response
    ]);
}

/**
 * Função para obter perguntas de backup em caso de falha na API
 * @param int $quantidade Número de perguntas a retornar
 * @return array Array de perguntas de backup
 */
function getBackupQuestions($quantidade) {
    $perguntas = [
        [
            "pergunta" => "Se 5 máquinas levam 5 minutos para fazer 5 peças, quanto tempo levarão 100 máquinas para fazer 100 peças?", 
            "alternativas" => ["100 minutos", "5 minutos", "20 minutos", "500 minutos"], 
            "resposta" => "5 minutos", 
            "explicacao" => "Se 5 máquinas fazem 5 peças em 5 minutos, então 1 máquina faz 1 peça em 5 minutos. Portanto, 100 máquinas farão 100 peças em 5 minutos."
        ],
        [
            "pergunta" => "Um fazendeiro tem 17 ovelhas. Todas, exceto 9, morreram. Quantas ovelhas sobraram?", 
            "alternativas" => ["8 ovelhas", "9 ovelhas", "0 ovelhas", "17 ovelhas"], 
            "resposta" => "9 ovelhas", 
            "explicacao" => "A frase 'Todas, exceto 9, morreram' significa que 9 ovelhas sobreviveram. As outras 8 morreram."
        ],
        [
            "pergunta" => "Se você tem uma caixa com 3 bolas vermelhas, 4 bolas azuis e 5 bolas verdes, qual é o número mínimo de bolas que você precisa retirar (sem olhar) para ter certeza de que pegou pelo menos 2 bolas da mesma cor?", 
            "alternativas" => ["2 bolas", "3 bolas", "4 bolas", "5 bolas"], 
            "resposta" => "4 bolas", 
            "explicacao" => "No pior caso, você poderia pegar 1 bola de cada cor nas primeiras 3 tentativas. Na 4ª tentativa, você necessariamente pegará uma bola de uma cor que já retirou antes."
        ],
        [
            "pergunta" => "Um caracol está no fundo de um poço de 10 metros. Cada dia ele sobe 3 metros, mas à noite escorrega e desce 2 metros. Em quantos dias ele conseguirá sair do poço?", 
            "alternativas" => ["8 dias", "9 dias", "10 dias", "11 dias"], 
            "resposta" => "8 dias", 
            "explicacao" => "A cada dia, o caracol sobe efetivamente 1 metro (3 metros para cima, 2 metros para baixo). Após 7 dias, ele terá subido 7 metros. No 8º dia, ele sobe mais 3 metros, chegando aos 10 metros e saindo do poço, sem precisar escorregar de volta."
        ],
        [
            "pergunta" => "Qual número completa a sequência: 1, 4, 9, 16, 25, ?", 
            "alternativas" => ["30", "36", "42", "49"], 
            "resposta" => "36", 
            "explicacao" => "Esta sequência representa os quadrados dos números naturais: 1²=1, 2²=4, 3²=9, 4²=16, 5²=25, e portanto o próximo é 6²=36."
        ],
        [
            "pergunta" => "Se um médico te dá 3 comprimidos e te diz para tomar uma a cada meia hora, quanto tempo durarão os comprimidos?", 
            "alternativas" => ["30 minutos", "1 hora", "1 hora e 30 minutos", "2 horas"], 
            "resposta" => "1 hora", 
            "explicacao" => "Você toma a primeira pílula imediatamente, a segunda após 30 minutos e a terceira após mais 30 minutos (ou seja, 1 hora após o início). Portanto, as pílulas durarão 1 hora no total."
        ],
        [
            "pergunta" => "Um tijolo pesa 1 kg mais meio tijolo. Quanto pesa um tijolo inteiro?", 
            "alternativas" => ["1 kg", "1,5 kg", "2 kg", "2,5 kg"], 
            "resposta" => "2 kg", 
            "explicacao" => "Se chamarmos o peso do tijolo de x, temos a equação: x = 1 + x/2. Resolvendo: x - x/2 = 1, o que nos dá x/2 = 1, portanto x = 2 kg."
        ],
        [
            "pergunta" => "Se você tem 3 maçãs e tira 2, com quantas maçãs você fica?", 
            "alternativas" => ["1 maçã", "2 maçãs", "3 maçãs", "5 maçãs"], 
            "resposta" => "2 maçãs", 
            "explicacao" => "A pegadinha está no verbo 'tirar'. Se você 'tira' 2 maçãs (no sentido de pegar/segurar), você fica com essas 2 maçãs nas suas mãos."
        ],
        [
            "pergunta" => "Em uma corrida, você ultrapassa a pessoa que está em segundo lugar. Em que posição você fica?", 
            "alternativas" => ["Primeiro lugar", "Segundo lugar", "Terceiro lugar", "Depende da velocidade"], 
            "resposta" => "Segundo lugar", 
            "explicacao" => "Se você ultrapassa quem está em segundo lugar, você assume a posição dessa pessoa, ou seja, o segundo lugar. Para chegar ao primeiro lugar, você precisaria ultrapassar quem está em primeiro."
        ],
        [
            "pergunta" => "Qual é o próximo número na sequência: 1, 11, 21, 1211, 111221, ?", 
            "alternativas" => ["1231", "312211", "122221", "112231"], 
            "resposta" => "312211", 
            "explicacao" => "Esta é a sequência 'look-and-say' (olhe e diga). Cada termo descreve o anterior: 1 (um dígito 1), 11 (dois dígitos 1), 21 (um dígito 2, um dígito 1), 1211 (um dígito 1, um dígito 2, dois dígitos 1), 111221 (três dígitos 1, dois dígitos 2, um dígito 1). Portanto, o próximo é 312211 (um dígito 3, um dígito 1, dois dígitos 2, dois dígitos 1)."
        ]
    ];
    
    // Limitar ao número solicitado
    return array_slice($perguntas, 0, $quantidade);
}
?>
