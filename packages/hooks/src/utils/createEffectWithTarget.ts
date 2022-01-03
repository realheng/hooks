import type { DependencyList, EffectCallback, useEffect, useLayoutEffect } from 'react'
import { useRef } from 'react'
import useUnmount from '../useUnmount'
import depsAreSame from './depsAreSame'
import type { BasicTarget } from './domTarget'
import { getTargetElement } from './domTarget'

const createEffectWithTarget = (useEffectType: typeof useEffect | typeof useLayoutEffect) => {
  /**
   *
   * @param effect
   * @param deps
   * @param target target should compare ref.current vs ref.current, dom vs dom, ()=>dom vs ()=>dom
   */
  const useEffectWithTarget = (
    effect: EffectCallback,
    deps: DependencyList,
    target: BasicTarget<any> | BasicTarget<any>[],
  ) => {
    const hasInitRef = useRef(false)

    const lastElementRef = useRef<(Element | null)[]>([])
    const lastDepsRef = useRef<DependencyList>([])

    const unLoadRef = useRef<any>()

    useEffectType(() => {
      const targets = Array.isArray(target) ? target : [target]
      const els = targets.map((item) => getTargetElement(item))

      // init run
      // 如果没有初始化过的话那么就进行初始化操作
      if (!hasInitRef.current) {
        hasInitRef.current = true
        lastElementRef.current = els
        lastDepsRef.current = deps

        unLoadRef.current = effect()
      }

      // 手动进行新旧值比较
      // 如果发现有新旧值不相等，那么就执行回调
      if (
        els.length !== lastElementRef.current.length ||
        !depsAreSame(els, lastElementRef.current) ||
        !depsAreSame(deps, lastDepsRef.current)
      ) {
        // 手动执行销毁函数
        // 因为并没有将销毁函数return
        // 为什么不return的原因可能是每次都执行effect，但是并不一定依赖变更吧
        unLoadRef.current?.()
        // 更新对比值
        lastElementRef.current = els
        lastDepsRef.current = deps
        // 执行副作用，生成新的销毁函数
        unLoadRef.current = effect()
      }
    })

    useUnmount(() => {
      unLoadRef.current?.()
      // for react-refresh
      hasInitRef.current = false
    })
  }

  return useEffectWithTarget
}

export default createEffectWithTarget
