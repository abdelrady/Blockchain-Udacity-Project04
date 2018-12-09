# Project #3 - Creating Webservices with ExpressJS

## Getting Started

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

Some nodejs packages are required for this project to run. If you don't have nodejs installed please use the following url to install latest stable version.

```
https://nodejs.org/en/download/
```

### Installing

install packages

```
npm install
```


run solution

```
npm start
```

open solution in browser

```
http://localhost:8000/
```


## Running the tests


### 

This project has 6 endpoints to test:

```
POST /requestValidation
```

this will start for validation process.

Expected HTTP body data
{
"address": "any wallet public address"
}

output will be something like this 
{
    "address": "13fpecq4wTkCHiStJMfE6NCZ1VWZLB6v6E",
    "requestTimeStamp": "1544380303",
    "message": "13fpecq4wTkCHiStJMfE6NCZ1VWZLB6v6E:1544380303:starRegistry",
    "validationWindow": 300
}
### 

Another endpoint is used to validate the block

```
POST /message-signature/validate

HTTP Payload
{
"address":"13fpecq4wTkCHiStJMfE6NCZ1VWZLB6v6E",
 "signature":"ICd/9nQTTjsXmS4VRv9qLtNYy0KbAwR8zhhh8Fovv0CiX62Xn+US6K1LPAF1Y5JuWm+uq3/ADwt7YuWAPYcAqyA="
}

Responses

If a valid block data is passed then response should look like this JSON result
{
    "registerStar": true,
    "status": {
        "address": "13fpecq4wTkCHiStJMfE6NCZ1VWZLB6v6E",
        "requestTimeStamp": "1544380303",
        "message": "13fpecq4wTkCHiStJMfE6NCZ1VWZLB6v6E:1544380303:starRegistry",
        "validationWindow": 1800000,
        "messageSignature": "valid"
    }
}

else response will have registerStar= false & messageSignature="invalid"
```


Another endpoint is used to add the star block

```
POST /block

Sample HTTP Payload
{
    "address": "13fpecq4wTkCHiStJMfE6NCZ1VWZLB6v6E",
    "star": {
        "dec": "68° 52' 56.9",
        "ra": "16h 29m 1.0s",
        "story": "Found star using https://www.google.com/sky/"
    }
}

Responses

If a valid star lock data is passed and a valid block found in mempool then response should look like this JSON result
{
    "hash": "e63aa48657d5900e28b4157fd8282d6a996c4985e41bf6412cc74681656e80a4",
    "previousBlockHash": "0857cf89285f7f7796de4b496e89c9fd16b5b20dab24ec88fb8533e3a7d6a8d7",
    "height": 12,
    "body": {
        "address": "13fpecq4wTkCHiStJMfE6NCZ1VWZLB6v6E",
        "star": {
            "ra": "16h 29m 1.0s",
            "dec": "68° 52' 56.9",
            "story": "466f756e642073746172207573696e672068747470733a2f2f7777772e676f6f676c652e636f6d2f736b792f",
            "storyDecoded": "Found star using https://www.google.com/sky/"
        }
    },
    "time": "1544380326"
}

else 500 HTTP code will be back with a message from server
```

Another endpoint is used to get star by block hash

```
GET /stars/hash:[hash]

Responses

If a star block hash found in blockchain then response should look like this JSON 
{
    "address": "13fpecq4wTkCHiStJMfE6NCZ1VWZLB6v6E",
    "star": {
        "ra": "16h 29m 1.0s",
        "dec": "68° 52' 56.9",
        "story": "466f756e642073746172207573696e672068747470733a2f2f7777772e676f6f676c652e636f6d2f736b792f",
        "storyDecoded": "Found star using https://www.google.com/sky/"
    }
}

else 500 HTTP code will be back with a message from server ("Block Not Found.")
```

Another endpoint is used to get star by block height

```
GET /block/[:height]

Responses

If a star block height found in blockchain then response should look like this JSON 
{
    "address": "13fpecq4wTkCHiStJMfE6NCZ1VWZLB6v6E",
    "star": {
        "ra": "16h 29m 1.0s",
        "dec": "68° 52' 56.9",
        "story": "466f756e642073746172207573696e672068747470733a2f2f7777772e676f6f676c652e636f6d2f736b792f",
        "storyDecoded": "Found star using https://www.google.com/sky/"
    }
}

else 500 HTTP code will be back with a message from server ("height is out of bound.")
```

Another endpoint is used to get stars array by wallet address

```
GET /stars/address:[address]

Responses

If blocks found in blockchain with this wallet address then response should look like this JSON 
[{
    "address": "13fpecq4wTkCHiStJMfE6NCZ1VWZLB6v6E",
    "star": {
        "ra": "16h 29m 1.0s",
        "dec": "68° 52' 56.9",
        "story": "466f756e642073746172207573696e672068747470733a2f2f7777772e676f6f676c652e636f6d2f736b792f",
        "storyDecoded": "Found star using https://www.google.com/sky/"
    }
}]

else empty array result will be back from server.
```

## Authors

* **Abdelrady Tantawy** - *Adding code for endponts and updating readme.md* 

* **Jose Perera Morales** - *Adding Boilerplate* 


## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details

## Acknowledgments

* Thanks for Udacity & MISK team for provinding code boilerplate for this project.
