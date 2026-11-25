import Globe from "globe.gl";
import $ from "jquery";

import { enableIllumination } from "./illumination.js";

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
// Configure the geographical location marker.
earth
  .pointColor("#ffb347")
  .pointAltitude(0.005)
  .pointRadius(0.4)
  .ringColor(() => "#ffb347")
  .ringMaxRadius(4)
  .ringPropagationSpeed(2)
  .ringRepeatPeriod(1000);

// Set the initial camera position.
earth.pointOfView({
  lat: 20,
  lng: 0,
  altitude: 2.5,
});

// Retrieve coordinates when the user clicks Earth.
// Retrieve coordinates and mark the selected location.
earth.onGlobeClick(({ lat, lng }) => {
  // Stop automatic rotation.
  earth.controls().autoRotate = false;
  $("#rotate-btn").text("Resume rotation");

  // Hide the lunar foreground when exploring Earth.
  $("#lunar-surface").css("opacity", 0);

  // Store the selected geographical location.
  const location = { lat, lng };

  // Display the point and animated rings.
  earth.pointsData([location]);
  earth.ringsData([location]);

  // Update coordinates using jQuery.
  $("#coordinates").text(
    `Latitude: ${lat.toFixed(2)}° | Longitude: ${lng.toFixed(2)}°`,
  );
});

// Adjust the globe when the browser is resized.
$(window).on("resize", function () {
  earth.width(container.clientWidth);
  earth.height(container.clientHeight);
});

// Pause or resume automatic rotation.
$("#rotate-btn").on("click", function () {
  const controls = earth.controls();

  controls.autoRotate = !controls.autoRotate;

  $(this).text(controls.autoRotate ? "Pause rotation" : "Resume rotation");
});

// Zoom in.
$("#zoom-in-btn").on("click", function () {
  const view = earth.pointOfView();

  earth.pointOfView(
    {
      altitude: Math.max(0.1, view.altitude * 0.75),
    },
    500,
  );
});

// Zoom out.
$("#zoom-out-btn").on("click", function () {
  const view = earth.pointOfView();

  earth.pointOfView(
    {
      altitude: Math.min(5, view.altitude * 1.25),
    },
    500,
  );
});

// Reset the original planetary viewpoint.
$("#reset-btn").on("click", function () {
  earth.pointsData([]);
  earth.ringsData([]);

  earth.pointOfView(
    {
      lat: 20,
      lng: 0,
      altitude: 2.5,
    },
    1000,
  );

  earth.controls().autoRotate = true;

  $("#rotate-btn").text("Pause rotation");

  // Restore the lunar observation view.
  $("#lunar-surface").css("opacity", 1);

  $("#coordinates").text("Select a location to explore Earth");
});

// Enable real-time planetary illumination.
enableIllumination(earth).catch((error) => {
  console.error("Illumination could not load:", error);
});
