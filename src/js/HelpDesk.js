import TicketView from './TicketView';
import TicketForm from "./TicketForm";
import Modal from './Modal';

/**
 *  Основной класс приложения
 * */
export default class HelpDesk {
  constructor(container, ticketService) {
    if (!(container instanceof HTMLElement)) {
      throw new Error('This is not HTML element!');
    }
    this.container = container;
    this.ticketService = ticketService;
    this.tickets = [];

    this.modal = new Modal();

    this.onClickButton = this.onClickButton.bind(this);
  }

  init() {
    this.renderLayout();
    this.loadTickets();

    this.eventListeners();
  }

  eventListeners() {
    this.addTicketBtn.addEventListener('click', this.onClickButton);
  }

  renderLayout() {
    while (this.container.firstChild) {
      this.container.removeChild(this.container.firstChild);
    }

    const containerDiv = document.createElement('div');
    containerDiv.className = 'container';

    const header = document.createElement('div');
    header.className = 'header';

    const title = document.createElement('h1');
    title.textContent = 'HelpDesk';

    this.addTicketBtn = document.createElement('button');
    this.addTicketBtn.className = 'add-ticket-btn';
    this.addTicketBtn.textContent = 'Добавить тикет';

    header.append(title, this.addTicketBtn);

    this.ticketsList = document.createElement('ul');
    this.ticketsList.className = 'ticket-list';

    containerDiv.append(header, this.ticketsList);
    this.container.append(containerDiv);
  }

  onClickButton() {
    this.showCreateTicketForm();
  }

  loadTickets() {
    this.clearMessages();

    const loadingItem = document.createElement('li');
    loadingItem.className = 'loading';
    loadingItem.textContent = 'Загрузка данных...';
    this.ticketsList.append(loadingItem);

    this.ticketService.list((err, tickets) => {
      this.clearMessages();

      if (err) {
        console.error('Ошибка загрузки данных', err);
        const errItem = document.createElement('li');
        errItem.className = 'error';
        errItem.textContent = 'Не удалось загрузить тикеты';
        this.ticketsList.append(errItem);
        return;
      }

      this.tickets = tickets;
      this.renderTickets();
    });
  }

  renderTickets() {
    const ticketItems = this.ticketsList.querySelectorAll('.ticket-item');
    ticketItems.forEach((item) => item.remove());

    if (!this.tickets || this.tickets.length === 0) {
      const emptyItem = document.createElement('li');
      emptyItem.className = 'empty';
      emptyItem.textContent = 'Тикетов нет';
      this.ticketsList.append(emptyItem);
      return;
    }

    this.tickets.forEach((ticket) => {
      const ticketItem = this.createTicketElement(ticket);
      this.ticketsList.append(ticketItem);
    });
  }

