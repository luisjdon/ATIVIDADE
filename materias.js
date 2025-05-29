/**
 * MATERIAS.JS
 * Sistema de matérias e tópicos para o Desafio Supremo
 * Gerencia a seleção aleatória de matérias e tópicos para as perguntas
 * Integrado com o sistema de Desafio Supremo para suportar matérias mistas
 */

// Lista de matérias e tópicos disponíveis
const materias = [
    {
        id: 'matematica',
        nome: 'Matemática',
        topicos: ['Equações', 'Geometria', 'Aritmética', 'Probabilidade', 'Estatística', 'Álgebra', 'Trigonometria']
    },
    {
        id: 'portugues',
        nome: 'Português',
        topicos: ['Gramática', 'Interpretação de Texto', 'Literatura', 'Redação', 'Ortografia', 'Figuras de Linguagem']
    },
    {
        id: 'ciencias',
        nome: 'Ciências',
        topicos: ['Biologia', 'Química', 'Física', 'Astronomia', 'Ecologia', 'Genética', 'Sistema Solar']
    },
    {
        id: 'historia',
        nome: 'História',
        topicos: ['História do Brasil', 'História Mundial', 'História Antiga', 'Idade Média', 'História Contemporânea', 'Revoluções', 'Era Vargas', 'República Velha', 'Ditadura Militar']
    },
    {
        id: 'geografia',
        nome: 'Geografia',
        topicos: ['Geografia do Brasil', 'Geografia Mundial', 'Cartografia', 'Clima', 'Geopolítica', 'Relevo', 'Urbanização']
    },
    {
        id: 'ingles',
        nome: 'Inglês',
        topicos: ['Gramática', 'Vocabulário', 'Interpretação de Texto', 'Conversação', 'Tempos Verbais', 'Expressões Idiomáticas']
    }
];

// Variável para controlar se estamos no modo de matérias mistas
let usandoMateriasMistas = false;

/**
 * Inicializa o sistema de matérias
 * Verifica se o modo de matérias mistas está ativado
 */
function inicializarSistemaMaterias() {
    // Verificar se o modo de matérias mistas está ativado
    usandoMateriasMistas = localStorage.getItem('materiasMistas') === 'true' || 
                          localStorage.getItem('modoSupremo') === 'true';
    
    console.log(`Sistema de matérias inicializado. Modo matérias mistas: ${usandoMateriasMistas}`);
    
    // Expor a variável globalmente para uso em outros módulos
    window.usandoMateriasMistas = usandoMateriasMistas;
}

/**
 * Retorna a lista completa de matérias disponíveis
 * @returns {Array} Lista de matérias
 */
function obterMaterias() {
    return materias;
}

/**
 * Retorna os tópicos de uma matéria específica
 * @param {string} materiaId - ID da matéria
 * @returns {Array} Lista de tópicos da matéria
 */
function obterTopicos(materiaId) {
    const materia = materias.find(m => m.id === materiaId);
    return materia ? materia.topicos : [];
}

/**
 * Seleciona uma matéria aleatória
 * @returns {Object} Matéria selecionada aleatoriamente
 */
function selecionarMateriaAleatoria() {
    const indice = Math.floor(Math.random() * materias.length);
    return materias[indice];
}

/**
 * Seleciona um tópico aleatório de uma matéria específica
 * @param {string} materiaId - ID da matéria
 * @returns {string} Tópico selecionado aleatoriamente
 */
function selecionarTopicoAleatorio(materiaId) {
    const topicos = obterTopicos(materiaId);
    if (topicos.length === 0) return null;
    
    const indice = Math.floor(Math.random() * topicos.length);
    return topicos[indice];
}

/**
 * Gera uma questão com base no modo atual (matéria única ou mista)
 * @returns {Promise} Promessa que resolve com a questão gerada
 */
function gerarQuestaoAtual() {
    return new Promise((resolve, reject) => {
        if (usandoMateriasMistas) {
            // No modo de matérias mistas, selecionar uma matéria aleatória
            const materiaAleatoria = selecionarMateriaAleatoria();
            const topicoAleatorio = selecionarTopicoAleatorio(materiaAleatoria.id);
            
            // Criar um elemento para mostrar a matéria atual
            const indicadorMateria = document.createElement('div');
            indicadorMateria.className = 'indicador-materia';
            indicadorMateria.textContent = `${materiaAleatoria.nome}: ${topicoAleatorio}`;
            
            // Adicionar o indicador ao container da questão
            const containerQuestao = document.getElementById('questao-container');
            if (containerQuestao) {
                // Remover indicador anterior se existir
                const indicadorAnterior = containerQuestao.querySelector('.indicador-materia');
                if (indicadorAnterior) {
                    containerQuestao.removeChild(indicadorAnterior);
                }
                
                // Adicionar o novo indicador
                containerQuestao.insertBefore(indicadorMateria, containerQuestao.firstChild);
            }
            
            // Verificar se estamos no modo Desafio Supremo ou Punição
            const modoSupremo = localStorage.getItem('modoSupremo') === 'true';
            const modoPunicao = localStorage.getItem('modoPunicao') === 'true';
            
            // Preparar os dados para a requisição
            const requestData = {
                materia: materiaAleatoria.nome,
                topico: topicoAleatorio,
                materiasMistas: true
            };
            
            // Adicionar informação de modo punição ou supremo se estiver ativo
            if (modoSupremo) {
                requestData.desafioSupremo = true;
            }
            
            if (modoPunicao) {
                requestData.modoPunicao = true;
            }
            
            // Fazer a requisição para o servidor
            fetch('gemini.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(requestData)
            })
            .then(response => response.json())
            .then(data => {
                if (data.perguntas && data.perguntas.length > 0) {
                    // Adicionar informação da matéria e tópico à pergunta
                    const pergunta = data.perguntas[0];
                    pergunta.materia = materiaAleatoria.nome;
                    pergunta.topico = topicoAleatorio;
                    
                    // Se for modo supremo, marcar a pergunta
                    if (modoSupremo) {
                        pergunta.desafioSupremo = true;
                    }
                    
                    resolve(pergunta);
                } else {
                    reject(new Error('Nenhuma pergunta retornada pelo servidor'));
                }
            })
            .catch(erro => reject(erro));
        } else {
            // No modo normal, usar a matéria e tópico selecionados pelo usuário
            // Esta parte deve ser implementada conforme a lógica existente
            resolve(null); // Retornar null para indicar que o modo normal deve ser usado
        }
    });
}

// Inicializar o sistema quando o documento estiver pronto
document.addEventListener('DOMContentLoaded', inicializarSistemaMaterias);

// Exportar funções para uso em outros arquivos
window.materias = {
    obterMaterias,
    obterTopicos,
    selecionarMateriaAleatoria,
    selecionarTopicoAleatorio,
    gerarQuestaoAtual,
    get usandoMateriasMistas() { return usandoMateriasMistas; },
    set usandoMateriasMistas(valor) { usandoMateriasMistas = valor; }
};
