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
export function displayWeather(data, lat, lng, locationName = null) {
  const current = data.current;
  const units = data.current_units;

  // Display the city name when available.
  const coordinates = `Latitude: ${lat.toFixed(2)}° | Longitude: ${lng.toFixed(2)}°`;

  $("#weather-location").text(
    locationName ? `${locationName} | ${coordinates}` : coordinates,
  );

  // Display current weather information.
  $("#weather-temperature").text(
    `${current.temperature_2m} ${units.temperature_2m}`,
  );

  // Display the current weather icon and condition.
  $("#weather-condition").text(
    `${getWeatherIcon(current.weather_code, current.is_day === 1)}
    ${getWeatherCondition(current.weather_code)}`,
  );

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

  // Display the five-day weather forecast.
  displayForecast(data);

  // Populate the current weather glass panel.
  displayWeatherSummary(data, lat, lng, locationName);

  // Replace exploration guidance with current weather.
  $("#left-guidance").addClass("hidden");
  $("#left-weather").removeClass("hidden");

  // Populate the five-day forecast glass panel.
  displayForecastSummary(data);

  // Replace observation guidance with the forecast.
  $("#right-guidance").addClass("hidden");
  $("#right-weather").removeClass("hidden");

  // Reset panel scroll positions for each selected location.
  $("#left-panel, #right-panel").scrollTop(0);

  // Reveal the detailed weather dashboard.
  $("#weather-panel").removeClass("hidden");
}

// Generate daily weather forecast cards.
function displayForecast(data) {
  const daily = data.daily;
  const units = data.daily_units || {};

  const container = $("#forecast-cards");

  // Remove forecast cards from the previous location.
  container.empty();

  // Check whether forecast data is available.
  if (!daily?.time?.length) {
    container.text("Forecast data unavailable.");
    return;
  }

  // Generate one card for each forecast day.
  daily.time.forEach(function (date, index) {
    const day = new Date(date + "T12:00:00Z").toLocaleDateString("en-GB", {
      weekday: "short",
      day: "numeric",
      month: "short",
      timeZone: "UTC",
    });

    const condition = getWeatherCondition(daily.weather_code[index]);

    const maximum = daily.temperature_2m_max[index];
    const minimum = daily.temperature_2m_min[index];

    const precipitation = daily.precipitation_probability_max[index];

    // Create the forecast card.
    const card = $("<div>").addClass("bg-slate-900 rounded-xl p-4 text-center");

    // Add forecast information.
    card.append(
      $("<p>")
        .addClass("text-4xl mb-3")
        .attr("aria-hidden", "true")
        .text(getWeatherIcon(daily.weather_code[index])),

      $("<p>").addClass("font-bold text-cyan-400 mb-3").text(day),

      $("<p>").addClass("text-slate-300 mb-3").text(condition),

      $("<p>")
        .addClass("text-orange-400")
        .text(`Max: ${maximum ?? "--"} ${units.temperature_2m_max ?? "°C"}`),

      $("<p>")
        .addClass("text-sky-400")
        .text(`Min: ${minimum ?? "--"} ${units.temperature_2m_min ?? "°C"}`),

      $("<p>")
        .addClass("text-blue-300 text-sm mt-3")
        .text(`Precipitation: ${precipitation ?? "--"}%`),
    );

    // Insert the card into the forecast container.
    container.append(card);
  });
}

// Select a weather icon according to the WMO weather code.
function getWeatherIcon(code, isDay = true) {
  switch (code) {
    case 0:
      return isDay ? "☀️" : "🌙";

    case 1:
    case 2:
      return isDay ? "🌤️" : "☁️";

    case 3:
      return "☁️";

    case 45:
    case 48:
      return "🌫️";

    case 51:
    case 53:
    case 55:
    case 56:
    case 57:
      return "🌦️";

    case 61:
    case 63:
    case 65:
    case 66:
    case 67:
    case 80:
    case 81:
    case 82:
      return "🌧️";

    case 71:
    case 73:
    case 75:
    case 77:
    case 85:
    case 86:
      return "🌨️";

    case 95:
    case 96:
    case 99:
      return "⛈️";

    default:
      return "🌡️";
  }
}

