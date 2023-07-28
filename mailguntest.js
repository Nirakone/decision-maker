const formData = require("form-data");
const Mailgun = require("mailgun.js");
const mailgun = new Mailgun(formData);

function sendemail() {
  const mg = mailgun.client({
    username: "api",
    key: process.env.MAILGUN_API_KEY,
    url: process.env.MAILGUN_API_URL,
  });

console.log(process.env.MAILGUN_API_KEY);
console.log(process.env.MAILGUN_API_URL);

  mg.messages
    .create(process.env.MAILGUN_DOMAIN, {
      from: process.env.MAILGUN_SENDER_EMAIL,
      to: ["ravneet.virk@gmail.com"],
      subject: "Hello",
      text: "Testing some Mailgun awesomeness!",
      html: "<h1>Testing some Mailgun awesomeness!</h1>",
    })
    .then((msg) => console.log(msg)) // logs response data
    .catch((err) => console.log(err)); // logs any error
}

module.exports = sendemail;

//test code below to modify to send to anyone in future

// function sendEmail(recipientEmail, subject, textContent, htmlContent) {
//   const mg = mailgun.client({
//     username: "api",
//     key: process.env.MAILGUN_API_KEY,
//     url: process.env.MAILGUN_API_URL,
//   });

//   console.log(process.env.MAILGUN_API_KEY);
//   console.log(process.env.MAILGUN_API_URL);

//   mg.messages
//     .create(process.env.MAILGUN_DOMAIN, {
//       from: process.env.MAILGUN_SENDER_EMAIL,
//       to: [recipientEmail],
//       subject: subject,
//       text: textContent,
//       html: htmlContent,
//     })
//     .then((msg) => console.log(msg)) // logs response data
//     .catch((err) => console.log(err)); // logs any error
// }

// module.exports = sendEmail;






