const jwt = require("jsonwebtoken");
const APP_SECRET = "prisma-is-aw3some";

/**
 * Function called to retrieve the `id` of a `User` from the `context` object
 * that's passed down the resolver chain.
 * */
function getUserId(context) {
  const Authorization = context.request.get("Authorization");
  if (Authorization) {
    const token = Authorization.replace("Bearer ", "");
    const { userId } = jwt.verify(token, APP_SECRET);
    return userId;
  }

  throw new Error("Not authenticated");
}

module.exports = {
  APP_SECRET,
  getUserId
};
