# 🌟 Landing Page - Imagem de Alto Valor

Landing page premium para imersão de Personal Branding e Imagem Estratégica, com design inspirado em VOGUE e foco mobile-first.

#c1a46b
--color-black: #0A0A0A;
  --color-charcoal: #1A1A1A;
  --color-dark-brown: #2D2520;
  --color-brown: #4A3F35;
  --color-gold: #D4AF37;
  --color-gold-light: #E6C85C;
  --color-gold-dark: #B8941F;
  --color-cream: #F5F1E8;
  --color-white: #FFFFFF;

## 📋 Características

### Design Premium
- ✦ Cores: Preto, Dourado e Marrom
- ✦ Gradientes metálicos dourados
- ✦ Tipografia estilo VOGUE (Playfair Display + Montserrat)
- ✦ Layout mobile-first responsivo
- ✦ Animações suaves e elegantes

### Estrutura
1. **Hero Section** - Banner 2560x800px com foco em 1220px
2. **Metodologia** - 3 Pilares (Estética, Estratégia, Estrutura)
3. **Conteúdo** - 9 tópicos de aprendizado
4. **Galeria** - Carrossel de resultados
5. **Sobre** - Apresentação da expert
6. **FAQ** - 5 perguntas frequentes
7. **Modal** - Captura de leads
8. **Footer** - Informações e contato

## 🎨 Customização

### 1. Substituir Imagens

Crie a pasta `img/` e adicione:

```
img/
├── hero-banner.jpg       (2560x800px - foco central em 1220px)
├── expert-photo.jpg      (mín. 800x1000px - vertical)
├── resultado1.jpg        (1200x800px)
├── resultado2.jpg        (1200x800px)
├── resultado3.jpg        (1200x800px)
├── resultado4.jpg        (1200x800px)
└── resultado5.jpg        (1200x800px)
```

**Importante**: O banner hero tem 2560px de largura, mas o **foco visual deve estar nos 1220px centrais** para garantir que o conteúdo principal apareça em todas as telas.

### 2. Cores e Gradientes

Edite as variáveis CSS em `style.css`:

```css
:root {
  --color-gold: #D4AF37;        /* Dourado principal */
  --color-gold-light: #E6C85C;  /* Dourado claro */
  --color-gold-dark: #B8941F;   /* Dourado escuro */
  --color-brown: #4A3F35;       /* Marrom */
  --color-dark-brown: #2D2520;  /* Marrom escuro */
}
```

### 3. Textos e Conteúdo

#### Nome da Expert
Procure por "Dayane Martins" e substitua em:
- Seção Sobre (linha ~270 do HTML)
- Footer (linha ~440 do HTML)

#### Data da Imersão
Linha ~37 do HTML:
```html
<div class="hero-date">
  24 de Fevereiro · 14h às 18h
</div>
```

#### WhatsApp
Substitua `5531999999999` pelo número correto:
- Linha ~390 do HTML (botão flutuante)
- Linha ~180 do script.js (redirect após form)

#### Informações do Footer
Linha ~435 do HTML:
```html
<li>DAYANE MARTINS PERSONAL BRAND</li>
<li>CNPJ: 00.000.000/0001-00</li>
<li>(31) 9 9999-9999</li>
<li>contato@imagemdealtovalor.com</li>
```

### 4. Integração de Backend

No arquivo `script.js`, linha ~78:

```javascript
// Conecte com seu backend
const response = await fetch('/api/leads', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify(formData)
});

if (response.ok) {
  showFeedback('Dados enviados com sucesso!', 'success');
  // Redirect para WhatsApp ou página de confirmação
}
```

### 5. Pilares da Metodologia

Para alterar os 3 pilares (linha ~82 do HTML):

