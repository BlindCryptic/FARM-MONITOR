// Device Management System
let devices = [];
let analyticsChart = null;

// ======================
// PAGE LOADING FUNCTIONS
// ======================

function hideAllPages() {
    // Hide all page-content divs
    document.querySelectorAll('.main-content > .page-content').forEach(page => {
        page.classList.remove('active'); // Use class to control visibility
    });
}

function loadOverviewPage() {
    hideAllPages();
    console.log("Loading Overview Page");
    
    // Show overview page - use the existing one from HTML
    const overviewPage = document.getElementById('overview-page');
     if (overviewPage) {
        overviewPage.classList.add('active'); // Add active class to show
    }
}

function loadDevicesPage() {
    hideAllPages();
    console.log("Loading Devices Page");
    
    // Create or show devices page
    let devicesPage = document.getElementById('devices-page');
    if (devicesPage) {
        devicesPage.classList.add('active'); // Add active class to show
        loadDevicesFromFirebase();
        setupDeviceModal();
        setupFormHandler();
    }
}

function loadAnalyticsPage() {
    hideAllPages();
    console.log("Loading Analytics Page");
    
    const analyticsPage = document.getElementById('analytics-page');
    if (analyticsPage) {
        analyticsPage.classList.add('active');
      initializeAnalyticsChart(); 
        setupAnalyticsFilters();    
        loadAnalyticsData();        
    }
}
// Add these new functions to sideFunc.js

function initializeAnalyticsChart() {
    const ctx = document.getElementById('analyticsChart').getContext('2d');
    if (analyticsChart) analyticsChart.destroy();

    analyticsChart = new Chart(ctx, {
        type: 'line',
        data: { labels: [], datasets: [] },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: { beginAtZero: true },
                x: {
                    type: 'time',
                    time: {
                        parser: 'yyyy-MM-dd\'T\'HH:mm:ss.SSSXXX', // ISO format
                        tooltipFormat: 'MMM dd, yyyy - HH:mm',
                        unit: 'hour'
                    },
                    adapters: {
                        date: { locale: 'en-US' }
                    }
                }
            }
        }
    });
}

function processAnalyticsData(rawData, cutoff) {
    const dataByType = {
        temperature: [],
        humidity: [],
        nitrogen: [],
        phosphorus: [],
        potassium: []
    };

    for (const timestampKey in rawData) {
        const entry = rawData[timestampKey];
        const entryDate = luxon.DateTime.fromISO(timestampKey).toJSDate();

        if (entryDate.getTime() > cutoff) {
            if (entry?.temperature) dataByType.temperature.push({ x: entryDate, y: entry.temperature });
            if (entry?.humidity) dataByType.humidity.push({ x: entryDate, y: entry.humidity });
            if (entry?.nitrogen) dataByType.nitrogen.push({ x: entryDate, y: entry.nitrogen });
            if (entry?.phosphorus) dataByType.phosphorus.push({ x: entryDate, y: entry.phosphorus });
            if (entry?.potassium) dataByType.potassium.push({ x: entryDate, y: entry.potassium });
        }
    }
    return dataByType;
}

async function loadAnalyticsData() {
    const loadingElement = document.getElementById('analytics-loading');
    try {
        loadingElement.style.display = 'block';
        
        // Fetch data from Firebase
        const snapshot = await database.ref('sensorData').once('value');
        const rawData = snapshot.val();
        
        if (!rawData) throw new Error('No sensor data available');

         const selectedPeriod = document.querySelector('.time-filter button.active')?.dataset.period || '1day';
        const now = Date.now();
        const cutoff = {
            '1day': now - 86400000,
            '1week': now - 604800000,
            '1month': now - 2592000000
        }[selectedPeriod];

        
         const processedData = processAnalyticsData(rawData, cutoff);
        updateChartData(processedData);

    } catch (error) {
        console.error('Error loading analytics data:', error);
        loadingElement.textContent = 'Error: ' + error.message;
    } finally {
        loadingElement.style.display = 'none';
    }
}

function processAnalyticsData(rawData, cutoff) {
    const dataByType = {
        temperature: [],
        humidity: [],
        nitrogen: [],
        phosphorus: [],
        potassium: []
    };

    for (const timestamp in rawData) {
        const entry = rawData[timestamp];
         const date = new Date(timestamp);
        
        // Use ACTUAL field names from your database
        if (date.getTime() > cutoff) {
            if (entry?.temperature) dataByType.temperature.push({ x: date, y: entry.temperature });
            if (entry?.humidity) dataByType.humidity.push({ x: date, y: entry.humidity });
            if (entry?.nitrogen) dataByType.nitrogen.push({ x: date, y: entry.nitrogen });
            if (entry?.phosphorus) dataByType.phosphorus.push({ x: date, y: entry.phosphorus });
            if (entry?.potassium) dataByType.potassium.push({ x: date, y: entry.potassium });
        }
    }
    return dataByType;
}

