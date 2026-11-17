/* reyon-haritasi-arama — Reyon Haritası Arama — raf dokulu reyon planı, kelimeyle reyon bulma ve bilgi kutusu (16 Kas 2026 · mcp:webmaker/20261116-181132-t332 · D17).
   Mağaza planı: raf çizgili dikey reyon blokları (büyük reyon numarası, ikon, kategori), altında kasa şeridi ve giriş oku. Üstteki arama kutusuna «batarya», «vida» gibi bir kelime yazılınca kelimeyi taşıyan reyonlar vurgulanır, diğerleri soluklaşır ve ilk eşleşen reyonun bilgi kutusu (kategori + ürün kelimeleri) açılır; reyona tıklamak da kutuyu değiştirir. Kayıt alanları: `no` (reyon) · `metin` (virgüllü ürün kelimeleri). JS yokken plan ve tüm reyonların kelime listesi görünür.
   Üretici: scripts/modul-fabrika (aile module) — elle düzenleme yerine tanımı değiştirip yeniden üret.
   Veri: desing: ust · baslik · metin · img · img2 · cta_ad/cta_url · cta2_ad/cta2_url; data (maddeler): [{ ikon?, baslik, metin?, url? }] — metinler dil sözlüğü. */
const P = "modulex-reyon-haritasi-arama";
const IMG_KOK = `/img/${json.id}/`;
/* --- ortak ön ek (scripts/modul-fabrika/on-ek.js) — dil · güvenlik · sayı yardımcıları --- */
const pick = (v) => {
  if (v == null) return "";
  if (typeof v !== "object") return String(v);
  if (typeof wmPickLang === "function") { try { return wmPickLang(v, json.lang) || ""; } catch (e) { /* alt satır */ } }
  return String(v[json.lang] ?? Object.values(v)[0] ?? "");
};
const esc = (s) => String(s ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const medyaUrl = (v) => {
  const s = String(v ?? "").trim();
  if (!s || /^\s*(javascript|vbscript|file):/i.test(s)) return "";
  if (/^data:/i.test(s)) return /^data:(image|video|audio)\//i.test(s) ? s : "";
  if (s.startsWith("/") || /^https?:\/\//i.test(s)) return s;
  return `${IMG_KOK}${s}`;
};
const href = (v) => {
  const s = String(v ?? "").trim();
  if (!s || /^\s*(javascript|vbscript|data):/i.test(s)) return "";
  if (/^(https?:)?\/\//i.test(s) || /^(mailto:|tel:|#)/i.test(s)) return s;
  return wxLangInternalHref(s);
};
const dogru = (v, d) => (v === undefined || v === null || v === "") ? d : !(v === false || v === "false" || v === 0 || v === "0");
const ikonAd = (v) => String(v ?? "").trim().replace(/[^a-z0-9_]/gi, "");
const satirlar = (s) => esc(s).replace(/\r?\n/g, "<br />");
/* ilk dolu alan: yeni ad önce, eski kuşak şablonun adı yedek (G6 yalnız path değiştirerek takas eder) */
const ilk = (o, ks) => {
  for (const k of ks) {
    const v = o == null ? undefined : o[k];
    if (v == null || v === "") continue;
    if (typeof v === "object" && !Array.isArray(v) && !Object.keys(v).length) continue;
    return v;
  }
  return "";
};
const metinAl = (o, ks) => pick(ilk(o, ks)).trim();
const { desing: des = {} } = json;
const setting = webmakerdata?.setting ?? {};
const veri = Array.isArray(json.data) ? json.data : [];
const dil = String(json.lang || "");
const sayiBicim = (v, ondalik) => {
  try { return new Intl.NumberFormat(dil || undefined, { minimumFractionDigits: ondalik, maximumFractionDigits: ondalik }).format(v); } catch (e) { return String(v); }
};
const ikonH = (ad, sinif) => (ad ? `<span class="${sinif} material-symbols-outlined" aria-hidden="true">${ad}</span>` : "");
const no = (i) => String(i + 1).padStart(2, "0");
const ctaHtml = () => {
  const a1 = metinAl(des, ["cta_ad", "button"]); const u1 = href(ilk(des, ["cta_url", "buttonurl", "url"]));
  const a2 = metinAl(des, ["cta2_ad"]); const u2 = href(ilk(des, ["cta2_url"]));
  const d = (a, u, ek) => (a && u ? `<a class="${P}-dugme${ek}" href="${esc(u)}">${esc(a)}<span class="material-symbols-outlined mx-flip" aria-hidden="true">arrow_forward</span></a>` : "");
  const ic = d(a1, u1, "") + d(a2, u2, ` ${P}-dugme--ikincil`);
  return ic ? `<div class="${P}-cta">${ic}</div>` : "";
};
const basHtml = (B, ek) => {
  if (!B.ust && !B.baslik && !B.metin && !ek) return "";
  return `<header class="${P}-bas">`
    + (B.ust ? `<p class="${P}-ust">${esc(B.ust)}</p>` : "")
    + (B.baslik ? `<h2 class="${P}-baslik" id="${P}-{{id}}-b">${esc(B.baslik)}</h2>` : "")
    + (B.metin ? `<p class="${P}-metin">${satirlar(B.metin)}</p>` : "")
    + (ek || "")
    + "</header>";
};
/* --- aile: module --- */
const yeniMadde = veri.map((o) => ({
  ikon: ikonAd(ilk(o, ["ikon", "icon"])), baslik: metinAl(o, ["baslik", "name", "title"]),
  metin: metinAl(o, ["metin", "text", "description", "spot"]), url: href(ilk(o, ["url", "link"])),
})).filter((k) => k.baslik);
/* module-1 eski şeması: name2/spot2/icon2 … name4 → madde */
const eskiMadde = [2, 3, 4].map((n) => ({ ikon: ikonAd(des["icon" + n]), baslik: metinAl(des, ["name" + n]), metin: metinAl(des, ["spot" + n]), url: "" })).filter((k) => k.baslik);
const kayitlar = yeniMadde.length ? yeniMadde : eskiMadde;
const G1 = medyaUrl(ilk(des, ["img", "image"]));
const G2 = medyaUrl(ilk(des, ["img2", "image2"]));
const gH = (src, s, w, h) => (src ? `<img class="${P}-${s}" src="${esc(src)}" alt="" width="${w || 1200}" height="${h || 900}" loading="lazy" decoding="async" />` : "");
const ustH = (B) => (B.ust ? `<p class="${P}-ust">${esc(B.ust)}</p>` : "");
const basH = (B) => (B.baslik ? `<h2 class="${P}-baslik" id="${P}-{{id}}-b">${esc(B.baslik)}</h2>` : "");
const metH = (B) => (B.metin ? `<p class="${P}-metin">${satirlar(B.metin)}</p>` : "");
const listeH = (ic) => (ic ? `<ul class="${P}-maddeler" role="list">${ic}</ul>` : "");
const maddeVar = (k, i) => `<li class="${P}-madde">${ikonH(k.ikon || "check_circle", `${P}-mikon`)}<div class="${P}-myazi"><h3 class="${P}-mbaslik">${k.url ? `<a class="${P}-bag" href="${esc(k.url)}">${esc(k.baslik)}</a>` : esc(k.baslik)}</h3>${k.metin ? `<p class="${P}-mmetin">${satirlar(k.metin)}</p>` : ""}</div></li>`;
/* --- modül: reyon-haritasi-arama --- */
const kart = () => "";
const sar = (ic, A, B) => {
    const R = yeniMadde.length ? veri.filter((o) => metinAl(o, ["baslik", "name", "title"])) : [];
    const x = (i, ks) => metinAl(R[i] || {}, ks);
    const RA = metinAl(des, ["reyonAd"]);
    const AA = metinAl(des, ["aramaAd"]);
    const RY = A.map((k, i) => ({ k, j: String(i), no: x(i, ["no", "reyon"]) || sayiBicim(i + 1, 0), kel: (k.metin || "").split(/[,،;]/).map((t) => t.trim()).filter(Boolean) }));
    const blok = (r) => `<li class="${P}-reyon" data-rey="${r.j}" data-ara="${esc([r.k.baslik].concat(r.kel).join(" "))}"><button type="button" class="${P}-rbtn" aria-pressed="false" aria-controls="${P}-{{id}}-bilgi"><span class="${P}-rno">${RA ? `<span class="${P}-gizli">${esc(RA)} </span>` : ""}<bdi>${esc(r.no)}</bdi></span>${ikonH(r.k.ikon || "shelves", `${P}-rik`)}<span class="${P}-rad">${esc(r.k.baslik)}</span></button></li>`;
    const bilgi = (r) => `<div class="${P}-rd" data-rd="${r.j}"><p class="${P}-rdbas"><span class="${P}-rdno">${RA ? `${esc(RA)} ` : ""}<bdi>${esc(r.no)}</bdi></span><strong>${esc(r.k.baslik)}</strong></p>${r.kel.length ? `<ul class="${P}-kelime" role="list">${r.kel.map((t) => `<li>${esc(t)}</li>`).join("")}</ul>` : ""}${r.k.url ? `<a class="${P}-bag ${P}-rdbag" href="${esc(r.k.url)}">@read-more@</a>` : ""}</div>`;
    const KA = metinAl(des, ["kasaAd"]);
    const GA = metinAl(des, ["girisAd"]);
    return `<div class="${P}-giris">${ustH(B)}${basH(B)}${metH(B)}</div><div class="${P}-arac" data-rkap hidden><label class="${P}-akutu">${ikonH("search", `${P}-aik`)}<span class="${P}-gizli">${esc(AA || B.baslik)}</span><input class="${P}-agirdi" type="search" data-rara placeholder="${esc(AA)}" autocomplete="off" /></label><p class="${P}-ryok" data-ryok hidden>@no-results@</p></div><div class="${P}-yerlesim"><div class="${P}-magaza"><ol class="${P}-reyonlar" role="list">${RY.map(blok).join("")}</ol>${KA || GA ? `<div class="${P}-kasa">${KA ? `<span class="${P}-kasa-ad">${ikonH("point_of_sale", "")}${esc(KA)}</span>` : ""}${GA ? `<span class="${P}-kapi">${ikonH("arrow_upward", "")}${esc(GA)}</span>` : ""}</div>` : ""}</div><div class="${P}-bilgi" id="${P}-{{id}}-bilgi" data-rbilgi aria-live="polite" hidden></div><div class="${P}-dizin">${RY.map(bilgi).join("")}</div></div>${ctaHtml()}`;
  };
const B = { ust: metinAl(des, ["ust","title","badge"]), baslik: metinAl(des, ["baslik","name"]), metin: metinAl(des, ["metin","description"]) };
/* veri yoksa gövde hiç kurulmaz (sarmalayıcı boş listeye dokunmaz) */
const BOS = !B.baslik && !B.metin;
const govde = BOS ? "" : sar(kayitlar.map((k, i) => kart(k, i, kayitlar.length, kayitlar)).join(""), kayitlar, B);
const bas = "";
const sinif = (bas || B.ust || B.baslik || B.metin ? "" : ` ${P}--bassiz`);
html = html
  .replaceAll("{{fbsinif}}", () => sinif)
  .replaceAll("{{fbetiket}}", () => (B.baslik ? `aria-labelledby="${P}-{{id}}-b"` : ""))
  .replaceAll("{{fbbas}}", () => bas)
  .replaceAll("{{fbgovde}}", () => govde);
if (BOS) html = "";
