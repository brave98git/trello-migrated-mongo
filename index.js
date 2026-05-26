const express = require("express");
const app = express();
const PORT = 3000;

const { authRouter } = require("./routes/auth.routes");
const { organizationRouter } = require("./routes/organization.routes");
const { boardRouter } = require("./routes/board.routes");
const { issueRouter } = require("./routes/issue.routes");

app.use(express.json());

app.use(authRouter);
app.use(organizationRouter);
app.use(boardRouter);
app.use(issueRouter);

app.listen(PORT, () => {
  console.log(`Server Started at Port ${PORT}`);
});