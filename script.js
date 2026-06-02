/* ==========================================================================
   AGÊNCIA TOOC - SCRIPTS
   Módulo Principal (Vanilla JS)
   - Controle de Menu Responsivo
   - Controle de Header
   - Smooth Scroll
   - Reveal Animations (IntersectionObserver)
   - Hero Image Sequence com HTML Canvas
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {

    /* ----------------------------------------------------------------------
       1. CONTROLE DO MENU MOBILE E HEADER
       ---------------------------------------------------------------------- */
    const header = document.getElementById('headerRef');
    const hamburger = document.querySelector('.hamburger-menu');
    const desktopNav = document.querySelector('.desktop-nav');
    const navLinks = document.querySelectorAll('.nav-links a');

    // Alternar o menu hamburger no mobile
    if (hamburger && desktopNav) {
        hamburger.addEventListener('click', () => {
            hamburger.classList.toggle('active');
            desktopNav.classList.toggle('active');
        });

        // Fechar o menu ao clicar em qualquer link (Single Page Nav)
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                hamburger.classList.remove('active');
                desktopNav.classList.remove('active');
            });
        });
    }

    // Mudar estado visual do header ao rolar a página (transparência/blur)
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    }, { passive: true });

    /* ----------------------------------------------------------------------
       2. SMOOTH SCROLL (Ancoragem Suave)
       ---------------------------------------------------------------------- */
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                e.preventDefault();
                // Ajuste pelo tamanho do header para não sobrepor o título (aprox 80px)
                const headerOffset = 80;
                const elementPosition = targetElement.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
  
                window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });

    /* ----------------------------------------------------------------------
       3. REVEAL ANIMATIONS (Animação de elementos ao aparecer na tela)
       ---------------------------------------------------------------------- */
    // Adicionando um bloco de CSS puramente com JS p/ encapsular animação sutil
    const styleBlock = document.createElement('style');
    styleBlock.textContent = `
        .reveal-element {
            opacity: 0;
            transform: translateY(40px);
            transition: opacity 0.8s cubic-bezier(0.16, 1, 0.3, 1), transform 0.8s cubic-bezier(0.16, 1, 0.3, 1);
            will-change: opacity, transform;
        }
        .reveal-element.revealed {
            opacity: 1;
            transform: translateY(0);
        }
    `;
    document.head.appendChild(styleBlock);

    // Seleciona as classes que devem receber o efeito ao rolar
    const elementsToReveal = document.querySelectorAll(
        '.section-title, .section-text, .metric-card, .method-card, .project-card, .authority-card, .timeline-item, .cta-box'
    );
    
    // Adiciona a classe inicial oculta
    elementsToReveal.forEach(el => {
        el.classList.add('reveal-element');
    });

    // Observer de Intersection para performance superior a event scroll binding
    const revealOptions = {
        threshold: 0.1, // Dispara quando 10% do elemento estiver visível
        rootMargin: "0px 0px -50px 0px"
    };

    const revealObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('revealed');
                // Para de observar o elemento após ter sido revelado (run once)
                observer.unobserve(entry.target);
            }
        });
    }, revealOptions);

    elementsToReveal.forEach(el => revealObserver.observe(el));

    /* ----------------------------------------------------------------------
       4. HERO CANVANS IMAGE SEQUENCE (Comportamento Apple-style)
       ---------------------------------------------------------------------- */
    const canvas = document.getElementById('heroCanvas');
    if (!canvas) return; // Evita erros se o elemento canvas não existir na DOM
    
    const context = canvas.getContext('2d');
    const heroSection = document.querySelector('.hero-section');
    
    // Definição de quantidade de frames conforme solicitado (000 a 076 = 77)
    const frameCount = 77;
    const images = [];
    let currentFrameIndex = 0;
    
    // Helper para gerar a string do path da imagem garantindo os "zerinhos" adequados
    const getFramePath = index => (
        `./assets/frames/frame_${index.toString().padStart(3, '0')}.jpg`
    );

    // Função de Promessa para pre-load seguro das imagens
    const loadFrame = (index) => {
        return new Promise((resolve) => {
            const img = new Image();
            img.src = getFramePath(index);
            
            img.onload = () => resolve(img);
            
            // Fallback gentil pra caso a imagem falte ou ocorra falha de network
            img.onerror = () => {
                resolve(img); // resolve vazio para não travar a Promise.all de preload
            };
        });
    };

    // Função de Boot Seqüencial
    const initCanvasSequence = async () => {
        // Priority Preload: Carrega instantaneamente os 5 primeiros frames 
        // para garantir que a renderização inicial na tela não demore
        for (let i = 0; i < Math.min(5, frameCount); i++) {
            images[i] = await loadFrame(i);
        }
        
        // Sincroniza dimensões iniciais e imprime primeiro frame real
        resizeCanvas();
        
        // Lazy Preload: Continua carregando o restante da sequência via network asycn
        // Sem bloquear a thread principal
        for (let i = 5; i < frameCount; i++) {
            loadFrame(i).then(img => {
                images[i] = img;
            });
        }
    };

    // Atualização de tamanho inteligente "cover-like"
    const resizeCanvas = () => {
        const container = canvas.parentElement;
        canvas.width = container.clientWidth;
        canvas.height = container.clientHeight;
        renderFrame(currentFrameIndex);
    };

    // Debounce no evento de Resize da janela
    let resizeTimer;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(resizeCanvas, 50);
    });

    // Função matemática avançada para desenhar a imagem centralizada ocupando tudo 
    // Comportamento idêntico a um 'object-fit: cover' no CSS
    const drawImageCover = (ctx, img, w, h) => {
        if (!img || img.naturalWidth === 0) return; // Checa integridade do objeto imagem

        const imgRatio = img.width / img.height;
        const canvasRatio = w / h;
        let renderW, renderH, x, y;

        if (imgRatio > canvasRatio) {
            renderH = h;
            renderW = h * imgRatio;
            x = (w - renderW) / 2;
            y = 0;
        } else {
            renderW = w;
            renderH = w / imgRatio;
            y = (h - renderH) / 2;
            x = 0;
        }

        ctx.clearRect(0, 0, w, h);
        ctx.drawImage(img, x, y, renderW, renderH);
    };

    // Wrapper simples para requisitar o desenho do frame
    const renderFrame = (index) => {
        if (images[index]) {
            drawImageCover(context, images[index], canvas.width, canvas.height);
        }
    };

    // Inicializa carregamento
    initCanvasSequence();

    // Variável para prevenir acúmulo de requisições de frame enquanto o hardware não estiver pronto
    let ticking = false;

    // Listener Principal de Scroll para atualizar os frames
    window.addEventListener('scroll', () => {
        if (!ticking) {
            window.requestAnimationFrame(() => {
                const scrollTop = window.scrollY;
                const heroTop = heroSection.offsetTop;
                const heroHeight = heroSection.clientHeight;
                
                // A altura que o usuário pode rolar dentro da Hero
                const scrollableDistance = heroHeight - window.innerHeight;
                
                // Distância já percorrida
                const scrollPosRel = scrollTop - heroTop;
                
                // Fração da animação (entre 0.0 e 1.0)
                let scrollFraction = scrollPosRel / scrollableDistance;
                if (scrollFraction < 0) scrollFraction = 0;
                if (scrollFraction > 1) scrollFraction = 1;

                // Definimos o index do frame baseado na porcentagem de avanço
                const frameIndex = Math.min(
                    frameCount - 1,
                    Math.floor(scrollFraction * frameCount)
                );

                // Executa paint apenas se o novo frame for diferente da tela atual
                if (currentFrameIndex !== frameIndex) {
                    currentFrameIndex = frameIndex;
                    renderFrame(currentFrameIndex);
                }
                
                ticking = false;
            });
            ticking = true; // Block até que a animação anterior tenha pintado
        }
    }, { passive: true });

});