//Importing Express.js module
const express = require("express");
//Importing BodyParser.js module
const bodyParser = require("body-parser");
const Blockchain = require('./Blockchain.js')

/**
 * Class Definition for the REST API
 */
class BlockAPI {

    /**
     * Constructor that allows initialize the class 
     */
    constructor() {
		this.app = express();
		this.initExpress();
		this.initExpressMiddleWare();
		this.initControllers();
		this.addEndpoints();
		this.start();
	}

    /**
     * Initilization of the Express framework
     */
	initExpress() {
		this.app.set("port", 8000);
	}

    /**
     * Initialization of the middleware modules
     */
	initExpressMiddleWare() {
		this.app.use(bodyParser.urlencoded({extended:true}));
		this.app.use(bodyParser.json());
	}

    /**
     * Initilization of all the controllers
     */
	initControllers() {
		//require("./BlockController.js")(this.app);
		this.blockchain = new Blockchain();
		this.validation = require("./RequestValidation.js")();
	}


	addEndpoints(){
		var self = this;
		self.app.post("/requestValidation", (req, res) => { 
			var request = self.validation.AddRequestValidation(req.body);
			res.json(request);
		});

		self.app.post("/message-signature/validate", (req, res)=>{
			var request = self.validation.validateRequestByWallet(req.body.address, req.body.signature);
			res.json(request);
		});


		self.app.post("/block", (req, res)=>{
			var request = self.validation.verifyAddressRequest(req.body);
			res.json(request);
		});

		self.app.get('/stars:hash', (req, res)=>{
			self.blockchain.getBlockByHash(req.params.hash).then((block) => {
				//TODO decode to ascii
				res.json(JSON.parse(block.body));
			});
		});

		self.app.get('/stars/address/:addr', (req, res)=>{
			self.blockchain.getBlocksByCriteria(req.params.addr).then((blocks) => {
				//TODO decode to ascii
				res.json(JSON.parse(blocks));
			});
		});
	}

    /**
     * Starting the REST Api application
     */
	start() {
		let self = this;
		this.app.listen(this.app.get("port"), () => {
			console.log(`Server Listening for port: ${self.app.get("port")}`);
		});
	}

}

new BlockAPI();