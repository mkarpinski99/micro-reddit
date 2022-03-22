<template>
  <div>
    <div class="flex-container">
      <div class="h1 text-center mt-2 mb-3">Szukana fraza: "{{ $route.params.query }}" </div>
      <div v-if="subreddits.length > 0" class="h3">Subreddity</div>
      <div v-for="subreddit in subreddits" :key="subreddit.id" class="card mb-3">
        <div class="card-body">
          <div class="card-title d-flex">
            <div class="d-flex flex-column flex-grow-1">
              <b class="mb-0">
                <router-link :to="{name: 'Subreddit', params: {subreddit: subreddit.name}}">
                  {{ subreddit.name }}
                </router-link>
              </b>
            </div>
          </div>
          <div class="card-text">{{ subreddit.description }}</div>
        </div>
      </div>
    </div>
    <div class="flex-container">
      <div v-if="posts.length > 0" class="h3">Posty</div>
    </div>
    <PostsList is-authenticated="isAuthenticated" :posts="posts"/>
  </div>
</template>

<script>
import axios from "axios";
import PostsList from "../components/PostsList";

export default {
  name: "Search",
  components: { PostsList },
  props: ['io'],
  data() {
    return {
      posts: [],
      subreddits: [],
      isAuthenticated: false,
    }
  },
  mounted() {
    axios.get('/search', {
      params: {
        query: this.$route.params.query
      }
    }).then(res => {
      this.posts = res.data.posts;
      this.subreddits = res.data.subreddits;
      this.isAuthenticated = res.data.isAuthenticated;
    })
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
  },
  unmounted() {
    this.io.off('post:delete');
    this.io.off('post:vote');
  },
}
</script>

<style scoped>

.flex-container {
  display: flex;
  flex-direction: column;
  justify-content: center;
  margin: auto;
  width: 35vw;
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
    width: 60vw;
  }
}

@media only screen and (max-width: 768px) {
  .flex-container {
    width: 75vw;
  }
}

@media only screen and (max-width: 576px) {
  .flex-container {
    width: 95vw;
  }
}
</style>