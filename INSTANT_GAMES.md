# Meta Instant Games

## Build the upload

Run `npm run package:instant`. Upload `bashoadha-instant-game.zip` in the Meta Instant Games developer dashboard. The archive has `index.html` at its root, relative asset paths, and no PWA service worker. The normal `npm run build` remains the web/PWA build.

## Dashboard setup

1. Create a game in Meta for Developers and enable Instant Games.
2. Upload the ZIP as a game build and test it using a developer/tester account.
3. Configure the game's title, icon, cover image, and supported locales in the dashboard.
4. Test initialization, invite sharing, score sharing, and gameplay on Facebook's supported mobile clients.
5. Submit the game for review and publish it from the dashboard. Meta controls approval and availability.

The Instant Games SDK is initialized before the app mounts. The title screen's share control opens an invite, and the completion screen shares a score card with the score attached as share data. Web builds use the browser share sheet when available.

## Backend note

The ZIP contains only the client. The current Express server and its file-backed global leaderboard are not included, so global leaderboard syncing requires a separately deployed HTTPS API with appropriate CORS settings, or a migration to Meta platform leaderboards. Local progress and gameplay remain available without that backend. Meta dashboard configuration, review, and publishing also require the app owner's Meta account and cannot be completed from this repository.