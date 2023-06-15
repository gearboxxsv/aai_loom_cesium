<template>
  <div id="cesium2d" class="cesiumViewer"></div>

  <div class="flex flex-row justify-concent-center gap-3">
    <PButton label="Use Browser Location" @click="findMe" />
    <PButton label="Use Radio Location" @click="startTracking" />
    <PButton label="Show Form" @click="getForm('getForm1')" />
  </div>

  <PDialog v-model:visible="visible" modal position="topright" header="DRF API Control Panel">
    <div v-if="loading">
      <PSpinner />
    </div>
    <div class="form-container" v-else-if="schema">
      <FormKit type="form" :value="formValues" @submit="submitForm">
        <FormKitSchema :schema="schema" />
      </FormKit>
    </div>
    <div v-else>
      <PMessage severity="error" :closable="false">SERVER ERROR! {{ errorMessage }}</PMessage>
    </div>
  </PDialog>
</template>

<script setup>
import { ref } from 'vue'
import { onMounted } from 'vue'
import { server } from '../server'
import { FormKitSchema } from '@formkit/vue'
import * as Cesium from 'cesium'
import * as turf from '@turf/helpers'

const schema = ref(null)
const formValues = ref(null)
const submitMethod = ref('submitForm')
const errorMessage = ref('')
const loading = ref(true)
const visible = ref(false)

Cesium.Ion.defaultAccessToken =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiJjNmQzYmZjNC02Y2YxLTRmOGMtYjI1Ni0yYTZhNGVkYWY0ZWMiLCJpZCI6MTM5OTcwLCJpYXQiOjE2ODQ1MTcyNTR9.QsHzmTby5tUn7hssX98YqwOzBzW341W-q1B6HvpA7zY'

var viewer
let boundingRadius = 10 // miles

