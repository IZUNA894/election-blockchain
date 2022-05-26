const express = require("express");
var compression = require("compression");
const bodyParser = require("body-parser");
const helmet = require("helmet");
const cors = require("cors");
const fetch = require("node-fetch");
const app = express();
const Blockchain = require("./util");
const { SEED_NODE, SELF_NODE } = require("./config");
app.use(compression());
app.use(helmet({ contentSecurityPolicy: false }));
app.use(helmet.hidePoweredBy());
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const PORT = 8080;

let candidates = [];

//____________________NODES________________
// app.post("/nodes/connect", (request, response) => {
//   let { hostname } = request;
//   Blockchain.addNode({ address: `http://${hostname}:8080` });

//   response.send({
//     status: true,
//     message: `You are added to Blockchain network at ${Blockchain.nodes.length}`,
//     data: Blockchain.nodes,
//   });
// });

app.post("/blocks/peers", (request, response) => {
  let { block } = request.body;

  Blockchain.addBlockFromPeers(block);

  response.send({
    status: true,
    message: `You are added to Blockchain network at ${Blockchain.nodes.length}`,
    data: Blockchain.nodes,
  });
});

app.post("/nodes/peers", async (request, response) => {
  let result = await fetch(`${SEED_NODE}/nodes/all`, {
    method: "POST",
    body: JSON.stringify({
      address: SELF_NODE,
    }),
    headers: { "Content-Type": "application/json" },
  });
  result = await result.json();
  let allNodes = result.data;

  let peerNodes = allNodes.filter((item) => item !== SELF_NODE);

  Blockchain.addNodes(peerNodes);

  response.send({
    status: true,
    message: "Blockchain nodes fetched successfully",
    data: Blockchain.getNodes(),
    length: Blockchain.getNodes().length,
  });
});

app.post("/nodes/all", (request, response) => {
  let { address } = request.body;
  Blockchain.addNodes([address]);

  response.send({
    status: true,
    message: "Blockchain nodes fetched successfully",
    data: Blockchain.getNodes(),
    length: Blockchain.getNodes().length,
  });
});

app.get("/nodes/all", (request, response) => {
  response.send({
    status: true,
    message: "Blockchain nodes fetched successfully",
    data: Blockchain.getNodes(),
    length: Blockchain.getNodes().length,
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
  let result = Blockchain.addVote({ ...request.body, node: SELF_NODE });

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
