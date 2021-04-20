import { testOrder, getCombosToTry, getParts, toISO } from './utils.js'

/**
 * @param {string} dateOfBirth In unknown format
 * @returns {string} In format YYYY or YYYY-MM or YYYY-MM-DD
 */
export default (dobString, locale) => {
  const { knownOrder, parts } = getParts(dobString.trim())
  if (knownOrder) {
    return toISO(knownOrder)
  }

  const combosToTry = getCombosToTry(locale)[parts.length]

  for (let i = 0, l = combosToTry.length; i < l; i++) {
    const res = testOrder(combosToTry[i], parts)
    if (res) {
      return toISO(res)
    }
  }
  return null
}
