// ---------- Spinner --------------------------------------
export class Spinner {

  static spinner = document.querySelector('.spinner');

  static show() {
    this.spinner.classList.add('on');
  }

  static hide() {
    this.spinner.classList.remove('on');
  }
}