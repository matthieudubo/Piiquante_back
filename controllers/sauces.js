const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const fs = require("fs");

const Sauce = require("../models/Sauce");

exports.getSauces = (req, res) => {
  Sauce.find()
    .then((sauces) => res.status(200).json(sauces))
    .catch((error) => res.status(400).json({ error }));
};

exports.getOneSauce = (req, res) => {
  Sauce.findOne({ _id: req.params.id })
    .then((sauce) => res.status(200).json(sauce))
    .catch((error) => res.status(404).json({ error }));
};

exports.createSauce = (req, res) => {
  const sauceObject = JSON.parse(req.body.sauce);
  delete sauceObject._id;
  delete sauceObject.userId;
  const sauce = new Sauce({
    ...sauceObject,
    userId: req.auth.userId,
    imageUrl: `${req.protocol}://${req.get("host")}/images/${
      req.file.filename
    }`,
    likes: 0,
    dislikes: 0,
  });
  sauce
    .save()
    .then(() => res.status(201).json({ message: "Sauce saved" }))
    .catch((error) => res.status(400).json({ message: error }));
};

exports.updateSauce = (req, res) => {
  const sauceObject = req.file
    ? {
        ...JSON.parse(req.body.sauce),
        imageUrl: `${req.protocol}://${req.get("host")}/images/${
          req.file.filename
        }`,
      }
    : { ...req.body };

  delete sauceObject.userId;
  Sauce.findOne({ _id: req.params.id })
    .then((sauce) => {
      if (sauce.userId != req.auth.userId) {
        res.status(401).json({ message: "Non authorized" });
      } else {
        Sauce.updateOne(
          { _id: req.params.id },
          { ...sauceObject, _id: req.params.id }
        )
          .then(() => res.status(201).json({ message: "Sauce modified" }))
          .catch((error) => res.status(401).json({ error }));
      }
    })
    .catch((error) => res.status(400).json({ error }));
};

exports.deleteSauce = (req, res) => {
  Sauce.findOne({ _id: req.params.id }).then((sauce) => {
    if (sauce.userId != req.auth.userId) {
      res.status(401).json({ message: "Non authorized" });
    } else {
      const filename = sauce.imageUrl.split("/images/")[1];
      fs.unlink(`images/${filename}`, () => {
        Sauce.deleteOne({ _id: req.params.id })
          .then(() => res.status(200).json({ message: "Sauce deleted" }))
          .catch((error) => res.status(401).json({ error }));
      });
    }
  });
};

exports.likeSauce = (req, res) => {
  const { like, userId } = req.body;
  const likesValue = [0, -1, 1];

  if (!likesValue.includes(like))
    return res.status(403).json({ message: "Invalid value" });

  Sauce.findOne({ _id: req.params.id })
    .then((sauce) => updateVote(sauce, like, userId))
    .then((sauce) => res.status(200).json(sauce))
    .catch((error) => res.status(500).json({ error }));
};

const updateVote = (sauce, like, userId, res) => {
  if (like === 1 || like === -1) modifLike(sauce, userId, like);
  if (like === 0) resetVote(sauce, userId);

  return sauce.save();
};

const modifLike = (sauce, userId, like) => {
  const { usersLiked, usersDisliked } = sauce;
  const votersArray = like === 1 ? usersLiked : usersDisliked;

  if (votersArray.includes(userId)) return;

  votersArray.push(userId);

  like === 1
    ? (sauce.likes = usersLiked.length)
    : (sauce.dislikes = usersDisliked.length);
};

const resetVote = (sauce, userId) => {
  const { usersLiked, usersDisliked } = sauce;

  if (usersLiked.includes(userId)) {
    votersArray = usersLiked.filter((id) => id !== userId);
    sauce.usersLiked = votersArray;
    sauce.likes = votersArray.length;
  } else {
    votersArray = usersDisliked.filter((id) => id !== userId);
    sauce.usersDisliked = votersArray;
    sauce.dislikes = votersArray.length;
  }
};
