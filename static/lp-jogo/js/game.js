// Espera o DOM (estrutura HTML) carregar antes de executar o script
document.addEventListener("DOMContentLoaded", () => {

    // --- 1. SELETORES DE ELEMENTOS ---
    const body = document.body;
    const videoOverlay = document.getElementById("video-overlay");
    const introVideo = document.getElementById("intro-video");
    const scoreText = document.getElementById("score-text");

    const challengeCards = document.querySelectorAll(".challenge-card");
    
    const hintModal = document.getElementById("hint-modal");
    const hintConfirmBtn = document.getElementById("hint-confirm");
    const hintCancelBtn = document.getElementById("hint-cancel");

    const winModal = document.getElementById("win-modal");
    const winCloseBtn = document.getElementById("win-close");

    // --- 2. ESTADO DO JOGO ---
    let currentScore = 0;
    let unlockedLevel = 1;
    let cardRequestingHint = null; // Guarda qual card pediu a dica

    // --- 3. FUNÇÕES PRINCIPAIS ---

    /**
     * Destrava a rolagem e esconde o vídeo quando ele termina.
     */
    function startGame() {
        videoOverlay.style.display = "none";
        body.classList.remove("noscroll");
    }

    /**
     * Abre ou fecha um card do acordeão.
     */
    function toggleCard(card) {
        // Não faz nada se o card estiver travado ou já resolvido
        if (card.classList.contains("locked") || card.classList.contains("solved")) {
            return;
        }

        // Fecha todos os outros cards (opcional, mas bom para CTF)
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
            
            // Trava o card em estado de "resolvido"
            const toggleBtn = card.querySelector(".card-toggle");
            toggleBtn.textContent = "✔"; // Ícone de "check"
            toggleBtn.disabled = true;
            form.style.display = "none";
            
            // Atualiza a pontuação
            currentScore += points;
            scoreText.textContent = `pontuação: ${currentScore}`;
            
            // Desbloqueia o próximo nível
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
            input.classList.add("shake"); // (Vamos adicionar esse CSS)
            setTimeout(() => input.classList.remove("shake"), 500);
        }
    }

    /**
     * Abre o modal de confirmação de dica.
     */
    function openHintModal(card) {
        cardRequestingHint = card; // Salva qual card está pedindo
        hintModal.style.display = "flex";
    }

    /**
     * Fecha o modal de dica.
     */
    function closeHintModal() {
        hintModal.style.display = "none";
        cardRequestingHint = null;
    }

    /**
     * Oculta o modal de vitória.
     */
    function closeWinModal() {
        winModal.style.display = "none";
    }

    /**
     * Desbloqueia a próxima dica trancada no card.
     */
    function confirmHint() {
        if (cardRequestingHint) {
            // Encontra a primeira dica que ainda está trancada e borrada
            const lockedHint = cardRequestingHint.querySelector(".hint-item.locked");
            if (lockedHint) {
                // Desbloqueia a dica
                lockedHint.classList.remove("locked");
                lockedHint.querySelector(".hint-text").classList.remove("blurred");
                
                // Opcional: muda o botão "MOSTRAR"
                const mostrarBtn = lockedHint.querySelector(".button-mostrar");
                mostrarBtn.textContent = "VISTO";
                mostrarBtn.disabled = true;
                
            } else {
                // Se não houver mais dicas trancadas
                alert("O Caramelo não tem mais dicas para esta fase!");
            }
            closeHintModal();
        }
    }

    // --- 4. INICIALIZAÇÃO E EVENTOS ---

    // Evento para destravar o jogo
    // Use 'ended' para produção, 'click' para testar rápido
    introVideo.addEventListener('ended', startGame); 
    // introVideo.addEventListener('click', startGame); // Descomente para testar (clica no vídeo para pular)

    // Adiciona eventos de clique a todos os cards
    challengeCards.forEach(card => {
        // Evento no botão de abrir/fechar (+/-)
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
    });

    // Eventos dos modais
    hintConfirmBtn.addEventListener("click", confirmHint);
    hintCancelBtn.addEventListener("click", closeHintModal);
    winCloseBtn.addEventListener("click", closeWinModal);

});