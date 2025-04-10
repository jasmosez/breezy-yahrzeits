# Breezy Yahrzeits

A web application for managing and tracking yahrzeits (Jewish memorial anniversaries).

## Features

- Track yahrzeits for members
- Send email reminders for upcoming yahrzeits
- Export yahrzeit data in various formats
- Manage organization settings

## Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

## Deployment

This project is deployed on Netlify with GitHub-triggered CI/CD.

## Environment Variables

Create a `.env.local` file with the following variables:

```
DATABASE_URL=your_database_url
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_nextauth_secret
```

For production, set these variables in your Netlify dashboard.

---

# Former CLI README
# breezy-yahrzeits
Utilities for delivering Yahrzeit functionality for Breeze users

## Overview
This script compiles yahrzeits (Gregorian or Hebrew) that fall within the Gregorian month of your choosing.

It will dump two files:
1. CSV of filtered yahrzeit form responses (members only)
2. Text file of those yahrzeits by week (members and deceased members)

Then, it will ask if you want to email the mourners. If so, it will use `sample_email_template.js`, or another specified file, for the contents.

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
