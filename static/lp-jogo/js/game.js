// Espera o DOM (estrutura HTML) carregar antes de executar o script
document.addEventListener("DOMContentLoaded", () => {

    // --- 1. SELETORES DE ELEMENTOS ---
    const body = document.body;
    // Estes podem ser 'null' se o HTML não tiver, e tudo bem
    const videoOverlay = document.getElementById("video-overlay"); 
    const introVideo = document.getElementById("intro-video");     
    const muteToggleBtn = document.getElementById("mute-toggle");

    // Estes são essenciais
    const scoreText = document.getElementById("score-text");
    const challengeCards = document.querySelectorAll(".challenge-card");
    const hintModal = document.getElementById("hint-modal");
    const hintConfirmBtn = document.getElementById("hint-confirm");
    const hintCancelBtn = document.getElementById("hint-cancel");
    const winModal = document.getElementById("win-modal");
    const winCloseBtn = document.getElementById("win-close");

    // ==================================================================
    // === ⚡️ BLOCO DE ÁUDIO ⚡️ ===
    // ==================================================================
    const audioTheme = new Audio('assets/audio/theme.mp3');
    const audioCorrect = new Audio('assets/audio/correct.mp3');
    const audioError = new Audio('assets/audio/error.mp3');
    const audioClick = new Audio('assets/audio/click.mp3');
    const audioWin = new Audio('assets/audio/win.mp3');
    const audioHint = new Audio('assets/audio/hint.mp3');

    audioTheme.loop = true;
    audioTheme.volume = 0.3;
    // ==================================================================
    // === FIM DO BLOCO DE ÁUDIO ===
    // ==================================================================

    // --- 2. ESTADO DO JOGO ---
    let currentScore = 0;
    let unlockedLevel = 1;
    let cardRequestingHint = null;
    let isMuted = false;

    // --- 3. FUNÇÕES PRINCIPAIS ---

    function playSound(audioElement) {
        if (isMuted) return;
        const sound = audioElement.cloneNode();
        sound.volume = audioElement.volume;
        sound.play();
    }
    
    function startGame() {
        // Verifica se o overlay existe antes de tentar usá-lo
        if (videoOverlay) {
            videoOverlay.style.display = "none";
        }
        body.classList.remove("noscroll");
        
        if (!isMuted) {
            audioTheme.play().catch(e => console.error("Autoplay de áudio bloqueado."));
        }
    }

    function toggleMute() {
        // Se o botão não existir (por algum motivo), não faz nada
        if (!muteToggleBtn) return; 

        isMuted = !isMuted;
        const icon = muteToggleBtn.querySelector('i');
        
        if (isMuted) {
            audioTheme.pause();
            icon.classList.remove('fa-volume-up');
            icon.classList.add('fa-volume-mute');
        } else {
            audioTheme.play().catch(e => console.error("Autoplay de áudio bloqueado."));
            icon.classList.remove('fa-volume-mute');
            icon.classList.add('fa-volume-up');
        }
    }

    function toggleCard(card) {
        if (card.classList.contains("locked") || card.classList.contains("solved")) {
            return;
        }
        challengeCards.forEach(otherCard => {
            if (otherCard !== card && otherCard.classList.contains("active")) {
                otherCard.classList.remove("active");
                otherCard.querySelector(".card-toggle").textContent = "+";
                otherCard.querySelector(".flag-form").style.display = "none";
            }
        });
        card.classList.toggle("active");
        const isActive = card.classList.contains("active");
        if (isActive) {
            playSound(audioClick);
        }
        card.querySelector(".card-toggle").textContent = isActive ? "-" : "+";
        card.querySelector(".flag-form").style.display = isActive ? "flex" : "none";
    }
    
    async function checkFlag(form) {
        const card = form.closest(".challenge-card");
        const input = form.querySelector(".flag-input");
        const submitButton = form.querySelector(".flag-submit");
        const points = parseInt(card.dataset.points, 10);
        
        const challengeNumber = card.dataset.challenge;
        const endpoint = `http://127.0.0.1:5000/flag${challengeNumber}`;

        const payload = {
            flag: input.value
        };

        submitButton.disabled = true;
        submitButton.textContent = "...";

        try {
            const response = await fetch(endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            });

            if (response.status === 200) {
                // --- ACERTOU! ---
                playSound(audioCorrect);
                card.classList.add("solved");
                card.classList.remove("active");
                
                const toggleBtn = card.querySelector(".card-toggle");
                toggleBtn.textContent = "✔";
                toggleBtn.disabled = true;
                form.style.display = "none";
                
                currentScore += points;
                scoreText.textContent = `pontuação: ${currentScore}`;
                
                const currentLevel = parseInt(challengeNumber, 10);
                const nextLevel = currentLevel + 1;
                
                if (nextLevel > 7) {
                    audioTheme.pause();
                    playSound(audioWin);
                    winModal.style.display = "flex";
                } else {
                    const nextCard = document.querySelector(`.challenge-card[data-challenge="${nextLevel}"]`);
                    if (nextCard) {
                        nextCard.classList.remove("locked");
                        unlockedLevel = nextLevel;
                    }
                }
            } else {
                // --- ERROU! (401 ou outro erro) ---
                playSound(audioError);
                input.classList.add("shake");
                setTimeout(() => input.classList.remove("shake"), 500);
            }

        } catch (error) {
            // --- Erro de Rede (servidor caiu, etc) ---
            console.error('Erro na requisição fetch:', error);
            playSound(audioError);
            input.classList.add("shake");
            setTimeout(() => input.classList.remove("shake"), 500);
            alert("Erro de conexão: Não foi possível falar com o servidor do Miawlware!");
        } finally {
            if (!card.classList.contains("solved")) {
                submitButton.disabled = false;
                submitButton.textContent = "OK";
            }
        }
    }

    function openHintModal(card) {
        playSound(audioHint);
        cardRequestingHint = card;
        hintModal.style.display = "flex";
    }

    function closeHintModal() {
        hintModal.style.display = "none";
        cardRequestingHint = null;
    }

    function closeWinModal() {
        winModal.style.display = "none";
    }

    function confirmHint() {
        if (cardRequestingHint) {
            playSound(audioClick);
            const lockedHint = cardRequestingHint.querySelector(".hint-item.locked");
            if (lockedHint) {
                lockedHint.classList.remove("locked");
                lockedHint.querySelector(".hint-text").classList.remove("blurred");
                
                const mostrarBtn = lockedHint.querySelector(".button-mostrar");
                mostrarBtn.textContent = "VISTO";
                mostrarBtn.disabled = true;
                
            } else {
                alert("O Caramelo não tem mais dicas para esta fase!");
            }
            closeHintModal();
        }
    }

    // --- 4. INICIALIZAÇÃO E EVENTOS ---
    
    // 1. Verifica se os elementos do vídeo existem
    if (introVideo && videoOverlay) {
        // Se existem, usa a lógica do vídeo
        introVideo.addEventListener('ended', startGame); 
        videoOverlay.addEventListener('click', () => {
            introVideo.pause();
            startGame();
        });
    } else {
        // Se NÃO existem, inicia o jogo imediatamente
        console.warn("Elementos do vídeo (intro-video, video-overlay) não encontrados. Iniciando o jogo diretamente.");
        // Também remove a classe 'noscroll' do body, se o vídeo não existir
        body.classList.remove("noscroll"); 
        startGame(); // Chama o start para começar a música
    }
    
    // 2. Verifica se o botão de mute existe
    if (muteToggleBtn) {
        muteToggleBtn.addEventListener('click', toggleMute);
    } else {
        console.warn("AVISO: O botão de mute (id='mute-toggle') não foi encontrado no HTML.");
    }

    // Listeners dos Cards (agora vão ser executados)
    challengeCards.forEach(card => {
        card.querySelector(".card-toggle").addEventListener("click", () => {
            toggleCard(card);
        });

        card.querySelector(".flag-form").addEventListener("submit", (e) => {
            e.preventDefault();
            checkFlag(e.target); // e.target é o <form>
        });

        const dicasButton = card.querySelector(".button-dicas");
        if (dicasButton) {
            dicasButton.addEventListener("click", () => {
                openHintModal(card);
            });
        }
    });

    // Listeners dos Modais
    hintConfirmBtn.addEventListener("click", confirmHint);
    hintCancelBtn.addEventListener("click", closeHintModal);
    winCloseBtn.addEventListener("click", closeWinModal);

});