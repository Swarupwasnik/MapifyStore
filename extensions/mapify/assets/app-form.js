document.addEventListener("DOMContentLoaded", function () {
  const mapContainer = document.getElementById("map");

  if (mapContainer._leaflet_id) {
    mapContainer._leaflet_id = null;
  }

  const map = L.map("map").setView([20.5937, 78.9629], 5);

  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  }).addTo(map);

  let allStores = [];
  let isFetching = false;

  fetchCategories();
  fetchStores();

  document
    .getElementById("distanceSlider")
    .addEventListener("input", function () {
      const distance = this.value;
      updateDistanceLabel(distance);
    });

  function updateDistanceLabel(distance) {
    const distanceLabel = document.getElementById("distanceLabel");
    if (distanceLabel) {
      distanceLabel.innerText = `${distance} km`;
      fetchNearbyStores(19.076, 72.8777, distance);
    }
  }

  function fetchNearbyStores(latitude, longitude, radius) {
    fetch(
      `http://localhost:5175/api/v1/stores/nearby?latitude=${latitude}&longitude=${longitude}&radius=${radius}&shop=quickstart-2770d800.myshopify.com`
    )
      .then((response) => {
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        return response.json();
      })
      .then((data) => {
        console.log(`Fetched Nearby Stores within ${radius} km:`, data);
        populateStoreList(data);
        plotStoresOnMap(data);
      })
      .catch((error) => console.error("Error fetching nearby stores:", error));
  }

  function populateStoreList(data) {
    const storeList = document.querySelector("#storeList");
    if (!storeList) {
      console.error("Store list container not found.");
      return;
    }

    storeList.innerHTML = "";

    const today = new Date().getDay();

    data.forEach((store, index) => {
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
            <h2>${store.company}</h2>
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
            <button class="st-list-button st-list-button-active">Direction</button>
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

  document
    .getElementById("statusSwitch")
    .addEventListener("change", function () {
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
        console.log("Full response data:", data); // Log the entire response

        // More robust data access
        let stores = Array.isArray(data)
          ? data
          : data.stores
          ? data.stores
          : data.data
          ? data.data
          : [];

        console.log(`Stores with status ${openStatus}:`, stores);

        if (stores.length === 0) {
          console.warn(`No stores found for status: ${openStatus}`);
          const storeList = document.querySelector("#storeList");
          if (storeList) {
            storeList.innerHTML = "<li>No stores found</li>";
          }
          return;
        }

        allStores = stores;
        populateStoreList(allStores);
        plotStoresOnMap(allStores);
      })
      .catch((error) => {
        console.error("Error fetching stores by status:", error);

        // Clear the store list on error
        const storeList = document.querySelector("#storeList");
        if (storeList) {
          storeList.innerHTML = "<li>Error loading stores</li>";
        }
      })
      .finally(() => {
        isFetching = false;
      });
  }

  function plotStoresOnMap(stores) {
    // Clear existing markers
    map.eachLayer((layer) => {
      if (layer instanceof L.Marker) {
        map.removeLayer(layer);
      }
    });

    // Plot new markers
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

  function fetchCategories() {
    fetch(
      "http://localhost:5175/api/v1/category/getcategory?shop=quickstart-2770d800.myshopify.com"
    )
      .then((response) => {
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        return response.json();
      })
      .then((data) => {
        console.log("Categories:", data);
        populateCategories(data);
      })
      .catch((error) => console.error("Error fetching categories:", error));
  }

  function populateCategories(data) {
    const categorySelect = document.getElementById("category");
    if (!categorySelect) {
      console.error("Category select element not found.");
      return;
    }

    categorySelect.innerHTML = '<option value="">Select Category</option>';
    data.forEach((category) => {
      const option = document.createElement("option");
      option.value = category.name;
      option.textContent = category.name;
      categorySelect.appendChild(option);
    });

    categorySelect.addEventListener("change", () => {
      const selectedCategory = categorySelect.value;
      console.log(`Selected Category Name: ${selectedCategory}`);
      if (selectedCategory) {
        fetchStoresByCategory(selectedCategory);
      } else {
        applyFilters();
      }
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
        applyFilters(); // Populate stores on initial fetch
      })
      .catch((error) => console.error("Error fetching stores:", error));
  }

  function fetchStoresByCategory(categoryName) {
    console.log(`Fetching stores for category name: ${categoryName}`);
    if (!categoryName) {
      console.error(
        "Category name is undefined. Cannot fetch stores for undefined category."
      );
      return;
    }
    fetch(
      `http://localhost:5175/api/v1/stores/category?shop=quickstart-2770d800.myshopify.com&category=${categoryName}`
    )
      .then((response) => {
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        return response.json();
      })
      .then((data) => {
        console.log(`Fetched Stores for Category ${categoryName}:`, data);
        populateStoreList(data);
        plotStoresOnMap(data);
      })
      .catch((error) =>
        console.error("Error fetching stores by category:", error)
      );
  }

  function applyFilters() {
    const searchInput = document.getElementById("searchLocation");
    const categorySelect = document.getElementById("category");

    if (!searchInput || !categorySelect) {
      console.error("Search input or category select element not found.");
      return;
    }

    const searchText = searchInput.value.toLowerCase();
    const selectedCategory = categorySelect.value;

    let filteredStores = allStores;

    if (selectedCategory) {
      fetchStoresByCategory(selectedCategory);
    } else {
      filteredStores = allStores.filter((store) => {
        return (
          store.name.toLowerCase().includes(searchText) ||
          store.address.street.toLowerCase().includes(searchText) ||
          store.address.city.toLowerCase().includes(searchText) ||
          store.address.state.toLowerCase().includes(searchText)
        );
      });

      populateStoreList(filteredStores);
      plotStoresOnMap(filteredStores);
    }
  }

  const searchInput = document.getElementById("searchLocation");
  if (searchInput) {
    searchInput.addEventListener("input", applyFilters);
  }

  fetchStoresByStatus("open");

  L.marker([20.5937, 78.9629])
    .addTo(map)
    .bindPopup("Your location here")
    .openPopup();
});
