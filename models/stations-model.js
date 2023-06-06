const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const stationsSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, "Station name required"],
    },
    url_resolved: {
      type: String,
      required: [true, "url required"],
      unique: true,
    },
    country: {
      type: String,
      required: [true, "Country required"],
    },
    countryCode: {
      type: String,
      required: [true, "CountryCode required"],
      maxLength: [2, "Country code cannot exceed 2 characters"],
      uppercase: true,
    },
    homepage: String,
    favicon: String,
    state: String,
    language: String,
    languageCode: String,
    tags: String,
    codec: String,
    bitrate: Number,
  },
  { timestamps: true }
);

const Station = mongoose.model("Station", stationsSchema);

module.exports = Station;
