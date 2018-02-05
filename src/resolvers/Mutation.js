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
  post
};
