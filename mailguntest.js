const formData = require("form-data");
const Mailgun = require("mailgun.js");
const mailgun = new Mailgun(formData);

function sendemail(pollLinkUrl, emailId) {

  const mg = mailgun.client({
    username: "api",
    key: process.env.MAILGUN_API_KEY,
  });

mg.messages
    .create(process.env.MAILGUN_DOMAIN, {
      from: process.env.MAILGUN_SENDER_EMAIL,
      to: [emailId],
      subject: "Poll link url",
      text: "Poll link!",
      html: '<h1>Clink this link for poll: ' + pollLinkUrl + '</h1>',
    })
    .then((msg) => console.log(msg)) // logs response data
    .catch((err) => console.log(err)); // logs any error
}

module.exports = sendemail;
