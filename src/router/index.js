import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/Home.vue'

const routes = [
  {
    path: '/',
    name: 'home',
    component: HomeView
  },
  {
    path: '/cart',
    name: 'cart',
    component: () => import('../views/Cart.vue')
  },
  {
    path: '/wishlist',
    name: 'wishlist',
    component: () => import('../views/Wishlist.vue')
  },
  {
    path: '/profile',
    name: 'profile',
    component: () => import('../views/Profile.vue')
  }
  ,
  {
    path: '/loginadmin',
    name: 'loginadmin',
    component: () => import('../views/LoginAdmin.vue')
  }
  ,
  {
    path: '/admin',
    name: 'admin',
    component: () => import('../views/Admin.vue')
  }
  ,
  {
    path: '/usertable',
    name: 'usertable',
    component: () => import('../views/UserTable.vue')
  }
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
})

export default router
