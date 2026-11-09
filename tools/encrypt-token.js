// Cifra a chave do GitHub com a senha do painel e grava vault.json.
// Uso (PowerShell):  $env:PAINEL_SENHA='...'; $env:GH_TOKEN='github_pat_...'; node tools/encrypt-token.js
// A chave deve ser fine-grained, só do repo "graci", Contents: Read and write.
const c = require('crypto'), fs = require('fs'), path = require('path');
const pw = process.env.PAINEL_SENHA, tok = process.env.GH_TOKEN;
if (!pw || !tok) { console.error('Defina PAINEL_SENHA e GH_TOKEN.'); process.exit(1); }
const iter = 250000, salt = c.randomBytes(16), iv = c.randomBytes(12);
const key = c.pbkdf2Sync(pw, salt, iter, 32, 'sha256');
const ci = c.createCipheriv('aes-256-gcm', key, iv);
const ct = Buffer.concat([ci.update(tok, 'utf8'), ci.final(), ci.getAuthTag()]);
fs.writeFileSync(path.join(__dirname, '..', 'vault.json'),
  JSON.stringify({ iter, salt: salt.toString('hex'), iv: iv.toString('hex'), data: ct.toString('base64') }));
console.log('vault.json gerado.');
