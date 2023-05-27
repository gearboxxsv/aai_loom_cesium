<template>
  <v-row>
    <v-img :max-height="200" src="nasa-emblem.jpg" style="margin-top: 20px"></v-img>
  </v-row>
  <v-row class="justify-center">
    <p class="text-h4 text-center mb-3">
      NASA Aegis <br />
      An Advanced Air Mobility <br />
      Simulator
    </p>
  </v-row>
  <v-row class="justify-center">
    <v-btn class="navButton" to="cesium">Start</v-btn>
  </v-row>
  <v-row class="justify-center">
    <v-btn class="navButton">Path Planning</v-btn>
  </v-row>
  <v-row class="justify-center">
    <v-btn class="navButton">Settings</v-btn>
  </v-row>
  <v-row class="justify-center">
    <v-btn class="navButton mb-5">Exit</v-btn>
  </v-row>
</template>

<style scoped>
.navButton {
  margin: 10px;
  width: 300px;
}
</style>
