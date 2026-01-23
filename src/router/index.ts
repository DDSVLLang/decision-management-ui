import { createRouter, createWebHistory } from 'vue-router'
import DecisionList from '../views/DecisionList.vue'
import DecisionDetail from '../views/DecisionDetail.vue'
import DecisionForm from '../views/DecisionForm.vue'
import Reports from '../views/Reports.vue'
import Login from '../views/Login.vue'
import UserList from '../views/UserList.vue'
import UserDetail from '../views/UserDetail.vue'
import UserForm from '../views/UserForm.vue'
import ManagementOverview from '../views/ManagementOverview.vue'
import TopicsManagement from '../views/TopicsManagement.vue'
import CommitteesManagement from '../views/CommitteesManagement.vue'
import DepartmentsManagement from '../views/DepartmentsManagement.vue'
import { useAuthStore } from '../stores/auth'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/login',
      name: 'login',
      component: Login,
      meta: { requiresGuest: true }
    },
    {
      path: '/',
      name: 'decisions',
      component: DecisionList,
      meta: { requiresAuth: true }
    },
    {
      path: '/decisions/new',
      name: 'decision-new',
      component: DecisionForm,
      meta: { requiresAuth: true }
    },
    {
      path: '/decisions/:id',
      name: 'decision-detail',
      component: DecisionDetail,
      props: true,
      meta: { requiresAuth: true }
    },
    {
      path: '/decisions/:id/edit',
      name: 'decision-edit',
      component: DecisionForm,
      props: true,
      meta: { requiresAuth: true }
    },
    {
      path: '/reports',
      name: 'reports',
      component: Reports,
      meta: { requiresAuth: true }
    },
    {
      path: '/users',
      name: 'users',
      component: UserList,
      meta: { requiresAuth: true, requiresAdmin: true }
    },
    {
      path: '/users/new',
      name: 'user-new',
      component: UserForm,
      meta: { requiresAuth: true, requiresAdmin: true }
    },
    {
      path: '/users/:id',
      name: 'user-detail',
      component: UserDetail,
      props: true,
      meta: { requiresAuth: true, requiresAdmin: true }
    },
    {
      path: '/users/:id/edit',
      name: 'user-edit',
      component: UserForm,
      props: true,
      meta: { requiresAuth: true, requiresAdmin: true }
    },
    {
      path: '/management',
      name: 'management',
      component: ManagementOverview,
      meta: { requiresAuth: true, requiresAdmin: true }
    },
    {
      path: '/management/topics',
      name: 'management-topics',
      component: TopicsManagement,
      meta: { requiresAuth: true, requiresAdmin: true }
    },
    {
      path: '/management/committees',
      name: 'management-committees',
      component: CommitteesManagement,
      meta: { requiresAuth: true, requiresAdmin: true }
    },
    {
      path: '/management/departments',
      name: 'management-departments',
      component: DepartmentsManagement,
      meta: { requiresAuth: true, requiresAdmin: true }
    }
  ]
})

router.beforeEach(async (to, _from, next) => {
  const authStore = useAuthStore()

  while (authStore.loading) {
    await new Promise(resolve => setTimeout(resolve, 50))
  }

  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    next({ name: 'login' })
  } else if (to.meta.requiresGuest && authStore.isAuthenticated) {
    next({ name: 'decisions' })
  } else if (to.meta.requiresAdmin && !authStore.isAdmin) {
    next({ name: 'decisions' })
  } else {
    next()
  }
})

export default router