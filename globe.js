import Globe from "globe.gl";
import $ from "jquery";

// Select the HTML container for the 3D Earth.
const container = document.getElementById("globe");

// Initialize the interactive globe.
const earth = new Globe(container)
  .globeImageUrl(
    "https://cdn.jsdelivr.net/npm/three-globe/example/img/earth-blue-marble.jpg",
  )
  .backgroundImageUrl(
    "https://cdn.jsdelivr.net/npm/three-globe/example/img/night-sky.png",
  )
  .atmosphereColor("#87ceeb")
  .atmosphereAltitude(0.15)
  .width(container.clientWidth)
  .height(container.clientHeight);

// Configure automatic rotation.
earth.controls().autoRotate = true;
earth.controls().autoRotateSpeed = 0.4;

// Set the initial camera position.
earth.pointOfView({
  lat: 20,
  lng: 0,
  altitude: 2.5,
});

// Retrieve coordinates when the user clicks Earth.
earth.onGlobeClick(({ lat, lng }) => {
  earth.controls().autoRotate = false;

  $("#coordinates").text(
    `Latitude: ${lat.toFixed(2)}° | Longitude: ${lng.toFixed(2)}°`,
  );
});

// Adjust the globe when the browser is resized.
$(window).on("resize", function () {
  earth.width(container.clientWidth);
  earth.height(container.clientHeight);
});
