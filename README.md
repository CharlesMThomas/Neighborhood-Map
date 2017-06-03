# Neighborhood Map

A single page application featuring my favorite restaurants in Ft. Myers, FL. The app features both a map and list view for highlighting locations and retrieving third-party data about those locations from the Yelp API.

## Dependencies
***

Neighborhood map was built using Node in order to prevent cross-domain issues presented by the Yelp API. Below are the required Node modules necessary to run the Neighborhood Map app.

* **Node** -  A JavaScript runtime built on Chrome's V8 JavaScript engine. Node.js uses an event-driven, non-blocking I/O model that makes it lightweight and efficient. 

* **Express** - Fast, unopinionated, minimalist web framework for node.

* **Request** - Request is designed to be the simplest way possible to make http calls. It supports HTTPS and follows redirects by default.

* **body-parser** - Parse incoming request bodies in a middleware before your handlers, available under the req.body property.

## Configuration
***

Download and install Node for your operating system. Node is available for Mac, Linux and Windows.

[Node Download Page](https://nodejs.org/en/download/)

NPM (Node Package Manager) is bundled with Node and allows for easy installation of the required dependecies. Dependencies can be installed all at once or one at a time.

### Install All Dependencies

`$ npm install`

_This command installs all of the required dependencies listed in the package.json file._

### Install Indivual Dependencies

**Express**

`$ npm install express`

**Request**

`$ npm install request`

**body-parser**

`$ npm install body-parser`

## Installation
***

Clone this repository on to your local machine:

`$ clone https://github.com/CharlesMThomas/Neighborhood-Map.git`

or download the respository zip file and extract to your local machine.

## Operating Instructions
***

Start the express server:

` $ node server.js `

View the Neighborhood Map application:

` $ open http://localhost:8080 `

or 

Open **http://localhost:8080** in your browser

#### Enjoy the app!