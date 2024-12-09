document.addEventListener("DOMContentLoaded", function () {
    const mapContainer = document.getElementById("map");
  
    if (mapContainer._leaflet_id) {
      mapContainer._leaflet_id = null;
    }
    const originalPosition = [23.0225, 72.5714];
    const originalZoom = 5;
    // const map = L.map("map").setView([23.0225, 72.5714], 5);
    const map = L.map("map").setView(originalPosition, originalZoom);
  
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(map);
  
    document
      .getElementById("resetZoomButton")
      .addEventListener("click", function () {
        map.setView(originalPosition, originalZoom);
      });
  
    let allStores = [];
    let isFetching = false;
    let locationMarkers = [];
    let routingControl = null;
    let currentStores = [];
    let previousOpenStores = [];
    let previousClosedStores = [];
    let filteredStores = [];
  
    let isStatusOpen = true; //
  
    fetchCategories();
    // fetchStores();
    fetchStoresByStatus("open");
  
    document
      .getElementById("distanceSlider")
      .addEventListener("input", function () {
        const distance = this.value;
        updateDistanceLabel(distance);
      });
  
    function updateDistanceLabel(distance) {
      const distanceLabel = document.getElementById("distanceLabel");
      const distanceSlider = document.getElementById("distanceSlider");
  
      if (distanceLabel) {
        const lowerBound = distance;
        const upperBound = Math.min(Number(distance) + 10, 1000);
        distanceLabel.innerText = `${lowerBound} km - ${upperBound} km`;
  
        if (Number(distance) >= 20 && Number(distance) < 30) {
          distanceSlider.value = 20;
          distanceLabel.innerText = "20-30 km";
  
          if (previousOpenStores.length === 0) {
            fetchStoresByStatus("open").then((openStores) => {
              previousOpenStores = openStores;
              plotStoresOnMap(openStores);
            });
          } else {
            plotStoresOnMap(previousOpenStores);
          }
        } else {
          fetchNearbyStores(19.076, 72.8777, distance);
        }
      }
    }
    // old slider code
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
          // Extensive logging to understand the data structure
          console.log("Raw data:", data);
          console.log("Data type:", typeof data);
          console.log("Data keys:", Object.keys(data));
  
          // More robust data extraction
          let stores = [];
  
          // Try multiple ways to extract stores
          if (Array.isArray(data)) {
            stores = data;
          } else if (data.stores && Array.isArray(data.stores)) {
            stores = data.stores;
          } else if (data.data && Array.isArray(data.data)) {
            stores = data.data;
          } else if (data.results && Array.isArray(data.results)) {
            stores = data.results;
          } else {
            console.warn("No stores found in the response");
            // Clear existing store list
            const storeList = document.getElementById("storeList");
            if (storeList) {
              storeList.innerHTML = "<li>No stores found</li>";
            }
            return;
          }
  
          console.log("Processed stores:", stores);
          console.log("Number of stores:", stores.length);
  
          if (stores.length === 0) {
            console.warn("No stores found in the nearby search");
            const storeList = document.getElementById("storeList");
            if (storeList) {
              storeList.innerHTML = "<li>No stores found</li>";
            }
            return;
          }
  
          // Ensure stores have required properties
          const validStores = stores.filter(
            (store) =>
              store.address && store.address.latitude && store.address.longitude
          );
          const storeCountElement = document.getElementById("storeCount");
          storeCountElement.textContent = validStores.length;
          console.log("Valid stores:", validStores);
  
          populateStoreList(validStores);
          plotStoresOnMap(validStores);
        })
        .catch((error) => {
          console.error("Error fetching nearby stores:", error);
  
          // Clear existing store list
          document.getElementById("storeCount").textContent = "0";
  
          const storeList = document.getElementById("storeList");
          plotStoresOnMap([]);
          // plotStoresOnMap(storeList)
  
          // if (storeList) {
          //   storeList.innerHTML = "<li>Error loading stores</li>";
          // }
        });
    }
    //  old Slider code
    function populateStoreList(data) {
      const storeList = document.querySelector("#storeList");
      const storeCountElement = document.querySelector("#storeCount");
      const printButton = document.querySelector("#printButton");
      if (!storeList) {
        console.error("Store list container not found.");
        return;
      }
  
      storeList.innerHTML = "";
      if (data.length === 0) {
        storeCountElement.textContent = "0"; // Show 0 when no stores found
        storeList.innerHTML = "<li>No stores found matching your search</li>";
        return;
      }
      storeCountElement.textContent = data.length;
      // storeCountElement.textContent = data.length || 0;
      // if (data.length === 0) {
      //   storeList.innerHTML = "<li>No stores found matching your search</li>";
      //   return;
      // }
  
      const today = new Date().getDay();
  
      data.forEach((store, index) => {
        const categoryName = store.category?.name || "Uncategorized";
  
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
                <p> 📍 ${store.address.street}, ${store.address.city}, ${
          store.address.state
        }, ${store.address.postalCode}, ${store.address.country}</p>
                <p> 📞 ${store.phone.countryCode} ${store.phone.number}</p>
                <p>  ✉️ ${store.email}</p>
                <div class="map-popup-box-info"> 🏷️ Category: ${categoryName} </div>
                <p>Working Hours:⏳Mon-Sun <br/> ${workingHoursText}</p>
              </div>
            </div>
            <div class="deatis-btn-main">
              <button class="st-list-button st-list-button-active">Direction</button>
              <button class="st-list-button" onclick="window.open('${
                store.websiteURL
              }', '_blank')">Website</button>
            </div>
          </div>`;
  
        // Add click event to center map and show marker
        storeCard.addEventListener("click", () => {
          if (store.address?.latitude && store.address?.longitude) {
            const marker = L.marker([
              store.address.latitude,
              store.address.longitude,
            ])
              .addTo(map)
              .bindPopup(
                `<div class="map-popup-box">
                  <div class="map-box-icon"> 
                    <img src="https://i.pinimg.com/736x/f0/4b/5c/f04b5cc081eb5ea9e561cd62cac260b0.jpg" alt="Icon">
                  </div>
                  <div class="map-popup-box-content">
                    <div class="map-popup-box-title">${store.company}</div>
                    <div class="map-popup-box-info">
                      📍 ${store.address.street}, ${store.address.city}, ${store.address.state},${store.address.country},${store.address.postalCode}
                    </div>
                    <div class="map-popup-box-info">
                      📞 ${store.phone.countryCode}, ${store.phone.number}
                    </div>
                    <div class="map-popup-box-info">
                      ✉️ ${store.email}
                    </div>
                    <div class="map-popup-box-info">
                      🏷️ Category: ${categoryName}
                    </div>
                    <p>Working Hours:⏳Mon-Sun <br/> ${workingHoursText}</p>
                  </div>
                  <div class="map-popup-box-info-buttons">
                    <button onclick="window.open('${store.websiteURL}', '_blank')">Website</button>
                    <button class="zoom-button" data-lat="${store.address.latitude}" data-lng="${store.address.longitude}">
                      Zoom
                    </button>
                  </div>
                </div>`
              )
              .openPopup();
  
            map.setView([store.address.latitude, store.address.longitude], 14); // Center the map on the store
  
            // Add event listener for zoom button inside the popup
            const popup = marker.getPopup().getElement();
            const zoomButton = popup.querySelector(".zoom-button");
  
            if (zoomButton) {
              zoomButton.addEventListener("click", (e) => {
                e.stopPropagation(); // Prevent closing the popup
                const lat = parseFloat(zoomButton.dataset.lat);
                const lng = parseFloat(zoomButton.dataset.lng);
  
                // Check if coordinates are valid
                if (!isNaN(lat) && !isNaN(lng)) {
                  // Perform smooth zoom-in effect and keep the popup open
                  map.flyTo([lat, lng], 16, { animate: true, duration: 1.5 });
                  setTimeout(() => {
                    marker.openPopup();
                  }, 1500);
                } else {
                  console.error("Invalid coordinates for zoom.");
                }
              });
            }
          } else {
            console.warn("Invalid store coordinates for:", store);
          }
        });
  
        printButton.addEventListener("click", () => {
          const printContent = document.querySelector(".store-list").innerHTML;
          const printWindow = window.open("", "", "width=800,height=600");
          printWindow.document.write(`
            <html>
            <head>
              <title>Store List</title>
              <style>
                body { font-family: Arial, sans-serif; }
                .store-card { margin-bottom: 20px; border-bottom: 1px solid #ccc; padding-bottom: 10px; }
              </style>
            </head>
            <body>
              <h1>Store List</h1>
              ${printContent}
            </body>
            </html>
          `);
          printWindow.document.close();
          printWindow.print();
        });
  
        storeList.appendChild(storeCard);
      });
  
      // newlyadded
  
      const directionButtons = document.querySelectorAll(
        ".st-list-button-active"
      );
      directionButtons.forEach((button, index) => {
        button.addEventListener("click", () => {
          const store = data[index];
          openDirectionModal(store);
        });
      });
  
      document.querySelector(".close-button").addEventListener("click", () => {
        document.getElementById("directionModal").style.display = "none";
      });
  
      // newlyadded
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
  
        // added
        // resetFields();
        // added
        fetchStoresByStatus(openStatus);
      });
    // Added new
  
    // Added New
  
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
          console.log("Full response data:", data);
  
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
            document.getElementById("storeCount").textContent = "0";
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
            storeList.innerHTML = "<li>No stores are currently open</li>";
          }
          document.getElementById("storeCount").textContent = "0";
          plotStoresOnMap([]);
        })
        .finally(() => {
          isFetching = false;
        });
    }
  
    function plotStoresOnMap(stores) {
      map.eachLayer((layer) => {
        if (layer instanceof L.Marker) {
          map.removeLayer(layer);
        }
      });
  
      const todayName = new Date().toLocaleString("en-us", { weekday: "long" });
  
      // Plot new markers
      stores.forEach((store) => {
        if (store.address?.latitude && store.address?.longitude) {
          const categoryName = store.category?.name || "Uncategorized"; // Safely access category name
  
          // Find today's working hours
          let workingHoursText = "Today Closed";
          const todayWorkingHours = store.workingHours.find(
            (hour) => hour.day === todayName
          );
  
          if (todayWorkingHours && todayWorkingHours.isOpen) {
            workingHoursText = `${todayWorkingHours.start} - ${todayWorkingHours.end}`;
          } else if (todayWorkingHours) {
            workingHoursText = "Today Closed";
          }
  
          // Create and bind marker popup
          const marker = L.marker([
            store.address.latitude,
            store.address.longitude,
          ]).addTo(map);
  
          // Define popup content
          const popupContent = `
            <div class="map-popup-box">
              <div class="map-box-icon">
                <img src="https://i.pinimg.com/736x/f0/4b/5c/f04b5cc081eb5ea9e561cd62cac260b0.jpg" alt="Icon">
              </div>
              <div class="map-popup-box-content">
                <div class="map-popup-box-title">${store.company}</div>
                <div class="map-popup-box-info">
                  📍 ${store.address.street}, ${store.address.city}, ${store.address.state}, ${store.address.country}, ${store.address.postalCode}
                </div>
                <div class="map-popup-box-info">
                  📞 ${store.phone.countryCode} ${store.phone.number}
                </div>
                <div class="map-popup-box-info">
                  ✉️ ${store.email}
                </div>
                <div class="map-popup-box-info">
                  🏷️ Category: ${categoryName}
                </div>
                <div class="map-popup-box-info">
                  ⏳ Today: ${workingHoursText}
                </div>
              </div>
              <div class="map-popup-box-info-buttons">
                <button onclick="window.open('${store.websiteURL}', '_blank')">Website</button>
                <button class="zoom-button" data-lat="${store.address.latitude}" data-lng="${store.address.longitude}">
                  Zoom
                </button>
              </div>
            </div>
          `;
  
          // Bind popup to marker
          marker.bindPopup(popupContent).on("popupopen", () => {
            // Add event listener for the zoom button inside the popup
            const popup = marker.getPopup().getElement();
            const zoomButton = popup.querySelector(".zoom-button");
  
            if (zoomButton) {
              zoomButton.addEventListener("click", (event) => {
                event.stopPropagation(); // Prevent closing the popup
                const lat = parseFloat(zoomButton.dataset.lat);
                const lng = parseFloat(zoomButton.dataset.lng);
  
                // Check if coordinates are valid
                if (!isNaN(lat) && !isNaN(lng)) {
                  map.flyTo([lat, lng], 16, {
                    animate: true,
                    duration: 1.5,
                  });
                  marker.openPopup(); // Re-open the popup at the new zoom level
                } else {
                  console.error("Invalid coordinates for zoom.");
                }
              });
            }
          });
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
  
    //CategoryStatusCode
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
        const statusSwitch = document.getElementById("statusSwitch");
        const openStatus = statusSwitch.checked ? "open" : "close";
  
        console.log(
          `Selected Category: ${selectedCategory}, Status: ${openStatus}`
        );
  
        if (selectedCategory) {
          // If a category is selected, fetch stores by category and status
          fetchStoresByCategoryAndStatus(selectedCategory, openStatus);
        } else {
          // If no category is selected, fetch all open stores
          fetchStoresByStatus("open");
        }
      });
    }
    function fetchStoresByCategoryAndStatus(categoryName, openStatus) {
      console.log(
        `Fetching stores for category: ${categoryName}, Status: ${openStatus}`
      );
  
      fetch(
        `http://localhost:5175/api/v1/stores/category-status?categoryName=${categoryName}&openStatus=${openStatus}`
      )
        .then((response) => {
          if (!response.ok) {
            throw new Error("Network response was not ok");
          }
          return response.json();
        })
        .then((data) => {
          console.log(
            `Fetched Stores for Category ${categoryName} with Status ${openStatus}:`,
            data
          );
  
          if (data.length === 0) {
            const storeList = document.querySelector("#storeList");
            const storeCountElement = document.querySelector("#storeCount");
  
            storeList.innerHTML = "<li>No stores found matching the search</li>";
            storeCountElement.textContent = "0";
            plotStoresOnMap([]);
          } else {
            populateStoreList(data);
            plotStoresOnMap(data);
          }
        })
        .catch((error) => {
          console.error("Error fetching stores by category and status:", error);
  
          const storeList = document.querySelector("#storeList");
          const storeCountElement = document.querySelector("#storeCount");
  
          storeList.innerHTML = "<li>Error loading stores</li>";
          storeCountElement.textContent = "0";
          plotStoresOnMap([]);
        });
    }
  
    document
      .getElementById("statusSwitch")
      .addEventListener("change", function () {
        const openStatus = this.checked ? "open" : "close";
        const statusLabel = document.getElementById("statusLabel");
        statusLabel.textContent =
          openStatus.charAt(0).toUpperCase() + openStatus.slice(1);
  
        const categorySelect = document.getElementById("category");
        const selectedCategory = categorySelect.value;
  
        if (selectedCategory) {
          // If a category is selected, fetch stores by category and status
          fetchStoresByCategoryAndStatus(selectedCategory, openStatus);
        } else {
          // If no category is selected, fetch stores by status
          fetchStoresByStatus(openStatus);
        }
      });
    // categoryStatusCode
  
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
    // newly added
  
    function applyFilters() {
      const searchInput = document.getElementById("searchLocation");
      const categorySelect = document.getElementById("category");
  
      if (!searchInput || !categorySelect) {
        console.error("Search input or category select element not found.");
        return;
      }
  
      const searchText = searchInput.value.trim().toLowerCase(); // Convert to lowercase
      const selectedCategory = categorySelect.value;
  
      if (!searchText && !selectedCategory) {
        currentStores = allStores;
        populateStoreList(allStores);
        plotStoresOnMap(allStores);
        return;
      }
      // newlyCategory
      if (selectedCategory === "selectCategory") {
        fetchStoresByStatus(searchText);
        return;
      }
  
      //NewCategory
      if (selectedCategory) {
        fetchStoresByCategory(selectedCategory, searchText);
        return;
      }
  
      if (searchText) {
        performGlobalSearch(searchText);
      }
    }
  
    function fetchStoresByCategory(category, searchText = "") {
      // Show loading indicator
      const storeList = document.getElementById("storeList");
      const storeCountElement = document.getElementById("storeCount");
      // new
      const distanceSlider = document.getElementById("distanceSlider");
      const radius = distanceSlider ? distanceSlider.value : 20;
      // new
  
      if (storeList) {
        storeList.innerHTML = "<li>Searching stores...</li>";
      }
  
      fetch(
        `http://localhost:5175/api/v1/stores/category?category=${encodeURIComponent(
          category
        )}&shop=quickstart-2770d800.myshopify.com`
      )
        .then((response) => {
          if (!response.ok) {
            throw new Error("Network response was not ok");
          }
          return response.json();
        })
        .then((data) => {
          // Robust data extraction
          let stores = [];
          if (Array.isArray(data)) {
            stores = data;
          } else if (data.stores && Array.isArray(data.stores)) {
            stores = data.stores;
          } else if (data.data && Array.isArray(data.data)) {
            stores = data.data;
          } else {
            console.warn("No stores found for the category");
            if (storeList) {
              storeList.innerHTML = "<li>No stores found in this category</li>";
            }
            plotStoresOnMap([]); // Clear map
            return;
          }
  
          // Validate stores
          let filteredStores = stores.filter(
            (store) =>
              store.address && store.address.latitude && store.address.longitude
          );
  
          // Apply additional search text filter if provided
          if (searchText) {
            const searchTextLower = searchText.toLowerCase();
            filteredStores = filteredStores.filter((store) => {
              return (
                (store.name &&
                  store.name.toLowerCase().includes(searchTextLower)) ||
                (store.address.street &&
                  store.address.street.toLowerCase().includes(searchTextLower)) ||
                (store.address.city &&
                  store.address.city.toLowerCase().includes(searchTextLower)) ||
                (store.address.state &&
                  store.address.state.toLowerCase().includes(searchTextLower))
              );
            });
          }
  
          // Update current stores
          currentStores = filteredStores;
  
          if (filteredStores.length === 0) {
            if (storeList) {
              storeList.innerHTML =
                "<li>No stores found matching the search</li>";
            }
            storeCountElement.textContent = "0";
            plotStoresOnMap([]);
            return;
            // plotStoresOnMap([]); // Clear map
            // return;
          }
  
          // Update stores and map
          populateStoreList(filteredStores);
          plotStoresOnMap(filteredStores);
        })
        .catch((error) => {
          console.error("Error fetching stores by category:", error);
  
          // Show error message
          if (storeList) {
            storeList.innerHTML = "<li>Error searching stores</li>";
          }
        });
    }
  
    // update performGlobalSearch
  
    // update performGlobalSearch
  
    function performGlobalSearch(searchText) {
      // Show loading indicator
      const storeList = document.getElementById("storeList");
      // new
      const storeCountElement = document.getElementById("storeCount");
  
      // new
      if (storeList) {
        storeList.innerHTML = "<li>Searching stores...</li>";
      }
  
      // Perform in-memory search across all stores
      const searchTextLower = searchText.toLowerCase();
  
      const filteredStores = allStores.filter((store) => {
        // Check if store object has the necessary properties
        if (!store || !store.address) return false;
  
        // Multiple search criteria
        const matchesName =
          store.name && store.name.toLowerCase().includes(searchTextLower);
  
        const matchesStreet =
          store.address.street &&
          store.address.street.toLowerCase().includes(searchTextLower);
  
        const matchesCity =
          store.address.city &&
          store.address.city.toLowerCase().includes(searchTextLower);
  
        const matchesState =
          store.address.state &&
          store.address.state.toLowerCase().includes(searchTextLower);
  
        return matchesName || matchesStreet || matchesCity || matchesState;
      });
  
      // Update current stores
      currentStores = filteredStores;
  
      if (filteredStores.length === 0) {
        if (storeList) {
          storeList.innerHTML = "<li>No stores found matching your search</li>";
        }
        // newlyadded
        document.getElementById("storeCount").textContent = "0";
        plotStoresOnMap([]);
        return;
        // newlyadded
        // Clear map
        // plotStoresOnMap([]);
        // return;
      }
  
      // Update stores and map
      populateStoreList(filteredStores);
      plotStoresOnMap(filteredStores);
    }
  
    function fetchAllStores() {
      // Show loading indicator
      const storeList = document.getElementById("storeList");
      if (storeList) {
        storeList.innerHTML = "<li>Loading stores...</li>";
      }
  
      // Fetch all stores when the page loads
      fetch(
        `http://localhost:5175/api/v1/stores?shop=quickstart-2770d800.myshopify.com`
      )
        .then((response) => {
          if (!response.ok) {
            throw new Error("Network response was not ok");
          }
          return response.json();
        })
        .then((data) => {
          // Robust data extraction
          let stores = [];
          if (Array.isArray(data)) {
            stores = data;
          } else if (data.stores && Array.isArray(data.stores)) {
            stores = data.stores;
          } else if (data.data && Array.isArray(data.data)) {
            stores = data.data;
          }
  
          // Validate stores
          allStores = stores.filter(
            (store) =>
              store.address && store.address.latitude && store.address.longitude
          );
  
          // Update current stores
          currentStores = allStores;
  
          // Populate stores list and map
          if (storeList) {
            storeList.innerHTML = ""; // Clear loading message
          }
          populateStoreList(allStores);
          plotStoresOnMap(allStores);
        })
        .catch((error) => {
          console.error("Error fetching all stores:", error);
  
          // Show error message
          if (storeList) {
            storeList.innerHTML = "<li>Error loading stores</li>";
          }
        });
    }
  
    // Event listeners
    document
      .getElementById("searchLocation")
      // added One
      .addEventListener("input", function () {
        // Debounce the search to prevent too many API calls
        clearTimeout(this.searchTimeout);
        this.searchTimeout = setTimeout(() => {
          const searchText = this.value.trim();
  
          if (searchText === "") {
            // If search is cleared, revert to the current category and status
            const categorySelect = document.getElementById("category");
            const statusSwitch = document.getElementById("statusSwitch");
  
            const selectedCategory = categorySelect.value;
            const openStatus = statusSwitch.checked ? "open" : "close";
  
            if (selectedCategory) {
              // If a category is selected, fetch stores by category and status
              fetchStoresByCategoryAndStatus(selectedCategory, openStatus);
            } else {
              // If no category is selected, fetch stores by status
              fetchStoresByStatus(openStatus);
            }
          } else {
            // Perform search with current filters
            applyFilters();
          }
        }, 500); // 500ms delay
      });
  
    document.getElementById("category").addEventListener("change", function () {
      applyFilters();
    });
    // NewlyAdded
  
    // Newlyadded
    // Fetch all stores when the page loads
    document.addEventListener("DOMContentLoaded", fetchAllStores);
  
    fetchStoresByStatus("open");
  
    L.marker([20.5937, 78.9629])
      .addTo(map)
      .bindPopup("Your location here")
      .openPopup();
  });
  