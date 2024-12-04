document.addEventListener("DOMContentLoaded", function () {
    const mapContainer = document.getElementById("map");
  
    if (mapContainer._leaflet_id) {
      mapContainer._leaflet_id = null;
    }
  
    const map = L.map("map").setView([23.0225, 72.5714], 5);
  
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
  
          console.log("Valid stores:", validStores);
  
          populateStoreList(validStores);
          plotStoresOnMap(validStores);
        })
        .catch((error) => {
          console.error("Error fetching nearby stores:", error);
  
          // Clear existing store list
          const storeList = document.getElementById("storeList");
          if (storeList) {
            storeList.innerHTML = "<li>Error loading stores</li>";
          }
        });
    }
  
    function populateStoreList(data) {
      const storeList = document.querySelector("#storeList");
      const storeCountElement = document.querySelector("#storeCount");
      const printButton = document.querySelector("#printButton");
      if (!storeList) {
        console.error("Store list container not found.");
        return;
      }
  
      storeList.innerHTML = "";
      storeCountElement.textContent = data.length;
  
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
  // Global variable to keep track of the current store list
  let currentStores = []; // This will store the most recent list of stores
  
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
  
  function fetchStoresByCategory(category, searchText = '') {
      // Show loading indicator
      const storeList = document.getElementById("storeList");
      if (storeList) {
        storeList.innerHTML = '<li>Searching stores...</li>';
      }
  
      fetch(
        `http://localhost:5175/api/v1/stores/category?category=${encodeURIComponent(category)}&shop=quickstart-2770d800.myshopify.com`
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
            storeList.innerHTML = '<li>No stores found in this category</li>';
          }
          plotStoresOnMap([]); // Clear map
          return;
        }
  
        // Validate stores
        let filteredStores = stores.filter(store => 
          store.address && 
          store.address.latitude && 
          store.address.longitude
        );
  
        // Apply additional search text filter if provided
        if (searchText) {
          const searchTextLower = searchText.toLowerCase();
          filteredStores = filteredStores.filter((store) => {
            return (
              (store.name && store.name.toLowerCase().includes(searchTextLower)) ||
              (store.address.street && store.address.street.toLowerCase().includes(searchTextLower)) ||
              (store.address.city && store.address.city.toLowerCase().includes(searchTextLower)) ||
              (store.address.state && store.address.state.toLowerCase().includes(searchTextLower))
            );
          });
        }
  
        // Update current stores
        currentStores = filteredStores;
  
        if (filteredStores.length === 0) {
          if (storeList) {
            storeList.innerHTML = '<li>No stores found matching the search</li>';
          }
          plotStoresOnMap([]); // Clear map
          return;
        }
  
        // Update stores and map
        populateStoreList(filteredStores);
        plotStoresOnMap(filteredStores);
      })
      .catch((error) => {
        console.error("Error fetching stores by category:", error);
        
        // Show error message
        if (storeList) {
          storeList.innerHTML = '<li>Error searching stores</li>';
        }
        plotStoresOnMap([]); // Clear map
      });
  }
  
  function performGlobalSearch(searchText) {
      // Show loading indicator
      const storeList = document.getElementById("storeList");
      if (storeList) {
        storeList.innerHTML = '<li>Searching stores...</li>';
      }
  
      // Perform in-memory search across all stores
      const searchTextLower = searchText.toLowerCase();
      
      const filteredStores = allStores.filter(store => {
          // Check if store object has the necessary properties
          if (!store || !store.address) return false;
  
          // Multiple search criteria
          const matchesName = store.name && 
              store.name.toLowerCase().includes(searchTextLower);
          
          const matchesStreet = store.address.street && 
              store.address.street.toLowerCase().includes(searchTextLower);
          
          const matchesCity = store.address.city && 
              store.address.city.toLowerCase().includes(searchTextLower);
          
          const matchesState = store.address.state && 
              store.address.state.toLowerCase().includes(searchTextLower);
  
          return matchesName || matchesStreet || matchesCity || matchesState;
      });
  
      // Update current stores
      currentStores = filteredStores;
  
      if (filteredStores.length === 0) {
          if (storeList) {
              storeList.innerHTML = '<li>No stores found matching your search</li>';
          }
          // Clear map
          plotStoresOnMap([]);
          return;
      }
  
      // Update stores and map
      populateStoreList(filteredStores);
      plotStoresOnMap(filteredStores);
  }
  
  function fetchAllStores() {
      // Show loading indicator
      const storeList = document.getElementById("storeList");
      if (storeList) {
        storeList.innerHTML = '<li>Loading stores...</li>';
      }
  
      // Fetch all stores when the page loads
      fetch(`http://localhost:5175/api/v1/stores?shop=quickstart-2770d800.myshopify.com`)
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
          allStores = stores.filter(store => 
              store.address && 
              store.address.latitude && 
              store.address.longitude
          );
  
          // Update current stores
          currentStores = allStores;
  
          // Populate stores list and map
          if (storeList) {
              storeList.innerHTML = ''; // Clear loading message
          }
          populateStoreList(allStores);
          plotStoresOnMap(allStores);
      })
      .catch((error) => {
          console.error("Error fetching all stores:", error);
          
          // Show error message
          if (storeList) {
              storeList.innerHTML = '<li>Error loading stores</li>';
          }
      });
  }
  
  // Event listeners
  document.getElementById("searchLocation").addEventListener("input", function() {
      // Debounce the search to prevent too many API calls
      clearTimeout(this.searchTimeout);
      this.searchTimeout = setTimeout(() => {
          applyFilters();
      }, 500); // 500ms delay
  });
  
  document.getElementById("category").addEventListener("change", function() {
      applyFilters();
  });
  
  // Fetch all stores when the page loads
  document.addEventListener('DOMContentLoaded', fetchAllStores);
  
  
  // newly added
    // function applyFilters() {
    //   const searchInput = document.getElementById("searchLocation");
    //   const categorySelect = document.getElementById("category");
  
    //   if (!searchInput || !categorySelect) {
    //     console.error("Search input or category select element not found.");
    //     return;
    //   }
  
    //   const searchText = searchInput.value.toLowerCase();
    //   const selectedCategory = categorySelect.value;
  
    //   let filteredStores = allStores;
  
    //   if (selectedCategory) {
    //     fetchStoresByCategory(selectedCategory);
    //   } else {
    //     filteredStores = allStores.filter((store) => {
    //       return (
    //         store.name.toLowerCase().includes(searchText) ||
    //         store.address.street.toLowerCase().includes(searchText) ||
    //         store.address.city.toLowerCase().includes(searchText) ||
    //         store.address.state.toLowerCase().includes(searchText)
    //       );
    //     });
  
    //     populateStoreList(filteredStores);
    //     plotStoresOnMap(filteredStores);
    //   }
    // }
  
    // const searchInput = document.getElementById("searchLocation");
    // if (searchInput) {
    //   searchInput.addEventListener("input", applyFilters);
    // }
  
    fetchStoresByStatus("open");
  
    L.marker([20.5937, 78.9629])
      .addTo(map)
      .bindPopup("Your location here")
      .openPopup();
  });