import mongoose from "mongoose";
import Location from "./LocationModel.js";
const StoreSchema = new mongoose.Schema(
  {
    company: { type: String, required: true },
    name: { type: String, required: true },
    websiteURL: { type: String },
    fax: { type: String },
    email: { type: String, required: true, unique: true },
    phone: {
      countryCode: { type: String, required: true },
      number: { type: String, required: true },
    },

    category: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "Category",
    },
    address: {
      street: { type: String, required: true },
      city: { type: String, required: true },
      state: { type: String, required: true },
      postalCode: { type: String, required: true },
      country: { type: String, required: true },

      latitude: { type: Number },
      longitude: { type: Number },
    },
    location: { type: Location.schema, required: false },
    workingHours: {
      type: [
        {
          day: { type: String, required: true },
          isOpen: { type: Boolean, required: true },
          start: {
            type: String,
            required: function () {
              return this.isOpen;
            },
          },
          end: {
            type: String,
            required: function () {
              return this.isOpen;
            },
          },
          customTimes: [
            {
              date: { type: Date },
              start: { type: String },
              end: { type: String },
            },
          ],
        },
      ],
      validate: {
        validator: function (value) {
          return value.length === 7;
        },
        message: "Working hours must be set for exactly 7 days.",
      },
    },
    additional: { type: String },
    agreeToTerms: { type: Boolean, required: true },
    published: { type: Boolean, default: false },
  },
  { timestamps: true }
);
StoreSchema.index({ location: "2dsphere" });
StoreSchema.methods.isStoreOpen = function () {
  if (!this.workingHours || !Array.isArray(this.workingHours)) {
    return false;
  }

  const today = new Date();
  const dayName = today.toLocaleString("en-US", { weekday: "long" });
  const todayHours = this.workingHours.find(
    (day) =>
      day &&
      typeof day.day === "string" &&
      day.day.toLowerCase() === dayName.toLowerCase()
  );

  if (!todayHours || !todayHours.isOpen) {
    return false;
  }

  const customTime = todayHours.customTimes.find(
    (custom) =>
      custom.date && custom.date.toDateString() === today.toDateString()
  );
  const openTime = customTime ? customTime.start : todayHours.start;
  const closeTime = customTime ? customTime.end : todayHours.end;

  const currentTime = today.toTimeString().slice(0, 5);
  return currentTime >= openTime && currentTime <= closeTime;
};

const Store = mongoose.models.Store || mongoose.model("Store", StoreSchema);
export default Store;
