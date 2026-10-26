// API pública do TVMaze
const API = "https://api.tvmaze.com";

const $ = (id) => document.getElementById(id);
const el = { q: $("q"), grid: $("grid"), state: $("state"), title: $("title"), modal: $("modal"), chips: $("chips") };
const SUGESTOES = ["Breaking Bad", "Dark", "The Bear", "Severance", "Succession", "Stranger Things", "Round 6", "The Last of Us"];

let timer;
let reqId = 0;

/* ---------- Utilidades ---------- */
const esc = (s = "") => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const yearOf = (s) => (s.premiered || "").slice(0, 4) || "—";
const fmtDate = (d) => d ? new Date(d + "T12:00:00").toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" }) : "Data não informada";
const fmtScore = (n) => n ? n.toFixed(1).replace(".", ",") : "—";
const scoreClass = (n) => n >= 7 ? "good" : n >= 5 ? "mid" : "bad";
const STATUS = { "Running": "Em exibição", "Ended": "Encerrada", "To Be Determined": "A definir", "In Development": "Em desenvolvimento" };
const country = (c) => { try { return c && c.code ? new Intl.DisplayNames(["pt-BR"], { type: "region" }).of(c.code) : ""; } catch (e) { return c ? c.name : ""; } };
const plain = (html) => new DOMParser().parseFromString(html || "", "text/html").body.textContent.trim();

function setState(html) {
  el.state.hidden = !html;
  el.state.innerHTML = html || "";
}

/* ---------- Lista ---------- */
function renderGrid(shows) {
  el.grid.innerHTML = shows.map((s) => `
    <button class="card" data-id="${s.id}">
      <div class="poster">
        ${s.image ? `<img loading="lazy" src="${esc(s.image.medium.replace("http:", "https:"))}" alt="Pôster de ${esc(s.name)}">` : `<div class="none">${esc(s.name)}</div>`}
        ${s.rating && s.rating.average ? `<span class="badge">★ ${fmtScore(s.rating.average)}</span>` : ""}
      </div>
      <h3>${esc(s.name)}</h3>
      <small>${yearOf(s)}</small>
    </button>`).join("");
}

async function search() {
  const query = el.q.value.trim();
  const id = ++reqId;
  if (!query) {
    el.grid.innerHTML = "";
    el.title.hidden = true;
    setState("<strong>Comece digitando um título.</strong> Ou toque em uma das sugestões acima.");
    return;
  }
  setState("Buscando…");
  try {
    const res = await fetch(`${API}/search/shows?q=${encodeURIComponent(query)}`);
    if (!res.ok) throw new Error();
    const data = await res.json();
    if (id !== reqId) return; // resposta antiga, ignora
    const shows = data.map((d) => d.show);
    el.title.hidden = false;
    el.title.textContent = `Resultados para “${query}”`;
    renderGrid(shows);
    setState(shows.length ? "" : "<strong>Nada encontrado.</strong> Confira a grafia ou tente o nome original da série.");
  } catch (err) {
    if (id !== reqId) return;
    el.grid.innerHTML = "";
    setState("<strong>Não foi possível buscar.</strong> Verifique sua conexão e tente de novo.");
  }
}

/* ---------- Detalhes ---------- */
function whereHtml(s) {
  const items = [];
  if (s.webChannel) items.push({ ...s.webChannel, tipo: "Streaming" });
  if (s.network) items.push({ ...s.network, tipo: "Canal de TV" });
  if (!items.length) return `<p class="overview">Nenhum serviço ou canal informado para esta série.</p>`;
  return `<div class="logos">${items.map((i) => {
    const pais = country(i.country);
    const nome = `${esc(i.name)}${pais ? ` <small>(${esc(pais)})</small>` : ""}`;
    const link = i.officialSite || s.officialSite;
    return `<span class="prov"><span>${link ? `<a href="${esc(link)}" target="_blank" rel="noopener">${nome}</a>` : nome}<br><small>${i.tipo}</small></span></span>`;
  }).join("")}</div>
  <p class="credit">O TVMaze informa o serviço ou canal de origem da série. Em outros países ela pode estar em outra plataforma.</p>`;
}

async function openDetail(id) {
  el.modal.innerHTML = `<div class="detail"><p>Carregando…</p></div>`;
  el.modal.showModal();
  try {
    const res = await fetch(`${API}/shows/${id}?embed=seasons`);
    if (!res.ok) throw new Error();
    const s = await res.json();
    const seasons = (s._embedded && s._embedded.seasons) ? s._embedded.seasons.length : 0;
    const nota = s.rating && s.rating.average;
    const fim = s.ended ? ` até ${fmtDate(s.ended)}` : "";
    el.modal.innerHTML = `
      <button class="close" aria-label="Fechar">✕</button>
      <div class="detail">
        <div class="poster">${s.image ? `<img src="${esc((s.image.original || s.image.medium).replace("http:", "https:"))}" alt="Pôster de ${esc(s.name)}">` : `<div class="none">${esc(s.name)}</div>`}</div>
        <div>
          <h2>${esc(s.name)}</h2>
          <p class="tagline">${esc(STATUS[s.status] || s.status || "")}${fim ? esc(fim) : ""}</p>
          <div class="facts">
            <div class="fact"><span>Estreia</span><b>${fmtDate(s.premiered)}</b></div>
            <div class="fact"><span>Nota do público</span><b class="score ${nota ? scoreClass(nota) : ""}">${nota ? "★ " + fmtScore(nota) + " / 10" : "Sem avaliações"}</b></div>
            <div class="fact"><span>Temporadas</span><b>${seasons || "—"}</b></div>
          </div>
          <p class="overview">${esc(plain(s.summary)) || "Sinopse não disponível."}</p>
          ${s.genres && s.genres.length ? `<p class="credit">${s.genres.map(esc).join(", ")}</p>` : ""}
          <div class="where"><h4>Onde assistir</h4>${whereHtml(s)}</div>
          <p class="credit">Dados: <a href="https://www.tvmaze.com" target="_blank" rel="noopener">TVMaze</a>.</p>
        </div>
      </div>`;
  } catch (err) {
    el.modal.innerHTML = `<button class="close" aria-label="Fechar">✕</button><div class="detail"><p>Não foi possível carregar os detalhes. Tente novamente.</p></div>`;
  }
}

/* ---------- Eventos ---------- */
el.grid.addEventListener("click", (e) => {
  const card = e.target.closest(".card");
  if (card) openDetail(card.dataset.id);
});
el.modal.addEventListener("click", (e) => {
  if (e.target === el.modal || e.target.closest(".close")) el.modal.close();
});
el.q.addEventListener("input", () => { clearTimeout(timer); timer = setTimeout(search, 350); });
el.chips.innerHTML = SUGESTOES.map((t) => `<button class="chip">${esc(t)}</button>`).join("");
el.chips.addEventListener("click", (e) => {
  const chip = e.target.closest(".chip");
  if (!chip) return;
  el.q.value = chip.textContent;
  search();
});

search();