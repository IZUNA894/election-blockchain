const crypto = require("crypto");
const fetch = require("node-fetch");

class Blockchain {
  constructor() {
    this.chain = [];
    this.calculatedHash = "";
    this.transactions = null;
    this.nodes = [];
    this.createBlock();
  }

  createBlock = () => {
    let previousBlock = this.chain.at(-1);
    let previousHash = previousBlock ? previousBlock.calculatedHash : "0";
    let block = {
      index: this.chain.length,
      timestamp: new Date(),
      previousHash,
      transactions: this.transactions,
    };

    let proof = this.proofOfWork(block);
    block.proof = proof;
    block.calculatedHash = this.calculatedHash;
    // let block = {...this.block};
    this.transactions = null;
    this.chain.push(block);
    // this.block = null;
    return block;
  };

  getPreviousBlock = () => {
    return this.chain.at(-1);
  };

  proofOfWork = (block) => {
    let newProof = 1;
    let checkProof = false;

    while (!checkProof) {
      block.proof = newProof;
      let hashOperation = crypto
        .createHash("sha256")
        .update(JSON.stringify(block))
        .digest("hex");
      if (hashOperation.slice(0, 4) == "0000") {
        checkProof = true;
      } else {
        newProof += 1;
      }
      this.calculatedHash = hashOperation;
    }
    return newProof;
  };

  hash = (block) => {
    return crypto
      .createHash("sha256")
      .update(JSON.stringify(block))
      .digest("hex");
  };

  isChainValid = () => {
    let previousBlock = this.chain[0];
    let blockIndex = 1;
    while (blockIndex < this.chain.length) {
      // delete previousBlock.proof;
      delete previousBlock.calculatedHash;
      let block = this.chain[blockIndex];
      let previousHash = this.hash(previousBlock);

      if (block.previousHash !== previousHash) {
        return false;
      }

      // delete block.proof;
      delete block.calculatedHash;
      // let proof = block.proof;
      let hashOperation = this.hash(block);
      if (hashOperation.slice(0, 4) != "0000") {
        return false;
      }
      previousBlock = block;
      blockIndex += 1;
    }
    return true;
  };

  addVote = ({ candidate, voter, node }) => {
    let foundResult = false;
    foundResult = this.chain.some((item, index) => {
      if (index == 0) return false;
      if (item.transactions.voter === voter) {
        return true;
      }
    });
    if (foundResult) {
      return foundResult === false;
    }
    this.transactions = { candidate, voter, node, date_added: new Date() };
    this.createBlock();
    return true;
  };

  countVotes = () => {
    let voteResult = {};
    this.chain.forEach((item, index) => {
      if (index == 0) return;
      if (isNaN(voteResult[item.transactions.candidate])) {
        voteResult[item.transactions.candidate] = 1;
      } else {
        voteResult[item.transactions.candidate]++;
      }
    });
    return voteResult;
  };

  addNode = ({ address }) => {
    this.nodes.push(address);
  };

  replaceChain = () => {
    let network = this.nodes;
    let longestChain = null;
    let maxLength = this.chain.length;

    network.forEach(async (item) => {
      let response = await fetch(item + "/chains");
      response = await response.json();
      if (response.status == 200) {
        let length = response.body.data.length;
        let chain = response.body.data.chain;
        if (length > maxLength && this.isChainValid(chain)) {
          maxLength = length;
          longestChain = chain;
        }
      }
    });
    if (longestChain) {
      this.chain = longestChain;
      return true;
    }
    return false;
  };
}

module.exports = new Blockchain();
