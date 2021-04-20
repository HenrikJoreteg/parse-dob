import { testOrder, getCombosToTry, getParts, toISO } from './utils.js'

/**
 * This function turns a wide range of freeform input describing someone's birth
 * date into `YYYY-MM-DD` using environment's locale to get proper day / month order.
 *
 * @param {string} dateOfBirth In unknown format
 * @param {string} [locale] If you want to use a specific locale you can, but
 *   generally this won't be necessary it will default to environment's locale.
 * @returns {string} In format YYYY or YYYY-MM or YYYY-MM-DD
 */
export default (dobString, locale) => {
  if (!dobString) return null

  const { knownOrder, parts } = getParts(dobString.trim())
  if (knownOrder) {
    return toISO(knownOrder)
  }

  const combosToTry = getCombosToTry(locale)[parts.length]
  if (!combosToTry) return null

  for (let i = 0, l = combosToTry.length; i < l; i++) {
    const res = testOrder(combosToTry[i], parts)
    if (res) {
      return toISO(res)
    }
  }
  return null
}
