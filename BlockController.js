const SHA256 = require('crypto-js/sha256');
const BlockClass = require('./Block.js');

/**
 * Controller Definition to encapsulate routes to work with blocks
 */
class BlockController {

    /**
     * Constructor to create a new BlockController, you need to initialize here all your endpoints
     * @param {*} app 
     */
    constructor(app) {
        this.app = app;
        this.blocks = [];
        this.initializeMockData();
        this.getBlockByIndex();
        this.postNewBlock();
    }

    /**
     * Implement a GET Endpoint to retrieve a block by index, url: "/api/block/:index"
     */
    getBlockByIndex() {
        this.app.get("/block/:index", (req, res) => {
            if(req.params.index >= 0 && req.params.index < this.blocks.length){
				res.send(this.blocks[req.params.index]);
			}
			res.status(500).send('Index is out of chain bound.');
        });
    }

    /**
     * Implement a POST Endpoint to add a new Block, url: "/api/block"
     */
    postNewBlock() {
        this.app.post("/block", (req, res) => {
			if(!req.body.body){
				res.status(500).send('Block can not be added if empty');
			}
			
            var newBlock = this.addNewBlock(req.body.body);
			
			res.json(newBlock);
        });
    }
	
	addNewBlock(data){
			var lastHeight = this.blocks.length == 0 ? -1 : this.blocks[this.blocks.length - 1].height;
			var newBlock = new BlockClass.Block(data);
			newBlock.height = lastHeight + 1;
			newBlock.previousBlockHash = this.blocks.length == 0 ? "" : this.blocks[this.blocks.length - 1].hash;
			newBlock.hash = SHA256(JSON.stringify(newBlock)).toString();
			this.blocks.push(newBlock);
			return newBlock;
	}

    /**
     * Help method to inizialized Mock dataset, adds 10 test blocks to the blocks array
     */
    initializeMockData() {
        if(this.blocks.length === 0){
            for (let index = 0; index < 10; index++) {
				this.addNewBlock(`Test Data #${index}`);
            }
        }
    }

}

/**
 * Exporting the BlockController class
 * @param {*} app 
 */
module.exports = (app) => { return new BlockController(app);}