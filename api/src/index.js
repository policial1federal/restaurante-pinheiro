// API do Restaurante Pinheiro (Cloudflare Worker + D1)
//
// GET  /config     -> configuração do site (público: o site lê ao abrir)
// GET  /verificar  -> confere a senha do admin (Authorization: Bearer <senha>)
// PUT  /config     -> grava a configuração (só com a senha do admin)
//
// A senha fica no segredo ADMIN_SENHA da Cloudflare, nunca no código:
//   npx wrangler secret put ADMIN_SENHA

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, PUT, OPTIONS',
  'Access-Control-Allow-Headers': 'Authorization, Content-Type',
  'Access-Control-Max-Age': '86400',
};

// Partes que a configuração precisa ter para o site funcionar
const CHAVES_OBRIGATORIAS = ['contato', 'horario', 'cardapio', 'acompanhamentos', 'especiais', 'verduras', 'montador'];
const TAMANHO_MAXIMO = 200 * 1024; // 200 KB

const json = (dados, status = 200) =>
  new Response(JSON.stringify(dados), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store', ...CORS },
  });

// Compara a senha enviada com a guardada sem revelar nada pelo tempo de resposta
async function senhaCorreta(request, env) {
  const auth = request.headers.get('Authorization') || '';
  const enviada = auth.startsWith('Bearer ') ? auth.slice(7) : '';
  if (!enviada || !env.ADMIN_SENHA) return false;
  const enc = new TextEncoder();
  const [a, b] = await Promise.all([
    crypto.subtle.digest('SHA-256', enc.encode(enviada)),
    crypto.subtle.digest('SHA-256', enc.encode(env.ADMIN_SENHA)),
  ]);
  return crypto.subtle.timingSafeEqual(a, b);
}

async function exigirAdmin(request, env) {
  if (!env.ADMIN_SENHA) return json({ erro: 'A senha do admin ainda não foi configurada.' }, 503);
  if (!(await senhaCorreta(request, env))) return json({ erro: 'Senha incorreta.' }, 401);
  return null;
}

export default {
  async fetch(request, env) {
    const { pathname } = new URL(request.url);

    if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: CORS });

    if (pathname === '/config' && request.method === 'GET') {
      const linha = await env.DB.prepare('SELECT dados FROM configuracao WHERE id = ?').bind('site').first();
      if (!linha) return json({ erro: 'Configuração não encontrada.' }, 404);
      return new Response(linha.dados, {
        headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store', ...CORS },
      });
    }

    if (pathname === '/verificar' && request.method === 'GET') {
      return (await exigirAdmin(request, env)) || json({ ok: true });
    }

    if (pathname === '/config' && request.method === 'PUT') {
      const bloqueio = await exigirAdmin(request, env);
      if (bloqueio) return bloqueio;

      const texto = await request.text();
      if (texto.length > TAMANHO_MAXIMO) return json({ erro: 'Configuração grande demais.' }, 413);

      let dados;
      try { dados = JSON.parse(texto); } catch { return json({ erro: 'Os dados enviados não são um JSON válido.' }, 400); }
      if (!dados || typeof dados !== 'object' || Array.isArray(dados)) return json({ erro: 'Formato inválido.' }, 400);
      const faltando = CHAVES_OBRIGATORIAS.filter((k) => !(k in dados));
      if (faltando.length) return json({ erro: 'Faltam dados: ' + faltando.join(', ') }, 400);

      await env.DB.prepare(
        "INSERT INTO configuracao (id, dados, atualizado_em) VALUES ('site', ?, datetime('now')) " +
        'ON CONFLICT(id) DO UPDATE SET dados = excluded.dados, atualizado_em = excluded.atualizado_em'
      ).bind(JSON.stringify(dados)).run();
      return json({ ok: true });
    }

    return json({ erro: 'Não encontrado.' }, 404);
  },
};
