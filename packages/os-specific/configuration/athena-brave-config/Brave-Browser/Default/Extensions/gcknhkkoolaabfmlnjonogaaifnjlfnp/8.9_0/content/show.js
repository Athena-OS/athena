import {App} from './app.js';

// ---------- Show (Side Effect) -----------
// eslint-disable-next-line no-unused-vars
class Show {

  static {
    const elem = document.querySelector('img[src="../image/icon.svg"]');
    elem?.addEventListener('click', () => this.added ? this.remove() : this.add());
    this.add();
  }

  // --- hide elements for Basic & Chrome
  static add() {
    this.added = true;
    App.basic && document.body.classList.add('basic');
    !App.firefox && document.body.classList.add('chrome');
  }

  // --- show elements
  static remove() {
    this.added = false;
    document.body.classList.remove('basic', 'chrome');
  }
}