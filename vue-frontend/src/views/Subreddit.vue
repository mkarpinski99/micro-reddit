<template>
  <div v-if="!errorFlag" :key="description">
    <div class="m-5 text-center text-break">
      <h2>/r/{{ $route.params.subreddit }}</h2>
      <div class="d-flex d-inline-flex">
        <div class="d-flex d-inline-flex h-auto" v-if="descriptionEdit">
          <input class="form-control" v-model="newDescription">
          <button @click="handleChangeDescription" class="btn btn-success ms-1">
            <i class="bi bi-check"></i>
          </button>
          <button @click="toggleEditDescription(false)" class="btn btn-danger">
            <i class="bi bi-x"/>
          </button>
        </div>
        <div v-else>
          <p class="fs-4 me-2">{{ description }}</p>
        </div>
        <button @click="toggleEditDescription(true)" v-if="isModerator && !descriptionEdit" class="btn btn-primary">
          <i class="bi bi-pencil-fill"/>
        </button>
        <button @click="handleJoinSubreddit" v-if="!isMember && isAuthenticated" class="btn ms-3 btn-outline-primary">
          <i class="bi bi-star"></i>
        </button>
        <button @click="handleLeaveSubreddit" v-else-if="isAuthenticated" class="btn btn-primary ms-3">
          <i class="bi bi-star-fill"></i>
        </button>
      </div>
    </div>
    <AddPostForm :subreddit-id="subreddit_id" :is-member="isMember"/>
    <div>
      <PostsList :is-moderator="isModerator" :posts="posts" :is-authenticated="isAuthenticated"/>
    </div>
  </div>
  <div v-else>
    <div class="m-5 text-center h2">
      r/{{ $route.params.subreddit }} nie istnieje
    </div>
  </div>
</template>

<script>
import PostsList from "../components/PostsList";
import axios from "axios";
import AddPostForm from "../components/AddPostForm"
import EventBus from "../event_bus";

export default {
  name: "Subreddit",
  components: {PostsList, AddPostForm},
  props: ["io"],
  data () {
    return {
      subreddit_id: null,
      description: "",
      isMember: false,
      isModerator: false,
      isAuthenticated: false,
      descriptionEdit: false,
      newDescription: "",
      posts: [],
      errorFlag: true
    }
  },
  watch: {
    descriptionEdit(val) {
      if(val) {
        this.newDescription = this.description;
      }
    }
  },
  mounted(){
    this.fetchData();
    EventBus.$on("add-post", () => {
      this.fetchData();
    });
    this.io.on(`post:delete`, (id) => {
      const postIdx = this.posts.findIndex(p => p.id === parseInt(id));
      this.posts.splice(postIdx, 1);
    });
    this.io.on('post:vote', (msg) => {
      const postIdx = this.posts.findIndex(p => parseInt(p.id) === parseInt(msg.post_id));
      if(this.posts[postIdx] !== undefined) {
        this.posts[postIdx].score = msg.score;
        if(msg.user_id === parseInt(window.localStorage.getItem("id"))) {
          this.posts[postIdx].vote = msg.value;
        }
      }
    });
    this.io.on('post:new', (newPost) => {
      if(parseInt(newPost.subreddit_id) === parseInt(this.subreddit_id)) {
        this.posts.splice(0, 0, newPost);
      }
    });
  },
  unmounted() {
    this.io.off('post:delete');
    this.io.off('post:vote');
    this.io.off('post:new');
  },
  methods: {
    fetchData() {
      const posts = axios.get("/posts/" + this.$route.params.subreddit);
      const subreddit = axios.get("/subreddits/" + this.$route.params.subreddit);
      axios.all([posts, subreddit])
          .then(axios.spread((...responses) => {
            this.posts = responses[0].data;
            this.subreddit_id = responses[1].data.id;
            this.description = responses[1].data.description;
            this.isMember = responses[1].data.isMember;
            this.isModerator = responses[1].data.isModerator;
            this.isAuthenticated = responses[1].data.isAuthenticated;
            this.$forceUpdate();
            this.errorFlag = false;
          })).catch(() => {
        this.errorFlag = true;
      });
    },
    toggleEditDescription(state) {
      this.descriptionEdit = state;
    },
    handleChangeDescription() {
      axios.put("/subreddits/" + this.$route.params.subreddit, {
        description: this.newDescription
      }).then(res => {
        this.description = res.data.description;
        this.descriptionEdit = false;
        EventBus.$emit("alert", {
          message: `Pomyślnie zmieniono opis /r/${res.data.name}`,
          error: false
        });
      }).catch((err) => {
        EventBus.$emit("alert", {
          message: `Wystąpił błąd poczas zmiany opisu /r/${err.res.data.name}`,
          error: true
        });
      });
    },
    handleJoinSubreddit() {
      axios.post("/subreddits/" + this.$route.params.subreddit + '/join', {})
          .then(() => {
            this.isMember = true;
          }).catch(err => {
        console.log(err);
      });
    },
    handleLeaveSubreddit() {
      axios.post("/subreddits/" + this.$route.params.subreddit + '/leave', {})
          .then(() => {
            this.isMember = false;
          }).catch(err => {
        console.log(err);
      });
    }
  }
}
</script>

<style scoped>

</style>