import $ from "jquery";

// Open-Meteo weather forecast API endpoint.
const WEATHER_API = "https://api.open-meteo.com/v1/forecast";

// Translate WMO weather codes into readable descriptions.
// Reference: https://open-meteo.com/en/docs
export function getWeatherCondition(code) {
  const conditions = {
    0: "Clear sky",
    1: "Mostly clear",
    2: "Partly cloudy",
    3: "Overcast",
    45: "Fog",
    48: "Freezing fog",
    51: "Light drizzle",
    53: "Moderate drizzle",
    55: "Heavy drizzle",
    56: "Light freezing drizzle",
    57: "Heavy freezing drizzle",
    61: "Light rain",
    63: "Moderate rain",
    65: "Heavy rain",
    66: "Light freezing rain",
    67: "Heavy freezing rain",
    71: "Light snowfall",
    73: "Moderate snowfall",
    75: "Heavy snowfall",
    77: "Snow grains",
    80: "Light rain showers",
    81: "Moderate rain showers",
    82: "Intense rain showers",
    85: "Light snow showers",
    86: "Heavy snow showers",
    95: "Thunderstorm",
    96: "Thunderstorm with light hail",
    97: "Severe thunderstorm",
    99: "Thunderstorm with heavy hail",
  };

  return conditions[code] ?? "Unknown condition";
}

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

  // Display the current weather condition.
  $("#weather-condition").text(getWeatherCondition(current.weather_code));

  // Display the local day or night status.
  $("#weather-daylight").text(
    current.is_day === 1 ? "☀️ Daytime" : "🌙 Nighttime",
  );

  $("#weather-humidity").text(`${current.relative_humidity_2m}%`);

  $("#weather-elevation").text(`${data.elevation} m`);

  $("#weather-time").text(current.time.split("T")[1]);

  $("#weather-timezone").text(data.timezone);

  // Display feels-like temperature.
  $("#weather-feels-like").text(
    `${current.apparent_temperature} ${units.apparent_temperature}`,
  );

  // Display wind speed.
  $("#weather-wind-speed").text(
    `${current.wind_speed_10m} ${units.wind_speed_10m}`,
  );

  // Display wind direction.
  $("#weather-wind-direction").text(`${current.wind_direction_10m}°`);

  // Display cloud coverage.
  $("#weather-cloud-cover").text(`${current.cloud_cover}%`);

  // Display surface atmospheric pressure.
  $("#weather-pressure").text(
    `${current.surface_pressure} ${units.surface_pressure}`,
  );

  // Display today's sunrise and sunset in local time.
  $("#weather-sunrise").text(
    data.daily.sunrise[0]?.split("T")[1] || "Unavailable",
  );

  $("#weather-sunset").text(
    data.daily.sunset[0]?.split("T")[1] || "Unavailable",
  );

  $("#weather-status").text(
    "Data provider: Open-Meteo | Data received successfully",
  );

  // Reveal the weather dashboard.
  $("#weather-panel").removeClass("hidden");
}
