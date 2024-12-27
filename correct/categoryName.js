document.addEventListener("DOMContentLoaded", function () {
    //  settingupdate
    let radiusCircle;
    async function fetchUpdatedSettings() {
      try {
        const response = await fetch(
          "http://localhost:5175/api/v1/settings/settings1"
        );
        if (response.ok) {
          const settings = await response.json();
  
          document.getElementById("company-name").textContent =
            settings.companyName;
          document.getElementById("map").style.backgroundColor =
            settings.mapColor;
  
          map.setView(settings.centerCoordinates, settings.zoomLevel);
          const marker = L.marker(settings.centerCoordinates).addTo(map);
          marker.bindPopup(settings.companyName).openPopup();
          // Update the radius circle
          updateRadiusCircle(settings.radius, settings.centerCoordinates);
          // Update the radius circle
        }
      } catch (error) {
        console.error("Error fetching updated settings:", error);
      }
    }
    function updateRadiusCircle(radius, centerCoordinates) {
      if (radiusCircle) {
        map.removeLayer(radiusCircle);
      }
  
      radiusCircle = L.circle(centerCoordinates, {
        color: "blue",
        fillColor: "#24c62c",
        fillOpacity: 0.5,
        radius: radius * 1609.34,
      }).addTo(map);
    }
   
    fetchUpdatedSettings();
    // settingupdate
  
    const mapContainer = document.getElementById("map");
  
    if (mapContainer._leaflet_id) {
      mapContainer._leaflet_id = null;
    }
      const originalPosition = [23.0225, 72.5714];
    const originalZoom = 5;
    // const map = L.map("map").setView([23.0225, 72.5714], 5);
    // comment
    const map = L.map("map").setView(originalPosition, originalZoom);
    // comment
  
    // added
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(map);
  
    // added
    const draggableMarker = L.marker([20.5937, 78.9629], {
      draggable: true,
    }).addTo(map);
  
    draggableMarker.on("dragend", function (e) {
      const position = e.target.getLatLng();
      console.log(
        `Marker dragged to: Latitude ${position.lat}, Longitude ${position.lng}`
      );
  
      document.getElementById(
        "startLocationInput"
      ).value = `${position.lat}, ${position.lng}`;
    });
  
    // added
  
  
  
    document
      .getElementById("resetZoomButton")
      .addEventListener("click", function () {
        map.setView(originalPosition, originalZoom);
      });
  
    let allStores = [];
    let isFetching = false;
    let locationMarkers = [];
  
    fetchCategories();
    // fetchStores();
    fetchStoresByStatus("open");
  
    // newly added
  
    document
      .getElementById("searchButton")
      .addEventListener("click", function () {
        const location = document.getElementById("searchLocation").value.trim();
        const category = document.getElementById("category").value;
        const status = document.getElementById("statusSwitch").checked
          ? "open"
          : "closed";
  
        if (category) {
          if (location) {
            fetchStoresByLocationCategoryStatus(location, category, status);
          } else {
            fetchStoresByCategoryAndStatus(category, status);
          }
        } else {
          if (location) {
            fetchStoresByLocationCategoryStatus(location, "", status);
          } else {
            fetchStoresByStatus("open");
          }
        }
      });
  
    // old
  
    document.getElementById("category").addEventListener("change", function () {
      const location = document.getElementById("searchLocation").value.trim();
      const category = this.value;
      const status = document.getElementById("statusSwitch").checked
        ? "open"
        : "closed";
  
      if (location) {
        fetchStoresByLocationCategoryStatus(location, category, status);
      } else {
        fetchStoresByCategoryAndStatus(category, status);
      }
    });
  
    document
      .getElementById("searchLocation")
      .addEventListener("input", function () {
        clearTimeout(this.searchTimeout);
        this.searchTimeout = setTimeout(() => {
          const searchText = this.value.trim();
          const categorySelect = document.getElementById("category");
          const statusSwitch = document.getElementById("statusSwitch");
  
          const selectedCategory = categorySelect.value;
          const currentStatus = statusSwitch.checked ? "open" : "closed";
  
          if (searchText === "") {
            if (selectedCategory) {
              fetchStoresByCategoryAndStatus(selectedCategory, currentStatus);
            } else {
              fetchStoresByStatus(currentStatus);
            }
          } else {
            if (selectedCategory) {
              fetchStoresByLocationCategoryStatus(
                searchText,
                selectedCategory,
                currentStatus
              );
            } else {
              fetchStoresByLocationAndStatus(searchText, currentStatus);
            }
          }
        }, 500);
      });
  
    // old
  
    document
      .getElementById("statusSwitch")
      .addEventListener("change", function () {
        const status = this.checked ? "open" : "closed";
        const location = document.getElementById("searchLocation").value.trim();
        const category = document.getElementById("category").value;
  
        // Update status label
        const statusLabel = document.getElementById("statusLabel");
        statusLabel.textContent =
          status.charAt(0).toUpperCase() + status.slice(1);
  
        if (location) {
          // If location is entered, use location-based status search
          fetchStoresByLocationCategoryStatus(location, status, category);
        } else {
          // Fallback to existing filtering
          if (category) {
            fetchStoresByCategoryAndStatus(category, status);
          } else {
            fetchStoresByStatus(status);
          }
        }
      });
  
    document
      .getElementById("statusSwitch")
      .addEventListener("change", function () {
        const status = this.checked ? "open" : "closed";
        const location = document.getElementById("searchLocation").value.trim();
        const category = document.getElementById("category").value;
  
        // Update status label
        const statusLabel = document.getElementById("statusLabel");
        statusLabel.textContent =
          status.charAt(0).toUpperCase() + status.slice(1);
  
        // Comprehensive filtering based on different scenarios
        if (location) {
          fetchStoresByLocationCategoryStatus(location, status, category);
        } else if (category) {
          fetchStoresByCategoryAndStatus(category, status);
        } else {
          fetchStoresByStatus(status);
        }
      });
    // old
    //statusSwitch newlyAdded
  
    // additional
    function handleNoStoresFound(location = "", status = "", category = "") {
      const storeList = document.querySelector("#storeList");
      const storeCountElement = document.querySelector("#storeCount");
  
      // Construct a detailed message
      let message = "No stores found";
  
      if (location) {
        message += ` in ${location}`;
      }
  
      if (category) {
        message += ` for category ${category}`;
      }
  
      if (status) {
        message += ` with status ${status}`;
      }
  
      // Update UI
      if (storeList) {
        storeList.innerHTML = `<li>${message}</li>`;
      }
  
      if (storeCountElement) {
        storeCountElement.textContent = "0";
      }
  
      // Clear map
      plotStoresOnMap([]);
    }
    // old
    function fetchStoresByLocationAndStatus(location, status) {
      const apiUrl = new URL(
        "http://localhost:5175/api/v1/stores/location-status"
      );
      apiUrl.searchParams.append("location", location);
      apiUrl.searchParams.append("status", status);
  
      fetch(apiUrl)
        .then((response) => {
          if (!response.ok) throw new Error("Network response was not ok");
          return response.json();
        })
        .then((stores) => {
          // Get today's day name
          const todayName = new Date().toLocaleString("en-us", {
            weekday: "long",
          });
  
          // Filter stores based on status and today's working hours
          const filteredStores = stores.filter((store) => {
            const todayWorkingHours = store.workingHours.find(
              (hour) => hour.day === todayName
            );
  
            if (status === "open") {
              return todayWorkingHours && todayWorkingHours.isOpen;
            } else if (status === "closed") {
              return !todayWorkingHours || !todayWorkingHours.isOpen;
            }
  
            return true;
          });
  
          if (filteredStores.length === 0) {
            handleNoStoresFound(location, status);
  
            const storeList = document.querySelector("#storeList");
            const storeCountElement = document.querySelector("#storeCount");
  
            if (storeList) {
              storeList.innerHTML = `<li>No ${status} stores found in ${location}</li>`;
            }
            if (storeCountElement) {
              storeCountElement.textContent = "0";
            }
            plotStoresOnMap([]);
          } else {
            populateStoreList(filteredStores);
            plotStoresOnMap(filteredStores);
          }
        })
        .catch((error) => {
          console.error("Error fetching stores:", error);
          handleNoStoresFound(location, status);
  
          const storeList = document.querySelector("#storeList");
          const storeCountElement = document.querySelector("#storeCount");
  
          if (storeList) {
            storeList.innerHTML = "<li>Error fetching stores</li>";
          }
          if (storeCountElement) {
            storeCountElement.textContent = "0";
          }
          plotStoresOnMap([]);
        });
    }
  
    // old
    function fetchStoresByLocationCategoryStatus(location, category, status) {
      const apiUrl = new URL(
        "http://localhost:5175/api/v1/stores/location-category-status"
      );
      apiUrl.searchParams.append("location", location);
      apiUrl.searchParams.append("category", category);
      apiUrl.searchParams.append("status", status);
  
      fetch(apiUrl)
        .then((response) => {
          if (!response.ok) throw new Error("Network response was not ok");
          return response.json();
        })
        .then((stores) => {
          const todayName = new Date().toLocaleString("en-us", {
            weekday: "long",
          });
  
          // Filter stores based on status and today's working hours
          const filteredStores = stores.filter((store) => {
            const todayWorkingHours = store.workingHours.find(
              (hour) => hour.day === todayName
            );
  
            if (status === "open") {
              return todayWorkingHours && todayWorkingHours.isOpen;
            } else if (status === "closed") {
              return !todayWorkingHours || !todayWorkingHours.isOpen;
            }
  
            return true;
          });
  
          if (filteredStores.length === 0) {
            handleNoStoresFound(location, status, category);
  
            const storeList = document.querySelector("#storeList");
            const storeCountElement = document.querySelector("#storeCount");
  
            if (storeList) {
              storeList.innerHTML = `<li>No ${status} stores found in ${location} for ${category} category</li>`;
            }
            if (storeCountElement) {
              storeCountElement.textContent = "0";
            }
            plotStoresOnMap([]);
          } else {
            populateStoreList(filteredStores);
            plotStoresOnMap(filteredStores);
          }
        })
        .catch((error) => {
          console.error("Error fetching stores:", error);
          handleNoStoresFound(location, status, category);
  
          const storeList = document.querySelector("#storeList");
          const storeCountElement = document.querySelector("#storeCount");
  
          if (storeList) {
            storeList.innerHTML = "<li>Error fetching stores</li>";
          }
          if (storeCountElement) {
            storeCountElement.textContent = "0";
          }
          plotStoresOnMap([]);
        });
    }
  
    // calcuatedisance
    function calculateDistance(coord1, coord2) {
      const toRadians = (degree) => (degree * Math.PI) / 180;
      const R = 6371; // Radius of the Earth in kilometers
  
      const dLat = toRadians(coord2.lat - coord1.lat);
      const dLng = toRadians(coord2.lng - coord1.lng);
  
      const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(toRadians(coord1.lat)) *
          Math.cos(toRadians(coord2.lat)) *
          Math.sin(dLng / 2) *
          Math.sin(dLng / 2);
  
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      return R * c; // Distance in kilometers
    }
  
    //calculatedistance
  
    // Reset update slider
  
    const distanceSlider = document.getElementById("distanceSlider");
    const distanceLabel = document.getElementById("distanceLabel");
    const categorySelect = document.getElementById("category");
    const statusSwitch = document.getElementById("statusSwitch");
  
    if (distanceSlider && distanceLabel && categorySelect && statusSwitch) {
      distanceSlider.addEventListener("input", function () {
        const distance = Number(this.value);
        updateDistanceLabel(distance);
  
        const category = categorySelect.value || "";
        const status = statusSwitch.checked ? "open" : "closed";
  
        if (category) {
          fetchStoresByFilters(category, status, distance);
        } else {
          if (distance >= 20 && distance <= 30) {
            fetchStoresByFilters("", "status", distance);
          } else if (distance < 1000) {
            // fetchNearbyStores(21.1458, 79.0882, distance);
            fetchNearbyStores(21.1458, 79.0882, distance, status);
          } else {
            fetchStoresByFilters("", status, distance);
          }
        }
        // `added`
  
        // `added`
      });
  
      function updateDistanceLabel(distance) {
        if (!distanceLabel) return;
  
        const lowerBound = Number(distance);
        const upperBound = Math.min(lowerBound + 10, 1000);
  
        distanceLabel.innerText = `${lowerBound} km - ${upperBound} km`;
      }
      // newlyadded
      statusSwitch.addEventListener("change", function () {
        const category = categorySelect.value || "";
        const status = this.checked ? "open" : "closed";
  
        // Reset distance slider and label to default
        const defaultDistance = 10;
        distanceSlider.value = defaultDistance;
        updateDistanceLabel(defaultDistance);
  
        if (category) {
          console.log("Fetching stores with:", {
            category,
            status,
            distance: defaultDistance,
          });
          fetchStoresByFilters(category, status, defaultDistance);
        } else {
          // If no category is selected, fallback to nearby stores or filtered stores logic
          if (defaultDistance >= 20 && defaultDistance <= 30) {
            console.log("Fetching stores with:", {
              category: "",
              status,
              distance: defaultDistance,
            });
            fetchStoresByFilters("", status, defaultDistance);
          } else if (defaultDistance < 1000) {
            console.log("Fetching nearby stores with:", {
              latitude: 21.1458,
              longitude: 79.0882,
              radius: defaultDistance,
              status,
            });
            fetchNearbyStores(21.1458, 79.0882, defaultDistance, status);
          } else {
            console.log("Fetching stores with:", {
              category: "",
              status,
              distance: defaultDistance,
            });
  
            fetchStoresByFilters("", status, defaultDistance);
          }
        }
      });
  
      // change Select
  
      categorySelect.addEventListener("change", function () {
        const category = this.value || "";
  
        // Reset distance slider to its default value
        const defaultDistance = 10;
        distanceSlider.value = defaultDistance;
        updateDistanceLabel(defaultDistance);
  
        const status = statusSwitch.checked ? "open" : "closed";
  
        console.log("Fetching stores with:", {
          category,
          status,
          distance: defaultDistance,
        });
        fetchStoresByFilters(category, status, defaultDistance);
      });
    }
  
    function fetchStoresByFilters(category, status, distance) {
      const latitude = 21.1458;
      const longitude = 79.0882;
  
      const apiUrl = new URL("http://localhost:5175/api/v1/stores/filter");
      apiUrl.searchParams.append("latitude", latitude);
      apiUrl.searchParams.append("longitude", longitude);
      if (category) apiUrl.searchParams.append("category", category);
      if (status) apiUrl.searchParams.append("status", status);
      apiUrl.searchParams.append("radius", distance);
  
      fetch(apiUrl)
        .then((response) => {
          if (!response.ok) throw new Error("Network response was not ok");
          return response.json();
        })
        .then((stores) => {
          if (typeof populateStoreList === "function") {
            populateStoreList(stores);
          }
          if (typeof plotStoresOnMap === "function") {
            plotStoresOnMap(stores);
          }
        })
        .catch((error) => {
          console.error("Error fetching filtered stores:", error);
          clearStoreList();
        });
    }
  
    // new Update code
    function fetchNearbyStores(latitude, longitude, radius, status = "open") {
      const apiUrl = `http://localhost:5175/api/v1/stores/nearby?latitude=${latitude}&longitude=${longitude}&radius=${radius}&status=${status}&shop=quickstart-2770d800.myshopify.com`;
  
      fetch(apiUrl)
        .then((response) => {
          if (!response.ok) throw new Error("Network response was not ok");
          return response.json();
        })
        .then((data) => {
          const stores = extractStores(data);
  
          // Filter stores based on status if needed
          const filteredStores = stores.filter((store) => {
            const todayName = new Date().toLocaleString("en-us", {
              weekday: "long",
            });
            const todayWorkingHours = store.workingHours.find(
              (hour) => hour.day === todayName
            );
  
            if (status === "open") {
              return todayWorkingHours && todayWorkingHours.isOpen;
            } else if (status === "closed") {
              return !todayWorkingHours || !todayWorkingHours.isOpen;
            }
            return true;
          });
  
          if (filteredStores.length === 0) {
            console.warn("No stores found in the nearby search");
            clearStoreList();
            return;
          }
  
          populateStoreList(filteredStores);
          plotStoresOnMap(filteredStores);
        })
        .catch((error) => {
          console.error("Error fetching nearby stores:", error);
          clearStoreList();
        });
    }
  
    // new update Code
  
    function extractStores(data) {
      let stores = [];
      if (Array.isArray(data)) {
        stores = data;
      } else if (data.stores && Array.isArray(data.stores)) {
        stores = data.stores;
      } else if (data.data && Array.isArray(data.data)) {
        stores = data.data;
      } else if (data.results && Array.isArray(data.results)) {
        stores = data.results;
      }
      return stores.filter(
        (store) =>
          store.address && store.address.latitude && store.address.longitude
      );
    }
  
    function clearStoreList() {
      const storeList = document.getElementById("storeList");
      const storeCount = document.getElementById("storeCount");
  
      if (storeList) {
        storeList.innerHTML = "<li>No stores found</li>";
      }
      if (storeCount) {
        storeCount.textContent = "0";
      }
    }
  
    //  reset update Slider
    function populateStoreList(data) {
      const storeList = document.querySelector("#storeList");
      const storeCountElement = document.querySelector("#storeCount");
      const printButton = document.querySelector("#printButton");
      const nagpurCoordinates = { lat: 21.1458, lng: 79.0882 };
  
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
      // newlyadded
      // data.forEach((store, index) => {
      //   const storeCard = document.createElement("li");
      //   storeCard.innerHTML = `<h2>${store.name}</h2>`; // Simplified for brevity
      //   storeList.appendChild(storeCard);
      // });
      // newlyAdded
      // storeCountElement.textContent = data.length || 0;
      // if (data.length === 0) {
      //   storeList.innerHTML = "<li>No stores found matching your search</li>";
      //   return;
      // }
  
      const today = new Date().getDay();
      const currentRadius = distanceSlider ? Number(distanceSlider.value) : 20;
  
      data.forEach((store, index) => {
        const categoryName = store.category?.name || "Uncategorized";
  
        const todayWorkingHours = store.workingHours.find(
          (hour) => hour.day === getDayName(today) && hour.isOpen
        );
        let workingHoursText = "Closed Today";
        isOpen = false;
  
        // if (todayWorkingHours && todayWorkingHours.isOpen) {
        //   workingHoursText = `${todayWorkingHours.start} - ${todayWorkingHours.end}`;
        // }
        if (
          todayWorkingHours &&
          todayWorkingHours.start &&
          todayWorkingHours.end
        ) {
          const currentTime = new Date().toLocaleTimeString("en-US", {
            hour12: false,
            hour: "2-digit",
            minute: "2-digit",
          });
  
          if (
            currentTime >= todayWorkingHours.start &&
            currentTime <= todayWorkingHours.end
          ) {
            isOpen = true;
            workingHoursText = `${todayWorkingHours.start} - ${todayWorkingHours.end}`;
          }
        }
  
        const storeCard = document.createElement("li");
        storeCard.classList.add("store-card");
  
        // addednew
        const storeCoordinates = {
          lat: store.address.latitude,
          lng: store.address.longitude,
        };
        const distanceFromNagpur = calculateDistance(
          nagpurCoordinates,
          storeCoordinates
        ).toFixed(2);
        // addedNew
        const statusBadge = isOpen
          ? '<span class="status-badge open">Open</span>'
          : '<span class="status-badge closed">Closed</span>';
        // adding
  
        storeCard.innerHTML = `
          <div class="store-card">
             ${statusBadge}
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
                <p>Distance ${distanceFromNagpur} km</p>
                <div class="map-popup-box-info"> 🏷️ Category: ${categoryName} </div>
                <p>Working Hours: ${
                  todayWorkingHours
                    ? `${todayWorkingHours.start} - ${todayWorkingHours.end}`
                    : "Not Available"
                }</p>
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
  
            const popup = marker.getPopup().getElement();
            const zoomButton = popup.querySelector(".zoom-button");
  
            if (zoomButton) {
              zoomButton.addEventListener("click", (e) => {
                e.stopPropagation();
                const lat = parseFloat(zoomButton.dataset.lat);
                const lng = parseFloat(zoomButton.dataset.lng);
  
                if (!isNaN(lat) && !isNaN(lng)) {
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
  
      // updatedistance
  
      // updatedistance
  
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
  
    // document
    //   .getElementById("statusSwitch")
    //   .addEventListener("change", function () {
    //     const openStatus = this.checked ? "open" : "close";
    //     const statusLabel = document.getElementById("statusLabel");
    //     statusLabel.textContent =
    //       openStatus.charAt(0).toUpperCase() + openStatus.slice(1);
    //     console.log("Switch toggled, status:", openStatus);
  
    //     // added
    //     // resetFields();
    //     // added
    //     fetchStoresByStatus(openStatus);
    //   });
  
    // old
  
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
            // newlyadded
            handleNoStoresFound("", openStatus);
            //newlyadded
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
          // newlyadded
          handleNoStoresFound("", openStatus);
  
          // newlyAdded
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
  
    // old
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
                  marker.openPopup();
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
        "http://localhost:5175/api/v1/category/publishcategory?shop=quickstart-2770d800.myshopify.com"
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
        // const openStatus = statusSwitch.checked ? "open" : "close";
        const currentStatus = statusSwitch.checked ? "open" : "closed";
  
        console.log(
          `Selected Category: ${selectedCategory}, Status: ${currentStatus}`
        );
  
        if (selectedCategory) {
          fetchStoresByCategoryAndStatus(selectedCategory, currentStatus);
        } else {
          fetchStoresByStatus(currentStatus);
        }
      });
    }
    // old
    function fetchStoresByCategoryAndStatus(categoryName, openStatus) {
      console.log(
        `Fetching stores for category: ${categoryName}, Status: ${openStatus}`
      );
  
      const apiUrl = new URL(
        "http://localhost:5175/api/v1/stores/category-status"
      );
      apiUrl.searchParams.append("categoryName", categoryName);
      apiUrl.searchParams.append("openStatus", openStatus);
  
      fetch(apiUrl)
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
  
          // Get today's day name
          const todayName = new Date().toLocaleString("en-us", {
            weekday: "long",
          });
  
          // added
          const processedStores = data.map((store) => ({
            ...store,
            categoryName: categoryName || store.category?.name,
          }));
          // added
  
          // const filteredStores = data.filter((store) => {
          const filteredStores = processedStores.filter((store) => {
            const todayWorkingHours = store.workingHours.find(
              (hour) => hour.day === todayName
            );
  
            if (openStatus === "open") {
              return todayWorkingHours && todayWorkingHours.isOpen;
            } else if (openStatus === "closed") {
              return !todayWorkingHours || !todayWorkingHours.isOpen;
            }
  
            return true;
          });
  
          if (filteredStores.length === 0) {
            // add
            handleNoStoresFound("", openStatus, categoryName);
  
            // add
            const storeList = document.querySelector("#storeList");
            const storeCountElement = document.querySelector("#storeCount");
  
            storeList.innerHTML = `<li>No ${openStatus} stores found in ${categoryName} category</li>`;
            storeCountElement.textContent = "0";
            plotStoresOnMap([]);
          } else {
            populateStoreList(filteredStores);
            plotStoresOnMap(filteredStores);
          }
        })
        .catch((error) => {
          // add
          handleNoStoresFound("", openStatus, categoryName);
  
          // add
          console.error("Error fetching stores by category and status:", error);
  
          const storeList = document.querySelector("#storeList");
          const storeCountElement = document.querySelector("#storeCount");
  
          storeList.innerHTML = "<li>Error loading stores</li>";
          storeCountElement.textContent = "0";
          plotStoresOnMap([]);
          clearStoreList();
        });
    }
  
    // old
    function fetchAllStores() {
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
    // old
    function applyFilters() {
      const searchInput = document.getElementById("searchLocation");
      const categorySelect = document.getElementById("category");
  
      if (!searchInput || !categorySelect) {
        console.error("Search input or category select element not found.");
        return;
      }
  
      const searchText = searchInput.value.trim().toLowerCase();
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
  
    // old
  
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
  
    function performGlobalSearch(searchText) {
      // Show loading indicator
      const storeList = document.getElementById("storeList");
      // new
      const storeCountElement = document.getElementById("storeCount");
  
      // new
      if (storeList) {
        storeList.innerHTML = "<li>Searching stores...</li>";
      }
  
      const searchTextLower = searchText.toLowerCase();
  
      const filteredStores = allStores.filter((store) => {
        if (!store || !store.address) return false;
  
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
    // addedcoded
    function fetchAllStores() {
      // Show loading indicator
      const storeList = document.getElementById("storeList");
      if (storeList) {
        storeList.innerHTML = "<li>Loading stores...</li>";
      }
  
      fetch(
        // `http://localhost:5175/api/v1/stores?shop=quickstart-2770d800.myshopify.com`
        "http://localhost:5175/api/v1/stores/published?shop=quickstart-2770d800.myshopify.com"
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
          } else if (data.results && Array.isArray(data.results)) {
            stores = data.results;
          } else {
            console.warn("No stores found in the response");
            if (storeList) {
              storeList.innerHTML = "<li>No stores available</li>";
            }
            return;
          }
  
          allStores = stores.filter(
            (store) =>
              store.address && store.address.latitude && store.address.longitude
          );
  
          currentStores = allStores;
  
          if (storeList) {
            storeList.innerHTML = "";
          }
          populateStoreList(allStores);
          plotStoresOnMap(allStores);
        })
        .catch((error) => {
          console.error("Error fetching all stores:", error);
  
          if (storeList) {
            storeList.innerHTML = "<li>Error loading stores</li>";
          }
        });
    }
  
    // addedcode
    document.addEventListener("DOMContentLoaded", fetchAllStores);
  
    fetchStoresByStatus("open");
  
    L.marker([20.5937, 78.9629])
      .addTo(map)
      .bindPopup("Your location here")
      .openPopup();
  });
  