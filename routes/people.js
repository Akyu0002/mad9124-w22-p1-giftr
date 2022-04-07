import createDebug from "debug";
import sanitizeBody from "../middleware/sanitizeBody.js";
import Person from "../models/Person.js";
import express from "express";
import authUser from "../middleware/auth.js";
import authAdmin from "../middleware/authAdmin.js";
import ResourceNotFoundError from "../exceptions/ResourceNotFound.js";
import User from "../models/User.js";

const debug = createDebug("MAD9124-W21-A3-JWT-AUTH:routes:students");
const router = express.Router();

router.use("/", authUser, sanitizeBody);

// Person GET route.
router.get("/", async (req, res) => {
  const collection = await Person.find().populate("gifts");
  res.send({ data: formatResponseData(collection) });
});

// Person POST route.
router.post("/", async (req, res, next) => {
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
    const person = await Person.findById(req.params.id).populate("gifts");
    if (!person) {
      throw new ResourceNotFoundError(
        `We could not find a student with id: ${req.params.id}`
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
      }
      res.send({ data: formatResponseData(document) });
    } catch (err) {
      next(err);
    }
  };

// Person PUT route.
router.put("/:id", authAdmin, update(true));

// Person PATCH route.
router.patch("/:id", update(false));

// Person DELETE route.
router.delete("/:id", authAdmin, async (req, res, next) => {
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
