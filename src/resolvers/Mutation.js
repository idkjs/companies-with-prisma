const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { APP_SECRET, getUserId } = require("../utils");

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

function post(parent, { url, description }, context, info) {
  const userId = getUserId(context);
  return context.db.mutation.createCompany(
    { data: { url, description, postedBy: { connect: { id: userId } } } },
    info
  );
}

async function vote(parent, args, context, info) {
  const userId = getUserId(context);
  const { companyId } = args;
  const companyExists = await context.db.exists.Vote({
    user: { id: userId },
    company: { id: companyId }
  });
  if (companyExists) {
    throw new Error(`Already voted for company: ${companyId}`);
  }

  return context.db.mutation.createVote(
    {
      data: {
        user: { connect: { id: userId } },
        company: { connect: { id: companyId } }
      }
    },
    info
  );
}
// function post(parent, args, context, info) {
//   const {
//     name,
//     url,
//     logo,
//     employees,
//     tranch,
//     description,
//     location,
//     address,
//     jobs,
//     jobslink,
//     sector,
//     twitter,
//     facebook,
//     instagram,
//     youtube
//   } = args;
//   return context.db.mutation.createCompany(
//     {
//       data: {
//         name,
//         url,
//         logo,
//         employees,
//         tranch,
//         description,
//         location,
//         address,
//         jobs,
//         jobslink,
//         sector,
//         twitter,
//         facebook,
//         instagram,
//         youtube
//       }
//     },
//     info
//   );
// }

async function login(parent, args, context, info) {
  const user = await context.db.query.user({ where: { email: args.email } });
  if (!user) {
    throw new Error(`Could not find user with email: ${args.email}`);
  }

  const valid = await bcrypt.compare(args.password, user.password);
  if (!valid) {
    throw new Error("Invalid password");
  }

  const token = jwt.sign({ userId: user.id }, APP_SECRET);

  return {
    token,
    user
  };
}

module.exports = {
  post,
  signup,
  login,
  vote
};
