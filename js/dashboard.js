// Add this at the top of dashboard.js
console.log('Chart.js version:', Chart.version);
console.log('Luxon adapter registered:', Chart._adapters?.date);
// DOM Element References
const tempValue = document.getElementById("temp-value");
const humidityValue = document.getElementById("humidity-value");
const nitrogenValue = document.getElementById("nitrogen-value");
const phosphorusValue = document.getElementById("phosphorus-value");
const potassiumValue = document.getElementById("potassium-value");

// Chart Variables
let tempHumidityChart, npkChart;
const maxDataPoints = 1000;
const chartData = {
  timestamps: [],
  temperature: [],
  humidity: [],
  npk: [0, 0, 0]
};

// Initialize Charts
function initCharts() {
  const tempHumidityCtx = document.getElementById('tempHumidityChart');
  const npkCtx = document.getElementById('npkChart');

  // Destroy existing chart instances if they exist
  if (tempHumidityChart) tempHumidityChart.destroy();
  if (npkChart) npkChart.destroy();

  function writeSensorDataToFirebase(data) {
  const timestamp = new Date().toISOString(); // ISO format key
  database.ref(`sensorData/${timestamp}`).set({
    temperature: data.temperature,
    humidity: data.humidity,
    nitrogen: data.nitrogen,
    phosphorus: data.phosphorus,
    potassium: data.potassium
  });
}

  // Temperature & Humidity Line Chart
  tempHumidityChart = new Chart(tempHumidityCtx, {
    type: 'line',
    data: {
      labels: chartData.timestamps,
      datasets: [
        {
          label: 'Temperature (°C)',
          data: chartData.temperature,
          borderColor: '#FF6384',
          backgroundColor: 'rgba(255, 99, 132, 0.2)',
          borderWidth: 2,
          tension: 0.1
        },
        {
          label: 'Humidity (%)',
          data: chartData.humidity,
          borderColor: '#36A2EB',
          backgroundColor: 'rgba(54, 162, 235, 0.2)',
          borderWidth: 2,
          tension: 0.1
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: { y: { beginAtZero: false } }
    }
  });

  // NPK Bar Chart
  npkChart = new Chart(npkCtx, {
    type: 'bar',
    data: {
      labels: ['Nitrogen', 'Phosphorus', 'Potassium'],
      datasets: [{
        label: 'NPK Levels (ppm)',
        data: chartData.npk,
        backgroundColor: [
          'rgba(75, 192, 192, 0.6)',
          'rgba(54, 162, 235, 0.6)',
          'rgba(255, 206, 86, 0.6)'
        ],
        borderColor: [
          'rgba(75, 192, 192, 1)',
          'rgba(54, 162, 235, 1)',
          'rgba(255, 206, 86, 1)'
        ],
        borderWidth: 1
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: { y: { beginAtZero: true } }
    }
  });
}

// Update Charts with New Data
function updateCharts(data) {
  const now = new Date();
  const timeLabel = now.toLocaleTimeString();

  // Limit data points to max allowed
  if (chartData.timestamps.length >= maxDataPoints) {
    chartData.timestamps.shift();
    chartData.temperature.shift();
    chartData.humidity.shift();
  }

  chartData.timestamps.push(timeLabel);
  chartData.temperature.push(data.temperature);
  chartData.humidity.push(data.humidity);

  // Update NPK data array
  chartData.npk[0] = data.nitrogen;
  chartData.npk[1] = data.phosphorus;
  chartData.npk[2] = data.potassium;
  
  // Update chart visuals
  tempHumidityChart.update();
  npkChart.update();
}

// Initialize Dashboard on Page Load
document.addEventListener('DOMContentLoaded', () => {
  initCharts();

  // Set loading states for card values
  document.querySelectorAll(".card-value").forEach(el => {
    el.textContent = "Loading...";
    el.setAttribute("data-loading", "true");
  });

  // Firebase Auth State Listener
  auth.onAuthStateChanged(user => {
    if (user) {
      database.ref("/sensorData").on("value", (snapshot) => {
        const data = snapshot.val();
        if (data) {
          // Safe DOM queries inside callback
          const tempValue = document.getElementById("temp-value");
          const humidityValue = document.getElementById("humidity-value");
          const nitrogenValue = document.getElementById("nitrogen-value");
          const phosphorusValue = document.getElementById("phosphorus-value");
          const potassiumValue = document.getElementById("potassium-value");
          const lastUpdateTime = document.getElementById("last-update-time");

          // Update card values if elements exist
          if (tempValue) tempValue.textContent = `${data.temperature}°C`;
          if (humidityValue) humidityValue.textContent = `${data.humidity}%`;
          if (nitrogenValue) nitrogenValue.textContent = `${data.nitrogen} ppm`;
          if (phosphorusValue) phosphorusValue.textContent = `${data.phosphorus} ppm`;
          if (potassiumValue) potassiumValue.textContent = `${data.potassium} ppm`;
          if (lastUpdateTime)
            lastUpdateTime.textContent = data.lastUpdate || new Date().toLocaleString();

          // Remove loading states
          document.querySelectorAll(".card-value").forEach(el => {
            el.setAttribute("data-loading", "false");
          });

          // Update Charts
          updateCharts(data);
        }
        console.log('NPK values:', data.nitrogen, data.phosphorus, data.potassium);
      }, (error) => {
        console.error("Firebase error:", error);
        document.querySelectorAll(".card-value").forEach(el => {
          el.textContent = "Error";
          el.setAttribute("data-loading", "false");
        });
      });
    }
  });

});