  createTicketElement(ticket) {
    const ticketView = new TicketView(ticket);
    const { ticketElement } = ticketView;

    const ticketStatus = ticketElement.querySelector('.ticket-status');
    const editBtn = ticketElement.querySelector('.edit-btn');
    const deleteBtn = ticketElement.querySelector('.delete-btn');
    const ticketContent = ticketElement.querySelector('.ticket-content');

    ticketStatus.addEventListener('click', (e) => {
      e.stopPropagation();
      this.toggleTicketStatus(ticket.id);
    });

    editBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      this.editTicket(ticket.id);
    });

    deleteBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      this.deleteTicket(ticket.id);
    });

    ticketContent.addEventListener('click', (e) => {
      if (!e.target.closest('.ticket-actions')) {
        this.showTicketDesc(ticket, ticketElement);
      }
    });

    return ticketElement;
  }

  toggleTicketStatus(ticketId) {
    const ticket = this.tickets.find((t) => t.id === ticketId);

    const updateData = {
      name: ticket.name,
      description: ticket.description || '',
      status: !ticket.status,
    };

    this.updateTicket(ticketId, updateData);
  }

  showTicketDesc(ticket, ticketElement) {
    let descriptionElement = ticketElement.querySelector('.ticket-description');

    if (!descriptionElement) {
      descriptionElement = document.createElement('div');
      descriptionElement.className = 'ticket-description';
      descriptionElement.style.display = 'block';

      if (ticket.description) {
        descriptionElement.textContent = ticket.description;
        ticketElement.append(descriptionElement);
      } else {
        descriptionElement.textContent = 'Загрузка описания...';
        ticketElement.append(descriptionElement);

        this.ticketService.get(ticket.id, (err, fullTicket) => {
          if (err) {
            descriptionElement.textContent = 'Не удалось загрузить описание';
            return;
          }

          const index = this.tickets.findIndex((t) => t.id === ticket.id);
          if (index !== -1) {
            this.tickets[index].description = fullTicket.description;
          }

          descriptionElement.textContent = fullTicket.description || 'Нет описания';
        });
      }
      return;
    }
    if (descriptionElement.style.display === 'none') {
      descriptionElement.style.display = 'block';
    } else {
      descriptionElement.style.display = 'none';
    }
  }

  deleteTicket(ticketId) {
    const ticket = this.tickets.find((t) => t.id === ticketId);

    const confirmDiv = document.createElement('div');
    confirmDiv.textContent = `Подтвердите удаление тикета: ${ticket.name}`;

    const cancelBtn = document.createElement('button');
    cancelBtn.className = 'btn btn-cancel';
    cancelBtn.textContent = 'Отмена';
    cancelBtn.addEventListener('click', this.modal.hide);

    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'btn btn-delete';
    deleteBtn.textContent = 'Удалить';
    deleteBtn.addEventListener('click', () => {
      this.modal.hide();
      this.performDelete(ticketId);
    });

    this.modal.setTitle('Подтверждение удаления').setBody(confirmDiv).setFooter([cancelBtn, deleteBtn]).show();
  }

  performDelete(ticketId) {
    this.ticketService.delete(ticketId, (err) => {
      if (err) {
        console.error('Ошибка при удалении тикета:', err);
        return;
      }

      this.tickets = this.tickets.filter((t) => t.id !== ticketId);
      this.loadTickets();
    });
  }

  showCreateTicketForm() {
    const ticketForm = new TicketForm();
    const form = ticketForm.createForm();

    ticketForm.setOnSubmit((ticketData) => {
      this.modal.hide();
      this.createTicket(ticketData);
    });

    ticketForm.setOnCancel(() => {
      this.modal.hide();
    });

    this.modal.setTitle('Добавить тикет').setBody(form).setFooter([]).show();
  }

  createTicket(ticketData) {
    this.ticketService.create(ticketData, (err, newTicket) => {
      if (err) {
        console.error('Ошибка создания тикета', err);
        alert('Не удалось добавить тикет');
        return;
      }

      this.tickets.push(newTicket);
      this.loadTickets();
    });
  }

  editTicket(ticketId) {
    const ticket = this.tickets.find((t) => t.id === ticketId);
    this.showEditTicketForm(ticket);
  }

  showEditTicketForm(ticket) {
    const newName = prompt('Введите новое название:', ticket.name);
    if (!newName) return;

    const newDescription = prompt('Введите новое описание:', ticket.description || '');

    const updateData = {
      name: newName,
      description: newDescription || '',
      status: ticket.status,
    };

    this.updateTicket(ticket.id, updateData);
  }

  updateTicket(id, ticketData) {
    this.ticketService.update(id, ticketData, (err, allTickets) => {
      if (err) {
        console.error('Ошибка обновления тикета', err);
        alert('Не удалось обновить тикет');
        return;
      }

      const updatedTicket = allTickets.find((t) => t.id === id);

      console.log('Тикет обновлен', updatedTicket);

      const index = this.tickets.findIndex((t) => t.id === id);
      if (index !== -1) {
        this.tickets[index] = updatedTicket;
      }

      const ticketElement = this.ticketsList.querySelector(`[data-id="${id}"]`);
      if (ticketElement) {
        this.updateTicketElement(ticketElement, updatedTicket);
      }
    });
  }

  updateTicketElement(el, ticket) {
    const statusCheckbox = el.querySelector('.ticket-status');
    if (statusCheckbox) {
      statusCheckbox.classList.toggle('done', ticket.status);
    }

    const nameElement = el.querySelector('.ticket-name');
    if (nameElement) {
      nameElement.textContent = ticket.name;
    }

    const descriptionElement = el.querySelector('.ticket-description');
    if (descriptionElement) {
      descriptionElement.textContent = ticket.description;
    }
  }

  clearMessages() {
    const messages = this.ticketsList.querySelectorAll('.loading, .error, .empty');
    messages.forEach((message) => message.remove());
  }
}
