let map, marker;
let selectedLocation = { latitude: 19.076, longitude: 72.8777 }; // Default to Mumbai coordinates
let allStores = [];
let isFetching = false;

document.addEventListener("DOMContentLoaded", function () {
  try {
    initializeMap();
    initializeUIListeners();
    fetchCategories(); // Load categories
    fetchStores(); // Load all published stores initially
    fetchStoresByStatus("open"); // Default to open stores
  } catch (error) {
    console.error("Error initializing app:", error);
  }
});

// Initialize Map
function initializeMap() {
  const mapContainer = document.getElementById("map");
  if (!mapContainer) return;

  map = L.map("map").setView(
    [selectedLocation.latitude, selectedLocation.longitude],
    10
  );

  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  }).addTo(map);

  // Add Static Marker at the center (initial position)
  marker = L.marker([
    selectedLocation.latitude,
    selectedLocation.longitude,
  ]).addTo(map);
}

// Initialize UI Listeners
function initializeUIListeners() {
  const distanceSlider = document.getElementById("distanceSlider");
  if (distanceSlider) {
    distanceSlider.addEventListener("input", function () {
      const distance = this.value;
      updateDistanceLabel(distance);
    });
  }

  const statusSwitch = document.getElementById("statusSwitch");
  if (statusSwitch) {
    statusSwitch.addEventListener("change", function () {
      const openStatus = this.checked ? "open" : "close";
      document.getElementById("statusLabel").textContent =
        openStatus.charAt(0).toUpperCase() + openStatus.slice(1);
      fetchStoresByStatus(openStatus);
    });
  }

  const searchLocation = document.getElementById("searchLocation");
  if (searchLocation) {
    searchLocation.addEventListener("input", applyFilters);
  }

  const categorySelect = document.getElementById("category");
  if (categorySelect) {
    categorySelect.addEventListener("change", function () {
      const selectedCategory = this.value;
      if (selectedCategory) {
        fetchStoresByCategory(selectedCategory);
      } else {
        applyFilters();
      }
    });
  }
}

// Search by Location
function searchByLocation() {
  const location = document.getElementById("searchLocation").value;
  if (!location) return;

  // Use a geocoding service to get the latitude and longitude for the location
  geocodeLocation(location)
    .then((coords) => {
      if (coords) {
        selectedLocation = { latitude: coords.lat, longitude: coords.lng };
        map.setView([coords.lat, coords.lng], 10);
        marker.setLatLng([coords.lat, coords.lng]);
        fetchNearbyStores(
          coords.lat,
          coords.lng,
          document.getElementById("distanceSlider").value
        );
      } else {
        console.error("Geocoding failed for location:", location);
      }
    })
    .catch((error) => {
      console.error("Error during geocoding:", error);
    });
}
document.getElementById("statusSwitch").addEventListener("change", function () {
  const openStatus = this.checked ? "open" : "close";
  const statusLabel = document.getElementById("statusLabel");
  statusLabel.textContent =
    openStatus.charAt(0).toUpperCase() + openStatus.slice(1);
  console.log("Switch toggled, status:", openStatus);
  fetchStoresByStatus(openStatus);
});

function fetchStoresByStatus(openStatus) {
  if (isFetching) return;
  isFetching = true;

  console.log("Fetching stores with status:", openStatus);

  fetch(
    `http://localhost:5175/api/v1/stores/status?openStatus=${openStatus}&shop=quickstart-2770d800.myshopify.com`
  )
    .then((response) => {
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      return response.json();
    })
    .then((data) => {
      console.log(`Stores with status ${openStatus}:`, data);
      if (!data.stores || data.stores.length === 0) {
        console.warn(`No stores found with the specified ${openStatus} status`);
      }
      allStores = data.stores;
      console.log("Updated store list:", allStores);
      populateStoreList(data);
      plotStoresOnMap(data);
    })
    .catch((error) => {
      console.error("Error fetching stores by status:", error);
    })
    .finally(() => {
      isFetching = false;
    });
}
// Geocode Location using a public API
async function geocodeLocation(location) {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${location}`
    );
    const results = await response.json();
    if (results && results.length > 0) {
      return { lat: results[0].lat, lng: results[0].lon };
    } else {
      return null;
    }
  } catch (error) {
    console.error("Error during geocoding:", error);
    return null;
  }
}

// Fetch Stores
function fetchStores() {
  fetch(
    "http://localhost:5175/api/v1/stores/published?shop=quickstart-2770d800.myshopify.com"
  )
    .then((response) => {
      if (!response.ok) throw new Error("Network response was not ok");
      return response.json();
    })
    .then((data) => {
      allStores = data;
      applyFilters();
    })
    .catch((error) => console.error("Error fetching stores:", error));
}

// Fetch Stores Nearby
async function fetchNearbyStores(latitude, longitude, radius) {
  try {
    const response = await fetch(
      `http://localhost:5175/api/v1/stores/nearby?latitude=${latitude}&longitude=${longitude}&radius=${radius}&shop=quickstart-2770d800.myshopify.com`
    );
    if (!response.ok) throw new Error("Network response was not ok");

    const stores = await response.json();
    if (Array.isArray(stores)) {
      allStores = stores;
      populateStoreList(stores);
      plotStoresOnMap(stores);
    } else {
      console.error("Invalid store data:", stores);
    }
  } catch (error) {
    console.error("Error fetching nearby stores:", error);
  }
}

