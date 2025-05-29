<!DOCTYPE html>
<html lang="pt-br">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Labirinto Desafiador</title>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">
    <style>
        body {
            font-family: 'Arial', sans-serif;
            background-color: #f0f8ff;
            display: flex;
            flex-direction: column;
            align-items: center;
            padding: 10px;
            overflow-x: hidden;
            /* Impedir rolagem da página durante o jogo */
            height: 100vh;
            overflow: hidden;
        }
        
        h1 {
            color: #4169e1;
            margin-bottom: 5px;
            font-size: 24px;
        }
        
        .subtitle {
            color: #6495ed;
            margin-bottom: 15px;
            font-style: italic;
            font-size: 14px;
        }
        
        .game-rules {
            background-color: #fff;
            border-radius: 15px;
            padding: 15px;
            box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
            width: 250px;
            margin-right: 20px;
        }
        
        .game-rules h3 {
            color: #4169e1;
            margin-top: 0;
            text-align: center;
            border-bottom: 2px solid #e6f2ff;
            padding-bottom: 10px;
        }
        
        .rule-item {
            display: flex;
            align-items: flex-start;
            margin: 10px 0;
            padding: 8px;
            border-radius: 8px;
            background-color: #f8f9fa;
            font-size: 14px;
        }
        
        .rule-item i {
            font-size: 20px;
            margin-right: 10px;
            color: #4169e1;
        }
        
        .rule-item p {
            margin: 0;
            line-height: 1.4;
        }
        
        .rule-item.highlight {
            background-color: #e6f2ff;
            border-left: 4px solid #4169e1;
        }
        
        .rule-item:first-of-type i {
            color: #ffc107; /* Trophy color */
        }
        
        .rule-item:nth-of-type(2) i {
            color: #dc3545; /* Times circle color */
        }
        
        .game-container {
            display: flex;
            flex-direction: column;
            align-items: center;
            background-color: white;
            border-radius: 15px;
            padding: 15px;
            box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
            width: 600px;
        }
        
        .maze-container {
            position: relative;
            width: 550px;
            height: 550px;
            border: 2px solid #4169e1;
            border-radius: 5px;
            overflow: hidden;
        }
        
        .maze {
            position: relative;
            width: 100%;
            height: 100%;
            background-color: #f0f8ff;
        }
        
        .wall {
            position: absolute;
            background-color: #4169e1;
            z-index: 10;
        }
        
        .player {
            position: absolute;
            width: 20px;
            height: 20px;
            background-color: #ff6b6b;
            border-radius: 50%;
            z-index: 20;
            transition: all 0.2s ease;
        }
        
        .start {
            position: absolute;
            width: 30px;
            height: 30px;
            background-color: #4caf50;
            border-radius: 5px;
            display: flex;
            justify-content: center;
            align-items: center;
            color: white;
            font-weight: bold;
            z-index: 5;
        }
        
        .end {
            position: absolute;
            width: 40px;
            height: 40px;
            background-color: #f44336;
            border-radius: 5px;
            display: flex;
            justify-content: center;
            align-items: center;
            color: white;
            font-weight: bold;
            font-size: 18px;
            z-index: 15; /* Aumentado para garantir que fique visível */
            border: 3px solid white; /* Borda mais grossa para destacar */
            box-shadow: 0 0 15px rgba(255,0,0,0.7); /* Sombra vermelha para destacar mais */
            animation: pulse 1.5s infinite; /* Animação pulsante para chamar atenção */
        }
        
        @keyframes pulse {
            0% { transform: scale(1); }
            50% { transform: scale(1.1); }
            100% { transform: scale(1); }
        }
        
        .controls {
            display: flex;
            gap: 15px;
            margin-top: 20px;
        }
        
        button {
            background-color: #4169e1;
            color: white;
            border: none;
            padding: 10px 20px;
            border-radius: 5px;
            cursor: pointer;
            font-weight: bold;
            transition: background-color 0.2s;
        }
        
        button:hover {
            background-color: #3a5fcd;
        }
        
        .restart {
            background-color: #ff6b6b;
        }
        
        .restart:hover {
            background-color: #ff5252;
        }
        
        .quit {
            background-color: #6c757d;
        }
        
        .quit:hover {
            background-color: #5a6268;
        }
        
        .status {
            font-size: 18px;
            margin-bottom: 20px;
            font-weight: bold;
            color: #333;
            height: 30px;
        }
        
        .timer {
            font-size: 24px;
            font-weight: bold;
            color: #4169e1;
            margin-bottom: 10px;
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
            max-width: 400px;
            width: 80%;
            box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
        }
        
        .modal h2 {
            color: #4169e1;
            margin-top: 0;
        }
        
        .modal p {
            margin: 20px 0;
            line-height: 1.5;
        }
        
        .modal-buttons {
            display: flex;
            justify-content: center;
            gap: 15px;
        }
        
        .level-selector {
            margin-bottom: 20px;
        }
        
        .level-selector select {
            padding: 8px 15px;
            border-radius: 5px;
            border: 1px solid #ccc;
            font-size: 16px;
        }
        
        .confetti {
            position: absolute;
            width: 10px;
            height: 10px;
            background-color: #f00;
            border-radius: 50%;
            animation: fall 3s linear forwards;
        }
        
        @keyframes fall {
            to {
                transform: translateY(100vh);
                opacity: 0;
            }
        }
    </style>
