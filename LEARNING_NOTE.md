# Learning Note — Leave Tracker Assignment

## What Was New to Me in This Assignment

### 1. Web Crypto API (browser-side encryption)

I had not used browser encryption before. In this project I needed to encrypt the
password and record IDs in the browser before sending them to the backend. I used
the browser's built-in `crypto.subtle` API for this. The hardest part was making
sure the frontend and backend used the exact same format so both sides could read
each other's data. I learned this by reading the MDN documentation and testing
both sides together.

Time taken: around 3–4 hours.

### 2. Express async error handling

When I used async functions in Express route handlers, errors were not being caught
automatically. The app would just hang or crash silently. I learned that Express 4
does not handle async errors by default. I fixed this by patching `Router.Layer` at
startup so any error in an async function is automatically sent to the global error
handler. This made all error responses consistent across the app.

Time taken: around 1–2 hours.

### 3. MySQL JSON_CONTAINS

In my database the `roleset` column stores a JSON array of role IDs like `[1, 2]`.
I needed to check if a user has the manager role directly in SQL. I learned to use
`JSON_CONTAINS(roleset, '2', '$')` for this. This is better than fetching all users
and checking in JavaScript because the filtering happens inside the database.

Time taken: around 1 hour.

### 4. Role ID vs role name mismatch

The database stores roles as numbers (1 = employee, 2 = manager, 3 = admin). But
my middleware and frontend work with name strings like employee, manager, admin. I
kept getting authorization failures because a number and a string never match even
if the value looks the same. I fixed this by converting numeric IDs to name strings
at login and on the `/me` endpoint, so the rest of the app always works with names.

Time taken: around 2 hours.

---

## What I Would Still Like to Understand Better

Refresh token flow — right now when the JWT expires the user gets logged out and
has to login again. In a real app a refresh token would automatically get a new JWT
without logging out. I understand the concept but I have not implemented it yet.

---

# Change Request — What Changed and Why

The change request was to hide database IDs from browser URLs so users cannot see
or guess record IDs.

## What I Did

- On the frontend, before navigating to any detail page I encrypt the record ID
  using AES-128-CBC encryption and put the encrypted value in the URL instead of
  the real ID.
- On the backend I added a `decryptId` middleware that decrypts the ID from the URL
  before it reaches the controller. So the controller always works with the real
  integer ID.
- Both frontend and backend use the same secret key set in environment variables.
- I also applied the same encryption to the login password — the frontend encrypts
  the password before sending it, and the backend decrypts it before comparing with
  bcrypt.

## Why

This prevents users from guessing or changing IDs in the browser address bar to
access other people's records.

---

# Updated Design Note — What Stayed the Same and What Changed

Everything from my Phase 1 design note was built exactly as planned:

- Leave days are counted as working days only using the calendar table
- Overlapping requests are blocked in SQL before creating a new request
- Leave balance is only deducted when a request is approved, inside a database transaction
- The assigned manager is saved at the time the request is created, so manager
  changes later do not affect existing requests
- Every status change is recorded in the leave activities table as an audit log
- Users can have multiple roles and switch between them

The only thing not in my Phase 1 note was ID obfuscation, which came in as the
change request. I added the encrypt/decrypt utility on both sides and the
`decryptId` middleware to handle it.
