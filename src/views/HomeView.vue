<template>
  <div class="flex flex-column justify-content-center gap-3 mb-3">
    <img src="nasa-emblem.jpg" class="mt-3" style="max-width: 300px;" />
    <p class="nasa-text">
      NASA Aegis <br />
      An Advanced Air Mobility <br />
      Simulator
    </p>
    <PButton label="Start" class="navButton" />
    <PButton label="Path Planning" class="navButton" />
    <PButton label="Settings" class="navButton" />
    <PButton label="Exit" class="navButton" />
  </div>
</template>

<style scoped>
.navButton {
  width: 300px;
}
.nasa-text {
  color: sandybrown;
  text-align: center;
  font-size: x-large;
  font-weight: bold;
  margin-top: -20px;
  margin-bottom: -5px;
}
</style>
