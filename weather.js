import $ from "jquery";

// Open-Meteo weather forecast API endpoint.
const WEATHER_API = "https://api.open-meteo.com/v1/forecast";

// Retrieve weather data for a geographical location.
export function fetchWeather(lat, lng) {
  return $.ajax({
    url: WEATHER_API,

    method: "GET",

    dataType: "json",

    timeout: 15000,

    data: {
      latitude: lat,
      longitude: lng,

      current: [
        "temperature_2m",
        "relative_humidity_2m",
        "apparent_temperature",
        "weather_code",
        "wind_speed_10m",
        "wind_direction_10m",
        "cloud_cover",
        "surface_pressure",
        "is_day",
      ].join(","),

      daily: [
        "weather_code",
        "temperature_2m_max",
        "temperature_2m_min",
        "precipitation_probability_max",
        "sunrise",
        "sunset",
      ].join(","),

      timezone: "auto",
      forecast_days: 5,
    },
  });
}

// Display current weather information in the dashboard.
export function displayWeather(data, lat, lng) {
  const current = data.current;
  const units = data.current_units;

  // Display the selected geographical coordinates.
  $("#weather-location").text(
    `Latitude: ${lat.toFixed(2)}° | Longitude: ${lng.toFixed(2)}°`,
  );

  // Display current weather information.
  $("#weather-temperature").text(
    `${current.temperature_2m} ${units.temperature_2m}`,
  );

  $("#weather-humidity").text(`${current.relative_humidity_2m}%`);

  $("#weather-elevation").text(`${data.elevation} m`);

  $("#weather-time").text(current.time.split("T")[1]);

  $("#weather-timezone").text(data.timezone);

  $("#weather-status").text(
    "Data provider: Open-Meteo | Data received successfully",
  );

  // Reveal the weather dashboard.
  $("#weather-panel").removeClass("hidden");
}
