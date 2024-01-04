import app from "./app.js";
const port = process.env.PORT || 8080;

app.listen(port, "0.0.0.0", () => {
  console.log(`App started; listening on port ${port}`);
});
