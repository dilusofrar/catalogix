const { useState, useMemo, useEffect, useRef, useCallback } = React;

/* ---------- ícones (SVG próprios, estilo de linha minimalista) ---------- */
const Icon = ({ children, size = 18, ...p }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}>{children}</svg>
);
const IconSearch = (p) => <Icon {...p}><circle cx="11" cy="11" r="7"/><line x1="21" y1="21" x2="16.2" y2="16.2"/></Icon>;
const IconX = (p) => <Icon {...p}><line x1="6" y1="6" x2="18" y2="18"/><line x1="18" y1="6" x2="6" y2="18"/></Icon>;
const IconBag = (p) => <Icon {...p}><path d="M7 9V7a5 5 0 0 1 10 0v2"/><path d="M4.5 9h15l-1.2 11.2a1.5 1.5 0 0 1-1.5 1.3H7.2a1.5 1.5 0 0 1-1.5-1.3L4.5 9Z"/></Icon>;
const IconPlus = (p) => <Icon {...p}><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></Icon>;
const IconMinus = (p) => <Icon {...p}><line x1="5" y1="12" x2="19" y2="12"/></Icon>;
const IconTrash = (p) => <Icon {...p}><path d="M4 7h16"/><path d="M9 7V5a1.5 1.5 0 0 1 1.5-1.5h3A1.5 1.5 0 0 1 15 5v2"/><path d="M6 7l1 13a1.5 1.5 0 0 0 1.5 1.5h7A1.5 1.5 0 0 0 17 20l1-13"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></Icon>;
const IconChevronDown = (p) => <Icon {...p}><polyline points="6 9 12 15 18 9"/></Icon>;
const IconSliders = (p) => <Icon {...p}><line x1="4" y1="6" x2="20" y2="6"/><circle cx="14" cy="6" r="2" fill="var(--surface)"/><line x1="4" y1="12" x2="20" y2="12"/><circle cx="8" cy="12" r="2" fill="var(--surface)"/><line x1="4" y1="18" x2="20" y2="18"/><circle cx="16" cy="18" r="2" fill="var(--surface)"/></Icon>;
const IconCheckCircle = (p) => <Icon {...p}><circle cx="12" cy="12" r="9"/><path d="M8.5 12.3l2.3 2.3 4.7-5"/></Icon>;
const IconPackageX = (p) => <Icon {...p}><path d="M3.5 7.5 12 3l8.5 4.5v9L12 21l-8.5-4.5v-9Z"/><path d="M3.8 7.3 12 12l8.2-4.7"/><line x1="12" y1="12" x2="12" y2="21"/></Icon>;
const IconClipboard = (p) => <Icon {...p}><rect x="6" y="4" width="12" height="17" rx="2"/><path d="M9 4V3a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v1"/><line x1="9" y1="10" x2="15" y2="10"/><line x1="9" y1="14" x2="15" y2="14"/></Icon>;
const IconLayers = (p) => <Icon {...p}><polygon points="12 3 20 8 12 13 4 8 12 3"/><polyline points="4 13 12 18 20 13"/></Icon>;
const IconSun = (p) => <Icon {...p}><circle cx="12" cy="12" r="4.5"/><line x1="12" y1="2.5" x2="12" y2="4.5"/><line x1="12" y1="19.5" x2="12" y2="21.5"/><line x1="4.2" y1="4.2" x2="5.6" y2="5.6"/><line x1="18.4" y1="18.4" x2="19.8" y2="19.8"/><line x1="2.5" y1="12" x2="4.5" y2="12"/><line x1="19.5" y1="12" x2="21.5" y2="12"/><line x1="4.2" y1="19.8" x2="5.6" y2="18.4"/><line x1="18.4" y1="5.6" x2="19.8" y2="4.2"/></Icon>;
const IconMoon = (p) => <Icon {...p}><path d="M20 14.5A8.5 8.5 0 1 1 9.5 4a7 7 0 0 0 10.5 10.5Z"/></Icon>;

/* ---------- tema claro/escuro (persistido no navegador do visitante) ---------- */
const THEME_KEY = "catalogix-theme";
function readStoredTheme() {
  try { return localStorage.getItem(THEME_KEY); } catch (e) { return null; }
}
function useTheme() {
  const [theme, setTheme] = useState(() => readStoredTheme());
  useEffect(() => {
    try {
      if (theme) {
        document.documentElement.setAttribute("data-theme", theme);
        localStorage.setItem(THEME_KEY, theme);
      } else {
        document.documentElement.removeAttribute("data-theme");
        localStorage.removeItem(THEME_KEY);
      }
    } catch (e) { /* localStorage indisponível: tema segue só na sessão atual */ }
  }, [theme]);
  const toggle = () => setTheme((prev) => {
    const prefersDark = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
    const current = prev || (prefersDark ? "dark" : "light");
    return current === "dark" ? "light" : "dark";
  });
  return [theme, toggle];
}

/* ---------- placeholder de imagem (fallback caso a URL externa falhe) ---------- */
const FALLBACK_IMG = "data:image/svg+xml;utf8," + encodeURIComponent(
  `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 300'>
     <rect width='400' height='300' fill='#EDF1F6'/>
     <g fill='none' stroke='#9AA7B5' stroke-width='2'>
       <rect x='120' y='95' width='160' height='110' rx='8'/>
       <circle cx='160' cy='135' r='14'/>
       <path d='M120 185l45-40 35 30 30-25 60 50' />
     </g>
   </svg>`
);

