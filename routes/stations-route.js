const express = require("express");
const router = express.Router();
const Station = require("../models/stations-model");

//get stations
router.get("/", async (req, res) => {
  const { page, limit, countryCode } = req.query;

  try {
    const stations = await Station.find({ countryCode });
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const totalStation = stations.length;
    const totalPages = Math.ceil(totalStation / limit);
    const paginatedStations = stations.slice(startIndex, endIndex);

    if (stations) {
      res.status(200).json({
        stations: paginatedStations,
        currentPage: Number(page),
        totalPages,
        totalStation,
      });
    } else {
      throw "Internal server error";
    }
  } catch (error) {
    res.status(500).json({ error });
  }
});

//add stations
router.post("/", async (req, res) => {
  const {
    name,
    url_resolved,
    country,
    state,
    countryCode,
    favicon,
    homepage,
    language,
    languageCode,
  } = req.body;
  try {
    const newStation = await Station.create({
      name,
      country,
      favicon,
      countryCode,
      state,
      homepage,
      url_resolved,
      language,
      languageCode,
    });

    const station = await newStation.save();
    if (station) {
      res.status(201).json({ message: "new station added" });
    }
  } catch (error) {
    res.status(500).json({ error, message: "new station added" });
  }
});

module.exports = router;
