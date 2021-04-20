import test from 'tape'
import parseDob from './parse-dob.js'
import getForAllLocales from './locales.js'
import { toISO } from './utils.js'

const valid = [
  ['1982', '1982'],
  ['1982-3', '1982-03'],
  ['12/29/82', '1982-12-29'],
  ['December 8, 1982', '1982-12-08'],
  ['febbrura 7, 45', '1945-02-07'],
  ['2010-02-01', '2010-02-01'],
  ['mar 23 83', '1983-03-23'],
  ['may 7, 45', '1945-05-07'],
  ['jun 7th, 2002', '2002-06-07'],
  ['10 jun 2020', '2020-06-10'],
  ['1 12 2020', '2020-01-12'],
  ['2021-01-12', '2021-01-12', 'af-ZA'],
  ['jun 2,08', '2008-06-02'],
  ['june 14', '2014-06'],
  ['10 jul 1998', '1998-07-10'],
  ['jul 1 1998', '1998-07-01'],
  ['dec 18, 28', '1928-12-18'],
  [
    // today should be today
    toISO({
      year: new Date().getFullYear(),
      month: new Date().getMonth() + 1,
      date: new Date().getDate(),
    }),
    toISO({
      year: new Date().getFullYear(),
      month: new Date().getMonth() + 1,
      date: new Date().getDate(),
    }),
  ],
]

const invalid = [
  ['', null],
  ['b', null],
  ['blah', null],
  ['198', null],
  ['23423423', null],
  ['dec 29, 9', null],
  ['june june', null],
  ['june garbage', null],

  [
    // tomorrow should fail
    toISO({
      year: new Date().getFullYear(),
      month: new Date().getMonth() + 1,
      date: new Date().getDate() + 1,
    }),
    null,
  ],
]

test('parseDob', t => {
  valid.forEach(([input, output, locale]) => {
    t.equal(
      parseDob(input, locale || 'en-US'),
      output,
      `in: ${input} should be ${output}`
    )
  })

  invalid.forEach(([input, output, locale]) => {
    t.equal(
      parseDob(input, locale || 'en-US'),
      output,
      `in: ${input} should be ${output}`
    )
  })
  t.end()
})

test('parseDob various locales', t => {
  const startingDate = new Date()
  startingDate.setFullYear(startingDate.getFullYear() - 100)

  const today = new Date()

  while (startingDate < today) {
    const inputString = startingDate.toISOString().slice(0, 10)
    const validValues = getForAllLocales(inputString)

    validValues.forEach(({ input, output, locale }) => {
      const value = parseDob(input, locale)
      if (value !== output) {
        // eslint-disable-next-line no-console
        console.log(
          `locale: ${locale} with input: ${input} should be ${output} actual value was ${value}`
        )
        // eslint-disable-next-line no-undef
        process.exit(1)
      }
    })

    // increment date one year
    startingDate.setDate(
      startingDate.getDate() + Math.round(Math.random() * 300)
    )

    t.pass(`passed for ${inputString} in ${validValues.length} locales`)
  }

  t.end()
})
