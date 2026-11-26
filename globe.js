import Globe from "globe.gl";
import $ from "jquery";
import { enableIllumination } from "./illumination.js";
import { fetchWeather, displayWeather } from "./weather.js";

// Select the HTML container for the 3D Earth.
const container = document.getElementById("globe");
// Track the active weather request.
let activeWeatherRequest = null;

// Calculate the initial camera distance based on screen proportions.
function getHomeAltitude() {
  const aspectRatio = container.clientHeight / container.clientWidth;

  return Math.max(2.5, 2.6 * aspectRatio - 1);
}

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

// Set the responsive camera position once Earth is ready.
earth.onGlobeReady(() => {
  earth.pointOfView({
    lat: 20,
    lng: 0,
    altitude: getHomeAltitude(),
  });
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

  // Cancel any previous unfinished weather request.
  if (activeWeatherRequest) {
    activeWeatherRequest.abort();
  }

  // Show a loading message.
  $("#coordinates").text("Retrieving weather data...");
  $("#weather-panel").addClass("hidden");
  $("#view-weather-btn").addClass("hidden");

  // Retrieve weather data for the selected location.
  activeWeatherRequest = fetchWeather(lat, lng)
    .done(function (data) {
      console.log("AtmosReal weather data:", data);

      displayWeather(data, lat, lng);

      $("#coordinates").text(
        `Latitude: ${lat.toFixed(2)}° | Longitude: ${lng.toFixed(2)}°`,
      );

      // Show the weather navigation button.
      $("#view-weather-btn").removeClass("hidden");
    })

    .fail(function (xhr, status, error) {
      if (status === "abort") {
        return;
      }

      console.error("Weather request failed:", status, error);

      $("#coordinates").text("Weather data unavailable. Please try again.");
    });
});

// Adjust the globe and camera when the screen is resized.
$(window).on("resize", function () {
  earth.width(container.clientWidth);
  earth.height(container.clientHeight);

  const view = earth.pointOfView();

  earth.pointOfView({
    lat: view.lat,
    lng: view.lng,
    altitude: getHomeAltitude(),
  });
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
      altitude: Math.min(
        Math.max(5, getHomeAltitude() * 1.5),
        view.altitude * 1.25,
      ),
    },
    500,
  );
});

// Reset the original planetary viewpoint.
$("#reset-btn").on("click", function () {
  // Cancel pending weather requests.
  if (activeWeatherRequest) {
    activeWeatherRequest.abort();
    activeWeatherRequest = null;
  }

  // Hide the weather dashboard.
  $("#weather-panel").addClass("hidden");
  $("#view-weather-btn").addClass("hidden");
  earth.pointsData([]);
  earth.ringsData([]);

  earth.pointOfView(
    {
      lat: 20,
      lng: 0,
      altitude: getHomeAltitude(),
    },
    1000,
  );

  earth.controls().autoRotate = true;

  $("#rotate-btn").text("Pause rotation");

  // Restore the lunar observation view.
  $("#lunar-surface").css("opacity", 1);

  $("#coordinates").text("Select a location to explore Earth");
});

// Enable illumination and configure observation modes.
enableIllumination(earth)
  .then((setExplorationMode) => {
    let explorationEnabled = false;

    // Enable the button once the shader is ready.
    $("#mode-btn").prop("disabled", false);

    // Switch between observation modes.
    $("#mode-btn").on("click", function () {
      explorationEnabled = !explorationEnabled;

      setExplorationMode(explorationEnabled);

      $(this).text(explorationEnabled ? "Real-time mode" : "Exploration mode");

      $(this).attr("aria-pressed", explorationEnabled);
    });
  })
  .catch((error) => {
    console.error("Illumination could not load:", error);
  });

// Navigate to the weather dashboard.
$("#view-weather-btn").on("click", function () {
  document
    .getElementById("weather-panel")
    .scrollIntoView({ behavior: "smooth" });
});
