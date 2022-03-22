<template>
  <div class="flex-container">
    <div class="p-5 border border-primary rounded border-1 rounded-3 shadow-sm bg-light">
      <form class="mb-2" @submit="handleLogin">
        <div class="form-floating mb-3">
          <input v-model="email" class="form-control" id="email" type="text" placeholder="Email">
          <label class="form-label" for="email">Email</label>
        </div>
        <div class="form-floating mb-3">
          <input v-model="password" class="form-control" id="password" type="password" placeholder="Hasło">
          <label class="form-label" for="password">Hasło</label>
        </div>
        <button type="submit" class="btn btn-primary">Zaloguj</button>
      </form>
      <router-link :to="{name: 'Register'}">
        Jeśli nie masz jeszcz konta, kliknij tu i zarejestruj się!
      </router-link>
    </div>
  </div>
</template>

<script>
import axios from "axios";
import EventBus from "../event_bus";

export default {
  name: "Login",
  emits: ["auth"],
  data() {
   return {
     email: "",
     password: ""
   }
  },
  methods: {
    handleLogin(event) {
      event.preventDefault();
      const params = new URLSearchParams()
      params.append("email", this.email);
      params.append("password", this.password);
      axios.post("/auth/login", params, {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded"
        }
      }).then(res => {
        window.localStorage.setItem("email", res.data.email);
        window.localStorage.setItem("id", res.data.id);
        this.$router.push('/');
        this.$emit("auth", true);
      }).catch(() => {
        EventBus.$emit("alert", {
          message: "Nieprawidłowe dane logowania",
          error: true
        })
      });
    }
  }
}
</script>

<style lang="scss" scoped>
.flex-container {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-content: center;
  margin: auto;
  height: 100vh;
  width: 25vw;
}
@media only screen and (max-width: 1500px) {
  .flex-container {
    width: 50vw;
  }
}


@media only screen and (max-width: 1200px) {
  .flex-container {
    width: 50vw;
  }
}

@media only screen and (max-width: 992px) {
  .flex-container {
    width: 50vw;
  }
}

@media only screen and (max-width: 768px) {
  .flex-container {
    width: 75vw;
  }
}

@media only screen and (max-width: 576px) {
  .flex-container {
    width: 100vw;
  }
}
</style>