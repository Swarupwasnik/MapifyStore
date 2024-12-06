function fetchNearbyStores(latitude, longitude, radius) {
    // Get current filter values
    const categorySelect = document.getElementById("category");
    const statusSwitch = document.getElementById("statusSwitch");
    const searchInput = document.getElementById("searchLocation");

    const selectedCategory = categorySelect ? categorySelect.value : "";
    const openStatus = statusSwitch
      ? statusSwitch.checked
        ? "open"
        : "closed"
      : "open";
    const searchText = searchInput
      ? searchInput.value.trim().toLowerCase()
      : "";

    // Construct the fetch URL with all parameters
    const url = new URL(
      `http://localhost:5175/api/v1/stores/nearby?latitude=${latitude}&longitude=${longitude}&radius=${radius}&shop=quickstart-2770d800.myshopify.com`
    );
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
          if (
            !store.address ||
            !store.address.latitude ||
            !store.address.longitude
          ) {
            return false;
          }

          // Category filter
          if (
            selectedCategory &&
            (!store.category || store.category.name !== selectedCategory)
          ) {
            return false;
          }

          // Search text filter
          if (searchText) {
            const searchMatch =
              (store.name && store.name.toLowerCase().includes(searchText)) ||
              (store.address.street &&
                store.address.street.toLowerCase().includes(searchText)) ||
              (store.address.city &&
                store.address.city.toLowerCase().includes(searchText)) ||
              (store.address.state &&
                store.address.state.toLowerCase().includes(searchText));

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
  document
    .getElementById("distanceSlider")
    .addEventListener("input", function () {
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
      const openStatus = statusSwitch
        ? statusSwitch.checked
          ? "open"
          : "closed"
        : "open";

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
  document
    .getElementById("statusSwitch")
    .addEventListener("change", function () {
      const distanceSlider = document.getElementById("distanceSlider");
      const currentDistance = distanceSlider ? distanceSlider.value : 20;

      // Re-fetch nearby stores with current distance and status
      fetchNearbyStores(19.076, 72.8777, currentDistance);
    });

  // Add search input event listener
  document
    .getElementById("searchLocation")
    .addEventListener("input", function () {
      const distanceSlider = document.getElementById("distanceSlider");
      const currentDistance = distanceSlider ? distanceSlider.value : 20;

      // Fetch stores with current distance, category, and search input
      fetchNearbyStores(19.076, 72.8777, currentDistance);
    });