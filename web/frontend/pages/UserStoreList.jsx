import React, { useState, useEffect, useContext } from "react";
import "../styles/App.css";
import homeTrophy from "../assets/home-trophy.png";
import axios from "axios";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
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

const UserStoreList = () => {
  const { settings } = useContext(SettingsContext);
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchLocation, setSearchLocation] = useState("");
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [isOpen, setIsOpen] = useState(null);
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
    } else if (location) {
      url = `http://localhost:5175/api/v1/stores/location?location=${location}`;
    } else if (openStatus !== null) {
      url = `http://localhost:5175/api/v1/stores/status?openStatus=${
        openStatus ? "open" : "closed"
      }`;
      if (limit) {
        url += `&limit=${limit}`;
      }
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
    fetchStores();
    fetchCategories();
  }, []);

  const handleLocationSearch = (e) => {
    e.preventDefault();
    fetchStores(searchLocation, selectedCategory);
  };

  const handleCategoryChange = (e) => {
    setSelectedCategory(e.target.value);
    fetchStores(searchLocation, e.target.value);
  };

  const handleToggle = () => {
    const newStatus = !isOpen;
    setIsOpen(newStatus);
    fetchStores(searchLocation, selectedCategory, newStatus);
  };
  const toggleDrawer = () => {
    setIsDrawerOpen(!isDrawerOpen);
  };
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
    setSelectedStoreLocation({
      lat: parseFloat(store.address.latitude),
      lng: parseFloat(store.address.longitude),
    });
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
              <div className="st-list-btn-setting">
                <button onClick={toggleDrawer}>
                  {isDrawerOpen ? "Close Settings" : "Open Settings"}
                </button>
                {isDrawerOpen && (
                  <SettingsDrawer
                    isOpen={isDrawerOpen}
                    toggleDrawer={toggleDrawer}
                  />
                )}
              </div>
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

          <div className="store-list-map">
            <SettingsDrawer onLimitChange={setStoreLimit} />

            <div className="store-list">
              {stores.map((store, index) => (
                <div
                  key={index}
                  className="store-card"
                  onMouseEnter={() => setSelectedStoreId(store._id)}
                  onMouseLeave={() => setSelectedStoreId(null)}
                >
                  <h2 className="number-shop">Store Number :{index + 1}</h2>
                  <div className="list-store-main">
                    <div className="store-image">
                      <img src={homeTrophy} alt="Store logo" />
                    </div>
                    <div className="store-deatils">
                      <h3>{store.company}</h3>
                      <p>
                        {store.address.street}, {store.address.city} ,{" "}
                        {store.address.state} , {store.address.postalCode}
                      </p>
                      <p>
                        {store.phone.countryCode} {store.phone.number}
                      </p>
                      <p>{store.email}</p>
                      <p>{store.hours}</p>
                    </div>
                  </div>
                  <div className="deatis-btn-main">
                    <button
                      className="st-list-button st-list-button-active"
                      onClick={() => printStoreDetails(store)}
                    >
                      Print
                    </button>
                    <button
                      className="st-list-button"
                      onClick={() => handleDirectionClick(store)}
                    >
                      Direction
                    </button>
                    <button className="st-list-button">
                      <a
                        href={store.websiteURL}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Website
                      </a>
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <div className="store-list-placeholder">
              <MapContainer
                center={
                  selectedStoreLocation
                    ? selectedStoreLocation
                    : { lat: 20.5937, lng: 78.9629 }
                }
                zoom={5}
                style={{
                  height: "400px",
                  width: "100%",
                  backgroundColor: settings.mapColor,
                }}
              >
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                />

                {stores.map((store) => (
                  <Marker
                    className={selectedStoreId === store._id ? "bounce" : ""}
                    key={store._id}
                    icon={customIcon}
                    position={[
                      parseFloat(store.address.latitude),
                      parseFloat(store.address.longitude),
                    ]}
                  >
                    <Popup>
                      <strong>{store.name}</strong>
                      <br />
                      {store.address.street}, {store.address.city}
                      <br />
                      {store.address.state}, {store.address.country}
                      <br />
                      <a
                        href={store.websiteURL}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Website
                      </a>
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