/*
function startAnimation() {
  // Sample flight path data and code -- Delete once live data is hooked up

  const telem = JSON.parse(
    '[{"lon_deg":-111.8967920557033,"lat_deg":33.43098356200383,"alt_agl_ft":0,"alt_msl_ft":1086,"gndspd_kts":5,"xe_ft":0,"ye_ft":0,"timestamps_s":0},{"lon_deg":-111.8973037720718,"lat_deg":33.430925414534,"alt_agl_ft":100,"alt_msl_ft":1186,"gndspd_kts":15,"xe_ft":-21.158992591609817,"ye_ft":-156.1275787228838,"timestamps_s":22},{"lon_deg":-111.8970196722796,"lat_deg":33.42941616500062,"alt_agl_ft":200,"alt_msl_ft":1286,"gndspd_kts":30,"xe_ft":-570.3522676727512,"ye_ft":-69.4470561118522,"timestamps_s":44},{"lon_deg":-111.8910238019631,"lat_deg":33.42924001000947,"alt_agl_ft":500,"alt_msl_ft":1586,"gndspd_kts":80,"xe_ft":-634.4524120108833,"ye_ft":1759.960011727575,"timestamps_s":80},{"lon_deg":-111.891310856002,"lat_deg":33.38580124764916,"alt_agl_ft":500,"alt_msl_ft":1586,"gndspd_kts":80,"xe_ft":-16441.16239965798,"ye_ft":1672.3764382569373,"timestamps_s":197},{"lon_deg":-111.8931964863454,"lat_deg":33.3780768600328,"alt_agl_ft":500,"alt_msl_ft":1586,"gndspd_kts":80,"xe_ft":-19251.930756261892,"ye_ft":1096.7619574082678,"timestamps_s":218},{"lon_deg":-111.8941742287105,"lat_deg":33.35654826367459,"alt_agl_ft":500,"alt_msl_ft":1586,"gndspd_kts":80,"xe_ft":-27085.797333671162,"ye_ft":798.2663216541278,"timestamps_s":276},{"lon_deg":-111.8943369519706,"lat_deg":33.29211824544927,"alt_agl_ft":500,"alt_msl_ft":1586,"gndspd_kts":80,"xe_ft":-50530.63344207578,"ye_ft":748.5761893963115,"timestamps_s":449},{"lon_deg":-111.8915658958309,"lat_deg":33.18195288337159,"alt_agl_ft":500,"alt_msl_ft":1586,"gndspd_kts":80,"xe_ft":-90617.25920783535,"ye_ft":1595.3851277556312,"timestamps_s":745},{"lon_deg":-111.6871064514628,"lat_deg":32.91588972432546,"alt_agl_ft":500,"alt_msl_ft":1586,"gndspd_kts":30,"xe_ft":-187429.76813830424,"ye_ft":64154.69125666719,"timestamps_s":1598},{"lon_deg":-111.6868926996691,"lat_deg":32.87971679673265,"alt_agl_ft":200,"alt_msl_ft":1286,"gndspd_kts":15,"xe_ft":-200591.46365980775,"ye_ft":64220.29074615172,"timestamps_s":1858},{"lon_deg":-111.7085036603939,"lat_deg":32.87961231618733,"alt_agl_ft":100,"alt_msl_ft":1186,"gndspd_kts":5,"xe_ft":-200629.479193794,"ye_ft":57585.2851861996,"timestamps_s":2120},{"lon_deg":-111.7084802307383,"lat_deg":32.88220357507381,"alt_agl_ft":0,"alt_msl_ft":1086,"gndspd_kts":0,"xe_ft":-199686.6425315825,"ye_ft":57592.47857660607,"timestamps_s":2232}]'
  )

  const start = Cesium.JulianDate.now(new Cesium.JulianDate())
  const totalSeconds = telem[telem.length - 1].timestamps_s
  const stop = Cesium.JulianDate.addSeconds(start, totalSeconds, new Cesium.JulianDate())

  viewer.clock.startTime = start.clone()
  viewer.clock.stopTime = stop.clone()
  viewer.clock.currentTime = start.clone()
  viewer.clock.shouldAnimate = true

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

    const position = Cesium.Cartesian3.fromDegrees(dataPoint.lon_deg, dataPoint.lat_deg, alt_agl_m)

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
    viewer.entities.add(pointData)
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
  viewer.entities.add(pathData)

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
    const airplaneEntity = viewer.entities.add(airplaneProperties)
    viewer.entities.add(airplaneProperties)

    viewer.trackedEntity = airplaneEntity
    viewer.zoomTo(viewer.entities, new Cesium.HeadingPitchRange(0, 0, 80000))
  }

  loadModel()
}

function resetAnimation() {
  viewer.entities.removeAll()
  viewer.camera.flyHome()
  viewer.clock.shouldAnimate = false
}

function getPosition() {
  if (viewer.scene.mode == 3) {
    var windowPosition = new Cesium.Cartesian2(
      viewer.container.clientWidth / 2,
      viewer.container.clientHeight / 2
    )
    var pickRay = viewer.scene.camera.getPickRay(windowPosition)
    var pickPosition = viewer.scene.globe.pick(pickRay, viewer.scene)
    var pickPositionCartographic =
      viewer.scene.globe.ellipsoid.cartesianToCartographic(pickPosition)
    console.log(pickPositionCartographic.longitude * (180 / Math.PI))
    console.log(pickPositionCartographic.latitude * (180 / Math.PI))
  } else if (viewer.scene.mode == 2) {
    var camPos = viewer.camera.positionCartographic
    console.log(
      'Center of current view: (' +
        camPos.longitude * (180 / Math.PI) +
        ', ' +
        camPos.latitude * (180 / Math.PI) +
        ')'
    )
  }
}
*/
async function getForm(method) {
  console.log(method)
  visible.value = true
  server
    .connect()
    .then(() => {
      server
        .call(method)
        .then((data) => {
          console.log('Form schema received: ' + JSON.stringify(data))
          schema.value = data.schema
          formValues.value = data.formdata
          submitMethod.value = data.submitMethod
        })
        .catch((error) => {
          errorMessage.value = error.message
        })
    })
    .catch((error) => {
      errorMessage.value = error.message
    })
    .finally(() => {
      loading.value = false
    })
}

async function submitForm(formvalues) {
  console.log('Form data submitted: ' + JSON.stringify(formvalues))
  server
    .connect()
    .then(() => {
      server
        .call(submitMethod.value, formvalues)
        .then(() => {
          console.log('Form data submitted successfully')
        })
        .catch((error) => {
          console.log('ERROR! ' + error.message)
        })
    })
    .catch((error) => {
      console.log(error)
    })
}

