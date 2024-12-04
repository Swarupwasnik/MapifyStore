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
  let currentStores = []; // To keep track of the current filtered store list

  fetchCategories();
  // fetchStores();
  fetchStoresByStatus("open"); // Fetch only open stores on page load

  // newly Added

  function openDirectionModal(store) {
    const directionModal = document.getElementById("directionModal");
    const modalStoreDetails = document.getElementById("modalStoreDetails");
    const startLocationInput = document.getElementById("startLocationInput");
    const endLocationInput = document.getElementById("endLocationInput");
    const getDirectionsBtn = document.getElementById("getDirectionsBtn");

    // Enhanced Logging
    console.log("Opening Direction Modal for Store:", store);

    // Populate modal with store details
    modalStoreDetails.innerHTML = `
        <h3>Store Location</h3>
        <p>${store.name}</p>
        <p>${store.address.street}, ${store.address.city}, ${store.address.state}</p>
    `;

    // Set end location to store's address
    endLocationInput.value = `${store.address.city}, ${store.address.state}`;

    // Show the modal
    directionModal.style.display = "block";

    // Event listener for getting directions
    getDirectionsBtn.onclick = async function () {
      const startLocation = startLocationInput.value.trim();
      const endLocation = endLocationInput.value.trim();

      console.log("Direction Request:", {
        startLocation,
        endLocation,
        storeAddress: `${store.address.street}, ${store.address.city}, ${store.address.state}`,
      });

      if (startLocation && endLocation) {
        // Clear previous routing
        if (routingControl) {
          map.removeControl(routingControl);
        }
        locationMarkers = []; // Reset markers

        try {
          // Enhanced Geocoding with Detailed Logging
          console.log("Geocoding Start Location...");
          const startCoords = await geocodeAndAddMarker(startLocation);
          console.log("Start Location Coordinates:", startCoords);

          console.log("Geocoding End Location...");
          const endCoords = await geocodeAndAddMarker(endLocation);
          console.log("End Location Coordinates:", endCoords);

          if (startCoords && endCoords) {
            // Detailed Waypoints Request
            console.log("Fetching Route Waypoints...");
            const routeResponse = await fetch(
              "http://localhost:5175/api/v1/stores/waypoints",
              {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  locations: [
                    `${startCoords.lat},${startCoords.long}`,
                    `${endCoords.lat},${endCoords.long}`,
                  ],
                  shop: "quickstart-2770d800.myshopify.com",
                }),
              }
            );

            console.log("Route Response Status:", routeResponse.status);

            if (!routeResponse.ok) {
              const errorText = await routeResponse.text();
              console.error("Route Fetch Error:", errorText);
              throw new Error(errorText);
            }

            const routeData = await routeResponse.json();
            console.log("Route Data:", routeData);

            // Validate Waypoints
            if (!routeData.waypoints || routeData.waypoints.length < 2) {
              throw new Error("Insufficient waypoints for routing");
            }

            // Create waypoints for routing
            const waypoints = routeData.waypoints.map((wp) =>
              L.latLng(wp.latitude, wp.longitude)
            );

            console.log("Routing Waypoints:", waypoints);

            // Create routing control with enhanced options
            routingControl = L.Routing.control({
              waypoints: waypoints,
              routeWhitelist: ["car"],
              lineOptions: {
                styles: [{ color: "blue", opacity: 0.8, weight: 6 }],
              },
              addWaypoints: false,
              draggableWaypoints: false,
              fitSelectedRoutes: true,
              show: true,
              createMarker: function (i, waypoint, n) {
                // Custom marker creation
                const markerOptions =
                  i === 0
                    ? {
                        icon: L.AwesomeMarkers.icon({
                          icon: "play",
                          markerColor: "green",
                        }),
                      }
                    : i === n - 1
                    ? {
                        icon: L.AwesomeMarkers.icon({
                          icon: "stop",
                          markerColor: "red",
                        }),
                      }
                    : {};

                return L.marker(waypoint.latLng, markerOptions);
              },
            }).addTo(map);

            // Close the modal
            directionModal.style.display = "none";
          } else {
            console.warn("Unable to geocode start or end location");
            alert("Could not find coordinates for the locations");
          }
        } catch (error) {
          console.error("Route Calculation Error:", {
            message: error.message,
            stack: error.stack,
          });
          alert("Route calculation error: " + error.message);
        }
      } else {
        alert("Please enter both start and end locations");
      }
    };
  }

  // Enhanced Geocoding Function
  async function geocodeAndAddMarker(locationInput) {
    try {
      console.log("Geocoding Location:", locationInput);

      const res = await fetch(
        `http://localhost:5175/api/v1/stores/geocode?shop=quickstart-2770d800.myshopify.com&${new URLSearchParams(
          { location: locationInput }
        )}`
      );

      console.log("Geocode Response Status:", res.status);

      if (!res.ok) {
        const errorText = await res.text();
        console.error("Geocode API Error:", errorText);
        throw new Error(errorText);
      }

      const data = await res.json();
      console.log("Geocode API Response:", data);

      // Validate Coordinates
      if (
        !data.coordinates ||
        !data.coordinates.latitude ||
        !data.coordinates.longitude
      ) {
        throw new Error("Invalid coordinates received");
      }

      const newLocation = {
        address: data.location || "Unknown Location",
        lat: data.coordinates.latitude,
        long: data.coordinates.longitude,
      };

      // Optional: Add marker to map
      L.marker([newLocation.lat, newLocation.long])
        .addTo(map)
        .bindPopup(newLocation.address)
        .openPopup();

      locationMarkers.push(newLocation);

      return newLocation;
    } catch (error) {
      console.error("Geocoding Error:", {
        location: locationInput,
        message: error.message,
        stack: error.stack,
      });
      alert("Geocoding error: " + error.message);
      return null;
    }
  }
  //  newlyUpdetae

  // newSlider
  function fetchNearbyStores(latitude, longitude, radius) {
    // Get current filter values
    const categorySelect = document.getElementById("category");
    const statusSwitch = document.getElementById("statusSwitch");
    const searchInput = document.getElementById("searchLocation");
  
    const selectedCategory = categorySelect ? categorySelect.value : "";
    const openStatus = statusSwitch ? (statusSwitch.checked ? "open" : "closed") : "open";
    const searchText = searchInput ? searchInput.value.trim().toLowerCase() : "";
  
    // Construct the fetch URL with all parameters
    const url = new URL("http://localhost:5175/api/v1/stores/nearby");
    url.searchParams.append("latitude", latitude);
    url.searchParams.append("longitude", longitude);
    url.searchParams.append("radius", radius);
    url.searchParams.append("shop", "quickstart-2770d800.myshopify.com");
  
    // Add optional filters
    if (selectedCategory) {
        url.searchParams.append("category", selectedCategory);
    }
    url.searchParams.append("openStatus", openStatus);
  
    fetch(url.toString())
        .then((response) => {
            if (!response.ok) {
                throw new Error("Network response was not ok");
            }
            return response.json();
        })
        .then((data) => {
            console.log("Raw data:", data);
            let stores = [];
  
            // Extract stores from the response
            if (Array.isArray(data)) {
                stores = data;
            } else if (data.stores && Array.isArray(data.stores)) {
                stores = data.stores;
            } else if (data.data && Array.isArray(data.data)) {
                stores = data.data;
            }
  
            // Additional client-side filtering
            let filteredStores = stores.filter((store) => {
                // Validate store address
                if (!store.address || !store.address.latitude || !store.address.longitude) {
                    return false;
                }
  
                // Category filter
                if (selectedCategory && 
                    (!store.category || store.category.name !== selectedCategory)) {
                    return false;
                }
  
                // Search text filter
                if (searchText) {
                    const searchMatch = 
                        (store.name && store.name.toLowerCase().includes(searchText)) ||
                        (store.address.street && store.address.street.toLowerCase().includes(searchText)) ||
                        (store.address.city && store.address.city.toLowerCase().includes(searchText)) ||
                        (store.address.state && store.address.state.toLowerCase().includes(searchText));
                    
                    if (!searchMatch) return false;
                }
  
                return true;
            });
  
            // Update store list and map
            updateStoreListAndMap(filteredStores);
        })
        .catch((error) => {
            console.error("Error fetching nearby stores:", error);
            updateStoreListAndMap([], "Error loading stores");
        });
  }
  
  function updateStoreListAndMap(stores, errorMessage = null) {
    const storeList = document.getElementById("storeList");
    const storeCountElement = document.getElementById("storeCount");
    const categorySelect = document.getElementById("category");
  
    // Update store count
    if (storeCountElement) {
        storeCountElement.textContent = stores.length;
    }
  
    // Handle empty or error state
    if (stores.length === 0) {
        if (storeList) {
            storeList.innerHTML = errorMessage 
                ? `<li>${errorMessage}</li>` 
                : "<li>No stores found</li>";
        }
        plotStoresOnMap([]);
        return;
    }
  
    // Populate store list and map
    populateStoreList(stores);
    plotStoresOnMap(stores);
  }
  
  // Modify distance slider event listener
  document.getElementById("distanceSlider").addEventListener("input", function () {
    const distance = this.value;
    updateDistanceLabel(distance);
  });
  
  function updateDistanceLabel(distance) {
    const distanceLabel = document.getElementById("distanceLabel");
    const categorySelect = document.getElementById("category");
    const statusSwitch = document.getElementById("statusSwitch");
  
    if (distanceLabel) {
        distanceLabel.innerText = `${distance} km`;
  
        // Get current filter values
        const selectedCategory = categorySelect ? categorySelect.value : "";
        const openStatus = statusSwitch ? (statusSwitch.checked ? "open" : "closed") : "open";
  
        // Use a default location or get user's current location
        fetchNearbyStores(19.076, 72.8777, distance);
    }
  }
  
  // Update category change event listener
  document.getElementById("category").addEventListener("change", function () {
    const distanceSlider = document.getElementById("distanceSlider");
    const currentDistance = distanceSlider ? distanceSlider.value : 20;
    
    // Re-fetch nearby stores with current distance and selected category
    fetchNearbyStores(19.076, 72.8777, currentDistance);
  });
  
  // Update status switch event listener
  document.getElementById("statusSwitch").addEventListener("change", function () {
    const distanceSlider = document.getElementById("distanceSlider");
    const currentDistance = distanceSlider ? distanceSlider.value : 20;
    
    // Re-fetch nearby stores with current distance and status
    fetchNearbyStores(19.076, 72.8777, currentDistance);
  });
  
  // Add search input event listener
  document.getElementById("searchLocation").addEventListener("input", function () {
    const distanceSlider = document.getElementById("distanceSlider");
    const currentDistance = distanceSlider ? distanceSlider.value : 20;
  
    // Fetch stores with current distance, category, and search input
    fetchNearbyStores(19.076, 72.8777, currentDistance);
  });
  
  // newSlider

  // newlyUpdted

  // document
  //   .getElementById("distanceSlider")
  //   .addEventListener("input", function () {
  //     const distance = this.value;
  //     updateDistanceLabel(distance);
  //   });

  //   function updateDistanceLabel(distance) {
  //     const distanceLabel = document.getElementById("distanceLabel");
  //     const distanceSlider = document.getElementById("distanceSlider");
    
  //     if (distanceLabel) {
  //       const lowerBound = distance;
  //       const upperBound = Math.min(Number(distance) + 10, 1000); // Ensure to convert to number
  //       distanceLabel.innerText = `${lowerBound} km - ${upperBound} km`;
    
  //       if (Number(distance) === 1000) { // Compare as number
  //         // Reset slider to 10 and update label
  //         distanceSlider.value = 10;
  //         distanceLabel.innerText = "10 km - 20 km";
    
  //         // Clear existing markers and reset map view
  //         map.eachLayer((layer) => {
  //           if (layer instanceof L.Marker) {
  //             map.removeLayer(layer);
  //           }
  //         });
  //         map.setView(originalPosition, originalZoom);
    
  //         // Fetch open status stores
  //         fetchStoresByStatus("open");
  //         plotStoresOnMap('stores');

  //       } else {
  //         // Fetch nearby stores within the selected distance
  //         fetchNearbyStores(19.076, 72.8777, distance);
  //       }
  //     }
  //   }
    



  // function fetchNearbyStores(latitude, longitude, radius) {
  //   fetch(
  //     `http://localhost:5175/api/v1/stores/nearby?latitude=${latitude}&longitude=${longitude}&radius=${radius}&shop=quickstart-2770d800.myshopify.com`
  //   )
  //     .then((response) => {
  //       if (!response.ok) {
  //         throw new Error("Network response was not ok");
  //       }
  //       return response.json();
  //     })
  //     .then((data) => {
  //       // Extensive logging to understand the data structure
  //       console.log("Raw data:", data);
  //       console.log("Data type:", typeof data);
  //       console.log("Data keys:", Object.keys(data));

  //       // More robust data extraction
  //       let stores = [];

  //       // Try multiple ways to extract stores
  //       if (Array.isArray(data)) {
  //         stores = data;
  //       } else if (data.stores && Array.isArray(data.stores)) {
  //         stores = data.stores;
  //       } else if (data.data && Array.isArray(data.data)) {
  //         stores = data.data;
  //       } else if (data.results && Array.isArray(data.results)) {
  //         stores = data.results;
  //       } else {
  //         console.warn("No stores found in the response");
  //         // Clear existing store list
  //         const storeList = document.getElementById("storeList");
  //         if (storeList) {
  //           storeList.innerHTML = "<li>No stores found</li>";
  //         }
  //         return;
  //       }

  //       console.log("Processed stores:", stores);
  //       console.log("Number of stores:", stores.length);

  //       if (stores.length === 0) {
  //         console.warn("No stores found in the nearby search");
  //         const storeList = document.getElementById("storeList");
  //         if (storeList) {
  //           storeList.innerHTML = "<li>No stores found</li>";
  //         }
  //         return;
  //       }

  //       // Ensure stores have required properties
  //       const validStores = stores.filter(
  //         (store) =>
  //           store.address && store.address.latitude && store.address.longitude
  //       );
  //       const storeCountElement = document.getElementById("storeCount");
  //       storeCountElement.textContent = validStores.length;
  //       console.log("Valid stores:", validStores);

  //       populateStoreList(validStores);
  //       plotStoresOnMap(validStores);
  //     })
  //     .catch((error) => {
  //       console.error("Error fetching nearby stores:", error);

  //       // Clear existing store list
  //       document.getElementById("storeCount").textContent = "0";

  //       const storeList = document.getElementById("storeList");
  //       if (storeList) {
  //         storeList.innerHTML = "<li>Error loading stores</li>";
  //       }
  //     });
  // }

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
                  marker.openPopup(); // Re-open the popup after zooming
                }, 1500); // Delay to match the animation duration
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

    // Get today's day name
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
                // Perform smooth zoom-in effect and keep the popup open
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
  // newly added
  // Global variable to keep track of the current store lis // This will store the most recent list of stores

  function applyFilters() {
    const searchInput = document.getElementById("searchLocation");
    const categorySelect = document.getElementById("category");

    if (!searchInput || !categorySelect) {
      console.error("Search input or category select element not found.");
      return;
    }

    const searchText = searchInput.value.trim().toLowerCase(); // Convert to lowercase
    const selectedCategory = categorySelect.value;

    // If search text is empty and no category is selected, show all stores
    if (!searchText && !selectedCategory) {
      currentStores = allStores; // Update current stores
      populateStoreList(allStores);
      plotStoresOnMap(allStores);
      return;
    }

    // If category is selected, handle category filtering first
    if (selectedCategory) {
      fetchStoresByCategory(selectedCategory, searchText);
      return;
    }

    // If no category is selected, perform global search
    if (searchText) {
      performGlobalSearch(searchText);
    }
  }

  function fetchStoresByCategory(category, searchText = "") {
    // Show loading indicator
    const storeList = document.getElementById("storeList");
    const storeCountElement = document.getElementById("storeCount");

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
        plotStoresOnMap([]); // Clear map
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
    .addEventListener("input", function () {
      // Debounce the search to prevent too many API calls
      clearTimeout(this.searchTimeout);
      this.searchTimeout = setTimeout(() => {
        applyFilters();
      }, 500); // 500ms delay
    });

  document.getElementById("category").addEventListener("change", function () {
    applyFilters();
  });

  // Fetch all stores when the page loads
  document.addEventListener("DOMContentLoaded", fetchAllStores);

  fetchStoresByStatus("open");

  L.marker([20.5937, 78.9629])
    .addTo(map)
    .bindPopup("Your location here")
    .openPopup();
});
