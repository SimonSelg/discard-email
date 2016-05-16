## discard-email

This packages provides an node wrapper around discard.email. It's not an official
client, and depends on the structure of the website, meaning it is likely to breaks
at some point.

#### Usage:

Install it using
```npm install --production discard-email```

Each function returns a promise. `DiscardEmail.refreshMailDomains()` needs to be called before the first usage.

This example uses await/async from the ES7 draft. You can also just use plain ES6.
```javascript
import DiscardEmail from 'discard-email'

// somewhere in an async function:

try {
  // refresh the list of available domains (needed!)
  await DiscardEmail.refreshMailDomains()

  // create an new instance
  const discardEmail = new DiscardEmail('e7n9bd664v@discard.email')
  const emails = await discardEmail.listEmails()
  // returns an array of the available emails in this form:
  // [{
  //   id: 'xxxxxxxxxxxxxx',
  //   sender: 'example@example.com',
  //   subject: 'test'
  // },
  // ....
  // ]

  // returns the email in plaintext
  const email = await discardEmail.getEmail(emails[0].id)
} catch (err) {
  console.log('error', err)
} finally {
  console.log('done')
}
```
