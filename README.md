# Tate ticket checker

Tate ticket checker checks the [Tate.org.uk shop](https://shop.tate.org.uk) to see if there are tickets available for a selected event.

I wrote this with [Yayoi Kusama's Infinity Mirror Rooms](https://www.tate.org.uk/whats-on/tate-modern/exhibition/yayoi-kusama-infinity-mirror-rooms) in mind - this exhibition was sold out 6+ months in advance but returns can come available at the shop at any time.

## Requirements

This application is designed to live on AWS and requires Node.js 14+ and Serverless

- [Node.js](https://nodejs.org)
- [Serverless Framework](https://www.serverless.com/)

## Environment Variables

You will need to create a copy of `.env.sample` in the root directory and rename it to `.env` before updating the values as you want them

- `TICKET_URL` - this can stay as is
- `EVENT_ID` - the event ID (find this by going to the exhibition in the shop and inspecting the url)
- `NUM_DAYS` - the number of days to check (1 will check only today, 2 will check today and tomorrow, etc)
- `INTERVAL_MINS` - the check interval (eg 5 will check every 5 minutes)

## Run Locally

```bash
npm install
sls invoke local -f check
```

## Run Tests

```bash
jest
```

## Deploy to AWS (requires account)

```bash
npm install
npm run layers
sls deploy
```

You can verify the deployment was successful by running

```bash
sls invoke -f check
```

## Future Enhancements

- Add a db to track changes in availability (for notification purposes)
- Send an email when tickets become available