function updateChartData(processedData) {
    const datasets = [];
    const colors = {
        temperature: '#ff6384', humidity: '#36a2eb',
        nitrogen: '#4bc0c0', phosphorus: '#ffcd56', potassium: '#9966ff'
    };

    // Create datasets based on active filters
    document.querySelectorAll('.data-type-filter input[type="checkbox"]').forEach(checkbox => {
        if (checkbox.checked) {
            const type = checkbox.dataset.type;
            datasets.push({
                label: type.charAt(0).toUpperCase() + type.slice(1),
                data: processedData[type],
                borderColor: colors[type],
                fill: false
            });
        }
    });

    analyticsChart.data.datasets = datasets;
    analyticsChart.update();
}

function setupAnalyticsFilters() {
    // Time filter buttons
    document.querySelectorAll('.time-filter button').forEach(button => {
        button.addEventListener('click', function() {
            document.querySelectorAll('.time-filter button').forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            loadAnalyticsData();
        });
    });

    // Data type checkboxes
    document.querySelectorAll('.data-type-filter input[type="checkbox"]').forEach(checkbox => {
        checkbox.addEventListener('change', () => analyticsChart && loadAnalyticsData());
        });
}

function loadAlertsPage() {
    hideAllPages();
    console.log("Loading Alerts Page");
    
    const alertsPage = document.getElementById('alerts-page');
    if (alertsPage) {
        alertsPage.classList.add('active'); // Add active class to show
        displayAlerts();
    }
}

function loadSettingsPage() {
    hideAllPages();
    console.log("Loading Settings Page");
    
    const settingsPage = document.getElementById('settings-section');
    if (settingsPage) {
        settingsPage.classList.add('active'); // Add active class to show
    }
}

function loadAboutPage() {
    hideAllPages();
    console.log("Loading About Us Page");
    
    const aboutPage = document.getElementById('about-section');
    if (aboutPage) {
        aboutPage.classList.add('active'); // Add active class to show
    }
}

// ======================
// DEVICE MANAGEMENT
// ======================

function loadDevicesFromFirebase() {
    database.ref('devices').on('value', (snapshot) => {
        devices = [];
        const tableContainer = document.querySelector('#devices-page .table-container');
        tableContainer.innerHTML = `
            <div class="table-controls">
                <div class="search-box">
                    <i class="fas fa-search"></i>
                    <input type="text" id="device-search" placeholder="Search devices...">
                </div>
                <button id="refresh-devices" class="action-button">
                    <i class="fas fa-sync-alt"></i> Refresh
                </button>
            </div>
            <table id="devices-table">
                <thead>
                    <tr>
                        <th>Status</th>
                        <th>Device Name</th>
                        <th>Device ID</th>
                        <th>Location</th>
                        <th>Actions</th> <!-- New Actions Column -->  
                    </tr>
                </thead>
                <tbody id="devices-table-body"></tbody>
            </table>
        `;

        snapshot.forEach((childSnapshot) => {
            const device = childSnapshot.val();
            device.id = childSnapshot.key;
            devices.push(device);
            renderDeviceRow(device);
        });

        setupSearch();
        setupRefreshButton();
    });
}

// Function to setup search functionality
function setupSearch() {
  const searchInput = document.getElementById('device-search');
  const tableBody = document.getElementById('devices-table-body');

  if (!searchInput) return;

  searchInput.addEventListener('input', function () {
    const searchValue = this.value.toLowerCase();
    const rows = tableBody.getElementsByTagName('tr');

    Array.from(rows).forEach(row => {
      const cellsText = row.innerText.toLowerCase();
      row.style.display = cellsText.includes(searchValue) ? '' : 'none';
        });
    });
}

function setupRefreshButton() {
    const refreshBtn = document.getElementById('refresh-devices');
    if (refreshBtn) {
        refreshBtn.addEventListener('click', () => {
            loadDevicesFromFirebase();
        });
    }
}

// ======================
// FORM HANDLING
// ======================

function setupFormHandler() {
    const form = document.getElementById('device-registration-form');
    if (!form) return;

    form.addEventListener('submit', (e) => {
        e.preventDefault();

        const name = document.getElementById('device-name').value;
        const id = document.getElementById('device-id').value;
        const location = document.getElementById('device-location').value;
        const mode = form.dataset.mode;

        if (mode === 'edit') {
            // Update existing device
            database.ref(`devices/${id}`).update({
                name: name,
                location: location
            }).then(() => {
                showNotification('Device updated successfully!', 'success');
                document.getElementById('add-device-modal').style.display = 'none'; // Close the modal 
                loadDevicesFromFirebase(); // Refresh the device list
            }).catch(showError);
        } else {
            // Add new device
            database.ref(`devices/${id}`).set({
                name: name,
                id: id,
                location: location,
                isConnected: false
            }).then(() => {
                showNotification('Device added successfully!', 'success');
               document.getElementById('add-device-modal').style.display = 'none'; // Close the modal
                loadDevicesFromFirebase(); // Refresh the device list
            }).catch(showError);
        }
    });
}

