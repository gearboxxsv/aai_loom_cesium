<template>
  <v-container id="startScreen">
    <v-row>
      <v-img :max-height="200" src="nasa-emblem.jpg" style="margin-top: 20px"></v-img>
    </v-row>
    <v-row class="justify-center">
      <p class="text-h4 text-center">
        NASA Aegis <br />
        An Advanced Air Mobility <br />
        Simulator
      </p>
    </v-row>
    <v-row class="justify-center">
      <v-btn :width="300" style="margin-top: 25px" to="cesium">Start</v-btn>
    </v-row>
    <v-row class="justify-center">
      <v-btn>Path Planning</v-btn>
    </v-row>
    <v-row class="justify-center">
      <v-btn>Settings</v-btn>
    </v-row>
    <v-row class="justify-center">
      <v-btn>Exit</v-btn>
    </v-row>
  </v-container>
</template>

<script>
export default {
  name: 'StartPage'
}
</script>

<style scoped>
#startScreen {
  margin-top: 20px;
  min-height: 590px;
  background-color: black;
  color: sandybrown;
}

button {
  margin-top: 15px;
  width: 300px;
}
</style>
