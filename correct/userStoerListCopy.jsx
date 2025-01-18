import React, { useState, useEffect, useContext } from "react";
import "../styles/App.css";
import homeTrophy from "../assets/home-trophy.png";
import axios from "axios";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import "../styles/bounce.css";
import SettingsDrawer from "./SettingsDrawer";
import { SettingsContext } from "../context/SettingsContext";
const customIcon = new L.Icon({
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.3.4/images/marker-icon.png",
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.3.4/images/marker-icon-2x.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.3.4/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});
const CenterMapOnStore = ({ position }) => {
  const map = useMap();
  useEffect(() => {
    if (position) {
      map.setView(position, 15);
    }
  }, [position, map]);
  return null;
};
const UserStoreList = () => {
  const { settings } = useContext(SettingsContext);
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchLocation, setSearchLocation] = useState("");
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [isOpen, setIsOpen] = useState(true);
  const [selectedStoreId, setSelectedStoreId] = useState(null);
  const [selectedStoreLocation, setSelectedStoreLocation] = useState(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [storeLimit, setStoreLimit] = useState(1);

  const fetchStores = (
    location = "",
    category = "",
    openStatus = null,
    limit = 1
  ) => {
    setLoading(true);
    let url = "http://localhost:5175/api/v1/stores/published";
    if (category) {
      url = `http://localhost:5175/api/v1/stores/category?category=${category}`;
    }
    if (location) {
      url = `http://localhost:5175/api/v1/stores/location?location=${location}`;
    }
    if (openStatus !== null) {
      url = `http://localhost:5175/api/v1/stores/status?openStatus=${
        openStatus ? "open" : "closed"
      }`;
    }
  
    if (limit) {
      url += `&limit=${limit}`;
    }
  
    axios
      .get(url)
      .then((response) => {
        setStores(response.data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
        setLoading(false);
      });
  };
  

 
  

  const fetchCategories = () => {
    axios
      .get("http://localhost:5175/api/v1/category/getcategory")
      .then((response) => {
        setCategories(response.data);
      })
      .catch((error) => {
        console.error("Error fetching categories:", error);
      });
  };

  useEffect(() => {
    if (selectedCategory) {
      fetchStores(selectedCategory, isOpen);
    }
  }, [selectedCategory, isOpen]);

  useEffect(() => {
    // Fetch only open stores when the component first loads
    fetchStores("", "", true); // Pass true to fetch only open stores
    fetchCategories();
  }, []);
  // useEffect(() => {
  //   fetchStores();
  //   fetchCategories();
  // }, []);
  //
  const handleLocationSearch = (e) => {
    e.preventDefault();
    fetchStores(searchLocation, selectedCategory);
  };
  
 
  
  // const handleCategoryChange = (e) => {
  //   setSelectedCategory(e.target.value);
  //   fetchStores(searchLocation, e.target.value);
  // };
  const handleCategoryChange = (e) => {
    const category = e.target.value;
    setSelectedCategory(category);
  
    // Fetch stores with selected category, maintaining location and open status
    fetchStores(searchLocation, category, isOpen);
  };
  

  const handleToggle = () => {
    const newStatus = !isOpen;
    setIsOpen(newStatus);
    fetchStores(searchLocation, selectedCategory, newStatus);
  };
  useEffect(() => {
    fetchStores(selectedCategory, isOpen,searchLocation);
  }, [searchLocation, selectedCategory, isOpen]);

  const printStoreDetails = (store) => {
    const printWindow = window.open("", "_blank", "width=800,height=600");

    printWindow.document.write(`
      <html>
        <head>
          <title>Store Details</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            h1 { color: #333; }
            p { color: #666; }
            .store-card { margin-bottom: 20px; }
            .store-image img { width: 100px; }
            .store-details { margin-left: 120px; }
            .store-details h3 { margin: 0; }
            .store-details p { margin: 5px 0; }
          </style>
        </head>
        <body>
          <h1>${store.company} - Store Details</h1>
          <div class="store-card">
            <div class="store-image">
              <img src="${homeTrophy}" alt="Store logo" />
            </div>
            <div class="store-details">
              <h3>${store.company}</h3>
              <p>${store.address.street}, ${store.address.city}, ${store.address.state}, ${store.address.postalCode}</p>
              <p>${store.phone.countryCode} ${store.phone.number}</p>
              <p>${store.email}</p>
              <p>Hours: ${store.hours}</p>
            </div>
          </div>
          <script>
            window.print();
            window.onafterprint = window.close;
          </script>
        </body>
      </html>
    `);

    printWindow.document.close();
  };
  const handleDirectionClick = (store) => {
    const position = {
      lat: parseFloat(store.address.latitude),
      lng: parseFloat(store.address.longitude),
    };
    setSelectedStoreLocation(position);
    setSelectedStoreId(store._id);
    const map = useMap();
    if (map) {
      map.setView(position, 15); // Center the map
      const marker = L.marker(position, { icon: customIcon });
      marker
        .addTo(map)
        .bindPopup(`<strong>${store.company}</strong>`)
        .openPopup();
    }
  };
  if (loading) return <p>Loading data...</p>;

  return (
    <div class="store-list-wrap">
      <div class="container">
        <div className="store-list-container cd-store-locator">
          <div className="store-list-main">
            <div className="sl-store-left">
              <h2>Store List</h2>
            </div>

            <div className="sl-store-right">
              {/* <div className="st-list-btn-setting">
                <button onClick={toggleDrawer}>
                  {isDrawerOpen ? "Close Settings" : "Open Settings"}
                </button>
                {isDrawerOpen && (
                  <SettingsDrawer
                    isOpen={isDrawerOpen}
                    toggleDrawer={toggleDrawer}
                  />
                )}
              </div> */}
            </div>
          </div>
          <div className="store-search">
            <div>
              <form onSubmit={handleLocationSearch}>
                <label>Search Location</label>

                <input
                  type="text"
                  value={searchLocation}
                  onChange={(e) => setSearchLocation(e.target.value)}
                  placeholder="Search by location"
                />
              </form>
            </div>
            <div>
              <label>Category</label>
              <select value={selectedCategory} onChange={handleCategoryChange}>
                <option value="">Select Category</option>
                {categories.map((category) => (
                  <option key={category._id} value={category.name}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="slider-container distnace-flex">
              <div>
                <label>Distance Range</label>
                <input type="range" min="10" max="80" />
              </div>
              <div>
                <span>10km - 80km</span>
              </div>
            </div>
            <div className="store-list-container">
              <div className="status-toggle">
                <label className={!isOpen ? "active" : ""}>Closed</label>
                <div className="list-toggle-switch" onClick={handleToggle}>
                  <div
                    className={`list-toggle-circle ${
                      isOpen ? "open" : "close"
                    }`}
                  ></div>
                </div>
                <label className={isOpen ? "active" : ""}>Open</label>
              </div>
            </div>
          </div>
          {/* <p>Total Stores: {stores.length}</p> */}
          <div
            style={{
              backgroundColor: "#f0f0f0",
              textAlign: "center",
              padding: "10px",
              margin: "10px 0",
              borderRadius: "5px",
              width: "600px",
            }}
          >
            <p style={{ margin: 0, fontSize: "16px", fontWeight: "bold" }}>
              Total Stores: {stores.length}
            </p>
          </div>

          <div className="store-list-map">
            <SettingsDrawer onLimitChange={setStoreLimit} />

            <div className="store-list">
              {stores.map((store, index) => {
                const today = new Date().toLocaleDateString("en-US", {
                  weekday: "long",
                });
                const todayWorkingHours = store.workingHours.find(
                  (hours) => hours.day === today
                );
                const categoryName = store.category
                  ? store.category.name
                  : "N/A";
                return (
                  <div className="store-card" key={store._id}>
                    <h2 className="number-shop">Number of Shop {index + 1}</h2>
                    <div className="list-store-main">
                      <div className="store-image">
                        <img
                          src="https://i.pinimg.com/736x/f0/4b/5c/f04b5cc081eb5ea9e561cd62cac260b0.jpg"
                          alt="Store logo"
                        />
                      </div>
                      <div className="store-deatils">
                        <h2>{store.company}</h2>
                        <h3>{store.name}</h3>
                        <p>
                          📍 {store.address.street}, {store.address.city},
                          {store.address.state}, {store.address.postalCode},
                          {store.address.country}
                        </p>
                        <p>
                          📞 {store.phone.countryCode} {store.phone.number}
                        </p>
                        <p> ✉️ {store.email}</p>
                        <div className="map-popup-box-info">
                          🏷️ Category: {categoryName}
                        </div>
                        <p>
                          Working Hours:{" "}
                          {todayWorkingHours
                            ? `${todayWorkingHours.start} - ${todayWorkingHours.end}`
                            : "Not Available"}
                        </p>
                      </div>
                    </div>
                    <div className="deatis-btn-main">
                      <button
                        className="st-list-button st-list-button-active"
                        onClick={() => handleDirectionClick(store)}
                      >
                        Direction
                      </button>
                      <button
                        className="st-list-button"
                        onClick={() => window.open(store.websiteURL, "_blank")}
                      >
                        Website
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="store-list-placeholder">
              <MapContainer
                center={{ lat: 20.5937, lng: 78.9629 }}
                zoom={5}
                style={{ height: "400px", width: "100%" }}
              >
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                />
                <CenterMapOnStore position={selectedStoreLocation} />
                {stores.map((store) => (
                  <Marker
                    key={store._id}
                    position={[
                      parseFloat(store.address.latitude),
                      parseFloat(store.address.longitude),
                    ]}
                    icon={
                      selectedStoreId === store._id ? customIcon : customIcon
                    }
                  >
                    <Popup>
                      <strong>{store.company}</strong>
                      <br />
                      {store.address.street}, {store.address.city}
                    </Popup>
                  </Marker>
                ))}
              </MapContainer>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserStoreList;
