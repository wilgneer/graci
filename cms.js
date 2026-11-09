// ============================================================
// MAISON ALTO VALOR — CMS leve (sem banco de dados)
//
// Como funciona:
//  - Cada texto editável do index.html tem o atributo data-cms="chave".
//  - O texto original fica no próprio HTML (funciona mesmo sem JS/sem o JSON).
//  - Os textos alterados no /admin.html ficam salvos em content.json.
//  - Esta página lê o content.json e troca só as chaves que foram alteradas.
//
// Sintaxe simples nos textos:
//    **texto**  -> negrito
//    *texto*    -> destaque dourado (só nos campos que têm esse estilo)
//    Enter      -> quebra de linha
//
// Este arquivo também é usado pelo admin.html (que define
// window.__CMS_NO_AUTO__ = true antes de carregar, para não se auto-aplicar).
// ============================================================
(function () {
  'use strict';

  var ACCENT_OPEN = {
    accent: '<span class="accent">',
    span: '<span>',
    em: '<em>'
  };
  var ACCENT_CLOSE = {
    accent: '</span>',
    span: '</span>',
    em: '</em>'
  };

  function escapeHtml(s) {
    return String(s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  // Texto digitado no admin -> HTML seguro (tudo é escapado; só geramos tags fixas)
  function markupToHtml(value, accentType) {
    var html = escapeHtml(value);
    html = html.replace(/\*\*([\s\S]+?)\*\*/g, '<strong>$1</strong>');
    if (accentType && ACCENT_OPEN[accentType]) {
      html = html.replace(/\*([\s\S]+?)\*/g, ACCENT_OPEN[accentType] + '$1' + ACCENT_CLOSE[accentType]);
    }
    return html.replace(/\r?\n/g, '<br>');
  }

  // Elemento do HTML original -> texto no formato simples (para o admin mostrar)
  function htmlToMarkup(el, accentType) {
    function walk(node) {
      var out = '';
      node.childNodes.forEach(function (c) {
        if (c.nodeType === 3) {
          out += c.nodeValue.replace(/\s+/g, ' ');
        } else if (c.nodeType === 1) {
          var tag = c.tagName;
          if (tag === 'BR') out += '\n';
          else if (tag === 'STRONG' || tag === 'B') out += '**' + walk(c) + '**';
          else if (accentType && (tag === 'SPAN' || tag === 'EM' || tag === 'I')) out += '*' + walk(c) + '*';
          else out += walk(c);
        }
      });
      return out;
    }
    return walk(el)
      .replace(/ *\n */g, '\n')
      .replace(/ {2,}/g, ' ')
      .trim();
  }

  // Valor original de um elemento marcado com data-cms
  function readDefault(el) {
    var attr = el.getAttribute('data-cms-attr');
    if (attr) return (el.getAttribute(attr) || '').trim();
    if (el.tagName === 'TITLE') return el.textContent.trim();
    return htmlToMarkup(el, el.getAttribute('data-cms-accent'));
  }

  // Aplica um valor em um elemento
  function applyValue(el, value) {
    if (typeof value !== 'string') return;
    var attr = el.getAttribute('data-cms-attr');
    if (attr) {
      el.setAttribute(attr, value);
    } else if (el.tagName === 'TITLE') {
      el.textContent = value;
    } else {
      el.innerHTML = markupToHtml(value, el.getAttribute('data-cms-accent'));
    }
  }

  function applyContent(root, content) {
    var els = root.querySelectorAll('[data-cms]');
    els.forEach(function (el) {
      var key = el.getAttribute('data-cms');
      if (Object.prototype.hasOwnProperty.call(content, key)) applyValue(el, content[key]);
    });
  }

  window.MaisonCMS = {
    markupToHtml: markupToHtml,
    htmlToMarkup: htmlToMarkup,
    readDefault: readDefault,
    applyContent: applyContent
  };

  if (window.__CMS_NO_AUTO__) return;

  function done() {
    document.documentElement.classList.remove('cms-loading');
  }

  fetch('content.json', { cache: 'no-cache' })
    .then(function (r) { return r.ok ? r.json() : null; })
    .then(function (data) {
      if (data && data.content && typeof data.content === 'object') {
        applyContent(document, data.content);
      }
    })
    .catch(function () { /* sem JSON? mantém os textos originais do HTML */ })
    .then(done);
})();
