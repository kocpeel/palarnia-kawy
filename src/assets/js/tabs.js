// Accessible tabs: roving tabindex, arrow keys, Home and End.
export function initTabs(tablist, onSelect) {
  if (!tablist) return;
  const tabs = [...tablist.querySelectorAll('[role="tab"]')];
  const select = (tab, focus = false) => {
    for (const other of tabs) {
      const active = other === tab;
      other.setAttribute('aria-selected', String(active));
      other.tabIndex = active ? 0 : -1;
    }
    if (focus) tab.focus();
    onSelect(tab);
  };
  tablist.addEventListener('click', (event) => {
    const tab = event.target.closest('[role="tab"]');
    if (tab) select(tab);
  });
  tablist.addEventListener('keydown', (event) => {
    const index = tabs.indexOf(document.activeElement);
    const target = { ArrowRight: index + 1, ArrowLeft: index - 1, Home: 0, End: tabs.length - 1 }[event.key];
    if (index < 0 || target === undefined) return;
    event.preventDefault();
    select(tabs[(target + tabs.length) % tabs.length], true);
  });
  select(tabs.find((tab) => tab.getAttribute('aria-selected') === 'true') ?? tabs[0]);
}
