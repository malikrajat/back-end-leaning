const HttpError = require("../models/http-error");
const { validationResult } = require("express-validator");
const getCoordsForAddress = require("../util/location");
const mongoose = require("mongoose");
const Place = require("../models/place");
const User = require("../models/user");

let DUMMY_PLACES = [
  {
    id: "p1",
    title: "Empire State Building",
    description: "One of the most famous sky scrapers in the world!",
    location: {
      lat: 40.7484474,
      lng: -73.9871516
    },
    address: "20 W 34th St, New York, NY 10001",
    creator: "u1"
  }
];

const getPlaceById = async (req, res, next) => {
  const placeId = req.params.pid; // { pid: 'p1' }
  let place;
  try {
    place = await Place.findById(placeId);
  } catch (err) {
    return next(
      new HttpError("something went wrong, could not find place.", 500)
    );
  }
  if (!place) {
    return next(
      new HttpError("Could not find a place for the provided id.", 404)
    );
  }

  res.json({ place: place.toObject({ getters: true }) }); // => { place } => { place: place }
};
const getPlaceByUserId = async (req, res, next) => {
  const userId = req.params.uid;
  // let place;
  try {
    // place = await Place.find({ creator: userId });
    userWithPlaces = await User.findById(userId).populate("Places");
  } catch (err) {
    return next(
      new HttpError("Fetching place is faile, Please try again later.")
    );
  }
  if (!userWithPlaces || userWithPlaces.place.length === 0) {
    return next(
      new HttpError("Could not find a place for the provided userid.", 404)
    );
  }

  res.json({ place: place.map(place => place.toObject({ getters: true })) });
};
const createPlace = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(
      new HttpError("Invalid inputs passed, please check your data.", 422)
    );
  }

  const { title, description, address, creator } = req.body;

  let coordinates;
  try {
    // coordinates = await getCoordsForAddress(address);
    coordinates = {
      lat: 40.7484474,
      lng: -73.9871516
    };
  } catch (error) {
    return next(error);
  }

  // const title = req.body.title;
  const createdPlace = new Place({
    title,
    description,
    address,
    location: coordinates,
    image:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/1/10/Empire_State_Building_%28aerial_view%29.jpg/400px-Empire_State_Building_%28aerial_view%29.jpg",
    creator
  });
  let user;
  try {
    user = await User.findById(creator);
  } catch (error) {
    return next(
      new HttpError("Having issue with searching user with given id.", 500)
    );
  }

  if (!user) {
    return next(new HttpError("Could not find user for provided id ", 404));
  }

  try {
    const sess = await mongoose.startSession();
    sess.startTransaction();
    await createdPlace.save({ session: sess });
    user.places.push(createdPlace);
    await user.save({ session: sess });
    await sess.commitTransaction();
  } catch (err) {
    const error = new HttpError(err, 500);
    return next(error);
  }

  res.status(201).json({ place: createdPlace });
};
const updatePlace = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(
      new HttpError("Invalid inputs passed, please check your data.", 422)
    );
  }

  const { title, description } = req.body;
  const placeId = req.params.pid;
  let place;

  try {
    place = await Place.findById(placeId);
  } catch (err) {
    return next(
      new HttpError("Something went wrong, Could not update place", 500)
    );
  }

  place.title = title;
  place.description = description;
  try {
    await place.save();
  } catch (error) {
    return next(
      new HttpError("Something went wrong, Could not update place", 500)
    );
  }

  res.status(200).json({ place: place.toObject({ getters: true }) });
};
const deletePlace = async (req, res, next) => {
  const placeId = req.params.pid;
  let place;
  try {
    place = await Place.findById(placeId).populate("creator");
  } catch (error) {
    return next(
      new HttpError("Something went wrong, could not delete place ", 500)
    );
  }

  if (!place) {
    return next(new HttpError("Could not find place for this id.", 404));
  }
  try {
    // await Place.remove();
    const sess = await mongoose.startSession();
    sess.startTransaction();
    await place.remove({ session: sess });
    place.creator.places.pull(place);
    await place.creator.save({ session: sess });
    await sess.commitTransaction();
  } catch (error) {
    new HttpError("Something went wrong, could not delete place ", 500);
  }
  res.status(200).json({ message: "Deleted place." });
};

exports.getPlaceById = getPlaceById;
exports.getPlaceByUserId = getPlaceByUserId;
exports.createPlace = createPlace;
exports.updatePlace = updatePlace;
exports.deletePlace = deletePlace;