// Fetch Stores by Status (Open/Close)
function fetchStoresByStatus(openStatus) {
  if (isFetching) return;
  isFetching = true;

  fetch(
    `http://localhost:5175/api/v1/stores/status?openStatus=${openStatus}&shop=quickstart-2770d800.myshopify.com`
  )
    .then((response) => {
      if (!response.ok) throw new Error("Network response was not ok");
      return response.json();
    })
    .then((data) => {
      if (Array.isArray(data.stores)) {
        allStores = data.stores;
        populateStoreList(data.stores);
        plotStoresOnMap(data.stores);
      } else {
        console.error("Invalid store data:", data.stores);
      }
    })
    .catch((error) => console.error("Error fetching stores by status:", error))
    .finally(() => {
      isFetching = false;
    });
}

function fetchStores() {
  fetch(
    "http://localhost:5175/api/v1/stores/published?shop=quickstart-2770d800.myshopify.com"
  )
    .then((response) => {
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      return response.json();
    })
    .then((data) => {
      console.log("Fetched Stores:", data);
      allStores = data;
      applyFilters();
    })
    .catch((error) => console.error("Error fetching stores:", error));
}

// Update Distance Label
function updateDistanceLabel(distance) {
  const distanceLabel = document.getElementById("distanceLabel");
  if (distanceLabel) {
    distanceLabel.innerText = `${distance} km`;
    fetchNearbyStores(
      selectedLocation.latitude,
      selectedLocation.longitude,
      distance
    );
  }
}

// Fetch Categories
function fetchCategories() {
  fetch(
    "http://localhost:5175/api/v1/category/getcategory?shop=quickstart-2770d800.myshopify.com"
  )
    .then((response) => {
      if (!response.ok) throw new Error("Network response was not ok");
      return response.json();
    })
    .then((data) => populateCategories(data))
    .catch((error) => console.error("Error fetching categories:", error));
}

// Populate Categories in Dropdown
function populateCategories(categories) {
  const categorySelect = document.getElementById("category");
  if (categorySelect) {
    categorySelect.innerHTML = '<option value="">Select Category</option>';
    categories.forEach((category) => {
      const option = document.createElement("option");
      option.value = category.name;
      option.textContent = category.name;
      categorySelect.appendChild(option);
    });
  }
}

// Fetch Stores by Category
function fetchStoresByCategory(categoryName) {
  if (!categoryName) return;

  fetch(
    `http://localhost:5175/api/v1/stores/category?category=${categoryName}&shop=quickstart-2770d800.myshopify.com`
  )
    .then((response) => {
      if (!response.ok) throw new Error("Network response was not ok");
      return response.json();
    })
    .then((data) => {
      if (Array.isArray(data)) {
        allStores = data;
        populateStoreList(data);
        plotStoresOnMap(data);
      } else {
        console.error("Invalid store data:", data);
      }
    })
    .catch((error) =>
      console.error("Error fetching stores by category:", error)
    );
}

// Plot Stores on Map
function plotStoresOnMap(stores) {
  map.eachLayer((layer) => {
    if (layer instanceof L.Marker && layer !== marker) {
      map.removeLayer(layer);
    }
  });

  stores.forEach((store) => {
    if (store.address?.latitude && store.address?.longitude) {
      L.marker([store.address.latitude, store.address.longitude])
        .addTo(map)
        .bindPopup(
          `<b>${store.name}</b><br>${store.address.street}, ${store.address.city}`
        );
    } else {
      console.warn("Invalid store coordinates:", store);
    }
  });
}

