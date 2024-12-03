function applyFilters() {
    const searchInput = document.getElementById("searchLocation");
    const categorySelect = document.getElementById("category");
  
    if (!searchInput || !categorySelect) {
      console.error("Search input or category select element not found.");
      return;
    }
  
    const searchText = searchInput.value.toLowerCase().trim();
    const selectedCategory = categorySelect.value;
  
    let filteredStores = allStores;
  
    // If a category is selected, fetch stores by category first
    if (selectedCategory) {
      fetchStoresByCategory(selectedCategory);
      return;
    }
  
    // Filter stores based on search text
    if (searchText) {
      filteredStores = allStores.filter((store) => {
        // Search across multiple fields
        const searchFields = [
          store.name.toLowerCase(),
          store.address.street.toLowerCase(),
          store.address.city.toLowerCase(),
          store.address.state.toLowerCase(),
          store.address.country.toLowerCase(),
          store.address.postalCode.toLowerCase(),
          store.company.toLowerCase()
        ];
  
        // Check if any field includes the search text
        return searchFields.some(field => field.includes(searchText));
      });
    }
  
    // Populate store list and map with filtered stores
    populateStoreList(filteredStores);
    plotStoresOnMap(filteredStores);
  }
  
  // Enhanced geocoding and location search
  function searchLocationOnMap() {
    const searchInput = document.getElementById("searchLocation");
    const searchText = searchInput.value.trim();
  
    if (!searchText) {
      // If search is empty, reset to show all stores
      populateStoreList(allStores);
      plotStoresOnMap(allStores);
      return;
    }
  
    // Use OpenStreetMap Nominatim for geocoding
    fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchText)}`)
      .then(response => response.json())
      .then(geocodeResults => {
        if (geocodeResults.length > 0) {
          const firstResult = geocodeResults[0];
          const lat = parseFloat(firstResult.lat);
          const lon = parseFloat(firstResult.lon);
  
          // Center the map on the searched location
          map.setView([lat, lon], 10);
  
          // Add a marker for the searched location
          L.marker([lat, lon])
            .addTo(map)
            .bindPopup(`Searched Location: ${searchText}`)
            .openPopup();
  
          // Filter stores near the searched location
          const nearbyStores = findNearbyStores(lat, lon, allStores);
          
          populateStoreList(nearbyStores);
          plotStoresOnMap(nearbyStores);
        } else {
          // No location found, show all stores
          populateStoreList(allStores);
          plotStoresOnMap(allStores);
          alert("Location not found. Showing all stores.");
        }
      })
      .catch(error => {
        console.error("Geocoding error:", error);
        populateStoreList(allStores);
        plotStoresOnMap(allStores);
      });
  }
  
  // Function to find nearby stores based on geographic proximity
  function findNearbyStores(searchLat, searchLon, stores, radiusKm = 50) {
    // Haversine formula to calculate distance between two points
    function calculateDistance(lat1, lon1, lat2, lon2) {
      const R = 6371; // Radius of the Earth in kilometers
      const dLat = (lat2 - lat1) * Math.PI / 180;
      const dLon = (lon2 - lon1) * Math.PI / 180;
      const a = 
        Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
        Math.sin(dLon/2) * Math.sin(dLon/2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
      return R * c;
    }
  
    // Filter stores within the specified radius
    return stores.filter(store => {
      if (!store.address?.latitude || !store.address?.longitude) return false;
      
      const distance = calculateDistance(
        searchLat, 
        searchLon, 
        store.address.latitude, 
        store.address.longitude
      );
      
      return distance <= radiusKm;
    });
  }
  
  // Modify the event listener setup
  document.addEventListener("DOMContentLoaded", function () {
    // ... (previous code remains the same)
  
    const searchInput = document.getElementById("searchLocation");
    if (searchInput) {
      // Change from 'input' to 'change' to reduce unnecessary calls
      searchInput.addEventListener("change", searchLocationOnMap);
    }
  
    // Optional: Add a search button for explicit search
    const searchButton = document.getElementById("searchButton");
    if (searchButton) {
      searchButton.addEventListener("click", searchLocationOnMap);
    }
  });
  
  