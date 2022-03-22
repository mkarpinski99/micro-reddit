<template>
  <div ref="modal" class="modal fade" id="addSubredditModal" data-bs-backdrop="static" data-bs-keyboard="false" tabindex="-1" aria-labelledby="addSubredditModal" aria-hidden="true">
    <div class="modal-dialog">
      <form class="mb-2" @submit="handleAddSubreddit">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" id="staticBackdropLabel">Utwórz nowy Subreddit</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            <div class="input-group mb-3">
              <span class="input-group-text">/r/</span>
              <div class="form-floating">
                <input v-model="name" class="form-control" id="subredditName" type="text" placeholder="Nazwa">
                <label class="form-label" for="subredditName">Nazwa</label>
              </div>
            </div>
            <div class="form-floating mb-3">
              <textarea v-model="description" class="form-control" id="subredditDescription" type="password" placeholder="Opis"></textarea>
              <label class="form-label" for="subredditDescription">Opis</label>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Anuluj</button>
            <button type="submit" class="btn btn-primary" >Utwórz</button>
          </div>
        </div>
      </form>
    </div>
  </div>
</template>

<script>
import axios from "axios";
import { Modal } from "bootstrap";
import EventBus from "../event_bus"

export default {
  name: "AddSubredditModal",
  data() {
    return {
      name: "",
      description: ""
    }
  },
  methods: {
    handleAddSubreddit() {
      axios.post('/subreddits', {
        name: this.name,
        description: this.description
      }).then(res => {
        const modal = Modal.getInstance(this.$refs.modal);
        modal.hide();
        this.$router.push('/r/' + res.data.name);
        this.name = "";
        this.description = "";
        EventBus.$emit("alert", {
          message: `Pomyślnie utworzono subreddit /r/${res.data.name}`,
          error: false
        })
      }).catch(err => {
        EventBus.$emit({
          message: err.response.data.message,
          error: true
        });

      })
    }
  }
}
</script>

<style scoped>
textarea {
  resize: none;
}
</style>