import Person from "../models/Person.js";

export default async function (req, res, next) {
  const person = await Person.findById(req.params.id);

  if (
    person.sharedWith.includes(req.user._id) ||
    person.owner == req.user._id
  ) {
    next();
  } else {
    return res.status(403).send({
      errors: [
        {
          status: "403",
          title: "Access Denied",
          description:
            "Access restricted! You do not have permission to do this.",
        },
      ],
    });
  }
}
