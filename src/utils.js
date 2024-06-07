const isNumber = str => /^\d+$/.test(str)
const containsLetters = str => /[a-z]/g.test(str)
const extractNumbers = str => {
  const match = (str || '').match(/\d+/)
  return (match && match[0]) || null
}

const months = {
  jan: '01',
  feb: '02',
  mar: '03',
  apr: '04',
  may: '05',
  jun: '06',
  jul: '07',
  aug: '08',
  sep: '09',
  oct: '10',
  nov: '11',
  dec: '12',
}

const clean = str =>
  str
    .replace(/[۰-۹]/g, d => '۰۱۲۳۴۵۶۷۸۹'.indexOf(d))
    .replace(/[٠-٩]/g, d => '٠١٢٣٤٥٦٧٨٩'.indexOf(d))
    .replace(/[^A-Za-z0-9]+/g, ' ')
    .trim()
    .toLowerCase()

const mightBeComplete = str =>
  /^[0-9]+$/g.test(str) && (str.length === 6 || str.length === 8)

const isInFuture = ({ year, month, date }) => {
  const d = new Date()
  d.setHours(12)
  const currentYear = d.getFullYear()
  if (year !== currentYear) {
    return year > currentYear
  }
  const currentMonth = d.getMonth() + 1
  // year is the same
  if (month !== currentMonth) {
    return month > currentMonth
  }
  // month is the same too
  const currentDate = d.getDate()
  return date > currentDate
}

const parseFns = {
  month: str => {
    if (!str) {
      return null
    }
    // if they're numeric
    const numbers = extractNumbers(str)
    if (numbers) {
      const num = Number(numbers)
      if (num > 0 && num <= 12) {
        return num
      }
    }
    const lower = str.toLowerCase()
    let match = months[lower.slice(0, 1)]
    if (match) return match
    match = months[lower.slice(0, 2)]
    if (match) return match
    match = months[lower.slice(0, 3)]
    if (match) return match

    return null
  },
  year: str => {
    if (!isNumber(str)) {
      return null
    }
    const maxYear = new Date().getFullYear()
    const minYear = 1000
    const num = Number(str)
    if (num > minYear && num <= maxYear) {
      return num
    }
    // guess year based on current date
    // assume < 100 years old
    if (str.length === 2) {
      const lastTwoDigitsOfMaxYear = Number((maxYear + '').slice(2, 4))
      const firstTwoDigitsOfMaxYear = Number((maxYear + '').slice(0, 2))
      if (lastTwoDigitsOfMaxYear > num) {
        return firstTwoDigitsOfMaxYear * 100 + num
      } else {
        return firstTwoDigitsOfMaxYear * 100 - 100 + num
      }
    }
    return null
  },
  date: str => {
    const numbers = extractNumbers(str)
    if (!numbers) {
      return null
    }
    const num = Number(numbers)
    if (num > 0 && num <= 31) {
      return num
    }
    return null
  },
}

const memo = fn => {
  let lastArg
  let lastRes
  let hasRan = false
  return arg => {
    if (arg === lastArg && hasRan) {
      return lastRes
    }
    hasRan = true
    lastRes = fn(arg)
    lastArg = arg
    return lastRes
  }
}

const getLocaleOrder = locale => {
  const dateString = clean(new Date(2021, 3, 5).toLocaleDateString(locale))
  const res = [
    { name: 'month', index: dateString.indexOf('4') },
    { name: 'year', index: dateString.indexOf('2021') },
    { name: 'date', index: dateString.indexOf('5') },
  ]
  res.sort((a, b) => a.index - b.index)
  return res.map(item => item.name)
}

export const getCombosToTry = memo(locale => ({
  1: [['year']],
  2: [
    ['year', 'month'],
    ['month', 'year'],
  ],
  3: [
    getLocaleOrder(locale),
    ['year', 'month', 'date'],
    ['date', 'month', 'year'],
  ],
}))

export const toISO = ({ year, month, date }) => {
  if (!year) return null
  let res = year + ''
  if (month) {
    res += '-' + (month + '').padStart(2, '0')
    if (date) {
      res += '-' + (date + '').padStart(2, '0')
    }
  }
  return res
}

export const finalOutput = values => (isInFuture(values) ? null : toISO(values))

export const testOrder = (order, parts) => {
  const result = {}
  for (let i = 0, l = order.length; i < l; i++) {
    const part = parts[i]
    const partName = order[i]
    const value = parseFns[partName](part)
    if (!value) {
      return null
    }
    result[partName] = value
  }
  return result
}

/**
 * @param {string} str
 * @param {string} [locale]
 */
export const getParts = (str, locale) => {
  const cleaned = clean(str)
  const split = cleaned.split(/\s+/).filter(Boolean)
  const localeOrder = getLocaleOrder(locale)

  const result = {
    parts: [],
    knownOrder: null,
  }

  // just numbers of 6 of 8 chars
  if (mightBeComplete(cleaned)) {
    result.parts = [cleaned.slice(0, 2), cleaned.slice(2, 4), cleaned.slice(4)]
    const ordersToTry = [
      localeOrder,
      ['month', 'date', 'year'],
      ['date', 'month', 'year'],
    ]
    result.knownOrder = ordersToTry.reduce((res, order) => {
      if (res) {
        return res
      }
      return testOrder(order, result.parts)
    }, null)
    return result
  }
  if (containsLetters(cleaned)) {
    const monthIndex = split.findIndex(containsLetters)
    const monthValue = parseFns.month(split[monthIndex])

    const otherParts = [
      ...split.slice(0, monthIndex),
      ...split.slice(monthIndex + 1),
    ]

    if (split.length === 2) {
      result.knownOrder = {
        month: monthValue,
        year: parseFns.year(split[monthIndex === 0 ? 1 : 0]),
      }
      return result
    }

    if (split.length === 3) {
      const ordersToTry = [localeOrder.filter(item => item !== 'month')]
      result.knownOrder = Object.assign(
        { month: monthValue },
        ordersToTry.reduce((res, order) => {
          if (res) {
            return res
          }
          return testOrder(order, otherParts)
        }, null)
      )
      return result
    }
    return result
  }
  for (let index = 0, l = split.length; index < l; index++) {
    const value = split[index].trim()
    if (!value) {
      continue
    }

    // handles arabian/persian strings: ie `2‏/1‏/2021`
    const { length } = value
    if (index === 0 && isNumber(value) && (length === 6 || length === 5)) {
      // last 4 are years
      result.parts.push(value.slice(0, length === 5 ? 1 : 2), value.slice(-4))
    } else {
      result.parts.push(value)
    }
  }
  return result
}
