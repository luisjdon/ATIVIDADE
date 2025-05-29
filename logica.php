<!DOCTYPE html>
<html lang="pt-br">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Desafio de Lógica</title>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">
    <link href="https://fonts.googleapis.com/css2?family=Comic+Neue:wght@400;700&family=Fredoka:wght@400;500;600&display=swap" rel="stylesheet">
    <style>
        body {
            font-family: 'Fredoka', sans-serif;
            background-color: #f0f8ff;
            margin: 0;
            padding: 0;
            color: #333;
        }
        
        .container {
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
        }
        
        header {
            background-color: #4169e1;
            color: white;
            padding: 20px;
            border-radius: 10px;
            margin-bottom: 20px;
            text-align: center;
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
        }
        
        h1 {
            margin: 0;
            font-size: 2.2rem;
        }
        
        .subtitle {
            font-style: italic;
            margin-top: 10px;
            font-size: 1.1rem;
            opacity: 0.9;
        }
        
        .status-bar {
            display: flex;
            justify-content: space-around;
            background-color: white;
            padding: 15px;
            border-radius: 10px;
            margin-bottom: 20px;
            box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
        }
        
        .status-item {
            display: flex;
            align-items: center;
            font-size: 1.1rem;
        }
        
        .status-item i {
            margin-right: 8px;
            color: #4169e1;
        }
        
        .question-container {
            background-color: white;
            border-radius: 10px;
            padding: 20px;
            margin-bottom: 20px;
            box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
            transition: all 0.3s ease;
        }
        
        .question-container.active {
            transform: scale(1.02);
            box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
        }
        
        .question-number {
            font-size: 1.2rem;
            color: #4169e1;
            margin-bottom: 10px;
            font-weight: 600;
        }
        
        .question-text {
            font-size: 1.3rem;
            margin-bottom: 20px;
            line-height: 1.5;
        }
        
        .options-container {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 15px;
        }
        
        .option {
            background-color: #f0f8ff;
            border: 2px solid #d1e5ff;
            border-radius: 8px;
            padding: 15px;
            cursor: pointer;
            transition: all 0.2s ease;
            font-size: 1.1rem;
        }
        
        .option:hover {
            background-color: #d1e5ff;
            transform: translateY(-2px);
        }
        
        .option.selected {
            background-color: #4169e1;
            color: white;
            border-color: #4169e1;
        }
        
        .option.correct {
            background-color: #4caf50;
            color: white;
            border-color: #4caf50;
        }
        
        .option.incorrect {
            background-color: #f44336;
            color: white;
            border-color: #f44336;
        }
        
        .button-container {
            display: flex;
            justify-content: space-between;
            margin-top: 20px;
        }
        
        button {
            background-color: #4169e1;
            color: white;
            border: none;
            padding: 12px 25px;
            border-radius: 5px;
            cursor: pointer;
            font-size: 1.1rem;
            font-weight: 500;
            transition: all 0.2s ease;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        
        button i {
            margin-right: 8px;
        }
        
        button:hover {
            background-color: #3a5fcd;
            transform: translateY(-2px);
        }
        
        button:disabled {
            background-color: #b0c4de;
            cursor: not-allowed;
            transform: none;
        }
        
        .next-btn {
            background-color: #4caf50;
        }
        
        .next-btn:hover {
            background-color: #3d8b40;
        }
        
        .quit-btn {
            background-color: #f44336;
        }
        
        .quit-btn:hover {
            background-color: #d32f2f;
        }
        
        .progress-container {
            width: 100%;
            background-color: #ddd;
            border-radius: 10px;
            margin-bottom: 20px;
            overflow: hidden;
        }
        
        .progress-bar {
            height: 10px;
            background-color: #4caf50;
            width: 0%;
            transition: width 0.5s ease;
        }
        
        .feedback {
            margin-top: 15px;
            padding: 15px;
            border-radius: 8px;
            font-size: 1.1rem;
            display: none;
        }
        
        .feedback.correct {
            background-color: rgba(76, 175, 80, 0.2);
            color: #2e7d32;
            border: 1px solid #4caf50;
        }
        
        .feedback.incorrect {
            background-color: rgba(244, 67, 54, 0.2);
            color: #c62828;
            border: 1px solid #f44336;
        }
        
        .modal {
            display: none;
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-color: rgba(0, 0, 0, 0.7);
            z-index: 100;
            justify-content: center;
            align-items: center;
        }
        
        .modal-content {
            background-color: white;
            padding: 30px;
            border-radius: 15px;
            text-align: center;
            max-width: 500px;
            width: 90%;
            box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
        }
        
        .modal h2 {
            color: #4169e1;
            margin-top: 0;
        }
        
        .modal p {
            font-size: 1.2rem;
            line-height: 1.5;
            margin-bottom: 20px;
        }
        
        .modal-buttons {
            display: flex;
            justify-content: center;
            gap: 15px;
        }
        
        .confetti {
            position: absolute;
            width: 10px;
            height: 10px;
            background-color: #f44336;
            animation: fall 3s linear forwards;
            z-index: 1000;
        }
        
        @keyframes fall {
            0% {
                transform: translateY(-100vh) rotate(0deg);
                opacity: 1;
            }
            100% {
                transform: translateY(100vh) rotate(360deg);
                opacity: 0;
            }
        }
        
        .hidden {
            display: none;
        }
        
        .rule-container {
            background-color: #fff8e1;
            border-left: 4px solid #ffc107;
            padding: 15px;
            margin-bottom: 20px;
            border-radius: 0 8px 8px 0;
        }
        
        .rule-container h3 {
            color: #ff9800;
            margin-top: 0;
            display: flex;
            align-items: center;
        }
        
        .rule-container h3 i {
            margin-right: 10px;
        }
        
        .rule-container p {
            margin-bottom: 10px;
        }
        
        .rule-container ul {
            padding-left: 25px;
        }
        
        .rule-container li {
            margin-bottom: 5px;
        }
    </style>
</head>
<body>
    <div class="container">
        <header>
            <h1><i class="fas fa-brain"></i> Desafio de Lógica</h1>
            <div class="subtitle">Exercite seu cérebro com problemas de raciocínio lógico!</div>
        </header>
        
        <div class="rule-container">
            <h3><i class="fas fa-exclamation-circle"></i> Regras do Desafio</h3>
            <p>Teste suas habilidades de raciocínio lógico com 10 perguntas desafiadoras:</p>
            <ul>
                <li>Você tem <strong>4 chances de erro</strong>. No 4º erro, você perde o desafio.</li>
                <li>Cada resposta correta vale <strong>10 moedas</strong>.</li>
                <li>Complete todas as 10 perguntas corretamente para ganhar um <strong>bônus especial</strong>!</li>
                <li><strong>Atenção:</strong> Algumas questões podem conter pegadinhas. Leia com atenção!</li>
            </ul>
        </div>
        
        <div class="status-bar">
            <div class="status-item">
                <i class="fas fa-question-circle"></i> Questão: <span id="currentQuestion">1</span>/10
            </div>
            <div class="status-item">
                <i class="fas fa-times-circle"></i> Erros: <span id="errorCount">0</span>/4
            </div>
            <div class="status-item">
                <i class="fas fa-check-circle"></i> Acertos: <span id="correctCount">0</span>/10
            </div>
        </div>
        
        <div class="progress-container">
            <div class="progress-bar" id="progressBar"></div>
        </div>
        
        <div id="questionContainer" class="question-container active">
            <div class="question-number">Questão <span id="questionNumber">1</span></div>
            <div class="question-text" id="questionText">Carregando pergunta...</div>
            <div class="options-container" id="optionsContainer">
                <!-- Opções serão inseridas aqui via JavaScript -->
            </div>
            <div class="feedback" id="feedback"></div>
        </div>
        
        <div class="button-container">
            <button class="quit-btn" id="quitBtn"><i class="fas fa-arrow-left"></i> Voltar aos Estudos</button>
            <button class="next-btn" id="nextBtn" disabled><i class="fas fa-arrow-right"></i> Próxima Questão</button>
        </div>
    </div>
    
    <div class="modal" id="resultModal">
        <div class="modal-content">
            <h2 id="modalTitle">Resultado</h2>
            <p id="modalMessage"></p>
            <div class="modal-buttons">
                <button id="tryAgainBtn">Tentar Novamente</button>
                <button id="backToStudyBtn" class="quit-btn">Voltar aos Estudos</button>
            </div>
        </div>
    </div>

    <?php
// Incluir arquivo da API key
require_once 'api-key.php';
?>
<script>
        // Elementos do DOM
        const questionContainer = document.getElementById('questionContainer');
        const questionNumber = document.getElementById('questionNumber');
        const currentQuestionSpan = document.getElementById('currentQuestion');
        const questionText = document.getElementById('questionText');
        const optionsContainer = document.getElementById('optionsContainer');
        const feedback = document.getElementById('feedback');
        const nextBtn = document.getElementById('nextBtn');
        const quitBtn = document.getElementById('quitBtn');
        const progressBar = document.getElementById('progressBar');
        const errorCount = document.getElementById('errorCount');
        const correctCount = document.getElementById('correctCount');
        const resultModal = document.getElementById('resultModal');
        const modalTitle = document.getElementById('modalTitle');
        const modalMessage = document.getElementById('modalMessage');
        const tryAgainBtn = document.getElementById('tryAgainBtn');
        const backToStudyBtn = document.getElementById('backToStudyBtn');
        
        // Variáveis de estado
        let currentQuestion = 0;
        let errors = 0;
        let corrects = 0;
        let selectedOption = null;
        let questions = [];
        let loadingQuestions = false;
        
        // Inicializar o jogo
        function initGame() {
            // Mostrar mensagem de carregamento
            questionText.textContent = "Carregando perguntas de lógica...";
            optionsContainer.innerHTML = '<div class="loading">Aguarde enquanto o sistema gera perguntas desafiadoras...</div>';
            loadingQuestions = true;
            
            // Resetar estado
            currentQuestion = 0;
            errors = 0;
            corrects = 0;
            updateUI();
            
            // Fazer requisição para a API Gemini para obter perguntas de lógica
            fetch('logica_api.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    quantidade: 10
                })
            })
            .then(response => response.json())
            .then(data => {
                if (data.error) {
                    throw new Error(data.message || 'Erro ao carregar perguntas');
                }
                
                // Transformar as perguntas recebidas para o formato usado pelo jogo
                questions = data.perguntas.map((pergunta, index) => {
                    // Encontrar o índice da resposta correta nas alternativas
                    const correctIndex = pergunta.alternativas.findIndex(alt => alt === pergunta.resposta);
                    
                    return {
                        question: pergunta.pergunta,
                        options: pergunta.alternativas,
                        correct: correctIndex,
                        explanation: pergunta.explicacao || 'Resposta correta: ' + pergunta.resposta
                    };
                });
                
                loadingQuestions = false;
                loadQuestion();
            })
            .catch(error => {
                console.error('Erro:', error);
                // Em caso de erro, usar perguntas de backup
                questions = getBackupQuestions();
                loadingQuestions = false;
                loadQuestion();
            });
        }
        
        // Perguntas de backup em caso de falha na API
        function getBackupQuestions() {
            return [
                {
                    question: "Se 5 máquinas levam 5 minutos para fazer 5 peças, quanto tempo levarão 100 máquinas para fazer 100 peças?",
                    options: ["100 minutos", "5 minutos", "20 minutos", "500 minutos"],
                    correct: 1,
                    explanation: "Se 5 máquinas fazem 5 peças em 5 minutos, então 1 máquina faz 1 peça em 5 minutos. Portanto, 100 máquinas farão 100 peças em 5 minutos."
                },
                {
                    question: "Um fazendeiro tem 17 ovelhas. Todas, exceto 9, morreram. Quantas ovelhas sobraram?",
                    options: ["8 ovelhas", "9 ovelhas", "0 ovelhas", "17 ovelhas"],
                    correct: 1,
                    explanation: "A frase 'Todas, exceto 9, morreram' significa que 9 ovelhas sobreviveram. As outras 8 morreram."
                },
                {
                    question: "Se você tem uma caixa com 3 bolas vermelhas, 4 bolas azuis e 5 bolas verdes, qual é o número mínimo de bolas que você precisa retirar (sem olhar) para ter certeza de que pegou pelo menos 2 bolas da mesma cor?",
                    options: ["2 bolas", "3 bolas", "4 bolas", "5 bolas"],
                    correct: 2,
                    explanation: "No pior caso, você poderia pegar 1 bola de cada cor nas primeiras 3 tentativas. Na 4ª tentativa, você necessariamente pegará uma bola de uma cor que já retirou antes."
                },
                {
                    question: "Um caracol está no fundo de um poço de 10 metros. Cada dia ele sobe 3 metros, mas à noite escorrega e desce 2 metros. Em quantos dias ele conseguirá sair do poço?",
                    options: ["8 dias", "9 dias", "10 dias", "11 dias"],
                    correct: 0,
                    explanation: "A cada dia, o caracol sobe efetivamente 1 metro (3 metros para cima, 2 metros para baixo). Após 7 dias, ele terá subido 7 metros. No 8º dia, ele sobe mais 3 metros, chegando aos 10 metros e saindo do poço, sem precisar escorregar de volta."
                },
                {
                    question: "Qual número completa a sequência: 1, 4, 9, 16, 25, ?",
                    options: ["30", "36", "42", "49"],
                    correct: 1,
                    explanation: "Esta sequência representa os quadrados dos números naturais: 1²=1, 2²=4, 3²=9, 4²=16, 5²=25, e portanto o próximo é 6²=36."
                },
                {
                    question: "Se um médico te dá 3 compílulas e te diz para tomar uma a cada meia hora, quanto tempo durarão os compílulas?",
                    options: ["30 minutos", "1 hora", "1 hora e 30 minutos", "2 horas"],
                    correct: 1,
                    explanation: "Você toma a primeira pílula imediatamente, a segunda após 30 minutos e a terceira após mais 30 minutos (ou seja, 1 hora após o início). Portanto, as pílulas durarão 1 hora no total."
                },
                {
                    question: "Um tijolo pesa 1 kg mais meio tijolo. Quanto pesa um tijolo inteiro?",
                    options: ["1 kg", "1,5 kg", "2 kg", "2,5 kg"],
                    correct: 2,
                    explanation: "Se chamarmos o peso do tijolo de x, temos a equação: x = 1 + x/2. Resolvendo: x - x/2 = 1, o que nos dá x/2 = 1, portanto x = 2 kg."
                },
                {
                    question: "Se você tem 3 maçãs e tira 2, com quantas maçãs você fica?",
                    options: ["1 maçã", "2 maçãs", "3 maçãs", "5 maçãs"],
                    correct: 1,
                    explanation: "A pegadinha está no verbo 'tirar'. Se você 'tira' 2 maçãs (no sentido de pegar/segurar), você fica com essas 2 maçãs nas suas mãos."
                },
                {
                    question: "Em uma corrida, você ultrapassa a pessoa que está em segundo lugar. Em que posição você fica?",
                    options: ["Primeiro lugar", "Segundo lugar", "Terceiro lugar", "Depende da velocidade"],
                    correct: 1,
                    explanation: "Se você ultrapassa quem está em segundo lugar, você assume a posição dessa pessoa, ou seja, o segundo lugar. Para chegar ao primeiro lugar, você precisaria ultrapassar quem está em primeiro."
                },
                {
                    question: "Qual é o próximo número na sequência: 1, 11, 21, 1211, 111221, ?",
                    options: ["1231", "312211", "122221", "112231"],
                    correct: 1,
                    explanation: "Esta é a sequência 'look-and-say' (olhe e diga). Cada termo descreve o anterior: 1 (um dígito 1), 11 (dois dígitos 1), 21 (um dígito 2, um dígito 1), 1211 (um dígito 1, um dígito 2, dois dígitos 1), 111221 (três dígitos 1, dois dígitos 2, um dígito 1). Portanto, o próximo é 312211 (um dígito 3, um dígito 1, dois dígitos 2, dois dígitos 1)."
                }
            ];
        }
        
        // Carregar uma pergunta
        function loadQuestion() {
            if (currentQuestion >= questions.length) {
                showResult(true);
                return;
            }
            
            const question = questions[currentQuestion];
            questionNumber.textContent = currentQuestion + 1;
            currentQuestionSpan.textContent = currentQuestion + 1;
            questionText.textContent = question.question;
            
            // Limpar opções anteriores
            optionsContainer.innerHTML = '';
            
            // Criar opções
            question.options.forEach((option, index) => {
                const optionElement = document.createElement('div');
                optionElement.classList.add('option');
                optionElement.textContent = option;
                optionElement.dataset.index = index;
                optionElement.addEventListener('click', selectOption);
                optionsContainer.appendChild(optionElement);
            });
            
            // Resetar estado
            selectedOption = null;
            nextBtn.disabled = true;
            feedback.style.display = 'none';
            feedback.className = 'feedback';
            
            // Animação
            questionContainer.classList.remove('active');
            setTimeout(() => {
                questionContainer.classList.add('active');
            }, 10);
            
            // Atualizar barra de progresso
            updateProgressBar();
        }
        
        // Selecionar uma opção
        function selectOption(e) {
            // Se já selecionou uma opção, não permite mudar
            if (selectedOption !== null) return;
            
            const selectedIndex = parseInt(e.target.dataset.index);
            selectedOption = selectedIndex;
            
            // Remover seleção anterior
            document.querySelectorAll('.option').forEach(opt => {
                opt.classList.remove('selected', 'correct', 'incorrect');
            });
            
            // Adicionar classe selecionada
            e.target.classList.add('selected');
            
            // Verificar resposta
            const correctIndex = questions[currentQuestion].correct;
            
            if (selectedIndex === correctIndex) {
                // Resposta correta
                e.target.classList.add('correct');
                feedback.textContent = 'Correto! ' + questions[currentQuestion].explanation;
                feedback.classList.add('correct');
                corrects++;
                correctCount.textContent = corrects;
            } else {
                // Resposta incorreta
                e.target.classList.add('incorrect');
                document.querySelectorAll('.option')[correctIndex].classList.add('correct');
                feedback.textContent = 'Incorreto. ' + questions[currentQuestion].explanation;
                feedback.classList.add('incorrect');
                errors++;
                errorCount.textContent = errors;
                
                // Verificar se perdeu o jogo
                if (errors >= 4) {
                    setTimeout(() => {
                        showResult(false);
                    }, 1500);
                    return;
                }
            }
            
            feedback.style.display = 'block';
            nextBtn.disabled = false;
        }
        
        // Atualizar a barra de progresso
        function updateProgressBar() {
            const progress = (currentQuestion / questions.length) * 100;
            progressBar.style.width = `${progress}%`;
        }
        
        // Atualizar a interface
        function updateUI() {
            errorCount.textContent = errors;
            correctCount.textContent = corrects;
        }
        
        // Mostrar resultado final
        function showResult(isVictory) {
            resultModal.style.display = 'flex';
            
            if (isVictory) {
                modalTitle.textContent = 'Parabéns!';
                modalMessage.textContent = `Você completou o desafio com ${errors} erros e ganhou ${corrects * 10} moedas!`;
                createConfetti();
            } else {
                modalTitle.textContent = 'Que pena!';
                if (errors >= 4) {
                    modalMessage.textContent = 'Você errou 4 vezes e perdeu o desafio. Talvez seja melhor voltar aos estudos?';
                } else {
                    modalMessage.textContent = `Você completou ${currentQuestion + 1} de 10 questões com ${errors} erros. Continue estudando para melhorar!`;
                }
            }
        }
        
        // Criar efeito de confete para comemoração
        function createConfetti() {
            const colors = ['#ff6b6b', '#4169e1', '#ffd700', '#32cd32', '#9370db'];
            
            for (let i = 0; i < 100; i++) {
                const confetti = document.createElement('div');
                confetti.className = 'confetti';
                confetti.style.left = `${Math.random() * 100}vw`;
                confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
                confetti.style.width = `${Math.random() * 10 + 5}px`;
                confetti.style.height = `${Math.random() * 10 + 5}px`;
                confetti.style.opacity = Math.random() + 0.5;
                confetti.style.animationDuration = `${Math.random() * 3 + 2}s`;
                
                document.body.appendChild(confetti);
                
                // Remover confete após a animação
                setTimeout(() => {
                    confetti.remove();
                }, 5000);
            }
        }
        
        // Event listeners
        nextBtn.addEventListener('click', () => {
            currentQuestion++;
            loadQuestion();
        });
        
        quitBtn.addEventListener('click', () => {
            window.location.href = 'index.html';
        });
        
        tryAgainBtn.addEventListener('click', () => {
            resultModal.style.display = 'none';
            initGame();
        });
        
        backToStudyBtn.addEventListener('click', () => {
            window.location.href = 'index.html';
        });
        
        // Iniciar o jogo
        initGame();
    </script>
</body>
</html>
