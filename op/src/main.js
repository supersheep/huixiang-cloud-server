// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import App from './App'
import ElementUI from 'element-ui'
import VueRouter from 'vue-router'
import 'element-ui/lib/theme-default/index.css'
import account from 'account'

Vue.use(ElementUI)
Vue.use(VueRouter)

const routes = [
  { path: '/', meta: { auth: true }, component: require('./components/Home') },
  { path: '/piece', meta: { auth: true }, component: require('./components/PieceManager') },
  { path: '/login', component: require('./components/Login') },
  { path: '/test', meta: { auth: true }, component: require('./components/Test') }
]

let router = new VueRouter({
  routes
})

router.beforeEach((to, from, next) => {
  if (!account.isLogin() && to.meta.auth) {
    console.log('go login')
    router.push({
      path: '/login',
      query: {
        redir: to.path
      }
    })
  } else {
    next()
  }
})

/* eslint-disable no-new */
new Vue({
  router: router,
  el: '#app',
  template: '<App />',
  components: { App }
})
