function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const {
  useState,
  useEffect,
  useMemo,
  useRef
} = React;
const MONTHS = ['Януари', 'Февруари', 'Март', 'Април', 'Май', 'Юни', 'Юли', 'Август', 'Септември', 'Октомври', 'Ноември', 'Декември'];
const WD = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Нд'];
const key = d => d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
const wd = k => (new Date(k + 'T00:00:00').getDay() + 6) % 7;
const rr = (c, x, y, w, h, r) => {
  c.beginPath();
  c.moveTo(x + r, y);
  c.arcTo(x + w, y, x + w, y + h, r);
  c.arcTo(x + w, y + h, x, y + h, r);
  c.arcTo(x, y + h, x, y, r);
  c.arcTo(x, y, x + w, y, r);
  c.closePath();
};
const dd = (a, b) => Math.round((new Date(a + 'T00:00:00') - new Date(b + 'T00:00:00')) / 864e5);
const loadBk = () => {
  try {
    return JSON.parse(localStorage.getItem('dst-bk') || '{}');
  } catch (e) {
    return {};
  }
};
const hex = h => [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16));
const SCALE = ['#cfcfcf', '#ab0000', '#ff5757', '#ff8000', '#ffb300', '#fff178', '#c289fa', '#6fd1fc', '#325ff0', '#6bed9a', '#15803d'];
const dark = c => {
  const [r, g, b] = hex(c);
  return (r * 299 + g * 587 + b * 114) / 1000 < 150;
};
const ICON = {
  cal: '<rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/>',
  list: '<path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"/>',
  chart: '<path d="M3 3v18h18M18 17V9M13 17V5M8 17v-3"/>',
  grid: '<rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>',
  plus: '<path d="M5 12h14M12 5v14"/>',
  trash: '<path d="M3 6h18M19 6l-1 14H6L5 6M10 11v6M14 11v6M9 6V4h6v2"/>',
  check: '<path d="M20 6 9 17l-5-5"/>',
  x: '<path d="M18 6 6 18M6 6l12 12"/>',
  share: '<path d="M4 12v7a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-7M16 6l-4-4-4 4M12 2v13"/>',
  l: '<path d="m15 18-6-6 6-6"/>',
  r: '<path d="m9 18 6-6-6-6"/>'
};
const I = ({
  n,
  s = 20
}) => React.createElement("svg", {
  width: s,
  height: s,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: "2",
  strokeLinecap: "round",
  strokeLinejoin: "round",
  dangerouslySetInnerHTML: {
    __html: ICON[n]
  }
});
const DEF_TASKS = [{
  id: 'a',
  name: 'Спорт',
  w: 30
}, {
  id: 'b',
  name: 'Четене',
  w: 20
}, {
  id: 'c',
  name: 'Работа по проект',
  w: 50
}];
const REST_TASKS = [{
  id: 'r1',
  name: 'Спорт',
  w: 20
}, {
  id: 'r2',
  name: 'Четене',
  w: 20
}, {
  id: 'r3',
  name: 'Разходка',
  w: 20
}, {
  id: 'r4',
  name: 'Филм',
  w: 20
}, {
  id: 'r5',
  name: 'Излизане с приятели',
  w: 20
}];
const DEF = {
  tpls: [{
    id: 't1',
    name: 'Шаблон 1',
    tasks: DEF_TASKS
  }],
  def: 't1',
  days: {},
  done: {},
  notes: {},
  pal: 'green'
};
const norm = raw => {
  const s = {
    ...DEF,
    ...raw
  };
  if (!raw.tpls) {
    const old = raw.tasks || DEF_TASKS;
    s.tpls = [{
      id: 't1',
      name: 'Шаблон 1',
      tasks: old
    }];
    s.def = 't1';
    s.days = {};
    Object.keys(s.done || {}).forEach(k => {
      s.days[k] = {
        tasks: old.map(t => ({
          ...t
        })),
        tpl: 't1'
      };
    });
  }
  if (!s.tpls.some(t => t.id === s.def)) s.def = s.tpls[0].id;
  if (!Array.isArray(raw.wk) || raw.wk.length !== 7) {
    s.tpls = s.tpls.map(t => t.name === 'Шаблон 1' ? {
      ...t,
      name: 'Работни дни'
    } : t);
    let r = s.tpls.find(t => t.name === 'Почивни дни');
    if (!r) {
      r = {
        id: 'trest',
        name: 'Почивни дни',
        tasks: REST_TASKS.map(t => ({
          ...t
        }))
      };
      s.tpls = [...s.tpls, r];
    }
    s.wk = [0, 1, 2, 3, 4].map(() => s.def).concat([r.id, r.id]);
  }
  s.wk = s.wk.map(id => s.tpls.some(t => t.id === id) ? id : s.tpls[0].id);
  delete s.tasks;
  delete s.def;
  return s;
};
const load = () => {
  try {
    return norm(JSON.parse(localStorage.getItem('dst') || '{}'));
  } catch (e) {
    return DEF;
  }
};
const valid = d => !!d && typeof d === 'object' && (Array.isArray(d.tpls) && d.tpls.length > 0 && d.tpls.every(t => t && t.id && Array.isArray(t.tasks)) || !d.tpls && Array.isArray(d.tasks)) && ['done', 'notes', 'days'].every(k => d[k] == null || typeof d[k] === 'object');
const sel = e => {
  const el = e.target;
  setTimeout(() => el.select(), 0);
};
const RING = ' ring-2 ring-[#3B6FD8]';
function Lk({
  className = '',
  all,
  onEnter,
  onBlur,
  ...p
}) {
  const [on, setOn] = useState(false),
    [hint, setHint] = useState(false),
    last = useRef(0),
    ref = useRef(null);
  const L = [],
    R = [];
  className.split(' ').filter(Boolean).forEach(c => (/^(flex-1|min-w-0|w-\d+|w-full|mb-\d+|shrink-0)$/.test(c) ? L : R).push(c));
  const tap = () => {
    if (on) return;
    const n = Date.now(),
      el = ref.current;
    if (n - last.current < 500) {
      last.current = 0;
      setHint(false);
      el.style.pointerEvents = 'auto';
      el.readOnly = false;
      el.tabIndex = 0;
      el.focus();
      const l = el.value.length;
      try {
        all ? el.setSelectionRange(0, l) : el.setSelectionRange(l, l);
      } catch (x) {}
      if (all && el.select) el.select();
      setOn(true);
    } else {
      last.current = n;
      setHint(true);
      setTimeout(() => setHint(false), 500);
    }
  };
  return React.createElement("div", {
    className: L.join(' ') + ' relative',
    onClick: tap,
    style: {
      touchAction: 'manipulation',
      cursor: on ? 'text' : 'pointer',
      WebkitTapHighlightColor: 'transparent'
    }
  }, React.createElement("input", _extends({
    ref: ref
  }, p, {
    readOnly: !on,
    tabIndex: on ? 0 : -1,
    style: {
      pointerEvents: on ? 'auto' : 'none'
    },
    className: 'w-full ' + R.join(' ') + (on ? RING : hint ? ' ring-2 ring-slate-300' : ''),
    onBlur: e => {
      setOn(false);
      if (onBlur) onBlur(e);
    },
    onKeyDown: e => {
      if (e.key === 'Enter') {
        if (onEnter) onEnter();
        e.currentTarget.blur();
      }
    }
  })));
}
function TInput({
  value,
  onChange,
  className,
  label,
  placeholder,
  onEnter
}) {
  return React.createElement(Lk, {
    className: className,
    all: false,
    "aria-label": label,
    placeholder: placeholder,
    value: value,
    onChange: e => onChange(e.target.value),
    onEnter: onEnter
  });
}
function WInput({
  value,
  onCommit,
  className
}) {
  const [t, setT] = useState(String(value));
  useEffect(() => {
    setT(String(value));
  }, [value]);
  return React.createElement(Lk, {
    className: className,
    all: true,
    "aria-label": "\u0422\u0435\u0436\u0435\u0441\u0442",
    type: "text",
    inputMode: "numeric",
    pattern: "[0-9]*",
    value: t,
    onChange: e => {
      const v = e.target.value.replace(/\D/g, '').slice(0, 3);
      setT(v);
      const n = parseInt(v, 10);
      if (n >= 1) onCommit(Math.min(100, n));
    },
    onBlur: () => {
      const n = parseInt(t, 10);
      setT(n >= 1 ? String(Math.min(100, n)) : String(value));
    }
  });
}
function App() {
  const [S, setS] = useState(load);
  const [tab, setTab] = useState('cal');
  const [sheet, setSheet] = useState(null);
  const now = new Date(),
    today = key(now);
  const [cur, setCur] = useState({
    y: now.getFullYear(),
    m: now.getMonth()
  });
  const [year, setYear] = useState(false);
  const [nn, setNn] = useState(''),
    [nw, setNw] = useState(10),
    [dn, setDn] = useState(''),
    [dw, setDw] = useState(10),
    [edit, setEdit] = useState(false),
    [selTpl, setSelTpl] = useState(null),
    [drag, setDrag] = useState(null),
    rows = useRef({}),
    dr = useRef(null),
    [xfer, setXfer] = useState(false),
    [shr, setShr] = useState(false),
    [bk, setBk] = useState(loadBk),
    fileRef = useRef(null);
  useEffect(() => {
    try {
      localStorage.setItem('dst', JSON.stringify(S));
    } catch (e) {}
  }, [S]);
  useEffect(() => {
    if ('serviceWorker' in navigator) navigator.serviceWorker.register('sw.js').catch(() => {});
  }, []);
  useEffect(() => {
    try {
      localStorage.setItem('dst-bk', JSON.stringify(bk));
    } catch (e) {}
  }, [bk]);
  const sync = s => {
    let ch = false;
    const days = {
      ...s.days
    };
    Object.keys(days).forEach(k => {
      const d = days[k];
      if (k < today || d.custom || d.pick) return;
      const id = (s.done[k] || []).length ? d.tpl : s.wk[wd(k)],
        t = s.tpls.find(x => x.id === id);
      if (t && (d.tpl !== id || JSON.stringify(t.tasks) !== JSON.stringify(d.tasks))) {
        days[k] = {
          ...d,
          tpl: id,
          tasks: t.tasks.map(x => ({
            ...x
          }))
        };
        ch = true;
      }
    });
    return ch ? {
      ...s,
      days
    } : s;
  };
  useEffect(() => {
    setS(sync);
  }, [S.tpls, S.wk]);
  const R = SCALE;
  const tplOf = id => S.tpls.find(t => t.id === id) || S.tpls[0];
  const dayTasks = k => S.days[k] && S.days[k].tasks || tplOf(S.wk[wd(k)]).tasks;
  const pct = k => {
    const T = dayTasks(k),
      total = T.reduce((a, t) => a + t.w, 0);
    if (!total) return 0;
    const d = S.done[k] || [];
    return Math.round(T.filter(t => d.includes(t.id)).reduce((a, t) => a + t.w, 0) / total * 1000) / 10;
  };
  const col = k => R[Math.min(10, Math.round(pct(k) / 10))];
  const mat = (s, k) => {
    if (s.days[k]) return s;
    const t = s.tpls.find(x => x.id === s.wk[wd(k)]) || s.tpls[0];
    return {
      ...s,
      days: {
        ...s.days,
        [k]: {
          tasks: t.tasks.map(x => ({
            ...x
          })),
          tpl: t.id
        }
      }
    };
  };
  const toggle = (k, id) => setS(s => {
    s = mat(s, k);
    const d = s.done[k] || [];
    return {
      ...s,
      done: {
        ...s.done,
        [k]: d.includes(id) ? d.filter(x => x !== id) : [...d, id]
      }
    };
  });
  const updDay = (k, fn) => setS(s => {
    s = mat(s, k);
    return {
      ...s,
      days: {
        ...s.days,
        [k]: {
          ...s.days[k],
          tasks: fn(s.days[k].tasks),
          custom: true
        }
      }
    };
  });
  const applyTpl = (k, id) => {
    const t = tplOf(id),
      ids = t.tasks.map(x => x.id);
    if ((S.done[k] || []).some(i => !ids.includes(i)) && !confirm('Отметките за задачи, които ги няма в този шаблон, ще се изгубят. Продължаваш ли?')) return;
    setS(s => ({
      ...s,
      days: {
        ...s.days,
        [k]: {
          tasks: t.tasks.map(x => ({
            ...x
          })),
          tpl: id,
          pick: true
        }
      },
      done: {
        ...s.done,
        [k]: (s.done[k] || []).filter(i => ids.includes(i))
      }
    }));
  };
  const open = k => {
    setEdit(false);
    setSheet(k);
  };
  const exportData = async () => {
    setXfer(false);
    const json = JSON.stringify({
        app: 'dnevenuspeh',
        v: 1,
        exported: new Date().toISOString(),
        data: S
      }, null, 1),
      name = 'dneven-uspeh-' + key(new Date()) + '.json';
    try {
      const f = new File([json], name, {
        type: 'application/json'
      });
      if (matchMedia('(pointer:coarse)').matches && navigator.canShare && navigator.canShare({
        files: [f]
      })) {
        await navigator.share({
          files: [f],
          title: 'Дневен успех'
        });
        setBk(b => ({
          ...b,
          last: today
        }));
        return;
      }
    } catch (e) {
      if (e && e.name === 'AbortError') return;
    }
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([json], {
      type: 'application/json'
    }));
    a.download = name;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 4000);
    setBk(b => ({
      ...b,
      last: today
    }));
  };
  const importFile = async e => {
    const f = e.target.files && e.target.files[0];
    e.target.value = '';
    if (!f) return;
    try {
      const j = JSON.parse(await f.text()),
        d = j && j.app === 'dnevenuspeh' ? j.data : j;
      if (!valid(d)) throw 0;
      if (!confirm('Импортът ще замени всички данни на това устройство. Продължаваш ли?')) return;
      setS(norm(d));
      setXfer(false);
      alert('Данните са импортирани успешно.');
    } catch (err) {
      alert('Файлът не е валиден за „Дневен успех“.');
    }
  };
  const drawShare = kind => {
    const yr = kind === 'y',
      W = 1080,
      H = yr ? 1920 : 1350,
      cv = document.createElement('canvas');
    cv.width = W;
    cv.height = H;
    const c = cv.getContext('2d'),
      F = (w, z) => w + ' ' + z + 'px Manrope, system-ui, sans-serif';
    const keys = yr ? [...Array(12).keys()].flatMap(m => mdays(cur.y, m).filter(Boolean)) : mdays(cur.y, cur.m).filter(Boolean);
    const first = Object.keys(S.done).filter(k => S.done[k].length).sort()[0];
    const used = first ? keys.filter(k => k <= today && k >= first) : [];
    const avg = used.length ? Math.round(used.reduce((a, k) => a + pct(k), 0) / used.length * 10) / 10 : null;
    c.fillStyle = '#EEF2F6';
    c.fillRect(0, 0, W, H);
    c.fillStyle = '#1F3A5F';
    c.fillRect(0, 0, W, 230);
    c.fillStyle = '#fff';
    c.textBaseline = 'alphabetic';
    c.textAlign = 'left';
    c.font = F(800, yr ? 110 : 68);
    c.fillText(yr ? String(cur.y) : MONTHS[cur.m] + ' ' + cur.y, 70, 140);
    c.font = F(600, 36);
    c.fillText('Дневен успех', 70, 196);
    if (avg !== null) {
      c.textAlign = 'right';
      c.font = F(800, 88);
      c.fillText(avg + '%', W - 70, 140);
      c.font = F(600, 36);
      c.fillText('среден успех', W - 70, 196);
    }
    if (!yr) {
      const cell = 122,
        gap = 14,
        x0 = 71;
      c.textAlign = 'center';
      c.textBaseline = 'middle';
      c.font = F(600, 32);
      c.fillStyle = '#64748B';
      WD.forEach((w, i) => c.fillText(w, x0 + i * (cell + gap) + cell / 2, 285));
      mdays(cur.y, cur.m).forEach((k, i) => {
        if (!k) return;
        const x = x0 + i % 7 * (cell + gap),
          y = 325 + Math.floor(i / 7) * (cell + gap),
          bg = col(k);
        c.globalAlpha = k > today ? .4 : 1;
        c.fillStyle = bg;
        rr(c, x, y, cell, cell, 24);
        c.fill();
        c.fillStyle = dark(bg) ? '#fff' : '#16283F';
        c.font = F(800, 46);
        c.fillText(String(+k.slice(8)), x + cell / 2, y + cell / 2 + 2);
        c.globalAlpha = 1;
        if (k === today) {
          c.lineWidth = 7;
          c.strokeStyle = '#1F3A5F';
          rr(c, x - 5, y - 5, cell + 10, cell + 10, 28);
          c.stroke();
        }
      });
    } else {
      const bw = 290,
        cg = 35,
        sq = 38,
        sg = 4,
        x0 = 70;
      [...Array(12).keys()].forEach(m => {
        const bx = x0 + m % 3 * (bw + cg),
          by = 280 + Math.floor(m / 3) * 340;
        c.fillStyle = '#fff';
        rr(c, bx - 10, by - 10, bw + 20, 310, 22);
        c.fill();
        c.textAlign = 'left';
        c.textBaseline = 'alphabetic';
        c.fillStyle = '#16283F';
        c.font = F(800, 30);
        c.fillText(MONTHS[m], bx, by + 26);
        mdays(cur.y, m).forEach((k, i) => {
          if (!k) return;
          const x = bx + i % 7 * (sq + sg),
            y = by + 48 + Math.floor(i / 7) * (sq + sg);
          c.globalAlpha = k > today ? .4 : 1;
          c.fillStyle = col(k);
          rr(c, x, y, sq, sq, 7);
          c.fill();
          c.globalAlpha = 1;
          if (k === today) {
            c.lineWidth = 4;
            c.strokeStyle = '#1F3A5F';
            rr(c, x - 2, y - 2, sq + 4, sq + 4, 9);
            c.stroke();
          }
        });
      });
    }
    const ly = yr ? 1700 : 1190,
      sw = 74,
      sgp = 6,
      lx = (W - (11 * sw + 10 * sgp)) / 2;
    SCALE.forEach((cl, i) => {
      c.fillStyle = cl;
      rr(c, lx + i * (sw + sgp), ly, sw, 34, 8);
      c.fill();
    });
    c.fillStyle = '#64748B';
    c.font = F(600, 26);
    c.textBaseline = 'alphabetic';
    c.textAlign = 'left';
    c.fillText('0%', lx, ly + 68);
    c.textAlign = 'right';
    c.fillText('100%', lx + 11 * sw + 10 * sgp, ly + 68);
    return cv;
  };
  const shareImg = async kind => {
    setShr(false);
    const cv = drawShare(kind),
      b = atob(cv.toDataURL('image/png').split(',')[1]),
      u = new Uint8Array(b.length);
    for (let i = 0; i < b.length; i++) u[i] = b.charCodeAt(i);
    const name = 'dneven-uspeh-' + (kind === 'm' ? cur.y + '-' + String(cur.m + 1).padStart(2, '0') : cur.y) + '.png';
    try {
      const f = new File([u], name, {
        type: 'image/png'
      });
      if (matchMedia('(pointer:coarse)').matches && navigator.canShare && navigator.canShare({
        files: [f]
      })) {
        await navigator.share({
          files: [f],
          title: 'Дневен успех'
        });
        return;
      }
    } catch (e) {
      if (e && e.name === 'AbortError') return;
    }
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([u], {
      type: 'image/png'
    }));
    a.download = name;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 4000);
  };
  const note = (k, v) => setS(s => ({
    ...s,
    notes: {
      ...s.notes,
      [k]: v
    }
  }));
  const Cell = ({
    k,
    label,
    sz = 'aspect-square',
    fs = 'text-xs'
  }) => {
    const fut = k > today,
      c = col(k),
      p = pct(k);
    return React.createElement("button", {
      onClick: () => open(k),
      "aria-label": k + ' ' + p + '%',
      className: `${sz} rounded-lg font-semibold ${fs} flex items-center justify-center ${k === today ? 'ring-2 ring-offset-1 ring-[#1F3A5F]' : ''} ${fut ? 'opacity-40' : ''}`,
      style: {
        background: c,
        color: dark(c) ? '#fff' : '#16283F'
      }
    }, label);
  };
  const mdays = (y, m) => {
    const first = (new Date(y, m, 1).getDay() + 6) % 7,
      n = new Date(y, m + 1, 0).getDate();
    return [...Array(first).fill(null), ...Array.from({
      length: n
    }, (_, i) => key(new Date(y, m, i + 1)))];
  };
  const Legend = () => React.createElement("div", {
    className: "flex items-center gap-1 mt-3"
  }, React.createElement("span", {
    className: "text-[11px] mr-1"
  }, "0%"), R.map((c, i) => React.createElement("span", {
    key: i,
    className: "h-4 flex-1 rounded-sm",
    style: {
      background: c
    }
  })), React.createElement("span", {
    className: "text-[11px] ml-1"
  }, "100%"));
  const shift = d => setCur(c => {
    const t = new Date(c.y, c.m + d, 1);
    return {
      y: t.getFullYear(),
      m: t.getMonth()
    };
  });
  const firstMark = Object.keys(S.done).filter(k => S.done[k].length).sort()[0];
  const showBk = !!firstMark && dd(today, bk.last || firstMark) >= 7 && !(bk.snooze && bk.snooze > today);
  const Banner = () => showBk ? React.createElement("div", {
    className: "mb-3 rounded-2xl border border-amber-200 bg-amber-50 p-3",
    role: "status"
  }, React.createElement("div", {
    className: "font-extrabold text-sm"
  }, "\u0417\u0430\u043F\u0430\u0437\u0438 \u043D\u0430\u043F\u0440\u0435\u0434\u044A\u043A\u0430 \u0441\u0438"), React.createElement("p", {
    className: "text-sm mt-1"
  }, bk.last ? 'Минаха ' + dd(today, bk.last) + ' дни от последното ти резервно копие.' : 'Още нямаш резервно копие.', " \u0417\u0430\u043F\u0430\u0437\u0438 \u0433\u043E \u0441\u0435\u0433\u0430, \u0437\u0430 \u0434\u0430 \u043D\u0435 \u0437\u0430\u0433\u0443\u0431\u0438\u0448 \u0434\u043E\u0441\u0435\u0433\u0430\u0448\u043D\u0438\u044F \u0441\u0438 \u043D\u0430\u043F\u0440\u0435\u0434\u044A\u043A \u2013 \u043E\u0442\u043D\u0435\u043C\u0430 \u0441\u0430\u043C\u043E \u043D\u044F\u043A\u043E\u043B\u043A\u043E \u0441\u0435\u043A\u0443\u043D\u0434\u0438."), React.createElement("div", {
    className: "flex gap-2 mt-2 text-sm font-semibold"
  }, React.createElement("button", {
    onClick: exportData,
    className: "px-3 py-2 rounded-lg bg-[#1F3A5F] text-white"
  }, "\u0417\u0430\u043F\u0430\u0437\u0438 \u043A\u043E\u043F\u0438\u0435"), React.createElement("button", {
    onClick: () => setBk(b => ({
      ...b,
      snooze: key(new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1))
    })),
    className: "px-3 py-2 rounded-lg bg-white"
  }, "\u041F\u043E-\u043A\u044A\u0441\u043D\u043E"))) : null;
  const Calendar = () => {
    return React.createElement("div", null, React.createElement("div", {
      className: "flex flex-wrap items-center justify-between gap-2 mb-3"
    }, React.createElement("div", {
      className: "flex items-center gap-1"
    }, React.createElement("button", {
      className: "p-2",
      onClick: () => year ? setCur({
        ...cur,
        y: cur.y - 1
      }) : shift(-1),
      "aria-label": "\u041D\u0430\u0437\u0430\u0434"
    }, React.createElement(I, {
      n: "l"
    })), React.createElement("h2", {
      className: "text-lg font-extrabold min-w-[9.5rem] text-center"
    }, year ? cur.y : MONTHS[cur.m] + ' ' + cur.y), React.createElement("button", {
      className: "p-2",
      onClick: () => year ? setCur({
        ...cur,
        y: cur.y + 1
      }) : shift(1),
      "aria-label": "\u041D\u0430\u043F\u0440\u0435\u0434"
    }, React.createElement(I, {
      n: "r"
    }))), React.createElement("div", {
      className: "flex items-center gap-2"
    }, React.createElement("div", {
      className: "flex rounded-lg bg-white p-0.5 text-sm font-semibold"
    }, [['Месец', false], ['Година', true]].map(([l, v]) => React.createElement("button", {
      key: l,
      onClick: () => setYear(v),
      className: `px-3 py-1 rounded-md ${year === v ? 'bg-[#1F3A5F] text-white' : ''}`
    }, l))), React.createElement("div", {
      className: "relative"
    }, React.createElement("button", {
      onClick: () => setShr(!shr),
      className: "p-2 rounded-lg bg-white",
      "aria-label": "\u0421\u043F\u043E\u0434\u0435\u043B\u0438 \u043A\u0430\u043B\u0435\u043D\u0434\u0430\u0440\u0430",
      "aria-expanded": shr
    }, React.createElement(I, {
      n: "share"
    })), shr && React.createElement(React.Fragment, null, React.createElement("div", {
      className: "fixed inset-0 z-40",
      onClick: () => setShr(false)
    }), React.createElement("div", {
      className: "absolute right-0 top-full mt-2 z-50 bg-white rounded-xl shadow-xl border border-slate-200 p-2 flex flex-col gap-2 w-44"
    }, React.createElement("button", {
      onClick: () => shareImg('m'),
      className: "px-4 py-2 rounded-lg bg-slate-100 text-sm font-semibold"
    }, "\u0421\u043F\u043E\u0434\u0435\u043B\u0438 \u043C\u0435\u0441\u0435\u0446"), React.createElement("button", {
      onClick: () => shareImg('y'),
      className: "px-4 py-2 rounded-lg bg-[#1F3A5F] text-white text-sm font-semibold"
    }, "\u0421\u043F\u043E\u0434\u0435\u043B\u0438 \u0433\u043E\u0434\u0438\u043D\u0430")))))), !year ? React.createElement("div", {
      className: "bg-white rounded-2xl p-3"
    }, React.createElement("div", {
      className: "grid grid-cols-7 gap-1.5 mb-1.5 text-center text-xs text-slate-500"
    }, WD.map(w => React.createElement("div", {
      key: w
    }, w))), React.createElement("div", {
      className: "grid grid-cols-7 gap-1.5"
    }, mdays(cur.y, cur.m).map((k, i) => k ? React.createElement(Cell, {
      key: k,
      k: k,
      label: +k.slice(8),
      sz: "h-11"
    }) : React.createElement("div", {
      key: i
    })))) : React.createElement("div", {
      className: "grid grid-cols-3 gap-2"
    }, MONTHS.map((n, m) => React.createElement("button", {
      key: m,
      onClick: () => {
        setCur({
          ...cur,
          m
        });
        setYear(false);
      },
      className: "bg-white rounded-xl p-2 text-left"
    }, React.createElement("div", {
      className: "text-xs font-bold mb-1"
    }, n.slice(0, 3)), React.createElement("div", {
      className: "grid grid-cols-7 gap-[2px]"
    }, mdays(cur.y, m).map((k, i) => k ? React.createElement("span", {
      key: k,
      className: `aspect-square rounded-[2px] ${k > today ? 'opacity-40' : ''}`,
      style: {
        background: col(k)
      }
    }) : React.createElement("span", {
      key: i
    })))))), React.createElement(Legend, null));
  };
  const Tpls = () => {
    const tp = S.tpls.find(t => t.id === selTpl) || S.tpls[0],
      tt = tp.tasks.reduce((a, t) => a + t.w, 0);
    const updT = f => setS(s => ({
      ...s,
      tpls: s.tpls.map(t => t.id === tp.id ? f(t) : t)
    }));
    const upd = (id, f) => updT(t => ({
      ...t,
      tasks: t.tasks.map(x => x.id === id ? {
        ...x,
        ...f
      } : x)
    }));
    const add = () => {
      if (!nn.trim()) return;
      updT(t => ({
        ...t,
        tasks: [...t.tasks, {
          id: Date.now().toString(36),
          name: nn.trim(),
          w: Math.min(100, Math.max(1, +nw || 1))
        }]
      }));
      setNn('');
    };
    const newT = copy => {
      const n = prompt('Име на шаблона:', copy ? tp.name + ' (копие)' : 'Нов шаблон');
      if (!n || !n.trim()) return;
      const id = 't' + Date.now().toString(36);
      setS(s => ({
        ...s,
        tpls: [...s.tpls, {
          id,
          name: n.trim(),
          tasks: copy ? tp.tasks.map(x => ({
            ...x
          })) : []
        }]
      }));
      setSelTpl(id);
    };
    const del = () => {
      if (S.tpls.length < 2 || !confirm('Изтриване на шаблон „' + tp.name + '“? Вече отбелязаните дни не се променят.')) return;
      const rest = S.tpls.filter(t => t.id !== tp.id);
      setS(s => ({
        ...s,
        tpls: rest,
        wk: s.wk.map(id => id === tp.id ? rest[0].id : id)
      }));
      setSelTpl(rest[0].id);
    };
    const startDrag = (e, id) => {
      e.preventDefault();
      const ids = tp.tasks.map(t => t.id),
        from = ids.indexOf(id),
        rects = ids.map(i => rows.current[i].getBoundingClientRect());
      dr.current = {
        from,
        rects,
        y0: e.clientY,
        h: rects[from].height + 8,
        to: from
      };
      setDrag({
        id,
        from,
        to: from,
        dy: 0,
        h: dr.current.h
      });
      const mv = ev => {
        const d = dr.current;
        if (!d) return;
        const dy = ev.clientY - d.y0,
          cy = d.rects[d.from].top + d.rects[d.from].height / 2 + dy;
        d.to = d.rects.reduce((n, r, i) => n + (i !== d.from && cy > r.top + r.height / 2 ? 1 : 0), 0);
        setDrag({
          id,
          from: d.from,
          to: d.to,
          dy,
          h: d.h
        });
      };
      const up = () => {
        window.removeEventListener('pointermove', mv);
        window.removeEventListener('pointerup', up);
        window.removeEventListener('pointercancel', up);
        const d = dr.current;
        dr.current = null;
        setDrag(null);
        if (d && d.to !== d.from) updT(t => {
          const a = [...t.tasks],
            [x] = a.splice(a.findIndex(z => z.id === id), 1);
          a.splice(d.to, 0, x);
          return {
            ...t,
            tasks: a
          };
        });
      };
      window.addEventListener('pointermove', mv);
      window.addEventListener('pointerup', up);
      window.addEventListener('pointercancel', up);
    };
    const moveBy = (id, dir) => updT(t => {
      const a = [...t.tasks],
        i = a.findIndex(z => z.id === id),
        j = i + dir;
      if (j < 0 || j >= a.length) return t;
      [a[i], a[j]] = [a[j], a[i]];
      return {
        ...t,
        tasks: a
      };
    });
    const tf = (i, id) => {
      if (!drag) return undefined;
      if (id === drag.id) return {
        transform: `translateY(${drag.dy}px)`,
        zIndex: 20,
        boxShadow: '0 8px 20px rgba(22,40,63,.25)'
      };
      const {
          from,
          to,
          h
        } = drag,
        sh = from < to && i > from && i <= to ? -h : from > to && i >= to && i < from ? h : 0;
      return {
        transform: `translateY(${sh}px)`,
        transition: 'transform .15s'
      };
    };
    return React.createElement("div", null, React.createElement("h2", {
      className: "text-lg font-extrabold mb-1"
    }, "\u0428\u0430\u0431\u043B\u043E\u043D\u0438"), React.createElement("p", {
      className: "text-sm text-slate-600 mb-3"
    }, "\u0412\u0441\u0435\u043A\u0438 \u0434\u0435\u043D \u043E\u0442 \u0441\u0435\u0434\u043C\u0438\u0446\u0430\u0442\u0430 \u0438\u043C\u0430 \u0448\u0430\u0431\u043B\u043E\u043D, \u043A\u043E\u0439\u0442\u043E \u0441\u0435 \u0437\u0430\u0440\u0435\u0436\u0434\u0430 \u0430\u0432\u0442\u043E\u043C\u0430\u0442\u0438\u0447\u043D\u043E. \u041C\u0438\u043D\u0430\u043B\u0438 \u0434\u043D\u0438 \u043D\u0435 \u0441\u0435 \u043F\u0440\u043E\u043C\u0435\u043D\u044F\u0442."), React.createElement("div", {
      className: "flex flex-wrap gap-2 mb-3"
    }, S.tpls.map(t => React.createElement("button", {
      key: t.id,
      onClick: () => setSelTpl(t.id),
      className: `px-3 py-1.5 rounded-full text-sm font-semibold ${t.id === tp.id ? 'bg-[#1F3A5F] text-white' : 'bg-white'}`
    }, t.name)), React.createElement("button", {
      onClick: () => newT(false),
      className: "px-3 py-1.5 rounded-full text-sm font-semibold bg-white"
    }, "+ \u041D\u043E\u0432")), React.createElement(TInput, {
      value: tp.name,
      onChange: v => updT(t => ({
        ...t,
        name: v
      })),
      className: "w-full px-3 py-2 rounded-lg bg-white font-bold mb-2",
      label: "\u0418\u043C\u0435 \u043D\u0430 \u0448\u0430\u0431\u043B\u043E\u043D\u0430"
    }), React.createElement("p", {
      className: `text-sm mb-3 ${tt === 100 ? 'text-emerald-700' : 'text-amber-700'}`
    }, "\u0421\u0443\u043C\u0430 \u043D\u0430 \u0442\u0435\u0436\u0435\u0441\u0442\u0438\u0442\u0435: ", tt, "%", tt !== 100 && ' — за точен резултат направи сумата 100%; иначе процентът се нормализира.'), React.createElement("div", {
      className: "space-y-2"
    }, tp.tasks.map((t, i) => React.createElement("div", {
      key: t.id,
      ref: el => {
        rows.current[t.id] = el;
      },
      style: tf(i, t.id),
      className: "relative bg-white rounded-xl p-2 flex items-center gap-1"
    }, React.createElement("button", {
      onPointerDown: e => startDrag(e, t.id),
      onKeyDown: e => {
        if (e.key === 'ArrowUp') {
          e.preventDefault();
          moveBy(t.id, -1);
        }
        if (e.key === 'ArrowDown') {
          e.preventDefault();
          moveBy(t.id, 1);
        }
      },
      className: "shrink-0 p-1.5 cursor-grab select-none",
      style: {
        touchAction: 'none'
      },
      "aria-label": "\u0417\u0430\u0434\u0440\u044A\u0436 \u0438 \u043F\u0440\u0435\u043C\u0435\u0441\u0442\u0438 \u0440\u0435\u0434\u0430 \u043D\u0430\u0433\u043E\u0440\u0435 \u0438\u043B\u0438 \u043D\u0430\u0434\u043E\u043B\u0443"
    }, React.createElement("span", {
      className: "w-5 h-5 rounded border-2 border-slate-400 text-slate-500 flex items-center justify-center"
    }, React.createElement(I, {
      n: "plus",
      s: 12
    }))), React.createElement(TInput, {
      value: t.name,
      onChange: v => upd(t.id, {
        name: v
      }),
      className: "flex-1 min-w-0 px-2 py-2 rounded-lg bg-slate-100",
      label: "\u0418\u043C\u0435"
    }), React.createElement(WInput, {
      value: t.w,
      onCommit: w => upd(t.id, {
        w
      }),
      className: "w-16 px-2 py-2 rounded-lg bg-slate-100 text-center"
    }), React.createElement("span", {
      className: "text-sm"
    }, "%"), React.createElement("button", {
      className: "p-2 text-red-600",
      "aria-label": "\u0418\u0437\u0442\u0440\u0438\u0439",
      onClick: () => confirm('Изтриване на „' + t.name + '“?') && updT(x => ({
        ...x,
        tasks: x.tasks.filter(y => y.id !== t.id)
      }))
    }, React.createElement(I, {
      n: "trash"
    }))))), React.createElement("div", {
      className: "bg-white rounded-xl p-2 flex items-center gap-2 mt-3"
    }, React.createElement(TInput, {
      value: nn,
      onChange: setNn,
      onEnter: add,
      placeholder: "\u041D\u043E\u0432\u0430 \u0437\u0430\u0434\u0430\u0447\u0430",
      className: "flex-1 min-w-0 px-2 py-2 rounded-lg bg-slate-100",
      label: "\u041D\u043E\u0432\u0430 \u0437\u0430\u0434\u0430\u0447\u0430"
    }), React.createElement(WInput, {
      value: nw,
      onCommit: setNw,
      className: "w-16 px-2 py-2 rounded-lg bg-slate-100 text-center"
    }), React.createElement("span", {
      className: "text-sm"
    }, "%"), React.createElement("button", {
      onClick: add,
      className: "p-2 rounded-lg bg-[#1F3A5F] text-white",
      "aria-label": "\u0414\u043E\u0431\u0430\u0432\u0438"
    }, React.createElement(I, {
      n: "plus"
    }))), React.createElement("div", {
      className: "mt-4"
    }, React.createElement("div", {
      className: "text-sm font-bold mb-1"
    }, "\u0417\u0430\u0440\u0435\u0436\u0434\u0430 \u0441\u0435 \u0430\u0432\u0442\u043E\u043C\u0430\u0442\u0438\u0447\u043D\u043E \u0432:"), React.createElement("div", {
      className: "grid grid-cols-7 gap-1"
    }, WD.map((w, i) => {
      const on = S.wk[i] === tp.id;
      return React.createElement("button", {
        key: w,
        onClick: () => setS(s => ({
          ...s,
          wk: s.wk.map((x, j) => j === i ? tp.id : x)
        })),
        "aria-pressed": on,
        className: `py-2 rounded-lg text-sm font-semibold ${on ? 'bg-[#1F3A5F] text-white' : 'bg-white text-slate-500'}`
      }, w);
    })), React.createElement("p", {
      className: "text-xs text-slate-500 mt-1"
    }, "\u0412\u0441\u0435\u043A\u0438 \u0434\u0435\u043D \u0438\u043C\u0430 \u0435\u0434\u0438\u043D \u0448\u0430\u0431\u043B\u043E\u043D. \u0410\u043A\u043E \u043D\u0430\u0442\u0438\u0441\u043D\u0435\u0448 \u0434\u0435\u043D, \u043A\u043E\u0439\u0442\u043E \u0435 \u043D\u0430 \u0434\u0440\u0443\u0433 \u0448\u0430\u0431\u043B\u043E\u043D, \u0442\u043E\u0439 \u0441\u0435 \u043F\u0440\u0435\u043C\u0435\u0441\u0442\u0432\u0430 \u0442\u0443\u043A.")), React.createElement("div", {
      className: "flex flex-wrap gap-2 mt-4 text-sm font-semibold"
    }, React.createElement("button", {
      onClick: () => newT(true),
      className: "px-3 py-2 rounded-lg bg-white"
    }, "\u0414\u0443\u0431\u043B\u0438\u0440\u0430\u0439"), React.createElement("button", {
      disabled: S.tpls.length < 2,
      onClick: del,
      className: "px-3 py-2 rounded-lg bg-white text-red-600 disabled:opacity-40"
    }, "\u0418\u0437\u0442\u0440\u0438\u0439")));
  };
  const Stats = () => {
    const days = n => Array.from({
      length: n
    }, (_, i) => key(new Date(now.getFullYear(), now.getMonth(), now.getDate() - (n - 1 - i))));
    const avg = a => a.length ? Math.round(a.reduce((x, k) => x + pct(k), 0) / a.length * 10) / 10 : 0;
    const wk = days(7),
      mo = days(now.getDate()).map((_, i) => key(new Date(now.getFullYear(), now.getMonth(), i + 1)));
    const by = Array.from({
      length: 7
    }, () => []);
    days(90).forEach(k => {
      const d = new Date(k + 'T00:00:00');
      by[(d.getDay() + 6) % 7].push(k);
    });
    const wa = by.map(avg),
      best = wa.indexOf(Math.max(...wa));
    const Box = ({
      t,
      v
    }) => React.createElement("div", {
      className: "bg-white rounded-xl p-3 flex-1"
    }, React.createElement("div", {
      className: "text-xs text-slate-500"
    }, t), React.createElement("div", {
      className: "text-2xl font-extrabold"
    }, v, "%"));
    return React.createElement("div", {
      className: "space-y-3"
    }, React.createElement("h2", {
      className: "text-lg font-extrabold"
    }, "\u0421\u0442\u0430\u0442\u0438\u0441\u0442\u0438\u043A\u0438"), React.createElement("div", {
      className: "flex gap-2"
    }, React.createElement(Box, {
      t: "\u041F\u043E\u0441\u043B\u0435\u0434\u043D\u0438\u0442\u0435 7 \u0434\u043D\u0438",
      v: avg(wk)
    }), React.createElement(Box, {
      t: "\u0422\u043E\u0437\u0438 \u043C\u0435\u0441\u0435\u0446",
      v: avg(mo)
    })), React.createElement("div", {
      className: "bg-white rounded-xl p-3"
    }, React.createElement("div", {
      className: "text-sm font-bold mb-2"
    }, "\u041F\u043E\u0441\u043B\u0435\u0434\u043D\u0438\u0442\u0435 14 \u0434\u043D\u0438"), React.createElement("div", {
      className: "flex items-end gap-1 h-28"
    }, days(14).map(k => React.createElement("div", {
      key: k,
      className: "flex-1 flex flex-col justify-end h-full",
      title: k
    }, React.createElement("div", {
      className: "rounded-t",
      style: {
        height: Math.max(pct(k), 2) + '%',
        background: col(k)
      }
    }))))), React.createElement("div", {
      className: "bg-white rounded-xl p-3"
    }, React.createElement("div", {
      className: "text-sm font-bold mb-2"
    }, "\u0421\u0440\u0435\u0434\u043D\u043E \u043F\u043E \u0434\u043D\u0438 \u043E\u0442 \u0441\u0435\u0434\u043C\u0438\u0446\u0430\u0442\u0430 (90 \u0434\u043D\u0438)"), React.createElement("div", {
      className: "flex items-end gap-2 h-28"
    }, wa.map((v, i) => React.createElement("div", {
      key: i,
      className: "flex-1 flex flex-col justify-end items-center h-full"
    }, React.createElement("span", {
      className: "text-[10px]"
    }, Math.round(v)), React.createElement("div", {
      className: `w-full rounded-t ${i === best ? 'bg-[#1F3A5F]' : 'bg-slate-300'}`,
      style: {
        height: Math.max(v, 2) + '%'
      }
    }), React.createElement("span", {
      className: "text-xs mt-1"
    }, WD[i])))), React.createElement("p", {
      className: "text-sm mt-2"
    }, "\u041D\u0430\u0439-\u043F\u0440\u043E\u0434\u0443\u043A\u0442\u0438\u0432\u0435\u043D \u0434\u0435\u043D: ", React.createElement("b", null, WD[best]), " (", Math.round(wa[best]), "%)")), React.createElement("div", {
      className: "relative"
    }, React.createElement("button", {
      onClick: () => setXfer(!xfer),
      className: "w-full bg-white rounded-xl p-3 flex items-center justify-between text-left font-bold",
      "aria-expanded": xfer
    }, "\u041F\u0440\u0435\u0445\u0432\u044A\u0440\u043B\u044F\u043D\u0435 \u043D\u0430 \u0434\u0430\u043D\u043D\u0438", React.createElement(I, {
      n: "r"
    })), xfer && React.createElement(React.Fragment, null, React.createElement("div", {
      className: "fixed inset-0 z-40",
      onClick: () => setXfer(false)
    }), React.createElement("div", {
      className: "absolute right-0 top-full mt-2 z-50 bg-white rounded-xl shadow-xl border border-slate-200 p-2 flex gap-2"
    }, React.createElement("button", {
      onClick: () => fileRef.current && fileRef.current.click(),
      className: "px-4 py-2 rounded-lg bg-slate-100 text-sm font-semibold"
    }, "\u0418\u043C\u043F\u043E\u0440\u0442"), React.createElement("button", {
      onClick: exportData,
      className: "px-4 py-2 rounded-lg bg-[#1F3A5F] text-white text-sm font-semibold"
    }, "\u0415\u043A\u0441\u043F\u043E\u0440\u0442"))), React.createElement("input", {
      ref: fileRef,
      type: "file",
      accept: ".json,application/json,text/plain",
      className: "hidden",
      onChange: importFile
    }), React.createElement("p", {
      className: "text-xs text-slate-500 mt-2 px-1"
    }, bk.last ? 'Последно резервно копие: ' + bk.last.split('-').reverse().join('.') : 'Още няма резервно копие.')));
  };
  const Sheet = () => {
    const k = sheet,
      p = pct(k),
      d = S.done[k] || [],
      dt = new Date(k + 'T00:00:00'),
      T = dayTasks(k),
      tot = T.reduce((a, t) => a + t.w, 0),
      cur = S.days[k] ? S.days[k].tpl : S.wk[wd(k)];
    const close = () => {
      setSheet(null);
      setEdit(false);
    };
    const addD = () => {
      if (!dn.trim()) return;
      updDay(k, a => [...a, {
        id: Date.now().toString(36),
        name: dn.trim(),
        w: Math.min(100, Math.max(1, +dw || 1))
      }]);
      setDn('');
    };
    const saveT = () => {
      const n = prompt('Име на новия шаблон:');
      if (!n || !n.trim()) return;
      setS(s => ({
        ...s,
        tpls: [...s.tpls, {
          id: 't' + Date.now().toString(36),
          name: n.trim(),
          tasks: T.map(x => ({
            ...x
          }))
        }]
      }));
    };
    const chg = (id, f) => updDay(k, a => a.map(x => x.id === id ? {
      ...x,
      ...f
    } : x));
    return React.createElement("div", {
      className: "fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40",
      onClick: close
    }, React.createElement("div", {
      className: "sheet bg-white w-full max-w-md rounded-t-3xl sm:rounded-3xl p-4 max-h-[90dvh] overflow-y-auto",
      style: {
        paddingBottom: 'calc(1rem + env(safe-area-inset-bottom))'
      },
      onClick: e => e.stopPropagation()
    }, React.createElement("div", {
      className: "flex items-center justify-between mb-2"
    }, React.createElement("div", null, React.createElement("div", {
      className: "font-extrabold"
    }, dt.getDate(), " ", MONTHS[dt.getMonth()], " ", dt.getFullYear()), React.createElement("div", {
      className: "text-xs text-slate-500"
    }, WD[(dt.getDay() + 6) % 7])), React.createElement("div", {
      className: "flex items-center gap-3"
    }, React.createElement("span", {
      className: "px-3 py-1 rounded-full font-extrabold",
      style: {
        background: col(k),
        color: dark(col(k)) ? '#fff' : '#16283F'
      }
    }, p, "%"), React.createElement("button", {
      onClick: close,
      className: "p-2",
      "aria-label": "\u0417\u0430\u0442\u0432\u043E\u0440\u0438"
    }, React.createElement(I, {
      n: "x"
    })))), React.createElement("label", {
      className: "flex items-center gap-2 text-sm"
    }, React.createElement("span", {
      className: "text-slate-500"
    }, "\u0428\u0430\u0431\u043B\u043E\u043D:"), React.createElement("select", {
      value: cur,
      onChange: e => applyTpl(k, e.target.value),
      className: "flex-1 min-w-0 px-2 py-2 rounded-lg bg-slate-100"
    }, S.tpls.map(t => React.createElement("option", {
      key: t.id,
      value: t.id
    }, t.name)))), !edit ? React.createElement("div", {
      className: "space-y-2 my-3"
    }, T.length === 0 && React.createElement("p", {
      className: "text-sm text-slate-500"
    }, "\u041D\u044F\u043C\u0430 \u0437\u0430\u0434\u0430\u0447\u0438 \u0437\u0430 \u0442\u043E\u0437\u0438 \u0434\u0435\u043D. \u0418\u0437\u0431\u0435\u0440\u0438 \u0448\u0430\u0431\u043B\u043E\u043D \u0438\u043B\u0438 \u043D\u0430\u0442\u0438\u0441\u043D\u0438 \u201E\u0420\u0435\u0434\u0430\u043A\u0442\u0438\u0440\u0430\u0439 \u0434\u0435\u043D\u044F\u201C."), T.map(t => {
      const on = d.includes(t.id);
      return React.createElement("button", {
        key: t.id,
        onClick: () => toggle(k, t.id),
        className: `w-full flex items-center gap-3 p-3 rounded-xl text-left ${on ? 'bg-emerald-50' : 'bg-slate-100'}`
      }, React.createElement("span", {
        className: `w-6 h-6 rounded-md flex items-center justify-center border-2 ${on ? 'bg-emerald-600 border-emerald-600 text-white' : 'border-slate-400'}`
      }, on && React.createElement(I, {
        n: "check",
        s: 16
      })), React.createElement("span", {
        className: `flex-1 ${on ? 'line-through text-slate-500' : ''}`
      }, t.name), React.createElement("span", {
        className: "text-sm text-slate-500"
      }, t.w, "%"));
    })) : React.createElement("div", {
      className: "my-3"
    }, React.createElement("div", {
      className: "space-y-2"
    }, T.map(t => React.createElement("div", {
      key: t.id,
      className: "bg-slate-100 rounded-xl p-2 flex items-center gap-2"
    }, React.createElement(TInput, {
      value: t.name,
      onChange: v => chg(t.id, {
        name: v
      }),
      className: "flex-1 min-w-0 px-2 py-2 rounded-lg bg-white",
      label: "\u0418\u043C\u0435"
    }), React.createElement(WInput, {
      value: t.w,
      onCommit: w => chg(t.id, {
        w
      }),
      className: "w-16 px-2 py-2 rounded-lg bg-white text-center"
    }), React.createElement("span", {
      className: "text-sm"
    }, "%"), React.createElement("button", {
      className: "p-2 text-red-600",
      "aria-label": "\u0418\u0437\u0442\u0440\u0438\u0439",
      onClick: () => updDay(k, a => a.filter(x => x.id !== t.id))
    }, React.createElement(I, {
      n: "trash"
    }))))), React.createElement("div", {
      className: "bg-slate-100 rounded-xl p-2 flex items-center gap-2 mt-2"
    }, React.createElement(TInput, {
      value: dn,
      onChange: setDn,
      onEnter: addD,
      placeholder: "\u041D\u043E\u0432\u0430 \u0437\u0430\u0434\u0430\u0447\u0430 \u0437\u0430 \u0434\u0435\u043D\u044F",
      className: "flex-1 min-w-0 px-2 py-2 rounded-lg bg-white",
      label: "\u041D\u043E\u0432\u0430 \u0437\u0430\u0434\u0430\u0447\u0430 \u0437\u0430 \u0434\u0435\u043D\u044F"
    }), React.createElement(WInput, {
      value: dw,
      onCommit: setDw,
      className: "w-16 px-2 py-2 rounded-lg bg-white text-center"
    }), React.createElement("span", {
      className: "text-sm"
    }, "%"), React.createElement("button", {
      onClick: addD,
      className: "p-2 rounded-lg bg-[#1F3A5F] text-white",
      "aria-label": "\u0414\u043E\u0431\u0430\u0432\u0438"
    }, React.createElement(I, {
      n: "plus"
    }))), React.createElement("p", {
      className: `text-xs mt-2 ${tot === 100 ? 'text-emerald-700' : 'text-amber-700'}`
    }, "\u0421\u0443\u043C\u0430 \u043D\u0430 \u0442\u0435\u0436\u0435\u0441\u0442\u0438\u0442\u0435: ", tot, "%", tot !== 100 && ' — процентът се нормализира.')), React.createElement("div", {
      className: "flex gap-2 mb-3 text-sm font-semibold"
    }, React.createElement("button", {
      onClick: () => setEdit(!edit),
      className: "flex-1 py-2 rounded-xl bg-slate-100"
    }, edit ? 'Готово' : 'Редактирай деня'), React.createElement("button", {
      onClick: saveT,
      className: "flex-1 py-2 rounded-xl bg-slate-100"
    }, "\u0417\u0430\u043F\u0430\u0437\u0438 \u043A\u0430\u0442\u043E \u0448\u0430\u0431\u043B\u043E\u043D")), React.createElement("textarea", {
      value: S.notes[k] || '',
      onChange: e => note(k, e.target.value),
      rows: "3",
      placeholder: "\u0411\u0435\u043B\u0435\u0436\u043A\u0430 \u0437\u0430 \u0434\u0435\u043D\u044F \u2013 \u043A\u0430\u043A \u043C\u0438\u043D\u0430?",
      className: "w-full p-3 rounded-xl bg-slate-100 text-sm"
    })));
  };
  const TABS = [['cal', 'Календар', 'cal'], ['tpl', 'Шаблони', 'list'], ['stats', 'Статистики', 'chart']];
  return React.createElement("div", {
    className: "w-full max-w-md mx-auto min-h-[100dvh] pb-28 px-3 pt-4"
  }, Banner(), tab === 'cal' && Calendar(), tab === 'tpl' && Tpls(), tab === 'stats' && Stats(), tab === 'cal' && React.createElement("button", {
    onClick: () => open(today),
    className: "fixed right-4 bottom-24 w-14 h-14 rounded-full bg-[#1F3A5F] text-white shadow-xl flex items-center justify-center",
    style: {
      marginBottom: 'env(safe-area-inset-bottom)'
    },
    "aria-label": "\u041E\u0442\u043C\u0435\u0442\u043D\u0438 \u0434\u043D\u0435\u0441"
  }, React.createElement(I, {
    n: "check",
    s: 26
  })), React.createElement("nav", {
    className: "fixed bottom-0 inset-x-0 bg-white border-t border-slate-200",
    style: {
      paddingBottom: 'env(safe-area-inset-bottom)'
    }
  }, React.createElement("div", {
    className: "max-w-md mx-auto grid grid-cols-3"
  }, TABS.map(([id, l, ic]) => React.createElement("button", {
    key: id,
    onClick: () => setTab(id),
    className: `py-2.5 flex flex-col items-center text-xs font-semibold ${tab === id ? 'text-[#1F3A5F]' : 'text-slate-400'}`
  }, React.createElement(I, {
    n: ic
  }), l)))), sheet && Sheet());
}
ReactDOM.createRoot(document.getElementById('root')).render(React.createElement(App, null));