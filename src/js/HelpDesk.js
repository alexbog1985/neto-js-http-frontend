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

    this.onClickButton = this.onClickButton.bind(this);
  }

  init() {
    console.info('init');
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
    console.log('Кнопка "Добавить тикет" нажата');
  }

  loadTickets() {
    console.log('Загрузка данных...');

    const loadingItem = document.createElement('li');
    loadingItem.className = 'loading';
    loadingItem.textContent = 'Загрузка данных...';
    this.ticketsList.append(loadingItem);

    this.ticketService.list((err, tickets) => {
      // this.ticketsList.firstChild.remove();

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
    // this.ticketsList.firstChild.remove();

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
    const li = document.createElement('li');
    li.className = 'ticket-item';
    li.dataset.id = ticket.id;

    const ticketContent = document.createElement('div');
    ticketContent.className = 'ticket-content';

    const ticketStatus = document.createElement('div');
    ticketStatus.className = 'ticket-status';
    ticketStatus.textContent = ticket.status ? 'done' : '';

    const ticketName = document.createElement('div');
    ticketName.className = 'ticket-name';
    ticketName.textContent = ticket.name;

    const ticketDate = document.createElement('div');
    ticketDate.className = 'ticket-date';
    ticketDate.textContent = ticket.date;

    li.innerHTML = `
      <div class="ticket-content">
        <div class="ticket-status ${ticket.status ? 'done' : ''}"></div>
        <div class="ticket-name">${this.escapeHtml(ticket.name)}</div>
        <div class="ticket-date">${this.formatDate(ticket.created)}</div>
        <div class="ticket-actions">
          <button class="edit-btn">✎</button>
          <button class="delete-btn">×</button>
        </div>
      </div>
    `;

    return li;
  }

  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  formatDate(timestamp) {
    const date = new Date(timestamp);
    return date.toLocaleString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }
}
