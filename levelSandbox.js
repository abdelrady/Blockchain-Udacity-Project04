/* ===== Persist data with LevelDB ===================================
|  Learn more: level: https://github.com/Level/level     |
|  =============================================================*/

const level = require('level');
const chainDB = './chaindata';
class LevelSandbox {
  // Declaring the class constructor
  constructor() {
    this.db = level(chainDB);
  }


  // Add data to levelDB with key/value pair
  addLevelDBData(key, value) {
    var self = this;
    return new Promise(function (resolve, reject) {
      self.db.put(key, value, function (err) {
        if (err) {
          console.log('Block ' + key + ' submission failed', err);
          reject(err);
        } else resolve(value);
      })
    });
  }

  // Get data from levelDB with key
  getLevelDBData(key) {
    var self = this;
    return new Promise(function (resolve, reject) {
      self.db.get(key, function (err, value) {
        if (err) {
          reject(err);
        } else resolve(JSON.parse(value));
      });
    });
  }

  // Add data to levelDB with value
  addDataToLevelDB(value) {
    let i = 0;
    this.db.createReadStream().on('data', function (data) {
      i++;
    }).on('error', function (err) {
      return console.log('Unable to read data stream!', err)
    }).on('close', function () {
      console.log('Block #' + i);
      addLevelDBData(i, value);
    });
  }

  getAllRecords() {
    var self = this;
    let dataArray = [];
    return new Promise(function (resolve, reject) {
      self.db.createReadStream()
        .on('data', function (data) {
          //console.log(data);
          dataArray.push(data);
        })
        .on('error', function (err) {
          reject(err)
        })
        .on('close', function () {
          resolve(dataArray);
        });
    });
  }

  // Get block by hash
  getBlockByHash(hash) {
    let self = this;
    let block = null;
    return new Promise(function (resolve, reject) {
      self.db.createReadStream()
        .on('data', function (data) {
          if (data.hash === hash) {
            block = data;
          }
        })
        .on('error', function (err) {
          reject(err)
        })
        .on('close', function () {
          resolve(block);
        });
    });
  }

  getBlocksByCriteria(predicate) {
    let self = this;
    let blocks = [];
    return new Promise(function (resolve, reject) {
      self.db.createReadStream()
        .on('data', function (data) {
          if (predicate(data)) {
            blocks.push(data);
          }
        })
        .on('error', function (err) {
          reject(err)
        })
        .on('close', function () {
          resolve(blocks);
        });
    });
  }
}

// Export the class
module.exports = LevelSandbox;
