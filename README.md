# HopeHand - Crowdfunding Platform

A modern crowdfunding platform built with React, Vite, and Tailwind CSS.

## Prerequisites

Before running this project, make sure you have the following installed:

- [Node.js](https://nodejs.org/) (v14 or higher)
- npm (comes with Node.js)

## Setup Instructions

1. Install Node.js from [https://nodejs.org/](https://nodejs.org/)
2. Clone this repository
3. Install dependencies:
   ```bash
   npm install
   ```
4. Create a `.env` file in the project root with the following variables:
   ```bash
   VITE_FIREBASE_API_KEY=your-api-key
   VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your-project-id
   VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
   VITE_FIREBASE_APP_ID=your-app-id
   ```
5. Get these values from your Firebase Console:
   - Go to [Firebase Console](https://console.firebase.google.com/)
   - Select your project (or create a new one)
   - Go to Project Settings
   - Under "Your apps", click the web app icon (</>)
   - Register your app if you haven't already
   - Copy the configuration values into your `.env` file
6. Start the development server:
   ```bash
   npm run dev
   ```

## Features

- Create and browse fundraising campaigns
- Donate to campaigns
- Track campaign progress
- User authentication
- Campaign management dashboard

## Tech Stack

- React
- TypeScript
- Vite
- Tailwind CSS
- React Router
- React Icons
