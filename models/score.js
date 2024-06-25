const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const ScoreSchema = new Schema({
  name: { type: String, required: true, maxLength: 100 },
  date: { type: Date, required: true },
  time_completed: { type: String, required: true },
  game: { type: Schema.Types.ObjectId, ref: "Game", required: true }
})

module.exports = mongoose.model("Score", ScoreSchema);