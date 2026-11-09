// ============================================================
// PAINEL DE TEXTOS — MAISON ALTO VALOR
//
// Sem banco de dados: os textos alterados ficam em content.json,
// dentro do próprio repositório do GitHub. Este painel:
//   1. lê o index.html para descobrir quais textos existem (data-cms)
//   2. lê o content.json atual direto da API do GitHub
//   3. mostra um formulário por seção
//   4. ao publicar, grava o content.json no repositório (commit)
//      -> o GitHub Pages republica o site em ~1-2 minutos.
//
// "Login" = chave (token) do GitHub com permissão de escrita só neste repo.
// ============================================================
(function () {
  'use strict';

  var OWNER = 'wilgneer';
  var REPO = 'graci';
  var BRANCH = 'main';
  var FILE = 'content.json';
  var API = 'https://api.github.com/repos/' + OWNER + '/' + REPO + '/contents/' + FILE;
  var TOKEN_KEY = 'maison_admin_token';

  var CMS = window.MaisonCMS;

  var $ = function (id) { return document.getElementById(id); };
  var ui = {
    login: $('login'), loginForm: $('loginForm'), tokenInput: $('tokenInput'),
    remember: $('rememberToken'), btnLogin: $('btnLogin'), loginMsg: $('loginMsg'),
    editor: $('editor'), groups: $('groups'), search: $('search'), noResults: $('noResults'),
    btnDownload: $('btnDownload'), btnLogout: $('btnLogout'), barActions: $('barActions'),
    saveBar: $('saveBar'), dirtyInfo: $('dirtyInfo'), btnPublish: $('btnPublish'), toast: $('toast')
  };

  var state = {
    token: null,
    sha: null,
    fields: [],       // {key,label,group,accent,def,value,wrap,input,badge,reset}
    baseline: '{}'    // JSON do que está publicado (para saber se há alterações)
  };

  // ---------- armazenamento do token ----------
  function readToken() {
    try { return sessionStorage.getItem(TOKEN_KEY) || localStorage.getItem(TOKEN_KEY) || ''; }
    catch (e) { return ''; }
  }
  function saveToken(token, remember) {
    try {
      sessionStorage.setItem(TOKEN_KEY, token);
      if (remember) localStorage.setItem(TOKEN_KEY, token);
      else localStorage.removeItem(TOKEN_KEY);
    } catch (e) { /* navegador bloqueou o storage: segue só na memória */ }
  }
  function clearToken() {
    try { sessionStorage.removeItem(TOKEN_KEY); localStorage.removeItem(TOKEN_KEY); } catch (e) { /* ok */ }
  }

  // ---------- utilidades ----------
  var toastTimer;
  function toast(msg, kind) {
    ui.toast.textContent = msg;
    ui.toast.className = 'toast show ' + (kind || '');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { ui.toast.className = 'toast'; }, kind === 'error' ? 7000 : 4500);
  }

  function utf8ToB64(str) {
    var bytes = new TextEncoder().encode(str);
    var bin = '';
    bytes.forEach(function (b) { bin += String.fromCharCode(b); });
    return btoa(bin);
  }
  function b64ToUtf8(b64) {
    var bin = atob(b64.replace(/\s/g, ''));
    var bytes = new Uint8Array(bin.length);
    for (var i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
    return new TextDecoder().decode(bytes);
  }

  function ghHeaders(token, json) {
    var h = {
      Authorization: 'Bearer ' + token,
      Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28'
    };
    if (json) h['Content-Type'] = 'application/json';
    return h;
  }

  function httpError(status, fallback) {
    if (status === 401) return 'Chave de acesso inválida ou expirada.';
    if (status === 403) return 'A chave não tem permissão neste repositório (precisa de "Contents: Read and write").';
    if (status === 404) return 'Não encontrei o arquivo ' + FILE + ' no repositório ' + OWNER + '/' + REPO + '. Confira se a chave foi criada para este repositório.';
    if (status === 409 || status === 422) return 'O arquivo mudou enquanto você editava. Atualize a página e tente de novo.';
    return fallback + ' (erro ' + status + ').';
  }

  // ---------- GitHub: ler e gravar o content.json ----------
  function fetchRemote(token) {
    return fetch(API + '?ref=' + encodeURIComponent(BRANCH), { headers: ghHeaders(token), cache: 'no-store' })
      .then(function (r) {
        if (!r.ok) throw new Error(httpError(r.status, 'Não consegui ler o conteúdo atual'));
        return r.json();
      })
      .then(function (meta) {
        var data = {};
        try { data = JSON.parse(b64ToUtf8(meta.content)); } catch (e) { data = {}; }
        var content = (data && typeof data.content === 'object' && data.content) || {};
        return { sha: meta.sha, content: content };
      });
  }

  function putRemote(token, sha, jsonText) {
    return fetch(API, {
      method: 'PUT',
      headers: ghHeaders(token, true),
      body: JSON.stringify({
        message: 'Painel: atualiza textos da página',
        content: utf8ToB64(jsonText),
        sha: sha,
        branch: BRANCH
      })
    }).then(function (r) {
      if (!r.ok) throw new Error(httpError(r.status, 'Não consegui salvar'));
      return r.json();
    });
  }

  // ---------- estrutura: lê o index.html ----------
  function loadStructure() {
    return fetch('index.html', { cache: 'no-cache' })
      .then(function (r) {
        if (!r.ok) throw new Error('Não consegui abrir o index.html (erro ' + r.status + ').');
        return r.text();
      })
      .then(function (html) {
        var doc = new DOMParser().parseFromString(html, 'text/html');
        var seen = {};
        var list = [];
        doc.querySelectorAll('[data-cms]').forEach(function (el) {
          var key = el.getAttribute('data-cms');
          if (seen[key]) { console.warn('[painel] chave repetida:', key); return; }
          seen[key] = true;
          var groupEl = el.closest('[data-cms-group]');
          list.push({
            key: key,
            label: el.getAttribute('data-cms-label') || key,
            group: groupEl ? groupEl.getAttribute('data-cms-group') : 'Outros',
            accent: el.getAttribute('data-cms-accent') || '',
            def: CMS.readDefault(el)
          });
        });
        return list;
      });
  }

  // ---------- estado -> JSON ----------
  function normalize(v) { return v.replace(/\r\n/g, '\n').trim(); }

  function computeOverrides() {
    var out = {};
    state.fields.forEach(function (f) {
      var v = normalize(f.value);
      if (v !== '' && v !== f.def) out[f.key] = v;
    });
    return out;
  }

  function buildJson(overrides) {
    return JSON.stringify({ updatedAt: new Date().toISOString(), content: overrides }, null, 2) + '\n';
  }

  function changedCount() {
    var now = computeOverrides();
    var base = JSON.parse(state.baseline);
    var n = 0;
    state.fields.forEach(function (f) { if (now[f.key] !== base[f.key]) n++; });
    return n;
  }

  function refreshDirty() {
    var n = changedCount();
    ui.btnPublish.disabled = n === 0;
    ui.dirtyInfo.textContent = n === 0 ? 'Nenhuma alteração' : n + (n === 1 ? ' alteração não publicada' : ' alterações não publicadas');
    ui.dirtyInfo.className = n === 0 ? '' : 'has-changes';
  }

  // ---------- interface do editor ----------
  function autoGrow(ta) {
    ta.style.height = 'auto';
    ta.style.height = ta.scrollHeight + 2 + 'px';
  }

  function updateFieldState(f) {
    var modified = normalize(f.value) !== '' && normalize(f.value) !== f.def;
    f.wrap.classList.toggle('changed', modified);
    f.badge.hidden = !modified;
    f.reset.hidden = !modified;
  }

  function buildField(f, idx) {
    var id = 'f' + idx;
    // texto que não cabe numa linha do celular vira caixa de várias linhas
    var multi = f.def.length > 32 || f.value.length > 32 || f.def.indexOf('\n') !== -1 || f.value.indexOf('\n') !== -1;

    var wrap = document.createElement('div');
    wrap.className = 'field';

    var head = document.createElement('div');
    head.className = 'field-head';
    var label = document.createElement('label');
    label.htmlFor = id;
    label.textContent = f.label;
    var badge = document.createElement('span');
    badge.className = 'badge';
    badge.textContent = 'alterado';
    badge.hidden = true;
    head.appendChild(label);
    head.appendChild(badge);

    var input = document.createElement(multi ? 'textarea' : 'input');
    input.id = id;
    if (!multi) input.type = 'text';
    input.value = f.value;
    input.setAttribute('autocomplete', 'off');
    input.setAttribute('spellcheck', 'true');

    var reset = document.createElement('button');
    reset.type = 'button';
    reset.className = 'reset';
    reset.textContent = 'Voltar ao texto original';
    reset.hidden = true;

    wrap.appendChild(head);
    wrap.appendChild(input);

    if (f.accent) {
      var hint = document.createElement('p');
      hint.className = 'hint';
      hint.textContent = 'Palavras entre *asteriscos* ficam douradas.';
      wrap.appendChild(hint);
    }
    wrap.appendChild(reset);

    input.addEventListener('input', function () {
      f.value = input.value;
      if (multi) autoGrow(input);
      updateFieldState(f);
      refreshDirty();
    });
    reset.addEventListener('click', function () {
      f.value = f.def;
      input.value = f.def;
      if (multi) autoGrow(input);
      updateFieldState(f);
      refreshDirty();
    });

    f.wrap = wrap; f.input = input; f.badge = badge; f.reset = reset; f.multi = multi;
    return wrap;
  }

  function renderEditor() {
    ui.groups.textContent = '';
    var order = [];
    var byGroup = {};
    state.fields.forEach(function (f, i) {
      if (!byGroup[f.group]) { byGroup[f.group] = []; order.push(f.group); }
      byGroup[f.group].push({ f: f, i: i });
    });

    order.forEach(function (g, gi) {
      var det = document.createElement('details');
      det.className = 'group';
      if (gi === 0) det.open = true;

      var sum = document.createElement('summary');
      var title = document.createElement('span');
      title.textContent = g;
      sum.appendChild(title);
      det.appendChild(sum);

      var box = document.createElement('div');
      box.className = 'fields';
      byGroup[g].forEach(function (item) { box.appendChild(buildField(item.f, item.i)); });
      det.appendChild(box);
      ui.groups.appendChild(det);
    });

    // ajusta altura dos textareas depois de visíveis e marca os já alterados
    state.fields.forEach(updateFieldState);
    document.querySelectorAll('.group').forEach(function (d) {
      d.addEventListener('toggle', function () {
        if (d.open) d.querySelectorAll('textarea').forEach(autoGrow);
      });
    });
    refreshDirty();
  }

  function applySearch() {
    var q = ui.search.value.trim().toLowerCase();
    var total = 0;
    document.querySelectorAll('.group').forEach(function (d) {
      var any = false;
      d.querySelectorAll('.field').forEach(function (w) { w.classList.remove('is-hidden'); });
      if (q) {
        var groupName = d.querySelector('summary span').textContent.toLowerCase();
        var groupHit = groupName.indexOf(q) !== -1; // buscar o nome da seção mostra a seção toda
        state.fields.forEach(function (f) {
          if (!d.contains(f.wrap)) return;
          var hay = (f.label + ' ' + f.def + ' ' + f.value).toLowerCase();
          var hit = groupHit || hay.indexOf(q) !== -1;
          f.wrap.classList.toggle('is-hidden', !hit);
          if (hit) { any = true; total++; }
        });
        d.hidden = !any;
        if (any) d.open = true;
      } else {
        d.hidden = false;
        any = true;
      }
      if (any && q) d.querySelectorAll('textarea').forEach(autoGrow);
    });
    ui.noResults.hidden = !q || total > 0;
  }

  // ---------- fluxo: entrar ----------
  function showEditor(on) {
    ui.login.hidden = on;
    ui.editor.hidden = !on;
    ui.saveBar.hidden = !on;
    ui.barActions.hidden = !on;
  }

  function loginMsg(msg) {
    ui.loginMsg.hidden = !msg;
    ui.loginMsg.textContent = msg || '';
  }

  function start(token, remember) {
    loginMsg('');
    ui.btnLogin.disabled = true;
    ui.btnLogin.textContent = 'Entrando...';

    return Promise.all([fetchRemote(token), loadStructure()])
      .then(function (res) {
        var remote = res[0];
        state.token = token;
        state.sha = remote.sha;
        state.fields = res[1].map(function (f) {
          var o = remote.content[f.key];
          f.value = typeof o === 'string' ? o : f.def;
          return f;
        });
        state.baseline = JSON.stringify(computeOverrides());
        saveToken(token, remember);
        renderEditor();
        showEditor(true);
        // só dá para medir a altura dos textos depois que o editor está visível
        document.querySelectorAll('.group[open] textarea').forEach(autoGrow);
        window.scrollTo(0, 0);
      })
      .catch(function (err) {
        clearToken();
        showEditor(false);
        var msg = err && err.message ? err.message : 'Não consegui entrar.';
        if (err instanceof TypeError) msg = 'Sem conexão com o GitHub. Verifique a internet e tente de novo.';
        loginMsg(msg);
      })
      .then(function () {
        ui.btnLogin.disabled = false;
        ui.btnLogin.textContent = 'Entrar';
      });
  }

  // ---------- fluxo: publicar ----------
  function publish() {
    if (changedCount() === 0) return;
    ui.btnPublish.disabled = true;
    ui.btnPublish.textContent = 'Publicando...';

    var overrides = computeOverrides();
    // pega o sha mais recente para não dar conflito
    fetchRemote(state.token)
      .then(function (remote) { return putRemote(state.token, remote.sha, buildJson(overrides)); })
      .then(function (res) {
        state.sha = res && res.content ? res.content.sha : state.sha;
        state.baseline = JSON.stringify(overrides);
        refreshDirty();
        toast('Publicado! O site mostra as mudanças em 1 a 2 minutos.', 'ok');
      })
      .catch(function (err) {
        var msg = err && err.message ? err.message : 'Não consegui publicar.';
        if (err instanceof TypeError) msg = 'Sem conexão com o GitHub. Suas alterações continuam aqui; tente de novo.';
        toast(msg, 'error');
        refreshDirty();
      })
      .then(function () { ui.btnPublish.textContent = 'Publicar no site'; });
  }

  function downloadBackup() {
    var blob = new Blob([buildJson(computeOverrides())], { type: 'application/json' });
    var a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'content.json';
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(function () { URL.revokeObjectURL(a.href); }, 1000);
  }

  // ---------- eventos ----------
  ui.loginForm.addEventListener('submit', function (e) {
    e.preventDefault();
    var token = ui.tokenInput.value.trim();
    if (!token) { loginMsg('Cole a chave de acesso.'); return; }
    start(token, ui.remember.checked);
  });

  ui.btnPublish.addEventListener('click', publish);
  ui.btnDownload.addEventListener('click', downloadBackup);
  ui.search.addEventListener('input', applySearch);

  ui.btnLogout.addEventListener('click', function () {
    if (changedCount() > 0 && !confirm('Existem alterações não publicadas. Sair mesmo assim?')) return;
    clearToken();
    try { sessionStorage.removeItem('maison-admin-unlocked'); } catch (e) { /* ok */ }
    state.token = null;
    ui.tokenInput.value = '';
    location.reload();
  });

  window.addEventListener('beforeunload', function (e) {
    if (state.token && changedCount() > 0) { e.preventDefault(); e.returnValue = ''; }
  });

  // ---------- início ----------
  var saved = readToken();
  if (saved) {
    ui.remember.checked = !!(function () { try { return localStorage.getItem(TOKEN_KEY); } catch (e) { return ''; } })();
    start(saved, ui.remember.checked);
  }
})();
