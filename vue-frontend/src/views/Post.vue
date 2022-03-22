<template>
  <div v-if="!errorFlag" class="flex-container">
    <PostComponent :is-authenticated="isAuthenticated"
                   :is-moderator="isModerator"
                   :score="score"
                   :id="id"
                   :vote="vote" :content="post.content"
                   :image-path="post.image_path"
                   :video-url="post.video_url"
                   :creator-email="post.user.email"
                   :creation-date="post.creation_date"
                   :title="post.title"
                   :subreddit="$route.params.subreddit"

    />
    <CommentsList :comments="comments"
      :is-moderator="isModerator" @deleteComment="deleteComment"/>
    <AddCommentForm v-if="isAuthenticated" :post-id="post.id" />
  </div>
  <div v-else class="m-5 text-center h2">
    Strona nie istnieje
  </div>
</template>

<script>
import axios from "axios";
import AddCommentForm from "../components/AddCommentForm";
import CommentsList from "../components/CommentsList";
import PostComponent from "../components/PostComponent";
import io from "../socket-io";

export default {
  name: "Post",
  components: {AddCommentForm, CommentsList, PostComponent},
  props: ["io"],
  data() {
    return {
      post: {title: "", content: "", user: { email: ""}},
      comments: [],
      newComment: "",
      isAuthenticated: false,
      errorFlag: false,
      idModerator: false,
      score: 0,
      isModerator: false,
      vote: 0
    }
  },
  computed: {
    id: function () {
      return this.$route.params.id;
    }
  },
  mounted() {
    axios.get("/comments/" + this.$route.params.id)
        .then( res => {
          this.post = res.data.post;
          this.comments = res.data.comments;
          this.isAuthenticated = res.data.isAuthenticated;
          this.errorFlag = false;
          this.score = res.data.score;
          this.isModerator = res.data.isModerator;
          this.vote = res.data.vote.vote;
        }).catch(() => {
      this.errorFlag = false;
    });
    io.on(`comment:new`, (event) => {
      this.comments.push(event);
    });
    io.on(`comment:delete`, (event) => {
      this.comments.splice(this.comments.map(e => e.id).indexOf(parseInt(event)), 1);
    });
    io.on(`post:delete`, (postid) => {
      if(postid === this.$route.params.id){
        this.$router.push({name: "Home"});
      }
    });
    io.on('post:vote', (msg) => {
      if(msg.post_id === this.$route.params.id){
        this.score = msg.score;
        if(msg.user_id === parseInt(window.localStorage.getItem("id"))) {
          this.vote = msg.value;
        }
      }
    });
  },
  unmounted() {
    this.io.off('post:delete');
    this.io.off('post:vote');
    this.io.off('comment:new');
    this.io.off('comment:delete');
  },
  methods: {
    deleteComment(id) {
      axios.delete("/comments/" + id);
    },
  }
}
</script>

<style lang="scss" scoped>
textarea {
  resize: none;
}
.img {
  max-width: 100%;
  max-height: 400px;
  margin: auto;
}
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