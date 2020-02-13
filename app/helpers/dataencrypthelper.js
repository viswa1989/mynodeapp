const crypto = require("crypto");
const key = "123|a123123123123123@&";

module.exports = {
  encrypt(inputtext) {
    let cipher = crypto.createCipher('aes-256-cbc', key);
    let crypted = cipher.update(inputtext, 'utf-8', 'hex');
    crypted += cipher.final('hex');
    return crypted;
  },
  decrypt(outputtext) {
    let decipher = crypto.createDecipher('aes-256-cbc', key);
    let decrypted = decipher.update(outputtext, 'hex', 'utf-8');
    decrypted += decipher.final('utf-8');
    return decrypted;
  }
}