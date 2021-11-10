import axios from 'axios';

const fetchClient = () => {
  const instance = axios.create();

  // Set the AUTH token for any request
  instance.interceptors.request.use(function (config) {
    const account = JSON.parse(localStorage.getItem('account'));
    if (account) {
        config.headers.Authorization = account.token;
    }
    return config;
  });

  return instance;
};

export default fetchClient();