// Espera o DOM (estrutura HTML) carregar antes de executar o script
document.addEventListener("DOMContentLoaded", () => {

    // --- 1. SELETORES DE ELEMENTOS ---
    const scoreText = document.getElementById("score-text");
    const challengeCards = document.querySelectorAll(".challenge-card");
    
    // Modal de dica grátis
    const hintModal = document.getElementById("hint-modal");
    const hintConfirmBtn = document.getElementById("hint-confirm");
    const hintCancelBtn = document.getElementById("hint-cancel");

    // NOVO: Modal de dica com penalidade
    const hintPenaltyModal = document.getElementById("hint-penalty-modal");
    const hintPenaltyConfirmBtn = document.getElementById("hint-penalty-confirm");
    const hintPenaltyCancelBtn = document.getElementById("hint-penalty-cancel");

    // Modal de vitória
    const winModal = document.getElementById("win-modal");
    const winCloseBtn = document.getElementById("win-close");

    // --- 2. ESTADO DO JOGO ---
    let currentScore = 0;
    let unlockedLevel = 1;
    let cardRequestingHint = null; // Guarda qual card pediu a dica

    // --- 3. FUNÇÕES PRINCIPAIS ---

    /**
     * Abre ou fecha um card do acordeão.
     */
    function toggleCard(card) {
        // Não faz nada se o card estiver travado ou já resolvido
        if (card.classList.contains("locked") || card.classList.contains("solved")) {
            return;
        }

        // Fecha todos os outros cards
        challengeCards.forEach(otherCard => {
            if (otherCard !== card && otherCard.classList.contains("active")) {
                otherCard.classList.remove("active");
                otherCard.querySelector(".card-toggle").textContent = "+";
                otherCard.querySelector(".flag-form").style.display = "none";
            }
        });

        // Abre ou fecha o card clicado
        card.classList.toggle("active");
        const isActive = card.classList.contains("active");
        card.querySelector(".card-toggle").textContent = isActive ? "-" : "+";
        card.querySelector(".flag-form").style.display = isActive ? "flex" : "none";
    }

    /**
     * Verifica se a flag inserida está correta.
     */
    function checkFlag(form) {
        const card = form.closest(".challenge-card");
        const input = form.querySelector(".flag-input");
        const correctAnswer = card.dataset.answer;
        const points = parseInt(card.dataset.points, 10);
        
        if (input.value === correctAnswer) {
            // --- ACERTOU! ---
            card.classList.add("solved");
            card.classList.remove("active");
            
            const toggleBtn = card.querySelector(".card-toggle");
            toggleBtn.textContent = "✔";
            toggleBtn.disabled = true;
            form.style.display = "none";
            
            // Atualiza a pontuação
            currentScore += points;
            scoreText.textContent = `pontuação: ${currentScore}`;
            
            const currentLevel = parseInt(card.dataset.challenge, 10);
            const nextLevel = currentLevel + 1;
            
            if (nextLevel > 7) {
                // Ganhou o jogo!
                winModal.style.display = "flex";
            } else {
                // Desbloqueia o próximo card
                const nextCard = document.querySelector(`.challenge-card[data-challenge="${nextLevel}"]`);
                if (nextCard) {
                    nextCard.classList.remove("locked");
                    unlockedLevel = nextLevel;
                }
            }
        } else {
            // --- ERROU! ---
            input.classList.add("shake");
            setTimeout(() => input.classList.remove("shake"), 500);
        }
    }

    /**
     * ATUALIZADO: Abre o modal de confirmação de dica (grátis ou com penalidade).
     */
    function openHintModal(card) {
        cardRequestingHint = card; // Salva qual card está pedindo
        
        // Verifica qual é a próxima dica trancada
        const nextLockedHint = card.querySelector(".hint-item.locked");
        
        if (!nextLockedHint) {
            alert("O Caramelo não tem mais dicas para esta fase!");
            cardRequestingHint = null;
            return;
        }

        const hintNumber = nextLockedHint.dataset.hint;

        // Se for a dica 3 (a última), mostra o modal de penalidade
        if (hintNumber === "3") {
            hintPenaltyModal.style.display = "flex";
        } else {
            // Se for a 1 ou 2, mostra o modal grátis
            hintModal.style.display = "flex";
        }
    }

    /**
     * Fecha o modal de dica (grátis).
     */
    function closeHintModal() {
        hintModal.style.display = "none";
        cardRequestingHint = null;
    }

    /**
     * NOVO: Fecha o modal de dica (penalidade).
     */
    function closePenaltyHintModal() {
        hintPenaltyModal.style.display = "none";
        cardRequestingHint = null;
    }

    /**
     * Oculta o modal de vitória.
     */
    function closeWinModal() {
        winModal.style.display = "none";
    }

    /**
     * Desbloqueia uma dica (grátis).
     */
    function confirmHint() {
        if (cardRequestingHint) {
            const lockedHint = cardRequestingHint.querySelector(".hint-item.locked");
            if (lockedHint) {
                lockedHint.classList.remove("locked");
                lockedHint.querySelector(".hint-text").classList.remove("blurred");
                
                const mostrarBtn = lockedHint.querySelector(".button-mostrar");
                mostrarBtn.textContent = "VISTO";
                mostrarBtn.disabled = true;
            }
            closeHintModal();
        }
    }

    /**
     * NOVO: Desbloqueia a dica final (com penalidade de 10 pontos).
     */
    function confirmPenaltyHint() {
        if (cardRequestingHint) {
            const lockedHint = cardRequestingHint.querySelector(".hint-item.locked");
            if (lockedHint && lockedHint.dataset.hint === "3") {
                // Desbloqueia a dica
                lockedHint.classList.remove("locked");
                lockedHint.querySelector(".hint-text").classList.remove("blurred");
                
                const mostrarBtn = lockedHint.querySelector(".button-mostrar");
                mostrarBtn.textContent = "VISTO";
                mostrarBtn.disabled = true;

                // Aplica a penalidade
                currentScore -= 10;
                scoreText.textContent = `pontuação: ${currentScore}`;
            }
            closePenaltyHintModal();
        }
    }

    // --- 4. INICIALIZAÇÃO E EVENTOS ---

    // Adiciona eventos de clique a todos os cards
    challengeCards.forEach(card => {
        // Evento no botão de abrir/fechar (+/-)
        // ERRO CORRIGIDO: Era ()_ =>, agora é () =>
        card.querySelector(".card-toggle").addEventListener("click", () => {
            toggleCard(card);
        });

        // Evento no envio da flag
        card.querySelector(".flag-form").addEventListener("submit", (e) => {
            e.preventDefault(); // Impede o recarregamento da página
            checkFlag(e.target);
        });

        // Evento no botão "DICAS" (com lâmpada)
        const dicasButton = card.querySelector(".button-dicas");
        if (dicasButton) {
            dicasButton.addEventListener("click", () => {
                openHintModal(card);
            });
        }
        
        // Evento nos botões "MOSTRAR" (agora não fazem nada, pois o "DICAS" centraliza)
        // Você pode reativar isso se quiser que eles abram o modal também
        /*
        card.querySelectorAll(".button-mostrar").forEach(btn => {
            btn.addEventListener("click", () => {
                if(btn.closest(".hint-item").classList.contains("locked")) {
                    openHintModal(card);
                }
            });
        });
        */
    });

    // Eventos dos modais
    hintConfirmBtn.addEventListener("click", confirmHint);
    hintCancelBtn.addEventListener("click", closeHintModal);
    winCloseBtn.addEventListener("click", closeWinModal);

    // NOVO: Eventos do modal de penalidade
    hintPenaltyConfirmBtn.addEventListener("click", confirmPenaltyHint);
    hintPenaltyCancelBtn.addEventListener("click", closePenaltyHintModal);

});