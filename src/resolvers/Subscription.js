const newCompany = {
  subscribe: (parent, args, ctx, info) => {
    return ctx.db.subscription.company({}, info);
  }
};

const newVote = {
  subscribe: (parent, args, ctx, info) => {
    return ctx.db.subscription.vote({}, info);
  }
};

module.exports = {
  newCompany,
  newVote
};
