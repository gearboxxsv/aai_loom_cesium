import { ref } from 'vue'
import { defineStore } from 'pinia'
import axios from 'axios'

export const useTaskStore = defineStore('task', () => {
  const tasks = ref([])
  async function fetchTasks() {
    try {
      // dummy data from a fake backend until server is set up
      const data = await axios.get('https://jsonplaceholder.typicode.com/todos')
      tasks.value = data.data
    } catch (error) {
      console.log(error)
    }
    /*
    await server.connect()
    let tasksSub = server.subscribe("tasks_pub")
    await tasksSub.ready()
    let taskReactiveCursor = server.collection('tasks').reactive()
    tasks.value = taskReactiveCursor.data()

    taskReactiveCursor.onChange((newData) => {
      tasks.value = newData
    })
    */
  }
  function deleteTask(id) {
    // insert code here to send the deletion to the server before doing the splice
    this.tasks.splice(
      this.tasks.findIndex((i) => i.id == id),
      1
    )
  }

  return { tasks, fetchTasks, deleteTask }
})
