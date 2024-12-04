// function openDirectionModal(store) {
//     const directionModal = document.getElementById('directionModal');
//     const modalStoreDetails = document.getElementById('modalStoreDetails');
//     const startLocationInput = document.getElementById('startLocationInput');
//     const endLocationInput = document.getElementById('endLocationInput');
//     const getDirectionsBtn = document.getElementById('getDirectionsBtn');
  
//     // Enhanced Logging
//     console.log('Opening Direction Modal for Store:', store);
  
//     // Populate modal with store details
//     modalStoreDetails.innerHTML = `
//         <h3>Store Location</h3>
//         <p>${store.name}</p>
//         <p>${store.address.street}, ${store.address.city}, ${store.address.state}</p>
//     `;
  
//     // Set end location to store's address
//     endLocationInput.value = `${store.address.city}, ${store.address.state}`;
  
//     // Show the modal
//     directionModal.style.display = 'block';
  
//     // Event listener for getting directions
//     getDirectionsBtn.onclick = async function() {
//       const startLocation = startLocationInput.value.trim();
//       const endLocation = endLocationInput.value.trim();
  
//       console.log('Direction Request:', {
//         startLocation,
//         endLocation,
//         storeAddress: `${store.address.street}, ${store.address.city}, ${store.address.state}`
//       });
  
//       if (startLocation && endLocation) {
//         // Clear previous routing
//         if (routingControl) {
//           map.removeControl(routingControl);
//         }
//         locationMarkers = []; // Reset markers
  
//         try {
//           // Enhanced Geocoding with Detailed Logging
//           console.log('Geocoding Start Location...');
//           const startCoords = await geocodeAndAddMarker(startLocation);
//           console.log('Start Location Coordinates:', startCoords);
  
//           console.log('Geocoding End Location...');
//           const endCoords = await geocodeAndAddMarker(endLocation);
//           console.log('End Location Coordinates:', endCoords);
  
//           if (startCoords && endCoords) {
//             // Detailed Waypoints Request
//             console.log('Fetching Route Waypoints...');
//             const routeResponse = await fetch('http://localhost:5175/api/v1/stores/waypoints', {
//               method: 'POST',
//               headers: {
//                 'Content-Type': 'application/json',
//               },
//               body: JSON.stringify({ 
//                 locations: [
//                   `${startCoords.lat},${startCoords.long}`, 
//                   `${endCoords.lat},${endCoords.long}`
//                 ],
//                 shop: 'quickstart-2770d800.myshopify.com'
//               }),
//             });
  
//             console.log('Route Response Status:', routeResponse.status);
  
//             if (!routeResponse.ok) {
//               const errorText = await routeResponse.text();
//               console.error('Route Fetch Error:', errorText);
//               throw new Error(errorText);
//             }
  
//             const routeData = await routeResponse.json();
//             console.log('Route Data:', routeData);
  
//             // Validate Waypoints
//             if (!routeData.waypoints || routeData.waypoints.length < 2) {
//               throw new Error('Insufficient waypoints for routing');
//             }
  
//             // Create waypoints for routing
//             const waypoints = routeData.waypoints.map(wp => 
//               L.latLng(wp.latitude, wp.longitude)
//             );
  
//             console.log('Routing Waypoints:', waypoints);
  
//             // Create routing control with enhanced options
//             routingControl = L.Routing.control({
//               waypoints: waypoints,
//               routeWhitelist: ['car'],
//               lineOptions: {
//                 styles: [
//                   {color: 'blue', opacity: 0.8, weight: 6}
//                 ]
//               },
//               addWaypoints: false,
//               draggableWaypoints: false,
//               fitSelectedRoutes: true,
//               show: true,
//               createMarker: function(i, waypoint, n) {
//                 // Custom marker creation
//                 const markerOptions = i === 0 ? { icon: L.AwesomeMarkers.icon({
//                   icon: 'play',
//                   markerColor: 'green'
//                 }) } : i === n - 1 ? { icon: L.AwesomeMarkers.icon({
//                   icon: 'stop',
//                   markerColor: 'red'
//                 }) } : {};
                
//                 return L.marker(waypoint.latLng, markerOptions);
//               }
//             }).addTo(map);
  
//             // Close the modal
//             directionModal.style.display = 'none';
  
//           } else {
//             console.warn('Unable to geocode start or end location');
//             alert('Could not find coordinates for the locations');
//           }
//         } catch (error) {
//           console.error('Route Calculation Error:', {
//             message: error.message,
//             stack: error.stack
//           });
//           alert('Route calculation error: ' + error.message);
//         }
//       } else {
//         alert('Please enter both start and end locations');
//       }
//     };
//   }
  
//   // Enhanced Geocoding Function
//   async function geocodeAndAddMarker(locationInput) {
//     try {
//       console.log('Geocoding Location:', locationInput);
  
//       const res = await fetch(
//         `http://localhost:5175/api/v1/stores/geocode?shop=quickstart-2770d800.myshopify.com&${new URLSearchParams({ location: locationInput })}`
//       );
  
//       console.log('Geocode Response Status:', res.status);
  
//       if (!res.ok) {
//         const errorText = await res.text();
//         console.error('Geocode API Error:', errorText);
//         throw new Error(errorText);
//       }
  
//       const data = await res.json();
//       console.log('Geocode API Response:', data);
  
//       // Validate Coordinates
//       if (!data.coordinates || !data.coordinates.latitude || !data.coordinates.longitude) {
//         throw new Error('Invalid coordinates received');
//       }
  
//       const newLocation = {
//         address: data.location || 'Unknown Location',
//         lat: data.coordinates.latitude,
//         long: data.coordinates.longitude,
//       };
  
//       // Optional: Add marker to map
//       L.marker([newLocation.lat, newLocation.long])
//         .addTo(map)
//         .bindPopup(newLocation.address)
//         .openPopup();
  
//       locationMarkers.push(newLocation);
  
//       return newLocation;
//     } catch (error) {
//       console.error('Geocoding Error:', {
//         location: locationInput,
//         message: error.message,
//         stack: error.stack
//       });
//       alert('Geocoding error: ' + error.message);
//       return null;
//     }
//   }

// Global variable to track current filtered stores
// Function to fetch nearby stores
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
