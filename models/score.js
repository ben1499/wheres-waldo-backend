const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const timeSchema = new Schema({
  minutes: { type: Number },
  seconds: { type: Number },
  milliseconds: { type: Number },
})

const ScoreSchema = new Schema({
  name: { type: String, required: true, maxLength: 100 },
  date: { type: Date, required: true },
  time_completed: { type: timeSchema, required: true },
  game_id: { type: Schema.Types.ObjectId, ref: "Game", required: true }
})

ScoreSchema.virtual("date_formatted").get(function() {
  const day = String(this.date.getDate()).padStart(2, '0');
  const month = this.date.toLocaleString('en-US', { month: 'short' });
  const year = this.date.getFullYear();

  return `${day} ${month} ${year}`;
})

ScoreSchema.virtual("time_completed_formatted").get(function() {
  return `${this.time_completed.minutes.toString().padStart(2, "0")}:${this.time_completed.seconds.toString().padStart(2, "0")}:${this.time_completed.milliseconds.toString().padStart(3, "0")}`
})

module.exports = mongoose.model("Score", ScoreSchema);