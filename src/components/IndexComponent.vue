<template>
  <v-card>
    <v-card-title>Posts (A test of the Express-Mongo backend)</v-card-title>
    <v-card-text>
      <v-btn :to="{ name: 'create' }">Create Post</v-btn>
    </v-card-text>

    <v-table>
      <thead>
        <tr>
          <th>Title</th>
          <th>Body</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="post in posts" :key="post._id">
          <td>{{ post.title }}</td>
          <td>{{ post.body }}</td>
          <td>
            <v-btn :to="{ name: 'edit', params: { id: post._id } }">Edit</v-btn>
          </td>
          <td><v-btn color="warning" @click.prevent="deletePost(post._id)">Delete</v-btn></td>
        </tr>
      </tbody>
    </v-table>
  </v-card>
</template>

<script>
export default {
  data() {
    return {
      posts: []
    }
  },
  created() {
    let uri = 'http://localhost:4000/posts'
    this.axios.get(uri).then((response) => {
      this.posts = response.data
    })
  },
  methods: {
    deletePost(id) {
      let uri = `http://localhost:4000/posts/delete/${id}`
      this.axios.delete(uri).then(() => {
        this.posts.splice(
          this.posts.findIndex((i) => i._id == id),
          1
        )
      })
    }
  }
}
</script>
