# ProjectLink frontend

ProjectLink is a frontend-only student collaboration platform. It uses plain **HTML, CSS and JavaScript**—no frameworks or installation required.

## Run it

1. Open this folder in File Explorer.
2. Double-click `index.html` to open it in a browser.
3. On the landing page, choose **Explore projects** or **Try the demo**.
4. Select either Requester or Helper on the sign-in screen. Everything uses local sample data, so no password is needed.

## What is included

- Landing, sign in, and registration screens
- Requester and Helper dashboards
- Freelancer sign-in and dedicated workspace with project offer selection
- Freelancer payment activity and demo payout requests (no real money is transferred)
- Project browsing, filtering and project details
- Create-project form with difficulty preview
- Offer submission and offer review
- Profile and skills management
- Shared workspace with tasks, chat, files, payment and completion sections

## Later backend connection points

All sample data and action functions are grouped in `app.js`. Replace the `projects`, `offers`, `workspace`, and `user` mock data with Java API calls when the backend is ready. The screens map directly to the project modules: Users/Profiles, Skills/Matching, Project Requests, Browser, Offers, Payments, Difficulty Analysis, Workspace, Tasks, Chat, Files and Completion.
