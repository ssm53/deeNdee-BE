import express from "express";
import { Prisma } from "@prisma/client";
import prisma from "../utils/prisma.js";
import { filter } from "../utils/common.js";
import OpenAI from "openai";
import fs from "fs";

const router = express.Router();

// OPEN AI Image generation SECTION
// normal set up shit
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

//endpoint for image generation
router.post("/", async (req, res) => {
  let data = req.body;
  console.log(data);
  // // Assuming data.prompt is an array of strings
  // data.artPrompt = data.artPrompt.join(" ");

  // // Now data.prompt is a single string
  // console.log(data.prompt);
  try {
    if (typeof req.body.artPrompt === "string") {
      const imageCompletion = await openai.images.generate({
        prompt: req.body.artPrompt,
        n: 1,
        size: req.body.size,
      });

      const generatedImage = imageCompletion.data;

      // const createGenImage = await prisma.genImage.create({
      //   data: {
      //     userId: req.body.userId,
      //     prompt: req.body.prompt,
      //     size: req.body.size,
      //     url: generatedImage[0].url,
      //   },
      // });
      res.status(200).json({ text: generatedImage });
    }
  } catch (error) {
    // Handle errors and return an error response if needed
    console.error("Error retrieving details:", error);
    res.status(403).json({
      text: "https://images.dog.ceo/breeds/ridgeback-rhodesian/n02087394_1722.jpg",
    });
  }
});

export default router;
