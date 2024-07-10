const asyncHandler = require("express-async-handler");
const { body, validationResult } = require("express-validator");
const Score = require("../models/score");
const Game = require("../models/game");
const { DateTime } = require("luxon");

let gameStartTime = null;
let gameEndTime = null;
let time_completed = null;

exports.start_game = (req, res, next) => {
  gameStartTime = new Date();

  res.status(200).json({ message: "Game started" })
}

exports.end_game  = (req, res, next) => {

  gameEndTime = new Date();
  const startDate = DateTime.fromJSDate(gameStartTime);
  const endDate = DateTime.fromJSDate(gameEndTime);

  const duration = endDate.diff(startDate);

  time_completed =  duration.shiftTo("minutes", "seconds", "milliseconds").toObject();

  res.status(200).json({ time_completed })

  // gameStartTime = null;
  // gameEndTime = null;
}

exports.score_create = [
  body("name")
  .trim()
  .isLength({ min: 1 })
  .escape()
  .withMessage("Name must be specified"),
  body("game")
  .trim()
  .isLength({ min: 1 })
  .escape()
  .withMessage("Game must be specified"),
  body("time_completed")
  .exists()
  .withMessage("Time completed object is required"),
  
  asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() })
    } else {
      const game = await Game.findOne({ name: req.body.game }).exec();

      if (!game) {
        return res.status(404).json({ message: "Game not found" })
      }

      const score = new Score({
        name: req.body.name,
        game_id: game.id,
        date: new Date(),
        time_completed: req.body.time_completed
      })

      await score.save();

      return res.status(200).json({ message: "Score saved successfully" });
    }
  })
]

exports.scores_get = asyncHandler(async (req, res, next) => {
  if (req.query.game) {
    const { game: game_name } = req.query;

    const game = await Game.findOne({ name: game_name }, "name").exec();

    if (!game) {
      return res.status(404).json({ message: "Game not found" });
    }

    let gameScores = await Score.find({ game_id: game.id }).sort({ time_completed: 1 }).exec();

    gameScores = gameScores.map((score) => {
      return {
        ...score.toObject(),
        date_formatted: score.date_formatted,
        time_completed_formatted: score.time_completed_formatted
      }
    })

    return res.status(200).json({ data: gameScores });
  }
  return res.status(400).json({ message: "Invalid query parameters" });
})

exports.verify_selection = asyncHandler(async(req, res, next) => {
  if (req.query.character && req.query.coordinates.length && req.query.game) {
    let { character, coordinates, game: game_name } = req.query;

    coordinates = coordinates.map((item) => +item);

    const game = await Game.findOne({ name: game_name }).exec();

    if (!game)
      return res.status(404).json({ message: "Game not found" });

    const matchCharacter = game.characters.find((char) => char.name === character);

    if (!matchCharacter) 
      return res.status(404).json({ message: "Character not found" });

    if (
      coordinates[0] > matchCharacter.coordinates[0] - 15 && 
      coordinates[0] < matchCharacter.coordinates[0] + 15
    ) {
        if (
          coordinates[1] > matchCharacter.coordinates[1] - 15 && 
          coordinates[1] < matchCharacter.coordinates[1] + 15
        ) {
          return res.status(200).json({ message: `You found ${character}!` });
        }
    }

    return res.status(404).json({ message: `That's not ${character}. Try again!` });
    
  } else {
    return res.status(400).json({message: "Query parameters missing"});
  }
})