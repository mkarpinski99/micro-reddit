<template>
  <div class="flex-container">
    <div class=" p-5 border border-primary rounded border-1 rounded-3 shadow-sm bg-light">
      <form class="mb-2" @submit="handleRegister">
        <div v-if="!emailCheck" class="alert alert-warning d-flex align-items-center" role="alert">
          <i class="bi bi-exclamation-triangle-fill bi flex-shrink-0 me-2"></i>
          <div>
            Niepoprawny adres e-mail.
          </div>
        </div>
        <div class="form-floating mb-3">
          <input v-model="email" class="form-control" id="email" type="text" placeholder="Email">
          <label class="form-label" for="email">Email</label>
        </div>
        <div v-if="!passwordCheck" class="alert alert-warning d-flex align-items-center" role="alert">
          <i class="bi bi-exclamation-triangle-fill bi flex-shrink-0 me-2"></i>
          <div>
            Hasło musi mieć co najmniej 8 znaków, dodatkowo musi zawierać: co najmniej 1 dużą literę, 1 cyfrę, 1 znak specjalny (@$!%*?&).
          </div>
        </div>
        <div ref="passwordRef" class="form-floating mb-3">
          <input v-model="password" class="form-control" id="password" type="password" placeholder="Hasło">
          <label class="form-label" for="password">Hasło</label>
        </div>
        <div v-if="!passwordRepeatCheck" class="alert alert-warning d-flex align-items-center" role="alert">
          <i class="bi bi-exclamation-triangle-fill bi flex-shrink-0 me-2"></i>
          <div>
            Hasła nie są takie same.
          </div>
        </div>
        <div ref="repeatPasswordRef" class="form-floating mb-3">
          <input v-model="passwordRepeat" class="form-control" id="password-repeat" type="password" placeholder="Powtórz hasło">
          <label class="form-label" for="password-repeat">Powtórz hasło</label>
        </div>
        <button v-if="passwordRepeatCheck && emailCheck && passwordCheck" type="submit" class="btn btn-primary">Zarejestruj</button>
        <button v-else type="submit" class="btn btn-secondary" disabled>Zarejestruj</button>
      </form>
      <router-link :to="{name: 'Login'}">
        Jeśli masz już konto, kliknij tu i zaloguj się!
      </router-link>
    </div>
  </div>
</template>

<script>
import axios from "axios";
import EventBus from "../event_bus";

export default {
  name: "Register",
  data() {
    return {
      email: "",
      password: "",
      passwordRepeat : "",
      passwordRepeatCheck: false,
      passwordCheck: false,
      emailCheck: false
    }
  },
  mounted() {
  },
  watch: {
    passwordRepeat(val) {
      this.passwordRepeatCheck = this.password === val;

    },
    password(val) {
      this.passwordRepeatCheck = this.passwordRepeat === val;

      const re = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
      this.passwordCheck = re.test(val);
    },
    email(val) {
      const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
      this.emailCheck = re.test(val.toLowerCase());
    }
  },
  methods: {
    handleRegister(event) {
      event.preventDefault();
      const params = new URLSearchParams()
      params.append("email", this.email);
      params.append("password", this.password);
      axios.post("/users/", params, {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded"
        }
      }).then(() => {
        EventBus.$emit("alert", {
          message: "Konto zostało utworzone",
          error: false
        });
        this.$router.push('/login');
      }).catch(() => {
        EventBus.$emit("alert", {
          message: "Nie udało się utworzyć konta",
          error: true
        });
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