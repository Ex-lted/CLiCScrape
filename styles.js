// styles.js: panel CSS (applied inside the Shadow DOM, so CLiC's CSS cannot touch it).
export const CSS = `
:host{all:initial}
*{box-sizing:border-box;font-family:system-ui,-apple-system,"Segoe UI",Roboto,sans-serif}
.panel{--bg:#fff;--fg:#111827;--mut:#6b7280;--line:#e5e7eb;--acc:#4f46e5;--accfg:#fff;--soft:#eef2ff;
 --ok:#166534;--okbg:#dcfce7;--err:#991b1b;--errbg:#fee2e2;--info:#1e40af;--infobg:#dbeafe;
 width:390px;max-height:80vh;display:flex;flex-direction:column;background:var(--bg);color:var(--fg);
 border:1px solid var(--line);border-radius:14px;box-shadow:0 10px 30px rgba(0,0,0,.25);font-size:13px;line-height:1.35;overflow:hidden}
@media (prefers-color-scheme:dark){.panel{--bg:#111827;--fg:#f3f4f6;--mut:#9ca3af;--line:#374151;--soft:#1e1b4b;
 --ok:#bbf7d0;--okbg:#14532d;--err:#fecaca;--errbg:#7f1d1d;--info:#bfdbfe;--infobg:#1e3a8a}}
button{cursor:pointer;font:inherit}
header{display:flex;align-items:center;gap:8px;padding:10px 12px;border-bottom:1px solid var(--line)}
header .t{font-weight:700;font-size:14px}
header .s{color:var(--mut);font-size:11px}
header .sp{flex:1}
.iconbtn{border:0;background:transparent;color:var(--mut);font-size:18px;line-height:1;padding:2px 8px;border-radius:6px}
.iconbtn:hover{background:var(--soft)}
.tabs{display:flex;border-bottom:1px solid var(--line)}
.tabs button{flex:1;border:0;background:transparent;color:var(--mut);padding:8px 4px;font-weight:600;border-bottom:2px solid transparent}
.tabs button.on{color:var(--acc);border-bottom-color:var(--acc)}
.body{padding:12px;overflow:auto;flex:1;min-height:120px}
.foot{padding:10px 12px;border-top:1px solid var(--line);display:flex;flex-direction:column;gap:8px}
.primary{background:var(--acc);color:var(--accfg);border:0;border-radius:8px;padding:8px 12px;font-weight:600}
.primary:disabled{opacity:.45;cursor:not-allowed}
.ghost{background:transparent;border:1px solid var(--line);color:var(--fg);border-radius:6px;padding:2px 8px;font-size:11px}
.pill{display:flex;align-items:center;gap:8px;background:var(--acc,#4f46e5);color:#fff;border:0;border-radius:999px;padding:10px 16px;font-weight:700;box-shadow:0 6px 18px rgba(0,0,0,.3)}
.pill b{background:rgba(255,255,255,.25);border-radius:999px;padding:1px 8px;font-size:11px}
.muted,.hint{color:var(--mut)}
.msg{padding:8px 10px;border-radius:8px}
.msg.ok{background:var(--okbg);color:var(--ok)}
.msg.err{background:var(--errbg);color:var(--err)}
.msg.info{background:var(--infobg);color:var(--info)}
.msg ul{margin:4px 0 0 16px;padding:0}
.steps{list-style:none;margin:0 0 8px;padding:0;counter-reset:s}
.step{position:relative;padding:8px 8px 8px 34px;border-radius:8px;margin-bottom:4px;counter-increment:s}
.step::before{content:counter(s);position:absolute;left:8px;top:8px;width:18px;height:18px;border-radius:50%;background:var(--line);font-size:11px;text-align:center;line-height:18px;font-weight:700}
.step.now{background:var(--soft);outline:1px solid var(--acc)}
.step.now::before{background:var(--acc);color:var(--accfg)}
.here{display:inline-block;margin-top:4px;font-size:10px;font-weight:700;color:var(--acc);text-transform:uppercase;letter-spacing:.04em}
.crow{display:flex;align-items:center;gap:6px;padding:6px 0;border-bottom:1px solid var(--line)}
.crow label{display:flex;align-items:center;gap:6px;flex:1;min-width:0}
.code{font-weight:700}
.nm{color:var(--mut);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.chip{font-size:10px;padding:2px 6px;border-radius:999px;background:var(--line);color:var(--mut);white-space:nowrap}
.chip.ok{background:var(--okbg);color:var(--ok)}
.x{border:0;background:transparent;color:var(--mut);font-size:16px}
.add{display:flex;gap:6px;margin:10px 0}
.add input,.field input[type=time],.field input[type=number]{flex:1;border:1px solid var(--line);border-radius:6px;padding:5px 8px;background:var(--bg);color:var(--fg)}
.units{margin-top:6px;color:var(--mut)}
.units.over{color:var(--err);font-weight:700}
.lbl{font-weight:600;display:block;margin:2px 0 4px}
.days{display:flex;flex-wrap:wrap;gap:4px;margin-bottom:10px}
.day{display:flex;align-items:center;gap:3px;border:1px solid var(--line);border-radius:6px;padding:3px 6px}
.field{display:flex;align-items:center;justify-content:space-between;gap:10px;margin:8px 0}
.chk{display:flex;align-items:center;gap:6px;margin:8px 0}
.card{border:1px solid var(--line);border-radius:10px;padding:10px;margin-top:10px}
.chead{display:flex;justify-content:space-between;align-items:center;margin-bottom:6px}
.prow{margin-bottom:6px}
.dot{display:inline-block;width:9px;height:9px;border-radius:50%;margin-right:6px}
.empty{padding:12px;border:1px dashed var(--line);border-radius:10px;margin-top:10px;text-align:center}
.grid{display:grid;grid-template-columns:22px repeat(var(--cols),1fr);border:1px solid var(--line);border-radius:8px;overflow:hidden;font-size:10px;margin-top:8px}
.gh{padding:3px 0;text-align:center;font-weight:700;background:var(--soft)}
.gt,.gc{position:relative}
.gc{border-left:1px solid var(--line)}
.hl{position:absolute;left:0;right:0;border-top:1px solid var(--line);opacity:.6}
.tl{position:absolute;right:3px;color:var(--mut);transform:translateY(-1px)}
.blk{position:absolute;left:2px;right:2px;border-radius:4px;color:#fff;padding:1px 3px;overflow:hidden;font-size:9.5px;line-height:1.15}
`;
