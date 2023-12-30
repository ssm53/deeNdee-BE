import express from "express";
import bcrypt from "bcryptjs";
import { Prisma } from "@prisma/client";
import prisma from "../utils/prisma.js";
import { validateLogin } from "../validators/auth.js";
import { filter } from "../utils/common.js";
import { signAccessToken } from "../utils/jwt.js";

const router = express.Router();

router.post("/", async (req, res) => {
  const data = req.body;

  const validationErrors = validateLogin(data);

  if (Object.keys(validationErrors).length != 0)
    return res.status(400).send({
      error: validationErrors,
    });

  const user = await prisma.user.findUnique({
    where: {
      username: data.username,
    },
  });

  if (!user)
    return res.status(401).send({
      error: { username: "Username not found" },
    });

  const checkPassword = bcrypt.compareSync(data.password, user.password);
  if (!checkPassword)
    return res.status(401).send({
      error: { password: "wrong password" },
    });

  const userFiltered = filter(user, "id", "username");
  const userAccessToken = await signAccessToken(userFiltered);

  const userId = user.id;
  return res.json({ userAccessToken, userId });
});

export default router;