// Generate a compact current weather summary.
function displayWeatherSummary(data, lat, lng, locationName) {
  const current = data.current;
  const units = data.current_units;

  const container = $("#current-weather-summary");

  // Remove information from the previous location.
  container.empty();

  const location = locationName || `${lat.toFixed(2)}°, ${lng.toFixed(2)}°`;

  // Display the location, temperature and weather condition.
  container.append(
    $("<p>").addClass("text-slate-300 text-sm mb-3").text(location),

    // Combine the weather icon and temperature.
    $("<div>")
      .addClass("flex items-center gap-3 mb-2")
      .append(
        $("<span>")
          .addClass("text-4xl")
          .attr("aria-hidden", "true")
          .text(getWeatherIcon(current.weather_code, current.is_day === 1)),

        $("<span>")
          .addClass("text-3xl font-bold text-white")
          .text(`${current.temperature_2m} ${units.temperature_2m}`),
      ),

    // Combine weather condition and daylight information.
    $("<div>")
      .addClass("flex items-center justify-between flex-wrap gap-2 mb-3")
      .append(
        $("<span>")
          .addClass("text-cyan-300")
          .text(getWeatherCondition(current.weather_code)),

        $("<span>")
          .addClass("text-slate-400 text-xs")
          .text(current.is_day === 1 ? "☀️ Daytime" : "🌙 Nighttime"),
      ),
  );

  // Prepare additional weather measurements.
  const measurements = [
    [
      "Feels like",
      `${current.apparent_temperature} ${units.apparent_temperature}`,
    ],
    ["Humidity", `${current.relative_humidity_2m}%`],
    ["Wind speed", `${current.wind_speed_10m} ${units.wind_speed_10m}`],
    ["Cloud coverage", `${current.cloud_cover}%`],
    ["Local time", current.time.split("T")[1]],
  ];

  // Dynamically generate measurement rows.
  measurements.forEach(function ([label, value]) {
    const row = $("<div>").addClass(
      "flex justify-between gap-3 py-2 " + "border-t border-sky-900/40 text-sm",
    );

    row.append(
      $("<span>").addClass("text-slate-400").text(label),

      $("<span>").addClass("text-white font-medium").text(value),
    );

    container.append(row);
  });
}

// Generate a compact five-day forecast.
function displayForecastSummary(data) {
  const daily = data.daily;
  const container = $("#forecast-summary");

  // Remove forecast information from the previous location.
  container.empty();

  // Check whether forecast data is available.
  if (!daily?.time?.length) {
    container.text("Forecast data unavailable.");
    return;
  }

  daily.time.forEach(function (date, index) {
    // Format the local forecast date.
    const day = new Date(date + "T12:00:00Z").toLocaleDateString("en-GB", {
      weekday: "short",
      day: "numeric",
      month: "short",
      timeZone: "UTC",
    });

    const code = daily.weather_code[index];
    const maximum = daily.temperature_2m_max[index];
    const minimum = daily.temperature_2m_min[index];
    const precipitation = daily.precipitation_probability_max[index];

    // Create the forecast row.
    const row = $("<div>").addClass(
      "flex items-center gap-3 py-1.5 " + "border-b border-sky-900/40",
    );

    // Weather icon.
    const icon = $("<span>")
      .addClass("text-3xl")
      .attr("aria-hidden", "true")
      .text(getWeatherIcon(code));

    // Date and weather information.
    const details = $("<div>").addClass("flex-1 min-w-0");

    details.append(
      $("<p>").addClass("text-white font-medium text-sm").text(day),

      $("<p>")
        .addClass("text-slate-400 text-xs")
        .text(getWeatherCondition(code)),

      $("<p>")
        .addClass("text-sky-300 text-xs mt-1")
        .text(`💧 ${precipitation ?? "--"}%`),
    );

    // Maximum and minimum temperatures.
    const temperatures = $("<div>").addClass("text-right whitespace-nowrap");

    temperatures.append(
      $("<p>")
        .addClass("text-orange-400 font-medium")
        .text(`${maximum ?? "--"}°`),

      $("<p>")
        .addClass("text-sky-400 text-sm")
        .text(`${minimum ?? "--"}°`),
    );

    // Assemble the forecast row.
    row.append(icon, details, temperatures);

    container.append(row);
  });

  container.append(
    $("<p>")
      .addClass("text-xs text-slate-400 mt-4")
      .text("Data provider: Open-Meteo"),
  );
}
