<template>
  <div class="card">
    <div class="card-body">
      <div class="card-title d-flex">
        <div class="d-flex flex-column flex-grow-1">
          <b class="mb-0 flex-column d-flex">
            <router-link
                class="h3 reddit-link"
                :to="{name: 'Post', params: {id: id, subreddit: $route.params.subreddit !== undefined ? $route.params.subreddit : subreddit }, props: {isModerator}}">
              {{ title }}
            </router-link>
            <router-link
                class="h5 reddit-link"
                :to="{name: 'Subreddit', params: { subreddit: subreddit }, props: {isModerator}}">
              /r/{{ subreddit }}
            </router-link>
          </b>
          <p class="card-subtitle mb-2 text-muted fs-7">
            {{ parseDate(creationDate) }} przez {{ creatorEmail }}
          </p>
        </div>
        <PostVotePanel
            :post-id="id"
            :is-authenticated="isAuthenticated"
            :current-vote-value="vote"
            :score="score" />
        <button @click="deletePost(id)" v-if="isModerator" class="btn btn-danger ms-1 h-25">
          <i class="bi bi-trash"></i>
        </button>
      </div>
      <div v-html="parseContentLink(content)" class="card-text"></div>
      <div class="w-100 d-flex d-inline-flex justify-content-center mt-2">
        <img v-if="imagePath" :src="`${imagePathParsed}`" class="img" alt="...">
      </div>
      <div class="w-100 d-flex d-inline-flex justify-content-center">
        <iframe v-if="videoUrl" id="ytplayer" width="600" height="400" type="text/html"
                :src="`//www.youtube.com/embed/${videoId}`"
                frameborder="0"/>
      </div>
    </div>
  </div>
</template>

<script>
import PostVotePanel from "./PostVotePanel";
import axios from "axios";
import EventBus from "../event_bus";


export default {
  name: "PostComponent",
  components: {PostVotePanel},
  props: ["title", "id", "score", "vote", "isAuthenticated", "isModerator", "content", "imagePath",
    "videoUrl", "creationDate", "creatorEmail", "subreddit"],
  emits: ["postScoreUpdate", "userVoteUpdate", "newComment", "deleteComment", "deletePost"],
  computed: {
    imagePathParsed: function () {
      const URLRegexp = /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&//=]*)/
      if (URLRegexp.test(this.imagePath)) {
        return this.imagePath
      }
      return 'http:' + '//' + location.hostname + ':' + '3000' + '/' + this.imagePath;
    },
    videoId: function () {
      const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
      const match = this.videoUrl.match(regExp);

      if (match && match[2].length === 11) {
        return match[2];
      } else {
        return null;
      }
    }
  },
  methods: {
    parseDate(date) {
      const dateObj = new Date(date);
      return (dateObj.getDay() + 5) + "/"
          + (dateObj.getMonth() + 1) + "/"
          + dateObj.getFullYear() + " "
          + dateObj.getHours() +
          ":" + dateObj.getMinutes();
    },
    parseYTLink(link) {
      return link.replace("watch?v=", "embed/");
    },
    parseContentLink(content) {
      const URLRegexp = /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&//=]*)/
      return content.replace(URLRegexp, "<a href='$&'>$&</a>");
    },
    deletePost(id) {
      axios.delete("/posts/" + id)
          .then(() => {
            EventBus.$emit("alert", {
              message: "Pomyślnie usunięto post",
              error: false
            })
          }).catch(() => {
        EventBus.$emit("alert", {
          message: "Nie udało się usunąć posta",
          error: true
        })
      });
    }
  }
}
</script>

<style scoped>

</style>