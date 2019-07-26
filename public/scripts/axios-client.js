function userAuthHeaders() {
  axios.defaults.headers.common['Authorization'] = 'Bearer ' + localStorage.getItem('authToken');
}

async function getFiles() {
  userAuthHeaders();
  axios.get('/user/files')
    .then(function (response) {
      console.log(response.data);
      if (response.data.result) {
        return response.data.data
      }
    })
    .catch(function (error) {
      // handle error
      console.log(error);
    });
}

