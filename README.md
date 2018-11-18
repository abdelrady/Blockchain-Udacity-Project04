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


### 

Another endpoint is used to add more blocks to the chain

```
POST /block

HTTP Payload
{
"data": "A new block added from client app"
}
```

## Authors

* **Abdelrady Tantawy** - *Adding code for endponts and updating readme.md* 

* **Jose Perera Morales** - *Adding Boilerplate* 


## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details

## Acknowledgments

* Thanks for Udacity & MISK team for provinding code boilerplate for this project.
