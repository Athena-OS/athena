// ---------- Navigation -----------------------------------
export class Nav {

  static {
    document.querySelectorAll('label[for^="nav"]').forEach(i =>
      this[i.dataset.i18n] = i.control);
  }

  static get(pram = location.search.substring(1)) {
    pram && this[pram] && (this[pram].checked = true);
  }
}