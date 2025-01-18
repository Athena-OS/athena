/* global cookies */
'use strict';

function parseCookiesTxt(cookiesTxt) {
  const cookies = [];

  // Split the cookiesTxt into individual lines
  const lines = cookiesTxt.split('\n');

  // Loop through each line
  lines.forEach(line => {
    // Skip lines starting with '#' (comments) or empty lines
    if (!line.trim() || line.trim().startsWith('#')) {
      return;
    }

    const fields = line.split('\t');

    // Ensure the line has the correct number of fields
    if (fields.length !== 7) {
      throw Error('Each cookie line need to have 7 fields: \n\n' + line + ' -> ' + 'Fields: ' + fields.length);
    }

    // Extract fields
    const domain = fields[0];
    const hostOnly = fields[1];
    const path = fields[2];
    const secure = fields[3];
    const expirationDate = fields[4] ? parseFloat(fields[4]) : fields[4];
    const name = fields[5];
    const value = fields[6];

    // Check if expirationDate is a valid number
    if (expirationDate && isNaN(expirationDate)) {
      throw Error('expirationDate of a cookie line is not a valid number:\n' + line);
    }

    if (hostOnly !== 'TRUE' && hostOnly !== 'FALSE') {
      throw Error('hostOnly field of a cookie line is not TRUE/FALSE');
    }
    if (hostOnly !== 'TRUE' && hostOnly !== 'FALSE') {
      throw Error('secure field of a cookie line is not TRUE/FALSE');
    }

    // Create cookie object
    const cookie = {
      domain,
      hostOnly: hostOnly === 'TRUE',
      httpOnly: false, // Default to false, as this information is not available in cookies.txt
      name,
      path,
      sameSite: 'no_restriction', // Default to "no_restriction" as it's not available in cookies.txt
      secure: secure === 'TRUE',
      storeId: '0', // Default to "0", as this information is not available in cookies.txt
      value,
      origin: `http${secure === 'TRUE' ? 's' : ''}://${domain.replace(/^\./, '')}`
    };
    if (expirationDate) {
      cookie.expirationDate = expirationDate;
      cookie.session = false;
    }
    else {
      cookie.session = true;
    }

    // Push cookie object into the cookies array
    cookies.push(cookie);
  });

  return cookies;
}

const importJSON = async json => {
  const errors = [];

  for (const c of json) {
    delete c.hostOnly;
    await cookies.replace(c.origin, c, c).catch(e => {
      errors.push(c.name + ': ' + e.message);
    });
  }

  if (errors.length) {
    alert('Importing Errors:\n\n' + errors.join('\n'));
  }

  const log = document.getElementById('log');
  const c = json.length - errors.length;
  log.textContent = c + ' cookie' + (c > 1 ? 's are' : ' is') + ' imported';

  setTimeout(() => log.textContent = '', 2000);
};

document.getElementById('import').addEventListener('change', ({target}) => {
  if (target.value !== target.initialValue) {
    const file = target.files[0];
    if (file.size > 10e6) {
      alert('Error: \n\nFile is too large');
      return;
    }
    const reader = new FileReader();
    reader.onloadend = event => {
      target.value = '';

      try {
        if (file.type.includes('json')) {
          const json = JSON.parse(event.target.result);
          importJSON(json);
        }
        else if (file.type === 'text/plain') {
          const json = parseCookiesTxt(event.target.result);
          importJSON(json);
        }
        else {
          alert('The "' + file.type + '" format is not supported!');
        }
      }
      catch (e) {
        alert('Error on Importing:\n\n' + e.message);
      }
    };
    reader.readAsText(file, 'utf-8');
  }
});


// links
for (const a of [...document.querySelectorAll('[data-href]')]) {
  if (a.hasAttribute('href') === false) {
    a.href = chrome.runtime.getManifest().homepage_url + '#' + a.dataset.href;
  }
}
