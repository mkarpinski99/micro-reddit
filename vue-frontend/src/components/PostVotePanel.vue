<template>
  <div>
    <button @click="votePost(postId, 1)" v-if="isAuthenticated" class="btn btn-primary" :class="{selected: currentVoteValue === 1}"><i class="bi bi-hand-thumbs-up"></i></button>
    <span :class="score" class="text-green ms-2 me-2">{{ score === null ? 0 : score }}</span>
    <button @click="votePost(postId, -1)" v-if="isAuthenticated" class="btn btn-danger" :class="{selected: currentVoteValue === -1}"><i class="bi bi-hand-thumbs-down"></i></button>
  </div>
</template>

<script>
import axios from "axios";

export default {
  name: "PostVotePanel",
  props: ["postId", "currentVoteValue", "score", "isAuthenticated"],
  emits: ["currentVoteValue:update"],
  methods: {
    votePost(post, value) {
      axios.post("/posts/" + post + "/vote", {value: value === this.currentVoteValue ? 0 : value})
          .then((res) => {
            this.$emit("currentVoteValue:update", res.data.value);
          })
    },
  }
}
</script>

<style lang="scss" scoped>
.selected {
  background-color: gray !important;
}

</style>