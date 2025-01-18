// ---------- Internationalization (Side Effect) -----------
// eslint-disable-next-line no-unused-vars
class I18n {

  static {
    document.querySelectorAll('template').forEach(i => this.set(i.content));
    this.set();
    // document.body.style.opacity = 1;                        // show after i18n
  }

  static set(target = document) {
    target.querySelectorAll('[data-i18n]').forEach(elem => {
      let [text, attr] = elem.dataset.i18n.split('|');
      text = browser.i18n.getMessage(text);
      attr ? elem.setAttribute(attr, text) : elem.append(text);
    });
  }
}