import $ from "jquery";

// Open-Meteo geographical search API.
// Reference: https://open-meteo.com/en/docs/geocoding-api
const GEOCODING_API = "https://geocoding-api.open-meteo.com/v1/search";

// Search for geographical locations by name.
export function searchLocations(query) {
  return $.ajax({
    url: GEOCODING_API,

    method: "GET",

    dataType: "json",

    timeout: 15000,

    data: {
      name: query.trim(),
      count: 5,
      language: "en",
      format: "json",
    },
  });
}
