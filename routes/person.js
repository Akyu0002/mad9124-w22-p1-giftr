import createDebug from "debug";
import sanitizeBody from "../middleware/sanitizeBody.js";
import Student from "../models/Student.js";
import express from "express";
import authUser from "../middleware/auth.js";
import authAdmin from "../middleware/authAdmin.js";
import ResourceNotFoundError from "../exceptions/ResourceNotFound.js";

const debug = createDebug("MAD9124-W21-A3-JWT-AUTH:routes:students");
const router = express.Router();

router.use("/", authUser, sanitizeBody);

// Student GET route.
router.get("/", async (req, res) => {
  const collection = await Student.find();
  res.send({ data: formatResponseData(collection) });
});

// Student POST route.
router.post("/", authAdmin, (req, res, next) => {
  new Student(req.sanitizedBody)
    .save()
    .then((newStudent) => res.status(201).json(formatResponseData(newStudent)))
    .catch(next);
});

// Student GET with ID route.
router.get("/:id", async (req, res, next) => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) {
      throw new ResourceNotFoundError(
        `We could not find a student with id: ${req.params.id}`
      );
    }
    res.json(formatResponseData(student));
  } catch (err) {
    next(err);
  }
});

const update =
  (overwrite = false) =>
  async (req, res, next) => {
    try {
      const document = await Student.findByIdAndUpdate(
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
          `We could not find a student with id: ${req.params.id}`
        );
      }
      res.send({ data: formatResponseData(document) });
    } catch (err) {
      next(err);
    }
  };

// Student PUT route.
router.put("/:id", authAdmin, update(true));

// Student PATCH route.
router.patch("/:id", authAdmin, update(false));

// Student DELETE route.
router.delete("/:id", authAdmin, async (req, res, next) => {
  try {
    const document = await Student.findByIdAndRemove(req.params.id);
    if (!document) {
      throw new ResourceNotFoundError(
        `We could not find a student with id: ${req.params.id}`
      );
    }
    res.send({ data: formatResponseData(document) });
  } catch (err) {
    next(err);
  }
});

// formatResponseData Function
function formatResponseData(payload, type = "students") {
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
