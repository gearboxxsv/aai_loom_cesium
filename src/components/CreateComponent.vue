<template>
  <v-card>
    <v-card-title>Create A Post (A test of the Express-Mongo backend)</v-card-title>
    <v-form @submit.prevent="addPost">
      <v-text-field v-model="post.title" label="Post Title:"></v-text-field>
      <v-textarea label="Post Body:" v-model="post.body"></v-textarea>
      <v-card-actions>
        <v-btn type="Submit" color="blue" block text="Submit"></v-btn>
      </v-card-actions>
    </v-form>
  </v-card>
</template>

<script>
export default {
  data() {
    return {
      post: {}
    }
  },
  methods: {
    addPost() {
      let uri = 'http://localhost:4000/posts/add'
      this.axios.post(uri, this.post).then(() => {
        this.$router.push({ name: 'posts' })
      })
    }
  }
}
</script>
