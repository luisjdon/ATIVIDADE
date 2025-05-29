/**
 * Manipulador de respostas para o Desafio de Matemática
 * Implementa a funcionalidade de mostrar a resposta correta após erro
 * e impedir a seleção/cópia de texto das perguntas
 */

class RespostaHandler {
    constructor() {
        // Contador de erros por questão
        this.errosPorQuestao = {};
        
        // Inicializar
        this.aplicarNoSelect();
        this.inicializarEventos();
    }
    
    /**
     * Aplica a classe no-select para impedir seleção de texto
     */
    aplicarNoSelect() {
        // Selecionar todos os elementos de pergunta
        const elementosPergunta = document.querySelectorAll('.pergunta-texto, .questao-container h3, .questao-container p, .questao-container .enunciado');
        
        // Adicionar classe no-select
        elementosPergunta.forEach(elemento => {
            elemento.classList.add('no-select');
            
            // Desabilitar o menu de contexto (clique direito)
            elemento.addEventListener('contextmenu', e => {
                e.preventDefault();
                return false;
            });
            
            // Impedir cópia (Ctrl+C)
            elemento.addEventListener('copy', e => {
                e.preventDefault();
                return false;
            });
            
            // Impedir corte (Ctrl+X)
            elemento.addEventListener('cut', e => {
                e.preventDefault();
                return false;
            });
        });
    }
    
    /**
     * Inicializa os eventos para verificação de respostas
     */
    inicializarEventos() {
        // Capturar eventos de resposta (adapte conforme sua estrutura HTML)
        document.addEventListener('click', e => {
            // Verificar se é um botão de verificar resposta
            if (e.target.matches('.btn-verificar') || e.target.closest('.btn-verificar')) {
                const questaoContainer = e.target.closest('.questao-container');
                if (questaoContainer) {
                    const questaoId = questaoContainer.dataset.questaoId;
                    const respostaInput = questaoContainer.querySelector('.resposta-input');
                    const respostaCorreta = questaoContainer.dataset.respostaCorreta;
                    
                    if (respostaInput && respostaCorreta) {
                        const respostaUsuario = respostaInput.value.trim();
                        
                        // Verificar se a resposta está correta
                        if (this.verificarResposta(respostaUsuario, respostaCorreta)) {
                            // Resposta correta - resetar contador de erros
                            this.errosPorQuestao[questaoId] = 0;
                            this.ocultarRespostaCorreta(questaoContainer);
                        } else {
                            // Resposta incorreta - incrementar contador e mostrar resposta correta
                            if (!this.errosPorQuestao[questaoId]) {
                                this.errosPorQuestao[questaoId] = 0;
                            }
                            this.errosPorQuestao[questaoId]++;
                            
                            // Mostrar a resposta correta após o primeiro erro
                            this.mostrarRespostaCorreta(questaoContainer, respostaCorreta);
                        }
                    }
                }
            }
            
            // Verificar se é o botão "Entendi"
            if (e.target.matches('.btn-entendi')) {
                const questaoContainer = e.target.closest('.questao-container');
                if (questaoContainer) {
                    this.ocultarRespostaCorreta(questaoContainer);
                }
            }
        });
    }
    
    /**
     * Verifica se a resposta do usuário está correta
     * @param {string} respostaUsuario - Resposta fornecida pelo usuário
     * @param {string} respostaCorreta - Resposta correta da questão
     * @return {boolean} - Verdadeiro se a resposta estiver correta
     */
    verificarResposta(respostaUsuario, respostaCorreta) {
        // Normalizar ambas as respostas para comparação
        const normalizada1 = this.normalizarResposta(respostaUsuario);
        const normalizada2 = this.normalizarResposta(respostaCorreta);
        
        return normalizada1 === normalizada2;
    }
    
    /**
     * Normaliza a resposta para comparação (remove espaços extras, acentos, etc.)
     * @param {string} resposta - Resposta a ser normalizada
     * @return {string} - Resposta normalizada
     */
    normalizarResposta(resposta) {
        if (!resposta) return '';
        
        // Converter para minúsculas
        let normalizada = resposta.toLowerCase();
        
        // Remover acentos
        normalizada = normalizada.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
        
        // Remover espaços extras
        normalizada = normalizada.replace(/\s+/g, ' ').trim();
        
        return normalizada;
    }
    
    /**
     * Mostra a resposta correta no container da questão
     * @param {Element} questaoContainer - Container da questão
     * @param {string} respostaCorreta - Resposta correta da questão
     */
    mostrarRespostaCorreta(questaoContainer, respostaCorreta) {
        // Verificar se já existe um elemento de resposta correta
        let respostaCorretaElement = questaoContainer.querySelector('.resposta-correta');
        
        if (!respostaCorretaElement) {
            // Criar o elemento se não existir
            respostaCorretaElement = document.createElement('div');
            respostaCorretaElement.className = 'resposta-correta';
            
            // Destacar a alternativa correta se for múltipla escolha
            const alternativasContainer = questaoContainer.querySelector('.opcoes-container');
            let mensagemResposta = '';
            
            if (alternativasContainer) {
                // É uma questão de múltipla escolha
                const alternativas = questaoContainer.querySelectorAll('.opcao');
                let letraCorreta = '';
                
                // Encontrar a alternativa correta e destacar
                alternativas.forEach((alternativa, index) => {
                    const textoAlternativa = alternativa.querySelector('.texto-alternativa').textContent;
                    const letra = String.fromCharCode(65 + index); // A, B, C, D...
                    
                    if (textoAlternativa === respostaCorreta) {
                        alternativa.classList.add('alternativa-correta');
                        letraCorreta = letra;
                    }
                });
                
                mensagemResposta = `<p>A resposta correta deveria ser: <span class="resposta-correta-valor">Alternativa ${letraCorreta}: ${respostaCorreta}</span></p>`;
            } else {
                // É uma questão de resposta direta
                mensagemResposta = `<p>A resposta correta deveria ser: <span class="resposta-correta-valor">${respostaCorreta}</span></p>`;
            }
            
            // Adicionar o texto com a resposta correta
            respostaCorretaElement.innerHTML = `
                ${mensagemResposta}
                <button class="btn-entendi">Entendi</button>
            `;
            
            // Adicionar ao container da questão
            questaoContainer.appendChild(respostaCorretaElement);
        }
        
        // Mostrar o elemento
        respostaCorretaElement.style.display = 'block';
    }
    
    /**
     * Oculta a resposta correta no container da questão
     * @param {Element} questaoContainer - Container da questão
     */
    ocultarRespostaCorreta(questaoContainer) {
        const respostaCorretaElement = questaoContainer.querySelector('.resposta-correta');
        if (respostaCorretaElement) {
            respostaCorretaElement.style.display = 'none';
        }
    }
}

// Inicializar o manipulador quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', () => {
    window.respostaHandler = new RespostaHandler();
    console.log('Manipulador de respostas inicializado');
});
