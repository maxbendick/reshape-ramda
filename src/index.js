// @ts-check
import { assocPath, path, lens } from 'ramda'

/**
 * Returns a map from strings to arrays of strings.
 * Each array of strings is a path through the 
 * pattern object to the location of the matching
 * key (a string).
 * 
 * Ex: makePaths({
 *       a: 'b',
 *       c: { d: 'e' }
 *     })
 * >>> { b: ['a'], e: ['c', 'd'] }
 */
export const makePaths = pattern => {

  let pathsMap = {}

  const pathsRec = (pattern, path = []) => {
    let keys = Object.keys(pattern)
    keys.forEach(k => {
      
      // if value is a string, bind that path to an eponymous property
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

/**
 * For paths from A to B, returns a function
 * that takes an A and returns a B
 * 
 * Ex: makeGetter({
 *       b: ['a'],
 *       e: ['c', 'd'],
 *     })({
 *       a: 1,
 *       c: { d: 2 },
 *     })
 * >>> { b: 1, e: 2 }
 */
export const makeGetter = paths => x => {
  const propertyNames = Object.keys(paths)
  const res = {}

  propertyNames.forEach(p => {
    // set the property `p` of `res` to the value at the appropriate path through `x`
    res[p] = path(paths[p], x)
  })

  return res
}

/**
 * For paths from A to B, returns a function 
 * that takes a B and an A and returns an A,
 * where properties are to the values of the
 * B through their appropriate paths.
 * 
 * Ex: makeSetter({
 *       b: ['a'],
 *       e: ['c', 'd'],
 *     })(
 *       {
 *         b: 3,
 *         e: 4,
 *       }
 *       {
 *         a: 1,
 *         c: { d: 2 },
 *       }
 *     )
 * >>> {
 *       a: 3,
 *       c: { d: 4 },
 *     }
 */
export const makeSetter = paths => (newInner, oldOutter) => {
  const variables = Object.keys(paths)

  let res = { ...oldOutter }

  variables.forEach(v => {
    // set the value at the relevant path through `res` to the relevant value in `newInner`
    res = assocPath(paths[v], newInner[v], res)
  })

  return res
}

/**
 * Given a pattern from A to B, return a Lens from A to B
 */
export const lensFromPattern = pattern => {
  const paths = makePaths(pattern)
  const getter = makeGetter(paths)
  const setter = makeSetter(paths)

  return lens(getter, setter)
}
