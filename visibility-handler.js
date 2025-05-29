/**
 * Sistema de detecção de troca de janela
 * Este script monitora se o usuário sai da janela do aplicativo durante a atividade
 */

class VisibilityHandler {
    constructor(options = {}) {
        // Configurações padrão
        this.options = {
            resetOnHidden: false,           // Se true, reseta o progresso quando o usuário sai da janela
            showWarning: true,              // Se true, mostra um aviso quando o usuário volta
            warningMessage: "Atenção! Você saiu da janela durante a atividade. Isso não é permitido.",
            resetCallback: null,            // Função a ser chamada quando resetar
            visibilityChangeCallback: null, // Função a ser chamada quando a visibilidade mudar
            allowedSwitchCount: 0,          // Número de trocas permitidas (0 = nenhuma)
            ...options
        };

        // Estado interno
        this.switchCount = 0;
        this.wasHidden = false;
        this.active = false;

        // Vincular métodos ao contexto atual
        this.handleVisibilityChange = this.handleVisibilityChange.bind(this);
    }

    /**
     * Inicia o monitoramento de visibilidade
     */
    start() {
        if (this.active) return;
        
        // Adiciona o listener para o evento de mudança de visibilidade
        document.addEventListener('visibilitychange', this.handleVisibilityChange);
        this.active = true;
        console.log('Monitoramento de visibilidade iniciado');
    }

    /**
     * Para o monitoramento de visibilidade
     */
    stop() {
        if (!this.active) return;
        
        document.removeEventListener('visibilitychange', this.handleVisibilityChange);
        this.active = false;
        console.log('Monitoramento de visibilidade parado');
    }

    /**
     * Manipula mudanças na visibilidade da página
     */
    handleVisibilityChange() {
        // Se a página estiver oculta (usuário trocou de aba/janela)
        if (document.hidden) {
            this.wasHidden = true;
            this.switchCount++;
            
            console.log(`Usuário saiu da janela (troca #${this.switchCount})`);
            
            // Chamar callback se existir
            if (this.options.visibilityChangeCallback) {
                this.options.visibilityChangeCallback(false, this.switchCount);
            }
            
            // Se configurado para resetar e excedeu o número de trocas permitidas
            if (this.options.resetOnHidden && this.switchCount > this.options.allowedSwitchCount) {
                this.resetProgress();
            }
        } 
        // Se a página estiver visível novamente
        else if (this.wasHidden) {
            console.log('Usuário voltou para a janela');
            
            // Chamar callback se existir
            if (this.options.visibilityChangeCallback) {
                this.options.visibilityChangeCallback(true, this.switchCount);
            }
            
            // Mostrar aviso se configurado
            if (this.options.showWarning && this.switchCount > this.options.allowedSwitchCount) {
                this.showWarningMessage();
            }
            
            this.wasHidden = false;
        }
    }

    /**
     * Mostra uma mensagem de aviso ao usuário
     */
    showWarningMessage() {
        // Criar elemento de aviso se não existir
        if (!document.getElementById('visibility-warning')) {
            const warningDiv = document.createElement('div');
            warningDiv.id = 'visibility-warning';
            warningDiv.style.position = 'fixed';
            warningDiv.style.top = '20px';
            warningDiv.style.left = '50%';
            warningDiv.style.transform = 'translateX(-50%)';
            warningDiv.style.backgroundColor = '#ff5555';
            warningDiv.style.color = 'white';
            warningDiv.style.padding = '15px 20px';
            warningDiv.style.borderRadius = '5px';
            warningDiv.style.zIndex = '9999';
            warningDiv.style.boxShadow = '0 4px 8px rgba(0,0,0,0.2)';
            warningDiv.style.fontWeight = 'bold';
            warningDiv.style.maxWidth = '80%';
            warningDiv.style.textAlign = 'center';
            warningDiv.textContent = this.options.warningMessage;
            
            // Botão para fechar o aviso
            const closeButton = document.createElement('button');
            closeButton.textContent = '×';
            closeButton.style.position = 'absolute';
            closeButton.style.right = '5px';
            closeButton.style.top = '5px';
            closeButton.style.background = 'none';
            closeButton.style.border = 'none';
            closeButton.style.color = 'white';
            closeButton.style.fontSize = '20px';
            closeButton.style.cursor = 'pointer';
            closeButton.onclick = () => {
                document.body.removeChild(warningDiv);
            };
            
            warningDiv.appendChild(closeButton);
            document.body.appendChild(warningDiv);
            
            // Remover o aviso após 5 segundos
            setTimeout(() => {
                if (document.body.contains(warningDiv)) {
                    document.body.removeChild(warningDiv);
                }
            }, 5000);
        }
    }

    /**
     * Reseta o progresso do usuário
     */
    resetProgress() {
        console.log('Resetando progresso devido à troca de janela');
        
        // Se houver um callback de reset, chamá-lo
        if (typeof this.options.resetCallback === 'function') {
            this.options.resetCallback();
        } else {
            // Comportamento padrão: recarregar a página
            window.location.reload();
        }
    }

    /**
     * Retorna o número de vezes que o usuário trocou de janela
     */
    getSwitchCount() {
        return this.switchCount;
    }

    /**
     * Verifica se o usuário excedeu o número permitido de trocas
     */
    hasExceededAllowedSwitches() {
        return this.switchCount > this.options.allowedSwitchCount;
    }
}

// Exportar para uso global
window.VisibilityHandler = VisibilityHandler;
