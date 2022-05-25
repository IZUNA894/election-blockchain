const express = require("express");
var compression = require("compression");
const bodyParser = require("body-parser");
const helmet = require("helmet");
const cors = require("cors");
const app = express();
const Blockchain = require("./util");
const { SEED_NODE } = require("./config");
app.use(compression());
app.use(helmet({ contentSecurityPolicy: false }));
app.use(helmet.hidePoweredBy());
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const PORT = 8080;
const nodeAddress = `http://localhost:${PORT}`;

let candidates = [];

//____________________NODES________________
app.post("/nodes/connect", (request, response) => {
  let { hostname } = request;
  Blockchain.addNode({ address: `http://${hostname}:8080` });

  response.send({
    status: true,
    message: `You are added to Blockchain network at ${Blockchain.nodes.length}`,
    data: Blockchain.nodes,
  });
});

app.get("/nodes/peers", async (request, response) => {
  fetch(`${SEED_NODE}/nodes/all`);
  response.send({
    status: true,
    message: "Blockchain nodes fetched successfully",
    data: Blockchain.nodes,
    length: Blockchain.nodes.length,
  });
});

app.get("/nodes/all", (request, response) => {
  response.send({
    status: true,
    message: "Blockchain nodes fetched successfully",
    data: Blockchain.nodes,
    length: Blockchain.nodes.length,
  });
});

//____________________CHAINS________________
app.get("/chains", (request, response) => {
  response.send({
    status: true,
    message: "Chain fetched successfully!",
    data: Blockchain.chain,
    length: Blockchain.chain.length,
  });
});

app.get("/chains/valid", (request, response) => {
  let result = Blockchain.isChainValid();

  response.send({
    status: true,
    message: "Chain Checked successfully!",
    data: result,
  });
});

app.post("/chains/replace", (request, response) => {
  let result = Blockchain.replaceChain();

  response.send({
    status: true,
    message: "chain replaced:" + result,
  });
});
//________________VOTE________________________

app.post("/votes", (request, response) => {
  let result = Blockchain.addVote({ ...request.body, node: nodeAddress });

  response.send({
    status: true,
    message: result
      ? `Votes added to Block successfully`
      : "Error in casting vote",
  });
});

app.get("/votes/count", (request, response) => {
  let result = Blockchain.countVotes();

  response.send({
    status: true,
    message: `Votes Counted Successfully`,
    data: result,
  });
});

//________________CANDIDATES__________________

app.post("/candidates", (request, response) => {
  let { candidate } = request.body;
  candidates.push(candidate);

  response.send({
    status: true,
    message: `Candidate Added to Database successfully!`,
    data: candidates,
    length: candidates.length,
  });
});

app.get("/candidates/all", (request, response) => {
  response.send({
    status: true,
    message: `Candidate fetched successfully!`,
    data: candidates,
    length: candidates.length,
  });
});

app.delete("/candidates", (request, response) => {
  let { candidate } = request.body;
  candidates = candidates.filter((item) => {
    return item !== candidate;
  });

  response.send({
    status: true,
    message: `Candidate deleted from Database successfully!`,
    data: candidates,
  });
});

app.get("*", function (req, res) {
  res.send("You hit the wrong route dear!");
});

app.listen(PORT, (error) => {
  console.log("Server started on port" + PORT);
});
