function feed(parent, args, context, info) {
  const { filter, first, skip } = args; // destructure input arguments
  const where = filter
    ? {
        OR: [
          { url_contains: filter },
          { description_contains: filter },
          { name_contains: filter },
          { id: filter }
        ]
      }
    : {};

  return context.db.query.companies({ first, skip, where }, info);
}

module.exports = {
  feed
};
