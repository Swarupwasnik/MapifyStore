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
  let routingControl = null;

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
      .then((response) => response.json())
      .then((data) => {
        console.log(`Fetched Nearby Stores within ${radius} km:`, data);
        populateStoreList(data);
        plotStoresOnMap(data);
      })
      .catch((error) => console.error("Error fetching nearby stores:", error));
  }

  function openRouteModal(store) {
    const routeModal = document.getElementById("routeModal");
    const endLocationInput = document.getElementById("endLocation");

    endLocationInput.value = `${store.address.street}, ${store.address.city}, ${store.address.state}`;
    routeModal.style.display = "block";
  }

  document
    .getElementById("cancelRouteBtn")
    .addEventListener("click", function () {
      document.getElementById("routeModal").style.display = "none";
    });

  document
    .getElementById("routeForm")
    .addEventListener("submit", async function (event) {
      event.preventDefault();

      const startLocation = document.getElementById("startLocation").value;
      const endLocation = document.getElementById("endLocation").value;

      if (routingControl) {
        map.removeControl(routingControl);
      }

      try {
        const startCoords = await geocodeLocation(startLocation);
        const endCoords = await geocodeLocation(endLocation);

        const response = await fetch(
          "http://localhost:5175/api/v1/stores/waypoints?shop=quickstart-2770d800.myshopify.com",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ locations: [startCoords, endCoords] }),
          }
        );
        if (!response.ok) {
          throw new Error(await response.text());
        }

        const data = await response.json();
        const waypoints = data.waypoints.map((wp) =>
          L.latLng(wp.latitude, wp.longitude)
        );

        routingControl = L.Routing.control({
          waypoints: waypoints,
          draggableWaypoints: false,
          routeWhileDragging: true,
        }).addTo(map);

        document.getElementById("routeModal").style.display = "none";
        map.fitBounds(routingControl.getBounds());
      } catch (error) {
        console.error("Routing error:", error);
        alert("Could not find route. Please check your locations.");
      }
    });

  async function geocodeLocation(location) {
    // Replace this with your geocoding logic (e.g., Google Maps API, OpenStreetMap Nominatim, etc.)
    console.log(`Geocoding location: ${location}`);
    // Placeholder for actual geocoded data:
    return { lat: 19.076, lng: 72.8777 };
  }

  function populateStoreList(data) {
    const storeList = document.querySelector("#storeList");
    if (!storeList) {
      console.error("Store list container not found.");
      return;
    }

    storeList.innerHTML = "";
    data.forEach((store, index) => {
      const storeCard = document.createElement("li");
      storeCard.classList.add("store-card");
      storeCard.innerHTML = `
        <div>
          <h2>${store.name}</h2>
          <p>${store.address.street}, ${store.address.city}, ${store.address.state}</p>
          <button class="direction-btn">Direction</button>
        </div>`;
      storeCard.querySelector(".direction-btn").addEventListener("click", () => {
        openRouteModal(store);
      });
      storeList.appendChild(storeCard);
    });
  }

  function fetchCategories() {
    // Fetch and populate categories logic...
  }

  function fetchStores() {
    fetch(
      "http://localhost:5175/api/v1/stores/published?shop=quickstart-2770d800.myshopify.com"
    )
      .then((response) => response.json())
      .then((data) => {
        allStores = data;
        populateStoreList(data);
        plotStoresOnMap(data);
      })
      .catch((error) => console.error("Error fetching stores:", error));
  }

  function plotStoresOnMap(stores) {
    // Plotting stores on the map...
  }
});
