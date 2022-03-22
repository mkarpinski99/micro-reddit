import axios from 'axios';

axios.defaults.withCredentials = true;
// axios.defaults.baseURL = "http://localhost:3000/";
axios.defaults.baseURL = location.protocol + '//' + location.hostname + ':' + '3000';
// ( () => {
//   axios.interceptors.request.use(
//     request => {
//       request.withCredentials = true;
//       return request;
//     },
//     error => {
//       return Promise.reject(error);
//     }
//   );
// })();



