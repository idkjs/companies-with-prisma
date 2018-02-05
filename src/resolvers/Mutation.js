const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { APP_SECRET } = require("../utils");

async function signup(parent, args, context, info) {
  const password = await bcrypt.hash(args.password, 10);
  const user = await context.db.mutation.createUser({
    data: { ...args, password }
  });

  const token = jwt.sign({ userId: user.id }, APP_SECRET);

  return {
    token,
    user
  };
}

function post(parent, args, context, info) {
  const {
    name,
    url,
    logo,
    employees,
    tranch,
    description,
    location,
    address,
    jobs,
    jobslink,
    sector,
    twitter,
    facebook,
    instagram,
    youtube
  } = args;
  return context.db.mutation.createCompany(
    {
      data: {
        name,
        url,
        logo,
        employees,
        tranch,
        description,
        location,
        address,
        jobs,
        jobslink,
        sector,
        twitter,
        facebook,
        instagram,
        youtube
      }
    },
    info
  );
}

module.exports = {
  post,
  signup
};
