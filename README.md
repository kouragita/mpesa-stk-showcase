# M-Pesa STK Push demo

A working payment demo: a React page, an Express API, and a real Safaricom Daraja STK push in between. Enter a phone number and amount, the handset shows the M-Pesa prompt, and the server receives the callback.

## Why I built it

Most STK push tutorials stop once the access token works. The parts that cause trouble come after: the callback that arrives twice, the user who dismisses the prompt, and the case where nothing arrives and you have to query Safaricom to find out what happened.

I built this to have one place where the whole loop exists, so I could see where it actually breaks.

## What works

- OAuth token request against Daraja, using the consumer key and secret
- STK push request signed with shortcode, passkey and timestamp
- Callback endpoint that receives the result and logs the parsed payment metadata
- Health endpoints at `/api/health` and `/api/mpesa/health`
- React front end with Tailwind that collects the phone number and amount

## What is not wired up

I would rather say this plainly than let someone discover it:

- **The callback does not write to the database.** It parses `CallbackMetadata` and logs it, but the `updateTransaction` call is commented out. Nothing lands in MongoDB from a payment.
- **The UI thanks the visitor on a ten second timer,** not on a confirmed payment. It is a demo of the request, not of the confirmation.
- **Login and registration return 501.** This build was about the payment flow, so the auth routes were left as stubs rather than faked.
- **The callback trusts whoever calls it.** There is no check that the request came from Safaricom, and no deduplication by `CheckoutRequestID`.

## How a request flows

```
React (Vite)  ->  Express API  ->  Daraja STK push  ->  Safaricom
                        ^                                   |
                        +--------- callback ----------------+
```

The signing is the part worth reading:

```js
// OAuth: basic auth on the consumer key and secret
const auth = Buffer.from(`${consumerKey}:${consumerSecret}`).toString('base64');

// STK password: shortcode + passkey + timestamp, base64 encoded
function generatePassword(shortCode, passkey, timestamp) {
  return Buffer.from(shortCode + passkey + timestamp).toString('base64');
}
```

## Running it

```bash
npm install
cp .env.example .env.local
npm run dev
```

`npm run dev` starts Vite and the API together. For one at a time, use `npm run dev:frontend` or `npm run dev:backend`. The API reads `.env.local` specifically, not `.env`.

Variables: `MPESA_CONSUMER_KEY`, `MPESA_CONSUMER_SECRET`, `MPESA_SHORTCODE`, `MPESA_PASSKEY`, `MPESA_CALLBACK_URL`, `MPESA_ENV`, `MONGODB_URI`, `JWT_SECRET`.

Safaricom has to reach the callback, so during development that URL has to be public. I used a tunnel and pointed `MPESA_CALLBACK_URL` at it.

With placeholder credentials the push returns `502` and a message of `M-Pesa rejected the request (HTTP 400)`. That is the expected failure: the request left the server and Daraja refused it. Real sandbox keys are what produce a prompt on the handset.

## What I would change next

1. Persist the callback. Write the result against `CheckoutRequestID` and make the write idempotent, because the callback can arrive more than once.
2. Remove the timer and drive the UI from the stored payment state.
3. Verify the callback source, or at minimum reconcile late with the query API.
4. Split the single front end component, which currently holds the whole page.
5. Add tests. There are none, and that is the weakest part of this repo.

## Stack

React, Vite, Tailwind, Express, MongoDB, JWT, M-Pesa Daraja.
