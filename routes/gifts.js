// Middleware
import sanitizeBody from "../middleware/sanitizeBody.js";
import authUser from "../middleware/auth.js";
import ResourceNotFoundError from "../exceptions/ResourceNotFound.js";
import authGifts from "../middleware/authGifts.js"

// Models
import Gift from "../models/Gift.js";
import Person from "../models/Person.js";

// Plugins
import express from "express";

const router = express.Router();

router.use("/", authUser, sanitizeBody);

// Gift POST route.
router.post("/:id/gifts", authGifts, async (req, res, next) => {
  const newGift = new Gift(req.sanitizedBody);
  const personId = req.params.id;
  const person = await Person.findById(personId);
  let newObj = person;
  await newGift
    .save()
    .then(async (newGift) => {
      newObj.gifts.push(newGift);
      await Person.findByIdAndUpdate(personId, newObj).then(() => {
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
          `We could not find a gift with id: ${req.params.giftId}`
        );
      }
      const person = await Person.findById(req.params.id);
      person.gifts.id(req.params.giftId).name = req.sanitizedBody.name;
      person.gifts.id(req.params.giftId).price = req.sanitizedBody.price;
      person.gifts.id(req.params.giftId).imageUrl = req.sanitizedBody.imageUrl;
      person.gifts.id(req.params.giftId).storeName =
        req.sanitizedBody.storeName;
      person.gifts.id(req.params.giftId).storeProductURL =
        req.sanitizedBody.storeProductURL;
      person.markModified("person.gifts");
      person.save();
      res.send({ data: formatResponseData(document) });
    } catch (err) {
      next(err);
    }
  };

// Gift PATCH Route
router.patch("/:id/gifts/:giftId", authGifts, update(false));

// Gift DELETE route.
router.delete("/:id/gifts/:giftId", authGifts, async (req, res, next) => {
  const personId = req.params.id;
  const person = await Person.findById(personId);
  try {
    const document = await Gift.findByIdAndRemove(req.params.giftId);
    person.gifts.id(req.params.giftId).remove();
    person.save();
    console.log(Person);
    if (!document) {
      throw new ResourceNotFoundError(
        `We could not find a gift with id: ${req.params.giftId}`
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
