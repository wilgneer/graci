// ============================================================
// IMAGEM DE ALTO VALOR - LANDING PAGE SCRIPT
// Interatividade e animações
// ============================================================

(function() {
  'use strict';

  // ==================== MODAL ====================
  const modal = document.getElementById('leadModal');
  const modalBtns = document.querySelectorAll('[data-open-modal]');
  const modalClose = document.getElementById('modalClose');
  const leadForm = document.getElementById('leadForm');
  const formFeedback = document.getElementById('formFeedback');

  // Abrir modal
  modalBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      modal.classList.add('active');
      document.body.style.overflow = 'hidden';
    });
  });

  // Fechar modal
  const closeModal = () => {
    modal.classList.remove('active');
    document.body.style.overflow = '';
  };

  modalClose.addEventListener('click', closeModal);

  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      closeModal();
    }
  });

  // Fechar com ESC
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('active')) {
      closeModal();
    }
  });

  // ==================== FORMULÁRIO ====================
  leadForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const formData = {
      nome: document.getElementById('nome').value.trim(),
      email: document.getElementById('email').value.trim(),
      profissao: document.getElementById('profissao').value.trim(),
      whatsapp: document.getElementById('whatsapp').value.trim(),
      timestamp: new Date().toISOString(),
      pagina: 'Imagem de Alto Valor'
    };

    // Validação básica
    if (!formData.nome || !formData.email || !formData.profissao || !formData.whatsapp) {
      showFeedback('Por favor, preencha todos os campos obrigatórios.', 'error');
      return;
    }

    // Validação de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      showFeedback('Por favor, insira um e-mail válido.', 'error');
      return;
    }

    try {
      // Aqui você conectaria com seu backend
      // Exemplo: await fetch('/api/leads', { method: 'POST', body: JSON.stringify(formData) })
      
      // Simulação de sucesso
      await new Promise(resolve => setTimeout(resolve, 1000));

      showFeedback('Dados enviados com sucesso! Você receberá todas as informações em breve.', 'success');
      
      // Redirecionar para WhatsApp após 2 segundos
      setTimeout(() => {
        const mensagem = encodeURIComponent(
          `Olá! Me chamo ${formData.nome} e acabei de me inscrever na Imersão de Imagem de Alto Valor. Gostaria de receber mais informações.`
        );
        window.open(`https://wa.me/5531999999999?text=${mensagem}`, '_blank');
        leadForm.reset();
        closeModal();
      }, 2000);

    } catch (error) {
      showFeedback('Erro ao enviar dados. Tente novamente.', 'error');
      console.error('Erro:', error);
    }
  });

  function showFeedback(message, type) {
    formFeedback.textContent = message;
    formFeedback.className = `form-feedback ${type}`;
    
    if (type === 'error') {
      setTimeout(() => {
        formFeedback.style.display = 'none';
      }, 5000);
    }
  }

  // ==================== FAQ ====================
  const faqQuestions = document.querySelectorAll('.faq-question');

  faqQuestions.forEach(question => {
    question.addEventListener('click', () => {
      const faqItem = question.closest('.faq-item');
      const answer = faqItem.querySelector('.faq-answer');
      const isExpanded = question.getAttribute('aria-expanded') === 'true';

      // Fechar todas as outras
      faqQuestions.forEach(q => {
        if (q !== question) {
          q.setAttribute('aria-expanded', 'false');
          q.closest('.faq-item').querySelector('.faq-answer').style.maxHeight = '0';
        }
      });

      // Toggle atual
      if (isExpanded) {
        question.setAttribute('aria-expanded', 'false');
        answer.style.maxHeight = '0';
      } else {
        question.setAttribute('aria-expanded', 'true');
        answer.style.maxHeight = answer.scrollHeight + 'px';
      }
    });
  });

  // ==================== GALERIA ====================
  const track = document.getElementById('galleryTrack');
  const prevBtn = document.getElementById('galleryPrev');
  const nextBtn = document.getElementById('galleryNext');

  if (track && prevBtn && nextBtn) {
    let currentIndex = 0;
    const items = track.querySelectorAll('.gallery-item');
    const totalItems = items.length;

    const updateGallery = () => {
      const itemWidth = items[0].offsetWidth;
      const gap = 16; // 1rem em pixels
      const offset = currentIndex * (itemWidth + gap);
      track.scrollTo({
        left: offset,
        behavior: 'smooth'
      });
    };

    prevBtn.addEventListener('click', () => {
      currentIndex = Math.max(0, currentIndex - 1);
      updateGallery();
    });

    nextBtn.addEventListener('click', () => {
      const maxIndex = totalItems - Math.floor(track.offsetWidth / items[0].offsetWidth);
      currentIndex = Math.min(maxIndex, currentIndex + 1);
      updateGallery();
    });

    // Autoplay opcional
    let autoplayInterval;
    const startAutoplay = () => {
      autoplayInterval = setInterval(() => {
        const maxIndex = totalItems - Math.floor(track.offsetWidth / items[0].offsetWidth);
        currentIndex = currentIndex >= maxIndex ? 0 : currentIndex + 1;
        updateGallery();
      }, 5000);
    };

    const stopAutoplay = () => {
      clearInterval(autoplayInterval);
    };

    // Iniciar autoplay
    startAutoplay();

    // Pausar ao interagir
    track.addEventListener('mouseenter', stopAutoplay);
    track.addEventListener('mouseleave', startAutoplay);
    prevBtn.addEventListener('click', stopAutoplay);
    nextBtn.addEventListener('click', stopAutoplay);
  }

  // ==================== SCROLL REVEAL ====================
  const revealElements = document.querySelectorAll('[data-reveal]');

  const revealOnScroll = () => {
    const windowHeight = window.innerHeight;
    
    revealElements.forEach(element => {
      const elementTop = element.getBoundingClientRect().top;
      const revealPoint = windowHeight * 0.85;
      
      if (elementTop < revealPoint) {
        element.classList.add('revealed');
      }
    });
  };

  // Executar na carga e no scroll
  window.addEventListener('scroll', revealOnScroll);
  window.addEventListener('load', revealOnScroll);
  revealOnScroll(); // Executar imediatamente

  // ==================== HEADER SCROLL ====================
  const header = document.querySelector('.site-header');
  let lastScroll = 0;

  window.addEventListener('scroll', () => {
    const currentScroll = window.pageYOffset;
    
    if (currentScroll > 100) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
    
    lastScroll = currentScroll;
  });

  // ==================== SMOOTH SCROLL ====================
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const href = this.getAttribute('href');
      
      if (href === '#' || href === '#topo') {
        e.preventDefault();
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }
      
      const target = document.querySelector(href);
      if (target) {
        e.preventDefault();
        const headerHeight = header.offsetHeight;
        const targetPosition = target.getBoundingClientRect().top + window.pageYOffset - headerHeight;
        
        window.scrollTo({
          top: targetPosition,
          behavior: 'smooth'
        });
      }
    });
  });