// ======================
// ALERTS MANAGEMENT
// ======================

function displayAlerts() {
    const alertsList = document.getElementById('alerts-list');
    alertsList.innerHTML = ''; // Clear existing alerts

    // Fetch alerts from Firebase or any other source
    database.ref('alerts').on('value', (snapshot) => {
        snapshot.forEach((childSnapshot) => {
            const alert = childSnapshot.val();
            const listItem = document.createElement('li');
            listItem.classList.add('alert-item'); // Add a class for styling

            // Create a timestamp element
            const timestamp = new Date(alert.timestamp).toLocaleString(); // Format timestamp
            listItem.innerHTML = `
                <div class="alert-message">${alert.message}</div>
                <div class="alert-timestamp">${timestamp}</div>
            `;
            alertsList.appendChild(listItem);
        });
    });
}

// ======================
// MODAL AND FORM HANDLING
// ======================

function setupDeviceModal() {
    const modal = document.getElementById('add-device-modal');
    if (!modal) return;

    const closeBtn = modal.querySelector('.close-modal');
    const addBtn = document.getElementById('add-device-btn');
    
    addBtn.addEventListener('click', () => {
        document.getElementById('device-registration-form').reset();
        document.getElementById('device-registration-form').dataset.mode = '';
        modal.style.display = 'block';
    });
    
    closeBtn.addEventListener('click', () => {
        modal.style.display = 'none';
    });
    
    window.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.style.display = 'none';
        }
    });
}

// ======================
// DEVICE CRUD OPERATIONS
// ======================
// Render Device Row Function
function renderDeviceRow(device) {
    const tableBody = document.getElementById('devices-table-body');
    const row = document.createElement('tr');

    row.innerHTML = `
        <td>${device.isConnected ? 'Connected' : 'Disconnected'}</td> 
        <td>${device.name}</td>
        <td>${device.id}</td>
        <td>${device.location}</td>
        <td>
            <button class="edit-button" onclick="editDevice('${device.id}')">Edit</button>
            <button class="delete-button" onclick="deleteDevice('${device.id}')">Delete</button>
        </td>
    `;

    tableBody.appendChild(row);
}

function editDevice(deviceId) {
    const device = devices.find(d => d.id === deviceId); // Find the device by ID
    if (!device) return;

    const modal = document.getElementById('add-device-modal');
    if (!modal) return;

    modal.style.display = 'block'; // Show the modal
    
    // Populate the modal fields with the device data
    document.getElementById('device-name').value = device.name || '';
    document.getElementById('device-id').value = device.id;
    document.getElementById('device-location').value = device.location || '';
    
    const form = document.getElementById('device-registration-form');
    form.dataset.mode = 'edit'; // Set mode to edit
    form.querySelector('button').textContent = 'Update Device'; // Change button text
}

function deleteDevice(deviceId) {
    if (confirm('Are you sure you want to delete this device?')) {
        database.ref(`devices/${deviceId}`).remove()
            .then(() => {
                showNotification('Device deleted successfully', 'success');
                loadDevicesFromFirebase(); // Refresh the device list
            })
            .catch(showError);
    }
}

// ======================
// NAVIGATION SETUP
// ======================

function setupNavigation() {
    document.querySelectorAll('.sidebar-menu li').forEach(item => {
        item.addEventListener('click', function () {
            document.querySelectorAll('.sidebar-menu li').forEach(li => {
                li.classList.remove('active');
            });
            
            this.classList.add('active');
            
            const page = this.getAttribute('data-page');
            
            switch (page) {
                case 'overview':
                    loadOverviewPage();
                    break;
                case 'devices':
                    loadDevicesPage();
                    break;
                case 'analytics':
                    loadAnalyticsPage();
                    break;
                case 'alerts': 
                    loadAlertsPage();
                    break;
                case 'settings':
                    loadSettingsPage();
                    break;
                case 'about':
                    loadAboutPage();
                    break;
                                default:
                    loadOverviewPage();
            }
        });
    });
}

// Initialize when dashboard loads
document.addEventListener('DOMContentLoaded', function () {
    if (!document.getElementById('dashboard')) return;

    // First make sure dashboard is visible
    document.getElementById('dashboard').style.display = 'flex';
    
    setupNavigation();
    
    const overviewItem = document.querySelector('.sidebar-menu li[data-page="overview"]');
    if (overviewItem) overviewItem.classList.add('active');
    
    loadOverviewPage(); // Load the default page
});
