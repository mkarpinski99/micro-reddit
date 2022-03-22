<template>
  <div class="flex-container">
    <div class=" p-5 border border-primary rounded border-1 rounded-3 shadow-sm bg-light">
      <p class="h4 mb-3">Zmień hasło</p>
      <form class="mb-2" @submit="handlePasswordChange">
        <div class="form-floating mb-3">
          <input v-model="oldPassword" class="form-control" id="password" type="password" placeholder="Aktualne hasło">
          <label class="form-label" for="password">Aktualne hasło</label>
        </div>
        <div v-if="!passwordCheck" class="alert alert-warning d-flex align-items-center" role="alert">
          <i class="bi bi-exclamation-triangle-fill bi flex-shrink-0 me-2"></i>
          <div>
            Hasło musi mieć co najmniej 8 znaków, dodatkowo musi zawierać: co najmniej 1 dużą literę, 1 cyfrę, 1 znak specjalny (@$!%*?&).
          </div>
        </div>
        <div class="form-floating mb-3">
          <input v-model="newPassword" class="form-control" id="new-password" type="password" placeholder="Nowe hasło">
          <label class="form-label" for="password">Nowe hasło</label>
        </div>
        <div v-if="!passwordRepeatCheck" class="alert alert-warning d-flex align-items-center" role="alert">
          <i class="bi bi-exclamation-triangle-fill bi flex-shrink-0 me-2"></i>
          <div>
            Hasła nie są takie same.
          </div>
        </div>
        <div class="form-floating mb-3">
          <input v-model="newPasswordRepeat" class="form-control" id="new-password-repeat" type="password" placeholder="Powtórz nowe hasło">
          <label class="form-label" for="password">Powtórz nowe hasło</label>
        </div>
        <button v-if="passwordRepeatCheck && passwordCheck" type="submit" class="btn btn-primary">Zmień hasło</button>
        <button v-else type="submit" class="btn btn-secondary" disabled>Zmień hasło</button>
      </form>
    </div>
  </div>
</template>

<script>
import axios from "axios";
import EventBus from "../event_bus.js"

export default {
  name: "Settings",
  data() {
    return {
      oldPassword: "",
      newPassword: "",
      newPasswordRepeat: "",
      passwordRepeatCheck: false,
      passwordCheck: false,
    }
  },
  watch: {
    newPasswordRepeat(val) {
      this.passwordRepeatCheck = this.newPassword === val;

    },
    newPassword(val) {
      this.passwordRepeatCheck = this.newPasswordRepeat === val;

      const re = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
      this.passwordCheck = re.test(val);
    }
  },
  methods: {
    handlePasswordChange(event) {
      event.preventDefault();
      axios.put("/users/" + window.localStorage.getItem("id"), {
        oldPassword: this.oldPassword,
        newPassword: this.newPassword
      }).then( () => {
        EventBus.$emit("alert", {
          message: "Hasło zostało zmienione",
          error: false
        })
        this.oldPassword = "";
        this.newPassword = "";
        this.newPasswordRepeat = "";
      }).catch( () => {
        EventBus.$emit("alert", {
          message: "Nie udało się zmienić hasła",
          error: true
        })
        this.oldPassword = "";
        this.newPassword = "";
        this.newPasswordRepeat = "";
      });
    }
  }
}
</script>

<style scoped>
.flex-container {
  display: flex;
  flex-direction: column;
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