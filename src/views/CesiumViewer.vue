<template>
  <div id="cesium-viewer" class="cesiumViewer"></div>
  <PButton
    id="showControlPanel"
    :icon="controlPanelIsVisible ? 'pi pi-times' : 'pi pi-cog'"
    @click="controlPanelIsVisible = !controlPanelIsVisible"
  />

  <PDialog v-model:visible="controlPanelIsVisible" position="topright">
    <TheControlPanel
      @initialize-view="(nickname) => initializeView(nickname)"
      @start-animation="startAnimation"
      @reset-view="resetView"
      :missions="myMissions"
      :gpsList="gpsList"
      @center-on-gps="(id) => centerOnGps(id)"
      @show-mission="(gufi) => showMission(gufi)"
    />
  </PDialog>
</template>

<script setup>
import { ref } from 'vue'
import { onMounted } from 'vue'
import { server } from '../server'
import * as Cesium from 'cesium'
import * as turf from '@turf/helpers'
import * as turfline from '@turf/line-to-polygon'

import TheControlPanel from '../components/TheControlPanel.vue'
const controlPanelIsVisible = ref(false)

import { useNicknameStore } from '../stores/nickname'
const nicknameStore = useNicknameStore()

var viewer
const boundingRadius = ref(50) // default, in miles
const centerCoords = ref([-112.34624485, 33.489148674]) // default to Phoenix
var myLat, myLon
const myPosition = ref(null)
//const myNickname = ref(null)
const myMissions = ref([])
const currentMission = ref(null)
var displayedMissionEntities = []
const gpsList = ref([])
const gpsDefault = ref(null)

Cesium.Ion.defaultAccessToken =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiJjNmQzYmZjNC02Y2YxLTRmOGMtYjI1Ni0yYTZhNGVkYWY0ZWMiLCJpZCI6MTM5OTcwLCJpYXQiOjE2ODQ1MTcyNTR9.QsHzmTby5tUn7hssX98YqwOzBzW341W-q1B6HvpA7zY'

onMounted(() => {
  // Iniitalize the Cesium viewer
  viewer = new Cesium.Viewer('cesium-viewer', {
    targetFrameRate: 60,
    fullscreenButton: false,
    baseLayerPicker: false,
    geocoder: false,
    homeButton: false,
    sceneModePicker: false,
    selectionIndicator: false,
    navigationHelpButton: false,
    timeline: false,
    creditContainer: null,
    creditViewport: null
  })
  viewer._cesiumWidget._creditContainer.style.display = 'none'
})

async function initializeView() {
  console.log('Initializing...')
  server
    .connect()
    .then(() => {
      // Get initial coordinates for center of view, then move the view to that point
      server.call('initCesiumGPS').then((data) => {
        console.log('initCesiumGPS - Data received: ' + JSON.stringify(data))
        centerCoords.value = data.geometry.coordinates
        moveViewer()
      })
    })
    .catch((err) => {
      console.log(err)
    })
}

