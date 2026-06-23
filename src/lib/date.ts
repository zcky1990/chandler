const SHOP_TIMEZONE = 'Asia/Jakarta'

/** Calendar date (YYYY-MM-DD) in shop timezone — queue/order numbers reset at local midnight. */
export function getShopDateString(date = new Date()) {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: SHOP_TIMEZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date)
}
