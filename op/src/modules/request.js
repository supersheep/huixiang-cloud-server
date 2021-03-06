import qs from 'qs'
let baseURL = '/api'

const request = (method, path, data) => {
  var account = require('account').default
  var notOk = false
  var headers = {
    'Accept': 'application/json',
    'Content-Type': 'application/json'
  }
  var token = account.getToken()
  headers['x-access-token'] = token
  var url = baseURL + path
  var canHasBody = ['get', 'head'].indexOf(method) === -1
  if (!canHasBody) {
    url += '?' + qs.stringify(data)
  }

  return fetch(url, {
    method: method,
    body: canHasBody ? JSON.stringify(data) : null,
    headers: headers,
    credentials: 'include'
  })
  .then((resp) => {
    if (resp.status === 200) {
      return resp.json()
    }
    if (resp.status === 401 || resp.status === 403) {
      account.logout()
    }
    notOk = true
    return resp.text()
    // if (resp.code === 200) {}
  }).then((result) => {
    if (notOk) {
      throw new Error(result)
    }
    return result
  })
}

['get', 'post', 'put', 'delete'].forEach((method) => {
  request[method] = (path, data) => {
    return request(method, path, data)
  }
})

export default request