async function moveViewer() {
  // Take everything off the view so that we can move coordinates and render the new location
  viewer.entities.removeAll()
  clearMission()
  FindMe()
  // May need to also stop watching collections -- put that here once I figure out how -- not sure DDP has such a function?

  // Set up the viewer view based on currently stored coordinates and bounding radius
  let boundingCenter = centerCoords.value
  let boundingRadiusMeters = turf.convertLength(boundingRadius.value, 'miles', 'meters')
  let initViewerBounds = viewer.entities.add({
    name: 'initViewerBounds',
    position: Cesium.Cartesian3.fromDegrees(boundingCenter[0], boundingCenter[1]),
    cylinder: {
      length: boundingRadiusMeters,
      topRadius: boundingRadiusMeters,
      bottomRadius: boundingRadiusMeters,
      material: Cesium.Color.TRANSPARENT,
      outline: true,
      outlineColor: Cesium.Color.BLACK
    }
  })
  viewer.zoomTo(initViewerBounds)

  // Subscribe to 'airwareness' (moving aircraft within the bounding cylinder)
  let subAirwareness = server.subscribe(
    'airwareness',
    boundingCenter[0],
    boundingCenter[1],
    turf.lengthToRadians(boundingRadius.value, 'miles')
  )
  subAirwareness.ready().then(() => {
    console.log('airwareness - Subscription ready')

    // Subscribe to 'myflightplan' (flight paths and flight volumes 'owned' by the current user)
    let subFlightplan = server.subscribe(
      'myflightplan',
      boundingCenter[0],
      boundingCenter[1],
      turf.lengthToRadians(boundingRadius.value, 'miles')
    )
    subFlightplan.ready().then(() => {
      console.log('myflightplan - Subscription ready')

      // Subscribe to 'gps' (all logged in users -- data is collected through 'savegps' function call during findMe() function which is run on initial load)
      let subGPS = server.subscribe('gps')
      subGPS.ready().then(() => {
        // Load and display initial collection
        const dataStreamer = server.collection('streamer').fetch()
        console.log('streamer - Initial data: ' + dataStreamer.length + ' objects')
        for (var i = 0; i < dataStreamer.length; i++) {
          console.log('streamer - Object received: ' + JSON.stringify(dataStreamer[i]))
          if (dataStreamer[i].type == 'ADSB') {
            addVehicle(dataStreamer[i])
          } else if (dataStreamer[i].type == 'flightvolume') {
            addFlightVolume(dataStreamer[i])
          } else if (dataStreamer[i].type == 'flightpath') {
            addFlightPath(dataStreamer[i])
          } else if (dataStreamer[i].type == 'gps') {
            addGPS(dataStreamer[i])
          } else if (dataStreamer[i].type == 'gpsdefault') {
            addGPSdefault(dataStreamer[i])
          } else if (dataStreamer[i].type == 'alert') {
            addAlert(dataStreamer[i])
          }
        }

        // Watch for and process changes
        server.collection('streamer').onChange((data) => {
          console.log('streamer - Change detected: ' + JSON.stringify(data))
          if (data.added) {
            if (data.added.type == 'ADSB') {
              addVehicle(data.added)
            } else if (data.added.type == 'flightvolume') {
              addFlightVolume(data.added)
            } else if (data.added.type == 'flightpath') {
              addFlightPath(data.added)
            } else if (data.added.type == 'gps') {
              addGPS(data.added)
            }
          }
          if (data.changed) {
            if (data.changed.type == 'ADSB') {
              updateVehicle(data.changed)
            } else if (data.changed.type == 'gps') {
              updateGPS(data.changed)
            } else if (data.changed.type == 'gpsdefault') {
              updateGPSdefault(data.changed)
            }
          }
          if (data.removed) {
            removeEntity(data.removed.id)
            if (data.removed.type == 'gps') {
              let index = gpsList.value.findIndex((x) => x.id === data.removed.id)
              if (index > -1) {
                gpsList.value.splice(index, 1)
              }
            }
          }
        })
      })
    })
  })

  // Subscribe to 'regionaldata' (areas of interest, e.g. no-fly zones)
  let subRegionalData = server.subscribe(
    'regionaldata',
    boundingCenter[0],
    boundingCenter[1],
    turf.lengthToRadians(boundingRadius.value, 'miles')
  )
  subRegionalData
    .ready()
    .then(() => {
      console.log('regionaldata - Subscription ready')

      // Load and display initial collection
      const dataRegionalData = server.collection('h3').fetch()
      console.log('h3 - Initial data: ' + dataRegionalData.length + ' objects')
      const aoiInstances = []
      for (let i = 0; i < dataRegionalData.length; i++) {
        //console.log('h3 - Object received: ' + JSON.stringify(dataRegionalData[i]))
        let object = dataRegionalData[i]
        let objectCoords = object.aoi.features[1].geometry.coordinates[0]
        let objectPolygon = []
        for (let j = 0; j < objectCoords.length; j++) {
          objectPolygon.push(objectCoords[j][0])
          objectPolygon.push(objectCoords[j][1])
        }

        let objectColor, objectHeight
        if (object.type == 'poly-cellularTower') {
          // need to also extract the point data and make it a cone
          objectColor = Cesium.Color.BLUE.withAlpha(0.3)
          objectHeight = object.StrucHeight // I think this is in feet, but we'll pretend it's in meters to make these objecs stand out a bit more
        } else if (object.type == 'poly-faa') {
          objectColor = Cesium.Color.RED.withAlpha(0.1)
          objectHeight = 3000
        } else {
          objectColor = Cesium.Color.GREEN.withAlpha(0.1)
          objectHeight = 3000
        }

        aoiInstances.push(
          new Cesium.GeometryInstance({
            geometry: new Cesium.PolygonGeometry({
              polygonHierarchy: new Cesium.PolygonHierarchy(
                Cesium.Cartesian3.fromDegreesArray(objectPolygon)
              ),
              extrudedHeight: objectHeight
            }),
            id: object.id,
            attributes: {
              color: new Cesium.ColorGeometryInstanceAttribute.fromColor(objectColor)
            }
          })
        )
      }
      viewer.scene.primitives.add(
        new Cesium.Primitive({
          geometryInstances: aoiInstances,
          appearance: new Cesium.PerInstanceColorAppearance()
        })
      )
      console.log('dataRegionalData - ' + dataRegionalData.length + ' objects added')

      // We don't watch this one for changes because it won't ever change (???)
    })
    .catch((err) => {
      console.log(err)
    })
}

