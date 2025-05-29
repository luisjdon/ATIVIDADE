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
$modoPunicao = isset($input['modoPunicao']) && $input['modoPunicao'] === true;

// Definir matéria e tópico
// Sempre gerar perguntas aleatórias de todas as matérias
$materiasMistas = true;

// Se for uma requisição para várias perguntas, vamos garantir que sejam de matérias diferentes
$quantidade = isset($input["quantidade"]) ? intval($input["quantidade"]) : 10;
$materiasUsadas = [];

if ($desafioSupremo || $materiasMistas) {
    // Para o Desafio Supremo ou matérias mistas, sempre gerar aleatoriamente
    $materia = obterMateriaAleatoria();
    $topico = obterTopicoAleatorio($materia);
    
    // Guardar a primeira matéria para evitar repetição
    $materiasUsadas[] = $materia;
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
$quantidade = isset($input["quantidade"]) ? intval($input["quantidade"]) : 10; // Padrão de 10 perguntas

// Limitar o número máximo de perguntas
if ($quantidade > 20) {
    $quantidade = 20;
}

// Garantir que pelo menos 10 perguntas sejam geradas
if ($quantidade < 10) {
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
            . "  \"alternativas\": [\"opção A\", \"opção B\", \"opção C\", \"opção D\"], \n"
            . "  \"resposta\": \"resposta correta\"\n"
            . "}\n\n"
            . "A resposta correta deve ser EXATAMENTE igual a uma das alternativas.\n"
            . "Crie 4 alternativas para cada pergunta, onde apenas 1 está correta. As outras 3 alternativas devem ser pegadinhas plausíveis que possam confundir o aluno, mas claramente incorretas para quem entende o assunto.\n"
            . "A resposta correta deve estar em posição aleatória entre as alternativas.";
} else {
    // Multiple questions
    if ($materiasMistas || $desafioSupremo) {
        // Para matérias mistas, criar uma questão de cada matéria
        $prompt = "Crie exatamente {$quantidade} questões difíceis para aluno da 8ª série, sendo cada questão de uma matéria diferente entre: Matemática, Português, Ciências, História, Geografia e Inglês. \n";
        $prompt .= "IMPORTANTE: Cada questão deve incluir a matéria e o tópico específico no formato JSON. \n";
        $prompt .= "As questões de cada matéria DEVEM ser sobre temas apropriados para essa matéria: \n";
        $prompt .= "- Matemática: equações, geometria, álgebra, etc. \n";
        $prompt .= "- Português: gramática, literatura, interpretação de texto, etc. \n";
        $prompt .= "- Ciências: biologia, química, física, etc. \n";
        $prompt .= "- História: eventos históricos, datas importantes, etc. \n";
        $prompt .= "- Geografia: países, capitais, clima, relevo, etc. \n";
        $prompt .= "- Inglês: vocabulário, gramática inglesa, etc. \n";
    } else {
        // Para modo normal, criar questões da mesma matéria e tópico
        $prompt = "Crie exatamente {$quantidade} questões difíceis sobre {$topico} da matéria {$materia} para aluno da 8ª série. \n";
    }
    
    $prompt .= "As questões devem ser desafiadoras e apropriadas para o nível educacional.\n"
            . "Cada questão deve ter 4 alternativas de múltipla escolha, onde apenas 1 está correta.\n"
            . "Formate a resposta como um array JSON com objetos no formato: \n"
            . "[\n"
            . "  {\n"
            . "    \"pergunta\": \"texto da pergunta\",\n"
            . "    \"alternativas\": [\"opção A\", \"opção B\", \"opção C\", \"opção D\"],\n"
            . "    \"resposta\": \"resposta correta\",\n"
            . "    \"materia\": \"nome da matéria\",\n"
            . "    \"topico\": \"nome do tópico\"\n"
            . "  }\n"
            . "]\n\n"
            . "A resposta correta deve ser EXATAMENTE igual a uma das alternativas.\n"
            . "As outras 3 alternativas devem ser pegadinhas plausíveis que possam confundir o aluno, mas claramente incorretas para quem entende o assunto.\n"
            . "A resposta correta deve estar em posição aleatória entre as alternativas.\n"
            . "A resposta deve ser apenas o valor final, sem unidades ou explicações adicionais.\n"
            . "As perguntas devem ser REALMENTE DIFÍCEIS, desafiadoras para um estudante da 8ª série.\n"
            . "MUITO IMPORTANTE: Certifique-se que o conteúdo de cada pergunta corresponda EXATAMENTE à matéria indicada. Por exemplo, questões de matemática devem ser sobre números, equações, etc. e NÃO sobre literatura ou história.";
}

// Adicionar instruções específicas com base no modo ativo
if ($desafioSupremo) {
    $prompt .= "\nEsta pergunta faz parte do Desafio Supremo, então deve ser especialmente desafiadora e complexa, combinando conceitos de diferentes áreas dentro da matéria.";
}

if ($modoPunicao) {
    $prompt .= "\nEsta pergunta faz parte do Modo Punição, então deve ser mais difícil que o normal, exigindo maior raciocínio do aluno.";
}

if ($materiasMistas && !$desafioSupremo) {
    $prompt .= "\nEsta pergunta faz parte do modo de Matérias Mistas, então deve ser uma questão representativa da matéria e tópico selecionados.";
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
                    // Verificar se as perguntas já têm matéria e tópico definidos pelo modelo
                    $materiasDisponiveis = [
                        'Matemática',
                        'Português',
                        'Ciências',
                        'História',
                        'Geografia',
                        'Inglês'
                    ];
                    
                    // Verificar e corrigir cada pergunta
                    foreach ($perguntas as &$pergunta) {
                        // Verificar se a matéria e tópico já estão definidos
                        if (!isset($pergunta['materia']) || empty($pergunta['materia']) || !in_array($pergunta['materia'], $materiasDisponiveis)) {
                            // Se não estiver definido ou for inválido, atribuir com base no conteúdo da pergunta
                            $perguntaTexto = strtolower($pergunta['pergunta']);
                            
                            // Detectar a matéria com base em palavras-chave no texto da pergunta
                            if (preg_match('/(equa[cç][aã]o|n[uú]mero|matem[aá]tica|[aá]lgebra|geometria|tri[aâ]ngulo|quadrado|c[ií]rculo|soma|multiplica[cç][aã]o|divis[aã]o|fra[cç][aã]o|porcentagem|m[eé]dia|probabilidade)/i', $perguntaTexto)) {
                                $pergunta['materia'] = 'Matemática';
                            } elseif (preg_match('/(gram[aá]tica|portugu[eê]s|texto|literatura|verbo|substantivo|adjetivo|pronome|conjuga[cç][aã]o|ortografia|acentua[cç][aã]o)/i', $perguntaTexto)) {
                                $pergunta['materia'] = 'Português';
                            } elseif (preg_match('/(ci[eê]ncia|biologia|qu[ií]mica|f[ií]sica|c[eé]lula|[aá]tomo|mol[eé]cula|planeta|sistema solar|corpo humano|animal|planta|ecologia|energia)/i', $perguntaTexto)) {
                                $pergunta['materia'] = 'Ciências';
                            } elseif (preg_match('/(hist[oó]ria|guerra|revolu[cç][aã]o|imp[eé]rio|civiliza[cç][aã]o|antiga|medieval|moderna|contempor[aâ]nea|s[eé]culo|ano de|data|per[ií]odo)/i', $perguntaTexto)) {
                                $pergunta['materia'] = 'História';
                            } elseif (preg_match('/(geografia|pa[ií]s|continente|capital|mapa|regi[aã]o|clima|relevo|rio|oceano|popula[cç][aã]o|territ[oó]rio)/i', $perguntaTexto)) {
                                $pergunta['materia'] = 'Geografia';
                            } elseif (preg_match('/(ingl[eê]s|english|language|idioma|verb|tense|vocabulary|palavra|tradu[cç][aã]o)/i', $perguntaTexto)) {
                                $pergunta['materia'] = 'Inglês';
                            } else {
                                // Se não for possível detectar, usar a matéria padrão ou aleatória
                                if ($materiasMistas || $desafioSupremo) {
                                    $pergunta['materia'] = $materiasDisponiveis[array_rand($materiasDisponiveis)];
                                } else {
                                    $pergunta['materia'] = $materia;
                                }
                            }
                        }
                        
                        // Verificar se o tópico está definido
                        if (!isset($pergunta['topico']) || empty($pergunta['topico'])) {
                            $pergunta['topico'] = obterTopicoAleatorio($pergunta['materia']);
                        }
                    }
                    
                    // Se for modo normal (não misto), garantir que todas as perguntas tenham a matéria e tópico corretos
                    if (!$materiasMistas && !$desafioSupremo) {
                        foreach ($perguntas as &$pergunta) {
                            $pergunta['materia'] = $materia;
                            $pergunta['topico'] = $topico;
                        }
                    }
                }
            }
        }
        
        // If JSON decoding failed or no perguntas set, use fallback
        if (!isset($perguntas) || json_last_error() !== JSON_ERROR_NONE) {
            // Fallback to a set of predefined difficult questions from various subjects
            $perguntas = [
                [
                    "pergunta" => "Qual é o valor de x na equação 3x² - 12 = 0?", 
                    "alternativas" => ["1", "2", "3", "4"], 
                    "resposta" => "2", 
                    "materia" => $materia, 
                    "topico" => $topico
                ],
                [
                    "pergunta" => "Em que ano foi assinada a Lei Áurea, que aboliu oficialmente a escravidão no Brasil?", 
                    "alternativas" => ["1822", "1888", "1889", "1900"], 
                    "resposta" => "1888", 
                    "materia" => $materia, 
                    "topico" => $topico
                ],
                [
                    "pergunta" => "Qual é o resultado de (3/4)² - (1/2)²?", 
                    "alternativas" => ["1/4", "5/16", "3/8", "7/16"], 
                    "resposta" => "5/16", 
                    "materia" => $materia, 
                    "topico" => $topico
                ],
                [
                    "pergunta" => "Qual é o maior planeta do Sistema Solar?", 
                    "alternativas" => ["Terra", "Saturno", "Júpiter", "Netuno"], 
                    "resposta" => "Júpiter", 
                    "materia" => $materia, 
                    "topico" => $topico
                ],
                [
                    "pergunta" => "Qual é o sujeito da frase: 'Os alunos da oitava série apresentaram um excelente projeto'?", 
                    "alternativas" => ["Os alunos", "Os alunos da oitava série", "Um excelente projeto", "A oitava série"], 
                    "resposta" => "Os alunos da oitava série", 
                    "materia" => $materia, 
                    "topico" => $topico
                ]
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
