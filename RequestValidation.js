const SHA256 = require('crypto-js/sha256');
const bitcoinMessage = require('bitcoinjs-message');
const Blockchain = require('./Blockchain.js');
const Block = require('./Block.js');
const hex2ascii = require('hex2ascii');

/**
 * Controller Definition to encapsulate routes to work with blocks
 */
class RequestValidation {

    constructor() {
        this.blockchain = new Blockchain();
        this.mempool = [];
        this.mempoolValid = [];
        this.timeoutRequests = {};
        this.timeoutValidRequests = {};
        this.TimeoutRequestsWindowTime = 5 * 60 * 1000;
        this.TimeoutValidRequestsWindowTime = 30 * 60 * 1000;
    }

    AddRequestValidation(request) {
        var self = this;
        var req = self.addRequestToMempool(request);
        self.timeoutRequests[req.address] =
            setTimeout(function () {
                self.removeValidationRequest(req.address)
            }, self.TimeoutRequestsWindowTime);
        return req;
    }

    addRequestToMempool(request) {
        let self = this;
        var existingRequest = self.requestObject(request.address);
        if (!existingRequest) {
            request.requestTimeStamp = new Date().getTime().toString().slice(0, -3);
            request.message = request.address + ":" + request.requestTimeStamp + ":starRegistry";
            self.updateValidationWindow(request);
            this.mempool.push(request);
        } else {
            self.updateValidationWindow(existingRequest);
        }
        return existingRequest || request;
    }

    requestObject(address) {
        var existingRequest = null;
        for (var i = 0; i < this.mempool.length; i++) {
            if (this.mempool[i].address == address) {
                existingRequest = this.mempool[i];
                break;
            }
        }
        return existingRequest;
    }

    requestObjectFromValidMempool(address) {
        var existingRequest = null;
        for (var i = 0; i < this.mempoolValid.length; i++) {
            if (this.mempoolValid[i].status.address == address)
                existingRequest = this.mempoolValid[i];
        }
        return existingRequest;
    }

    updateValidationWindow(req) {
        let timeElapse = (new Date().getTime().toString().slice(0, -3)) - req.requestTimeStamp;
        let timeLeft = (this.TimeoutRequestsWindowTime / 1000) - timeElapse;
        req.validationWindow = timeLeft;
    }

    validateRequestByWallet(addr, signature) {
        let isValid = false;
        let generatedStarRequest = {
            registerStar: false,
            status: {
                address: addr,
                requestTimeStamp: 0,
                message: "",
                validationWindow: 0,
                messageSignature: "invalid"
            }
        };
        var self = this;
        var request = self.requestObject(addr);
        if (request) {
            self.updateValidationWindow(request);
            //Update values from original request
            generatedStarRequest.status.requestTimeStamp = request.requestTimeStamp;
            generatedStarRequest.status.validationWindow = request.validationWindow;
            generatedStarRequest.status.message = request.message;

            if (request.validationWindow > 0) {
                isValid = bitcoinMessage.verify(request.message, request.address, signature);
                if (isValid) {
                    self.removeValidationRequest(request.address);
                    //Update valid request values
                    generatedStarRequest.registerStar = true;
                    generatedStarRequest.status.validationWindow = self.TimeoutValidRequestsWindowTime;
                    generatedStarRequest.status.messageSignature = "valid";
                    self.mempoolValid.push(generatedStarRequest);
                    self.timeoutValidRequests[request.address] =
                        setTimeout(function () {
                            self.removeValidRequest(request.address)
                        }, self.TimeoutValidRequestsWindowTime);
                }
            }
        }
        return generatedStarRequest;
    }

    removeValidRequest(address) {
        console.log('r addr1: ' + address);
        var foundIndex = -1;
        for (var i = 0; i < this.mempoolValid.length; i++) {
            console.log('r pool[i]: ' + JSON.stringify(this.mempoolValid[i]));
            if (this.mempoolValid[i].status.address == address) {
                foundIndex = i;
                break;
            }
        }
        console.log(foundIndex);
        if (foundIndex >= 0) {
            this.mempoolValid.splice(foundIndex, 1);
        }
        if (this.timeoutValidRequests.hasOwnProperty(address)) {
            delete this.timeoutValidRequests[address];
        }
    }

    removeValidationRequest(address) {
        var foundIndex = -1;
        for (var i = 0; i < this.mempool.length; i++) {
            if (this.mempool[i].address == address) {
                foundIndex = i;
                break;
            }
        }
        if (foundIndex >= 0) {
            this.mempool.splice(foundIndex, 1);
        }
        if (this.timeoutRequests.hasOwnProperty(address)) {
            delete this.timeoutRequests[address];
        }
    }

    async verifyAddressRequest(starRequest) {
        //No need to fetch validation request as I remove it once it's valid
        //var validationRequest = this.requestObject(starRequest.address);
        var validRequest = this.requestObjectFromValidMempool(starRequest.address);
        if (validRequest && validRequest.registerStar &&
            this.isValidStarRequest(starRequest)) {
            let body = {
                address: starRequest.address,
                star: {
                    ra: starRequest.star.ra,
                    dec: starRequest.star.dec,
                    mag: starRequest.star.mag,
                    cen: starRequest.star.cen,
                    story: Buffer(starRequest.star.story).toString('hex')
                }
            };
            var newBlock = new Block(body);
            newBlock = await this.blockchain.addBlock(newBlock);
            newBlock = JSON.parse(newBlock);
            console.log(newBlock);
            newBlock.body.star.storyDecoded = hex2ascii(newBlock.body.star.story);
            console.log(newBlock.body.star.storyDecoded);
            
            this.removeValidRequest(starRequest.address);

            return newBlock;
        }
        return null;
    }

    isValidStarRequest(starRequest) {
        return starRequest.star && !starRequest.star.length &&
            starRequest.star.dec && starRequest.star.ra &&
            starRequest.star.story && starRequest.star.story.length < 500;
    }

    getBlockByHash(hash) {
        return this.blockchain.getBlockByHash(hash)
            .then((block) => {
                if(block){
                    var starData = block.body;
                    starData.star.storyDecoded = hex2ascii(starData.star.story);
                    return block;
                }
                return null;
            });
    }

    getBlockByHeight(height) {
        return this.blockchain.getBlock(height)
            .then((block) => {
                if(block){
                    var starData = block.body;
                    starData.star.storyDecoded = hex2ascii(starData.star.story);
                    return block;
                }
                else return null;
            });
    }

    async getBlocksByAddress(address) {
        let blocks = await this.blockchain.getBlocksByAddress(address);
        blocks.forEach((b) => b.body.star.storyDecoded = hex2ascii(b.body.star.story));
        return blocks;
    }
}

/**
 * Exporting the RequestValidation class
 */
module.exports = () => { return new RequestValidation(); }