function startAnimation() {
  // Demo flight data and code
  //let telem = JSON.parse('[{"lon_deg":-111.8967920557033,"lat_deg":33.43098356200383,"alt_agl_ft":0,"alt_msl_ft":1086,"gndspd_kts":5,"xe_ft":0,"ye_ft":0,"timestamps_s":0},{"lon_deg":-111.8973037720718,"lat_deg":33.430925414534,"alt_agl_ft":100,"alt_msl_ft":1186,"gndspd_kts":15,"xe_ft":-21.158992591609817,"ye_ft":-156.1275787228838,"timestamps_s":22},{"lon_deg":-111.8970196722796,"lat_deg":33.42941616500062,"alt_agl_ft":200,"alt_msl_ft":1286,"gndspd_kts":30,"xe_ft":-570.3522676727512,"ye_ft":-69.4470561118522,"timestamps_s":44},{"lon_deg":-111.8910238019631,"lat_deg":33.42924001000947,"alt_agl_ft":500,"alt_msl_ft":1586,"gndspd_kts":80,"xe_ft":-634.4524120108833,"ye_ft":1759.960011727575,"timestamps_s":80},{"lon_deg":-111.891310856002,"lat_deg":33.38580124764916,"alt_agl_ft":500,"alt_msl_ft":1586,"gndspd_kts":80,"xe_ft":-16441.16239965798,"ye_ft":1672.3764382569373,"timestamps_s":197},{"lon_deg":-111.8931964863454,"lat_deg":33.3780768600328,"alt_agl_ft":500,"alt_msl_ft":1586,"gndspd_kts":80,"xe_ft":-19251.930756261892,"ye_ft":1096.7619574082678,"timestamps_s":218},{"lon_deg":-111.8941742287105,"lat_deg":33.35654826367459,"alt_agl_ft":500,"alt_msl_ft":1586,"gndspd_kts":80,"xe_ft":-27085.797333671162,"ye_ft":798.2663216541278,"timestamps_s":276},{"lon_deg":-111.8943369519706,"lat_deg":33.29211824544927,"alt_agl_ft":500,"alt_msl_ft":1586,"gndspd_kts":80,"xe_ft":-50530.63344207578,"ye_ft":748.5761893963115,"timestamps_s":449},{"lon_deg":-111.8915658958309,"lat_deg":33.18195288337159,"alt_agl_ft":500,"alt_msl_ft":1586,"gndspd_kts":80,"xe_ft":-90617.25920783535,"ye_ft":1595.3851277556312,"timestamps_s":745},{"lon_deg":-111.6871064514628,"lat_deg":32.91588972432546,"alt_agl_ft":500,"alt_msl_ft":1586,"gndspd_kts":30,"xe_ft":-187429.76813830424,"ye_ft":64154.69125666719,"timestamps_s":1598},{"lon_deg":-111.6868926996691,"lat_deg":32.87971679673265,"alt_agl_ft":200,"alt_msl_ft":1286,"gndspd_kts":15,"xe_ft":-200591.46365980775,"ye_ft":64220.29074615172,"timestamps_s":1858},{"lon_deg":-111.7085036603939,"lat_deg":32.87961231618733,"alt_agl_ft":100,"alt_msl_ft":1186,"gndspd_kts":5,"xe_ft":-200629.479193794,"ye_ft":57585.2851861996,"timestamps_s":2120},{"lon_deg":-111.7084802307383,"lat_deg":32.88220357507381,"alt_agl_ft":0,"alt_msl_ft":1086,"gndspd_kts":0,"xe_ft":-199686.6425315825,"ye_ft":57592.47857660607,"timestamps_s":2232}]')
  let telem = currentMission.value.telem

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

    const alt_agl_m = turf.convertLength(dataPoint.alt_agl_ft, 'feet', 'meters')

    const position = Cesium.Cartesian3.fromDegrees(dataPoint.lon_deg, dataPoint.lat_deg, alt_agl_m)

    pathArray.push(dataPoint.lon_deg)
    pathArray.push(dataPoint.lat_deg)
    pathArray.push(alt_agl_m)

    // Store the position along with its timestamp.
    // Here we add the positions all upfront, but these can be added at run-time as samples are received from a server.
    positionProperty.addSample(time, position)

    // Display each individual point as a red dot
    /*
    const pointData = {
      description: `Location: (${dataPoint.lon_deg}, ${dataPoint.lat_deg}, ${alt_agl_m})`,
      position: position,
      point: { pixelSize: 10, color: Cesium.Color.RED }
    }
    viewer.entities.add(pointData)
    */
  }

  // Display the overall path as a green line
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
    // Load the glTF airplane model from Cesium ion.
    const airplaneUri = await Cesium.IonResource.fromAssetId(1720886)
    const airplaneProperties = {
      availability: new Cesium.TimeIntervalCollection([
        new Cesium.TimeInterval({ start: start, stop: stop })
      ]),
      position: positionProperty,
      model: { uri: airplaneUri },
      // Automatically compute the orientation from the position.
      orientation: new Cesium.VelocityOrientationProperty(positionProperty),
      viewFrom: new Cesium.Cartesian3(-100, 0, 0)
    }
    const airplaneEntity = viewer.entities.add(airplaneProperties)
    gpsList.value.unshift({
      id: airplaneEntity.id,
      name: 'Mission Aircraft'
    })
    viewer.trackedEntity = airplaneEntity
  }

  loadModel()
}

