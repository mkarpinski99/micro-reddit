import {createRouter, createWebHashHistory} from "vue-router";
import Login from '../views/Login'
import Home from '../views/Home'
import Register from '../views/Register'
import Settings from "../views/Settings";
import Subreddit from "../views/Subreddit";
import Post from "../views/Post";
import axios from "axios";
import Search from "../views/Search";


const routes = [
  { path: "/login",
    name: "Login",
    component: Login,
    beforeEnter: async () => {
      const status = await authStatus();
      return !status.data.isAuthenticated;
    }
  },
  { path: "/", name: "Home", component: Home },
  { path: "/register",
    name: "Register",
    component: Register,
    beforeEnter: async () => {
      const status = await authStatus();

      return !status.data.isAuthenticated;
    }
  },
  { path: "/settings",
    name: "Settings",
    component: Settings,
    beforeEnter: async () => {
      const status = await authStatus();

      return status.data.isAuthenticated;
  }
  },
  { path: "/r/:subreddit", name: "Subreddit", component: Subreddit },
  { path: "/r/:subreddit/:id", name: "Post", component: Post },
  { path: "/q/:query", name: "Search", component: Search }
];

const router = createRouter({
  mode: "history",
  history: createWebHashHistory(process.env.BASE_URL),
  routes,
})

const authStatus = async () => {
  const status = await axios.get('/auth/status');
  return status;
}



// router.beforeEach((to, from, next) => {
//   if(window.localStorage.getItem("email") === null) {
//     next({name: 'Login'});
//   }
// })

export default router;