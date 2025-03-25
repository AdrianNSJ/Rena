const cards = document.querySelectorAll('.card');
let hasFlippedCard = false;
let firstCard, secondCard;
let lockBoard = false;
let matchedPairs = 0;
const totalPairs = cards.length / 2;

// Função para virar carta
function flipCard() {
    if(lockBoard) return;
    if(this === firstCard) return;

    this.classList.add('flip');
    if(!hasFlippedCard) {
        hasFlippedCard = true;
        firstCard = this;
        return;
    }

    secondCard = this;
    hasFlippedCard = false;
    checkForMatch();
}

// Função para checar se as cartas são iguais
function checkForMatch() {
    if(firstCard.dataset.card === secondCard.dataset.card) {
        disableCards();
        return;
    }

    unflipCards();
}

// Função que desabilita as cartas quando encontrado um par
function disableCards() {
    firstCard.removeEventListener('click', flipCard);
    secondCard.removeEventListener('click', flipCard);

    matchedPairs++;
    if(matchedPairs === totalPairs) {
        setTimeout(showCongratulations, 1000);
    }

    resetBoard();
}

// Função que desvira as cartas quando não são iguais
function unflipCards() {
    lockBoard = true;

    setTimeout(() => {
        firstCard.classList.remove('flip');
        secondCard.classList.remove('flip');

        resetBoard();
    }, 1500);
}

// Função que reseta o tabuleiro
function resetBoard() {
    [hasFlippedCard, lockBoard] = [false, false];
    [firstCard, secondCard] = [null, null];
}

// Função que embaralha as cartas
(function shuffle() {
    cards.forEach((card) => {
        let randomPosition = Math.floor(Math.random() * 12);
        card.style.order = randomPosition;
    });
})();

// Adiciona evento de clique na carta
cards.forEach((card) => {
    card.addEventListener('click', flipCard);
});

// ===== FUNÇÕES PARA TELA DE CONCLUSÃO =====

// Função para mostrar tela de parabéns
function showCongratulations() {
    // Criar elementos
    const congratsScreen = document.createElement('div');
    congratsScreen.id = 'congratulations-screen';
    
    const congratsContent = document.createElement('div');
    congratsContent.className = 'congratulations-content';
    
    const title = document.createElement('h1');
    title.textContent = 'Parabéns minha Baiana!';
    
    const message = document.createElement('p');
    message.textContent = 'Você concluiu o jogo!';
    
    const playAgainBtn = document.createElement('button');
    playAgainBtn.id = 'play-again';
    playAgainBtn.textContent = 'Jogar Novamente';
    
    const fireworksCanvas = document.createElement('canvas');
    fireworksCanvas.id = 'fireworks-canvas';

    // Montar a estrutura
    congratsContent.appendChild(title);
    congratsContent.appendChild(message);
    congratsContent.appendChild(playAgainBtn);
    congratsScreen.appendChild(congratsContent);
    congratsScreen.appendChild(fireworksCanvas);
    
    // Adicionar ao body
    document.body.appendChild(congratsScreen);
    
    // Iniciar fogos de artifício
    startFireworks(fireworksCanvas);
    
    // Botão para jogar novamente
    playAgainBtn.addEventListener('click', () => {
        document.body.removeChild(congratsScreen);
        resetGame();
    });
}

// Função para reiniciar o jogo
function resetGame() {
    // Resetar cartas
    cards.forEach(card => {
        card.classList.remove('flip');
        card.addEventListener('click', flipCard);
    });
    
    // Resetar variáveis
    matchedPairs = 0;
    resetBoard();
    
    // Embaralhar novamente
    setTimeout(() => {
        cards.forEach((card) => {
            let randomPosition = Math.floor(Math.random() * 12);
            card.style.order = randomPosition;
        });
    }, 500);
}

// Função para fogos de artifício (versão completa e funcional)
function startFireworks(canvas) {
    const ctx = canvas.getContext('2d');
    
    // Configurar tamanho do canvas
    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Configurações dos fogos
    const fireworks = [];
    const particles = [];
    const colors = ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff'];
    
    class Particle {
        constructor(x, y, color) {
            this.x = x;
            this.y = y;
            this.color = color || colors[Math.floor(Math.random() * colors.length)];
            this.velocity = {
                x: (Math.random() - 0.5) * 6,
                y: (Math.random() - 0.5) * 6
            };
            this.alpha = 1;
            this.decay = Math.random() * 0.015 + 0.01;
            this.size = Math.random() * 3 + 1;
        }
        
        draw() {
            ctx.globalAlpha = this.alpha;
            ctx.fillStyle = this.color;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fill();
        }
        
        update() {
            this.velocity.y += 0.05; // gravidade
            this.x += this.velocity.x;
            this.y += this.velocity.y;
            this.alpha -= this.decay;
            return this.alpha > 0;
        }
    }

    class Firework {
        constructor() {
            this.reset();
        }
        
        reset() {
            this.x = Math.random() * canvas.width;
            this.y = canvas.height;
            this.targetY = Math.random() * canvas.height / 2 + 50;
            this.speed = 2 + Math.random() * 2;
            this.velocity = {
                x: (Math.random() - 0.5) * 0.8,
                y: -this.speed
            };
            this.color = colors[Math.floor(Math.random() * colors.length)];
            this.trail = [];
            this.exploded = false;
        }
        
        draw() {
            ctx.fillStyle = this.color;
            ctx.beginPath();
            ctx.arc(this.x, this.y, 3, 0, Math.PI * 2);
            ctx.fill();
        }
        
        update() {
            if (this.exploded) {
                this.reset();
                return true;
            }
            
            this.x += this.velocity.x;
            this.y += this.velocity.y;
            
            // Criar rastro
            this.trail.push({
                x: this.x,
                y: this.y
            });
            
            if (this.trail.length > 10) {
                this.trail.shift();
            }
            
            // Desenhar rastro
            ctx.strokeStyle = this.color;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(this.trail[0].x, this.trail[0].y);
            for (let i = 1; i < this.trail.length; i++) {
                ctx.lineTo(this.trail[i].x, this.trail[i].y);
            }
            ctx.stroke();
            
            // Explodir quando chegar no alvo
            if (this.y <= this.targetY) {
                this.explode();
                return false;
            }
            return true;
        }
        
        explode() {
            this.exploded = true;
            const particleCount = 80 + Math.floor(Math.random() * 50);
            for (let i = 0; i < particleCount; i++) {
                particles.push(new Particle(this.x, this.y, this.color));
            }
        }
    }

    function animate() {
        // Limpar com alpha para efeito de rastro
        ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Criar novos fogos aleatoriamente
        if (Math.random() < 0.05 && fireworks.length < 8) {
            fireworks.push(new Firework());
        }
        
        // Atualizar fogos
        for (let i = fireworks.length - 1; i >= 0; i--) {
            if (!fireworks[i].update()) {
                fireworks.splice(i, 1);
            } else {
                fireworks[i].draw();
            }
        }
        
        // Atualizar partículas
        for (let i = particles.length - 1; i >= 0; i--) {
            if (!particles[i].update()) {
                particles.splice(i, 1);
            } else {
                particles[i].draw();
            }
        }
        
        requestAnimationFrame(animate);
    }
    
    // Iniciar com alguns fogos
    for (let i = 0; i < 3; i++) {
        setTimeout(() => {
            fireworks.push(new Firework());
        }, i * 300);
    }
    
    animate();
}
