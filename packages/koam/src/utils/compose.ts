import Koa from '../index'

export default function compose (middlewares: Koa.Middleware[]): Koa.Middleware {
  return (context, next) => {
    let n = -1
    const dispatch = (i: number): any => {
      if (n >= i) throw new Error('next() called more than one time in the same middleware function')
      n = i
      const fn = i === middlewares.length ? next : middlewares[i]
      if (!fn) return
      return fn(context, dispatch.bind(undefined, i + 1))
    }
    return dispatch(0)
  }
}
