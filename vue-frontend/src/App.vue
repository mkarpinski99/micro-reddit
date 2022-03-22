<template>
  <Navbar :key="isAuthenticated" @auth="authenticate" :is-authenticated-prop="isAuthenticated" class="sticky-top"/>
  <div class="main-container">
    <div v-if="alertFlag && alert.error" class="alert alert-danger alert-dismissible sticky custom-alert" role="alert">
      <i class="bi bi-exclamation-triangle-fill flex-shrink-0 me-2"></i>
      <p class="mb-1">
        {{ alert.message }}
      </p>
      <i @click="alertFlag = false" type="button" class="btn-close" aria-label="Close"></i>
    </div>
    <div v-else-if="alertFlag" class="alert alert-success alert-dismissible sticky custom-alert" role="alert">
      <i class="bi bi-check-circle-fill flex-shrink-0 me-2"></i>
      <p class="mb-1">
        {{ alert.message }}
      </p>
      <i @click="alertFlag = false" type="button" class="btn-close" aria-label="Close"></i>
    </div>
    <router-view :io="io" :key="$route.fullPath" @auth="authenticate"/>
  </div>
  <AddSubredditModal />
</template>

<script>

import Navbar from "./components/Navbar";
import AddSubredditModal from "./components/AddSubredditModal";
import axios from "axios";
import EventBus from "./event_bus";
import io from "./socket-io";

export default {
  name: 'MicroReddit',
  components: {
    AddSubredditModal,
    Navbar
  },
  data() {
    return {
      isAuthenticated: false,
      alertFlag: false,
      alert: {
        error: false,
        message: ""
      },
      io: io,
    }
  },
  mounted() {
    axios.get('/auth/status')
        .then(res => {
          this.isAuthenticated = res.data.isAuthenticated;
        });
    EventBus.$on("alert", (alert) => {
      this.alert.message = alert.message;
      this.alert.error = alert.error;
      this.alertFlag = true;
      setTimeout(() => {
        this.alertFlag = false;
      }, 3000);
    });
  },
  beforeUnmount() {
    EventBus.$off("alert");
  },
  methods: {
    authenticate (event) {
      this.isAuthenticated = event;
    }
  }
}
</script>

<style lang="scss">
@import './scss/colors.scss';
@import '~bootstrap/scss/bootstrap.scss';
@import '~bootstrap-icons/font/bootstrap-icons.css';

#app {
  background-color: #dae0e6;
  min-height: 100vh;
}

.custom-alert {
  width: fit-content;
  position: fixed;
  left: 50%;
  top: 10%;
  transform: translate(-50%, 0%);
  z-index: 4000;
  .btn-close {
    margin-left: 4vw;
  }
}

textarea {
  resize: none;
}

.main-container {
  padding-top: 10px;
}
</style>
