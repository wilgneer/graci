// ============================================================
// IMAGEM DE ALTO VALOR - LANDING PAGE SCRIPT
// Interatividade + envio de leads para Google Apps Script
// ============================================================

(function() {
  'use strict';

  // ============================================================
  // COLE A URL DO WEB APP (APPS SCRIPT) AQUI:
  // precisa terminar com /exec
  // Ex: https://script.google.com/macros/s/AKfycbxxxx/exec
  // ============================================================
  const LEAD_ENDPOINT = "https://script.google.com/macros/s/AKfycbza2CedBjumNWaZQZrdpnmHT5DHuEm7P2MsTjeBXZgQSEvSKZFzpGbZO2oVhWHXl3Pr/exec";

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

  modalClose?.addEventListener('click', closeModal);

  modal?.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
  });

  // Fechar com ESC
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal?.classList.contains('active')) {
      closeModal();
    }
  });

  // ==================== FORMULÁRIO ====================
leadForm?.addEventListener('submit', (e) => {
  e.preventDefault();

  const formData = {
    nome: document.getElementById('nome')?.value?.trim() || "",
    email: document.getElementById('email')?.value?.trim() || "",
    profissao: document.getElementById('profissao')?.value?.trim() || "",
    whatsapp: document.getElementById('whatsapp')?.value?.trim() || "",
    timestamp: new Date().toISOString(),
    pagina: window.location.pathname
  };

  // Validação mínima
  if (!formData.nome || !formData.email || !formData.profissao || !formData.whatsapp) {
    showFeedback('Preencha todos os campos.', 'error');
    return;
  }

  // 🔥 ENVIO EM BACKGROUND (não bloqueia)
  try {
    const payload = JSON.stringify(formData);

    if (navigator.sendBeacon) {
      const blob = new Blob([payload], {
        type: "text/plain;charset=utf-8"
      });
      navigator.sendBeacon(LEAD_ENDPOINT, blob);
    } else {
      fetch(LEAD_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: payload,
        keepalive: true
      }).catch(() => {});
    }
  } catch (err) {
    console.warn("Falha ao disparar envio:", err);
  }

  // 🚀 REDIRECIONA IMEDIATO
  window.location.href = "obrigado.html";
});

  // ==================== FAQ ====================
  const faqQuestions = document.querySelectorAll('.faq-question');

  faqQuestions.forEach(question => {
    question.addEventListener('click', () => {
      const faqItem = question.closest('.faq-item');
      const answer = faqItem?.querySelector('.faq-answer');
      const isExpanded = question.getAttribute('aria-expanded') === 'true';

      // Fechar todas as outras
      faqQuestions.forEach(q => {
        if (q !== question) {
          q.setAttribute('aria-expanded', 'false');
          const other = q.closest('.faq-item')?.querySelector('.faq-answer');
          if (other) other.style.maxHeight = '0';
        }
      });

      // Toggle atual
      if (!answer) return;
      if (isExpanded) {
        question.setAttribute('aria-expanded', 'false');
        answer.style.maxHeight = '0';
      } else {
        question.setAttribute('aria-expanded', 'true');
        answer.style.maxHeight = answer.scrollHeight + 'px';
      }
    });
  });

  // ==================== GALERIA (se existir) ====================
  const track = document.getElementById('galleryTrack');
  const prevBtn = document.getElementById('galleryPrev');
  const nextBtn = document.getElementById('galleryNext');

  if (track && prevBtn && nextBtn) {
    let currentIndex = 0;
    const items = track.querySelectorAll('.gallery-item');
    const totalItems = items.length;

    const updateGallery = () => {
      if (!items.length) return;
      const itemWidth = items[0].offsetWidth;
      const gap = 16;
      const offset = currentIndex * (itemWidth + gap);
      track.scrollTo({ left: offset, behavior: 'smooth' });
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
  }

  // ==================== SCROLL REVEAL ====================
  const revealElements = document.querySelectorAll('[data-reveal]');

  const revealOnScroll = () => {
    const windowHeight = window.innerHeight;
    revealElements.forEach(element => {
      const elementTop = element.getBoundingClientRect().top;
      const revealPoint = windowHeight * 0.85;
      if (elementTop < revealPoint) element.classList.add('revealed');
    });
  };

  window.addEventListener('scroll', revealOnScroll);
  window.addEventListener('load', revealOnScroll);
  revealOnScroll();

  // ==================== HEADER SCROLL ====================
  const header = document.querySelector('.site-header');
  window.addEventListener('scroll', () => {
    const currentScroll = window.pageYOffset;
    if (!header) return;
    if (currentScroll > 100) header.classList.add('scrolled');
    else header.classList.remove('scrolled');
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
        const headerHeight = header ? header.offsetHeight : 0;
        const targetPosition = target.getBoundingClientRect().top + window.pageYOffset - headerHeight;
        window.scrollTo({ top: targetPosition, behavior: 'smooth' });
      }
    });
  });

  // ==================== MÁSCARAS DE INPUT ====================
  const whatsappInput = document.getElementById('whatsapp');
  if (whatsappInput) {
    whatsappInput.addEventListener('input', (e) => {
      let value = e.target.value.replace(/\D/g, '');
      if (value.length > 0) {
        if (value.length <= 2) value = `(${value}`;
        else if (value.length <= 7) value = `(${value.slice(0, 2)}) ${value.slice(2)}`;
        else if (value.length <= 11) value = `(${value.slice(0, 2)}) ${value.slice(2, 7)}-${value.slice(7)}`;
        else value = `(${value.slice(0, 2)}) ${value.slice(2, 7)}-${value.slice(7, 11)}`;
      }
      e.target.value = value;
    });
  }

  console.log('%cLanding Page carregada!', 'color: #D4AF37; font-size: 12px;');

})();
