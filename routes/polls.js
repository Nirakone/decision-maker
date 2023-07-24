const express = require('express');
const router = express.Router();
const db = require('../db/connection');

router.post('/create-poll', (req, res) => {

  const queryOne = `INSERT INTO users (email) VALUES ( $1 ) RETURNING id`;

  const valuesOne = [req.body.email];

  console.log(req.body);

  db.query(queryOne, valuesOne)
    .then(data => {
      let user_id = data.rows[0].id;
      const queryTwo = `INSERT INTO polls (title, question, link, users_id) VALUES ( $1, $2, $3, $4 ) RETURNING id`;

      const valuesTwo = [req.body.title, req.body.question, req.body.link, user_id];

      db.query(queryTwo, valuesTwo)
        .then(data => {
          let optionsArray = req.body.options;
          let poll_id = data.rows[0].id;

          for (let i = 0; i < optionsArray.length; i++) {
            const queryThree = `INSERT INTO choices (polls_id, polls_options) VALUES ( $1, $2 )`;

            const valuesThree = [poll_id, optionsArray[i]];

            db.query(queryThree, valuesThree)
              .then(data => {
                if (data) {
                  return "Inserted Successfully";
                }
              })
              .catch(err => {
                res
                  .status(500)
                  .json({ error: err.message });
              });
          }
        })
        .catch(err => {
          res
            .status(500)
            .json({ error: err.message });
        });
    })
    .catch(err => {
      res
        .status(500)
        .json({ error: err.message });
    });
});

router.get('/create-poll', (req, res) => {
  console.log('Received GET request to /food');
  res.send('Hello from /food route!');
});

module.exports = router;