function centerOnGps(id) {
  let index = gpsList.value.findIndex((x) => x.id === id)
  if (index > -1) {
    viewer.trackedEntity = viewer.entities.getById(id)
  }
  //viewer.trackedEntity = myPosition.value
  /*
  viewer.camera.flyTo({
    destination: Cesium.Cartesian3.fromDegrees(myLon, myLat, 5000)
  })
  */
}

function resetView() {
  viewer.trackedEntity = null
  viewer.entities.removeAll()
  gpsList.value = []
  clearMission()
  //viewer.camera.flyHome()
  viewer.clock.shouldAnimate = false
  //FindMe()
  initializeView()
}
/*
function getCenterOfCurrentView() {
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
function addVehicle(data) {
  const vehiclePosition = Cesium.Cartesian3.fromDegrees(
    data.lon,
    data.lat,
    turf.convertLength(data.altitude, 'feet', 'meters')
  )
  const vehicleEntity = viewer.entities.add({
    id: data.id,
    position: vehiclePosition,
    orientation: Cesium.Transforms.headingPitchRollQuaternion(
      vehiclePosition,
      new Cesium.HeadingPitchRoll(Cesium.Math.toRadians(data.bearing - 90), 0, 0)
    ),
    point: { pixelSize: 10, color: Cesium.Color.RED },
    label: {
      text: 'Flight ' + (data.flight || 'UNKNOWN'),
      font: '10pt monospace',
      style: Cesium.LabelStyle.FILL_AND_OUTLINE,
      outlineWidth: 5,
      verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
      pixelOffset: new Cesium.Cartesian2(0, -9)
    },
    path: new Cesium.PathGraphics({ width: 3 }),
    model: { uri: '/Cesium_Air.glb' }
  })
  console.log('(' + vehicleEntity.id + ') Vehicle added')
}

function updateVehicle(data) {
  const vehicleToUpdate = viewer.entities.getById(data.prev.id)
  if (data.fields.lon || data.fields.lat || data.fields.altitude) {
    let vehiclePosition = Cesium.Cartesian3.fromDegrees(
      data.next.lon,
      data.next.lat,
      turf.convertLength(data.next.altitude, 'feet', 'meters')
    )
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
  console.log('(' + vehicleToUpdate.id + ') Vehicle updated')
}

function addFlightVolume(data) {
  //console.log('Adding flight volume to myMissions: ' + JSON.stringify(data))
  // First, check if an object with this gufi already exists
  let index = myMissions.value.findIndex((x) => x.gufi === data.gufi)
  if (index < 0) {
    // Create the object and add it to the array
    myMissions.value.push({
      gufi: data.gufi,
      name: data.params.Name,
      flightvolume: data
    })
    //console.log('New missions array: ' + JSON.stringify(myMissions.value))
  } else {
    // The mission already exists -- just add the flightvolume to the object
    myMissions.value[index].flightvolume = data
    //console.log('Gufi already exists - flight volume added - new object: ' + JSON.stringify(myMissions.value[index]))
  }
  console.log('Flight volume added for gufi ' + data.gufi)
}

function addFlightPath(data) {
  //console.log('Adding flight path to myMissions: ' + JSON.stringify(data))

  // First, check if an object with this gufi already exists
  let index = myMissions.value.findIndex((x) => x.gufi === data.gufi)
  if (index < 0) {
    // Create the object and add it to the array
    //console.log('Mission not in array (index ' + index + ') - adding')
    myMissions.value.push({
      gufi: data.gufi,
      name: data.params.Name,
      flightpath: data
    })
    //console.log('New missions array: ' + JSON.stringify(myMissions.value))
  } else {
    // The mission already exists -- just add the flightpath to the object
    myMissions.value[index].flightpath = data
    //console.log('Gufi already exists (index ' + index + ') - flight path added - new object: ' + JSON.stringify(myMissions.value[index]))
  }
  console.log('Flight path added for gufi ' + data.gufi)
}

function addGPS(data) {
  if (viewer.entities.getById(data.id)) {
    removeEntity(data.id)
    let index = gpsList.value.findIndex((x) => x.id === data.id)
    if (index > -1) {
      gpsList.value.splice(index, 1)
    }
  }

  const gpsPosition = Cesium.Cartesian3.fromDegrees(
    data.lon,
    data.lat
    //turf.convertLength(data.altitude, 'feet', 'meters')
  )
  const gpsEntity = viewer.entities.add({
    id: data.id,
    position: gpsPosition,
    orientation: Cesium.Transforms.headingPitchRollQuaternion(
      gpsPosition,
      new Cesium.HeadingPitchRoll(Cesium.Math.toRadians(data.bearing - 90), 0, 0)
    ),
    point: { pixelSize: 10, color: Cesium.Color.ORANGE },
    label: {
      text: 'GPS-' + data.device,
      font: '10pt monospace',
      style: Cesium.LabelStyle.FILL_AND_OUTLINE,
      outlineWidth: 5,
      verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
      pixelOffset: new Cesium.Cartesian2(0, -9)
    }
    //path: new Cesium.PathGraphics({ width: 3 }),
    //model: { uri: '/Cesium_Air.glb' }
  })
  gpsList.value.push({
    id: gpsEntity.id,
    name: data.device
  })
  console.log('(' + gpsEntity.id + ') GPS added')
}

function updateGPS(data) {
  const gpsToUpdate = viewer.entities.getById(data.prev.id)
  if (data.fields.lon || data.fields.lat || data.fields.altitude) {
    let gpsPosition = Cesium.Cartesian3.fromDegrees(
      data.next.lon,
      data.next.lat
      //turf.convertLength(data.next.altitude, 'feet', 'meters')
    )
    gpsToUpdate.position = gpsPosition
  }
  /*
  if (data.fields.bearing) {
    gpsToUpdate.orientation = Cesium.Transforms.headingPitchRollQuaternion(
      Cesium.Cartesian3.fromDegrees(
        data.next.lon,
        data.next.lat,
        turf.convertLength(data.next.altitude, 'feet', 'meters')
      ),
      new Cesium.HeadingPitchRoll(Cesium.Math.toRadians(data.next.bearing - 90), 0, 0)
    )
  }
  if (data.fields.flight) {
    gpsToUpdate.label.text = 'Flight ' + (data.next.flight || 'UNKNOWN')
  }
  */
  console.log('(' + gpsToUpdate.id + ') GPS updated')
}

