import { useEffect, useMemo, useState, useRef } from 'react'
import useEventListener from '../useEventListener'
import useLatest from '../useLatest'
import useMemoizedFn from '../useMemoizedFn'
import useSize from '../useSize'
import { getTargetElement } from '../utils/domTarget'
import type { BasicTarget } from '../utils/domTarget'

export interface Options<T> {
  containerTarget: BasicTarget
  wrapperTarget: BasicTarget
  /** itemHeight可以是number，也可以是一个返回number的函数 */
  itemHeight: number | ((index: number, data: T) => number)
  overscan?: number
}

// list在这里面的用途大部分都是用来计算itemHeight
const useVirtualList = <T = any>(list: T[], options: Options<T>) => {
  const { containerTarget, wrapperTarget, itemHeight, overscan = 5 } = options

  const itemHeightRef = useLatest(itemHeight)

  const size = useSize(containerTarget)
  const scrollTriggerByScrollToFunc = useRef(false)
  const [targetList, setTargetList] = useState<{ index: number; data: T }[]>([])

  /**
   * 通过容器的可视区高度和起始下标来计算可视区的条目个数
   * @param containerHeight 容器的可视区高度
   * @param fromIndex 起始index，用于当itemHeight是一个函数的时候计算可视区的条目个数
   */
  const getVisibleCount = (containerHeight: number, fromIndex: number) => {
    if (typeof itemHeightRef.current === 'number') {
      // 向上取整
      return Math.ceil(containerHeight / itemHeightRef.current)
    }

    let sum = 0
    let endIndex = 0
    for (let i = fromIndex; i < list.length; i++) {
      const height = itemHeightRef.current(i, list[i])
      sum += height
      if (sum >= containerHeight) {
        endIndex = i
        break
      }
    }
    return endIndex - fromIndex
  }

  const getOffset = (scrollTop: number) => {
    // 根据scrollTop来计算偏移量
    if (typeof itemHeightRef.current === 'number') {
      // 为啥不用Math.ceil？
      // 因为Math.ceil(1.0) === 1，使用Math.floor(1.0)+1 === 2
      // 这样做是为了能尽可能多取一个offset？就算是正好相除，那么也要+1
      return Math.floor(scrollTop / itemHeightRef.current) + 1
    }
    let sum = 0
    let offset = 0
    for (let i = 0; i < list.length; i++) {
      const height = itemHeightRef.current(i, list[i])
      sum += height
      if (sum >= scrollTop) {
        offset = i
        break
      }
    }
    // 向上取整
    return offset + 1
  }

  // 获取上部高度
  const getDistanceTop = (index: number) => {
    if (typeof itemHeightRef.current === 'number') {
      const height = index * itemHeightRef.current
      return height
    }
    const height = list
      .slice(0, index)
      // @ts-ignore
      .reduce((sum, _, i) => sum + itemHeightRef.current(i, list[index]), 0)
    return height
  }

  const totalHeight = useMemo(() => {
    if (typeof itemHeightRef.current === 'number') {
      return list.length * itemHeightRef.current
    }
    // @ts-ignore
    return list.reduce((sum, _, index) => sum + itemHeightRef.current(index, list[index]), 0)
  }, [list])

  const calculateRange = () => {
    // container是用来展示的元素
    const container = getTargetElement(containerTarget)
    // wrapper是用来承载所有条目的元素
    const wrapper = getTargetElement(wrapperTarget)

    if (container && wrapper) {
      // container一般是设置了overflow:scroll的，所以有scrollTop
      const { scrollTop, clientHeight } = container
      // 根据scrollTop取得卷去部分的条目个数
      const offset = getOffset(scrollTop)
      console.log(
        '%c [ offset ]-105-「index.ts」',
        'font-size:13px; background:#e6f7ff; color:#046bd9;',
        offset,
      )
      const visibleCount = getVisibleCount(clientHeight, offset)
      console.log(
        '%c [ visibleCount ]-107-「index.ts」',
        'font-size:13px; background:#e6f7ff; color:#046bd9;',
        visibleCount,
      )
      // overscan是缓冲区的大小
      const start = Math.max(0, offset - overscan)
      const end = Math.min(list.length, offset + visibleCount + overscan)
      // 中间位置的时候end-start = overscan+visibleCount+overscan
      const offsetTop = getDistanceTop(start)

      // height+marginTop = totalHeight
      // marginTop用来撑开container，如果不设置的话顶部就会将要展示的条目卷去
      // @ts-ignore
      wrapper.style.height = totalHeight - offsetTop + 'px'
      // @ts-ignore
      wrapper.style.marginTop = offsetTop + 'px'

      setTargetList(
        list.slice(start, end).map((ele, index) => ({
          data: ele,
          index: index + start,
        })),
      )
    }
  }

  useEffect(() => {
    if (!size?.width || !size?.height) {
      return
    }
    calculateRange()
  }, [size?.width, size?.height, list])

  useEventListener(
    'scroll',
    (e) => {
      console.log('scroll')
      // 暂时还不知道这个ref的目的是干嘛，感觉去掉也没什么影响
      if (scrollTriggerByScrollToFunc.current) {
        scrollTriggerByScrollToFunc.current = false
        return
      }
      e.preventDefault()
      calculateRange()
    },
    {
      target: containerTarget,
    },
  )

  const scrollTo = (index: number) => {
    const container = getTargetElement(containerTarget)
    if (container) {
      scrollTriggerByScrollToFunc.current = true
      // 更改scrollTop会触发一次 'scroll' 事件
      // 这一次scroll事件并不需要
      container.scrollTop = getDistanceTop(index)
      calculateRange()
    }
  }

  return [targetList, useMemoizedFn(scrollTo)] as const
}

export default useVirtualList
