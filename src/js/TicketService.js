import createRequest from './api/createRequest';

/**
 *  Класс для связи с сервером.
 *  Содержит методы для отправки запросов на сервер и получения ответов
 */
export default class TicketService {
  // Получить все тикеты
  list(callback) {
    createRequest({ method: 'allTickets' })
      .then((tickets) => callback(null, tickets))
      .catch((err) => callback(err, null));
  }

  get(id, callback) {
    createRequest({ method: 'ticketById', id })
      .then((ticket) => callback(null, ticket))
      .catch((err) => callback(err, null));
  }

  create(data, callback) {
    createRequest({ method: 'createTicket', data })
      .then((newTicket) => callback(null, newTicket))
      .catch((err) => callback(err, null));
  }

  update(id, data, callback) {
    createRequest({ method: 'updateById', id, data })
      .then((allTickets) => callback(null, allTickets))
      .catch((err) => callback(err, null));
  }

  delete(id, callback) {
    createRequest({ method: 'deleteById', id })
      .then(() => callback(null, true))
      .catch((err) => callback(err, null));
  }
}