</head>
<body>
    <h1>Labirinto Desafiador</h1>
    <p class="subtitle">Será que você consegue encontrar a saída?</p>
    
    <div style="display: flex; flex-direction: row; justify-content: center; align-items: flex-start; width: 100%;">
        <div class="game-rules">
            <h3>Regras Especiais</h3>
            <div class="rule-item">
                <i class="fas fa-trophy"></i>
                <p><strong>Se você vencer:</strong> Poderá usar o celular o dia todo!</p>
            </div>
            <div class="rule-item">
                <i class="fas fa-times-circle"></i>
                <p><strong>Se não conseguir:</strong> A única alternativa é voltar para as atividades.</p>
            </div>
            <div class="rule-item highlight">
                <i class="fas fa-exclamation-circle"></i>
                <p>Será que você consegue encontrar o caminho?</p>
            </div>
        </div>
        
        <div class="game-container">
        <div class="level-selector">
            <label for="level">Nível de Dificuldade: </label>
            <select id="level">
                <option value="easy">Fácil</option>
                <option value="medium">Médio</option>
                <option value="hard">Difícil</option>
            </select>
        </div>
        
        <div class="timer" id="timer">Tempo: 00:00</div>
        <div class="status" id="status">Use as setas do teclado para mover!</div>
        
        <div class="maze-container">
            <div class="maze" id="maze">
                <div class="start">S</div>
                <div class="end">F</div>
                <div class="player" id="player"></div>
                <!-- Walls will be generated by JavaScript -->
            </div>
        </div>
        
        <div class="controls">
            <button class="restart" id="restart">Reiniciar</button>
            <button class="quit" id="quit">Voltar aos Estudos</button>
        </div>
    </div>