function addVehicle(data) {
  const vehiclePosition = Cesium.Cartesian3.fromDegrees(
    data.lon,
    data.lat,
    turf.convertLength(data.altitude, 'feet', 'meters')
  )
  // Not sure why this doesn't work (or rather, the update part doesn't work) -- commenting out for now to look at later
  /*
      const positionProperty = new Cesium.SampledPositionProperty()
      positionProperty.addSample(new Cesium.JulianDate.now(), vehiclePosition)
      positionProperty.setInterpolationOptions({
        interpolationAlgorithm: Cesium.LagrangePolynomialApproximation,
        interpolationDegree: 5
      })
      */

  const vehicleEntity = viewer.entities.add({
    id: data.hex,
    position: vehiclePosition,
    orientation: Cesium.Transforms.headingPitchRollQuaternion(
      vehiclePosition,
      new Cesium.HeadingPitchRoll(Cesium.Math.toRadians(data.bearing - 90), 0, 0)
    ),
    point: { pixelSize: 10, color: Cesium.Color.RED },
    label: {
      text: 'Flight ' + (data.flight || 'UNKNOWN'),
      font: '14pt monospace',
      style: Cesium.LabelStyle.FILL_AND_OUTLINE,
      outlineWidth: 5,
      verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
      pixelOffset: new Cesium.Cartesian2(0, -9)
    },
    path: new Cesium.PathGraphics({ width: 3 }),
    model: { uri: '/Cesium_Air.glb' }
  })
  console.log('(' + vehicleEntity.id + ') Vehicle added - ' + JSON.stringify(data))
}

function updateVehicle(data) {
  // console.log('Change detected - ' + JSON.stringify(data))
  const vehicleToUpdate = viewer.entities.getById(data.prev.hex)
  if (data.fields.lon || data.fields.lat || data.fields.altitude) {
    let vehiclePosition = Cesium.Cartesian3.fromDegrees(
      data.next.lon,
      data.next.lat,
      turf.convertLength(data.next.altitude, 'feet', 'meters')
    )
    // vehicleToUpdate.position.addSample(new Cesium.JulianDate.now(), vehiclePosition)
    vehicleToUpdate.position = vehiclePosition
  }
  if (data.fields.bearing) {
    vehicleToUpdate.orientation = Cesium.Transforms.headingPitchRollQuaternion(
      Cesium.Cartesian3.fromDegrees(
        data.next.lon,
        data.next.lat,
        turf.convertLength(data.next.altitude, 'feet', 'meters')
      ),
      new Cesium.HeadingPitchRoll(Cesium.Math.toRadians(data.next.bearing - 90), 0, 0)
    )
  }
  if (data.fields.flight) {
    vehicleToUpdate.label.text = 'Flight ' + (data.next.flight || 'UNKNOWN')
  }
  console.log(
    '(' + vehicleToUpdate.id + ') Vehicle updated - ' + JSON.stringify(data.fieldsChanged)
  )
}

function removeVehicle(data) {
  viewer.entities.remove(viewer.entities.getById(data.hex))
  console.log('(' + data.hex + ') Vehicle removed')
}