/* ---------- base de dados mockada ---------- */
const PRODUCTS = [
  { id:"p1", name:"Monitor LED 27\" 4K UHD", sku:"MN-2740K", category:"Monitores", price:1899.90,
    image:"images/monitor.jpg",
    stock:"disponivel",
    desc:"Monitor profissional de 27 polegadas com resolução 4K UHD, ideal para estações de trabalho e design.",
    specs:["Painel IPS 3840×2160","Taxa de atualização 60Hz · 10 bits","Entradas HDMI 2.1, DisplayPort, USB-C 65W","Ajuste de altura e inclinação VESA 100×100"] },
  { id:"p2", name:"Teclado Mecânico RGB ABNT2", sku:"KB-RGB01", category:"Periféricos", price:349.90,
    image:"images/teclado.jpg",
    stock:"disponivel",
    desc:"Teclado mecânico com switches azuis, retroiluminação RGB por tecla e layout ABNT2 completo.",
    specs:["Switches mecânicos azuis (clicky)","Retroiluminação RGB 16.8M de cores","Estrutura em liga de alumínio","Teclas anti-ghosting · N-key rollover"] },
  { id:"p3", name:"Mouse Ergonômico Wireless", sku:"MS-ERG02", category:"Periféricos", price:189.90,
    image:"images/mouse.jpg",
    stock:"disponivel",
    desc:"Mouse sem fio com design ergonômico vertical, reduz a tensão no punho em uso prolongado.",
    specs:["Sensor óptico 4000 DPI ajustável","Conexão 2.4GHz + Bluetooth 5.0","Bateria recarregável · 70 dias de uso","6 botões programáveis"] },
  { id:"p4", name:"Roteador Wi-Fi 6 Mesh Dual Band", sku:"RT-MESH6", category:"Redes", price:599.00,
    image:"images/roteador.jpg",
    stock:"disponivel",
    desc:"Roteador Wi-Fi 6 com suporte a mesh, cobertura ampliada e gerenciamento centralizado via app.",
    specs:["Velocidade combinada até 3000 Mbps","4 antenas de alto ganho · suporte mesh","4 portas Gigabit LAN + 1 WAN","QoS e controle parental integrados"] },
  { id:"p5", name:"Switch Gerenciável 24 Portas Gigabit", sku:"SW-24GB", category:"Redes", price:1299.00,
    image:"images/switch.jpg",
    stock:"baixo",
    desc:"Switch gerenciável de 24 portas com VLAN, QoS e monitoramento SNMP para redes corporativas.",
    specs:["24 portas Gigabit + 2 portas SFP uplink","Gerenciamento via web, CLI e SNMP","Suporte a VLAN, LACP e QoS","Montagem em rack 19\" 1U"] },
  { id:"p6", name:"SSD NVMe 1TB PCIe 4.0", sku:"SSD-1TB4", category:"Armazenamento", price:449.90,
    image:"images/ssd.jpg",
    stock:"disponivel",
    desc:"Unidade de estado sólido NVMe com interface PCIe 4.0 para alta velocidade de leitura e gravação.",
    specs:["Leitura sequencial até 7000 MB/s","Gravação sequencial até 5500 MB/s","Formato M.2 2280 · compatível PCIe 3.0/4.0","MTBF de 1.5 milhão de horas"] },
  { id:"p7", name:"HD Externo 4TB USB-C", sku:"HD-4TBC", category:"Armazenamento", price:699.90,
    image:"images/hd-externo.jpg",
    stock:"disponivel",
    desc:"Armazenamento externo portátil de 4TB com interface USB-C para backup e transporte de dados.",
    specs:["Capacidade 4TB · interface USB-C 3.2","Velocidade de transferência até 130 MB/s","Carcaça resistente a impacto","Compatível com Windows e macOS"] },
  { id:"p8", name:"Headset Profissional com Cancelamento de Ruído", sku:"HS-ANC03", category:"Áudio/Vídeo", price:459.00,
    image:"images/headset.jpg",
    stock:"esgotado",
    desc:"Headset over-ear com cancelamento ativo de ruído, voltado para reuniões e ambientes corporativos.",
    specs:["Cancelamento ativo de ruído (ANC)","Microfone com supressão de ruído ambiente","Conectividade USB-C e P2 de 3.5mm","Até 20h de bateria com ANC ativo"] },
  { id:"p9", name:"Webcam Full HD 1080p com Microfone", sku:"WC-1080M", category:"Áudio/Vídeo", price:279.90,
    image:"images/webcam.jpg",
    stock:"disponivel",
    desc:"Webcam Full HD com microfone integrado e correção automática de luz, ideal para videoconferências.",
    specs:["Resolução 1080p a 30fps","Campo de visão 90° · foco fixo","Microfone com redução de ruído","Clipe universal para monitores e notebooks"] },
  { id:"p10", name:"Cadeira Ergonômica Operacional", sku:"CH-ERG10", category:"Mobiliário", price:1150.00,
    image:"images/cadeira.jpg",
    stock:"disponivel",
    desc:"Cadeira de escritório com apoio lombar ajustável, braços reguláveis e estrutura certificada.",
    specs:["Apoio lombar com ajuste de altura","Braços reguláveis em 3D","Base giratória com rodízios silenciosos","Carga máxima recomendada 120kg"] },
];

