const express = require('express');
const router = express.Router();
const db = require('../db/connection');

// Route to create a poll
router.post('/create-poll', (req, res) => {
  // query to insert user
  const queryCreatePoll = `INSERT INTO users (email) VALUES ( $1 ) RETURNING id`;

  const valuesCreatePoll = [req.body.email];

  db.query(queryCreatePoll, valuesCreatePoll)
    .then(data => {

      if (data) {
        let user_id = data.rows[0].id;
        const generateUrl = generateRandomString();

        // query to insert polls after user is created
        const queryTwo = `INSERT INTO polls (title, question, link, users_id) VALUES ( $1, $2, $3, $4 ) RETURNING id`;

        const valuesTwo = [req.body.title, req.body.question, generateUrl, user_id];

        db.query(queryTwo, valuesTwo)
          .then(data => {

            if (data) {
              let optionsArray = ["Dog", "Cat", "Monkey"];
              // let optionsArray = req.body.options;
              let poll_id = data.rows[0].id;

              // loop through the options array
              for (let i = 0; i < optionsArray.length; i++) {
                // query to insert choices
                const queryThree = `INSERT INTO choices (polls_id, polls_options) VALUES ( $1, $2 )`;

                const valuesThree = [poll_id, optionsArray[i]];

                db.query(queryThree, valuesThree)
                  .then(data => {
                    if (data) {
                      // send email to user
                      SendEmailToUser();

                      // render data to page
                      const templateVars = { successMsg: "Poll created successfully", };

                      res.render('Place template view here', templateVars);
                      return;
                    }
                  })
                  .catch(err => {
                    res
                      .status(500)
                      .json({ error: err.message });
                  });
              }
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
});

// Route to get polls by id link
router.get("/:id", (req, res) => {
  const pollUrlId = req.params.id;

  // Query get select by link id
  const queryString = `
  SELECT * FROM polls
  WHERE polls.link = $1;
  `;
  const values = [pollUrlId];

  db.query(queryString, values)
    .then((data) => {
      if (data) {
        // Query to select choices by polls_id
        const queryStringFour = `
  SELECT * FROM choices
  WHERE polls_id = $1;
  `;

        const values = [data.rows[0].id];

        db.query(queryStringFour, values)
          .then((data) => {
            console.log(data.rows);
          })
          .catch((err) => {
            console.log(err.message);
          });
      }
    })
    .catch((err) => {
      console.log(err.message);
    });
});

// Route to post answers
router.post('/post-answer', (req, res) => {
  // Query to insert user to table
  const queryOne = `INSERT INTO users (email) VALUES ( $1 ) RETURNING id`;

  const valuesOne = [req.body.email];

  db.query(queryOne, valuesOne)
    .then(data => {
      let user_id = data.rows[0].id;

      // Query to insert answer to table
      const queryOne = `INSERT INTO answers (polls_id, users_id, polls_answer) VALUES ( $1, $2, $3 )`;

      const valuesOne = [req.body.polls_id, user_id, req.body.answer];

      db.query(queryOne, valuesOne)
        .then(data => {
          return "Answer submitted successfully";
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

// Route to get results by id
router.get("/get-results/:id", (req, res) => {
  const pollUrlId = req.params.id;

  // query to select polls by id
  const queryString = `
  SELECT * FROM polls
  WHERE polls.link = $1;
  `;
  const values = [pollUrlId];

  db.query(queryString, values)
    .then((data) => {

      if (data) {
        const queryStringFour = `
  SELECT * FROM choices
  WHERE polls_id = $1;
  `;

        const values = [data.rows[0].id];

        db.query(queryStringFour, values)
          .then((data) => {
            if (data) {
              const pollUrlId = req.params.id;

              const queryString = `
  SELECT * FROM polls
  WHERE polls.link = $1;
  `;
              const values = [pollUrlId];

              db.query(queryString, values)
                .then((data) => {
                  if (data) {
                  const queryStringAnswers = `
  SELECT * FROM answers
  WHERE polls_id = $1;
  `;

                  const valuesAnswer = [data.rows[0].id];

                  db.query(queryStringAnswers, valuesAnswer)
                    .then((data) => {
                      console.log(data.rows);
                    })
                    .catch((err) => {
                      console.log(err.message);
                    });
                  }
                })
                .catch((err) => {
                  console.log(err.message);
                });
            }
          })
          .catch((err) => {
            console.log(err.message);
          });
      }
    })
    .catch((err) => {
      console.log(err.message);
    });
});

// function to generate random string
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

// function to send email
const SendEmailToUser = () => {
  // implement sending email function here
};

module.exports = router;

