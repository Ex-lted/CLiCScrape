// styles.js: Apple-style "liquid glass" panel, applied inside the Shadow DOM.
export const CSS = `
:host{all:initial}
*{box-sizing:border-box;-webkit-font-smoothing:antialiased;
 font-family:-apple-system,BlinkMacSystemFont,"SF Pro Text","SF Pro Display","Segoe UI Variable Text","Segoe UI",system-ui,sans-serif}
.panel,.pill{
 --glass:rgba(255,255,255,.55);--raise:rgba(255,255,255,.62);--well:rgba(120,120,128,.14);
 --stroke:rgba(255,255,255,.75);--hair:rgba(60,60,67,.14);
 --fg:#1c1c1e;--mut:rgba(60,60,67,.62);--acc:#007aff;--accfg:#fff;--soft:rgba(0,122,255,.13);
 --ok:#1b6b34;--okbg:rgba(52,199,89,.22);--err:#a8231b;--errbg:rgba(255,59,48,.16);--info:#0a58c2;--infobg:rgba(0,122,255,.14);
 --shadow:0 28px 70px rgba(30,30,60,.26),0 3px 10px rgba(30,30,60,.1);
 color-scheme:light dark}
@media (prefers-color-scheme:dark){.panel,.pill{
 --glass:rgba(40,40,46,.5);--raise:rgba(120,120,128,.34);--well:rgba(120,120,128,.24);
 --stroke:rgba(255,255,255,.18);--hair:rgba(255,255,255,.12);
 --fg:#f5f5f7;--mut:rgba(235,235,245,.62);--acc:#0a84ff;--soft:rgba(10,132,255,.24);
 --ok:#8be3a5;--okbg:rgba(48,209,88,.24);--err:#ffb4ab;--errbg:rgba(255,69,58,.26);--info:#a8d0ff;--infobg:rgba(10,132,255,.28);
 --shadow:0 28px 70px rgba(0,0,0,.55),0 3px 10px rgba(0,0,0,.35)}}

/* the one memorable thing: the glass itself */
.panel{position:relative;width:392px;max-height:80vh;display:flex;flex-direction:column;overflow:hidden;
 color:var(--fg);font-size:13px;line-height:1.4;letter-spacing:-.003em;
 background:var(--glass);border:1px solid var(--stroke);border-radius:28px;
 -webkit-backdrop-filter:blur(32px) saturate(190%);backdrop-filter:blur(32px) saturate(190%);
 box-shadow:var(--shadow),inset 0 1px 0 rgba(255,255,255,.6),inset 0 -1px 0 rgba(255,255,255,.1),inset 0 0 22px rgba(255,255,255,.08)}
.panel::before{content:"";position:absolute;inset:0;border-radius:inherit;pointer-events:none;
 background:radial-gradient(130% 55% at 10% -12%,rgba(255,255,255,.6),transparent 58%),
  linear-gradient(165deg,rgba(255,255,255,.2),transparent 38%,rgba(255,255,255,.08))}
@media (prefers-color-scheme:dark){.panel::before{opacity:.3}}
.panel>*{position:relative}
@media (prefers-reduced-transparency:reduce){.panel,.pill{background:Canvas;-webkit-backdrop-filter:none;backdrop-filter:none}.panel::before{display:none}}

button{cursor:pointer;font:inherit;color:inherit}
:focus-visible{outline:2px solid var(--acc);outline-offset:2px}
.drag{cursor:grab;touch-action:none;-webkit-user-select:none;user-select:none}
.drag:active{cursor:grabbing}

header{display:flex;align-items:center;gap:10px;padding:14px 14px 10px 18px}
header .t{font-size:15px;font-weight:600;letter-spacing:-.01em}
header .s{color:var(--mut);font-size:11.5px;margin-top:1px}
header .sp{flex:1}
.iconbtn{width:26px;height:26px;display:grid;place-items:center;border:0;border-radius:50%;
 background:var(--well);color:var(--mut);font-size:16px;line-height:1;padding:0;cursor:pointer}
.iconbtn:hover{background:var(--raise);color:var(--fg)}

.tabs{display:flex;gap:2px;margin:0 14px 10px;padding:2px;border-radius:11px;background:var(--well)}
.tabs button{flex:1;border:0;background:transparent;color:var(--mut);padding:6px 4px;border-radius:9px;font-size:12.5px;font-weight:500}
.tabs button.on{background:var(--raise);color:var(--fg);font-weight:600;
 box-shadow:0 1px 3px rgba(0,0,0,.14),inset 0 1px 0 rgba(255,255,255,.55)}

.body{padding:2px 14px 12px;overflow:auto;flex:1;min-height:120px;scrollbar-width:thin;scrollbar-color:var(--hair) transparent}
.foot{padding:10px 14px 14px;border-top:1px solid var(--hair);display:flex;flex-direction:column;gap:8px}

.primary{border:0;border-radius:12px;padding:10px 14px;font-weight:600;color:var(--accfg);
 background:linear-gradient(180deg,rgba(255,255,255,.28),rgba(255,255,255,0) 55%),var(--acc);
 box-shadow:0 4px 14px rgba(0,122,255,.35),inset 0 1px 0 rgba(255,255,255,.45)}
.primary:hover{filter:brightness(1.06)}
.primary:active{filter:brightness(.94);transform:scale(.99)}
.primary:disabled{opacity:.4;cursor:not-allowed;box-shadow:none;filter:none;transform:none}
.ghost{border:0;border-radius:999px;padding:3px 11px;font-size:12px;font-weight:500;background:var(--well);color:var(--acc)}
.ghost:hover{background:var(--raise)}

.pill{display:flex;align-items:center;gap:9px;border-radius:999px;padding:10px 12px 10px 18px;font-weight:600;color:var(--fg);
 background:var(--glass);border:1px solid var(--stroke);
 -webkit-backdrop-filter:blur(28px) saturate(190%);backdrop-filter:blur(28px) saturate(190%);
 box-shadow:var(--shadow),inset 0 1px 0 rgba(255,255,255,.6)}
.pill b{background:var(--acc);color:var(--accfg);border-radius:999px;padding:2px 9px;font-size:11.5px;font-weight:600}

.muted,.hint{color:var(--mut)}
.msg{padding:9px 12px;border-radius:14px;font-size:12.5px}
.msg.ok{background:var(--okbg);color:var(--ok)}
.msg.err{background:var(--errbg);color:var(--err)}
.msg.info{background:var(--infobg);color:var(--info)}
.msg ul{margin:4px 0 0 16px;padding:0}

.steps{list-style:none;margin:0 0 8px;padding:0;counter-reset:s}
.step{position:relative;padding:9px 10px 9px 40px;border-radius:14px;margin-bottom:4px;counter-increment:s}
.step::before{content:counter(s);position:absolute;left:10px;top:9px;width:20px;height:20px;border-radius:50%;
 background:var(--well);color:var(--mut);font-size:11px;text-align:center;line-height:20px;font-weight:600}
.step b{font-weight:600}
.step.now{background:var(--raise);box-shadow:0 2px 10px rgba(0,0,0,.08),inset 0 1px 0 rgba(255,255,255,.5)}
.step.now::before{background:var(--acc);color:var(--accfg)}
.here{display:inline-block;margin-top:5px;padding:1px 8px;border-radius:999px;background:var(--soft);color:var(--acc);font-size:11px;font-weight:600}

.crow{display:flex;align-items:center;gap:8px;padding:8px 2px;border-bottom:1px solid var(--hair)}
.crow label{display:flex;align-items:center;gap:8px;flex:1;min-width:0}
.code{font-weight:600}
.nm{color:var(--mut);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.chip{font-size:11px;padding:2px 8px;border-radius:999px;background:var(--well);color:var(--mut);white-space:nowrap}
.chip.ok{background:var(--okbg);color:var(--ok)}
.x{border:0;background:transparent;color:var(--mut);font-size:17px;line-height:1;padding:0 4px}
.x:hover{color:var(--err)}
.add{display:flex;gap:8px;margin:12px 0 8px}
.units{margin-top:6px;color:var(--mut)}
.units.over{color:var(--err);font-weight:600}

input[type=checkbox]{accent-color:var(--acc);width:16px;height:16px;margin:0}
input[type=checkbox].sw{-webkit-appearance:none;appearance:none;width:42px;height:26px;border-radius:999px;position:relative;
 background:var(--well);transition:background .2s;flex:none;cursor:pointer}
input[type=checkbox].sw::after{content:"";position:absolute;top:2px;left:2px;width:22px;height:22px;border-radius:50%;background:#fff;
 box-shadow:0 2px 5px rgba(0,0,0,.3);transition:transform .2s}
input[type=checkbox].sw:checked{background:#34c759}
input[type=checkbox].sw:checked::after{transform:translateX(16px)}
@media (prefers-reduced-motion:reduce){input[type=checkbox].sw,input[type=checkbox].sw::after{transition:none}}

.add input,.field select,.field input[type=number]{flex:1;min-width:0;border:0;border-radius:10px;padding:7px 10px;
 background:var(--well);color:var(--fg);font:inherit}
.field select{flex:none;width:118px}
.field input[type=number]{flex:none;width:80px;text-align:right}
.add input::placeholder{color:var(--mut)}
.lbl{font-weight:600;display:block;margin:2px 0 6px}
.days{display:flex;flex-wrap:wrap;gap:6px;margin-bottom:12px}
.day{display:flex;align-items:center;gap:5px;border-radius:999px;padding:4px 10px;background:var(--well)}
.field{display:flex;align-items:center;justify-content:space-between;gap:10px;margin:10px 0}
.chk{display:flex;align-items:center;justify-content:space-between;gap:10px;margin:12px 0}
.chk{flex-direction:row-reverse;justify-content:flex-end}

.card{border-radius:20px;padding:12px;margin-top:12px;background:var(--raise);
 box-shadow:0 2px 12px rgba(0,0,0,.07),inset 0 1px 0 rgba(255,255,255,.5)}
.chead{display:flex;justify-content:space-between;align-items:center;margin-bottom:6px}
.prow{margin-bottom:6px}
.dot{display:inline-block;width:9px;height:9px;border-radius:50%;margin-right:6px}
.empty{padding:16px;border-radius:18px;margin-top:12px;text-align:center;background:var(--well)}

.grid{display:grid;grid-template-columns:22px repeat(var(--cols),1fr);border-radius:12px;overflow:hidden;font-size:10px;margin-top:8px;
 background:var(--well)}
.gh{padding:4px 0;text-align:center;font-weight:600;color:var(--mut)}
.gt,.gc{position:relative}
.gc{border-left:1px solid var(--hair)}
.hl{position:absolute;left:0;right:0;border-top:1px solid var(--hair)}
.tl{position:absolute;right:3px;color:var(--mut);transform:translateY(-1px)}
.blk{position:absolute;left:2px;right:2px;border-radius:7px;color:#fff;padding:2px 4px;overflow:hidden;font-size:9.5px;font-weight:600;line-height:1.15;
 background-image:linear-gradient(180deg,rgba(255,255,255,.34),rgba(255,255,255,0) 60%);
 box-shadow:0 1px 3px rgba(0,0,0,.25),inset 0 1px 0 rgba(255,255,255,.45)}
`;
