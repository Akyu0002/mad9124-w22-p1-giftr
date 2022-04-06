import sanitizeBody from "../middleware/sanitizeBody.js";
import Gift from "../models/Gift.js";
import express from "express";
import authUser from "../middleware/auth.js";
import authAdmin from "../middleware/authAdmin.js";
import ResourceNotFoundError from "../exceptions/ResourceNotFound.js";

const router = express.Router();

router.use("/", authUser, sanitizeBody);

// Course POST route.
router.post("/", authAdmin, (req, res, next) => {
  new Course(req.sanitizedBody)
    .save()
    .then((newCourse) => res.status(201).json(formatResponseData(newCourse)))
    .catch(next);
});

const update =
  (overwrite = false) =>
  async (req, res, next) => {
    try {
      const document = await Course.findByIdAndUpdate(
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
          `We could not find a course with id: ${req.params.id}`
        );
      }
      res.send({ data: formatResponseData(document) });
    } catch (err) {
      next(err);
    }
  };

// Course PUT Route
router.put("/:id", authAdmin, update(true));

// Course PUT Route
router.patch("/:id", authAdmin, update(false));

// Course DELETE route.
router.delete("/:id", authAdmin, async (req, res, next) => {
  try {
    const document = await Course.findByIdAndRemove(req.params.id);
    if (!document) {
      throw new ResourceNotFoundError(
        `We could not find a course with id: ${req.params.id}`
      );
    }
    res.send({ data: formatResponseData(document) });
  } catch (err) {
    next(err);
  }
});

// formatResponseData Function
function formatResponseData(payload, type = "courses") {
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
