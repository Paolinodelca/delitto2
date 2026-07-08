module.exports = {
  ...require("./buildInputBundle"),
  ...require("./validateInputBundle"),
  ...require("./healthBuildInputBundle"),
  ...require("./buildInputSource"),
  ...require("./validateInputSource"),
};