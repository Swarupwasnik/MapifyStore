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
            // Store the category-filtered stores globally
            allStores = data;
            // Apply additional filters after category selection
            applyFilters();
        })
        .catch((error) =>
            console.error("Error fetching stores by category:", error)
        );
}

function applyFilters() {
    const searchInput = document.getElementById("searchLocation");
    const categorySelect = document.getElementById("category");

    if (!searchInput || !categorySelect) {
        console.error("Search input or category select element not found.");
        return;
    }

    const searchText = searchInput.value.toLowerCase();
    const selectedCategory = categorySelect.value;

    // Start with all stores or previously filtered stores by category
    let filteredStores = allStores;

    // Apply location search filter
    if (searchText) {
        filteredStores = filteredStores.filter((store) => {
            return (
                store.name.toLowerCase().includes(searchText) ||
                store.address.street.toLowerCase().includes(searchText) ||
                store.address.city.toLowerCase().includes(searchText) ||
                store.address.state.toLowerCase().includes(searchText)
            );
        });
    }

    // Populate and plot filtered stores
    populateStoreList(filteredStores);
    plotStoresOnMap(filteredStores);
}

// Modify the event listeners to trigger applyFilters
document.addEventListener("DOMContentLoaded", function () {
    // Existing code...

    // Add event listener for search input
    const searchInput = document.getElementById("searchLocation");
    searchInput.addEventListener("input", applyFilters);

    // Modify category select event listener
    const categorySelect = document.getElementById("category");
    categorySelect.addEventListener("change", () => {
        const selectedCategory = categorySelect.value;
        console.log(`Selected Category Name: ${selectedCategory}`);
        
        if (selectedCategory) {
            // Fetch stores by category and then apply filters
            fetchStoresByCategory(selectedCategory);
        } else {
            // Reset to all stores and apply filters
            fetchStores();
        }
    });
});
