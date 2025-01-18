import React, { useState, useEffect, useContext, useRef } from "react";
import "../styles/App.css";
import axios from "axios";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMap,
  useMapEvents,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import "../styles/bounce.css";
// import SettingsDrawer from "./SettingsDrawer";
import { SettingsContext } from "../context/SettingsContext";
import getDistance from "geolib/es/getPreciseDistance";

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

// const getToken = () => {
//   return localStorage.getItem("userToken");
//   console.log("Retrieved Token:", token); // Add this line for debugging
//   return token;
// };
const getToken = () => {
  const token = localStorage.getItem("userToken");
  console.log("Retrieved Token:", token); // Add this line for debugging
  return token;
};

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
  const [mapCenter, setMapCenter] = useState({ lat: 20.5937, lng: 78.9629 });
  const [resetMap, setResetMap] = useState(true);
   const [filteredStores, setFilteredStores] = useState([]);
  const [distance, setDistance] = useState(10);
  const referenceLocation = { latitude: 21.1458, longitude: 79.0882 }; //
 

  const mapRef = useRef(null);
  const defaultMapPosition = { lat: 20.5937, lng: 78.9629 };
  const nagpurCoordinates = { latitude: 21.1458, longitude: 79.0882 };

  const fetchStores = (location = "", category = "", openStatus = null, limit = 1) => {
    setLoading(true);
    let url = "http://localhost:5175/api/v1/stores/me";
  
    const params = [];
  
    if (location) {
      params.push(`city=${location}`);
    }
    if (category) {
      params.push(`category=${category}`);
    }
    if (openStatus !== null) {
      params.push(`status=${openStatus ? "open" : "closed"}`);
    }
    if (limit) {
      params.push(`limit=${limit}`);
    }
  
    if (params.length > 0) {
      url += `?${params.join("&")}`;
    }
  
    const token = getToken();
    console.log("Extracted token:", token); // Debugging line
  
    if (!token) {
      console.error("No token found. User is not authenticated.");
      setLoading(false);
      return; // Exit early if no token
    }
  
    axios
      .get(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((response) => {
        const sortedStores = response.data.sort((a, b) => {
          return new Date(b.createdAt) - new Date(a.createdAt);
        });
        setStores(sortedStores);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
        setLoading(false);
      });
  };
  

  // const fetchStores = (
  //   location = "",
  //   category = "",
  //   openStatus = null,
  //   limit = 1
  // ) => {
  //   setLoading(true);
  //   let url = "http://localhost:5175/api/v1/stores/me";

  //   const params = [];

  //   if (location) {
  //     params.push(`city=${location}`);
  //   }
  //   if (category) {
  //     params.push(`category=${category}`);
  //   }

  //   if (openStatus !== null) {
  //     params.push(`status=${openStatus ? "open" : "closed"}`);
  //   }
  //   if (limit) {
  //     params.push(`limit=${limit}`);
  //   }

  //   if (params.length > 0) {
  //     url += `?${params.join("&")}`;
  //   } else if (location) {
  //     url = `http://localhost:5175/api/v1/stores/me?location=${location}`;
  //   }

  //   const token = getToken();
  //   axios
  //     .get(url, {
  //       headers: {
  //         Authorization: `Bearer ${token}`,
  //       },
  //     })
  //     .then((response) => {
  //       const sortedStores = response.data.sort((a, b) => {
  //         return new Date(b.createdAt) - new Date(a.createdAt);
  //       });
  //       setStores(sortedStores)
  //       // setStores(response.data);
  //       setLoading(false);
  //     })
  //     .catch((error) => {
  //       console.error("Error fetching data:", error);
  //       setLoading(false);
  //     });
  // };

  const fetchCategories = () => {
    axios
      .get("http://localhost:5175/api/v1/category/publishcategory")
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
    fetchStores(searchLocation, selectedCategory, isOpen);
  };

  const handleLocationInputChange = (e) => {
    const value = e.target.value;
    setSearchLocation(value);

    if (value.trim() === "") {
      fetchStores("", selectedCategory, isOpen);
    }
  };
  const handleCategoryChange = (e) => {
    const newCategory = e.target.value;
    setSelectedCategory(newCategory);

    setResetMap(true);

    fetchStores(searchLocation, newCategory, isOpen, storeLimit);
  };

  const handleToggle = () => {
    const newStatus = !isOpen;
    setIsOpen(newStatus);
    fetchStores(searchLocation, selectedCategory, newStatus);
  };
  const toggleDrawer = () => {
    setIsDrawerOpen(!isDrawerOpen);
  };
  useEffect(() => {
    filterStores();
  }, [stores]);
  const handleDirectionClick = (store) => {
    const position = {
      lat: parseFloat(store.address.latitude),
      lng: parseFloat(store.address.longitude),
    };
    setSelectedStoreLocation(position);
    setSelectedStoreId(store._id);

    if (mapRef.current) {
      const map = mapRef.current;
      map.setView(position, 15);
      map.eachLayer((layer) => {
        if (layer instanceof L.Marker) {
          map.removeLayer(layer);
        }
      });

      const today = new Date().toLocaleDateString("en-US", {
        weekday: "long",
      });
      const todayWorkingHours = store.workingHours.find(
        (hours) => hours.day === today
      );
      const workingHoursText = todayWorkingHours
        ? `${todayWorkingHours.start} - ${todayWorkingHours.end}`
        : "Not Available";
      const storeCoordinates = {
        latitude: parseFloat(store.address.latitude),
        longitude: parseFloat(store.address.longitude),
      };
      const distance = getDistance(nagpurCoordinates, storeCoordinates) / 1000; // Distance in km
      const formattedDistance = distance.toFixed(2);
      const categoryName = store.category ? store.category.name : "N/A";
      const marker = L.marker(position, { icon: customIcon }).addTo(map);
      marker
        .addTo(map)
        .bindPopup(
          `<div class="map-popup-box">
            <div class="map-box-icon">
              <img src="https://i.pinimg.com/736x/f0/4b/5c/f04b5cc081eb5ea9e561cd62cac260b0.jpg" alt="Icon"/>
            </div>
            <div class="map-popup-box-content">
              <div class="map-popup-box-title">${store.company}</div>
              <div class="map-popup-box-info">
                📍 ${store.address.street}, ${store.address.city}, ${store.address.state}, ${store.address.country}, ${store.address.postalCode}
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
                <div class="map-popup-box-info">
                    🚏 Distance : ${formattedDistance} km
                </div>
                <div class="map-popup-box-info">
                    Working Hours: ⏳ ${workingHoursText}
                </div>
            </div>
            <div class="map-popup-box-info-buttons">
              <button onclick="window.open('${store.websiteURL}', '_blank')">Website</button>
              <button class="zoom-button" data-lat="${store.address.latitude}" data-lng="${store.address.longitude}">Zoom</button>
            </div>
          </div>`
        )
        .openPopup();
    }
  };
  useEffect(() => {
    const handleZoomButtonClick = (event) => {
      if (event.target.classList.contains("zoom-button")) {
        const lat = parseFloat(event.target.getAttribute("data-lat"));
        const lng = parseFloat(event.target.getAttribute("data-lng"));
        if (mapRef.current) {
          mapRef.current.flyTo([lat, lng], 18, {
            animate: true,
            duration: 2,
          });
        }
      }
    };

    document.addEventListener("click", handleZoomButtonClick);

    return () => {
      document.removeEventListener("click", handleZoomButtonClick);
    };
  }, []);
  const MapReset = () => {
    const map = useMap();
    useEffect(() => {
      if (resetMap) {
        map.setView(defaultMapPosition, 5);
        setResetMap(false);
      } else if (stores && stores.length > 0) {
        const bounds = new L.LatLngBounds(
          stores.map((store) => [
            parseFloat(store.address.latitude),
            parseFloat(store.address.longitude),
          ])
        );
        map.fitBounds(bounds, { padding: [50, 50] });
      }
    }, [stores, map, resetMap]);
    return null;
  };

  const handleDistanceChange = (e) => {
    const newDistance = parseInt(e.target.value, 10);
    setDistance(newDistance);
    console.log(newDistance);
    filterStores();
  };

  const filterStores = () => {
    const filtered = stores.filter((store) => {
      const storeCoordinates = {
        latitude: parseFloat(store.address.latitude),
        longitude: parseFloat(store.address.longitude),
      };
      const storeDistance =
        getDistance(referenceLocation, storeCoordinates) / 1000;
      const today = new Date().toLocaleDateString("en-US", {
        weekday: "long",
      });
      const now = new Date();
      const currentHour = now.getHours();
      const currentMinute = now.getMinutes();
      const currentTimeInMinutes = currentHour * 60 + currentMinute;

      const todayWorkingHours = store.workingHours.find(
        (hours) => hours.day === today
      );
      let isOpenNow = false;
      if (todayWorkingHours) {
        const [startHour, startMinute] = todayWorkingHours.start
          .split(":")
          .map(Number);
        const [endHour, endMinute] = todayWorkingHours.end
          .split(":")
          .map(Number);

        const startTimeInMinutes = startHour * 60 + startMinute;
        const endTimeInMinutes = endHour * 60 + endMinute;

        if (endTimeInMinutes < startTimeInMinutes) {
          // Handle cases where the end time is on the next day
          isOpenNow =
            currentTimeInMinutes >= startTimeInMinutes ||
            currentTimeInMinutes <= endTimeInMinutes;
        } else {
          isOpenNow =
            currentTimeInMinutes >= startTimeInMinutes &&
            currentTimeInMinutes <= endTimeInMinutes;
        }
      }
      return storeDistance <= distance && (isOpen ? isOpenNow : !isOpenNow);
    });
    setFilteredStores(filtered);
  };


  

  useEffect(() => {
    fetchStores();
    fetchCategories();
     filterStores(); // Add this line
  }, []);

  useEffect(() => {
    filterStores();
  }, [distance, isOpen,stores]);

  if (loading) return <p>Loading data...</p>;

  return (
    <div className="store-list-wrap">
      <div className="container">
        <div className="store-list-container cd-store-locator">
          <div className="store-list-main">
            <div className="sl-store-left">
              <h2>Store List</h2>
            </div>

            <div className="sl-store-right">
              <div className="st-list-btn-setting">
                {/* <button onClick={toggleDrawer}>
                  {isDrawerOpen ? "Close Settings" : "Open Settings"}
                </button> */}
                {/* {isDrawerOpen && (
                  <SettingsDrawer
                    isOpen={isDrawerOpen}
                    toggleDrawer={toggleDrawer}
                  />
                )} */}
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
                  onChange={handleLocationInputChange}
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
                <input
                  type="range"
                  min="10"
                  max="1000"
                  step="1"
                  value={distance}
                  onChange={handleDistanceChange}
                />
              </div>
              <div>
                <span>{distance} KM</span>
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
            {/* <SettingsDrawer onLimitChange={setStoreLimit} /> */}

            <div className="store-list">
              {stores.map((store, index) => {
                const today = new Date().toLocaleDateString("en-US", {
                  weekday: "long",
                });
                const now = new Date();
                const currentHour = now.getHours();
                const currentMinute = now.getMinutes();
                const currentTimeInMinutes = currentHour * 60 + currentMinute;

                const todayWorkingHours = store.workingHours.find(
                  (hours) => hours.day === today
                );
                const categoryName = store.category
                  ? store.category.name
                  : "N/A";
                const storeCoordinates = {
                  latitude: parseFloat(store.address.latitude),
                  longitude: parseFloat(store.address.longitude),
                };
                const distance =
                  getDistance(nagpurCoordinates, storeCoordinates) / 1000; // Distance in km
                const formattedDistance = distance.toFixed(2);

                let isOpenNow = false;
                if (todayWorkingHours) {
                  const [startHour, startMinute] = todayWorkingHours.start
                    .split(":")
                    .map(Number);
                  const [endHour, endMinute] = todayWorkingHours.end
                    .split(":")
                    .map(Number);

                  const startTimeInMinutes = startHour * 60 + startMinute;
                  const endTimeInMinutes = endHour * 60 + endMinute;

                  if (endTimeInMinutes < startTimeInMinutes) {
                    // Handle cases where the end time is on the next day
                    isOpenNow =
                      currentTimeInMinutes >= startTimeInMinutes ||
                      currentTimeInMinutes <= endTimeInMinutes;
                  } else {
                    isOpenNow =
                      currentTimeInMinutes >= startTimeInMinutes &&
                      currentTimeInMinutes <= endTimeInMinutes;
                  }
                }

                return (
                  <div className="store-card" key={store._id}>
                    {" "}
                    <div
                      className={`store-status-badge ${
                        isOpenNow ? "open" : "closed"
                      }`}
                    >
                      {isOpenNow ? "Open" : "Closed"}
                    </div>
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
                        <p>🚏 Distance : {formattedDistance} km</p>
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
                center={defaultMapPosition}
                zoom={5}
                style={{ height: "450px", width: "800px" }}
                ref={mapRef}
              >
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                />
                <MapReset />
                <CenterMapOnStore position={selectedStoreLocation} />

                {stores.map((store) => {
                  const today = new Date().toLocaleDateString("en-US", {
                    weekday: "long",
                  });
                  const todayWorkingHours = store.workingHours.find(
                    (hours) => hours.day === today
                  );
                  const workingHoursText = todayWorkingHours
                    ? `${todayWorkingHours.start} - ${todayWorkingHours.end}`
                    : "Not Available";
                  const categoryName = store.category
                    ? store.category.name
                    : "N/A";

                  const storeCoordinates = {
                    latitude: parseFloat(store.address.latitude),
                    longitude: parseFloat(store.address.longitude),
                  };
                  const distance =
                    getDistance(nagpurCoordinates, storeCoordinates) / 1000; // Distance in km
                  const formattedDistance = distance.toFixed(2);
                  return (
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
                        <div className="map-popup-box">
                          <div className="map-box-icon">
                            <img
                              src="https://i.pinimg.com/736x/f0/4b/5c/f04b5cc081eb5ea9e561cd62cac260b0.jpg"
                              alt="Icon"
                            />
                          </div>
                          <div className="map-popup-box-content">
                            <div className="map-popup-box-title">
                              {store.company}
                            </div>
                            <div className="map-popup-box-info">
                              📍 {store.address.street}, {store.address.city},
                              {store.address.state}, {store.address.country},
                              {store.address.postalCode}
                            </div>
                            <div className="map-popup-box-info">
                              📞 {store.phone.countryCode}, {store.phone.number}
                            </div>
                            <div className="map-popup-box-info">
                              ✉️ {store.email}
                            </div>
                            <div className="map-popup-box-info">
                              🏷️ Category: {categoryName}
                            </div>
                            <div class="map-popup-box-info">
                              🚏 Distance: {formattedDistance} km
                            </div>
                            <div className="map-popup-box-info">
                              Working Hours: ⏳ {workingHoursText}
                            </div>
                          </div>
                          <div className="map-popup-box-info-buttons">
                            <button
                              onClick={() =>
                                window.open(store.websiteURL, "_blank")
                              }
                            >
                              Website
                            </button>
                            <button
                              className="zoom-button"
                              data-lat={store.address.latitude}
                              data-lng={store.address.longitude}
                            >
                              Zoom
                            </button>
                          </div>
                        </div>
                      </Popup>
                    </Marker>
                  );
                })}
              </MapContainer>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserStoreList;