const CATEGORIES = ["Todos", ...Array.from(new Set(PRODUCTS.map(p => p.category)))];
const MIN_PRICE = Math.floor(Math.min(...PRODUCTS.map(p => p.price)));
const MAX_PRICE = Math.ceil(Math.max(...PRODUCTS.map(p => p.price)));

const STOCK_META = {
  disponivel: { label: "Disponível", fg: "var(--success)", bg: "var(--success-soft)" },
  baixo:      { label: "Últimas unidades", fg: "var(--warning)", bg: "var(--warning-soft)" },
  esgotado:   { label: "Esgotado", fg: "var(--danger)", bg: "var(--danger-soft)" },
};

const currency = (v) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

function discountFor(subtotal) {
  if (subtotal >= 3000) return { rate: 0.12, label: "12% · pedido de grande volume" };
  if (subtotal >= 1500) return { rate: 0.08, label: "8% · pedido de volume médio" };
  if (subtotal >= 500)  return { rate: 0.03, label: "3% · pedido inicial" };
  return { rate: 0, label: "sem desconto aplicável" };
}

/* ---------- componentes auxiliares ---------- */
function StockBadge({ stock }) {
  const m = STOCK_META[stock];
  return (
    <span className="mono" style={{
      fontSize: 11, fontWeight: 600, letterSpacing: ".03em", padding: "3px 8px",
      borderRadius: 999, color: m.fg, background: m.bg, whiteSpace: "nowrap",
    }}>{m.label.toUpperCase()}</span>
  );
}

function QtyStepper({ value, onChange, min = 1, max = 99, size = "md" }) {
  const dim = size === "sm" ? 28 : 34;
  const btnStyle = {
    width: dim, height: dim, display: "flex", alignItems: "center", justifyContent: "center",
    border: "1px solid var(--border)", background: "var(--surface)", color: "var(--text)",
    cursor: "pointer", borderRadius: 8,
  };
  return (
    <div style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
      <button type="button" className="icon-btn" style={btnStyle}
        disabled={value <= min}
        onClick={() => onChange(Math.max(min, value - 1))}
        aria-label="Diminuir quantidade">
        <IconMinus size={14} />
      </button>
      <span className="mono nums" style={{ minWidth: 28, textAlign: "center", fontWeight: 600, fontSize: 14 }}>{value}</span>
      <button type="button" className="icon-btn" style={btnStyle}
        disabled={value >= max}
        onClick={() => onChange(Math.min(max, value + 1))}
        aria-label="Aumentar quantidade">
        <IconPlus size={14} />
      </button>
    </div>
  );
}

function ProductImage({ src, alt, style }) {
  const [cur, setCur] = useState(src);
  return <img src={cur} alt={alt} style={style} loading="lazy" onError={() => setCur(FALLBACK_IMG)} />;
}

/* ---------- cartão de produto ---------- */
function ProductCard({ product, onOpen, onQuickAdd }) {
  const m = STOCK_META[product.stock];
  return (
    <div className="card-hover" style={{
      background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 14,
      overflow: "hidden", display: "flex", flexDirection: "column", cursor: "pointer",
    }} onClick={() => onOpen(product)}>
      <div style={{ position: "relative", aspectRatio: "4/3", background: "var(--surface-alt)" }}>
        <ProductImage src={product.image} alt={product.name}
          style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
        <div style={{ position: "absolute", top: 10, left: 10 }}><StockBadge stock={product.stock} /></div>
      </div>
      <div style={{ padding: 14, display: "flex", flexDirection: "column", gap: 6, flex: 1, minWidth: 0 }}>
        <span className="mono" style={{ fontSize: 11, color: "var(--text-faint)", letterSpacing: ".04em" }}>{product.sku}</span>
        <h3 style={{ margin: 0, fontSize: 15.5, fontWeight: 600, lineHeight: 1.3, minHeight: 40 }}>{product.name}</h3>
        <span style={{ fontSize: 12, color: "var(--text-muted)" }}>{product.category}</span>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 6 }}>
          <span className="mono nums" style={{ fontSize: 17, fontWeight: 700, color: "var(--primary)" }}>{currency(product.price)}</span>
          <button type="button" className="icon-btn" disabled={product.stock === "esgotado"}
            onClick={(e) => { e.stopPropagation(); onQuickAdd(product); }}
            title="Adicionar 1 unidade à cotação"
            style={{
              display: "flex", alignItems: "center", gap: 6, padding: "7px 10px", borderRadius: 8,
              border: "1px solid var(--border)", cursor: product.stock === "esgotado" ? "not-allowed" : "pointer",
              background: product.stock === "esgotado" ? "var(--surface-alt)" : "var(--primary)",
              color: product.stock === "esgotado" ? "var(--text-faint)" : "var(--primary-ink)",
              fontSize: 12.5, fontWeight: 600,
            }}>
            <IconPlus size={14} /> Cotar
          </button>
        </div>
      </div>
    </div>
  );
}

