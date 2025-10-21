import { createRouter, createWebHistory } from 'vue-router'
import BookingView from '../components/BookingView.vue'
import AdminView from '../components/AdminView.vue'
import NotFound from '../components/NotFound.vue'

const routes = [
  {
    path: '/',
    name: 'Booking',
    component: BookingView
  },
  {
    path: '/admin', // This is the page for you to create slots
    name: 'Admin',
    component: AdminView
  },
  {
    path: '/:pathMatch(.*)*', // Catch-all 404 route
    name: 'NotFound',
    component: NotFound
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router