const isNumber = str => /^\d+$/.test(str)
const containsLetters = str => /[a-z]/g.test(str)
const extractNumbers = str => {
  const match = (str || '').match(/\d+/)
  return (match && match[0]) || null
}

const months = {
  jan: '01',
  f: '02',
  mar: '03',
  ap: '04',
  may: '05',
  jun: '06',
  jul: '07',
  au: '08',
  s: '09',
  o: '10',
  n: '11',
  d: '12',
}

const clean = str =>
  str
    .replace(/[۰-۹]/g, d => '۰۱۲۳۴۵۶۷۸۹'.indexOf(d))
    .replace(/[٠-٩]/g, d => '٠١٢٣٤٥٦٧٨٩'.indexOf(d))
    .replace(/[^A-Za-z0-9]+/g, ' ')
    .trim()
    .toLowerCase()

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

const arraysEqual = (a, b) => a.every((item, index) => b[index] === item)

const standardOrder = ['year', 'month', 'date']
const getLocaleOrder = locale => {
  const dateString = clean(new Date(2021, 3, 5).toLocaleDateString(locale))
  const res = [
    { name: 'month', index: dateString.indexOf('4') },
    { name: 'year', index: dateString.indexOf('2021') },
    { name: 'date', index: dateString.indexOf('5') },
  ]
  res.sort((a, b) => a.index - b.index)
  const names = res.map(item => item.name)
  return arraysEqual(names, standardOrder) ? [names] : [names, standardOrder]
}

export const getCombosToTry = memo(locale => ({
  1: [['year']],
  2: [['year', 'month']],
  3: getLocaleOrder(locale),
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

export const getParts = str => {
  const cleaned = clean(str)
  const split = cleaned.split(/\s+/).filter(Boolean)

  const result = {
    parts: [],
    knownOrder: null,
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
      const ordersToTry =
        monthIndex === 0
          ? [
              ['date', 'year'],
              ['year', 'date'],
            ]
          : [
              ['year', 'date'],
              ['date', 'year'],
            ]
      // console.l
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
