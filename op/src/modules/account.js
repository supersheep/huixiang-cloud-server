import request from 'request'

var token = localStorage.getItem('token')
var isLogin = () => {
  return token
}

var logout = () => {
  token = null
  localStorage.removeItem('token')
}

var login = (name, password) => {
  return new Promise((resolve, reject) => {
    request.post('/login', {
      name,
      password
    }).then((json) => {
      localStorage.setItem('token', json.token)
      token = json.token
      resolve()
    }).catch(() => {
      logout()
      reject()
    })
  })
}

let getToken = () => {
  return token
}

export default {
  login,
  logout,
  getToken,
  isLogin
}
