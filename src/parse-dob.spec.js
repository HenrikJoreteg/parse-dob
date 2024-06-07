import test from 'tape'
import parseDob from './parse-dob.js'
import getForAllLocales from './locales.js'
import { toISO } from './utils.js'

const valid = [
  ['feb 12, 2018', '2018-02-12'],
  ['122982', '1982-12-29'],
  ['291282', '1982-12-29'],
  ['291282', '1982-12-29', 'en-AU'],
  ['291282', '1982-12-29', 'en-CA'],
  ['29121982', '1982-12-29'],
  ['12291982', '1982-12-29'],
  ['010182', '1982-01-01'],
  ['1982', '1982'],
  ['1982-3', '1982-03'],
  ['12/29/82', '1982-12-29'],
  ['10/11/82', '1982-10-11'],
  ['10/11/82', '1982-11-10', 'en-AU'],
  ['December 8, 1982', '1982-12-08'],
  ['febbrura 7, 45', '1945-02-07'],
  ['2010-02-01', '2010-02-01'],
  ['mar 23 83', '1983-03-23'],
  ['may 7, 45', '1945-05-07'],
  ['jun 7th, 2002', '2002-06-07'],
  ['10 jun 2020', '2020-06-10'],
  ['1 12 2020', '2020-01-12'],
  ['1 12 2020', '2020-12-01', 'en-AU'],
  ['1 12 2020', '2020-12-01', 'en-CA'],
  ['2021-01-12', '2021-01-12', 'af-ZA'],
  ['jun 2,08', '2008-06-02'],
  ['june 14', '2014-06'],
  ['10 jul 1998', '1998-07-10'],
  ['jul 1 1998', '1998-07-01'],
  ['dec 18, 28', '1928-12-18'],
  ['12, 29', '1929-12'],
  ['29 dec', '1929-12'],
  // special cases
  ['20 dec 23', '2023-12-20'],
  ['20 dec 23', '2023-12-20', 'en-US'],
  ['20 dec 23', '2020-12-23', 'en-CA'], // canada puts years first by default
  ['20 dec 23', '2023-12-20', 'en-AU'],
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
  [null, null],
  [{}, null],
  [undefined, null],
  ['', null],
  ['b', null],
  ['blah', null],
  ['198', null],
  ['23423423', null],
  ['dec 29, 9', null],
  ['june june', null],
  ['june garbage', null],
  ['13291982', null],

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
      // @ts-ignore
      parseDob(input, locale || 'en-US'),
      output,
      `in: ${input} should be ${output}`
    )
  })
  t.end()
})

test('parseDob various locales when starting with yyyy-mm-dd', t => {
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
        // @ts-ignore
        process.exit(1) // eslint-disable-line no-undef
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
