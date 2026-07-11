(() => {
  "use strict";

  const ALERTS = [
    {
      id: 1,
      severity: "critical",
      title: "High Vibration Detected",
      location: "Engine Room - Port Side",
      time: "2 min ago",
      detail: "",
    },
    {
      id: 2,
      severity: "warning",
      title: "Engine Temperature High",
      location: "Engine Room - Main Engine",
      time: "5 min ago",
      detail: "",
    },
    {
      id: 3,
      severity: "critical",
      title: "Smoke Detected",
      location: "Cargo Hold - Section 2",
      time: "12 min ago",
      detail: "",
    },
    {
      id: 4,
      severity: "info",
      title: "Ballast Transfer Completed",
      location: "Ballast · Tank 4P → 3S",
      time: "1 h ago",
      detail: "Transfer volume 186 m³ · duration 42 min",
    },
    {
      id: 5,
      severity: "info",
      title: "AIS Voyage Plan Updated",
      location: "Bridge · ECDIS",
      time: "2 h ago",
      detail: "Next waypoint WP-07 · ETA revised +18 min",
    },
    {
      id: 6,
      severity: "warning",
      title: "Smoke Sensor Drift",
      location: "Cargo Hold 2 Forward",
      time: "Yesterday",
      detail: "Calibration offset +4% · schedule check",
    },
  ];

  const VIB_ROWS = [
    ["ME-B Vert", "Z", "4.28", "6.81", "Normal"],
    ["ME-B Horiz", "X", "3.91", "5.40", "Normal"],
    ["AE1 Vert", "Z", "2.14", "3.02", "Normal"],
    ["AE2 Vert", "Z", "2.48", "3.55", "Watch"],
    ["Shaft Mid", "Y", "5.12", "6.80", "Warning"],
    ["Thrust Brg", "Z", "1.88", "2.41", "Normal"],
  ];

  const FIRE_ZONES = [
    ["Engine Room Aft", "Flame + Heat", "41 °C", "Clear"],
    ["Engine Room Fwd", "Flame + Heat", "38 °C", "Clear"],
    ["Cargo Hold 1", "Smoke", "29 °C", "Clear"],
    ["Cargo Hold 2", "Smoke", "30 °C", "Watch"],
    ["Cargo Hold 3", "Smoke", "28 °C", "Clear"],
    ["Accommodation", "Smoke", "24 °C", "Clear"],
    ["Galley", "Heat", "33 °C", "Clear"],
    ["Paint Store", "Flame", "26 °C", "Clear"],
  ];

  const HISTORY = [
    { time: "14:42:08", cls: "bad", title: "EGT alarm raised", body: "Cylinder B3 exceeded warning threshold." },
    { time: "14:31:12", cls: "warn", title: "Vibration band change", body: "Shaft mid bearing entered warning zone." },
    { time: "13:58:40", cls: "ok", title: "Ballast transfer closed", body: "Job WO-1184 completed by 2/E." },
    { time: "12:10:05", cls: "", title: "Noon report submitted", body: "Distance 412 nm · fuel 44.2 t." },
    { time: "10:44:22", cls: "ok", title: "Fire system sweep OK", body: "All 14 detection zones responded." },
    { time: "09:15:00", cls: "", title: "Watch handover", body: "Chief Officer → Second Officer." },
    { time: "07:02:33", cls: "warn", title: "Smoke sensor drift logged", body: "Cargo Hold 2 sensor flagged for calibration." },
    { time: "04:18:50", cls: "ok", title: "AE1 parallel complete", body: "Load shared 48/52 with AE2." },
  ];

  const MAINT = [
    ["WO-2140", "Inspect ME fuel injectors B-bank", "Main Engine", "Today", 65, "High"],
    ["WO-2136", "Calibrate cargo smoke detectors", "Fire Safety", "Tomorrow", 20, "Medium"],
    ["WO-2129", "Replace AE2 vibration sensor pad", "Condition Mon.", "14 Jul", 40, "Medium"],
    ["WO-2121", "Lube oil filter change", "ME Lube", "16 Jul", 0, "Low"],
    ["WO-2114", "Bridge UPS battery test", "Electrical", "18 Jul", 85, "Low"],
  ];

  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

  function iconFor(severity) {
    if (severity === "critical") {
      return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3l9 16H3L12 3z"/><path d="M12 10v4M12 17h.01"/></svg>`;
    }
    if (severity === "warning") {
      return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 9v4M12 17h.01"/><circle cx="12" cy="12" r="9"/></svg>`;
    }
    return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 8v5M12 16h.01"/></svg>`;
  }

  function renderAlerts(target, filter = "all", limit = Infinity) {
    const el = $(target);
    if (!el) return;
    const items = ALERTS.filter((a) => filter === "all" || a.severity === filter).slice(0, limit);
    el.innerHTML = items
      .map(
        (a) => `
      <div class="alert-item" data-severity="${a.severity}">
        <div class="alert-ico ${a.severity}">${iconFor(a.severity)}</div>
        <div class="alert-body">
          <strong>${a.title}</strong>
          <p class="loc">${a.location}</p>
          <p>${a.time}${a.detail ? " · " + a.detail : ""}</p>
        </div>
        <span class="alert-tag ${a.severity}">${a.severity[0].toUpperCase()}${a.severity.slice(1)}</span>
      </div>`
      )
      .join("");
  }

  function deckSvg(mode = "smoke") {
    const alertHold = `
      <g>
        <rect x="148" y="38" width="54" height="44" rx="2" fill="url(#deckHatch)" stroke="#ef4444" stroke-width="1.6"/>
        <circle cx="175" cy="60" r="4.5" fill="#ef4444">
          <animate attributeName="opacity" values="1;0.45;1" dur="1.4s" repeatCount="indefinite"/>
        </circle>
        <circle cx="175" cy="60" r="8" fill="none" stroke="#ef4444" stroke-width="1" opacity="0.45"/>
      </g>`;

    return `
    <svg class="deck-svg" viewBox="0 0 360 120" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg" aria-label="Ship deck zone map">
      <defs>
        <pattern id="deckHatch" width="5" height="5" patternUnits="userSpaceOnUse" patternTransform="rotate(40)">
          <line x1="0" y1="0" x2="0" y2="5" stroke="#ef4444" stroke-width="1.7" opacity="0.9"/>
        </pattern>
      </defs>
      <rect width="360" height="120" fill="#262626"/>
      <path d="M14 60 C26 28, 52 18, 78 18 H282 C312 18, 336 36, 348 60 C336 84, 312 102, 282 102 H78 C52 102, 26 92, 14 60 Z"
            fill="none" stroke="#e8eaed" stroke-width="1.6"/>
      <path d="M34 60 C44 38, 62 32, 82 32 H278 C300 32, 322 42, 336 60 C322 78, 300 88, 278 88 H82 C62 88, 44 82, 34 60 Z"
            fill="none" stroke="#9aa0a6" stroke-width="0.9" opacity="0.85"/>
      <path d="M100 32 V88 M148 32 V88 M202 32 V88 M256 32 V88" stroke="#8b919a" stroke-width="0.85" opacity="0.8"/>
      <path d="M82 60 H278" stroke="#6b7280" stroke-width="0.55" opacity="0.45" stroke-dasharray="3 3"/>
      <rect x="42" y="42" width="40" height="36" rx="2" fill="none" stroke="#c5c9d0" stroke-width="1.1"/>
      <rect x="286" y="44" width="36" height="32" rx="2" fill="none" stroke="#c5c9d0" stroke-width="1.1"/>
      <text x="50" y="64" fill="#b0b5bd" font-size="9" font-family="Inter,sans-serif" font-weight="600">ER</text>
      <text x="112" y="14" fill="#9aa0a6" font-size="8" font-family="Inter,sans-serif" text-anchor="middle">HOLD 1</text>
      <text x="175" y="14" fill="#9aa0a6" font-size="8" font-family="Inter,sans-serif" text-anchor="middle">HOLD 2</text>
      <text x="229" y="14" fill="#9aa0a6" font-size="8" font-family="Inter,sans-serif" text-anchor="middle">HOLD 3</text>
      <text x="296" y="63" fill="#b0b5bd" font-size="9" font-family="Inter,sans-serif" font-weight="600">BR</text>
      <path d="M112 18 V30 M175 18 V30 M229 18 V30" stroke="#6b7280" stroke-width="0.7" stroke-dasharray="2 2"/>
      ${mode === "smoke" || mode === "fire" ? alertHold : ""}
    </svg>`;
  }

  function setDeckMaps(mode) {
    const img =
      mode === "smoke"
        ? 'url("assets/ship-deck-schematic-smoke.png?v=1")'
        : 'url("assets/ship-deck-schematic.png?v=8")';

    ["#deck-map-overview", "#deck-map-full"].forEach((sel) => {
      const el = $(sel);
      if (!el) return;
      el.innerHTML = "";
      el.style.backgroundImage = img;
      el.style.backgroundSize = "contain";
      el.style.backgroundPosition = "center";
      el.style.backgroundRepeat = "no-repeat";
      el.style.backgroundColor = "#141416";
      el.dataset.mode = mode;
    });

    if (mode === "smoke") {
      const s = $("#fire-status-ov");
      if (s) { s.textContent = "Smoke Detected"; s.className = "smoke"; }
      const l = $("#fire-loc-ov");
      if (l) l.textContent = "Cargo Hold - Section 2";
      const t = $("#fire-temp-ov");
      if (t) {
        const row = t.closest(".fire-stat");
        if (row) {
          const lab = row.querySelector("label");
          if (lab) lab.textContent = "Smoke Density";
        }
        t.textContent = "High";
        t.className = "warn";
      }
      const c = $("#fire-conf-ov");
      if (c) c.textContent = "92%";
      const k = $("#kpi-fire");
      if (k) { k.textContent = "Alert"; k.className = "kpi-value"; k.style.color = "#22d3ee"; }
    } else {
      const s = $("#fire-status-ov");
      if (s) { s.textContent = "No Fire Detected"; s.className = "ok"; }
      const l = $("#fire-loc-ov");
      if (l) l.textContent = "—";
      const t = $("#fire-temp-ov");
      if (t) {
        const row = t.closest(".fire-stat");
        if (row) {
          const lab = row.querySelector("label");
          if (lab) lab.textContent = "Temperature";
        }
        t.textContent = "28°C";
        t.className = "";
      }
      const c = $("#fire-conf-ov");
      if (c) c.textContent = "98%";
      const k = $("#kpi-fire");
      if (k) { k.textContent = "Safe"; k.className = "kpi-value ok"; k.style.color = ""; }
    }
  }

  /* Charts */
  class LiveChart {
    constructor(canvas, opts = {}) {
      this.canvas = canvas;
      this.ctx = canvas.getContext("2d");
      this.points = opts.seed || Array.from({ length: 60 }, () => 3 + Math.random() * 2);
      this.threshold = opts.threshold ?? null;
      this.color = opts.color || "#34d399";
      this.maxY = opts.maxY || 12;
      this.dual = opts.dual || null;
      this._raf = null;
      this.resize();
      window.addEventListener("resize", () => this.resize());
    }

    resize() {
      const dpr = window.devicePixelRatio || 1;
      const rect = this.canvas.getBoundingClientRect();
      const w = Math.max(rect.width, 100);
      const h = Math.max(rect.height || 180, 120);
      this.canvas.width = w * dpr;
      this.canvas.height = h * dpr;
      this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      this.w = w;
      this.h = h;
      this.draw();
    }

    push(v) {
      this.points.push(v);
      if (this.points.length > 80) this.points.shift();
      if (this.dual) {
        this.dual.push(v * 0.85 + Math.random());
        if (this.dual.length > 80) this.dual.shift();
      }
      this.draw();
    }

    draw() {
      const { ctx, w, h, points, maxY } = this;
      ctx.clearRect(0, 0, w, h);
      const pad = { t: 12, r: 12, b: 24, l: 36 };
      const pw = w - pad.l - pad.r;
      const ph = h - pad.t - pad.b;

      ctx.strokeStyle = "#4a4a4a";
      ctx.lineWidth = 1;
      for (let i = 0; i <= 4; i++) {
        const y = pad.t + (ph / 4) * i;
        ctx.beginPath();
        ctx.moveTo(pad.l, y);
        ctx.lineTo(pad.l + pw, y);
        ctx.stroke();
        ctx.fillStyle = "#9a9a9a";
        ctx.font = "10px Inter, sans-serif";
        ctx.textAlign = "right";
        ctx.fillText(String(Math.round(maxY - (maxY / 4) * i)), pad.l - 6, y + 3);
      }

      if (this.threshold != null) {
        const ty = pad.t + ph * (1 - this.threshold / maxY);
        ctx.setLineDash([4, 4]);
        ctx.strokeStyle = "#f87171";
        ctx.beginPath();
        ctx.moveTo(pad.l, ty);
        ctx.lineTo(pad.l + pw, ty);
        ctx.stroke();
        ctx.setLineDash([]);
      }

      const drawSeries = (series, color, width = 1.8) => {
        if (!series?.length) return;
        ctx.beginPath();
        series.forEach((v, i) => {
          const x = pad.l + (pw * i) / Math.max(series.length - 1, 1);
          const y = pad.t + ph * (1 - Math.min(v, maxY) / maxY);
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        });
        ctx.strokeStyle = color;
        ctx.lineWidth = width;
        ctx.lineJoin = "round";
        ctx.stroke();
      };

      drawSeries(points, this.color);
      if (this.dual) drawSeries(this.dual, "#3b82f6", 1.4);

      ctx.fillStyle = "#9a9a9a";
      ctx.font = "10px Inter, sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("Time (s)", pad.l + pw / 2, h - 6);
    }
  }

  let vibOverview;
  let vibFull;
  let perfChart;
  let vibSpikeUntil = 0;
  let vibAlertCount = 3;
  let alertIdSeq = ALERTS.length + 1;
  const VIB_THRESHOLD = 8;

  function initCharts() {
    const c1 = $("#vib-chart-overview");
    const c2 = $("#vib-chart-full");
    const c3 = $("#perf-chart");
    if (c1) vibOverview = new LiveChart(c1, { threshold: 8, maxY: 12, color: "#34d399" });
    if (c2) vibFull = new LiveChart(c2, { threshold: 8, maxY: 12, color: "#34d399" });
    if (c3) {
      perfChart = new LiveChart(c3, {
        maxY: 100,
        color: "#34d399",
        dual: Array.from({ length: 60 }, () => 60 + Math.random() * 25),
        seed: Array.from({ length: 60 }, () => 14 + Math.random() * 6),
      });
    }
  }

  function sendTwinView(iframeId, view) {
    const frame = document.getElementById(iframeId);
    if (frame?.contentWindow) {
      frame.contentWindow.postMessage({ view }, "*");
    }
  }

  function showView(name) {
    $$(".view").forEach((v) => v.classList.toggle("active", v.id === `view-${name}`));
    $$(".nav-item").forEach((n) => n.classList.toggle("active", n.dataset.view === name));
    if (name === "vibration" && vibFull) vibFull.resize();
    if (name === "performance" && perfChart) perfChart.resize();
    if (name === "overview" && vibOverview) vibOverview.resize();
    if (name === "twin") {
      const f = $("#full-twin");
      if (f && !f.dataset.loaded) f.dataset.loaded = "1";
    }
  }

  function tickTime() {
    const now = new Date();
    const stamp = now.toLocaleString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    }).replace(",", "");
    const el = $("#sidebar-updated");
    if (el) el.textContent = stamp;
  }

  function liveKpis() {
    const speed = 18.2 + Math.random() * 0.8;
    const load = 74 + Math.random() * 8;
    const fuel = 61.5 + Math.random() * 1.2;
    const temp = 70 + Math.random() * 4;

    const set = (id, val, digits = 1) => {
      const el = $(id);
      if (el) el.textContent = typeof val === "number" ? val.toFixed(digits) : val;
    };
    set("#kpi-speed", speed);
    set("#kpi-load", load, 0);
    set("#kpi-fuel", fuel, 0);
    set("#kpi-temp", temp, 0);
    const lb = $("#kpi-load-bar");
    if (lb) lb.style.width = `${load}%`;
    const fb = $("#kpi-fuel-bar");
    if (fb) fb.style.width = `${fuel}%`;
    const tb = $("#kpi-temp-bar");
    if (tb) tb.style.width = `${((temp - 40) / 60) * 100}%`;

    const spiking = Date.now() < vibSpikeUntil;
    const sample = spiking
      ? VIB_THRESHOLD + 1.2 + Math.random() * 2.4
      : 3.8 + Math.random() * 3.2;

    if (vibOverview) vibOverview.push(sample);
    if (vibFull) vibFull.push(sample + (Math.random() - 0.5) * (spiking ? 0.4 : 1));
    if (perfChart) perfChart.push(14 + Math.random() * 6);

    const peakVal = spiking
      ? Math.max(sample + 0.4 + Math.random() * 0.6, 10.2)
      : Math.max(sample, 6.2 + Math.random());

    const rms = $("#vib-rms");
    if (rms) {
      rms.textContent = sample.toFixed(2);
      rms.style.color = spiking ? "var(--red)" : "";
    }
    const peak = $("#vib-peak");
    if (peak) {
      peak.textContent = peakVal.toFixed(2);
      peak.style.color = spiking ? "var(--red)" : "";
    }

    const ov = $("#ov-vib-overall");
    if (ov) {
      if (spiking) {
        ov.textContent = `${sample.toFixed(1)} mm/s · Critical`;
        ov.className = "bad";
      } else {
        ov.textContent = `${sample.toFixed(1)} mm/s · Normal`;
        ov.className = "ok";
      }
    }
    const op = $("#ov-vib-peak");
    if (op) {
      if (spiking) {
        op.textContent = `${peakVal.toFixed(1)} mm/s · Alarm`;
        op.className = "bad";
      } else {
        const p = Math.max(sample + 1.5, 7.1);
        op.textContent = `${p.toFixed(1)} mm/s · High`;
        op.className = "warn";
      }
    }
    const orms = $("#ov-vib-rms");
    if (orms) orms.textContent = `${(sample * 0.92).toFixed(1)} mm/s`;
    const crest = $("#ov-vib-crest");
    if (crest) crest.textContent = (spiking ? 2.8 + Math.random() * 0.6 : 1.8 + Math.random() * 0.5).toFixed(1);

    const kpiVib = $("#kpi-vib");
    if (kpiVib) {
      if (spiking) {
        kpiVib.textContent = "Critical";
        kpiVib.className = "kpi-value";
        kpiVib.style.color = "var(--red)";
      } else {
        kpiVib.textContent = "Normal";
        kpiVib.className = "kpi-value ok";
        kpiVib.style.color = "";
      }
    }

    const sweep = $("#fire-sweep");
    if (sweep) sweep.textContent = `${Math.floor(8 + Math.random() * 20)}s ago`;
  }

  function dismissToast(el) {
    if (!el || el.classList.contains("leaving")) return;
    el.classList.add("leaving");
    setTimeout(() => el.remove(), 320);
  }

  function showVibrationToast(amplitude) {
    const stack = $("#toast-stack");
    if (!stack) return;

    const now = new Date();
    const timeStr = now.toLocaleTimeString("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });

    const toast = document.createElement("div");
    toast.className = "toast";
    toast.setAttribute("role", "alert");
    toast.innerHTML = `
      <div class="toast-ico">${iconFor("critical")}</div>
      <div class="toast-body">
        <strong>High Vibration Alert</strong>
        <p>Main Engine — Port Side exceeded threshold. Amplitude crossed ${VIB_THRESHOLD.toFixed(1)} mm/s.</p>
        <div class="toast-meta">
          <span>Reading <span class="val">${amplitude.toFixed(1)} mm/s</span></span>
          <span>Threshold <span class="val">${VIB_THRESHOLD.toFixed(1)} mm/s</span></span>
          <span>${timeStr}</span>
        </div>
      </div>
      <button class="toast-close" type="button" aria-label="Dismiss">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg>
      </button>
      <div class="toast-progress"><i></i></div>`;

    toast.querySelector(".toast-close")?.addEventListener("click", () => dismissToast(toast));
    stack.prepend(toast);

    while (stack.children.length > 3) {
      dismissToast(stack.lastElementChild);
    }

    setTimeout(() => dismissToast(toast), 6000);
  }

  function flashSystemStatus() {
    const status = $(".sys-status");
    if (!status) return;
    const label = status.querySelector("span:last-child");
    const prev = label?.textContent;
    status.classList.add("alert-flash");
    if (label) label.textContent = "System Status: Vibration Alarm Active";
    setTimeout(() => {
      status.classList.remove("alert-flash");
      if (label && prev) label.textContent = prev;
    }, 4500);
  }

  function updateAlertBadges() {
    const badge = $("#alert-badge");
    if (badge) badge.textContent = String(Math.min(vibAlertCount, 99));
    const num = $("#notif-btn .num-badge");
    if (num) num.textContent = String(Math.min(vibAlertCount, 99));
    $("#notif-btn")?.classList.add("has-alert");
  }

  function pushVibrationAlert(amplitude) {
    vibAlertCount += 1;
    ALERTS.unshift({
      id: alertIdSeq++,
      severity: "critical",
      title: "High Vibration Detected",
      location: "Engine Room - Port Side",
      time: "Just now",
      detail: `Amplitude ${amplitude.toFixed(1)} mm/s · threshold ${VIB_THRESHOLD.toFixed(1)} mm/s`,
    });
    if (ALERTS.length > 20) ALERTS.pop();

    const activeFilter = $("#alert-filters .chip.active")?.dataset.filter || "all";
    renderAlerts("#overview-alerts", "all", 3);
    renderAlerts("#alerts-full", activeFilter);
    updateAlertBadges();

    HISTORY.unshift({
      time: new Date().toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", second: "2-digit" }),
      cls: "bad",
      title: "Vibration threshold breached",
      body: `ME Port Side amplitude ${amplitude.toFixed(1)} mm/s exceeded ${VIB_THRESHOLD.toFixed(1)} mm/s.`,
    });
    if (HISTORY.length > 12) HISTORY.pop();
    const ht = $("#history-timeline");
    if (ht) {
      ht.innerHTML = HISTORY.map(
        (h) => `
        <div class="tl-item">
          <div class="tl-time">${h.time}</div>
          <div class="tl-dot ${h.cls}"></div>
          <div class="tl-body"><strong>${h.title}</strong><p>${h.body}</p></div>
        </div>`
      ).join("");
    }
  }

  function triggerVibrationSpike() {
    const amplitude = VIB_THRESHOLD + 1.6 + Math.random() * 2.2;
    vibSpikeUntil = Date.now() + 3500;

    if (vibOverview) vibOverview.push(amplitude);
    if (vibFull) vibFull.push(amplitude + (Math.random() - 0.5) * 0.3);

    const ov = $("#ov-vib-overall");
    if (ov) {
      ov.textContent = `${amplitude.toFixed(1)} mm/s · Critical`;
      ov.className = "bad";
    }
    const op = $("#ov-vib-peak");
    if (op) {
      op.textContent = `${(amplitude + 0.5).toFixed(1)} mm/s · Alarm`;
      op.className = "bad";
    }
    const orms = $("#ov-vib-rms");
    if (orms) orms.textContent = `${(amplitude * 0.88).toFixed(1)} mm/s`;
    const rms = $("#vib-rms");
    if (rms) {
      rms.textContent = amplitude.toFixed(2);
      rms.style.color = "var(--red)";
    }
    const peak = $("#vib-peak");
    if (peak) {
      peak.textContent = (amplitude + 0.5).toFixed(2);
      peak.style.color = "var(--red)";
    }

    showVibrationToast(amplitude);
    pushVibrationAlert(amplitude);
    flashSystemStatus();
  }

  function fillTables() {
    const vt = $("#vib-table");
    if (vt) {
      vt.innerHTML = VIB_ROWS.map(([s, a, r, p, st]) => {
        const cls = st === "Warning" ? "warn" : st === "Watch" ? "warn" : "ok";
        return `<tr><td>${s}</td><td>${a}</td><td>${r}</td><td>${p}</td><td><strong class="${cls}">${st}</strong></td><td>Just now</td></tr>`;
      }).join("");
    }

    const fz = $("#fire-zones");
    if (fz) {
      fz.innerHTML = FIRE_ZONES.map(
        ([z, t, temp, st]) =>
          `<tr><td>${z}</td><td>${t}</td><td>${temp}</td><td><strong class="${st === "Clear" ? "ok" : "warn"}">${st}</strong></td></tr>`
      ).join("");
    }

    const ht = $("#history-timeline");
    if (ht) {
      ht.innerHTML = HISTORY.map(
        (h) => `
        <div class="tl-item">
          <div class="tl-time">${h.time}</div>
          <div class="tl-dot ${h.cls}"></div>
          <div class="tl-body"><strong>${h.title}</strong><p>${h.body}</p></div>
        </div>`
      ).join("");
    }

    const mt = $("#maint-table");
    if (mt) {
      mt.innerHTML = MAINT.map(([id, job, sys, due, prog, pri]) => {
        const color = pri === "High" ? "var(--red)" : pri === "Medium" ? "var(--orange)" : "var(--text-2)";
        return `<tr>
          <td>${id}</td><td>${job}</td><td>${sys}</td><td>${due}</td>
          <td><div class="progress-row"><div class="bar"><i style="width:${prog}%"></i></div><span>${prog}%</span></div></td>
          <td style="color:${color};font-weight:600">${pri}</td>
        </tr>`;
      }).join("");
    }
  }

  async function startCamera() {
    const panel = $("#camera-panel");
    if (panel) panel.textContent = "Starting stream…";
    try {
      const res = await fetch("/api/start-stream", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message || "Failed");
      if (panel) {
        panel.innerHTML = `<div style="text-align:center;padding:20px">
          <div style="font-weight:600;color:var(--text);margin-bottom:6px">Stream active</div>
          <div style="font-size:12px;color:var(--text-3);margin-bottom:10px">${data.streamUrl}</div>
          <video id="hls-video" controls muted autoplay playsinline style="width:100%;max-height:180px;background:#000;border-radius:8px"></video>
        </div>`;
        const video = $("#hls-video");
        if (window.Hls && Hls.isSupported()) {
          const hls = new Hls({ enableWorker: true, lowLatencyMode: true });
          hls.loadSource(data.streamUrl);
          hls.attachMedia(video);
        } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = data.streamUrl;
        }
      }
    } catch (err) {
      if (panel) {
        panel.innerHTML = `<div style="text-align:center;padding:24px;color:var(--orange)">
          Could not start camera stream.<br/><span style="color:var(--text-3);font-size:12px">${err.message}. Ensure FFmpeg is installed and RTSP is reachable.</span>
        </div>`;
      }
    }
  }

  async function stopCamera() {
    await fetch("/api/stop-stream", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ streamId: "ship_corner_camera" }),
    }).catch(() => {});
    const panel = $("#camera-panel");
    if (panel) panel.textContent = "Camera idle — press Start Corner Camera to begin stream.";
  }

  function wireEvents() {
    $$(".nav-item").forEach((btn) => {
      btn.addEventListener("click", () => showView(btn.dataset.view));
    });

    $$("[data-goto]").forEach((btn) => {
      btn.addEventListener("click", () => showView(btn.dataset.goto));
    });

    $$(".segmented[data-twin-target]").forEach((seg) => {
      seg.addEventListener("click", (e) => {
        const btn = e.target.closest("button[data-view-cmd]");
        if (!btn) return;
        $$("button", seg).forEach((b) => b.classList.toggle("active", b === btn));
        sendTwinView(seg.dataset.twinTarget, btn.dataset.viewCmd);
      });
    });

    document.addEventListener("click", (e) => {
      const tool = e.target.closest("[data-view-cmd]");
      if (!tool || tool.closest(".segmented")) return;
      const frame = tool.closest(".twin-frame")?.querySelector("iframe");
      if (frame) frame.contentWindow?.postMessage({ view: tool.dataset.viewCmd }, "*");
    });

    ["#fire-seg-overview", "#fire-seg-full"].forEach((sel) => {
      const seg = $(sel);
      if (!seg) return;
      seg.addEventListener("click", (e) => {
        const btn = e.target.closest("button[data-fire-mode]");
        if (!btn) return;
        $$("button", seg).forEach((b) => b.classList.toggle("active", b === btn));
        setDeckMaps(btn.dataset.fireMode);
      });
    });

    const filters = $("#alert-filters");
    if (filters) {
      filters.addEventListener("click", (e) => {
        const chip = e.target.closest(".chip");
        if (!chip) return;
        $$(".chip", filters).forEach((c) => c.classList.toggle("active", c === chip));
        renderAlerts("#alerts-full", chip.dataset.filter);
      });
    }

    $("#notif-btn")?.addEventListener("click", () => showView("alerts"));
    $("#refresh-overview")?.addEventListener("click", () => {
      liveKpis();
      tickTime();
    });

    $("#start-camera")?.addEventListener("click", startCamera);
    $("#stop-camera")?.addEventListener("click", stopCamera);

    $("#vib-export")?.addEventListener("click", () => {
      const rows = ["sensor,axis,rms,peak,status", ...VIB_ROWS.map((r) => r.join(","))];
      const blob = new Blob([rows.join("\n")], { type: "text/csv" });
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = "vibration-channels.csv";
      a.click();
      URL.revokeObjectURL(a.href);
    });

    $("#log-search")?.addEventListener("input", (e) => {
      const q = e.target.value.toLowerCase();
      $$("#history-timeline .tl-item").forEach((item) => {
        item.style.display = item.textContent.toLowerCase().includes(q) ? "" : "none";
      });
    });

    $$("[data-toggle]").forEach((tog) => {
      tog.addEventListener("click", () => tog.classList.toggle("on"));
    });

    $("#save-settings")?.addEventListener("click", () => {
      const btn = $("#save-settings");
      btn.textContent = "Saved";
      setTimeout(() => (btn.textContent = "Save Changes"), 1400);
    });

    $("#new-wo")?.addEventListener("click", () => {
      alert("Work order draft created: WO-" + (2141 + Math.floor(Math.random() * 20)));
    });

    $("#global-search")?.addEventListener("keydown", (e) => {
      if (e.key !== "Enter") return;
      const q = e.target.value.toLowerCase();
      if (q.includes("alert") || q.includes("vib")) showView("alerts");
      else if (q.includes("fire") || q.includes("smoke")) showView("fire");
      else if (q.includes("twin") || q.includes("3d")) showView("twin");
      else if (q.includes("maint")) showView("maintenance");
      else if (q.includes("perf")) showView("performance");
    });

    document.addEventListener("keydown", (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        $("#global-search")?.focus();
      }
    });

    $("#vib-sensor")?.addEventListener("change", () => {
      if (vibFull) {
        vibFull.points = Array.from({ length: 60 }, () => 2 + Math.random() * 4);
        vibFull.draw();
      }
    });

    $("#perf-range")?.addEventListener("change", () => {
      if (perfChart) {
        perfChart.points = Array.from({ length: 60 }, () => 14 + Math.random() * 6);
        perfChart.dual = Array.from({ length: 60 }, () => 60 + Math.random() * 25);
        perfChart.draw();
      }
    });
  }

  function boot() {
    renderAlerts("#overview-alerts", "all", 3);
    renderAlerts("#alerts-full", "all");
    setDeckMaps("smoke");
    fillTables();
    initCharts();
    wireEvents();
    tickTime();
    liveKpis();
    setInterval(tickTime, 30000);
    setInterval(liveKpis, 2000);

    // Exact 15s spacing: first alert after 15s, then every 15s
    const VIB_ALERT_MS = 15000;
    setTimeout(function scheduleVibAlert() {
      triggerVibrationSpike();
      setTimeout(scheduleVibAlert, VIB_ALERT_MS);
    }, VIB_ALERT_MS);

    updateAlertBadges();

    $("#gen-report")?.addEventListener("click", () => {
      const btn = $("#gen-report");
      btn.textContent = "Generating…";
      setTimeout(() => (btn.textContent = "Generate Report"), 1200);
    });
  }

  // Load HLS only when needed for camera tab — inject script lazily
  const hlsScript = document.createElement("script");
  hlsScript.src = "https://cdn.jsdelivr.net/npm/hls.js@latest";
  document.head.appendChild(hlsScript);

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
