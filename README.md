# O-commerce Overview

An e-commerce website implemented using NoSQL databases.

## Technologies Used
- `JavaScript`
- `Express`: Fast, unopinionated, minimalist web framework for Node.js
- `mongoDB`: Document-oriented database that stores data in JSON-like documents.
- `mongoose`: Object Data Modeling (ODM) library for MongoDB and Node.js. 
## Getting Started

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes.


## Installation
1. Clone the repo to your local machine: `git clone https://github.com/omarsabra1/O-commerce.git `.

2. Install the dependencies using NPM: ` cd O-commerce`

3. Install the necessary dependencies: `npm install`.

## Running the Application

- To run the app in development mode, use: `npm run start`.
- To run the app in production mode, use: `npm run start-server`.
## Code Structure

The application code is organized as follows:
- `app.js`: The entry point of the application.
- `util/DB.js`: To connect mongoose with mongoDB.
- `views`: This Folder contains the HTML templates for the application.
- `public`: This Folder contains static files, such as CSS and JavaScript files.
- `models`: This folder he define a mongoose schema files.
- `authCheck/check-auth.js`: Verifies JWT tokens.
-  `controllers`: This folder interact with the models to retrieve and save data.
-  `routes`: This folder he mange routes for the all project.

## Contact Information
If you have any questions or feedback, please feel free to reach out to me on LinkedIn or via email.