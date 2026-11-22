const $ = (s) => document.querySelector(s);
const NS = "http://www.w3.org/2000/svg";
const svgEl = (tag, attrs = {}) => {
  const el = document.createElementNS(NS, tag);
  for (const k in attrs) el.setAttribute(k, attrs[k]);
  return el;
};

// Footer year
$("#year").textContent = new Date().getFullYear();

// ---------- Light / dark mode ----------
$("#themeToggle").addEventListener("click", () => {
  const root = document.documentElement;
  const next = root.getAttribute("data-theme") === "dark" ? "light" : "dark";
  root.setAttribute("data-theme", next);
  try { localStorage.setItem("theme", next); } catch (e) {}
});

// ---------- Nav shadow + active section ----------
const nav = $("#nav");
const navLinks = document.querySelectorAll(".nav-links a");
window.addEventListener("scroll", () => nav.classList.toggle("scrolled", window.scrollY > 10), { passive: true });
const sectionObserver = new IntersectionObserver((entries) => {
  entries.forEach((e) => {
    if (!e.isIntersecting) return;
    navLinks.forEach((a) => a.classList.toggle("active", a.getAttribute("href") === "#" + e.target.id));
  });
}, { rootMargin: "-40% 0px -55% 0px" });
document.querySelectorAll("main section[id]").forEach((s) => sectionObserver.observe(s));

// ---------- Fade-in (also triggers bar / chart animations) ----------
const fadeObserver = new IntersectionObserver((entries) => {
  entries.forEach((e) => {
    if (e.isIntersecting) {
      e.target.classList.add("show");
      e.target.dispatchEvent(new Event("shown"));
      fadeObserver.unobserve(e.target);
    }
  });
}, { threshold: 0.12 });
document.querySelectorAll(".fade").forEach((el) => fadeObserver.observe(el));

// ---------- LeetCode ring ----------
const ring = $("#lcRing");
if (ring) {
  const C = 2 * Math.PI * 50;
  const total = 4123; // all LeetCode problems
  const parts = [
    { v: 571, c: "#14b8a6" },
    { v: 943, c: "#f59e0b" },
    { v: 169, c: "#ef4444" },
  ];
  ring.appendChild(svgEl("circle", { cx: 60, cy: 60, r: 50, stroke: "var(--soft)" }));
  let offset = 0;
  const arcs = parts.map((p) => {
    const len = (p.v / total) * C;
    const arc = svgEl("circle", { cx: 60, cy: 60, r: 50, stroke: p.c, "stroke-dasharray": `0 ${C}`, "stroke-dashoffset": -offset });
    arc.style.transition = "stroke-dasharray 1.4s cubic-bezier(.2,.7,.2,1)";
    arc.dataset.len = Math.max(0, len - 4);
    offset += len;
    ring.appendChild(arc);
    return arc;
  });
  $("#coding").addEventListener("shown", () => {
    arcs.forEach((a) => a.setAttribute("stroke-dasharray", `${a.dataset.len} ${C}`));
  });
}

// ---------- LeetCode topic bars ----------
const topics = [
  ["Hash Table", 393], ["Math", 283], ["Dynamic Programming", 222], ["Greedy", 198], ["DFS", 175],
  ["Trees", 140], ["BFS", 135], ["Binary Search", 117], ["Bit Manipulation", 109], ["Sliding Window", 85],
];
const topicList = $("#topicBars");
if (topicList) {
  const max = topics[0][1];
  topics.forEach(([name, n]) => {
    const li = document.createElement("li");
    li.innerHTML = `<span>${name}</span><div class="bar"><i style="--w:${(n / max) * 100}%"></i></div><b>${n}</b>`;
    topicList.appendChild(li);
  });
}

// ---------- HackerRank stars ----------
document.querySelectorAll(".stars").forEach((el) => {
  const n = +el.dataset.stars, m = +el.dataset.max;
  el.innerHTML = "★".repeat(n) + `<span class="off">${"★".repeat(m - n)}</span>`;
  el.setAttribute("aria-label", `${n} of ${m} stars`);
});

// ---------- Codeforces rating chart ----------
const chart = $("#ratingChart");
const tip = $("#chartTip");
let history = [
  { name: "Round 940 (Div. 2)", t: 1712939700, r: 456 },
  { name: "Round 943 (Div. 3)", t: 1714487700, r: 745 },
  { name: "Round 944 (Div. 4)", t: 1714750500, r: 990 },
  { name: "Round 945 (Div. 2)", t: 1715351700, r: 1170 },
  { name: "Round 946 (Div. 3)", t: 1716215700, r: 1261 },
];
const BANDS = [[0, 1200, "#9ca3af"], [1200, 1400, "#22c55e"], [1400, 1600, "#06b6d4"], [1600, 1900, "#3b82f6"], [1900, 2100, "#a855f7"], [2100, 3000, "#f97316"]];
const W = 560, H = 230, P = { l: 40, r: 14, t: 10, b: 26 };

