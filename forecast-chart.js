import Chart from "chart.js/auto";

// Store the active chart instance.
let temperatureChart = null;

// Create an interactive five-day temperature forecast.
export function displayTemperatureChart(daily) {
  const canvas = document.getElementById("temperature-chart");

  // Remove the previous chart when selecting a new location.
  if (temperatureChart) {
    temperatureChart.destroy();
  }

  // Convert forecast dates into readable weekday labels.
  const labels = daily.time.map((date) =>
    new Date(`${date}T12:00:00`).toLocaleDateString("en-GB", {
      weekday: "short",
      day: "numeric",
      month: "short",
    }),
  );

  // Create the temperature chart.
  temperatureChart = new Chart(canvas, {
    type: "line",

    data: {
      labels: labels,

      datasets: [
        {
          label: "Maximum temperature",
          data: daily.temperature_2m_max,
          borderColor: "#f59e0b",
          backgroundColor: "#f59e0b",
          tension: 0.35,
          pointRadius: 4,
          borderWidth: 2,
        },
        {
          label: "Minimum temperature",
          data: daily.temperature_2m_min,
          borderColor: "#22d3ee",
          backgroundColor: "#22d3ee",
          tension: 0.35,
          pointRadius: 4,
          borderWidth: 2,
        },
      ],
    },

    options: {
      responsive: true,
      maintainAspectRatio: false,

      interaction: {
        mode: "index",
        intersect: false,
      },

      plugins: {
        legend: {
          labels: {
            color: "#cbd5e1",
          },
        },
        tooltip: {
          callbacks: {
            label: (context) =>
              `${context.dataset.label}: ${context.parsed.y} °C`,
          },
        },
      },

      scales: {
        x: {
          ticks: {
            color: "#94a3b8",
          },
          grid: {
            color: "rgba(148, 163, 184, 0.08)",
          },
        },
        y: {
          ticks: {
            color: "#94a3b8",
            callback: (value) => `${value} °C`,
          },
          grid: {
            color: "rgba(148, 163, 184, 0.12)",
          },
        },
      },
    },
  });
}
