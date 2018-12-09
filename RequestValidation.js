const SHA256 = require('crypto-js/sha256');
const bitcoinMessage = require('bitcoinjs-message');
const Blockchain = require('./Blockchain.js')
const Block = require('./Block.js')


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
            request.message = "19xaiMqayaNrn3x7AjV5cU4Mk5f5prRVpL:1541605128:starRegistry";
            self.updateValidationWindow(request);
            this.mempool.push(request);
        } else {
            self.updateValidationWindow(existingRequest);
        }
        return existingRequest || request;
    }

    requestObject(address) {
        var existingRequest = null;
        console.log(this.mempool.length);
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
                existingRequest = this.mempool[i];
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
        var self = this;
        var request = self.requestObject(addr);
        if (request) {
            self.updateValidationWindow(request);
            if (request.validationWindow > 0) {
                isValid = bitcoinMessage.verify(request.message, request.address, signature);
                if (isValid) {
                    self.removeValidationRequest(request.address);
                    self.mempoolValid.push({
                        isValid: true,
                        registerStar: true,
                        status: {
                            address: request.address,
                            requestTimeStamp: request.requestTimeStamp,
                            message: request.message,
                            validationWindow: request.validationWindow,
                            messageSignature: isValid
                        }
                    });
                    self.timeoutValidRequests[request.address] =
                        setTimeout(function () {
                            self.removeValidRequest(request.address)
                        }, self.TimeoutValidRequestsWindowTime);
                }
            }
        }
        return isValid;
    }

    removeValidRequest(address) {
        var foundIndex = -1;
        for (var i = 0; i < this.mempoolValid.length; i++) {
            if (this.mempoolValid[i].status.address == address) {
                foundIndex = i;
                break;
            }
        }
        if (foundIndex >= 0) {
            this.mempoolValid.splice(foundIndex, 1);
        }
        if (self.timeoutValidRequests.hasOwnProperty(address)) {
            delete self.timeoutValidRequests[address];
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

    verifyAddressRequest(starRequest) {
        var validationRequest = this.requestObject(starRequest.address);
        var validRequest = this.requestObjectFromValidMempool(starRequest.address);
        console.log(validationRequest);
        console.log(validRequest);
        console.log(starRequest);
        if (validRequest && validRequest.isValid
            && starRequest.star && !starRequest.star.length) {
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
            this.blockchain.addBlock(newBlock);
            newBlock.storyDecoded = hex2ascii(newBlock.story);
            return newBlock;
        }
        return null;
    }

    getBlocksByCriteria(address) {
        return this.blockchain.getBlocksByCriteria(function (block) {
            var data = JSON.parse(block.body);
            return data.address == address;
        })
    }
}

/**
 * Exporting the RequestValidation class
 */
module.exports = () => { return new RequestValidation(); }