const express = require('express');
const router = express.Router();
const db = require('../db/connection');

router.post('/create-poll', (req, res) => {
  // const baseUrl = 'http://localhost:3000/'
  const queryOne = `INSERT INTO users (email) VALUES ( $1 ) RETURNING id`;

  const valuesOne = [req.body.email];

  db.query(queryOne, valuesOne)
    .then(data => {
      let user_id = data.rows[0].id;
      const generateUrl = generateRandomString();

      console.log(generateUrl);

      const queryTwo = `INSERT INTO polls (title, question, link, users_id) VALUES ( $1, $2, $3, $4 ) RETURNING id`;

      const valuesTwo = [req.body.title, req.body.question, generateUrl, user_id];

      db.query(queryTwo, valuesTwo)
        .then(data => {
          let optionsArray = ["Dog", "Cat", "Monkey"];
          // let optionsArray = req.body.options;
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

router.get("/:id", (req, res) => {
  const pollUrlId = req.params.id;

  const queryString = `
  SELECT * FROM polls
  WHERE polls.link = $1;
  `;
  const values = [pollUrlId];

  db.query(queryString, values)
    .then((data) => {
      console.log(data.rows[0]);
      // return Promise.resolve(result.rows[0]);

      const queryStringFour = `
  SELECT * FROM choices
  WHERE polls_id = $1;
  `;

      const values = [data.rows[0].id];

      db.query(queryStringFour, values)
        .then((data) => {
          console.log(data.rows);
          // return Promise.resolve(result.rows[0]);
        })
        .catch((err) => {
          console.log(err.message);
        });

    })
    .catch((err) => {
      console.log(err.message);
    });
});

router.post('/post-answer', (req, res) => {
  const queryOne = `INSERT INTO answers (email) VALUES ( $1 ) RETURNING id`;

  const valuesOne = [req.body.polls_id];
});

const generateRandomString = () => {
  let getRandChar = '';
  let randArray = [];
  let charForRand = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890';
  const maxLength = 9;

  for (let i = 0; i < maxLength; i++) {
    let genRandomChar = Math.floor(Math.random() * charForRand.length);

    getRandChar = getRandChar + charForRand.charAt(genRandomChar);

    randArray.push(getRandChar);
  }

  return getRandChar;
};

module.exports = router;

