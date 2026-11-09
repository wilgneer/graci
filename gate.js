/* Porta de senha do painel. Só libera o painel (cms.js + admin.js) depois da senha.
   A senha NÃO fica no código: só o hash (PBKDF2). Para trocar a senha, veja ADMIN.md. */
(function () {
  'use strict';
  var SALT = '290621cfce71e0a5ca0f976ef59c7fd6';
  var ITER = 250000;
  var HASH = 'cd20e6424d8a1350b02ddd3b635d63f5a6f81c9447a51fe0400add87208971c0';
  var KEY = 'maison-admin-unlocked';

  var gate = document.getElementById('gate');
  var form = document.getElementById('gateForm');
  var input = document.getElementById('gateInput');
  var msg = document.getElementById('gateMsg');
  var btn = document.getElementById('gateBtn');

  function hex(buf) {
    return Array.prototype.map.call(new Uint8Array(buf), function (b) { return ('0' + b.toString(16)).slice(-2); }).join('');
  }
  function fromHex(h) {
    var a = new Uint8Array(h.length / 2);
    for (var i = 0; i < a.length; i++) a[i] = parseInt(h.substr(i * 2, 2), 16);
    return a;
  }
  function derive(pw) {
    var enc = new TextEncoder();
    return crypto.subtle.importKey('raw', enc.encode(pw), 'PBKDF2', false, ['deriveBits']).then(function (k) {
      return crypto.subtle.deriveBits({ name: 'PBKDF2', salt: fromHex(SALT), iterations: ITER, hash: 'SHA-256' }, k, 256);
    }).then(hex);
  }
  function load(src) {
    return new Promise(function (ok, fail) {
      var s = document.createElement('script');
      s.src = src; s.onload = ok; s.onerror = fail;
      document.body.appendChild(s);
    });
  }
  function unlock() {
    gate.hidden = true;
    document.getElementById('login').hidden = false;
    window.__CMS_NO_AUTO__ = true;
    load('cms.js').then(function () { return load('admin.js'); });
  }

  // Se existir vault.json, a chave do GitHub vem de lá, cifrada com a própria senha.
  // Assim a Graci digita só a senha. Sem vault.json, o painel pede a chave (modo antigo).
  function openVault(pw) {
    return fetch('vault.json', { cache: 'no-cache' }).then(function (r) {
      if (!r.ok) return null;
      return r.json();
    }).then(function (v) {
      if (!v || !v.salt || !v.iv || !v.data) return null;
      var enc = new TextEncoder();
      return crypto.subtle.importKey('raw', enc.encode(pw), 'PBKDF2', false, ['deriveKey']).then(function (k) {
        return crypto.subtle.deriveKey({ name: 'PBKDF2', salt: fromHex(v.salt), iterations: v.iter || ITER, hash: 'SHA-256' },
          k, { name: 'AES-GCM', length: 256 }, false, ['decrypt']);
      }).then(function (key) {
        var raw = Uint8Array.from(atob(v.data), function (c) { return c.charCodeAt(0); });
        return crypto.subtle.decrypt({ name: 'AES-GCM', iv: fromHex(v.iv) }, key, raw);
      }).then(function (buf) {
        try { sessionStorage.setItem('maison_admin_token', new TextDecoder().decode(buf)); } catch (e) { /* ok */ }
      });
    }).catch(function () { /* sem vault ou falhou: cai no pedido da chave */ });
  }

  try { if (sessionStorage.getItem(KEY) === HASH) { unlock(); return; } } catch (e) { /* ok */ }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    btn.disabled = true; msg.hidden = true;
    derive(input.value).then(function (h) {
      if (h === HASH) {
        try { sessionStorage.setItem(KEY, HASH); } catch (e2) { /* ok */ }
        var pw = input.value;
        input.value = '';
        return openVault(pw).then(unlock);
      } else {
        msg.textContent = 'Senha incorreta.';
        msg.hidden = false; btn.disabled = false; input.select();
      }
    }).catch(function () {
      msg.textContent = 'Não foi possível verificar a senha neste navegador.';
      msg.hidden = false; btn.disabled = false;
    });
  });
})();
