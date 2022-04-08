import User from "../../models/User.js";
import sanitizeBody from "../../middleware/sanitizeBody.js";
import express from "express";
import createDebug from "debug";
import authenticate from "../../middleware/auth.js";
import AuthenticationAttempts from "../../models/Authentaction_attempts.js";

const debug = createDebug("MAD9124-W21-A3-JWT-AUTH:auth");
const router = express.Router();

router.use("/", sanitizeBody);

// Creating / Registering a New User
router.post("/users", sanitizeBody, (req, res, next) => {
  new User(req.sanitizedBody)
    .save()
    .then((newUser) => res.status(201).json(formatResponseData(newUser)))
    .catch(next);
});

// Retrieve the currently logged-in user.
router.get("/user/me", authenticate, async (req, res) => {
  const user = await User.findById(req.user._id).select("-password -__V");

  res.json(formatResponseData(user));
});

// Log the user in
router.post("/tokens", sanitizeBody, async (req, res) => {
  const { email, password } = req.sanitizedBody;
  let didSucceed;
  const user = await User.authenticate(email, password);

  if (user) didSucceed = true;
  else didSucceed = false;

  const loginInfo = {
    username: email,
    ipAddress: req.ip,
    didSucceed,
    createdAt: Date.now(),
  };
  const newLoginInfo = new AuthenticationAttempts(loginInfo);
  await newLoginInfo.save();

  if (!user) {
    return res.status(401).send({
      errors: [
        {
          status: "401",
          title: "Incorrect username or password.",
        },
      ],
    });
  }

  res.status(201).send({ data: { token: user.generateAuthToken() } });
});

// Update Password Route
router.patch("/auth/user/me", sanitizeBody, async (req, res, next) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      req.sanitizedBody,
      {
        new: true,
        overwrite: false,
        runValidators: true,
      }
    );
    if (!user) {
      throw new ResourceNotFoundError(
        `We could not find a user with id: ${req.params.id}`
      );
    }
    res.send({ data: formatResponseData(user) });
  } catch (err) {
    next(err);
  }
});

function formatResponseData(payload, type = "users") {
  if (payload instanceof Array) {
    return { data: payload.map((resource) => format(resource)) };
  } else {
    return { data: format(payload) };
  }

  function format(resource) {
    const { _id, ...attributes } = resource.toJSON
      ? resource.toJSON()
      : resource;
    return { type, id: _id, attributes };
  }
}

export default router;
