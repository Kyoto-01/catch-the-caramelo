// Espera todo o conteúdo da página carregar antes de rodar o script
document.addEventListener("DOMContentLoaded", () => {
    
    // 1. Seleciona todos os cabeçalhos clicáveis do accordion
    const accordionHeaders = document.querySelectorAll(".accordion-header");

    // 2. Itera sobre cada um deles para adicionar o "ouvinte" de clique
    accordionHeaders.forEach(header => {
        header.addEventListener("click", () => {
            
            // 3. Pega o ".accordion-item" pai do cabeçalho que foi clicado
            const accordionItem = header.parentElement;

            // 4. Pega o ícone de "+" ou "-" dentro desse cabeçalho
            const icon = header.querySelector(".faq-icon");

            // 5. Alterna a classe 'active' no item pai.
            //    Se ela existe, remove. Se não existe, adiciona.
            accordionItem.classList.toggle("active");

            // 6. Verifica se o item AGORA tem a classe 'active'
            const isActive = accordionItem.classList.contains("active");

            // 7. Muda o texto do ícone com base no estado
            if (isActive) {
                icon.textContent = "-"; // Se está ativo (aberto), mostra -
            } else {
                icon.textContent = "+"; // Se está inativo (fechado), mostra +
            }

            if (isActive) {
                accordionHeaders.forEach(otherHeader => {
                    const otherItem = otherHeader.parentElement;

                    if (otherItem !== accordionItem && otherItem.classList.contains("active")) {
                        otherItem.classList.remove("active");
                        otherHeader.querySelector(".faq-icon").textContent = "+";
                    }
                });
            }
        });
    });
});