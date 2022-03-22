<template>
  <div class="flex-container">
    <div v-if="newPostAlert" class="alert alert-info alert-dismissible sticky custom-alert" role="alert">
      <i class="bi bi-check-circle-fill flex-shrink-0 me-2"></i>
      <p class="mb-1">
        Nowy post: "{{ newPostTitle }}"
      </p>
      <i @click="alertFlag = false" type="button" class="btn-close" aria-label="Close"></i>
    </div>
    <div class="d-inline-block d-block text-center mb-2 mt-3">
      <div @click="setSort('new')" class="btn btn-primary">Najnowsze</div>
      <div @click="setSort('best')" class="btn btn-primary">Najlepsze</div>
    </div>
  </div>
  <div>
    <PostsList
        :posts="posts"
        :is-authenticated="isAuthenticated" />
  </div>
  <nav class="flex-container">
    <div class="d-inline-block d-block m-auto">
      <ul class="pagination">
        <li v-if="currentPage - 1 > 0" class="page-item" @click="setPage(1)"><a class="page-link" href="#">Pierwsza</a></li>
        <li v-if="currentPage - 1 > 0" class="page-item" @click="setPage(currentPage-1)"><a class="page-link" href="#">{{ currentPage - 1 }}</a></li>
        <li class="page-item" @click="setPage(currentPage)"><a class="page-link" href="#">{{ currentPage }}</a></li>
        <li v-if="currentPage < maxPage + 1" class="page-item" @click="setPage(currentPage+1)"><a class="page-link" href="#">{{ currentPage + 1 }}</a></li>
        <li v-if="currentPage < maxPage + 1" class="page-item" @click="setPage(maxPage)"><a class="page-link" href="#">Ostatnia</a></li>
      </ul>
    </div>
  </nav>
</template>

<script>
import PostsList from "../components/PostsList";
import axios from "axios";
export default {
  name: 'Home',
  components: {PostsList},
  props: ["io"],
  data () {
    return {
      isAuthenticated: false,
      posts: [],
      currentPage: 1,
      currentSort: 'new',
      maxPage: 1,
      newPostAlert: false,
      newPostTitle: "",
    }
  },
  mounted(){
    this.fetchPosts('alph');
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
      if(this.currentSort === 'new'){
        this.posts.splice(0, 0, newPost);
      }
      else {
        this.newPostTitle = newPost.title;
        this.newPostAlert = true;
        setTimeout(() => {this.newPostAlert = false;}, 5000);
      }
    });
  },
  unmounted() {
    this.io.off('post:delete');
    this.io.off('post:vote');
  },
  methods: {
    fetchPosts() {
      axios.get("/posts/", {
        params: {
          sort: this.currentSort,
          page: this.currentPage - 1
        }
      })
          .then(res => {
            this.posts = res.data.content;
            this.isAuthenticated = res.data.isAuthenticated;
            this.maxPage = res.data.maxPage;
          });
    },
    setSort(sort) {
      this.currentSort = sort;
      this.currentPage = 1;
      this.fetchPosts();
    },
    setPage(page) {
      this.currentPage = page;
      this.fetchPosts();
    }
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

.custom-alert {
  width: fit-content;
  position: fixed;
  left: 80%;
  top: 10%;
  z-index: 4000;

}
.btn-close {
  margin-left: 4vw;
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
