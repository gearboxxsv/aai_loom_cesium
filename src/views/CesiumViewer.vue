<template>
  <v-container>
    <v-row id="viewer-row" dense>
      <v-col>
        <div id="cesium3d" class="cesiumViewer"></div>
      </v-col>
      <v-col>
        <div id="cesium2d" class="cesiumViewer"></div>
      </v-col>
    </v-row>
    <div>
      <v-btn color="blue" v-on:click="startAnimation">BEGIN</v-btn>
      <v-btn color="blue" v-on:click="resetAnimation">RESET</v-btn>
    </div>
  </v-container>
</template>

<script>
import * as Cesium from 'cesium'
Cesium.Ion.defaultAccessToken =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiJjNmQzYmZjNC02Y2YxLTRmOGMtYjI1Ni0yYTZhNGVkYWY0ZWMiLCJpZCI6MTM5OTcwLCJpYXQiOjE2ODQ1MTcyNTR9.QsHzmTby5tUn7hssX98YqwOzBzW341W-q1B6HvpA7zY'
var viewer1, viewer2

export default {
  methods: {
    startAnimation() {
      // Sample flight path data and code -- Delete once live data is hooked up
      const telem = JSON.parse(
        '[{"lon_deg":-111.8967920557033,"lat_deg":33.43098356200383,"alt_agl_ft":0,"alt_msl_ft":1086,"gndspd_kts":5,"xe_ft":0,"ye_ft":0,"timestamps_s":0},{"lon_deg":-111.8973037720718,"lat_deg":33.430925414534,"alt_agl_ft":100,"alt_msl_ft":1186,"gndspd_kts":15,"xe_ft":-21.158992591609817,"ye_ft":-156.1275787228838,"timestamps_s":22},{"lon_deg":-111.8970196722796,"lat_deg":33.42941616500062,"alt_agl_ft":200,"alt_msl_ft":1286,"gndspd_kts":30,"xe_ft":-570.3522676727512,"ye_ft":-69.4470561118522,"timestamps_s":44},{"lon_deg":-111.8910238019631,"lat_deg":33.42924001000947,"alt_agl_ft":500,"alt_msl_ft":1586,"gndspd_kts":80,"xe_ft":-634.4524120108833,"ye_ft":1759.960011727575,"timestamps_s":80},{"lon_deg":-111.891310856002,"lat_deg":33.38580124764916,"alt_agl_ft":500,"alt_msl_ft":1586,"gndspd_kts":80,"xe_ft":-16441.16239965798,"ye_ft":1672.3764382569373,"timestamps_s":197},{"lon_deg":-111.8931964863454,"lat_deg":33.3780768600328,"alt_agl_ft":500,"alt_msl_ft":1586,"gndspd_kts":80,"xe_ft":-19251.930756261892,"ye_ft":1096.7619574082678,"timestamps_s":218},{"lon_deg":-111.8941742287105,"lat_deg":33.35654826367459,"alt_agl_ft":500,"alt_msl_ft":1586,"gndspd_kts":80,"xe_ft":-27085.797333671162,"ye_ft":798.2663216541278,"timestamps_s":276},{"lon_deg":-111.8943369519706,"lat_deg":33.29211824544927,"alt_agl_ft":500,"alt_msl_ft":1586,"gndspd_kts":80,"xe_ft":-50530.63344207578,"ye_ft":748.5761893963115,"timestamps_s":449},{"lon_deg":-111.8915658958309,"lat_deg":33.18195288337159,"alt_agl_ft":500,"alt_msl_ft":1586,"gndspd_kts":80,"xe_ft":-90617.25920783535,"ye_ft":1595.3851277556312,"timestamps_s":745},{"lon_deg":-111.6871064514628,"lat_deg":32.91588972432546,"alt_agl_ft":500,"alt_msl_ft":1586,"gndspd_kts":30,"xe_ft":-187429.76813830424,"ye_ft":64154.69125666719,"timestamps_s":1598},{"lon_deg":-111.6868926996691,"lat_deg":32.87971679673265,"alt_agl_ft":200,"alt_msl_ft":1286,"gndspd_kts":15,"xe_ft":-200591.46365980775,"ye_ft":64220.29074615172,"timestamps_s":1858},{"lon_deg":-111.7085036603939,"lat_deg":32.87961231618733,"alt_agl_ft":100,"alt_msl_ft":1186,"gndspd_kts":5,"xe_ft":-200629.479193794,"ye_ft":57585.2851861996,"timestamps_s":2120},{"lon_deg":-111.7084802307383,"lat_deg":32.88220357507381,"alt_agl_ft":0,"alt_msl_ft":1086,"gndspd_kts":0,"xe_ft":-199686.6425315825,"ye_ft":57592.47857660607,"timestamps_s":2232}]'
      )

      const start = Cesium.JulianDate.now(new Cesium.JulianDate())
      const totalSeconds = telem[telem.length - 1].timestamps_s
      const stop = Cesium.JulianDate.addSeconds(start, totalSeconds, new Cesium.JulianDate())

      viewer1.clock.startTime = start.clone()
      viewer1.clock.stopTime = stop.clone()
      viewer1.clock.currentTime = start.clone()
      viewer1.clock.shouldAnimate = true

      viewer2.clock.startTime = start.clone()
      viewer2.clock.stopTime = stop.clone()
      viewer2.clock.currentTime = start.clone()
      viewer2.clock.shouldAnimate = true

      const positionProperty = new Cesium.SampledPositionProperty()
      let pathArray = []

      for (let i = 0; i < telem.length; i++) {
        const dataPoint = telem[i]

        // Declare the time for this individual sample and store it in a new JulianDate instance.
        const time = Cesium.JulianDate.addSeconds(
          start,
          dataPoint.timestamps_s,
          new Cesium.JulianDate()
        )

        const alt_agl_m = dataPoint.alt_agl_ft * 0.3048 // convert feet to meters

        const position = Cesium.Cartesian3.fromDegrees(
          dataPoint.lon_deg,
          dataPoint.lat_deg,
          alt_agl_m
        )

        pathArray.push(dataPoint.lon_deg)
        pathArray.push(dataPoint.lat_deg)
        pathArray.push(alt_agl_m)

        // Store the position along with its timestamp.
        // Here we add the positions all upfront, but these can be added at run-time as samples are received from a server.
        positionProperty.addSample(time, position)

        const pointData = {
          description: `Location: (${dataPoint.lon_deg}, ${dataPoint.lat_deg}, ${alt_agl_m})`,
          position: position,
          point: { pixelSize: 10, color: Cesium.Color.RED }
        }
        viewer1.entities.add(pointData)
        // viewer2.entities.add(pointData)
      }

      const pathData = {
        name: 'Flight path',
        polyline: {
          positions: Cesium.Cartesian3.fromDegreesArrayHeights(pathArray),
          width: 5,
          material: Cesium.Color.GREEN,
          arcType: Cesium.ArcType.RHUMB
        }
      }
      viewer1.entities.add(pathData)
      viewer2.entities.add(pathData)

      async function loadModel() {
        // Load the glTF model from Cesium ion.
        const airplaneUri = await Cesium.IonResource.fromAssetId(1720886)
        const airplaneProperties = {
          availability: new Cesium.TimeIntervalCollection([
            new Cesium.TimeInterval({ start: start, stop: stop })
          ]),
          position: positionProperty,
          // Attach the 3D model instead of the green point.
          model: { uri: airplaneUri },
          // Automatically compute the orientation from the position.
          orientation: new Cesium.VelocityOrientationProperty(positionProperty),
          // path: new Cesium.PathGraphics({ width: 3 }),
          viewFrom: new Cesium.Cartesian3(-30, 0, 0)
        }
        const airplaneEntity = viewer1.entities.add(airplaneProperties)
        viewer2.entities.add(airplaneProperties)

        viewer1.trackedEntity = airplaneEntity
        viewer2.zoomTo(viewer2.entities, new Cesium.HeadingPitchRange(0, 0, 80000))
      }

      loadModel()
    },
    resetAnimation() {
      viewer1.entities.removeAll()
      viewer1.camera.flyHome()
      viewer1.clock.shouldAnimate = false

      viewer2.entities.removeAll()
      viewer2.camera.flyHome()
      viewer2.clock.shouldAnimate = false
    }
  },
  mounted() {
    viewer1 = new Cesium.Viewer('cesium3d', {
      targetFrameRate: 60,
      fullscreenButton: false,
      baseLayerPicker: false,
      geocoder: false,
      homeButton: false,
      sceneModePicker: false,
      selectionIndicator: false,
      navigationHelpButton: false,
      timeline: false
      /*
      terrainProvider: new Cesium.CesiumTerrainProvider({
        url: Cesium.IonResource.fromAssetId(1)
      })
      */
    })
    viewer2 = new Cesium.Viewer('cesium2d', {
      targetFrameRate: 60,
      fullscreenButton: false,
      baseLayerPicker: false,
      geocoder: false,
      homeButton: false,
      sceneModePicker: false,
      selectionIndicator: false,
      navigationHelpButton: false,
      timeline: false,
      sceneMode: Cesium.SceneMode.SCENE2D
    })
  }
}
</script>

<style scoped>
#cesiumContainer {
  width: 100%;
  height: 100%;
  margin: 0;
  padding: 0;
  overflow: hidden;
}
button {
  margin: 5px;
}
.cesiumViewer {
  height: 550px;
}
</style>