/*
Airplane object: {"id":"647531f3ebdb1b25e82f1160","hex":"a280fe","flight":"SWA3149 ","lat":33.297638,"lon":-112.639087,"altitude":14175,"speed":319,"name":"a280fe","bearing":83,"icon":"plane","layer":"ADSB"}
Need to give this a unique id (probl the hex value), then assign an array tracking position points, display appropriate icon

Polygon object: {"type":"FeatureCollection","features":[{"type":"Feature","properties":{"type":"noflyzone"},"geometry":{"coordinates":[[[-111.81609627253556,33.100046284184245],[-111.8283316085932,33.08118469405059],[-111.81658568597763,33.07216250334571],[-111.79994562893928,33.077083812984625],[-111.79749856172789,33.090615994899906],[-111.80924448434313,33.10086626152864],[-111.81609627253556,33.100046284184245]]],"type":"Polygon"},"id":5}]}
Also give a unique id so we can change color or destroy as needed, need to have height

Flightpath object: {"type":"FeatureCollection","features":[{"type":"Feature","properties":{"flightpath":"approved"},"geometry":{"coordinates":[[-111.89796632086835,33.43276537288246],[-111.89160625664634,33.430490621781686],[-111.89160625664634,33.39105213145059],[-111.89524057905855,33.37891360926656],[-111.89433199845561,33.296174848363975],[-111.8934234178527,33.184467005009395],[-111.68808420154546,32.92097315497624],[-111.68717562094255,32.8782526800001],[-111.70443865240166,32.88054179920677]],"type":"LineString"},"id":5}]}
These will probably not change but might need to be destroyed, need lat/long/height for each point

Flight corridor: {"type":"FeatureCollection","features":[{"type":"Feature","properties":{"stroke":"#3df552","stroke-width":4,"stroke-opacity":1,"id":"route1","start_time":"2020-08-15T15:00:00+00:00","end_time":"2020-08-15T15:30:00+00:00","max_altitude":{"metres":100.4,"datum":"agl"},"min_altitude":{"metres":0.4,"datum":"agl"}},"geometry":{"type":"LineString","coordinates":[[-111.8938835,33.38581611],[-111.8891654,33.38562079],[-111.8872976,33.43330738],[-111.8992436,33.43352361],[-111.8991395,33.42620444],[-111.893491,33.42609558],[-111.8938835,33.38581611]]}},{"type":"Feature","properties":{"stroke":"#ffaf22","stroke-width":4,"stroke-opacity":1,"id":"route1","start_time":"2020-08-15T15:00:00+00:00","end_time":"2020-08-15T15:30:00+00:00","max_altitude":{"metres":500.4,"datum":"agl"},"min_altitude":{"metres":100.4,"datum":"agl"}},"geometry":{"type":"LineString","coordinates":[[-111.8951951,33.37844526],[-111.8959835,33.35626042],[-111.8962398,33.29103832],[-111.8929668,33.29101334],[-111.8928425,33.35635227],[-111.8916085,33.37775633],[-111.8891656,33.38562115],[-111.8938843,33.38581546],[-111.8951951,33.37844526]]}},{"type":"Feature","properties":{"stroke":"#2e3bff","stroke-width":4,"stroke-opacity":1,"id":"route1","start_time":"2020-08-15T15:00:00+00:00","end_time":"2020-08-15T15:30:00+00:00","max_altitude":{"metres":500.4,"datum":"agl"},"min_altitude":{"metres":500.4,"datum":"agl"}},"geometry":{"type":"LineString","coordinates":[[-111.8940817,33.18124903],[-111.8893146,33.18195129],[-111.8929671,33.29101419],[-111.8962348,33.291034],[-111.8940817,33.18124903]]}},{"type":"Feature","properties":{"stroke":"#6ad9f5","stroke-width":4,"stroke-opacity":1,"id":"route1","start_time":"2020-08-15T15:00:00+00:00","end_time":"2020-08-15T15:30:00+00:00","max_altitude":{"metres":500.4,"datum":"agl"},"min_altitude":{"metres":200.4,"datum":"agl"}},"geometry":{"type":"LineString","coordinates":[[-111.6919258,32.91580028],[-111.688439,32.87829504],[-111.6845232,32.87825268],[-111.6831726,32.91633287],[-111.6879646,32.92825978],[-111.8893139,33.18194884],[-111.8940883,33.18124763],[-111.6919258,32.91580028]]}},{"type":"Feature","properties":{"stroke":"#ff612c","stroke-width":4,"stroke-opacity":1,"id":"route1","start_time":"2020-08-15T15:00:00+00:00","end_time":"2020-08-15T15:30:00+00:00","max_altitude":{"metres":200.4,"datum":"agl"},"min_altitude":{"metres":0.4,"datum":"agl"}},"geometry":{"type":"LineString","coordinates":[[-111.6886221,32.88060046],[-111.7052079,32.88091521],[-111.7052296,32.88435472],[-111.7111067,32.88420645],[-111.7107311,32.87863429],[-111.6884349,32.87830005],[-111.6886221,32.88060046]]}}]}
These will also not change but might need to be destroyed, need to convert these to boxes or polygons with a height

3 publications: polygons, flight paths, moving objects
subscribe('flightplan',lat,lon,radius) => { collection of flightplans and flightvolumes, GeoJSON FeatureCollection }; these are flightpaths, volumes, polygons, etc on the terrain
subscribe('myflightplan',lat,lon,radius) => same as above, restricted by user ownership or something
subscribe('airwareness',lat,lon,radius) => { collection of [GeoJSON, height] }; these are things that are moving (planes, drones, etc)

*/
function findMe() {
  var watcher, myLat, myLong

  function showPosition(position) {
    if (!viewer.entities.getById('myPosition')) {
      console.log(position.coords)
      const longitude = position.coords.longitude
      const latitude = position.coords.latitude
      myLong = longitude
      myLat = latitude

      viewer.entities.add({
        id: 'myPosition',
        position: Cesium.Cartesian3.fromDegrees(longitude, latitude),
        label: {
          text: 'My location',
          scale: 0.8,
          pixelOffset: new Cesium.Cartesian2(0, -30),
          font: '32px Helvetica',
          fillColor: Cesium.Color.YELLOW,
          outlineColor: Cesium.Color.BLACK,
          outlineWidth: 2,
          style: Cesium.LabelStyle.FILL_AND_OUTLINE
        },
        point: { pixelSize: 10, color: Cesium.Color.RED }
      })

      viewer.camera.flyTo({
        destination: Cesium.Cartesian3.fromDegrees(longitude, latitude, 100)
      })
    }
  }

  function updatePosition(position) {
    if (position.coords.latitude != myLat || position.coords.longitude != myLong) {
      console.log(position.coords)
      const longitude = position.coords.longitude
      const latitude = position.coords.latitude
      var myPos = viewer.entities.getById('myPosition')
      myPos.position = Cesium.Cartesian3.fromDegrees(longitude, latitude)
    } else {
      console.log(
        '(' +
          Date.now() +
          ') myLat: ' +
          myLat +
          ', detected latitude: ' +
          position.coords.latitude +
          ', myLong: ' +
          myLong +
          ', detected longitude: ' +
          position.coords.longitude
      )
    }
  }

  function handleLocationError(error) {
    switch (error.code) {
      case 3:
        // ...deal with timeout
        console.log('Geolocation service timed out')
        navigator.geolocation.clearWatch(watcher)
        break
      case 2:
        // ...device can't get data
        break
      case 1:
        // ...user said no
        console.log('Location permission denied by user')
        navigator.geolocation.clearWatch(watcher)
    }
  }

  const navOptions = {
    enableHighAccuracy: true,
    timeout: 10000
  }
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(showPosition, handleLocationError, navOptions)
    watcher = navigator.geolocation.watchPosition(updatePosition, handleLocationError, navOptions)
  } else {
    alert('Geolocation is not supported by this browser.')
  }
}

