# breezy-yahrzeits
Utilities for delivering Yahrzeit functionality for Breeze users

## Overview
This script compiles yahrzeits (Gregorian or Hebrew) that fall within the Gregorian month of your choosing.

It will dump two files:
1. CSV of filtered yahrzeit form responses (members only)
2. Text file of those yahrzeits by week (members and deceased members)

Then, it will ask if you want to email the mourners. If so, it will use `email_template.js` for the contents.

## Getting this up and running on a local machine

### New Machine Setup
* Install node
  * https://nodejs.org/en/#home-downloadhead
* Go to https://github.com/jasmosez/breezy-yahrzeits
* Sopy url from green code button
* open terminal
* Pick and/or make a directory
  * `mkdir code`
* Go into that directory
  * `cd code`
  * `git clone [thing you copied from github]`
* At this point it may prompt you to install git and/or command line developer tools. Go ahead and do that
* Create `.env` file
  * `touch .env`
  * `open  .env` (will likely open file in text editor)
  * Paste contents (from whatever source you are copying it)
  * Save and close
* Run these in the repo folder (breezy-yahrzeits)
  * `npm install` (this adds any package the app needs to run)
  * `npm test` (this is a great way to make sure things are installed correctly)

### Run the App
* `npm start`

### Update the app
* `git pull`
* `npm install`
