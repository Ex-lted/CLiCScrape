export const CSS = `
:host{all:initial}
*{box-sizing:border-box;font-family:-apple-system,BlinkMacSystemFont,"SF Pro Text","Segoe UI Variable Text","Segoe UI",Roboto,sans-serif}

/* ---------- Tokens: light (default) ---------- */
:host{
 --bg:#fbfaf7;--well:#f1efe9;--hover:#ebe8e0;--line:#e6e3da;
 --fg:#1f1e1c;--mut:#7a766c;
 --acc:#1d4f91;--accfg:#ffffff;
 --ok:#2f6b3f;--okbg:#e6f1e8;--err:#a63a2e;--errbg:#f8e7e3;--info:#3b5f86;--infobg:#e7eef6;
 --shadow:0 24px 60px rgba(31,30,28,.16),0 2px 8px rgba(31,30,28,.08);
 --knob:#ffffff;
 color-scheme:light}

/* ---------- Tokens: dark ---------- */
:host([data-theme="dark"]){
 --bg:#232321;--well:#2d2d2a;--hover:#373733;--line:#3a3a36;
 --fg:#f3f1ea;--mut:#9a978d;
 --acc:#5f9ae0;--accfg:#0c1a2e;
 --ok:#a9d3b3;--okbg:#26382b;--err:#eaa89e;--errbg:#432723;--info:#a9c4e2;--infobg:#25313f;
 --shadow:0 24px 60px rgba(0,0,0,.55),0 2px 8px rgba(0,0,0,.4);
 --knob:#f3f1ea;
 color-scheme:dark}

/* ---------- Tokens: system dark (only when no explicit choice) ---------- */
@media (prefers-color-scheme:dark){
 :host(:not([data-theme])){
  --bg:#232321;--well:#2d2d2a;--hover:#373733;--line:#3a3a36;
  --fg:#f3f1ea;--mut:#9a978d;
  --acc:#5f9ae0;--accfg:#0c1a2e;
  --ok:#a9d3b3;--okbg:#26382b;--err:#eaa89e;--errbg:#432723;--info:#a9c4e2;--infobg:#25313f;
  --shadow:0 24px 60px rgba(0,0,0,.55),0 2px 8px rgba(0,0,0,.4);
  --knob:#f3f1ea;
  color-scheme:dark}}

/* ---------- Panel ---------- */
.panel{width:380px;max-height:80vh;display:flex;flex-direction:column;overflow:hidden;
 background:var(--bg);color:var(--fg);font-size:13px;line-height:1.5;letter-spacing:-.003em;
 border:1px solid var(--line);border-radius:18px;box-shadow:var(--shadow);
 -webkit-font-smoothing:antialiased}

button{cursor:pointer;font:inherit;color:inherit}
:focus-visible{outline:2px solid var(--acc);outline-offset:2px}
.drag{cursor:grab;touch-action:none;-webkit-user-select:none;user-select:none}
.drag:active{cursor:grabbing}

header{display:flex;align-items:center;gap:4px;padding:16px 12px 12px 18px}
header .t{font-size:15px;font-weight:650;letter-spacing:-.015em}
header .s{color:var(--mut);font-size:12px}
header .sp{flex:1}
.iconbtn{width:28px;height:28px;display:grid;place-items:center;border:0;border-radius:50%;
 background:transparent;color:var(--mut);font-size:16px;line-height:1;padding:0;transition:background .15s,color .15s}
.iconbtn:hover{background:var(--well);color:var(--fg)}
.iconbtn svg{width:16px;height:16px;stroke:currentColor;fill:none;stroke-width:1.75;stroke-linecap:round;stroke-linejoin:round}

/* Segmented tabs */
.tabs{display:flex;gap:2px;margin:0 16px 4px;padding:3px;background:var(--well);border-radius:11px}
.tabs button{flex:1;border:0;background:transparent;color:var(--mut);padding:6px 8px;font-weight:550;font-size:12.5px;
 border-radius:8px;transition:background .15s,color .15s,box-shadow .15s}
.tabs button:hover{color:var(--fg)}
.tabs button.on{background:var(--bg);color:var(--fg);box-shadow:0 1px 2px rgba(0,0,0,.12),0 0 0 .5px var(--line)}

.body{padding:12px 18px;overflow:auto;flex:1;min-height:120px;scrollbar-width:thin;scrollbar-color:var(--line) transparent}
.foot{padding:12px 18px 16px;border-top:1px solid var(--line);display:flex;flex-direction:column;gap:8px}

/* Buttons */
.primary{border:0;border-radius:10px;padding:10px 14px;font-weight:600;background:var(--acc);color:var(--accfg);
 transition:filter .15s,transform .05s}
.primary:hover{filter:brightness(1.07)}
.primary:active{transform:scale(.985)}
.primary:disabled{background:var(--well);color:var(--mut);cursor:not-allowed;filter:none;transform:none}
.ghost{border:1px solid var(--line);border-radius:999px;padding:3px 11px;font-size:12px;font-weight:550;background:transparent;color:var(--fg);
 transition:background .15s}
.ghost:hover{background:var(--well)}
.ghost:disabled{opacity:.4;cursor:not-allowed}
.ghost:disabled:hover{background:transparent}
.ghost.danger{background:var(--errbg);color:var(--err);border-color:transparent}
.ghost.danger:not(:disabled):hover{filter:brightness(.96)}
.ghost.danger.confirm{background:#cf4034;color:#fff}
.ghost.danger.confirm:hover{background:#b8372c;filter:none}
.bulk{display:flex;align-items:center;flex-wrap:wrap;gap:6px;margin-bottom:6px}
.bulk .sp{flex:1}

/* Collapsed pill */
.pill{display:flex;align-items:center;gap:10px;border:0;border-radius:999px;padding:9px 10px 9px 16px;font-weight:600;
 background:var(--fg);color:var(--bg);box-shadow:var(--shadow);font-size:13px}
.pill b{background:var(--acc);color:var(--accfg);border-radius:999px;padding:1px 9px;font-size:12px;font-weight:650}

/* Messages */
.muted,.hint{color:var(--mut)}
.msg{padding:10px 12px;border-radius:12px;font-size:12.5px}
.msg.ok{background:var(--okbg);color:var(--ok)}
.msg.err{background:var(--errbg);color:var(--err)}
.msg.info{background:var(--infobg);color:var(--info)}
.msg ul{margin:4px 0 0 16px;padding:0}

/* Guide steps */
.steps{list-style:none;margin:0 0 8px;padding:0;counter-reset:s}
.step{position:relative;padding:9px 10px 9px 40px;border-radius:12px;margin-bottom:2px;counter-increment:s}
.step::before{content:counter(s);position:absolute;left:10px;top:10px;width:20px;height:20px;border-radius:50%;
 background:var(--well);color:var(--mut);font-size:11px;text-align:center;line-height:20px;font-weight:600}
.step b{font-weight:620}
.step .muted{margin-top:1px}
.step.now{background:var(--well)}
.step.now::before{background:var(--acc);color:var(--accfg)}
.here{display:inline-block;margin-top:4px;color:var(--acc);font-size:12px;font-weight:650}

/* Course rows */
.crow{display:flex;align-items:center;gap:8px;padding:10px 0;border-bottom:1px solid var(--line)}
.crow:last-child{border-bottom:0}
.crow label{display:flex;align-items:center;gap:8px;flex:1;min-width:0}
.code{font-weight:620}
.nm{color:var(--mut);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.chip{font-size:11.5px;padding:2px 9px;border-radius:999px;background:var(--well);color:var(--mut);white-space:nowrap}
.chip.ok{background:var(--okbg);color:var(--ok)}
.x{border:0;background:transparent;color:var(--mut);font-size:18px;line-height:1;padding:0 4px;transition:color .15s}
.x:hover{color:var(--err)}
.add{display:flex;gap:8px;margin:12px 0 8px}
.units{margin-top:6px;color:var(--mut)}

/* Checkbox + switch */
input[type=checkbox]{-webkit-appearance:none;appearance:none;width:17px;height:17px;margin:0;flex:none;position:relative;cursor:pointer;
 border:1.5px solid var(--mut);border-radius:5px;background:transparent;transition:background .15s,border-color .15s}
input[type=checkbox]:hover{border-color:var(--fg)}
input[type=checkbox]:checked{background:var(--acc);border-color:var(--acc)}
input[type=checkbox]:checked::after{content:"";position:absolute;left:4.5px;top:1px;width:5px;height:9px;
 border:solid var(--accfg);border-width:0 2px 2px 0;transform:rotate(45deg)}
input[type=checkbox].sw{width:40px;height:24px;border:0;border-radius:999px;position:relative;
 background:var(--hover);flex:none;cursor:pointer;transition:background .2s}
input[type=checkbox].sw::after{content:"";position:absolute;top:2px;left:2px;width:20px;height:20px;border:0;border-radius:50%;background:var(--knob);
 box-shadow:0 1px 3px rgba(0,0,0,.3);transition:transform .2s cubic-bezier(.3,.7,.3,1)}
input[type=checkbox].sw:checked{background:var(--acc);border:0}
input[type=checkbox].sw:checked::after{transform:translateX(16px) rotate(0)}
@media (prefers-reduced-motion:reduce){
 input[type=checkbox].sw,input[type=checkbox].sw::after,.tabs button,.iconbtn,.primary,.ghost{transition:none}}

/* Segmented control (Appearance) */
.seg{display:flex;gap:2px;padding:3px;background:var(--well);border-radius:10px}
.seg button{flex:1;border:0;background:transparent;color:var(--mut);padding:6px 8px;font-size:12.5px;font-weight:550;border-radius:7px;
 transition:background .15s,color .15s}
.seg button:hover{color:var(--fg)}
.seg button.on{background:var(--bg);color:var(--fg);box-shadow:0 1px 2px rgba(0,0,0,.12),0 0 0 .5px var(--line)}

/* Fields */
.add input,.field input[type=number]{flex:1;min-width:0;border:1px solid var(--line);border-radius:10px;padding:8px 11px;
 background-color:var(--well);color:var(--fg);font:inherit;transition:border-color .15s,background-color .15s}
.add input:focus,.field input[type=number]:focus{outline:none;border-color:var(--acc);background-color:var(--bg)}
.add input::placeholder{color:var(--mut)}
.field input[type=number]{flex:none;width:80px;text-align:right}
input[type=number]{-moz-appearance:textfield;appearance:textfield}
input[type=number]::-webkit-inner-spin-button,input[type=number]::-webkit-outer-spin-button{-webkit-appearance:none;margin:0}

/* Custom dropdown */
.time{display:flex;align-items:center;gap:6px}
.time .colon{color:var(--mut);font-weight:600}
.dd{display:flex;align-items:center;width:68px;border:1px solid var(--line);border-radius:10px;padding:8px 26px 8px 11px;
 background-color:var(--well);color:var(--fg);font:inherit;text-align:left;cursor:pointer;
 background-image:linear-gradient(45deg,transparent 50%,var(--mut) 50%),linear-gradient(135deg,var(--mut) 50%,transparent 50%);
 background-position:calc(100% - 14px) 50%,calc(100% - 9px) 50%;background-size:5px 5px,5px 5px;background-repeat:no-repeat;
 transition:border-color .15s,background-color .15s}
.dd:hover{border-color:var(--mut)}
.dd[aria-expanded="true"]{border-color:var(--acc);background-color:var(--bg)}
.dd:disabled{opacity:.45;cursor:not-allowed}
.dd:disabled:hover{border-color:var(--line)}
.menu{position:fixed;max-height:224px;overflow-y:auto;padding:4px;background:var(--bg);color:var(--fg);font-size:13px;line-height:1.4;
 border:1px solid var(--line);border-radius:12px;box-shadow:var(--shadow);scrollbar-width:thin;scrollbar-color:var(--line) transparent}
.opt{display:block;width:100%;border:0;background:transparent;color:var(--fg);text-align:left;padding:6px 10px;border-radius:8px;
 font:inherit;font-variant-numeric:tabular-nums}
.opt:hover,.opt:focus-visible{background:var(--well);outline:none}
.opt.sel,.opt.sel:hover,.opt.sel:focus-visible{background:var(--acc);color:var(--accfg)}
.lbl{font-weight:620;display:block;margin:2px 0 6px}
.days{display:flex;flex-wrap:wrap;gap:6px;margin-bottom:12px}
.day{display:flex;align-items:center;gap:7px;border:1px solid var(--line);border-radius:999px;padding:5px 12px 5px 9px;cursor:pointer;
 transition:background .15s,border-color .15s}
.day:hover{background:var(--well)}
.day:has(input:checked){background:var(--well);border-color:var(--mut)}
.field{display:flex;align-items:center;justify-content:space-between;gap:10px;margin:10px 0}
.chk{display:flex;flex-direction:row-reverse;justify-content:flex-end;align-items:center;gap:10px;margin:12px 0}

/* Cards */
.card{border:1px solid var(--line);border-radius:14px;padding:12px 14px;margin-top:12px;background:var(--bg)}
.chead{display:flex;justify-content:space-between;align-items:center;margin-bottom:6px}
.prow{margin-bottom:6px}
.dot{display:inline-block;width:9px;height:9px;border-radius:50%;margin-right:6px}
.empty{padding:20px 16px;border:1px dashed var(--line);border-radius:14px;margin-top:12px;text-align:center;color:var(--mut)}

/* Timetable grid */
.grid{display:grid;grid-template-columns:22px repeat(var(--cols),1fr);border:1px solid var(--line);border-radius:12px;overflow:hidden;font-size:10.5px;margin-top:8px}
.gh{padding:5px 0;text-align:center;font-weight:620;background:var(--well);color:var(--fg)}
.gt,.gc{position:relative}
.gc{border-left:1px solid var(--line)}
.hl{position:absolute;left:0;right:0;border-top:1px solid var(--line)}
.tl{position:absolute;right:3px;color:var(--mut);transform:translateY(-1px)}
.blk{position:absolute;left:2px;right:2px;border-radius:6px;color:#fff;padding:2px 5px;overflow:hidden;font-size:10px;font-weight:650;line-height:1.15}
`;