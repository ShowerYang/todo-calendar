import { useQuasar } from 'quasar'

export function useCommon() {
  const $q = useQuasar()

  /**
   * 取得一周的第幾天
   * @param {number} day
   */
  const getDayOfWeek = (day: number) => {
    let str = ''
    switch (day) {
      case 0:
        str = '日'
        break
      case 1:
        str = '一'
        break
      case 2:
        str = '二'
        break
      case 3:
        str = '三'
        break
      case 4:
        str = '四'
        break
      case 5:
        str = '五'
        break
      case 6:
        str = '六'
        break
    }
    return str
  }

  /**
   * 取得時間的時段
   * @param {string} period
   */
  const getTimePeriod = (period: string) => {
    return period === 'AM' ? '上午' : '下午'
  }

  return {
    getDayOfWeek,
    getTimePeriod
  }
}
