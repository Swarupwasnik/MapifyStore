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

  const homeTrophy = "{{ 'home-trophy.png' | asset_url }}";

  let allStores = [];
  let isFetching = false;

  fetchCategories();
  fetchStores();

  function fetchStoresByStatus(openStatus) {
    if (isFetching) return;
    isFetching = true;
    fetch(
      `http://localhost:5175/api/v1/stores/status?shop=quickstart-2770d800.myshopify.com&openStatus=${
        openStatus ? "open" : "closed"
      }`
    )
      .then((response) => {
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        return response.json();
      })
      .then((data) => {
        allStores = data;
        applyFilters();
      })
      .catch((error) =>
        console.error("Error fetching stores by status:", error)
      )
      .finally(() => (isFetching = false));
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
      option.value = category.name; // Use category name instead of ID
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
        applyFilters();
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

  function plotStoresOnMap(stores) {
    // Clear existing markers
    map.eachLayer((layer) => {
      if (layer instanceof L.Marker) {
        map.removeLayer(layer);
      }
    });

    stores.forEach((store) => {
      L.marker([store.address.latitude, store.address.longitude])
        .addTo(map)
        .bindPopup(
          `<b>${store.name}</b><br>${store.address.street}, ${store.address.city}`
        );
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

  L.marker([20.5937, 78.9629])
    .addTo(map)
    .bindPopup("Your location here")
    .openPopup();
});

  