```html
<article class="pillar-card">
  <div class="pillar-number">1</div>
  <div class="pillar-content">
    <h3>Nome do Pilar</h3>
    <p>Descrição do pilar...</p>
    <ul class="pillar-list">
      <li>Tópico 1</li>
      <li>Tópico 2</li>
      <li>Tópico 3</li>
    </ul>
  </div>
</article>
```

## 📱 Responsividade

A página é **mobile-first** e totalmente responsiva:

- **Mobile** (< 640px): Layout vertical, 1 coluna
- **Tablet** (640px - 1024px): 2-3 colunas adaptativas
- **Desktop** (> 1024px): Layout completo otimizado

### Banner Hero Responsivo
O banner 2560x800px se ajusta automaticamente:
- Mobile: Foco no centro, crop lateral
- Desktop: Visualização completa com foco em 1220px central

## 🎯 Conversão

### Pontos de Conversão
1. Hero CTA principal
2. Fim da metodologia
3. Fim do conteúdo
4. Fim do FAQ
5. Botão flutuante WhatsApp
6. Modal de captura

### Otimizações de SEO
- Meta tags configuradas
- Alt text em imagens
- Headings hierárquicos (H1, H2, H3)
- ARIA labels para acessibilidade

## 🚀 Deploy

### Opção 1: Upload direto
Faça upload dos arquivos para seu servidor:
```
/
├── index.html
├── style.css
├── script.js
└── img/
    └── (todas as imagens)
```

### Opção 2: GitHub Pages
1. Crie repositório no GitHub
2. Faça upload dos arquivos
3. Ative GitHub Pages nas configurações

### Opção 3: Netlify/Vercel
1. Arraste a pasta para netlify.app ou vercel.com
2. Deploy instantâneo

## 📊 Analytics

Adicione antes do `</head>`:

```html
<!-- Google Analytics -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-XXXXXXXXXX');
</script>

<!-- Meta Pixel -->
<script>
  !function(f,b,e,v,n,t,s)
  {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
  n.callMethod.apply(n,arguments):n.queue.push(arguments)};
  if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
  n.queue=[];t=b.createElement(e);t.async=!0;
  t.src=v;s=b.getElementsByTagName(e)[0];
  s.parentNode.insertBefore(t,s)}(window, document,'script',
  'https://connect.facebook.net/en_US/fbevents.js');
  fbq('init', 'XXXXXXXXXX');
  fbq('track', 'PageView');
</script>
```

## ⚡ Performance

### Otimizações Aplicadas
- ✅ Lazy loading em imagens
- ✅ Preconnect para Google Fonts
- ✅ CSS minificado possível
- ✅ Scripts com defer
- ✅ Smooth scroll nativo

### Recomendações Adicionais
1. Comprima imagens (WebP, 80% qualidade)
2. Use CDN para assets estáticos
3. Minifique CSS/JS em produção
4. Implemente cache headers

## 🎨 Paleta de Cores Completa

```
Preto Principal:    #0A0A0A
Preto Secundário:   #1A1A1A
Marrom Escuro:      #2D2520
Marrom:             #4A3F35
Dourado:            #D4AF37
Dourado Claro:      #E6C85C
Dourado Escuro:     #B8941F
Creme:              #F5F1E8
Branco:             #FFFFFF
```

## 📝 Checklist Pré-Launch

- [ ] Todas as imagens substituídas
- [ ] Textos personalizados
- [ ] Número de WhatsApp atualizado
- [ ] E-mail de contato correto
- [ ] CNPJ e dados da empresa
- [ ] Data da imersão correta
- [ ] Backend/formulário integrado
- [ ] Analytics instalado
- [ ] Teste em mobile
- [ ] Teste em diferentes navegadores
- [ ] Velocidade < 3s (PageSpeed)

## 🆘 Suporte

Em caso de dúvidas sobre customização, consulte:
- Código comentado em `style.css`
- Seções organizadas em `index.html`
- Funções documentadas em `script.js`

---

**Desenvolvido para profissionais de alto padrão que valorizam estética, estratégia e resultados.** ✦