function drawChart(data) {
  chart.innerHTML = "";
  const defs = svgEl("defs");
  const grad = svgEl("linearGradient", { id: "cfFill", x1: 0, y1: 0, x2: 0, y2: 1 });
  grad.appendChild(svgEl("stop", { offset: "0%", "stop-color": "#3b82f6", "stop-opacity": 0.25 }));
  grad.appendChild(svgEl("stop", { offset: "100%", "stop-color": "#3b82f6", "stop-opacity": 0 }));
  defs.appendChild(grad);
  chart.appendChild(defs);

  const maxR = Math.max(1500, ...data.map((d) => d.r)) + 100;
  const x = (i) => P.l + (data.length < 2 ? (W - P.l - P.r) / 2 : (i / (data.length - 1)) * (W - P.l - P.r));
  const y = (r) => P.t + (1 - r / maxR) * (H - P.t - P.b);

  BANDS.forEach(([a, b, c]) => {
    if (a >= maxR) return;
    const y1 = y(Math.min(b, maxR)), y2 = y(a);
    chart.appendChild(svgEl("rect", { x: P.l, y: y1, width: W - P.l - P.r, height: y2 - y1, fill: c, opacity: 0.08 }));
  });
  [0, 400, 800, 1200, 1400].filter((v) => v < maxR).forEach((v) => {
    chart.appendChild(svgEl("line", { class: "grid-line", x1: P.l, x2: W - P.r, y1: y(v), y2: y(v) }));
    const t = svgEl("text", { class: "axis", x: P.l - 8, y: y(v) + 3, "text-anchor": "end" });
    t.textContent = v;
    chart.appendChild(t);
  });
  const step = Math.ceil(data.length / 6);
  data.forEach((d, i) => {
    if (i % step) return;
    const t = svgEl("text", { class: "axis", x: x(i), y: H - 6, "text-anchor": "middle" });
    t.textContent = new Date(d.t * 1000).toLocaleDateString("en", { month: "short", day: "numeric" });
    chart.appendChild(t);
  });

  const line = data.map((d, i) => `${i ? "L" : "M"}${x(i)},${y(d.r)}`).join(" ");
  chart.appendChild(svgEl("path", { class: "area", d: `${line} L${x(data.length - 1)},${y(0)} L${x(0)},${y(0)} Z` }));
  chart.appendChild(svgEl("path", { class: "line", d: line }));

  data.forEach((d, i) => {
    const c = svgEl("circle", { class: "pt", cx: x(i), cy: y(d.r), r: 4.5, tabindex: 0 });
    const show = () => {
      const delta = d.r - (i ? data[i - 1].r : 0);
      tip.textContent = `${d.name}: ${d.r} (${delta >= 0 ? "+" : ""}${delta})`;
      const box = chart.getBoundingClientRect();
      tip.style.left = (x(i) / W) * box.width + "px";
      tip.style.top = (y(d.r) / H) * box.height + "px";
      tip.hidden = false;
      c.classList.add("on");
    };
    const hide = () => { tip.hidden = true; c.classList.remove("on"); };
    c.addEventListener("mouseenter", show);
    c.addEventListener("focus", show);
    c.addEventListener("mouseleave", hide);
    c.addEventListener("blur", hide);
    chart.appendChild(c);
  });
}
if (chart) drawChart(history);

// Live Codeforces data (falls back to the snapshot above)
Promise.all([
  fetch("https://codeforces.com/api/user.info?handles=anunaysharma12").then((r) => r.json()),
  fetch("https://codeforces.com/api/user.rating?handle=anunaysharma12").then((r) => r.json()),
]).then(([info, rating]) => {
  if (info.status === "OK") {
    const u = info.result[0];
    if (u.maxRating) $("#cfRating").textContent = u.maxRating;
    if (u.rank) $("#cfRank").textContent = u.rank.charAt(0).toUpperCase() + u.rank.slice(1);
  }
  if (rating.status === "OK" && rating.result.length) {
    history = rating.result.map((c) => ({
      name: c.contestName.replace(/^Codeforces /, "").replace(/ and .*$/, ""),
      t: c.ratingUpdateTimeSeconds,
      r: c.newRating,
    }));
    $("#cfContests").textContent = history.length;
    drawChart(history);
  }
}).catch(() => {});

window.addEventListener("resize", () => { if (tip) tip.hidden = true; });
