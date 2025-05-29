# Desafio de Matemática - Aplicativo Educativo Gamificado

## Visão Geral
O "Desafio de Matemática" é um aplicativo web educativo e gamificado destinado a estudantes do 7º e 8º ano. Ele utiliza a API Gemini do Google para gerar questões de matemática personalizadas e dinâmicas, proporcionando uma experiência de aprendizado interativa e envolvente.

## Funcionalidades Principais

### 1. Geração de Questões
- Utiliza a API Gemini do Google para criar questões de matemática variadas
- Abrange tópicos como álgebra, geometria, frações, porcentagem e equações
- Oferece opção de "Desafio do Dia" com recompensas extras

### 2. Sistema de Gamificação
- **Moedas**: Ganhe moedas ao acertar questões (5 moedas por acerto normal, 10 moedas por acerto no desafio diário)
- **Níveis**: Suba de nível conforme acumula pontos, com recompensas por nível
- **Medalhas**: Conquiste medalhas por categorias específicas:
  - Mestre da Álgebra
  - Gênio da Geometria
  - Fera das Frações
  - Velocista (por estudar antes de responder)

### 3. Mascote Interativo
- Mascote virtual que interage com o usuário
- Opções de diferentes personagens (Matix, Pandi, Miau Math, Sábia)
- Chat com o mascote usando a API Gemini para respostas personalizadas
- Reações emocionais do mascote conforme o desempenho do usuário

### 4. Personalização
- Seleção de avatar personalizado
- Diferentes temas visuais (padrão, princesa, gamer, floresta)
- Controles de áudio (ativar/desativar sons)

### 5. Recursos de Aprendizado
- Botão "Estudar" para cada questão, que fornece explicações detalhadas
- Explicações geradas pela API Gemini, adaptadas ao nível do estudante
- Visualizações e ilustrações para conceitos matemáticos

### 6. Sistema de Consequências
- Limite de 4 erros por sessão
- Ao atingir 4 erros, o aplicativo simula um "bloqueio de celular" até o dia seguinte
- Contador regressivo mostrando quanto tempo falta para o desbloqueio

### 7. Efeitos Visuais e Sonoros
- Animações de confetes para celebrar conquistas
- Sons para acertos, erros, ganho de moedas e subida de nível
- Efeitos visuais para feedback imediato

## Tecnologias Utilizadas
- **Frontend**: HTML5, CSS3, JavaScript
- **Backend**: PHP
- **API**: Google Gemini para geração de questões e interações com o mascote
- **Armazenamento**: LocalStorage para salvar o progresso do usuário

## Requisitos de Funcionamento
- O aplicativo deve ser executado através de um servidor PHP local
- Não pode ser aberto diretamente pelo sistema de arquivos devido a restrições de CORS
- Requer conexão com a internet para acessar a API Gemini

## Estrutura de Arquivos
- **index.html**: Interface principal do aplicativo
- **style.css**: Estilos e temas visuais
- **script.js**: Lógica de funcionamento e gamificação
- **gemini.php**: Integração com a API Gemini para geração de questões
- **explicacao.php**: Geração de explicações para as questões
- **mascote.php**: Gerenciamento das interações com o mascote
- **api-key.php**: Armazenamento seguro da chave da API Gemini

## Fluxo de Uso
1. O usuário acessa o aplicativo e é recebido pelo mascote
2. Questões de matemática são geradas automaticamente
3. O usuário pode responder às questões ou solicitar explicações
4. Ao acertar, o usuário ganha moedas, pontos e possivelmente medalhas
5. Ao errar 4 questões, o acesso é bloqueado até o dia seguinte
6. O progresso é salvo automaticamente no navegador do usuário

## Objetivo Educacional
O aplicativo combina aprendizado de matemática com elementos de gamificação para tornar o estudo mais envolvente e motivador para estudantes do ensino fundamental, incentivando a prática regular e premiando o esforço e o progresso.