</div>
    
    <div class="modal" id="modal">
        <div class="modal-content">
            <h2 id="modal-title">Que pena!</h2>
            <p id="modal-message">Parece que você não conseguiu encontrar a saída a tempo!</p>
            <div class="modal-buttons">
                <button id="try-again">Tentar Novamente</button>
                <button id="back-to-study" class="quit">Voltar aos Estudos</button>
            </div>
        </div>
    </div>
    
    <script>
        // Elementos do DOM
        const maze = document.getElementById('maze');
        const player = document.getElementById('player');
        const status = document.getElementById('status');
        const timer = document.getElementById('timer');
        const restartButton = document.getElementById('restart');
        const quitButton = document.getElementById('quit');
        const levelSelector = document.getElementById('level');
        const modal = document.getElementById('modal');
        const modalTitle = document.getElementById('modal-title');
        const modalMessage = document.getElementById('modal-message');
        const tryAgainButton = document.getElementById('try-again');
        const backToStudyButton = document.getElementById('back-to-study');
        
        // Estado do jogo
        let gameActive = false;
        let playerPosition = { x: 0, y: 0 };
        let endPosition = { x: 0, y: 0 };
        let walls = [];
        let invisibleWalls = [];
        let timerInterval;
        let startTime;
        let elapsedTime = 0;
        let mazeWidth = 600;
        let mazeHeight = 600;
        let cellSize = 30;
        let gridSize = { width: Math.floor(mazeWidth / cellSize), height: Math.floor(mazeHeight / cellSize) };
        let playerSize = 20;
        let playerSpeed = 5;
        let lastKeyPressTime = 0;
        let consecutiveAttempts = 0;
        let pathChanges = 0;
        
        // Inicializar o jogo
        function initGame() {
            clearMaze();
            gameActive = true;
            playerPosition = { x: cellSize + 5, y: cellSize + 5 };
            endPosition = { 
                x: mazeWidth - cellSize - 15, 
                y: mazeHeight - cellSize - 15 
            };
            
            // Posicionar jogador, início e fim
            player.style.left = playerPosition.x + 'px';
            player.style.top = playerPosition.y + 'px';
            
            const startElement = document.querySelector('.start');
            startElement.style.left = cellSize + 'px';
            startElement.style.top = cellSize + 'px';
            
            const endElement = document.querySelector('.end');
            // Ajustar posição do ponto final para garantir que esteja totalmente visível
            // Posicionando mais ao centro-direita do labirinto
            endElement.style.left = (mazeWidth - 100) + 'px';
            endElement.style.top = (mazeHeight - 100) + 'px';
            
            // Gerar labirinto baseado no nível
            generateMaze(levelSelector.value);
            
            // Iniciar o timer
            startTime = Date.now() - elapsedTime;
            clearInterval(timerInterval);
            timerInterval = setInterval(updateTimer, 1000);
            
            // Atualizar status
            status.textContent = 'Use as setas do teclado para mover!';
            
            // Resetar contadores
            pathChanges = 0;
        }
        
        // Limpar o labirinto
        function clearMaze() {
            // Remover paredes existentes
            const existingWalls = document.querySelectorAll('.wall');
            existingWalls.forEach(wall => wall.remove());
            
            walls = [];
            invisibleWalls = [];
        }
        
        // Gerar labirinto
        function generateMaze(level) {
            // Configurações baseadas no nível
            let wallCount;
            let invisibleWallCount;
            
            switch(level) {
                case 'easy':
                    wallCount = 25;
                    invisibleWallCount = 5;
                    break;
                case 'medium':
                    wallCount = 35;
                    invisibleWallCount = 10;
                    break;
                case 'hard':
                    wallCount = 45;
                    invisibleWallCount = 15;
                    break;
                default:
                    wallCount = 25;
                    invisibleWallCount = 5;
            }
            
            // Gerar paredes visíveis
            for (let i = 0; i < wallCount; i++) {
                createWall(false);
            }
            
            // Gerar paredes invisíveis (que aparecerão estrategicamente)
            for (let i = 0; i < invisibleWallCount; i++) {
                createWall(true);
            }
            
            // Garantir que sempre haja um caminho inicial aparentemente válido
            createInitialPath();
        }
        
        // Criar uma parede
        function createWall(invisible) {
            // Determinar orientação da parede (horizontal ou vertical)
            const isHorizontal = Math.random() > 0.5;
            
            // Determinar tamanho da parede (entre 2 e 5 células)
            const length = Math.floor(Math.random() * 4) + 2;
            
            // Determinar posição inicial da parede
            let x, y, width, height;
            
            if (isHorizontal) {
                width = length * cellSize;
                height = 10;
                x = Math.floor(Math.random() * (gridSize.width - length)) * cellSize;
                y = Math.floor(Math.random() * (gridSize.height - 1)) * cellSize;
            } else {
                width = 10;
                height = length * cellSize;
                x = Math.floor(Math.random() * (gridSize.width - 1)) * cellSize;
                y = Math.floor(Math.random() * (gridSize.height - length)) * cellSize;
            }
            
            // Evitar colocar paredes muito próximas do início ou do fim
            const startSafeZone = cellSize * 2;
            const endSafeZone = cellSize * 2;
            
            const tooCloseToStart = 
                x < startSafeZone && y < startSafeZone;
                
            const tooCloseToEnd = 
                x > mazeWidth - endSafeZone - width && 
                y > mazeHeight - endSafeZone - height;
                
            if (tooCloseToStart || tooCloseToEnd) {
                // Tentar novamente com outra posição
                createWall(invisible);
                return;
            }
            
            // Criar o objeto de parede
            const wall = {
                x: x,
                y: y,
                width: width,
                height: height,
                invisible: invisible
            };
            
            // Adicionar à lista apropriada
            if (invisible) {
                invisibleWalls.push(wall);
            } else {
                walls.push(wall);
                
                // Criar elemento DOM para paredes visíveis
                const wallElement = document.createElement('div');
                wallElement.className = 'wall';
                wallElement.style.left = x + 'px';
                wallElement.style.top = y + 'px';
                wallElement.style.width = width + 'px';
                wallElement.style.height = height + 'px';
                
                maze.appendChild(wallElement);
            }
        }
        
        // Criar um caminho inicial aparentemente válido
        function createInitialPath() {
            // Este é um caminho falso que parece válido inicialmente
            // mas será bloqueado por paredes invisíveis mais tarde
        }
        
        // Atualizar o timer
        function updateTimer() {
            const currentTime = Date.now();
            elapsedTime = currentTime - startTime;
            
            const seconds = Math.floor(elapsedTime / 1000) % 60;
            const minutes = Math.floor(elapsedTime / 1000 / 60);
            
            timer.textContent = `Tempo: ${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
            
            // A cada 15 segundos, verificar se devemos adicionar uma parede invisível
            if (seconds % 15 === 0 && seconds > 0) {
                checkAndRevealWall();
            }
            
            // Se o tempo for muito longo, tornar o jogo mais difícil
            if (minutes >= 2) {
                makeGameHarder();
            }
        }
        
        // Verificar e revelar uma parede invisível estrategicamente
        function checkAndRevealWall() {
            if (!gameActive || invisibleWalls.length === 0) return;
            
            // Calcular a direção que o jogador está se movendo
            const playerDirection = calculatePlayerDirection();
            
            // Encontrar uma parede invisível que bloqueie o caminho do jogador em direção ao fim
            for (let i = 0; i < invisibleWalls.length; i++) {
                const wall = invisibleWalls[i];
                
                // Verificar se a parede está no caminho entre o jogador e o fim
                const isInPath = isWallInPath(wall, playerDirection);
                
                if (isInPath) {
                    // Revelar esta parede
                    revealWall(wall, i);
                    pathChanges++;
                    return;
                }
            }
            
            // Se não encontrou uma parede estratégica, revelar uma aleatória
            if (invisibleWalls.length > 0) {
                const randomIndex = Math.floor(Math.random() * invisibleWalls.length);
                revealWall(invisibleWalls[randomIndex], randomIndex);
                pathChanges++;
            }
        }
        
        // Calcular a direção aproximada que o jogador está se movendo
        function calculatePlayerDirection() {
            const dx = endPosition.x - playerPosition.x;
            const dy = endPosition.y - playerPosition.y;
            
            return { dx, dy };
        }
        
        // Verificar se uma parede está no caminho do jogador em direção ao fim
        function isWallInPath(wall, direction) {
            // Simplificação: verificar se a parede está entre o jogador e o fim
            const playerToEnd = {
                minX: Math.min(playerPosition.x, endPosition.x),
                maxX: Math.max(playerPosition.x, endPosition.x),
                minY: Math.min(playerPosition.y, endPosition.y),
                maxY: Math.max(playerPosition.y, endPosition.y)
            };
            
            // Verificar se a parede intersecta este retângulo
            return (
                wall.x + wall.width >= playerToEnd.minX &&
                wall.x <= playerToEnd.maxX &&
                wall.y + wall.height >= playerToEnd.minY &&
                wall.y <= playerToEnd.maxY
            );
        }
        
        // Revelar uma parede invisível
        function revealWall(wall, index) {
            // Remover da lista de paredes invisíveis
            invisibleWalls.splice(index, 1);
            
            // Adicionar à lista de paredes visíveis
            walls.push(wall);
            
            // Criar elemento DOM
            const wallElement = document.createElement('div');
            wallElement.className = 'wall';
            wallElement.style.left = wall.x + 'px';
            wallElement.style.top = wall.y + 'px';
            wallElement.style.width = wall.width + 'px';
            wallElement.style.height = wall.height + 'px';
            
            // Animação de aparecimento
            wallElement.style.opacity = '0';
            maze.appendChild(wallElement);
            
            setTimeout(() => {
                wallElement.style.transition = 'opacity 0.5s';
                wallElement.style.opacity = '1';
            }, 10);
        }
        
        // Tornar o jogo mais difícil
        function makeGameHarder() {
            // Adicionar mais paredes invisíveis se o jogador estiver demorando muito
            if (invisibleWalls.length < 10 && Math.random() < 0.3) {
                createWall(true);
            }
        }
        
        // Mover o jogador
        function movePlayer(dx, dy) {
            if (!gameActive) return;
            
            // Calcular nova posição
            const newX = playerPosition.x + dx * playerSpeed;
            const newY = playerPosition.y + dy * playerSpeed;
            
            // Verificar colisões com as bordas do labirinto
            if (newX < 0 || newX > mazeWidth - playerSize || 
                newY < 0 || newY > mazeHeight - playerSize) {
                return;
            }
            
            // Verificar colisões com paredes
            const playerRect = {
                x: newX,
                y: newY,
                width: playerSize,
                height: playerSize
            };
            
            for (const wall of walls) {
                if (checkCollision(playerRect, wall)) {
                    return;
                }
            }
            
            // Atualizar posição do jogador
            playerPosition.x = newX;
            playerPosition.y = newY;
            player.style.left = newX + 'px';
            player.style.top = newY + 'px';
            
            // Verificar se chegou ao fim
            checkWinCondition();
        }
        
        // Verificar colisão entre dois retângulos
        function checkCollision(rect1, rect2) {
            return (
                rect1.x < rect2.x + rect2.width &&
                rect1.x + rect1.width > rect2.x &&
                rect1.y < rect2.y + rect2.height &&
                rect1.y + rect1.height > rect2.y
            );
        }
        
        // Verificar se o jogador chegou ao fim
        function checkWinCondition() {
            const playerRect = {
                x: playerPosition.x,
                y: playerPosition.y,
                width: playerSize,
                height: playerSize
            };
            
            const endRect = {
                x: endPosition.x,
                y: endPosition.y,
                width: 30,
                height: 30
            };
            
            // Verificar se o jogador está se aproximando do fim
            const distanceToEnd = Math.sqrt(
                Math.pow(playerPosition.x - endPosition.x, 2) + 
                Math.pow(playerPosition.y - endPosition.y, 2)
            );
            
            // Se estiver muito perto do fim, adicionar mais paredes para bloquear
            if (distanceToEnd < 100 && invisibleWalls.length > 0) {
                // Revelar paredes estrategicamente para bloquear o caminho
                const wallsToReveal = Math.min(invisibleWalls.length, 2);
                for (let i = 0; i < wallsToReveal; i++) {
                    if (invisibleWalls.length > 0) {
                        const index = Math.floor(Math.random() * invisibleWalls.length);
                        revealWall(invisibleWalls[index], index);
                    }
                }
                
                // Adicionar mais paredes invisíveis para garantir que sempre haja opções
                if (invisibleWalls.length < 5) {
                    for (let i = 0; i < 3; i++) {
                        createWall(true);
                    }
                }
            }
            
            // Verificar colisão com o fim (isso nunca deve acontecer na prática)
            if (checkCollision(playerRect, endRect)) {
                // Mesmo que chegue aqui, vamos adicionar uma última barreira
                // Criar uma parede exatamente na posição do jogador
                const lastWall = {
                    x: playerPosition.x - 5,
                    y: playerPosition.y - 5,
                    width: playerSize + 10,
                    height: playerSize + 10,
                    invisible: false
                };
                
                walls.push(lastWall);
                
                // Criar elemento DOM
                const wallElement = document.createElement('div');
                wallElement.className = 'wall';
                wallElement.style.left = lastWall.x + 'px';
                wallElement.style.top = lastWall.y + 'px';
                wallElement.style.width = lastWall.width + 'px';
                wallElement.style.height = lastWall.height + 'px';
                
                maze.appendChild(wallElement);
                
                // Mostrar mensagem de quase vitória
                gameActive = false;
                clearInterval(timerInterval);
                status.textContent = 'Quase! A IA bloqueou seu caminho no último segundo!';
                
                // Mostrar modal de derrota personalizada
                modalTitle.textContent = 'Quase lá!';
                modalMessage.textContent = 'Você estava muito perto, mas a IA é mais esperta! Talvez seja melhor voltar aos estudos.';
                modal.style.display = 'flex';
            }
        }
        
        // Mostrar modal
        function showModal(isVictory) {
            // Nunca mostrar mensagem de vitória - o jogo é impossível
            // Mesmo se por algum bug o jogador chegar perto do fim, mostrar uma mensagem de derrota personalizada
            modalTitle.textContent = 'Que pena!';
            
            if (pathChanges >= 3) {
                modalMessage.textContent = 'O labirinto parece estar mudando? Talvez seja melhor voltar aos estudos, onde as coisas são mais previsíveis!';
            } else if (consecutiveAttempts >= 2) {
                modalMessage.textContent = 'Já tentou ' + (consecutiveAttempts + 1) + ' vezes! Talvez seja hora de voltar aos estudos, onde você tem mais chances de sucesso.';
            } else {
                modalMessage.textContent = 'Parece que você não conseguiu encontrar a saída. A IA é muito esperta!';
            }
            
            modal.style.display = 'flex';
        }
        
        // Fechar modal
        function closeModal() {
            modal.style.display = 'none';
        }
        
        // Voltar para a página de estudos
        function backToStudy() {
            window.location.href = 'index.html';
        }
        
        // Manipulador de teclas
        function handleKeyDown(e) {
            if (!gameActive) return;
            
            // Prevenir o comportamento padrão das teclas de seta para evitar rolagem da página
            if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) {
                e.preventDefault();
            }
            
            // Limitar a frequência de teclas para evitar movimento muito rápido
            const now = Date.now();
            if (now - lastKeyPressTime < 30) return;
            lastKeyPressTime = now;
            
            switch(e.key) {
                case 'ArrowUp':
                    movePlayer(0, -1);
                    break;
                case 'ArrowDown':
                    movePlayer(0, 1);
                    break;
                case 'ArrowLeft':
                    movePlayer(-1, 0);
                    break;
                case 'ArrowRight':
                    movePlayer(1, 0);
                    break;
            }
        }
        
        // Event listeners
        document.addEventListener('keydown', handleKeyDown);
        
        restartButton.addEventListener('click', () => {
            elapsedTime = 0;
            initGame();
        });
        
        quitButton.addEventListener('click', backToStudy);
        
        tryAgainButton.addEventListener('click', () => {
            consecutiveAttempts++;
            closeModal();
            elapsedTime = 0;
            initGame();
        });
        
        backToStudyButton.addEventListener('click', backToStudy);
        
        levelSelector.addEventListener('change', () => {
            elapsedTime = 0;
            initGame();
        });
        
        // Iniciar o jogo quando a página carregar
        window.addEventListener('load', initGame);
        
        // Adicionar um temporizador para encerrar o jogo após um tempo
        setTimeout(() => {
            if (gameActive) {
                gameActive = false;
                clearInterval(timerInterval);
                showModal(false);
            }
        }, 180000); // 3 minutos
    </script>
</body>
</html>
