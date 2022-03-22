<template>
  <div class="card mb-5">
    <div class="card-body">
      <div class="card-text">
        <form class="d-flex w-100" @submit="handleAddComment">
          <textarea class="flex-grow-1 form-control" v-model="newCommentContent" id="new-comment" type="text" placeholder="Nowy komentarz"></textarea>
          <button type="submit" class="btn btn-primary">Wyślij</button>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
import axios from "axios";
import EventBus from "../event_bus";

export default {
  name: "AddCommentForm",
  props: ["postId"],
  data() {
    return {
      newCommentContent: ""
    }
  },
  methods: {
    handleAddComment(e) {
      e.preventDefault();
      axios.post("/comments", {
        content: this.newCommentContent,
        post_id: this.postId
      }).then(() => {
        e.target.reset();
      }).catch(() => {
        EventBus.$emit("alert", {
          message: "Nie udało się dodać komentarza",
          error: true
        });
      });
    },
  }
}
</script>

<style scoped>

</style>