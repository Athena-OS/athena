/* global table */
'use strict';

const editor = {
  element: document.getElementById('editor'),
  cookie: {},
  origin: null,
  callbacks: {
    reset: [],
    remove: [],
    create: [],
    expand: [],
    export: []
  }
};

editor.update = (cookie, origin = editor.origin, tr) => {
  editor.origin = origin;
  editor.cookie = cookie;
  editor.tr = tr;
  if (cookie.domain) {
    document.getElementById('domain').value = cookie.domain;
  }
  document.getElementById('name').value = cookie.name || '';
  document.getElementById('path').value = cookie.path || '/';
  document.getElementById('hostOnly').checked = cookie.hostOnly;
  document.getElementById('httpOnly').checked = cookie.httpOnly;
  document.getElementById('secure').checked = cookie.secure;
  document.getElementById('session').checked = cookie.session;
  if (cookie.session === false) {
    document.getElementById('date').valueAsNumber = cookie.expirationDate * 1000;
    document.getElementById('time').valueAsNumber = cookie.expirationDate * 1000;
  }
  document.getElementById('session').checked = cookie.session;
  document.getElementById('value').value = cookie.value || '';
  document.getElementById('editor').cookie = cookie;
  document.getElementById('session').dispatchEvent(new Event('change', {
    bubbles: true
  }));
};
editor.isChanged = () => {
  const cookie = editor.cookie;
  let changed = false;
  changed = changed || cookie.name !== document.getElementById('name').value;
  changed = changed || cookie.domain !== document.getElementById('domain').value;
  changed = changed || cookie.path !== document.getElementById('path').value;

  const aHostOnly = cookie.hostOnly || cookie.domain === undefined;
  changed = changed || aHostOnly !== document.getElementById('hostOnly').checked;
  changed = changed || cookie.httpOnly !== document.getElementById('httpOnly').checked;
  changed = changed || cookie.secure !== document.getElementById('secure').checked;
  changed = changed || cookie.session !== document.getElementById('session').checked;
  changed = changed || cookie.value !== document.getElementById('value').value;
  if (document.getElementById('session').checked === false) {
    const v = document.getElementById('date').valueAsNumber +
      document.getElementById('time').valueAsNumber;
    changed = changed || Math.round(cookie.expirationDate * 1000) !== v;
  }
  return changed;
};
editor.reset = c => editor.callbacks.reset.push(c);
editor.save = c => document.getElementById('editor').addEventListener('submit', e => {
  e.preventDefault();
  c();
});
editor.remove = c => editor.callbacks.remove.push(c);
editor.expand = c => editor.callbacks.expand.push(c);
editor.export = c => editor.callbacks.export.push(c);
editor.create = c => editor.callbacks.create.push(c);

document.addEventListener('click', e => {
  const cmd = e.target.dataset.cmd;
  if (cmd === 'remove' || cmd === 'reset' || cmd === 'create' || cmd === 'expand' || cmd === 'export') {
    editor.callbacks[cmd].forEach(c => c(e));
  }
  else if (cmd === 'select-all') {
    table.select.all();
  }
  else if (cmd === 'select-none') {
    table.select.none();
  }
});

editor.toObject = () => {
  const obj = {
    name: document.getElementById('name').value,
    domain: document.getElementById('domain').value,
    path: document.getElementById('path').value,
    httpOnly: document.getElementById('httpOnly').checked,
    secure: document.getElementById('secure').checked,
    value: document.getElementById('value').value
  };
  if (document.getElementById('hostOnly').checked) {
    delete obj.domain;
  }
  const session = document.getElementById('session').checked;
  if (session === false) {
    obj.expirationDate = parseInt((document.getElementById('date').valueAsNumber +
      document.getElementById('time').valueAsNumber) / 1000);
  }
  return obj;
};

editor.attr = (obj, ...queries) => queries.forEach(query => Object.assign(document.querySelector(query), obj));

// disable datetime element when not applicable
document.getElementById('session').addEventListener('change', ({target}) => {
  document.getElementById('date').disabled = target.checked;
  document.getElementById('time').disabled = target.checked;
});
{
  const a = () => {
    const edited = editor.isChanged();
    editor.tr.dataset.edited = editor.element.dataset.edited = edited;
    editor.attr({
      disabled: edited === false
    }, '#save', '[data-cmd=reset]');
  };
  document.getElementById('editor').addEventListener('change', a);
  document.getElementById('editor').addEventListener('input', a);
}

editor.focus = () => document.getElementById('name').focus();
