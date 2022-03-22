<template>
  <nav class="navbar navbar-expand-lg navbar-light bg-light">
    <div class="container-fluid">
      <router-link class="navbar-brand" :to="{name: 'Home'}">MicroReddit</router-link>
      <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
        <span class="navbar-toggler-icon"></span>
      </button>
      <div class="collapse navbar-collapse" id="navbarSupportedContent">
        <form v-if="isAuthenticatedProp" class="d-flex me-3 ms-3" @submit="goToSubreddit">
          <input v-model="selectedSubreddit" @focusin="fetchUserSubreddits" class="form-control" list="datalistOptions" id="exampleDataList" placeholder="Twoje subreddity">
          <datalist id="datalistOptions">
            <option v-for="subreddit in userSubreddits" :key="subreddit.id" :value="subreddit.name">{{subreddit.name}}</option>
          </datalist>
          <button @click="goToSubreddit(selectedSubreddit)" class="btn btn-outline-success ms-2">Przejdź</button>
        </form>
        <form class="d-flex justify-content-center">
          <input v-model="searchQuery" class="form-control me-2" type="search" placeholder="Szukaj" aria-label="Search">
          <button @click="handleSearch" class="btn btn-outline-success" type="submit">Szukaj</button>
        </form>
        <ul class="navbar-nav ms-auto mb-2 mb-lg-0">
          <li v-if="!isAuthenticatedProp" class="nav-item me-1">
            <router-link class="btn btn-primary" :to="{name: 'Login'}">Login</router-link>
          </li>
          <li v-if="!isAuthenticatedProp" class="nav-item">
            <router-link class="btn btn-primary" :to="{name: 'Register'}">Rejestracja</router-link>
          </li>
          <li v-if="isAuthenticatedProp" class="nav-item me-1">
            <button class="btn btn-primary" data-bs-toggle="modal" data-bs-target="#addSubredditModal">
              <i class="bi bi-bookmark-plus"></i>
            </button>
          </li>
          <li v-if="isAuthenticatedProp" class="nav-item me-1">
            <router-link class="btn btn-primary" :to="{name: 'Settings'}" data-bs-toggle="tooltip" data-bs-placement="bottom" title="Ustawienia">
              <i class="bi bi-gear me-1"></i> Ustawienia
            </router-link>
          </li>
          <li v-if="isAuthenticatedProp" class="nav-item">
            <button @click="handleLogout" class="btn btn-primary"><i class="bi bi-box-arrow-right me-2"></i>Wyloguj</button>
          </li>
        </ul>
      </div>
    </div>
  </nav>
</template>

<script>
import axios from "axios";


export default {
  name: "Navbar",
  props: ["isAuthenticatedProp"],
  emits: ["auth"],
  data() {
    return {
      userSubreddits: [],
      selectedSubreddit: "",
      searchQuery: ""
    }
  },
  methods : {
    handleLogout() {
      axios.get("/auth/logout")
      .then( () => {
        this.$emit("auth", false);
        window.localStorage.setItem("email", undefined);
        this.$router.push({name: "Home"})
      }).catch(err => {
        console.log(err);
      })
    },
    fetchUserSubreddits() {
      axios.get("/users/" + window.localStorage.getItem("email") + "/subreddits")
      .then(res => {
        this.userSubreddits = res.data;
      }).catch(err => console.log(err));
    },
    goToSubreddit() {
      this.$router.push('/r/' + this.selectedSubreddit);
    },
    handleSearch(e) {
      e.preventDefault();
      this.$router.push('/q/' + this.searchQuery)
          .then(() => {
            this.searchQuery = '';
          });

    }
  }
}
</script>

<style scoped>

</style>