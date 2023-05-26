import Route from './route'

export default class Matched {
  path: Route[] = []
  pathAndMethod: Route[] = []
  hit: boolean = false
}
