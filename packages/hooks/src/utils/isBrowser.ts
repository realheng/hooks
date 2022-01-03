// 用来判断是否是浏览器的方法
const isBrowser = !!(
  typeof window !== 'undefined' &&
  window.document &&
  window.document.createElement
)

export default isBrowser
