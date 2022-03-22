<template>
  <div class="m-auto w-35 mb-2">
    <button v-if="isMember && !addPostFlag" @click="toggleAddPost(true)" class="btn btn-primary"><i class="bi bi-plus-circle"></i></button>
  </div>
  <div class="d-flex flex-column align-items-center">
    <form v-if="addPostFlag" class="mb-2 p-3 border border-primary rounded-3 bg-cyan shadow-lg" @submit="handleAddPost">
      <div class="form-floating mb-3">
        <input v-model="title" class="form-control" id="title" type="text" placeholder="Tytuł">
        <label class="form-label" for="title">Tytuł</label>
      </div>
      <div class="form-floating mb-3">
        <textarea v-model="content" class="form-control" id="content" type="text" placeholder="Tekst"></textarea>
        <label class="form-label" for="content">Tekst</label>
      </div>
      <div class="mb-3">
        <label class="form-label" for="image">Obrazek</label>
        <input @change="handleFileChange" accept="image/png, image/jpeg" class="form-control" id="image" type="file">
      </div>
      <div class="form-floating mb-3">
        <input v-model="videoUrl" class="form-control" id="video-path" type="text" placeholder="Link do wideo">
        <label class="form-label" for="video-path">Link do wideo</label>
      </div>
      <div class="d-flex d-inline-flex flex-row justify-content-end container-fluid">
        <button v-if="isMember && addPostFlag" @click="toggleAddPost(false)" class="btn btn-danger">
          <i class="bi bi-dash-circle fs-5 p-1"></i>
        </button>
        <button type="submit" class="btn btn-primary"><i class="bi bi-plus-circle fs-5 p-1"></i></button>
      </div>
    </form>
  </div>
</template>

<script>
import axios from "axios";
import EventBus from "../event_bus"

export default {
  name: "addPostForm",
  props: ["isMember", "subredditId"],
  data() {
    return {
      image: null,
      title: "",
      content: "",
      videoUrl: "",
      addPostFlag: false
    }
  },
  methods: {
    toggleAddPost(state) {
      this.addPostFlag = state;
    },
    handleFileChange(e) {
      this.image = e.target.files[0];
    },
    handleAddPost(e) {
      e.preventDefault();
      const formData = new FormData();
      formData.append("title", this.title);
      formData.append("content", this.content);
      formData.append("video_url", this.videoUrl);
      formData.append("subreddit_id", this.subredditId);
      formData.append("file", this.image);
      axios.post("/posts/" + this.$route.params.subreddit, formData)
          .then(() => {
        this.addPostFlag = false;
      }).catch(err => {
        EventBus.$emit({
          message: err.message,
          error: true
        });
      });
    }
  }
}
</script>

<style lang="scss" scoped>
@import "../scss/colors";
  .bg-cyan {
    background-color: $bg-color-lightblue;
  }
textarea {
  resize: none;
  overflow: auto;
}
.w-35 {
  width: 35vw;
}

@media only screen and (max-width: 1500px) {
  .w-35  {
    width: 50vw;
  }
}


@media only screen and (max-width: 1200px) {
  .w-35  {
    width: 50vw;
  }
}

@media only screen and (max-width: 992px) {
  .w-35  {
    width: 60vw;
  }
}

@media only screen and (max-width: 768px) {
  .w-35  {
    width: 75vw;
  }
}

@media only screen and (max-width: 576px) {
  .w-35  {
    width: 95vw;
  }
}


</style>