<?php
// Set appropriate headers for JSON response
header('Content-Type: application/json');
header('Cache-Control: no-cache, no-store, must-revalidate');

// Include the API key file
require_once 'api-key.php';
$api_key = getGeminiApiKey();

// Get parameters from request
$input = json_decode(file_get_contents("php://input"), true);

// Verificar se é uma requisição para o Desafio Supremo com matérias mistas
$desafioSupremo = isset($input['desafioSupremo']) && $input['desafioSupremo'] === true;
$materiasMistas = isset($input['materiasMistas']) && $input['materiasMistas'] === true;

// Definir matéria e tópico
if ($desafioSupremo || $materiasMistas) {
    // Para o Desafio Supremo, verificar se matéria e tópico foram enviados
    // Se não, usar os valores padrão enviados ou gerar aleatoriamente
    $materia = isset($input['materia']) ? $input['materia'] : obterMateriaAleatoria();
    $topico = isset($input['topico']) ? $input['topico'] : obterTopicoAleatorio($materia);
} else {
    // Para o modo normal, usar os valores enviados
    $materia = isset($input["materia"]) ? $input["materia"] : null;
    $topico = isset($input["topico"]) ? $input["topico"] : null;
    
    // Verificar se os parâmetros necessários estão presentes
    if (!$materia || !$topico) {
        echo json_encode([
            'error' => true,
            'message' => 'Parâmetros incompletos: matéria e tópico são obrigatórios'
        ]);
        exit;
    }
}

// Obter a quantidade de perguntas
$quantidade = isset($input["quantidade"]) ? intval($input["quantidade"]) : 1;

// Limitar o número máximo de perguntas
if ($quantidade > 10) {
    $quantidade = 10;
}

// Create prompt based on parameters
if ($quantidade == 1) {
    // Single question for specific subject and topic
    $prompt = "Crie uma pergunta difícil sobre {$topico} da matéria {$materia} para aluno da 8ª série. \n"
            . "A pergunta deve ser desafiadora, mas adequada para o nível educacional.\n"
            . "Formate a resposta como um objeto JSON com o seguinte formato: \n"
            . "{ \n"
            . "  \"pergunta\": \"texto da pergunta\", \n"
            . "  \"resposta\": \"resposta correta\"\n"
            . "}\n\n"
            . "A resposta deve ser apenas o valor final, sem unidades ou explicações adicionais, a menos que seja absolutamente necessário.\n"
            . "Não inclua alternativas, a pergunta deve ter apenas uma resposta direta.";
} else {
    // Multiple questions
    $prompt = "Crie exatamente {$quantidade} questões difíceis sobre {$topico} da matéria {$materia} para aluno da 8ª série. \n"
            . "As questões devem ser desafiadoras e apropriadas para o nível educacional.\n"
            . "Cada questão deve ter uma única resposta direta.\n"
            . "Formate a resposta como um array JSON com objetos no formato: \n"
            . "{ \n"
            . "  \"pergunta\": \"texto da pergunta\", \n"
            . "  \"resposta\": \"resposta correta\"\n"
            . "}\n\n"
            . "A resposta deve ser apenas o valor final, sem unidades ou explicações adicionais.\n"
            . "As perguntas devem ser REALMENTE DIFÍCEIS, desafiadoras para um estudante da 8ª série.";
}

// Se for Desafio Supremo, adicionar instruções específicas
if ($desafioSupremo) {
    $prompt .= "\nEsta pergunta faz parte do Desafio Supremo, então deve ser especialmente desafiadora.";
}

// Initialize cURL session
$ch = curl_init();

// Set cURL options
curl_setopt($ch, CURLOPT_URL, "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=$api_key");
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);

