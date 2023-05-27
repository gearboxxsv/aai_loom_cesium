<template>
  <v-card>
    <v-card-title>Tasks List (A test of the Meteor-DDP connection)</v-card-title>

    <v-table>
      <thead>
        <tr>
          <th>Task</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="task in tasks" :key="task.id">
          <td>{{ task.title }}</td>
          <td><v-btn color="warning" @click="deleteTask(task.id)">Delete</v-btn></td>
        </tr>
      </tbody>
    </v-table>
  </v-card>
</template>

<script>
import { useTaskStore } from '../stores/tasks'

export default {
  setup() {
    const taskStore = useTaskStore()
    return { taskStore }
  },
  data() {
    return {
      tasks: []
    }
  },
  mounted() {
    this.taskStore.fetchTasks().then(() => {
      this.tasks = this.taskStore.tasks
    })
  },
  methods: {
    deleteTask(id) {
      this.taskStore.deleteTask(id)
    }
  }
}
</script>
