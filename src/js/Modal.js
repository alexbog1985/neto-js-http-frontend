import '../css/Modal.css';

export default class Modal {
  constructor() {
    this.modalElement = null;
    this.modalContent = null;
    this.modalTitle = null;

    this.hide = this.hide.bind(this);

    this.init();
  }

  init() {
    this.modalElement = document.createElement('div');
    this.modalElement.className = 'modal';
    this.modalElement.addEventListener('click', (e) => {
      if (e.target === this.modalElement) {
        this.hide();
      }
    });

    this.modalContent = document.createElement('div');
    this.modalContent.className = 'modal-content';

    const header = document.createElement('div');
    header.className = 'modal-header';

    this.modalTitle = document.createElement('h2');
    this.modalTitle.className = 'modal-title';

    const closeBtn = document.createElement('button');
    closeBtn.className = 'modal-close-btn';
    closeBtn.textContent = '\u00D7';
    closeBtn.addEventListener('click', () => this.hide());

    header.append(this.modalTitle, closeBtn);

    this.modalBody = document.createElement('div');
    this.modalBody.className = 'modal-body';

    this.modalFooter = document.createElement('div');
    this.modalFooter.className = 'modal-footer';

    this.modalContent.append(header, this.modalBody, this.modalFooter);
    this.modalElement.append(this.modalContent);

    document.body.append(this.modalElement);

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.isVisible()) {
        this.hide();
      }
    });
  }

  setTitle(title) {
    this.modalTitle.textContent = title;
    return this;
  }

  setBody(content) {
    this.modalBody.innerHTML = '';

    if (typeof content === 'string') {
      this.modalBody.textContent = content;
    } else if (content instanceof HTMLElement) {
      this.modalBody.append(content);
    }

    return this;
  }

  setFooter(buttons = []) {
    this.modalFooter.innerHTML = '';

    if (buttons.length === 0) {
      this.modalFooter.style.display = 'none';
    } else {
      this.modalFooter.style.display = 'flex';
      buttons.forEach((button) => {
        this.modalFooter.append(button);
      });
    }
    return this;
  }

  show() {
    this.modalElement.style.display = 'block';
  }

  hide() {
    this.modalElement.style.display = 'none';
  }

  isVisible() {
    return this.modalElement.style.display === 'block';
  }
}
