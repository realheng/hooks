import isBrowser from './isBrowser'
import useEffectWithTarget from './useEffectWithTarget'
import useLayoutEffectWithTarget from './useLayoutEffectWithTarget'

// 由于在SSR环境下使用useLayoutEffect会报错，所以就使用这个来代替useLayoutEffect
const useIsomorphicLayoutEffectWithTarget = isBrowser
  ? useLayoutEffectWithTarget
  : useEffectWithTarget

export default useIsomorphicLayoutEffectWithTarget