function addGPSdefault(data) {
  const gpsPosition = Cesium.Cartesian3.fromDegrees(
    data.aoi.geometry.coordinates[0],
    data.aoi.geometry.coordinates[1]
  )
  gpsDefault.value = viewer.entities.add({
    id: data.id,
    position: gpsPosition,
    point: { pixelSize: 10, color: Cesium.Color.ORANGE },
    label: {
      text: 'GPS-default',
      font: '10pt monospace',
      style: Cesium.LabelStyle.FILL_AND_OUTLINE,
      outlineWidth: 5,
      verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
      pixelOffset: new Cesium.Cartesian2(0, -9)
    }
  })
  gpsList.value.unshift({
    id: data.id,
    name: 'GPS-Default'
  })
}

function updateGPSdefault(data) {
  let gpsPosition = Cesium.Cartesian3.fromDegrees(
    data.next.aoi.geometry.coordinates[0],
    data.next.aoi.geometry.coordinates[1]
  )
  gpsDefault.value.position = gpsPosition
}

function addAlert(data) {
  //console.log('Alert received: ' + JSON.stringify(data))
  Cesium.GeoJsonDataSource.load(data.aoi).then((dataSource) => {
    viewer.dataSources.add(dataSource)
    const entities = dataSource.entities.values
    for (let i = 0; i < entities.length; i++) {
      const entity = entities[i]
      entity.polygon.material = Cesium.Color.RED.withAlpha(0.7)
      entity.polygon.extrudedHeight = 500
    }
  })
  console.log('Alert added')
}

