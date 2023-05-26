<template>
  <v-card>
    <v-card-title>Edit Post (A test of the Express-Mongo backend)</v-card-title>
    <v-form @submit.prevent="updatePost">
      <v-text-field v-model="post.title" label="Post Title:"></v-text-field>
      <v-textarea label="Post Body:" v-model="post.body"></v-textarea>
      <v-card-actions>
        <v-btn type="Submit" color="blue" block text="Update"></v-btn>
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
  created() {
    let uri = `http://localhost:4000/posts/edit/${this.$route.params.id}`
    this.axios.get(uri).then((response) => {
      this.post = response.data
    })
  },
  methods: {
    updatePost() {
      let uri = `http://localhost:4000/posts/update/${this.$route.params.id}`
      this.axios.post(uri, this.post).then(() => {
        this.$router.push({ name: 'posts' })
      })
    }
  }
}
</script>
