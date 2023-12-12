/* eslint-disable no-extend-native,no-prototype-builtins */
declare global {
  interface Object {
    toObject: () => any
  }
}

export function implementToObject() {
  Object.defineProperty(Object.prototype, 'toObject', {
    enumerable: false,
    value() {
      const original = this || {}
      let obj = original
      const keys: string[] = []
      do {
        keys.push(...Object.getOwnPropertyNames(obj))
        obj = Object.getPrototypeOf(obj)
      } while (obj !== Object.prototype)

      // eslint-disable-next-line unicorn/no-array-reduce
      return keys.reduce((classAsObj, key) => {
        if (key === 'constructor')
          return classAsObj
        const originalValue: Record<string, any> = original[key as keyof typeof original]
        if (typeof originalValue === 'object' && originalValue?.hasOwnProperty('toObject')) {
          classAsObj[key] = originalValue.toObject()
        }
        else if (typeof originalValue === 'object' && originalValue?.hasOwnProperty('length')) {
          classAsObj[key] = []
          for (const element of originalValue as any[]) {
            if (typeof element === 'object' && element?.hasOwnProperty('toObject'))
              classAsObj[key].push(element.toObject())
            else
              classAsObj[key].push(element)
          }
        }
        else if (typeof originalValue === 'function') {
          // do nothing
        }
        else {
          classAsObj[key] = originalValue
        }
        return classAsObj
      }, {} as any)
    },
  })
}
