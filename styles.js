// styles.js: flat, opaque, high-contrast panel (Shadow DOM, so CLiC's CSS cannot touch it).
export const CSS = `
:host{all:initial}
*{box-sizing:border-box;font-family:system-ui,-apple-system,"Segoe UI Variable Text","Segoe UI",Roboto,sans-serif}
.panel,.pill{
 --bg:#ffffff;--well:#f4f4f5;--line:#e4e4e7;
 --fg:#0a0a0a;--mut:#52525b;
 --acc:#2b50f0;--accfg:#ffffff;
 --ok:#166534;--okbg:#dcfce7;--err:#991b1b;--errbg:#fee2e2;--info:#1e40af;--infobg:#dbeafe;
 --shadow:0 12px 40px rgba(0,0,0,.18),0 1px 3px rgba(0,0,0,.12);
 color-scheme:light dark}
@media (prefers-color-scheme:dark){.panel,.pill{
 --bg:#1c1c1f;--well:#2a2a2f;--line:#3a3a41;
 --fg:#fafafa;--mut:#a1a1aa;
 --acc:#8aa9ff;--accfg:#0b1020;
 --ok:#bbf7d0;--okbg:#14532d;--err:#fecaca;--errbg:#7f1d1d;--info:#bfdbfe;--infobg:#1e3a8a;
 --shadow:0 12px 40px rgba(0,0,0,.6),0 1px 3px rgba(0,0,0,.5)}}

.panel{width:380px;max-height:80vh;display:flex;flex-direction:column;overflow:hidden;
 background:var(--bg);color:var(--fg);font-size:13px;line-height:1.45;
 border:1px solid var(--line);border-radius:14px;box-shadow:var(--shadow)}

button{cursor:pointer;font:inherit;color:inherit}
:focus-visible{outline:2px solid var(--acc);outline-offset:2px}
.drag{cursor:grab;touch-action:none;-webkit-user-select:none;user-select:none}
.drag:active{cursor:grabbing}

header{display:flex;align-items:center;gap:8px;padding:14px 14px 10px 16px}
header .t{font-size:14px;font-weight:650}
header .s{color:var(--mut);font-size:12px}
header .sp{flex:1}
.iconbtn{width:28px;height:28px;display:grid;place-items:center;border:0;border-radius:8px;
 background:transparent;color:var(--mut);font-size:18px;line-height:1;padding:0}
.iconbtn:hover{background:var(--well);color:var(--fg)}

.tabs{display:flex;gap:4px;padding:0 12px;border-bottom:1px solid var(--line)}
.tabs button{border:0;background:transparent;color:var(--mut);padding:8px 10px;font-weight:550;font-size:13px;
 border-bottom:2px solid transparent;margin-bottom:-1px}
.tabs button:hover{color:var(--fg)}
.tabs button.on{color:var(--fg);border-bottom-color:var(--acc)}

.body{padding:14px 16px;overflow:auto;flex:1;min-height:120px;scrollbar-width:thin}
.foot{padding:12px 16px 14px;border-top:1px solid var(--line);display:flex;flex-direction:column;gap:8px}

.primary{border:0;border-radius:8px;padding:9px 14px;font-weight:600;background:var(--acc);color:var(--accfg)}
.primary:hover{filter:brightness(1.08)}
.primary:disabled{background:var(--well);color:var(--mut);cursor:not-allowed;filter:none}
.ghost{border:1px solid var(--line);border-radius:6px;padding:3px 10px;font-size:12px;font-weight:550;background:transparent;color:var(--fg)}
.ghost:hover{background:var(--well)}

.pill{display:flex;align-items:center;gap:10px;border:0;border-radius:999px;padding:9px 10px 9px 16px;font-weight:600;
 background:var(--fg);color:var(--bg);box-shadow:var(--shadow)}
.pill b{background:var(--acc);color:var(--accfg);border-radius:999px;padding:1px 9px;font-size:12px;font-weight:650}

.muted,.hint{color:var(--mut)}
.msg{padding:9px 12px;border-radius:8px;font-size:12.5px}
.msg.ok{background:var(--okbg);color:var(--ok)}
.msg.err{background:var(--errbg);color:var(--err)}
.msg.info{background:var(--infobg);color:var(--info)}
.msg ul{margin:4px 0 0 16px;padding:0}

.steps{list-style:none;margin:0 0 8px;padding:0;counter-reset:s}
.step{position:relative;padding:8px 10px 8px 38px;border-radius:8px;margin-bottom:2px;counter-increment:s}
.step::before{content:counter(s);position:absolute;left:8px;top:8px;width:20px;height:20px;border-radius:50%;
 border:1px solid var(--line);color:var(--mut);font-size:11px;text-align:center;line-height:18px;font-weight:600}
.step b{font-weight:650}
.step .muted{margin-top:1px}
.step.now{background:var(--well)}
.step.now::before{background:var(--acc);border-color:var(--acc);color:var(--accfg)}
.here{display:inline-block;margin-top:4px;color:var(--acc);font-size:12px;font-weight:650}

.crow{display:flex;align-items:center;gap:8px;padding:9px 0;border-bottom:1px solid var(--line)}
.crow label{display:flex;align-items:center;gap:8px;flex:1;min-width:0}
.code{font-weight:650}
.nm{color:var(--mut);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.chip{font-size:11.5px;padding:2px 8px;border-radius:6px;background:var(--well);color:var(--mut);white-space:nowrap}
.chip.ok{background:var(--okbg);color:var(--ok)}
.x{border:0;background:transparent;color:var(--mut);font-size:18px;line-height:1;padding:0 4px}
.x:hover{color:var(--err)}
.add{display:flex;gap:8px;margin:12px 0 8px}
.units{margin-top:6px;color:var(--mut)}
.units.over{color:var(--err);font-weight:650}

input[type=checkbox]{accent-color:var(--acc);width:16px;height:16px;margin:0}
input[type=checkbox].sw{-webkit-appearance:none;appearance:none;width:38px;height:22px;border-radius:999px;position:relative;
 background:var(--line);flex:none;cursor:pointer}
input[type=checkbox].sw::after{content:"";position:absolute;top:3px;left:3px;width:16px;height:16px;border-radius:50%;background:var(--bg);
 box-shadow:0 1px 2px rgba(0,0,0,.35);transition:transform .15s}
input[type=checkbox].sw:checked{background:var(--acc)}
input[type=checkbox].sw:checked::after{transform:translateX(16px)}
@media (prefers-reduced-motion:reduce){input[type=checkbox].sw::after{transition:none}}

.add input,.field select,.field input[type=number]{flex:1;min-width:0;border:1px solid var(--line);border-radius:8px;padding:7px 10px;
 background:var(--bg);color:var(--fg);font:inherit}
.add input::placeholder{color:var(--mut)}
.field select{flex:none;width:118px}
.field input[type=number]{flex:none;width:80px;text-align:right}
.lbl{font-weight:650;display:block;margin:2px 0 6px}
.days{display:flex;flex-wrap:wrap;gap:6px;margin-bottom:12px}
.day{display:flex;align-items:center;gap:5px;border:1px solid var(--line);border-radius:6px;padding:4px 9px}
.field{display:flex;align-items:center;justify-content:space-between;gap:10px;margin:10px 0}
.chk{display:flex;flex-direction:row-reverse;justify-content:flex-end;align-items:center;gap:10px;margin:12px 0}

.card{border:1px solid var(--line);border-radius:12px;padding:12px;margin-top:12px}
.chead{display:flex;justify-content:space-between;align-items:center;margin-bottom:6px}
.prow{margin-bottom:6px}
.dot{display:inline-block;width:9px;height:9px;border-radius:50%;margin-right:6px}
.empty{padding:16px;border:1px dashed var(--line);border-radius:12px;margin-top:12px;text-align:center}

.grid{display:grid;grid-template-columns:22px repeat(var(--cols),1fr);border:1px solid var(--line);border-radius:8px;overflow:hidden;font-size:10.5px;margin-top:8px}
.gh{padding:4px 0;text-align:center;font-weight:650;background:var(--well);color:var(--fg)}
.gt,.gc{position:relative}
.gc{border-left:1px solid var(--line)}
.hl{position:absolute;left:0;right:0;border-top:1px solid var(--line)}
.tl{position:absolute;right:3px;color:var(--mut);transform:translateY(-1px)}
.blk{position:absolute;left:2px;right:2px;border-radius:5px;color:#fff;padding:2px 4px;overflow:hidden;font-size:10px;font-weight:650;line-height:1.15}
`;