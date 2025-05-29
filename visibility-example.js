/**
 * Exemplo de integração do sistema de detecção de troca de janela
 * com o aplicativo Desafio de Matemática
 */

document.addEventListener('DOMContentLoaded', function() {
    // Referência para o sistema de pontuação/progresso atual
    let currentScore = 0;
    let questionsAnswered = 0;
    let gameActive = false;
    
    // Função que será chamada quando o usuário trocar de janela e precisar resetar
    function resetGameProgress() {
        // Zerar pontuação e progresso
        currentScore = 0;
        questionsAnswered = 0;
        
        // Atualizar interface (adapte conforme sua estrutura de UI)
        updateScoreDisplay();
        
        // Mostrar mensagem personalizada
        showMessage("Você trocou de janela durante o desafio! Seu progresso foi reiniciado.");
        
        // Opcional: voltar para a tela inicial
        showStartScreen();
    }
    
    // Função para mostrar mensagens ao usuário (adapte conforme sua UI)
    function showMessage(message) {
        // Exemplo simples - adapte para seu sistema de notificações
        const messageElement = document.createElement('div');
        messageElement.className = 'game-message warning';
        messageElement.textContent = message;
        
        // Adicionar ao DOM
        const messageContainer = document.querySelector('.message-container') || document.body;
        messageContainer.appendChild(messageElement);
        
        // Remover após alguns segundos
        setTimeout(() => {
            if (messageContainer.contains(messageElement)) {
                messageContainer.removeChild(messageElement);
            }
        }, 5000);
    }
    
    // Funções de exemplo para atualizar a interface
    function updateScoreDisplay() {
        const scoreElement = document.getElementById('score-display');
        if (scoreElement) {
            scoreElement.textContent = currentScore;
        }
    }
    
    function showStartScreen() {
        // Adapte conforme sua estrutura de UI
        const gameScreen = document.getElementById('game-screen');
        const startScreen = document.getElementById('start-screen');
        
        if (gameScreen) gameScreen.style.display = 'none';
        if (startScreen) startScreen.style.display = 'block';
        
        gameActive = false;
    }
    
    // Iniciar o jogo (chamado quando o usuário clica em "Começar")
    function startGame() {
        gameActive = true;
        
        // Iniciar o monitoramento de visibilidade quando o jogo começar
        visibilityHandler.start();
        
        // Resto da lógica de início do jogo...
    }
    
    // Finalizar o jogo (chamado quando o usuário termina ou desiste)
    function endGame() {
        gameActive = false;
        
        // Parar o monitoramento de visibilidade quando o jogo terminar
        visibilityHandler.stop();
        
        // Resto da lógica de finalização...
    }
    
    // Criar instância do manipulador de visibilidade com opções personalizadas
    const visibilityHandler = new VisibilityHandler({
        resetOnHidden: true,           // Resetar progresso quando o usuário sair da janela
        showWarning: true,             // Mostrar aviso quando voltar
        warningMessage: "Atenção! Você saiu da janela durante o desafio. Isso não é permitido e seu progresso foi reiniciado.",
        resetCallback: resetGameProgress,  // Função personalizada para resetar o jogo
        allowedSwitchCount: 0,         // Nenhuma troca permitida (0 = nenhuma)
        visibilityChangeCallback: function(isVisible, count) {
            // Registrar evento de troca para análise ou outras ações
            console.log(`Visibilidade alterada: ${isVisible ? 'visível' : 'oculto'}, contagem: ${count}`);
            
            // Exemplo: se for a primeira vez, apenas avisar
            if (count === 1 && !isVisible) {
                // Você poderia salvar isso em localStorage para mostrar um aviso quando voltar
                localStorage.setItem('firstWarning', 'true');
            }
        }
    });
    
    // Adicionar aos botões de controle existentes
    const startButton = document.getElementById('start-button');
    if (startButton) {
        startButton.addEventListener('click', startGame);
    }
    
    const endButton = document.getElementById('end-button');
    if (endButton) {
        endButton.addEventListener('click', endGame);
    }
    
    // Opcional: Detectar se o usuário tenta recarregar a página durante o jogo
    window.addEventListener('beforeunload', function(e) {
        if (gameActive) {
            // Mensagem de confirmação ao tentar recarregar/fechar durante o jogo
            const message = 'Você tem certeza que deseja sair? Seu progresso será perdido.';
            e.returnValue = message;
            return message;
        }
    });
});
