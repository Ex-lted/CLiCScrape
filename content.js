// content.js: classic content script. Loads the ES modules shipped in the extension package.
(async () => {
  if (window.top !== window) return; // CLiC pages live in the top frame
  if (document.getElementById('clic-planner-host')) return;
  const url = (f) => chrome.runtime.getURL(f);
  const { mountPanel } = await import(url('panel.js'));
  const { chromeStorage } = await import(url('store.js'));
  await mountPanel({ doc: document, adapter: chromeStorage() });
})().catch((e) => console.error('[CLiC Planner]', e));