/* ---------- modal de visualização rápida ---------- */
function QuickViewModal({ product, onClose, onAdd }) {
  const [qty, setQty] = useState(1);
  useEffect(() => { setQty(1); }, [product]);
  useEffect(() => {
    const onKey = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);
  if (!product) return null;
  const m = STOCK_META[product.stock];
  const sold = product.stock === "esgotado";
  return (
    <div className="scrim-enter gutter" style={{
      position: "fixed", inset: 0, background: "var(--overlay)", zIndex: 60,
      display: "flex", alignItems: "center", justifyContent: "center", padding: 20,
    }} onClick={onClose}>
      <div className="pop-enter" onClick={(e) => e.stopPropagation()} style={{
        background: "var(--surface)", borderRadius: 16, maxWidth: 760, width: "100%",
        maxHeight: "88vh", overflow: "auto", border: "1px solid var(--border)",
        display: "grid", gridTemplateColumns: "1fr", position: "relative",
      }}>
        <button type="button" onClick={onClose} aria-label="Fechar"
          className="icon-btn"
          style={{
            position: "absolute", top: 12, right: 12, width: 34, height: 34, borderRadius: "50%",
            border: "1px solid var(--border)", background: "var(--surface)", color: "var(--text)",
            display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", zIndex: 2,
          }}><IconX size={16} /></button>
        <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr)", gap: 0 }}>
          <div style={{ aspectRatio: "16/9", background: "var(--surface-alt)" }}>
            <ProductImage src={product.image} alt={product.name}
              style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
          </div>
          <div style={{ padding: 24, display: "flex", flexDirection: "column", gap: 14, minWidth: 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
              <span className="mono" style={{ fontSize: 12, color: "var(--text-faint)" }}>{product.sku}</span>
              <span style={{ color: "var(--border)" }}>•</span>
              <span style={{ fontSize: 12, color: "var(--text-muted)" }}>{product.category}</span>
              <StockBadge stock={product.stock} />
            </div>
            <h2 style={{ margin: 0, fontSize: 24, fontWeight: 700, lineHeight: 1.25 }}>{product.name}</h2>
            <p style={{ margin: 0, color: "var(--text-muted)", fontSize: 14.5, lineHeight: 1.6 }}>{product.desc}</p>

            <div style={{ background: "var(--surface-alt)", borderRadius: 10, padding: 14 }}>
              <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: ".05em", color: "var(--text-muted)" }}>ESPECIFICAÇÕES TÉCNICAS</span>
              <ul style={{ margin: "8px 0 0", paddingLeft: 18, display: "flex", flexDirection: "column", gap: 6 }}>
                {product.specs.map((s, i) => (
                  <li key={i} style={{ fontSize: 13.5, color: "var(--text)", lineHeight: 1.4 }}>{s}</li>
                ))}
              </ul>
            </div>

            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12, marginTop: 4 }}>
              <span className="mono nums" style={{ fontSize: 26, fontWeight: 700, color: "var(--primary)" }}>{currency(product.price)}</span>
              <QtyStepper value={qty} onChange={setQty} max={99} />
            </div>

            <button type="button" disabled={sold}
              onClick={() => { onAdd(product, qty); onClose(); }}
              style={{
                marginTop: 6, width: "100%", padding: "13px 16px", borderRadius: 10, border: "none",
                background: sold ? "var(--surface-alt)" : "var(--accent)",
                color: sold ? "var(--text-faint)" : "var(--accent-ink)",
                fontWeight: 700, fontSize: 15, cursor: sold ? "not-allowed" : "pointer",
                display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
              }}>
              <IconBag size={18} /> {sold ? "Produto esgotado" : `Adicionar à Cotação · ${currency(product.price * qty)}`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------- gaveta lateral do carrinho ---------- */
function CartDrawer({ open, onClose, items, onQty, onRemove, onFinish }) {
  useEffect(() => {
    const onKey = (e) => { if (e.key === "Escape" && open) onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);
  if (!open) return null;

  const subtotal = items.reduce((s, it) => s + it.product.price * it.qty, 0);
  const disc = discountFor(subtotal);
  const discountValue = subtotal * disc.rate;
  const total = subtotal - discountValue;

  return (
    <div className="scrim-enter" style={{ position: "fixed", inset: 0, background: "var(--overlay)", zIndex: 70 }} onClick={onClose}>
      <aside className="slide-enter gutter" onClick={(e) => e.stopPropagation()} style={{
        position: "absolute", top: 0, right: 0, height: "100%", width: "min(420px, 100%)",
        background: "var(--surface)", borderLeft: "1px solid var(--border)",
        display: "flex", flexDirection: "column", paddingTop: "max(18px, env(safe-area-inset-top,0px))",
        paddingBottom: "max(18px, env(safe-area-inset-bottom,0px))",
      }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingBottom: 14, borderBottom: "1px solid var(--border)" }}>
          <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700, display: "flex", alignItems: "center", gap: 8 }}>
            <IconBag size={20} /> Resumo da Cotação
          </h2>
          <button type="button" onClick={onClose} aria-label="Fechar carrinho" className="icon-btn" style={{
            width: 32, height: 32, borderRadius: "50%", border: "1px solid var(--border)", background: "var(--surface)",
            color: "var(--text)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer",
          }}><IconX size={15} /></button>
        </div>

        {items.length === 0 ? (
          <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 10, color: "var(--text-muted)", textAlign: "center", padding: 20 }}>
            <IconBag size={38} style={{ color: "var(--text-faint)" }} />
            <p style={{ margin: 0, fontSize: 14 }}>Sua cotação está vazia.<br />Adicione produtos do catálogo.</p>
          </div>
        ) : (
          <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: 12, padding: "14px 2px" }}>
            {items.map(({ product, qty }) => (
              <div key={product.id} style={{ display: "flex", gap: 10, alignItems: "flex-start", border: "1px solid var(--border)", borderRadius: 10, padding: 10 }}>
                <ProductImage src={product.image} alt={product.name}
                  style={{ width: 56, height: 56, borderRadius: 8, objectFit: "cover", flexShrink: 0, background: "var(--surface-alt)" }} />
                <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 4 }}>
                  <span style={{ fontSize: 13.5, fontWeight: 600, lineHeight: 1.3 }}>{product.name}</span>
                  <span className="mono nums" style={{ fontSize: 12.5, color: "var(--text-muted)" }}>{currency(product.price)} / un.</span>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 2 }}>
                    <QtyStepper size="sm" value={qty} onChange={(v) => onQty(product.id, v)} max={99} />
                    <button type="button" onClick={() => onRemove(product.id)} aria-label={`Remover ${product.name}`}
                      className="icon-btn" style={{
                        border: "none", background: "transparent", color: "var(--danger)", cursor: "pointer",
                        display: "flex", alignItems: "center", padding: 6, borderRadius: 6,
                      }}>
                      <IconTrash size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {items.length > 0 && (
          <div style={{ borderTop: "1px solid var(--border)", paddingTop: 14, display: "flex", flexDirection: "column", gap: 8 }}>
            <Row label="Subtotal" value={currency(subtotal)} />
            <Row label={`Desconto simulado (${disc.label})`} value={disc.rate > 0 ? `− ${currency(discountValue)}` : currency(0)} muted />
            <div style={{ height: 1, background: "var(--border)", margin: "4px 0" }} />
            <Row label="Total geral" value={currency(total)} big />
            <button type="button" onClick={() => onFinish({ items, subtotal, discountValue, total, disc })}
              style={{
                marginTop: 8, width: "100%", padding: "14px 16px", borderRadius: 10, border: "none",
                background: "var(--primary)", color: "var(--primary-ink)", fontWeight: 700, fontSize: 15,
                cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
              }}>
              <IconCheckCircle size={18} /> Finalizar Cotação
            </button>
          </div>
        )}
      </aside>
    </div>
  );
}

