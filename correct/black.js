export const searchStoresByStatus = async (req, res) => {
  try {
    const { openStatus } = req.query;

    // Check for valid openStatus input
    if (!openStatus || (openStatus !== "open" && openStatus !== "close")) {
      return res
        .status(400)
        .json({ error: "Invalid openStatus. Use 'open' or 'close'." });
    }

    // Fetch only published stores and categories
    const stores = await Store.find({ published: true })
      .populate({
        path: "category",
        match: { published: true }, // Ensure only published categories are included
        select: "name",
      })
      .exec();

    // Filter stores to exclude those with no category (due to unpublished categories)
    const validStores = stores.filter((store) => store.category);

    // Further filter based on openStatus
    const filteredStores = validStores.filter((store) =>
      openStatus === "open" ? store.isStoreOpen() : !store.isStoreOpen()
    );

    // If no stores match, return a 404 response
    if (filteredStores.length === 0) {
      return res
        .status(404)
        .json({ error: "No stores found with the specified open status" });
    }

    // Return the filtered stores
    res.json(filteredStores);
  } catch (error) {
    console.error("Error in searchStoresByStatus:", error);
    res.status(500).json({ error: error.message });
  }
};

export const getStoresByStatus = async (req, res) => {
  try {
    const { status } = req.query;

    if (!status || (status !== "open" && status !== "close")) {
      return res
        .status(400)
        .json({ error: "Invalid status. Use 'open' or 'close'." });
    }

    const currentTime = moment();

    // Fetch stores that are published and have published categories
    const stores = await Store.find({ published: true })
      .populate({
        path: "category",
        match: { published: true }, // Only include published categories
        select: "name",
      })
      .lean();

    // Filter out stores that do not have a published category
    const filteredStores = stores.filter((store) => store.category !== null);

    // Further filter based on open/close status
    const finalStores = filteredStores.filter((store) => {
      const { openTime, closeTime } = store.workingHours;
      const storeOpenTime = moment(openTime, "HH:mm");
      const storeCloseTime = moment(closeTime, "HH:mm");

      const isOpen = currentTime.isBetween(storeOpenTime, storeCloseTime);

      return status === "open" ? isOpen : !isOpen;
    });

    res.status(200).json({ status, stores: finalStores });
  } catch (error) {
    console.error("Error fetching store list:", error);
    res
      .status(500)
      .json({ error: "Error fetching store list", details: error.message });
  }
};