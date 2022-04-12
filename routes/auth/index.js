import User from "../../models/User.js";
import sanitizeBody from "../../middleware/sanitizeBody.js";
import express from "express";
import createDebug from "debug";
import authenticate from "../../middleware/auth.js";

const debug = createDebug("MAD9124-W21-A3-JWT-AUTH:auth");
const router = express.Router();

// Set middleware for all routes.
router.use("/", sanitizeBody);

// Creating / Registering a New User
router.post("/users", sanitizeBody, (req, res, next) => {
  new User(req.sanitizedBody)
    .save()
    .then((newUser) => res.status(201).json(formatResponseData(newUser)))
    .catch(next);
});

// Retrieve the currently logged-in user.
router.get("/users/me", authenticate, async (req, res) => {
  const user = await User.findById(req.user._id).select("-password -__V");
  console.log("************** ", req.user, " **************");
  res.json(formatResponseData(user));
});

// Update the currently logged-in user's password
router.patch("/users/me", authenticate, sanitizeBody, async (req, res) => {
  const { password } = req.sanitizedBody;

  const newUser = await User.findByIdAndUpdate(req.user._id, {
    password: password,
  }).then((user) => {
    console.log(user);
    console.log("");
    console.log(user.password);
  });
  res.status(201).send("Password updated!");
});

// Log the user in
router.post("/tokens", sanitizeBody, async (req, res) => {
  const { email, password } = req.sanitizedBody;
  const user = await User.authenticate(email, password);

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
