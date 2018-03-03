// @ts-check
import { assocPath, path, lens } from 'ramda'

export const makePaths = (pattern, path = []) => {

  let pathsMap = {}

  const pathsRec = (pattern, path = []) => {
    let keys = Object.keys(pattern)
    keys.forEach(k => {
      
      if (typeof pattern[k] === 'string')
        pathsMap[pattern[k]] = [...path, k]
      
      else if (typeof pattern[k] === 'object')
        pathsRec(pattern[k], [...path, k])
      
    })
  }

  pathsRec(pattern)
  return pathsMap
}

export const makeGetter = paths => x => {
  const variables = Object.keys(paths)

  let res = {}

  variables.forEach(v => {
    res[v] = path(paths[v], x)
  })

  return res
}

export const makeSetter = paths => (newInner, oldOutter) => {
  const variables = Object.keys(paths)

  let res = { ...oldOutter }

  variables.forEach(v => {
    res = assocPath(paths[v], newInner[v], res)
  })

  return res
}

export const lensFromPattern = pattern => {
  const paths = makePaths(pattern)
  const getter = makeGetter(paths)
  const setter = makeSetter(paths)

  return lens(getter, setter)
}
