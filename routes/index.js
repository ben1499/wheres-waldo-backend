const express = require('express');
const router = express.Router();

const game_controller = require("../controllers/gameController");

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: "Where's Waldo Backend" });
});

router.get("/start-game", game_controller.start_game);

router.get("/end-game", game_controller.end_game);

router.post("/scores", game_controller.score_create);

router.get("/scores", game_controller.scores_get);

router.get("/verify", game_controller.verify_selection);


module.exports = router;
