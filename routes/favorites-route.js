const express = require("express");
const router = express.Router();
const reqAuthorization = require("../middleware/reqAuthorization");
const User = require("../models/user-model");

router.use(reqAuthorization);

//get favorite
router.get("/", async (req, res) => {
  const userId = req.userId;
  try {
    const user = await User.findById(userId);
    if (user) {
      res.status(200).json({ favorites: user.favorites });
    } else {
      res.status(404).json({ error: "User not found" });
    }
  } catch (error) {
    res.status(500).json({ error, message: "internal server error" });
  }
});

//add to favorite end-point
router.put("/", async (req, res) => {
  const userId = req.userId;
  const newFavorite = req.body;
  const newFavoriteId = newFavorite.id;

  try {
    const user = await User.findOne({
      _id: userId,
      "favorites.id": newFavoriteId,
    });
    if (user) {
      res.status(404).json({ error: "Station already exist in favorites" });
    } else {
      const result = await User.updateOne(
        { _id: userId },
        {
          $push: { favorites: newFavorite },
        }
      );

      if (result.modifiedCount) {
        res.status(200).json({ message: "Station added to favorites" });
      }
    }
  } catch (error) {
    res.status(500).json({ error, message: "internal server error" });
  }
});

//remove from favorite end-point
router.delete("/:favoriteId", async (req, res) => {
  const userId = req.userId;
  const { favoriteId } = req.params;
  try {
    const user = await User.findOne({
      _id: userId,
      "favorites.id": favoriteId,
    });
    if (!user) {
      res.status(404).json({ error: "Item not found in favorites" });
    } else {
      const result = await User.updateOne(
        { _id: userId },
        { $pull: { favorites: { id: favoriteId } } }
      );
      if (result.modifiedCount)
        res.status(200).json({ message: "station deleted from favorites" });
    }
  } catch (error) {
    res.status(500).json({ error, message: "internal server error" });
  }
});

module.exports = router;
