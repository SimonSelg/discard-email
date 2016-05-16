#! /usr/bin/env node
import DiscardEmail from 'discard-email'

// somewhere in an async function:

async function doMagic () {
  try {
    // refresh the list of available domains (needed!)
    await DiscardEmail.refreshMailDomains()

    // create an new instance
    const discardEmail = new DiscardEmail('e7n9bd664v@discard.email')
    const emails = await discardEmail.listEmails()
    const email = await discardEmail.getEmail(emails[0].id)
    console.log(email)
  } catch (err) {
    console.log('error', err)
  } finally {
    console.log('done')
  }
}

doMagic()
