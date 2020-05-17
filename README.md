## What is ipcountry-proxy?

A simple nodejs app for proxying API requests to external "IP to Country" APIs.

It allows adding any number of API vendors and limit number of requests per hour per API vendor.

## Requirements

Node 12

## Common setup

Clone the repo and install the dependencies.

```bash
git clone https://github.com/velsa/ipcountry-proxy.git
```

cd ipcountry-proxy
npm install

## Running the app

```bash
npm start
```

To run the app in debug mode (will show additional data in each API response):

```bash
npm run debug
```

Open http://localhost:3000 to see the short help

## Run tests

Will test all routes for various scenarios

```bash
npm run test
```

## Deploy

The app can be easily deployned to AWS or Netlify
