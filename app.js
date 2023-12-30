import express from "express";
import prisma from "./src/utils/prisma.js";
import morgan from "morgan";
import cors from "cors"; // Import the cors middleware
// import fs from "fs";
import usersRouter from "./src/controllers/users.controllers.js";
import authRouter from "./src/controllers/authUser.controllers.js";
import imageGenRouter from "./src/controllers/imageGen.controllers.js";
// now here we're importing necessary imports for langchain etc
import { OpenAI } from "langchain/llms/openai";
import { RetrievalQAChain } from "langchain/chains";
import { HNSWLib } from "langchain/vectorstores/hnswlib";
import { OpenAIEmbeddings } from "langchain/embeddings/openai";
import { CharacterTextSplitter } from "langchain/text_splitter";
import * as fs from "fs";
import * as dotenv from "dotenv";

const app = express();
app.use(morgan("combined"));
app.use(cors()); // Use the cors middleware to allow cross-origin requests
app.use(express.json()); // Add this middleware to parse JSON in request bodies
app.use("/users", usersRouter);
app.use("/auth", authRouter);
app.use("/get-art", imageGenRouter);

// // load our env variables for langchain
// dotenv.config();

// // set up input data and paths
// const txrFileName = "dnd_draft_1";
// let question = "Do I have anything with me?";
// const txtPath = `./${txrFileName}.txt`;
// const VECTOR_STORE_PATH = `${txrFileName}.index`;

// // define the main function runEmbeddings

// export const runWithEmbeddings = async () => {
//   // initialise a new openai model with empty config object
//   const model = new OpenAI();

//   // check if the vectore exists
//   let vectorStore;
//   if (fs.existsSync(VECTOR_STORE_PATH)) {
//     // if exists, load into memory
//     console.log("It exists");
//     vectorStore = await HNSWLib.load(VECTOR_STORE_PATH, new OpenAIEmbeddings());
//   } else {
//     // if not, we create a file path
//     // read the input text file
//     const text = fs.readFileSync(txtPath, "utf8");
//     // create text splieeter with chunk size
//     const textSplitter = new CharacterTextSplitter({
//       separator: "\n",
//       chunkSize: 1000,
//     });
//     // split the text into documents
//     const docs = await textSplitter.createDocuments([text]);

//     // create a new vector store from the documents using embeddings
//     vectorStore = await HNSWLib.fromDocuments(docs, new OpenAIEmbeddings());

//     // save the vector store into a file
//     await vectorStore.save(VECTOR_STORE_PATH);
//   }

//   // create a retrievalQA chain by passin the initialised openaimodel and vector store retriever
//   const chain = RetrievalQAChain.fromLLM(model, vectorStore.asRetriever());

//   // call the retrievalQAchain with the input question, and store result in the 'res' variable
//   const res = await chain.call({
//     query: question,
//   });

//   // log the result into console
//   console.log({ res });
// };

// // execute main function
// runWithEmbeddings();

// lets attempt to put everything into an endpoint

// set up input data and paths
const txrFileName = "dnd_draft_1";
// let question = "Do I have anything with me?";
const txtPath = `./${txrFileName}.txt`;
const VECTOR_STORE_PATH = `${txrFileName}.index`;

app.post("/get-reply", async (req, res) => {
  try {
    let data = req.body; // so to get question, it should be data.input
    // initialise a new openai model with empty config object
    const model = new OpenAI();

    // check if the vectore exists
    let vectorStore;
    if (fs.existsSync(VECTOR_STORE_PATH)) {
      // if exists, load into memory
      console.log("It exists");
      vectorStore = await HNSWLib.load(
        VECTOR_STORE_PATH,
        new OpenAIEmbeddings()
      );
    } else {
      // if not, we create a file path
      // read the input text file
      const text = fs.readFileSync(txtPath, "utf8");
      // create text splieeter with chunk size
      const textSplitter = new CharacterTextSplitter({
        separator: "\n",
        chunkSize: 1000,
      });

      // split the text into documents
      const docs = await textSplitter.createDocuments([text]);

      // create a new vector store from the documents using embeddings
      vectorStore = await HNSWLib.fromDocuments(docs, new OpenAIEmbeddings());

      // save the vector store into a file
      await vectorStore.save(VECTOR_STORE_PATH);
    }

    // create a retrievalQA chain by passin the initialised openaimodel and vector store retriever
    const chain = RetrievalQAChain.fromLLM(model, vectorStore.asRetriever());

    // call the retrievalQAchain with the input question, and store result in the 'res' variable
    const reply = await chain.call({
      query: data.input,
    });

    console.log(reply);

    return res.status(200).json({ reply });
  } catch (error) {
    console.error("Error fetching distinct languages:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// endpoint to get number of prompts remaining to see if api call can be done by user or not
app.get("/prompts-remaining/:userId", async (req, res) => {
  const userId = parseInt(req.params.userId); // Parse userId from the URL parameter

  try {
    // Use Prisma to find the no_of_prompts remaining by user
    const number2 = await prisma.user.findUnique({
      where: { id: userId },
      select: { imgLeft: true },
    });

    // Return the images as JSON response
    return res.json({ promptsRemaining: number2.imgLeft });
  } catch (error) {
    // Handle errors and return an error response if needed
    console.error("Error retrieving no of prompts remaining:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// endpoint to decrement imgLeft field by 1
app.post("/dec-no-of-prompts/:userId", async (req, res) => {
  const userId = parseInt(req.params.userId); // Parse userId from the URL parameter

  try {
    // Use Prisma to increment the no_of_prompts field for the specified user
    const decPrompts = await prisma.user.update({
      where: { id: userId },
      data: {
        imgLeft: { decrement: 1 },
      },
    });

    // Return the images as JSON response
    return res.json({ decPrompts, userId });
  } catch (error) {
    // Handle errors and return an error response if needed
    console.error("Error increasing prompts:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});
export default app; // added this
