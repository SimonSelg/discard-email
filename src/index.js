#! /usr/bin/env node
const request = require('request-promise')

export default class DiscardEmail {
  static domains = {}

  static async refreshMailDomains () {
    DiscardEmail.domains = {}

    const response = await request({
      uri: 'http://discard.email/',
      method: 'GET',
      resolveWithFullResponse: true
    })

    const re = /<option value="(\d+)">(.+?(?!pw)) <\/option>/g
    let match
    while ((match = re.exec(response.body))) {
      DiscardEmail.domains[match[2]] = match[1]
    }
  }

  constructor (address) {
    const [suffix, domain] = address.split('@')
    if (!(domain in DiscardEmail.domains)) {
      //  no emails for this domain
      throw new Error('Invalid domain')
    }

    this.suffix = suffix
    this.domain = domain
    this.domainCode = DiscardEmail.domains[domain]

    this.jar = request.jar()
  }

  async listEmails () {
    const body = await request.post({
      headers: {
        'content-type': 'application/x-www-form-urlencoded'
      },
      url: 'http://discard.email',
      jar: this.jar,
      form: {
        'LocalPart': this.suffix,
        'DomainType': 'public',
        'DomainId': this.domainCode,
        'LoginButton': 'Postfach abrufen'
      },
      followAllRedirects: true
    })

    const re = /<div class="Head"><a href="http:\/\/discard.email\/message-(.+?).htm">(.+?)<br \/><span class="Subject">(.+?)<\/span><\/a><\/div>/g
    let match
    let emails = []
    while ((match = re.exec(body))) {
      const email = {
        id: match[1],
        sender: match[2],
        subject: match[3]
      }
      emails.push(email)
    }

    return emails
  }

  async getEmail (messageId) {
    let response
    try {
      response = await request({
        uri: `http://discard.email/message-${messageId}-mailVersion=plain.htm`,
        method: 'GET',
        jar: this.jar
      })
    } catch (err) {
      throw new Error('Invalid email id')
    }

    // extact the email plaintext
    const re = /<div id="MessageContent">\s<div>\s([\s\S]+?)<\/div>\s<\/div>\s<\/div>\s<\/section>/
    const result = response.match(re)

    if (result.length === 0) throw new Error('Invalid email id')

    let email = result[1]

    // replace line breaks
    email = email.replace(/<br \/>/g, '')
    // replace links
    email = email.replace(/<a href="(.+?)" rel="external">.+?<\/a>/g, '$1')

    return email
  }
}
