/* ===== SHA256 with Crypto-js ===============================
|  Learn more: Crypto-js: https://github.com/brix/crypto-js  |
|  =========================================================*/

const SHA256 = require('crypto-js/sha256');
//Importing levelSandbox class
const LevelSandbox = require('./levelSandbox.js');
const Block = require('./Block.js')
// Creating the levelSandbox class object
const db = new LevelSandbox();

/* ===== Blockchain Class ==========================
|  Class with a constructor for new blockchain 		|
|  ================================================*/

class Blockchain {
  constructor() {

  }

  // Get block height
  getBlockHeight() {
    return new Promise(function (resolve, reject) {
      db.getAllRecords().then((data) => {
        resolve(data.length - 1);
      }).catch((err) => { console.log(err); reject(err); });
    });
  }

  // Add new block
  addBlock(newBlock) {
    var self = this;
    // Block height
    return new Promise(function (resolve, reject) {
      self.getBlockHeight().then((height) => {
        if (height == -1) {
          var gBlock = new Block("First block in the chain - Genesis block");
          gBlock.time = new Date().getTime().toString().slice(0, -3);
          self.hashBlockAndSave(gBlock)
            .then(() => {
              self.addBlock(newBlock)
                .then((d) => {
                  resolve(d);
                }).catch((err) => { reject(err); });
            });
        }
        else {
          // previous block hash
          self.getBlock(height).then((block) => {
            newBlock.previousBlockHash = block.hash;
            newBlock.height = height + 1;
            // UTC timestamp
            newBlock.time = new Date().getTime().toString().slice(0, -3);

            self.hashBlockAndSave(newBlock)
              .then((d) => {
                resolve(d);
              }).catch((err) => { reject(err); });
          }).catch((err) => { console.log(err); });
        }
      })
    });
  }

  hashBlockAndSave(newBlock) {
    // Block hash with SHA256 using newBlock and converting to a string
    newBlock.hash = SHA256(JSON.stringify(newBlock)).toString();

    return new Promise(function (resolve, reject) {
      // Adding block object to chain
      db.addLevelDBData(newBlock.height, JSON.stringify(newBlock).toString())
        .then((result) => {
          if (!result) {
            reject(new Error("Error at adding new block in db" + result))
          } else {
            resolve(result);
          }
        }).catch((err) => { console.log(err); reject(err); });
    })
  }

  // get block
  getBlock(blockHeight) {
    return db.getLevelDBData(blockHeight);
  }

  // validate block
  validateBlock(blockHeight) {
    // get block object
    return new Promise((resolve, reject) => {
      this.getBlock(blockHeight).then((block)=>{
        // get block hash
        let blockHash = block.hash;
        // remove block hash to test block integrity
        block.hash = '';
        // generate block hash
        let validBlockHash = SHA256(JSON.stringify(block)).toString();
        // Compare
        resolve(blockHash === validBlockHash);
      })
      .catch((err)=>{
          reject(err);
      });
    });
  }

  // Validate blockchain
  validateChain() {
    let errorLog = [];
    let promises = [];
    db.getAllRecords().then((arr) => {
      for (var i = 0; i < arr.length; i++) {
        promises.push(this.validateBlock(i));

        // compare blocks hash link
        if(i < arr.length - 1){
          let blockHash = arr[i].hash;
          let previousHash = arr[i + 1].previousBlockHash;
          if (blockHash !== previousHash) {
            errorLog.push(i);
          }
        }
      }

      Promise.all(promises).then((results) => {
        for (var j = 0; j < results.length; j++) {
          // validate block
          if (!results[j]) errorLog.push(i);
        }

        if (errorLog.length > 0) {
          console.log('Block errors = ' + errorLog.length);
          console.log('Blocks: ' + errorLog);
        } else {
          console.log('No errors detected');
        }
      });
    })
  }

  getBlockByHash(hash){
    return db.getBlockByHash(hash);
  }

  getBlocksByCriteria(predicate){
      return db.getBlocksByCriteria(predicate);
  }
}
// Export the class
module.exports = Blockchain;
