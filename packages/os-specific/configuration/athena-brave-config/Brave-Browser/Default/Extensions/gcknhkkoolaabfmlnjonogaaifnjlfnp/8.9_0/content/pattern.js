export class Pattern {

  static validate(str, type, showError) {
    const pat = this.get(str, type);
    try {
      new RegExp(pat);
      return true;
    }
    catch(error) {
      showError && alert([browser.i18n.getMessage('regexError'), str, error].join('\n'));
    }
  }

  static get(str, type) {
    return type === 'wildcard' ? this.convertWildcard(str) : str;
  }

  // convert wildcard to regex string
  static convertWildcard(str) {
    if (str === '*') { return '\\S+'; }

    // escape regular expression special characters, minus * ?
    str = str.replace(/[.+^${}()|[\]\\]/g, '\\$&')
              .replace(/\*/g, '.*')
              .replace(/\?/g, '.')
              .replace(/:\/\/\.\*\\./g, '://([^/]+\\.)?');

    // convert leading '://' or '.*://'
    switch (true) {
      case str.startsWith('://'):
        str = '^[^:]+' + str;
        break;

      case str.startsWith('.*://'):
        str = '^[^:]+' + str.substring(2);
        break;
    }

    return str;
  }

  static getPassthrough(str) {
    if (!str) { return [[], [], []]; }

    const regex = [];                                       // RegExp string
    const ipMask = [];                                      // 10.0.0.0/24 -> [ip, mask] e.g ['10.0.0.0', '255.255.255.0']
    const stEnd = [];                                       // 10.0.0.0/24 -> [start, end] e.g. ['010000000000', '010000000255']

    str.split(/[\s,;]+/).forEach(i => {
      if (i === '<local>') {                                // The literal string <local> matches simple hostnames (no dots)
        regex.push('^[a-z]+://[^.]+/');
        return;
      }

      // --- CIDR
      const [, ip, , mask] = i.match(/^(\d+(\.\d+){3})\/(\d+)$/) || [];
      if (ip && mask) {
        const netmask = this.getNetmask(mask);
        ipMask.push(ip, netmask);
        stEnd.push(this.getRange(ip, netmask));
        return;
      }

      // --- pattern
      i = i.replaceAll('.', '\\.')                          // literal '.'
            .replaceAll('*', '.*');                         // wildcard
      i.startsWith('\\.') && (i = '^[a-z]+://.*' + i);      // starting with '.'
      !i.includes('://') && (i = '^[a-z]+://' + i);         // add scheme
      !i.startsWith('^') && (i = '^' + i);                  // add start with assertion
      i += '/';                                             // add end of host forward slash
      regex.push(i);
    });

    return [regex, ipMask, stEnd];
  }

  // ---------- CIDR ---------------------------------------
  // convert mask to netmask
  static getNetmask(mask) {
    return [...Array(4)].map(() => {
      const n = Math.min(mask, 8);
      mask -= n;
      return 256 - Math.pow(2, 8-n);
    }).join('.');
  }

  // convert to padded start & end
  static getRange(ip, mask) {
    let st = ip.split('.');                                 // ip array
    const ma = mask.split('.');                             // mask array
    let end = st.map((v, i) => Math.min(v-ma[i]+255, 255) + ''); // netmask wildcard array
    st = st.map(i => i.padStart(3, '0')).join('');
    end = end.map(i => i.padStart(3, '0')).join('');

    return [st, end];
  }
}