function removeEntity(id) {
  viewer.entities.remove(viewer.entities.getById(id))
  console.log('(' + id + ') Entity removed')
}

function showMission(gufi) {
  clearMission()
  console.log('Displaying mission: ' + gufi)

  // Find the selected mission in the myMissions array and get the data
  currentMission.value = myMissions.value.find((x) => x.gufi === gufi)
  let currentFlightvolume = currentMission.value.flightvolume
  let currentFlightpath = currentMission.value.flightpath

  // Show the flight volume and store all related entities to the displayedMissionEntities array
  let volumePolygon = turfline.default(currentFlightvolume.aoi) // change LineStrings to a Polygon
  Cesium.GeoJsonDataSource.load(volumePolygon).then((dataSource) => {
    viewer.dataSources.add(dataSource)
    displayedMissionEntities.push(dataSource)
    const entities = dataSource.entities.values
    for (let i = 0; i < entities.length; i++) {
      const entity = entities[i]
      entity.polygon.material = Cesium.Color.YELLOW.withAlpha(0.1)
      entity.polygon.extrudedHeight = currentFlightvolume.params.altitude_upper.value
    }
  })

  // Show the flight path and store all related entities to the displayedMissionEntities array
  Cesium.GeoJsonDataSource.load(currentFlightpath.aoi).then((dataSource) => {
    viewer.dataSources.add(dataSource)
    displayedMissionEntities.push(dataSource)
  })
  /*
  let pathCoords = data.aoi.geometry.coordinates
  let pathPath = []
  for (let j = 0; j < pathCoords.length; j++) {
    pathPath.push(pathCoords[j][0])
    pathPath.push(pathCoords[j][1])
  }
  viewer.entities.add({
    id: data.id,
    corridor: {
      positions: Cesium.Cartesian3.fromDegreesArray(pathPath),
      //extrudedHeight: data.params.altitude_upper.value,
      width: 5,
      material: Cesium.Color.AQUAMARINE
    }
  })
  */
  server
    .call('genSim', gufi)
    .then((res) => {
      //console.log('Telemetry data received: ' + JSON.stringify(res[1]))
      currentMission.value.telem = res[1]
    })
    .catch((err) => {
      console.log(JSON.stringify(err))
    })

  viewer.trackedEntity = gpsDefault.value
}