function Row({ label, value, big, muted }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
      <span style={{ fontSize: big ? 15 : 13.5, fontWeight: big ? 700 : 500, color: muted ? "var(--text-muted)" : "var(--text)" }}>{label}</span>
      <span className={"mono nums" + (big ? "" : "")} style={{ fontSize: big ? 19 : 13.5, fontWeight: big ? 700 : 600, color: big ? "var(--primary)" : "var(--text)" }}>{value}</span>
    </div>
  );
}

/* ---------- modal de confirmação ---------- */
function ConfirmModal({ data, onClose }) {
  const [copied, setCopied] = useState(false);
  if (!data) return null;
  const quoteNo = data.quoteNo;
  const dateStr = new Date().toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" });
  const summaryLines = [
    `COTAÇÃO Nº ${quoteNo} — NexTech Distribuidora`,
    `Data: ${dateStr}`,
    "-".repeat(42),
    ...data.items.map(({ product, qty }) =>
      `${product.name} (${product.sku})\n  ${qty} × ${currency(product.price)} = ${currency(product.price * qty)}`
    ),
    "-".repeat(42),
    `Subtotal: ${currency(data.subtotal)}`,
    `Desconto (${data.disc.label}): − ${currency(data.discountValue)}`,
    `TOTAL GERAL: ${currency(data.total)}`,
  ];
  const summaryText = summaryLines.join("\n");

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(summaryText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      setCopied(false);
    }
  };

  return (
    <div className="scrim-enter gutter" style={{
      position: "fixed", inset: 0, background: "var(--overlay)", zIndex: 80,
      display: "flex", alignItems: "center", justifyContent: "center", padding: 20,
    }} onClick={onClose}>
      <div className="pop-enter" onClick={(e) => e.stopPropagation()} style={{
        background: "var(--surface)", borderRadius: 16, maxWidth: 480, width: "100%",
        border: "1px solid var(--border)", padding: 28, maxHeight: "88vh", overflowY: "auto",
      }}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", gap: 10, marginBottom: 18 }}>
          <div style={{ width: 56, height: 56, borderRadius: "50%", background: "var(--success-soft)", color: "var(--success)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <IconCheckCircle size={30} />
          </div>
          <h2 style={{ margin: 0, fontSize: 19, fontWeight: 700 }}>Cotação finalizada com sucesso!</h2>
          <p style={{ margin: 0, fontSize: 13.5, color: "var(--text-muted)" }}>
            Parabéns! Sua solicitação <span className="mono">#{quoteNo}</span> foi registrada. Confira o resumo abaixo.
          </p>
        </div>

        <pre className="mono" style={{
          background: "var(--surface-alt)", borderRadius: 10, padding: 14, fontSize: 12,
          lineHeight: 1.6, whiteSpace: "pre-wrap", wordBreak: "break-word", margin: 0,
          border: "1px solid var(--border)", color: "var(--text)",
        }}>{summaryText}</pre>

        <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
          <button type="button" onClick={copy} style={{
            flex: 1, padding: "11px 14px", borderRadius: 9, border: "1px solid var(--border)",
            background: "var(--surface)", color: "var(--text)", fontWeight: 600, fontSize: 13.5,
            cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 7,
          }}>
            <IconClipboard size={15} /> {copied ? "Copiado!" : "Copiar resumo"}
          </button>
          <button type="button" onClick={onClose} style={{
            flex: 1, padding: "11px 14px", borderRadius: 9, border: "none",
            background: "var(--primary)", color: "var(--primary-ink)", fontWeight: 700, fontSize: 13.5, cursor: "pointer",
          }}>
            Fazer nova cotação
          </button>
        </div>
      </div>
    </div>
  );
}

/* ---------- toast ---------- */
function Toast({ toast }) {
  if (!toast) return null;
  return (
    <div className="pop-enter gutter" style={{
      position: "fixed", bottom: "max(20px, env(safe-area-inset-bottom,0px))", left: 0, right: 0,
      display: "flex", justifyContent: "center", zIndex: 90, pointerEvents: "none",
    }}>
      <div style={{
        background: "var(--primary)", color: "var(--primary-ink)", padding: "11px 18px", borderRadius: 999,
        display: "flex", alignItems: "center", gap: 8, fontSize: 13.5, fontWeight: 600,
        boxShadow: "0 10px 24px -6px var(--shadow)",
      }}>
        <IconCheckCircle size={16} /> {toast}
      </div>
    </div>
  );
}

/* ---------- filtros (sidebar) ---------- */
function FiltersPanel({ category, setCategory, priceMin, priceMax, setPriceMin, setPriceMax, inStockOnly, setInStockOnly }) {
  const pct = (v) => ((v - MIN_PRICE) / (MAX_PRICE - MIN_PRICE)) * 100;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <div>
        <h4 style={{ margin: "0 0 10px", fontSize: 12.5, fontWeight: 700, letterSpacing: ".04em", color: "var(--text-muted)" }}>CATEGORIA</h4>
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {CATEGORIES.map((c) => (
            <button key={c} type="button" onClick={() => setCategory(c)} className="chip" style={{
              textAlign: "left", padding: "8px 10px", borderRadius: 8, border: "1px solid var(--border)",
              background: category === c ? "var(--primary)" : "var(--surface)",
              color: category === c ? "var(--primary-ink)" : "var(--text)",
              fontSize: 13.5, fontWeight: category === c ? 700 : 500, cursor: "pointer",
            }}>{c}</button>
          ))}
        </div>
      </div>

      <div>
        <h4 style={{ margin: "0 0 10px", fontSize: 12.5, fontWeight: 700, letterSpacing: ".04em", color: "var(--text-muted)" }}>FAIXA DE PREÇO</h4>
        <div className="range-wrap">
          <div className="range-track" />
          <div className="range-fill" style={{ left: pct(priceMin) + "%", right: (100 - pct(priceMax)) + "%" }} />
          <input className="range-input" type="range" min={MIN_PRICE} max={MAX_PRICE} value={priceMin}
            onChange={(e) => setPriceMin(Math.min(Number(e.target.value), priceMax - 1))} aria-label="Preço mínimo" />
          <input className="range-input" type="range" min={MIN_PRICE} max={MAX_PRICE} value={priceMax}
            onChange={(e) => setPriceMax(Math.max(Number(e.target.value), priceMin + 1))} aria-label="Preço máximo" />
        </div>
        <div className="mono nums" style={{ display: "flex", justifyContent: "space-between", fontSize: 12.5, color: "var(--text-muted)", marginTop: 4 }}>
          <span>{currency(priceMin)}</span>
          <span>{currency(priceMax)}</span>
        </div>
      </div>

      <div>
        <h4 style={{ margin: "0 0 10px", fontSize: 12.5, fontWeight: 700, letterSpacing: ".04em", color: "var(--text-muted)" }}>DISPONIBILIDADE</h4>
        <label style={{ display: "flex", alignItems: "center", gap: 9, fontSize: 13.5, cursor: "pointer", userSelect: "none" }}>
          <input type="checkbox" checked={inStockOnly} onChange={(e) => setInStockOnly(e.target.checked)}
            style={{ width: 16, height: 16, accentColor: "var(--primary)" }} />
          Somente produtos em estoque
        </label>
      </div>
    </div>
  );
}

