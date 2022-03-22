<template>
  <div v-for="comment in comments" :key="comment.id">
    <div class="card">
      <div class="card-body">
        <div class="card-title d-flex">
          <p class="title flex-grow-1 h4 m-auto">
            {{ comment.user.email }}
          </p>
          <button @click="deleteComment(comment.id)" v-if="isModerator" class="btn btn-danger">
            <i class="bi bi-trash"></i>
          </button>
        </div>
        <div class="card-text">{{ comment.content }}</div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "CommentsList",
  props: ["comments", "isModerator"],
  emits: ["deleteComment"],
  methods: {
    deleteComment(id) {
      this.$emit("deleteComment", id);
    }
  }
}
</script>

<style scoped>

</style>