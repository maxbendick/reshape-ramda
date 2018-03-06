// @ts-check
import { assocPath, path, lens } from 'ramda'

export const makePaths = (pattern, path = []) => {

  let pathsMap = {}

  const pathsRec = (pattern, path = []) => {
    let keys = Object.keys(pattern)
    keys.forEach(k => {
      
      // if value is a string, bind that path to an eponymous attribute
      if (typeof pattern[k] === 'string')
        pathsMap[pattern[k]] = [...path, k]
      
      else if (typeof pattern[k] === 'object')
        // continue the search at the next node (depth-first-search)
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
    // set the attribute `v` to the value at the relevant path through `x`
    res[v] = path(paths[v], x)
  })

  return res
}

export const makeSetter = paths => (newInner, oldOutter) => {
  const variables = Object.keys(paths)

  let res = { ...oldOutter }

  variables.forEach(v => {
    // set the value at the relevant path through `res` to the relevant value in `newInner`
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