/* ---------- app principal ---------- */
function App() {
  const [theme, toggleTheme] = useTheme();
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("Todos");
  const [priceMin, setPriceMin] = useState(MIN_PRICE);
  const [priceMax, setPriceMax] = useState(MAX_PRICE);
  const [inStockOnly, setInStockOnly] = useState(false);
  const [sortBy, setSortBy] = useState("relevance");
  const [filtersOpen, setFiltersOpen] = useState(false);

  const [cart, setCart] = useState([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [quickView, setQuickView] = useState(null);
  const [confirmData, setConfirmData] = useState(null);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 2200);
    return () => clearTimeout(t);
  }, [toast]);

  useEffect(() => {
    const anyOpen = cartOpen || quickView || confirmData;
    document.body.style.overflow = anyOpen ? "hidden" : "";
  }, [cartOpen, quickView, confirmData]);

  const filtered = useMemo(() => {
    let list = PRODUCTS.filter((p) => {
      const q = query.trim().toLowerCase();
      const matchesQuery = !q || p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q);
      const matchesCategory = category === "Todos" || p.category === category;
      const matchesPrice = p.price >= priceMin && p.price <= priceMax;
      const matchesStock = !inStockOnly || p.stock !== "esgotado";
      return matchesQuery && matchesCategory && matchesPrice && matchesStock;
    });
    if (sortBy === "price-asc") list = [...list].sort((a, b) => a.price - b.price);
    else if (sortBy === "price-desc") list = [...list].sort((a, b) => b.price - a.price);
    else if (sortBy === "name-asc") list = [...list].sort((a, b) => a.name.localeCompare(b.name, "pt-BR"));
    return list;
  }, [query, category, priceMin, priceMax, inStockOnly, sortBy]);

  const addToCart = useCallback((product, qty = 1) => {
    setCart((prev) => {
      const idx = prev.findIndex((it) => it.product.id === product.id);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = { ...next[idx], qty: Math.min(99, next[idx].qty + qty) };
        return next;
      }
      return [...prev, { product, qty }];
    });
    setToast(`${product.name} adicionado à cotação`);
  }, []);

  const updateQty = useCallback((id, qty) => {
    setCart((prev) => prev.map((it) => (it.product.id === id ? { ...it, qty } : it)));
  }, []);

  const removeFromCart = useCallback((id) => {
    setCart((prev) => prev.filter((it) => it.product.id !== id));
  }, []);

  const cartCount = cart.reduce((s, it) => s + it.qty, 0);

  const finishQuote = (data) => {
    const quoteNo = `${new Date().getFullYear()}${String(Date.now()).slice(-6)}`;
    setConfirmData({ ...data, quoteNo });
    setCartOpen(false);
  };

  const closeConfirm = () => {
    setConfirmData(null);
    setCart([]);
  };

  const isDark = theme
    ? theme === "dark"
    : !!(window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches);

  return (
    <div>
      {/* header fixo */}
      <header className="gutter" style={{
        position: "sticky", top: "env(safe-area-inset-top,0px)", zIndex: 40,
        background: "var(--surface)", borderBottom: "1px solid var(--border)",
      }}>
        <div style={{ maxWidth: 1280, margin: "0 auto", padding: "14px 0", display: "flex", alignItems: "center", gap: 18, flexWrap: "wrap" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 9, flexShrink: 0 }}>
            <div style={{
              width: 36, height: 36, borderRadius: 9, background: "var(--primary)", color: "var(--primary-ink)",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}><IconLayers size={19} /></div>
            <span className="disp" style={{ fontSize: 19, fontWeight: 700, letterSpacing: "-.01em" }}>NexTech</span>
          </div>

          <div style={{ flex: 1, minWidth: 180, position: "relative" }}>
            <IconSearch size={17} style={{ position: "absolute", left: 13, top: "50%", transform: "translateY(-50%)", color: "var(--text-faint)" }} />
            <input type="text" value={query} onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar por nome ou SKU…"
              style={{
                width: "100%", padding: "11px 14px 11px 38px", borderRadius: 10, border: "1px solid var(--border)",
                background: "var(--surface-alt)", color: "var(--text)", fontSize: 14,
              }} />
          </div>

          <div style={{ position: "relative", flexShrink: 0 }}>
            <select value={category} onChange={(e) => setCategory(e.target.value)}
              aria-label="Selecionar categoria"
              style={{
                appearance: "none", padding: "11px 32px 11px 14px", borderRadius: 10,
                border: "1px solid var(--border)", background: "var(--surface-alt)", color: "var(--text)",
                fontSize: 13.5, fontWeight: 500, cursor: "pointer",
              }}>
              {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
            <IconChevronDown size={14} style={{ position: "absolute", right: 11, top: "50%", transform: "translateY(-50%)", pointerEvents: "none", color: "var(--text-muted)" }} />
          </div>

          <button type="button" onClick={toggleTheme}
            aria-label={isDark ? "Mudar para tema claro" : "Mudar para tema escuro"}
            title={isDark ? "Mudar para tema claro" : "Mudar para tema escuro"}
            className="icon-btn" style={{
              width: 38, height: 38, borderRadius: 10, border: "1px solid var(--border)",
              background: "var(--surface-alt)", color: "var(--text)", cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
            }}>
            {isDark ? <IconSun size={17} /> : <IconMoon size={17} />}
          </button>

          <button type="button" onClick={() => setCartOpen(true)} aria-label="Abrir carrinho"
            className="icon-btn" style={{
              position: "relative", display: "flex", alignItems: "center", gap: 8, padding: "10px 16px",
              borderRadius: 10, border: "none", background: "var(--accent)", color: "var(--accent-ink)",
              fontWeight: 700, fontSize: 13.5, cursor: "pointer", flexShrink: 0,
            }}>
            <IconBag size={18} /> Cotação
            {cartCount > 0 && (
              <span key={cartCount} className="mono nums badge-pop" style={{
                position: "absolute", top: -7, right: -7, minWidth: 20, height: 20, borderRadius: 999,
                background: "var(--danger)", color: "#fff", fontSize: 11, fontWeight: 700,
                display: "flex", alignItems: "center", justifyContent: "center", padding: "0 5px",
              }}>{cartCount}</span>
            )}
          </button>
        </div>
      </header>

      {/* corpo: sidebar + grid */}
      <main className="gutter" style={{ maxWidth: 1280, margin: "0 auto", padding: "22px 0 60px" }}>
        <div style={{ display: "flex", gap: 28, alignItems: "flex-start" }}>
          <aside style={{
            width: 240, flexShrink: 0, position: "sticky", top: "calc(env(safe-area-inset-top,0px) + 86px)",
            display: window.innerWidth < 860 ? "none" : "block",
          }}>
            <FiltersPanel category={category} setCategory={setCategory}
              priceMin={priceMin} priceMax={priceMax} setPriceMin={setPriceMin} setPriceMax={setPriceMax}
              inStockOnly={inStockOnly} setInStockOnly={setInStockOnly} />
          </aside>

          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, marginBottom: 18, flexWrap: "wrap" }}>
              <div>
                <h1 style={{ margin: 0, fontSize: 21, fontWeight: 700 }}>Catálogo de Produtos</h1>
                <p style={{ margin: "3px 0 0", fontSize: 13, color: "var(--text-muted)" }}>
                  {filtered.length} {filtered.length === 1 ? "produto encontrado" : "produtos encontrados"}
                </p>
              </div>
              <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                <button type="button" onClick={() => setFiltersOpen(true)}
                  style={{
                    display: window.innerWidth < 860 ? "flex" : "none", alignItems: "center", gap: 7,
                    padding: "9px 13px", borderRadius: 9, border: "1px solid var(--border)",
                    background: "var(--surface)", color: "var(--text)", fontSize: 13, fontWeight: 600, cursor: "pointer",
                  }}>
                  <IconSliders size={15} /> Filtros
                </button>
                <div style={{ position: "relative" }}>
                  <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} aria-label="Ordenar por"
                    style={{
                      appearance: "none", padding: "9px 30px 9px 12px", borderRadius: 9, border: "1px solid var(--border)",
                      background: "var(--surface)", color: "var(--text)", fontSize: 13, fontWeight: 500, cursor: "pointer",
                    }}>
                    <option value="relevance">Relevância</option>
                    <option value="price-asc">Menor Preço</option>
                    <option value="price-desc">Maior Preço</option>
                    <option value="name-asc">Nome (A-Z)</option>
                  </select>
                  <IconChevronDown size={13} style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", pointerEvents: "none", color: "var(--text-muted)" }} />
                </div>
              </div>
            </div>

            {filtered.length === 0 ? (
              <div style={{
                display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                gap: 12, padding: "80px 20px", textAlign: "center", color: "var(--text-muted)",
                border: "1px dashed var(--border)", borderRadius: 14,
              }}>
                <IconPackageX size={42} style={{ color: "var(--text-faint)" }} />
                <h3 style={{ margin: 0, fontSize: 16, color: "var(--text)" }}>Nenhum produto encontrado</h3>
                <p style={{ margin: 0, fontSize: 13.5, maxWidth: 320 }}>
                  Tente ajustar a busca, a categoria ou a faixa de preço selecionada.
                </p>
              </div>
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 16 }}>
                {filtered.map((p) => (
                  <ProductCard key={p.id} product={p} onOpen={setQuickView} onQuickAdd={(prod) => addToCart(prod, 1)} />
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* filtros em modal para telas estreitas */}
      {filtersOpen && (
        <div className="scrim-enter gutter" style={{ position: "fixed", inset: 0, background: "var(--overlay)", zIndex: 65, display: "flex", alignItems: "flex-end" }}
          onClick={() => setFiltersOpen(false)}>
          <div className="pop-enter" onClick={(e) => e.stopPropagation()} style={{
            background: "var(--surface)", borderRadius: "16px 16px 0 0", width: "100%", maxHeight: "80vh",
            overflowY: "auto", padding: 22, paddingBottom: "max(22px, env(safe-area-inset-bottom,0px))",
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>Filtros</h3>
              <button type="button" onClick={() => setFiltersOpen(false)} aria-label="Fechar filtros" className="icon-btn" style={{
                width: 30, height: 30, borderRadius: "50%", border: "1px solid var(--border)", background: "var(--surface)",
                color: "var(--text)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer",
              }}><IconX size={14} /></button>
            </div>
            <FiltersPanel category={category} setCategory={setCategory}
              priceMin={priceMin} priceMax={priceMax} setPriceMin={setPriceMin} setPriceMax={setPriceMax}
              inStockOnly={inStockOnly} setInStockOnly={setInStockOnly} />
          </div>
        </div>
      )}

      <QuickViewModal product={quickView} onClose={() => setQuickView(null)} onAdd={addToCart} />
      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} items={cart}
        onQty={updateQty} onRemove={removeFromCart} onFinish={finishQuote} />
      <ConfirmModal data={confirmData} onClose={closeConfirm} />
      <Toast toast={toast} />
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