// Create request body
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
        if ($quantidade == 1) {
            // For single question format (object)
            preg_match('/\{\s*"pergunta".*\}/s', $texto, $matches);
            
            if (!empty($matches)) {
                $jsonText = $matches[0];
                
                // Clean up the text to ensure it's valid JSON
                $jsonText = preg_replace('/```json\s*|\s*```/', '', $jsonText);
                
                // Decode the JSON
                $pergunta = json_decode($jsonText, true);
                
                if (json_last_error() === JSON_ERROR_NONE) {
                    // Adicionar informações sobre a matéria e tópico
                    $pergunta['materia'] = $materia;
                    $pergunta['topico'] = $topico;
                    
                    $perguntas = [$pergunta];
                }
            }
        } else {
            // For multiple questions format (array)
            preg_match('/\[\s*\{.*\}\s*\]/s', $texto, $matches);
            
            if (!empty($matches)) {
                $jsonText = $matches[0];
                
                // Clean up the text to ensure it's valid JSON
                $jsonText = preg_replace('/```json\s*|\s*```/', '', $jsonText);
                
                // Decode the JSON
                $perguntas = json_decode($jsonText, true);
                
                if (json_last_error() === JSON_ERROR_NONE) {
                    // Adicionar informações sobre a matéria e tópico para cada pergunta
                    foreach ($perguntas as &$pergunta) {
                        $pergunta['materia'] = $materia;
                        $pergunta['topico'] = $topico;
                    }
                }
            }
        }
        
        // If JSON decoding failed or no perguntas set, use fallback
        if (!isset($perguntas) || json_last_error() !== JSON_ERROR_NONE) {
            // Fallback to a set of predefined difficult questions from various subjects
            $perguntas = [
                ["pergunta" => "Qual é o valor de x na equação 3x² - 12 = 0?", "resposta" => "2", "materia" => $materia, "topico" => $topico],
                ["pergunta" => "Em que ano foi assinada a Lei Áurea, que aboliu oficialmente a escravidão no Brasil?", "resposta" => "1888", "materia" => $materia, "topico" => $topico],
                ["pergunta" => "Qual é o resultado de (3/4)² - (1/2)²?", "resposta" => "5/16", "materia" => $materia, "topico" => $topico],
                ["pergunta" => "Qual é o maior planeta do Sistema Solar?", "resposta" => "Júpiter", "materia" => $materia, "topico" => $topico],
                ["pergunta" => "Qual é o sujeito da frase: 'Os alunos da oitava série apresentaram um excelente projeto'?", "resposta" => "Os alunos da oitava série", "materia" => $materia, "topico" => $topico]
            ];
            
            // Limitar ao número solicitado
            $perguntas = array_slice($perguntas, 0, $quantidade);
        }
        
        // Return the questions
        echo json_encode(["perguntas" => $perguntas]);
    } else {
        throw new Exception("Formato de resposta inesperado da API Gemini");
    }
} catch (Exception $e) {
    echo json_encode([
        'error' => true,
        'message' => 'Erro ao processar resposta: ' . $e->getMessage(),
        'response' => $response
    ]);
}

/**
 * Função para obter uma matéria aleatória para o Desafio Supremo
 * @return string Nome da matéria aleatória
 */
function obterMateriaAleatoria() {
    $materias = [
        'Matemática',
        'Português',
        'Ciências',
        'História',
        'Geografia',
        'Inglês'
    ];
    
    return $materias[array_rand($materias)];
}

/**
 * Função para obter um tópico aleatório de uma matéria para o Desafio Supremo
 * @param string $materia Nome da matéria
 * @return string Nome do tópico aleatório
 */
function obterTopicoAleatorio($materia) {
    $topicos = [
        'Matemática' => ['Equações', 'Geometria', 'Aritmética', 'Probabilidade', 'Estatística', 'Álgebra', 'Trigonometria'],
        'Português' => ['Gramática', 'Interpretação de Texto', 'Literatura', 'Redação', 'Ortografia', 'Figuras de Linguagem'],
        'Ciências' => ['Biologia', 'Química', 'Física', 'Astronomia', 'Ecologia', 'Genética', 'Sistema Solar'],
        'História' => ['História do Brasil', 'História Mundial', 'História Antiga', 'Idade Média', 'História Contemporânea', 'Revoluções'],
        'Geografia' => ['Geografia do Brasil', 'Geografia Mundial', 'Cartografia', 'Clima', 'Geopolítica', 'Relevo', 'Urbanização'],
        'Inglês' => ['Gramática', 'Vocabulário', 'Interpretação de Texto', 'Conversação', 'Tempos Verbais', 'Expressões Idiomáticas']
    ];
    
    // Se a matéria não existir no array, retornar um tópico genérico
    if (!isset($topicos[$materia])) {
        return 'Conhecimentos Gerais';
    }
    
    return $topicos[$materia][array_rand($topicos[$materia])];
}
?>
