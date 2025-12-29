const createRequest = async (options = {}) => {
  const { method, data, id } = options;
  const url = 'https://neto-js-http-backend.onrender.com';
  let requestUrl = `${url}?method=${method}`;

  if (id) {
    requestUrl += `&id=${id}`;
  }

  const requestOptions = {
    method: method === 'createTicket' || method === 'updateById' ? 'POST' : 'GET',
  };

  if (requestOptions.method === 'POST') {
    requestOptions.headers = {
      'Content-Type': 'application/json',
    };
    requestOptions.body = JSON.stringify(data);
  }

  const response = await fetch(requestUrl, requestOptions);

  if (!response.ok) {
    throw new Error(response.statusText);
  }
  return response.json();
};

export default createRequest;