// GALLERY — autoplay (sem limitar imagem)
(function initGalleryAutoplay(){
  const track = document.getElementById("galleryTrack");
  const prevBtn = document.getElementById("galleryPrev");
  const nextBtn = document.getElementById("galleryNext");
  if (!track || !prevBtn || !nextBtn) return;

  const items = Array.from(track.querySelectorAll(".gallery-item"));
  if (!items.length) return;

  let index = 0;
  let timer = null;
  const INTERVAL = 3800;

  function getStep(){
    // largura real do slide (considera gap)
    const first = items[0];
    const gap = parseFloat(getComputedStyle(track).gap || "0");
    return first.getBoundingClientRect().width + gap;
  }

  function goTo(i){
    index = (i + items.length) % items.length;
    track.scrollTo({ left: getStep() * index, behavior: "smooth" });
  }

  function next(){ goTo(index + 1); }
  function prev(){ goTo(index - 1); }

  function start(){
    stop();
    timer = setInterval(() => next(), INTERVAL);
  }

  function stop(){
    if (timer) clearInterval(timer);
    timer = null;
  }

  // Botões
  nextBtn.addEventListener("click", () => { stop(); next(); start(); });
  prevBtn.addEventListener("click", () => { stop(); prev(); start(); });

  // Sincroniza index quando usuário arrasta manualmente
  let raf = null;
  track.addEventListener("scroll", () => {
    if (raf) cancelAnimationFrame(raf);
    raf = requestAnimationFrame(() => {
      const step = getStep();
      const current = Math.round(track.scrollLeft / step);
      index = Math.max(0, Math.min(items.length - 1, current));
    });
  }, { passive: true });

  // Pausa em interação (mobile + desktop)
  ["mouseenter","touchstart","pointerdown"].forEach(evt =>
    track.addEventListener(evt, stop, { passive: true })
  );
  ["mouseleave","touchend","pointerup"].forEach(evt =>
    track.addEventListener(evt, start, { passive: true })
  );

  // Recalcula em resize (mudou largura do slide)
  window.addEventListener("resize", () => goTo(index));

  // Start
  start();
})();


  // ==================== MÁSCARAS DE INPUT ====================
  const whatsappInput = document.getElementById('whatsapp');
  
  if (whatsappInput) {
    whatsappInput.addEventListener('input', (e) => {
      let value = e.target.value.replace(/\D/g, '');
      
      if (value.length > 0) {
        if (value.length <= 2) {
          value = `(${value}`;
        } else if (value.length <= 7) {
          value = `(${value.slice(0, 2)}) ${value.slice(2)}`;
        } else if (value.length <= 11) {
          value = `(${value.slice(0, 2)}) ${value.slice(2, 7)}-${value.slice(7)}`;
        } else {
          value = `(${value.slice(0, 2)}) ${value.slice(2, 7)}-${value.slice(7, 11)}`;
        }
      }
      
      e.target.value = value;
    });
  }

  // ==================== ANIMAÇÃO DO HERO ====================
  const heroContent = document.querySelector('.hero-content');
  if (heroContent) {
    setTimeout(() => {
      heroContent.style.opacity = '1';
      heroContent.style.transform = 'translateY(0)';
    }, 300);
  }

  // ==================== CONSOLE LOG ====================
  console.log('%c✦ Imagem de Alto Valor ✦', 'color: #D4AF37; font-size: 20px; font-weight: bold;');
  console.log('%cLanding Page carregada com sucesso!', 'color: #F5F1E8; font-size: 12px;');

})();