function clearMission() {
  // Remove any mission elements already being displayed
  if (displayedMissionEntities.length) {
    for (let i = 0; i < displayedMissionEntities.length; i++) {
      viewer.dataSources.remove(displayedMissionEntities[i])
    }
  }
  displayedMissionEntities = []
}

function FindMe() {
  var watcher
  const navOptions = {
    enableHighAccuracy: true,
    timeout: 10000
  }

  function showMyPosition(position) {
    if (viewer.entities.getById('myPosition')) {
      viewer.entities.remove(viewer.entities.getById('myPosition'))
    }
    myLon = position.coords.longitude
    myLat = position.coords.latitude
    console.log('My GPS position found: ' + myLon + ', ' + myLat)

    myPosition.value = viewer.entities.add({
      id: 'myPosition',
      position: Cesium.Cartesian3.fromDegrees(myLon, myLat)
    })

    server
      .call('savegps', {
        type: 'gps',
        device: nicknameStore.myNickname,
        class: 'other',
        lat: myLat,
        lon: myLon
      })
      .then(() => {
        console.log('My GPS position successfully sent to server')
      })
      .catch((error) => {
        console.log(error)
      })
  }

  function updateMyPosition(position) {
    const longitude = position.coords.longitude
    const latitude = position.coords.latitude
    if (longitude !== myLon || latitude !== myLat) {
      console.log('My GPS position changed to: ' + position.coords)
      //myPosition.value.position = Cesium.Cartesian3.fromDegrees(longitude, latitude)
      myLon = longitude
      myLat = latitude
      server
        .call('savegps', {
          type: 'gps',
          device: nicknameStore.myNickname,
          class: 'other',
          lat: myLat,
          lon: myLon
        })
        .then(() => {
          console.log('GPS position change successfully sent to server')
        })
        .catch((error) => {
          console.log(error)
        })
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
        console.log('Cannot get location data')
        navigator.geolocation.clearWatch(watcher)
        break
      case 1:
        // ...user said no
        console.log('Location permission denied by user')
        navigator.geolocation.clearWatch(watcher)
    }
  }

  // Find my position and watch for changes
  if (navigator.geolocation) {
    if (watcher) navigator.geolocation.clearWatch(watcher)
    navigator.geolocation.getCurrentPosition(showMyPosition, handleLocationError, navOptions)
    watcher = navigator.geolocation.watchPosition(updateMyPosition, handleLocationError, navOptions)
  } else {
    alert('Geolocation is not supported by this browser.')
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
.cesiumViewer {
  width: 100%;
  height: 100%;
}
.cesium-widget-credits {
  display: none !important;
}
#showControlPanel {
  position: absolute;
  top: 5px;
  left: 5px;
}
</style>
