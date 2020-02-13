module.exports = {
  getErrorMessage(err) {
    if (err.errors) {
      for (const errName in err.errors) {
        if (err.errors[errName].message) {
          let ret = err.errors[errName].message;
          ret = ret.replace("Path ", "");
          ret = ret.replace("`", "");
          ret = ret.replace("_", " ");
          ret = ret.replace("`", "");
          return ret.charAt(0).toUpperCase() + ret.slice(1);
        }
      }
    } else {
      return "Unknown server error";
    }
  },
};