function populateStoreList(data) {
  const storeListContainer = document.getElementById("storeListContainer");
  storeListContainer.innerHTML = "";
  data.forEach((store) => {
    const storeItem = document.createElement("div");
    storeItem.className = "store-item";
    storeItem.innerHTML = `
      <h3>${store.company}</h3>
      <p>${store.address?.street}, ${store.address?.city}</p>
      <p>${store.phone?.number}</p>
    `;
    storeListContainer.appendChild(storeItem);
  });
}

// Populate Store List
// function populateStoreList(stores) {
//   const storeList = document.getElementById("storesContainer");
//   if (storeList) {
//     storeList.innerHTML = ""; // Clear existing list

//     stores.forEach((store) => {
//       const storeCard = document.createElement("div");
//       storeCard.className = "store-card";
//       storeCard.innerHTML = `
//         <h3>${store.name}</h3>
//         <p>${store.address.street}, ${store.address.city}</p>
//         <p>${store.phone.countryCode} ${store.phone.number}</p>
//       `;
//       storeList.appendChild(storeCard);
//     });
//   }
// }

function populateStoreList(stores) {
  const storeList = document.querySelector("#storeList");
  if (!storeList) {
    console.error("Store list container not found.");
    return;
  }

  storeList.innerHTML = "";

  const today = new Date().getDay();

  stores.forEach((store, index) => {
    const todayWorkingHours = store.workingHours.find(
      (hour) => hour.day === getDayName(today)
    );
    let workingHoursText = "Closed Today";

    if (todayWorkingHours && todayWorkingHours.isOpen) {
      workingHoursText = `${todayWorkingHours.start} - ${todayWorkingHours.end}`;
    }

    const storeCard = document.createElement("li");
    storeCard.classList.add("store-card");

    storeCard.innerHTML = `
    <div class="store-card">
      <h2 class="number-shop">Number of Shop ${index + 1}</h2>
      <div class="list-store-main">
        <div class="store-image">
          <img src="https://i.pinimg.com/736x/f0/4b/5c/f04b5cc081eb5ea9e561cd62cac260b0.jpg" alt="Store logo">
        </div>
        <div class="store-deatils">
          <h3>${store.name}</h3>
          <p>${store.address.street}, ${store.address.city}, ${
      store.address.state
    }, ${store.address.postalCode}, ${store.address.country}</p>
          <p>${store.phone.countryCode} ${store.phone.number}</p>
          <p>${store.email}</p>
          <p>Working Hours: ${workingHoursText}</p>
        </div>
      </div>
      <div class="deatis-btn-main">
        <button class="st-list-button st-list-button-active">Print</button>
        <button class="st-list-button">Direction</button>
        <button class="st-list-button" onclick="window.open('${
          store.websiteURL
        }', '_blank')">Website</button>
      </div>
    </div>`;

    storeList.appendChild(storeCard);
  });
}

function getDayName(dayNumber) {
  const days = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];
  return days[dayNumber];
}
// Apply Filters
function applyFilters() {
  const searchText =
    document.getElementById("searchLocation")?.value.toLowerCase() || "";
  const category = document.getElementById("category")?.value || "";
  const openStatus = document.getElementById("statusSwitch")?.checked
    ? "open"
    : "close";

  const filteredStores = allStores.filter((store) => {
    const matchesSearchText =
      store.name.toLowerCase().includes(searchText) ||
      store.address.street.toLowerCase().includes(searchText) ||
      store.address.city.toLowerCase().includes(searchText);

    const matchesCategory =
      !category || store.category?.toLowerCase() === category.toLowerCase();

    const matchesStatus = !openStatus || store.openStatus === openStatus;

    return matchesSearchText && matchesCategory && matchesStatus;
  });

  populateStoreList(filteredStores);
  plotStoresOnMap(filteredStores);
}

// Initialize Everything
document.addEventListener("DOMContentLoaded", function () {
  try {
    initializeMap();
    initializeUIListeners();
    fetchCategories(); // Load categories
    fetchStores(); // Load all published stores initially
    fetchStoresByStatus("open"); // Default to open stores
  } catch (error) {
    console.error("Error initializing app:", error);
  }
// });