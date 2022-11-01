declare global {
  interface Object {
    toObject: () => any
  }
}

/* eslint-disable */
export const implementToObject = () => {
  Object.prototype.toObject = function () {
    const original = this || {}
    let obj = original
    const keys: string[] = []
    do {
      keys.push(...Object.getOwnPropertyNames(obj))
      obj = Object.getPrototypeOf(obj)
    } while (obj !== Object.prototype)

    return keys.reduce((classAsObj, key) => {
      if (key === 'constructor') return classAsObj
      const originalValue: Record<string, any> = original[key as keyof typeof original]
      if (typeof originalValue === 'object' && originalValue?.hasOwnProperty('toObject')) {
        classAsObj[key] = originalValue.toObject()
      } else if (typeof originalValue === 'object' && originalValue?.hasOwnProperty('length')) {
        classAsObj[key] = []
        // @ts-ignore
        for (const element of originalValue) {
          if (typeof element === 'object' && element?.hasOwnProperty('toObject')) {
            classAsObj[key].push(element.toObject())
          } else {
            classAsObj[key].push(element)
          }
        }
      } else if (typeof originalValue === 'function') {} // do nothing
      else { classAsObj[key] = originalValue }
      return classAsObj
    }, {} as any)
  }
}
/* eslint-enable */
