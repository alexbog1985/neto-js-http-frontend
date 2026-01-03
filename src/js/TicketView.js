/**
 *  Класс для отображения тикетов на странице.
 *  Он содержит методы для генерации разметки тикета.
 * */
export default class TicketView {
  constructor(ticket) {
    this.ticket = ticket;
    this.ticketElement = null;

    this.createTicket();
  }

  createTicket() {
    this.ticketElement = document.createElement('li');
    this.ticketElement.className = 'ticket-item';
    this.ticketElement.dataset.id = this.ticket.id;

    const ticketContent = document.createElement('div');
    ticketContent.className = 'ticket-content';

    const ticketStatus = document.createElement('div');
    ticketStatus.className = 'ticket-status';
    if (this.ticket.status) {
      ticketStatus.classList.add('done');
    }

    const ticketName = document.createElement('div');
    ticketName.className = 'ticket-name';
    ticketName.textContent = this.ticket.name;

    const ticketDate = document.createElement('div');
    ticketDate.className = 'ticket-date';
    ticketDate.textContent = this.formatDate(this.ticket.created);

    const ticketActions = document.createElement('div');
    ticketActions.className = 'ticket-actions';

    const editBtn = document.createElement('button');
    editBtn.className = 'edit-btn';
    editBtn.textContent = '\u270E';

    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'delete-btn';
    deleteBtn.textContent = '\u00D7';

    ticketActions.append(editBtn, deleteBtn);
    ticketContent.append(ticketStatus, ticketName, ticketDate, ticketActions);
    this.ticketElement.append(ticketContent);
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
