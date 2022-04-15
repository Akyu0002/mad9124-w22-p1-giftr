// Models
import User from "../models/User.js";
import Person from "../models/Person.js";

// Plugin
import express from "express";

// Middleware
import authUser from "../middleware/auth.js";
import authOwner from "../middleware/authOwner.js";
import sanitizeBody from "../middleware/sanitizeBody.js";
import ResourceNotFoundError from "../exceptions/ResourceNotFound.js";

const router = express.Router();

router.use("/", authUser);

// Person GET route.
router.get("/", async (req, res) => {
  const collection = await Person.find();
  res.send({ data: formatResponseData(collection) });
});

// Person POST route.
router.post("/", sanitizeBody, async (req, res, next) => {
  const user = await User.findById(req.user._id);
  const newPerson = new Person(req.sanitizedBody);
  newPerson.owner = user._id;
  await newPerson
    .save()
    .then((newPerson) => res.status(201).json(formatResponseData(newPerson)))
    .catch(next);
});

// Person GET with ID route.
router.get("/:id", async (req, res, next) => {
  try {
    const person = await Person.findById(req.params.id);
    if (!person) {
      throw new ResourceNotFoundError(
        `We could not find a person with id: ${req.params.id}`
      );
    }
    res.json(formatResponseData(person));
  } catch (err) {
    next(err);
  }
});

const update =
  (overwrite = false) =>
  async (req, res, next) => {
    try {
      const document = await Person.findByIdAndUpdate(
        req.params.id,
        req.sanitizedBody,
        {
          new: true,
          overwrite,
          runValidators: true,
        }
      );
      if (!document) {
        throw new ResourceNotFoundError(
          `We could not find a person with id: ${req.params.id}`
        );
        s;
      }
      res.send({ data: formatResponseData(document) });
    } catch (err) {
      next(err);
    }
  };

// Person PUT route.
router.put("/:id", sanitizeBody, update(true));

// Person PATCH route.
router.patch("/:id", sanitizeBody, update(false));

// Person DELETE route.
router.delete("/:id", authOwner, async (req, res, next) => {
  try {
    const document = await Person.findByIdAndRemove(req.params.id);
    if (!document) {
      throw new ResourceNotFoundError(
        `We could not find a person with id: ${req.params.id}`
      );
    }
    res.send({ data: formatResponseData(document) });
  } catch (err) {
    next(err);
  }
});

// formatResponseData Function
function formatResponseData(payload, type = "people") {
  if (payload instanceof Array) {
    return payload.map((resource) => format(resource));
  } else {
    return format(payload);
  }

  function format(resource) {
    const { _id, ...attributes } = resource.toObject();
    return { type, id: _id, attributes };
  }
}

export default router;
