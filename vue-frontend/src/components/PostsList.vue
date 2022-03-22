<template>
  <div class="flex-container">
    <div v-for="(post) in posts" :key="post.id" class="mb-3">
      <PostComponent :title="post.title"
                     :id="post.id"
                     :content="post.content"
                     :creation-date="post.creation_date"
                     :creator-email="post.user.email"
                     :video-url="post.video_url"
                     :image-path="post.image_path"
                     :score="post.score"
                     :is-moderator="isModerator"
                     :is-authenticated="isAuthenticated"
                     :subreddit="post.subreddit.name"
                     :vote="post.vote"
      />
    </div>
  </div>
</template>

<script>
import PostComponent from "./PostComponent";

export default {
  name: "PostsList",
  components: {PostComponent},
  props: ["posts", "isAuthenticated", "isModerator"],
  methods: {
    parseDate(date) {
      const dateObj = new Date(date);
      return dateObj.getDate() + "/"
          + (dateObj.getUTCMonth() + 1) + "/"
          + dateObj.getUTCFullYear() + " "
          + (dateObj.getUTCHours() + 2) +
          ":" + dateObj.getUTCMinutes();
    },
    parseYTLink(link) {
      return link.replace('watch?v=', 'embed/');
    },
    parseContentLink(content) {
      const URLRegexp = /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&//=]*)/
      return content.replace(URLRegexp, "<a href='$&'>$&</a>");
    },
  }
}
</script>

<style lang="scss" scoped>
.img {
  max-width: 100%;
  max-height: 400px;
  margin: auto;
}

.reddit-link {
  color: black
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