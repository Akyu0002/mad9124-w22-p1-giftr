import sanitizeBody from "../middleware/sanitizeBody.js";
import Gift from "../models/Gift.js";
import express from "express";
import authUser from "../middleware/auth.js";
import authAdmin from "../middleware/authAdmin.js";
import ResourceNotFoundError from "../exceptions/ResourceNotFound.js";
import Person from "../models/Person.js";

const router = express.Router();

router.use("/", authUser, sanitizeBody);

// Gift POST route.
router.post("/:id/gifts", async (req, res, next) => {
  const newGift = new Gift(req.sanitizedBody);
  const personId = req.params.id;
  const person = await Person.findById(personId);
  let newObj = person;
  await newGift
    .save()
    .then(async (newGift) => {
      newObj.gifts.push(newGift);
      await Person.findByIdAndUpdate(personId, newObj).then((person) => {
        res.status(201).json(formatResponseData(newGift));
      });
    })
    .catch(next);
});

const update =
  (overwrite = false) =>
  async (req, res, next) => {
    try {
      const document = await Gift.findByIdAndUpdate(
        req.params.giftId,
        req.sanitizedBody,
        {
          new: true,
          overwrite,
          runValidators: true,
        }
      );
      if (!document) {
        throw new ResourceNotFoundError(
          `We could not find a gift with id: ${req.params.id}`
        );
      }
      res.send({ data: formatResponseData(document) });
    } catch (err) {
      next(err);
    }
  };

// Gift PATCH Route
router.patch("/:id/gifts/:giftId", update(false));

// Gift DELETE route.
router.delete("/:id/gifts/:giftId", authAdmin, async (req, res, next) => {
  try {
    const document = await Gift.findByIdAndRemove(req.params.id);
    if (!document) {
      throw new ResourceNotFoundError(
        `We could not find a gift with id: ${req.params.id}`
      );
    }
    res.send({ data: formatResponseData(document) });
  } catch (err) {
    next(err);
  }
});

// formatResponseData Function
function formatResponseData(payload, type = "gifts") {
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
