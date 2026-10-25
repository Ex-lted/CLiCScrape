export const CSS = `
:host{all:initial}
*{box-sizing:border-box;font-family:-apple-system,BlinkMacSystemFont,"SF Pro Text","Segoe UI Variable Text","Segoe UI",Roboto,sans-serif}

/* ---------- Tokens: light (default) ---------- */
:host{
 --bg:#fbfaf7;--well:#f1efe9;--hover:#ebe8e0;--line:#e6e3da;
 --fg:#1f1e1c;--mut:#7a766c;
 --acc:#c15f3c;--accfg:#ffffff;
 --ok:#2f6b3f;--okbg:#e6f1e8;--err:#a63a2e;--errbg:#f8e7e3;--info:#3b5f86;--infobg:#e7eef6;
 --shadow:0 24px 60px rgba(31,30,28,.16),0 2px 8px rgba(31,30,28,.08);
 --knob:#ffffff;
 color-scheme:light}

/* ---------- Tokens: dark ---------- */
:host([data-theme="dark"]){
 --bg:#232321;--well:#2d2d2a;--hover:#373733;--line:#3a3a36;
 --fg:#f3f1ea;--mut:#9a978d;
 --acc:#d9774f;--accfg:#1a1917;
 --ok:#a9d3b3;--okbg:#26382b;--err:#eaa89e;--errbg:#432723;--info:#a9c4e2;--infobg:#25313f;
 --shadow:0 24px 60px rgba(0,0,0,.55),0 2px 8px rgba(0,0,0,.4);
 --knob:#f3f1ea;
 color-scheme:dark}

/* ---------- Tokens: system dark (only when no explicit choice) ---------- */
@media (prefers-color-scheme:dark){
 :host(:not([data-theme])){
  --bg:#232321;--well:#2d2d2a;--hover:#373733;--line:#3a3a36;
  --fg:#f3f1ea;--mut:#9a978d;
  --acc:#d9774f;--accfg:#1a1917;
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
.units.over{color:var(--err);font-weight:650}

/* Checkbox + switch */
input[type=checkbox]{accent-color:var(--acc);width:16px;height:16px;margin:0}
input[type=checkbox].sw{-webkit-appearance:none;appearance:none;width:40px;height:24px;border-radius:999px;position:relative;
 background:var(--hover);flex:none;cursor:pointer;transition:background .2s}
input[type=checkbox].sw::after{content:"";position:absolute;top:2px;left:2px;width:20px;height:20px;border-radius:50%;background:var(--knob);
 box-shadow:0 1px 3px rgba(0,0,0,.3);transition:transform .2s cubic-bezier(.3,.7,.3,1)}
input[type=checkbox].sw:checked{background:var(--acc)}
input[type=checkbox].sw:checked::after{transform:translateX(16px)}
@media (prefers-reduced-motion:reduce){
 input[type=checkbox].sw,input[type=checkbox].sw::after,.tabs button,.iconbtn,.primary,.ghost{transition:none}}

/* Fields */
.add input,.field select,.field input[type=number]{flex:1;min-width:0;border:1px solid var(--line);border-radius:10px;padding:8px 11px;
 background:var(--well);color:var(--fg);font:inherit;transition:border-color .15s,background .15s}
.add input:focus,.field select:focus,.field input[type=number]:focus{outline:none;border-color:var(--acc);background:var(--bg)}
.add input::placeholder{color:var(--mut)}
.field select{flex:none;width:122px}
.field input[type=number]{flex:none;width:80px;text-align:right}
.lbl{font-weight:620;display:block;margin:2px 0 6px}
.days{display:flex;flex-wrap:wrap;gap:6px;margin-bottom:12px}
.day{display:flex;align-items:center;gap:5px;border:1px solid var(--line);border-radius:999px;padding:4px 10px}
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