import Globe from "globe.gl";
import $ from "jquery";
import { enableIllumination } from "./illumination.js";
import { fetchWeather, displayWeather } from "./weather.js";
import { searchLocations } from "./geocoding.js";

// Select the HTML container for the 3D Earth.
const container = document.getElementById("globe");
// Track the active weather request.
let activeWeatherRequest = null;

// Calculate the initial camera distance based on screen proportions.
function getHomeAltitude() {
  // Use a wider planetary view on compact landscape screens.
  if (
    window.matchMedia(
      "(orientation: landscape) and (min-width: 650px) and (max-width: 1023px) and (max-height: 449px)",
    ).matches
  ) {
    return 3.8;
  }

  const aspectRatio = container.clientHeight / container.clientWidth;

  return Math.max(2.5, 2.6 * aspectRatio - 1);
}

// Calculate the wider exploration camera distance.
function getExplorationAltitude() {
  return getHomeAltitude() + 1.0;
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

// Select a location and retrieve its weather information.
function selectLocation(lat, lng, locationName = null) {
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

      displayWeather(data, lat, lng, locationName);

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
}

// Select a geographical location by clicking Earth.
earth.onGlobeClick(({ lat, lng }) => {
  // Prevent weather selection during the introduction.
  if ($("#observation-scene").attr("data-stage") === "intro") {
    return;
  }

  selectLocation(lat, lng);
});

// Adjust the globe and camera when the screen is resized.
$(window).on("resize", function () {
  earth.width(container.clientWidth);
  earth.height(container.clientHeight);

  const view = earth.pointOfView();

  earth.pointOfView({
    lat: view.lat,
    lng: view.lng,
    altitude:
      $("#observation-scene").attr("data-stage") === "intro"
        ? getHomeAltitude()
        : getExplorationAltitude(),
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

// Fade out the glass panels before returning to the Moon.
$("#reset-btn").on("click", function () {
  $(this).prop("disabled", true);

  $("#left-panel, #right-panel")
    .stop(true, false)
    .fadeTo(1200, 0)
    .promise()
    .done(resetObservation);
});

// Reset the original planetary viewpoint.
function resetObservation() {
  // Cancel pending city search requests.
  if (activeSearchRequest) {
    activeSearchRequest.abort();
    activeSearchRequest = null;
  }

  // Clear the city search interface.
  $("#city-input").val("");
  $("#search-status").text("");
  $("#search-results").empty().addClass("hidden");

  // Cancel pending weather requests.
  if (activeWeatherRequest) {
    activeWeatherRequest.abort();
    activeWeatherRequest = null;
  }

  // Restore the original guidance panels.
  $("#left-weather, #right-weather").addClass("hidden");
  $("#left-guidance, #right-guidance").removeClass("hidden");

  // Clear previous weather summaries.
  $("#current-weather-summary, #forecast-summary").empty();

  // Restore the original panel scroll positions.
  $("#left-panel, #right-panel").scrollTop(0);

  // Hide the weather dashboard.
  $("#weather-panel").addClass("hidden");
  $("#view-weather-btn").addClass("hidden");

  // Remove geographical markers.
  earth.pointsData([]);
  earth.ringsData([]);

  // Cinematically return to the lunar observation viewpoint.
  earth.pointOfView(
    {
      lat: 20,
      lng: 0,
      altitude: getHomeAltitude(),
    },
    4000,
  );

  // Resume automatic planetary rotation.
  earth.controls().autoRotate = true;

  $("#rotate-btn").text("Pause rotation");

  // Stop interface animations and remove inline display styles.
  $("#city-search, #observation-controls").stop(true, true).css("display", "");

  // Restore the cinematic introduction state.
  $("#observation-scene").attr("data-stage", "intro");

  // Synchronize the Start here button with the lunar fade-in.
  $("#start-btn")
    .stop(true, false)
    .css("opacity", 0)
    .prop("disabled", true)
    .delay(1200)
    .fadeTo(3400, 1, function () {
      $(this).prop("disabled", false);
    });

  // Gradually restore the lunar landscape after a short delay.
  $("#lunar-surface").css({
    transitionDelay: "1.2s",
    opacity: 1,
  });

  // Restore the default instructions.
  $("#coordinates").text("Select a location to explore Earth");

  // Restore panel opacity and reset button availability.
  $("#left-panel, #right-panel").css("opacity", "");
  $("#reset-btn").prop("disabled", false);
}

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

// Navigate according to the active responsive layout.
$("#view-weather-btn").on("click", function () {
  const panelPosition = getComputedStyle(
    document.getElementById("left-panel"),
  ).position;

  // Integrated layouts use absolute positioning.
  // Stacked layouts use relative positioning.
  const target = panelPosition === "absolute" ? "weather-panel" : "left-panel";

  document.getElementById(target).scrollIntoView({
    behavior: "smooth",
    block: "start",
  });
});

// Track the active city search request.
let activeSearchRequest = null;

// Handle city search submissions.
$("#search-form").on("submit", function (event) {
  // Prevent the browser from reloading the page.
  event.preventDefault();

  const query = $("#city-input").val().trim();

  if (query.length < 2) {
    $("#search-status").text("Enter at least two characters.");
    return;
  }

  // Cancel any previous unfinished search.
  if (activeSearchRequest) {
    activeSearchRequest.abort();
  }

  $("#search-status").text("Searching locations...");
  $("#search-results").empty().addClass("hidden");

  // Retrieve matching geographical locations.
  activeSearchRequest = searchLocations(query)
    .done(function (data) {
      const locations = data.results || [];

      if (locations.length === 0) {
        $("#search-status").text("No matching locations found.");
        return;
      }

      $("#search-status").text("Select a location.");

      // Create a button for each matching location.
      locations.forEach(function (location) {
        const label = [location.name, location.admin1, location.country]
          .filter(Boolean)
          .join(", ");

        // Identify locations with identical display names.
        const duplicateName =
          locations.filter(function (item) {
            return (
              [item.name, item.admin1, item.country]
                .filter(Boolean)
                .join(", ") === label
            );
          }).length > 1;

        // Include coordinates when names are identical.
        const resultLabel = duplicateName
          ? `${label} (${location.latitude.toFixed(4)}°, ${location.longitude.toFixed(4)}°)`
          : label;

        const button = $("<button>")
          .attr("type", "button")
          .addClass(
            "block w-full text-left px-4 py-3 " +
              "hover:bg-sky-900/60 border-b border-slate-800",
          )
          .text(resultLabel);

        // Navigate to the selected city.
        button.on("click", function () {
          // Display the selected location in the search field.
          $("#city-input").val(location.name);

          // Hide the search results.
          $("#search-results").empty().addClass("hidden");

          $("#search-status").text("");

          // Reuse our existing location selection function.
          selectLocation(location.latitude, location.longitude, label);

          // Smoothly rotate Earth toward the selected city.
          earth.pointOfView(
            {
              lat: location.latitude,
              lng: location.longitude,
              altitude: getExplorationAltitude(),
            },
            1800,
          );
        });

        $("#search-results").append(button);
      });

      // Reveal the search results.
      $("#search-results").removeClass("hidden");
    })

    .fail(function (xhr, status, error) {
      if (status === "abort") {
        return;
      }

      console.error("City search failed:", status, error);

      $("#search-status").text("Search unavailable. Please try again.");
    });
});

// Transition from cinematic introduction to exploration.
$("#start-btn").on("click", function () {
  // Gradually fade out the button together with the lunar landscape.
  $(this).prop("disabled", true).fadeTo(3400, 0);

  // Preserve the current planetary orientation.
  const view = earth.pointOfView();

  // Slowly zoom out from Earth.
  earth.pointOfView(
    {
      lat: view.lat,
      lng: view.lng,
      altitude: getExplorationAltitude(),
    },
    4000,
  );

  // Gradually hide the lunar landscape without delay.
  $("#lunar-surface").css({
    transitionDelay: "0s",
    opacity: 0,
  });

  // Delay the exploration interface for a cinematic effect.
  setTimeout(function () {
    $("#observation-scene").attr("data-stage", "explore");

    $("#city-search").hide().fadeIn(1200);
    $("#observation-controls").hide().fadeIn(1200);

    // Gradually reveal both glass panels.
    $("#left-panel, #right-panel").css("opacity", 0).fadeTo(1200, 1);

    $("#start-btn").prop("disabled", false);
  }, 3500);
});
