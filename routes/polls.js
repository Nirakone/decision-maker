const express = require('express');
const router = express.Router();
const db = require('../db/connection');
const sendemail = require('../mailguntest.js');

const pollsBaseLink = "http://localhost:3001/api/polls/";
let generateUrl = "";

// Route to create a poll
router.post('/create-poll', (req, res) => {
  // query to insert user
  const queryCreatePoll = `INSERT INTO users (email) VALUES ( $1 ) RETURNING id`;

  const valuesCreatePoll = [req.body.email];
  db.query(queryCreatePoll, valuesCreatePoll)
    .then(dataone => {
      if (dataone) {
        let user_id = dataone.rows[0].id;
        generateUrl = generateRandomString();
        const fullLinkUrl = pollsBaseLink + "polls-answers/" + generateUrl;

        // query to insert polls after user is created
        const queryTwo = `INSERT INTO polls (title, question, link, users_id) VALUES ( $1, $2, $3, $4 ) RETURNING id`;

        const valuesTwo = [req.body.title, req.body.question, generateUrl, user_id];

        db.query(queryTwo, valuesTwo)
          .then(datatwo => {
            if (datatwo) {
              const optionsArray = req.body.options;
              const poll_id = datatwo.rows[0].id;

              // loop through the options array
              for (let i = 0; i < optionsArray.length; i++) {
                // query to insert choices
                const queryThree = `INSERT INTO choices (polls_id, polls_options) VALUES ( $1, $2 )`;

                const valuesThree = [poll_id, optionsArray[i]];

                db.query(queryThree, valuesThree)
                  .then(datathree => {
                    if (datathree) {
                      console.log("inserted to choices table successfully");
                    }
                  })
                  .catch(err => {
                    res
                      .status(500)
                      .json({ error: err.message });
                  });
              }

              // render success message to view
              const templateVars = {
                successMsg: "Poll was created successfully",
                pollTitle: req.body.title,
                pollQuestion: req.body.question,
                pollOptions: req.body.options
              };

              // send email to user
              SendEmailToUser(fullLinkUrl, req.body.email);

              res.render('poll-send', templateVars);
              // res.render('index', templateVars);
              return;
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
router.get("/user/:id", (req, res) => {
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
        const queryStringChoices = `
  SELECT * FROM choices
  WHERE polls_id = $1;
  `;

        const valuesChoices = [data.rows[0].id];

        db.query(queryStringChoices, valuesChoices)
          .then((dataone) => {
            // render data and success message to view
            const templateVars = { pollTitle: data.rows[0].title, pollQuestion: data.rows[0].question, pollChoices: dataone.rows, link: data.rows[0].link, successMsg: "Successfully" };

            res.render('voting', templateVars);
            return;
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
router.post('/:link/post-answer', (req, res) => {
  // let user_id = data.rows[0].id;
  let user_id = 145;
  let link = req.params.link;

  const queryPostLink = `SELECT id FROM polls WHERE link = $1`;

  db.query(queryPostLink, [link])
    .then(data => {
      // Query to insert answer to table
      const queryOne = `INSERT INTO answers (polls_id, users_id, polls_answer) VALUES ( $1, $2, $3 )`;

      const valuesOne = [data.rows[0].id, user_id, req.body.answers];

      return db.query(queryOne, valuesOne)

    })

    .then(dataOne => {
      if (dataOne) {
        // render data and success message to view

        // redirect to result page
        // res.redirect("back");
        res.render('polls-success');
        return;
      }
    })
    .catch(err => {
      res
        .status(500)
        .json({ error: err.message });
    });

});

// Route to get results by id
router.get("/get-polls/:id", (req, res) => {
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
          .then((dataone) => {
            if (dataone) {
              const queryStringAnswers = `
  SELECT * FROM answers
  WHERE polls_id = $1;
  `;

              const valuesAnswer = [data.rows[0].id];

              db.query(queryStringAnswers, valuesAnswer)
                .then((datatwo) => {
                  // render data and success message to view
                  const templateVars = { pollTitle: data.rows[0].title, pollQuestion: data.rows[0].question, pollChoices: dataone.rows, pollAnswers: datatwo.rows, pollLink: data.rows[0].link, successMsg: "Successful" };

                  res.render('voting', templateVars);
                  return;
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

// Route to send email to user for poll answers
router.post('/post-email', (req, res) => {
  const fullLinkUrl = pollsBaseLink + "user/" + generateUrl;
  const emailAddresses = req.body.emails;

  for (let i = 0; i < emailAddresses.length; i++) {

    const queryOne = `INSERT INTO users (email) VALUES ( $1 )`;

    const valuesOne = [emailAddresses[i]];

    db.query(queryOne, valuesOne)
      .then(dataOne => {
        if (dataOne) {
          // send email to user
          SendEmailToUser(fullLinkUrl, emailAddresses[i]);
        }
      })
      .catch(err => {
        res
          .status(500)
          .json({ error: err.message });
      });
  }

  // render data and success message to view
  const templateVars = { successMsg: "Successfully" };

  res.render('index', templateVars);
  return;
});

// Route to get poll results by id
router.get("/polls-answers/:id", (req, res) => {
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
        const queryStringChoices = `
          SELECT choices.polls_options, COUNT(answers.polls_answer) AS votes
          FROM choices
          LEFT JOIN answers ON choices.polls_id = answers.polls_id AND choices.polls_options = answers.polls_answer
          WHERE choices.polls_id = $1
          GROUP BY choices.polls_options;
        `;

        const valuesChoices = [data.rows[0].id];

        db.query(queryStringChoices, valuesChoices)
          .then((dataone) => {
            if (dataone) {
              // render data to view
              const templateVars = {
                pollTitle: data.rows[0].title,
                pollQuestion: data.rows[0].question,
                pollChoices: dataone.rows,
              };

              res.render('poll-answers', templateVars);
              return;
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

// function to send email  ----RAVNEET
const SendEmailToUser = (pollLinkUrl, emailId) => {
  // implement sending email function here
  sendemail(pollLinkUrl, emailId);
};


module.exports = router;

