import TicketView from './TicketView';

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
    this.currentModal = null;
    this.currentForm = null;

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

      console.log('Данные загружены', tickets);
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

    ticketStatus.addEventListener('click', (e) => {
      e.stopPropagation();
      this.toggleTicketStatus(ticket);
    });

    editBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      console.log('Редактировать тикет:', ticket.id);
      this.editTicket(ticket);
    });
    //
    // deleteBtn.addEventListener('click', (e) => {
    //   e.stopPropagation();
    //   console.log('Удалить тикет:', ticket.id);
    //   this.deleteTicket(ticket);
    // });
    //
    // ticketContent.addEventListener('click', (e) => {
    //   if (!e.target.closest('.ticket-actions')) {
    //     this.showTicketDesc(ticket, li);
    //   }
    // });

    return ticketElement;
  }

  toggleTicketStatus(ticket) {
    console.log('Меняем статус тикета', ticket);

    const updateData = {
      name: ticket.name,
      description: ticket.description || '',
      status: !ticket.status,
    };

    this.updateTicket(ticket.id, updateData);
  }

  showTicketDesc(ticket, ticketElement) {
    console.log('Показываем описание тикета', ticket.id);

    let descriptionElement = ticketElement.querySelector('.ticket-description');

    if (!descriptionElement) {
      descriptionElement = document.createElement('div');
      descriptionElement.className = 'ticket-description';

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
    if (descriptionElement.style.display === 'none' || !descriptionElement.style.display) {
      descriptionElement.style.display = 'block';
    } else {
      descriptionElement.style.display = 'none';
    }
  }

  deleteTicket(ticket) {
    const confirmDelete = confirm('Вы уверены?');

    if (!confirmDelete) {
      return;
    }

    console.log('Удаляем тикет:', ticket.id);

    this.ticketService.delete(ticket.id, (err) => {
      if (err) {
        console.error('Ошибка при удалении тикета:', err);
        return;
      }

      this.tickets = this.tickets.filter((t) => t.id !== ticket.id);

      this.loadTickets();
    });
  }

  showCreateTicketForm() {
    const name = prompt('Введите название тикета:');
    if (!name) return;

    const description = prompt('Введите описание:');

    const ticketData = {
      name,
      description: description || '',
    };

    this.createTicket(ticketData);
  }

  createTicket(ticketData) {
    console.log('Создаем новый тикет', ticketData);

    this.ticketService.create(ticketData, (err, newTicket) => {
      if (err) {
        console.error('Ошибка создания тикета', err);
        alert('Не удалось добавить тикет');
        return;
      }

      console.log('Тикет создан', newTicket);

      this.tickets.push(newTicket);

      this.loadTickets();
    });
  }

  editTicket(ticket) {
    console.log('Редактируем тикет:', ticket.id);
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
    console.log('Обновляем тикет', id, ticketData);

    this.ticketService.update(id, ticketData, (err, allTickets) => {
      if (err) {
        console.error('Ошибка обновления тикета', err);
        alert('Не удалось обновить тикет');
        return;
      }

      const indexOfUpdatedTicket = allTickets.findIndex((t) => t.id === id);
      const updatedTicket = allTickets[indexOfUpdatedTicket];

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
