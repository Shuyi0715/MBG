export function icon(name, cls = '') {
  const paths = {
    arrow: '<path d="M5 12h14M13 6l6 6-6 6"/>',
    phone: '<path d="M7 3H4a1 1 0 0 0-1 1c0 9.4 7.6 17 17 17a1 1 0 0 0 1-1v-3l-5-2-2 2a14 14 0 0 1-7-7l2-2-2-5Z"/>',
    calendar: '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M16 3v4M8 3v4M3 11h18m-13 4h2m4 0h2m-8 3h2"/>',
    check: '<path d="m5 12 4 4L19 6"/>',
    shield: '<path d="m12 3 8 3v6c0 5-8 9-8 9s-8-4-8-9V6l8-3Z"/><path d="m8 12 3 3 5-6"/>',
    pin: '<path d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 1 1 16 0Z"/><circle cx="12" cy="10" r="2.5"/>',
    tool: '<path d="m14 6 4 4 3-3a6 6 0 0 1-8 8l-7 7-4-4 7-7a6 6 0 0 1 8-8l-3 3Z"/>',
    fridge: '<rect x="6" y="2" width="12" height="20" rx="2"/><path d="M6 9h12M9 5v2m0 5v4"/>',
    oven: '<rect x="3" y="3" width="18" height="19" rx="2"/><path d="M3 8h18m-14 4h10v6H7zM7 5h1m3 0h1m3 0h1"/>',
    washer: '<rect x="3" y="2" width="18" height="20" rx="2"/><path d="M3 7h18M6 4h2m3 0h1"/><circle cx="12" cy="14" r="5"/><path d="M7 14q3-3 5 0t5 0"/>',
    dishwasher: '<rect x="3" y="2" width="18" height="20" rx="2"/><path d="M3 7h18M7 4h3m6 0h1M7 11v7m5-7v7m5-7v7"/>',
    wine: '<path d="M8 3h8l1 7a5 5 0 0 1-10 0l1-7Zm4 12v6m-4 0h8M7 9h10"/>',
    boat: '<path d="m3 13 9-3 9 3-3 6H6l-3-6Zm4-1V7h10v5M10 7V3h4v4M2 22q3-3 5 0 3-3 5 0 3-3 5 0 3-3 5 0"/>',
    home: '<path d="m3 10 9-8 9 8v11h-6v-8H9v8H3V10Z"/>',
    building: '<path d="M5 22V2h14v20M9 6h1m4 0h1m-6 4h1m4 0h1m-6 4h1m4 0h1m-6 4h1m4 0h1M2 22h20"/>',
    search: '<circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 5 5"/>',
    book: '<path d="M12 5C8 2 4 3 2 4v16c3-1 6-1 10 1 4-2 7-2 10-1V4c-2-1-6-2-10 1v16Z"/>',
    clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
    close: '<path d="m6 6 12 12M6 18 18 6"/>',
    menu: '<path d="M3 6h18M3 12h18M3 18h18"/>',
    chevron: '<path d="m8 10 4 4 4-4"/>',
    message: '<path d="M21 11a9 9 0 0 1-9 9H3l1-6a9 9 0 1 1 17-3Z"/><path d="M8 10h8m-8 4h5"/>',
  };
  return `<svg class="icon ${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.65" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths[name] || paths.tool}</svg>`;
}