async function startTracking() {
  server.connect().then(() => {
    server.call('initCesiumGPS').then((data) => {
      console.log('initCesiumGPS - Data received: ' + JSON.stringify(data))
      const initCoords = data.geometry.coordinates

      // Set up the viewer view based on received GPS coordinates and bounding radius (default is 10 miles)
      let boundingRadiusMeters = turf.convertLength(boundingRadius, 'miles', 'meters')
      let initViewerBounds = viewer.entities.add({
        name: 'initViewerBounds',
        position: Cesium.Cartesian3.fromDegrees(initCoords[0], initCoords[1], 0),
        ellipsoid: {
          radii: new Cesium.Cartesian3(
            boundingRadiusMeters,
            boundingRadiusMeters,
            boundingRadiusMeters
          ),
          material: Cesium.Color.TRANSPARENT,
          outline: true,
          outlineColor: Cesium.Color.BLACK
        }
      })
      viewer.zoomTo(initViewerBounds)

      // Subscribe to 'airwareness' (all moving things within the bounding sphere)
      let subAirwareness = server.subscribe(
        'airwareness',
        initCoords[0],
        initCoords[1],
        turf.lengthToRadians(boundingRadius, 'miles')
      )
      subAirwareness.ready().then(() => {
        console.log('airwareness - Subscription ready')

        // Load and display initial collection
        const dataAirwareness = server.collection('streamer').fetch()
        console.log('dataAirwareness - Initial data: ' + dataAirwareness.length + ' objects')
        for (var i = 0; i < dataAirwareness.length; i++) {
          // console.log('airwareness/streamer - Object received: ' + JSON.stringify(dataAirwareness[i]))
          addVehicle(dataAirwareness[i])
        }

        // Watch for and process changes
        server.collection('streamer').onChange((data) => {
          // console.log('airwareness/streamer - Change detected: ' + JSON.stringify(data))
          if (data.changed) {
            updateVehicle(data.changed)
          }
          if (data.added) {
            addVehicle(data.added)
          }
          if (data.removed) {
            removeVehicle(data.removed)
          }
        })
      })
    })
  })
}

onMounted(() => {
  viewer = new Cesium.Viewer('cesium2d', {
    targetFrameRate: 60,
    fullscreenButton: false,
    baseLayerPicker: false,
    geocoder: false,
    homeButton: false,
    sceneModePicker: false,
    selectionIndicator: false,
    navigationHelpButton: false,
    timeline: false
  })
})
</script>

<style scoped>
#cesiumContainer {
  width: 100%;
  height: 100%;
  margin: 0;
  padding: 0;
  overflow: hidden;
}
.cesiumViewer {
  width: 100%;
  height: 550px;
}
</style>
