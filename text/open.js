  document.getElementById("statusSwitch").addEventListener("change", function () {
    const openStatus = this.checked ? "open" : "close";
    const statusLabel = document.getElementById("statusLabel");
    statusLabel.textContent = openStatus.charAt(0).toUpperCase() + openStatus.slice(1);
    console.log("Switch toggled, status:", openStatus);
    fetchStoresByStatus(openStatus);
  });
  
  function fetchStoresByStatus(openStatus) {
    if (isFetching) return;
    isFetching = true;
  
    console.log("Fetching stores with status:", openStatus);
  
    fetch(`http://localhost:5175/api/v1/stores/status?openStatus=${openStatus}&shop=quickstart-2770d800.myshopify.com`)
      .then((response) => {
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        return response.json();
      })
      .then((data) => {
        console.log(`Stores with status ${openStatus}:`, data);
        if (!data.stores || data.stores.length === 0) {
          console.warn(`No stores found with the specified ${openStatus} status`);
        }
        allStores = data.stores;
        console.log("Updated store list:", allStores);
        populateStoreList(data);
        plotStoresOnMap(data);
      })
      .catch((error) => {
        console.error("Error fetching stores by status:", error);
      })
      .finally(() => {
        isFetching = false;
      });
  }