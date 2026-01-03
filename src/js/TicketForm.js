import '../css/TicketForm.css';
/**
 *  Класс для создания формы для создания нового тикета
 * */
export default class TicketForm {
  constructor(ticket = null) {
    this.ticket = ticket;
    this.formElement = null;
    this.onSubmit = null;
    this.onCancel = null;
  }

  setOnSubmit(callback) {
    this.onSubmit = callback;
    return this;
  }

  setOnCancel(callback) {
    this.onCancel = callback;
    return this;
  }

  createForm() {
    const form = document.createElement('form');
    form.className = 'ticket-form';

    const nameGroup = document.createElement('div');
    nameGroup.className = 'form-group';

    const nameLabel = document.createElement('label');
    nameLabel.textContent = 'Название тикета';
    nameLabel.htmlFor = 'ticket-name';

    const nameInput = document.createElement('input');
    nameInput.type = 'text';
    nameInput.id = 'ticket-name';
    nameInput.className = 'form-control';
    nameInput.required = true;

    if (this.ticket) {
      nameInput.value = this.ticket.name;
    }

    nameGroup.append(nameLabel, nameInput);

    const descGroup = document.createElement('div');
    descGroup.className = 'form-group';

    const descLabel = document.createElement('label');
    descLabel.textContent = 'Подробное описание';
    descLabel.htmlFor = 'ticket-description';

    const descTextarea = document.createElement('textarea');
    descTextarea.id = 'ticket-description';
    descTextarea.className = 'form-control';
    descTextarea.rows = 4;

    if (this.ticket && this.ticket.description) {
      descTextarea.value = this.ticket.description;
    }

    descGroup.append(descLabel, descTextarea);

    let statusGroup = null;
    if (this.ticket) {
      statusGroup = document.createElement('div');
      statusGroup.className = 'form-group checkbox-group';

      const statusLabel = document.createElement('label');
      statusLabel.className = 'checkbox-label';

      const statusCheckbox = document.createElement('input');
      statusCheckbox.type = 'checkbox';
      statusCheckbox.id = 'ticket-status';
      statusCheckbox.checked = this.ticket.status || false;

      const statusText = document.createTextNode('Выполнено');
      statusLabel.append(statusCheckbox, statusText);
      statusGroup.append(statusLabel);
    }

    const formFooter = document.createElement('div');
    formFooter.className = 'form-footer';

    const cancelBtn = document.createElement('button');
    cancelBtn.type = 'button';
    cancelBtn.className = 'btn btn-cancel';
    cancelBtn.textContent = 'Отмена';

    const submitBtn = document.createElement('button');
    submitBtn.type = 'submit';
    submitBtn.className = 'btn btn-submit';
    submitBtn.textContent = this.ticket ? 'Сохранить' : 'Создать';

    formFooter.append(cancelBtn, submitBtn);

    form.append(nameGroup, descGroup);
    if (statusGroup) {
      form.append(statusGroup);
    }
    form.append(formFooter);

    cancelBtn.addEventListener('click', (e) => {
      e.preventDefault();
      if (this.onCancel && typeof this.onCancel === 'function') {
        this.onCancel();
      }
    });

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      this.handleSubmit(form);
    });

    this.formElement = form;
    return form;
  }

  handleSubmit(form) {
    const formData = new FormData(form);
    const ticketData = {
      name: formData.get('ticket-name'),
      description: formData.get('ticket-description') || '',
    };

    if (this.ticket) {
      const statusCheckbox = form.querySelector('#ticket-status');
      ticketData.status = statusCheckbox ? statusCheckbox.checked : false;
    }

    if (this.onSubmit) {
      this.onSubmit(ticketData);
    }
  }

  destroy() {
    if (this.formElement && this.formElement.parentNode) {
      this.formElement.parentNode.removeChild(this.formElement);
    }
    this.formElement = null;
  }
}
