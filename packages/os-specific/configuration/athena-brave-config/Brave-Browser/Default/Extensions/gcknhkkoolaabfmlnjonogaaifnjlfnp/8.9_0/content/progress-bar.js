// ---------- Progress Bar ---------------------------------
export class ProgressBar {

  static bar = document.querySelector('.progress-bar');

  static show() {
    this.bar.classList.toggle('on');
    setTimeout(() => this.bar.classList.toggle('on'), 2000);
  }
}