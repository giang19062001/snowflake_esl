const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const path = require("path");

const app = express();
const PORT = 3000;

// Cấu hình EJS
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.static(path.join(__dirname, "public")));
const expressLayouts = require("express-ejs-layouts");
app.use(expressLayouts);
app.set("layout", "layouts/main");

//router

app.use(cors());
app.use(bodyParser.json());

const apiRouter = require("./router/api");
const pageRouter = require("./router/page");

app.use("/api", apiRouter);
app.use("/", pageRouter);


app.listen(PORT, () => {
   console.log(`🚀 Server running on http://localhost:${PORT}`);
});


// Khi ứng dụng nhận tín hiệu shutdown
process.on('SIGTERM', async () => {
  console.log('Shutting down...');
  await snowflakeConnection.closePool();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('Received SIGINT');
  await snowflakeConnection.closePool();
  process.exit(0);
});