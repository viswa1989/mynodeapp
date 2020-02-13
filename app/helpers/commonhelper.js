const nodemailer = require("nodemailer");
const path = require("path");
// var templatesDir = path.resolve(__dirname, "..", "views/mailer");
const EmailTemplate = require("email-templates").EmailTemplate;

const EmailAddressRequiredError = new Error("email address required");
// create a defaultTransport using gmail and authentication that are
// stored in the `config.js` file.

module.exports = {
  sendMail(templateName, locals, fn, res) {
    // make sure that we have an user email
    if (!locals.email) {
      // return fn(EmailAddressRequiredError);
      res.send({ success: false, message: "Email id not found" });
      return true;
    }
    // make sure that we have a message
    if (!locals.subject) {
      return fn(EmailAddressRequiredError);
    }
    const templateDir = path.resolve(__dirname, "../views/mailer", "password_reset");

    const myTemplate = new EmailTemplate(templateDir);

    const defaultTransport = nodemailer.createTransport({
      service: "Gmail", // sets automatically host, port and connection security settings
      auth: {
        user: "govitesting1989@gmail.com",
        pass: "testing1989",
      },
    });
    myTemplate.render(locals, (errs, result) => {
      if (errs) {
        res.send({ success: false, message: "Something happened please try agian later" });
        return true;
      }
      // check here what is showing in your result
      defaultTransport.sendMail({
        from: "govitesting1989@gmail.com",
        to: locals.email,
        subject: locals.subject,
        html: result.html,
      }, (err, responseStatus) => {
        if (err) {
          res.send({ success: false, message: "Something happened please try agian later" });
          return true;
        }

        res.send({ success: true, message: "Username exist", data: responseStatus });
        return true;
        // return responseStatus;// return from status or as you need;
      });
    });
  },
};
