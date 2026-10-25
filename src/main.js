import '@fontsource/manrope/latin-400.css';
import '@fontsource/manrope/latin-500.css';
import '@fontsource/manrope/latin-600.css';
import '@fontsource/manrope/latin-700.css';
import '@fontsource/manrope/latin-800.css';
import './style.css';
import { renderApp, resolvePage } from './render.js';
import { services } from './data.js';
import { icon } from './icons.js';

const path = window.location.pathname;
document.querySelector('#app').innerHTML = renderApp(path);
document.title = resolvePage(path).title;

const menu = document.querySelector('.menu-toggle');
const nav = document.querySelector('.main-nav');
function closeMenu() {
  menu.setAttribute('aria-expanded', 'false');
  menu.setAttribute('aria-label', 'Open navigation');
  nav.classList.remove('is-open');
}
menu.addEventListener('click', () => {
  const open = menu.getAttribute('aria-expanded') !== 'true';
  menu.setAttribute('aria-expanded', String(open));
  menu.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
  nav.classList.toggle('is-open', open);
});
document.addEventListener('keydown', (event) => { if (event.key === 'Escape') closeMenu(); });
document.addEventListener('click', (event) => { if (!event.target.closest('.site-header')) closeMenu(); });
nav.addEventListener('click', (event) => { if (event.target.closest('a')) closeMenu(); });
window.matchMedia('(min-width: 1151px)').addEventListener('change', event => { if (event.matches) closeMenu(); });

const dialog = document.querySelector('#booking-dialog');
const form = document.querySelector('#booking-form');
const entry = document.querySelector('#booking-entry');
const review = document.querySelector('#booking-review');
let bookingTrigger;
document.querySelectorAll('[data-book]').forEach(button => button.addEventListener('click', () => {
  bookingTrigger = button;
  closeMenu();
  entry.hidden = false;
  review.hidden = true;
  dialog.setAttribute('aria-labelledby', 'booking-title');
  if (button.dataset.book) form.elements.appliance.value = button.dataset.book;
  dialog.showModal();
  document.body.classList.add('dialog-open');
}));
document.querySelector('[data-close-booking]').addEventListener('click', () => dialog.close());
dialog.addEventListener('click', event => {
  const bounds = dialog.getBoundingClientRect();
  if (event.target === dialog && (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom)) dialog.close();
});
dialog.addEventListener('close', () => {
  document.body.classList.remove('dialog-open');
  bookingTrigger?.focus();
});
form.addEventListener('submit', event => {
  event.preventDefault();
  if (!form.reportValidity()) return;
  const data = new FormData(form);
  const appliance = services.find(s => s.slug === data.get('appliance'))?.name || (data.get('appliance') === 'maintenance' ? 'Maintenance inquiry' : 'Other appliance');
  const message = `Hello MBG, I’d like to request appliance service.\n\nName: ${data.get('name').trim()}\nPhone: ${data.get('phone').trim()}\nZIP code: ${data.get('zip').trim()}\nAppliance: ${appliance}\nBrand / model: ${data.get('model').trim() || 'Not sure'}\nIssue: ${data.get('issue').trim()}\n\nPlease contact me to confirm availability and next steps.`;
  document.querySelector('#request-preview').textContent = message;
  document.querySelector('#send-text').href = `sms:+18888411175?body=${encodeURIComponent(message)}`;
  entry.hidden = true;
  review.hidden = false;
  dialog.setAttribute('aria-labelledby', 'review-title');
  dialog.scrollTop = 0;
  document.querySelector('#send-text').focus();
});
document.querySelector('#edit-request').addEventListener('click', () => {
  entry.hidden = false;
  review.hidden = true;
  dialog.setAttribute('aria-labelledby', 'booking-title');
  form.elements.name.focus();
});
document.querySelector('#copy-request').addEventListener('click', async () => {
  const status = document.querySelector('#copy-status');
  try {
    await navigator.clipboard.writeText(document.querySelector('#request-preview').textContent);
    status.textContent = 'Request copied. You can paste it into a text message.';
  } catch {
    status.textContent = 'Copy is unavailable in this browser. Select the request text above to copy it, or call MBG.';
  }
});

const search = document.querySelector('#guide-search');
if (search) {
  let category = 'All';
  function filterGuides() {
    let count = 0;
    const term = search.value.trim().toLowerCase();
    document.querySelectorAll('[data-guide]').forEach(card => {
      card.hidden = !(category === 'All' || card.dataset.guide === category) || !`${card.dataset.search} ${card.dataset.guide.toLowerCase()}`.includes(term);
      if (!card.hidden) count++;
    });
    document.querySelector('#guide-empty').hidden = count !== 0;
    document.querySelector('#guide-count').textContent = `${count} guide${count === 1 ? '' : 's'}`;
  }
  search.addEventListener('input', filterGuides);
  document.querySelectorAll('[data-guide-filter]').forEach(button => button.addEventListener('click', () => {
    category = button.dataset.guideFilter;
    document.querySelectorAll('[data-guide-filter]').forEach(pill => {
      pill.classList.toggle('active', pill === button);
      pill.setAttribute('aria-pressed', String(pill === button));
    });
    filterGuides();
  }));
}
const locator = document.querySelector('#locator-type');
if (locator) {
  const locations = {
    fridge: ['Refrigerator or freezer', 'Look inside the fresh-food compartment, along a side wall, near the upper frame, or around the door opening. On some built-in units the label may be near the grille. Only check locations you can safely see without removing panels.'],
    oven: ['Range or oven', 'Check the visible frame around the oven door opening. Some ranges have a label along the storage drawer frame. Let the appliance cool completely first. Do not pull it away from the wall or disconnect any gas or electrical connection.'],
    washer: ['Washer or dryer', 'Look around the door opening, under the lid on a top-loading washer, or on a visible outer panel. Do not move a stacked or built-in unit to find a label. Your owner’s manual may show the location.'],
    dishwasher: ['Dishwasher', 'With the appliance idle, open the door and look along the side or upper edge of the inner door panel or tub frame. You should not need to remove screws or panels.'],
    wine: ['Wine cooler or ice maker', 'Look along the inner side wall, door frame, or a visible label near the front opening. Locations vary by model. Do not remove a grille or service panel to look for the label.'],
  };
  locator.addEventListener('change', () => {
    document.querySelector('#locator-heading').textContent = locations[locator.value][0];
    document.querySelector('#locator-description').textContent = locations[locator.value][1];
    document.querySelector('.locator-icon').innerHTML = icon(locator.value);
  });
}
