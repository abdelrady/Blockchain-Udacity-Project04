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

This project has 2 endpoints to test:

```
GET /block/:index
```

this will get a block at specific chain index.

If index is correct and found in the chain then api will return this sample JSON response
{
"hash": "afadc5cf4ab5ff858cc1676244b56833405d1ad2a4291aca13c6d8e61daceaa8",
"height": 0,
"body": "A new block added from client app",
"time": "1542559615"
}

Otherwise a 500 HTTP response with an error message will be returned from server

### 

Another endpoint is used to add more blocks to the chain

```
POST /block

HTTP Payload
{
"body": "A new block added from client app"
}

Responses

If a valid block data is passed then answer should look like this JSON result
{
"hash": "afadc5cf4ab5ff858cc1676244b56833405d1ad2a4291aca13c6d8e61daceaa8",
"height": 0,
"body": "A new block added from client app",
"time": "1542559615"
}

If empty block data passed then a 500 HTTP response with an error message will be returned from server
```

## Authors

* **Abdelrady Tantawy** - *Adding code for endponts and updating readme.md* 

* **Jose Perera Morales** - *Adding Boilerplate* 


## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details

## Acknowledgments

* Thanks for Udacity & MISK team for provinding code boilerplate for this project.
