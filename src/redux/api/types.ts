import { Action as ReduxAction } from 'redux'

export interface ErrorAction extends ReduxAction {
  error: boolean
  payload: any
}

export interface Action<P> extends ReduxAction {
  payload: P
}

// export interface CreateAction<P> extends Action<P> {
//   type: string
//   (payload?: P): Action<P>
//   matches(action: ReduxAction): action is Action<P>
// }

// export const createAction = <P>(type: string): CreateAction<P> => {
//   const creator: any = <P>(payload?: P) => ({ type, payload })
//   creator.matches = <P>(action: ReduxAction): action is Action<P> => action.type === type
//   creator.type = type
//   return creator as CreateAction<P>
// }

export type HttpMethod = 'GET' | 'HEAD' | 'PUT' | 'POST' | 'PATCH' | 'DELETE' | 'OPTIONS'

export interface CallApiOptions {
  endpoint: string
  method: HttpMethod
  types: string[]
  body?: any
  credentials?: 'omit' | 'same-origin' | 'include'
  headers?: {
    [propName: string]: string
  }
}

export interface ApiAction<P, R> {
  [propName: string]: CallApiOptions
}

export interface ApiActionOptions {
  RSAA: any
  endpoint: string
  method: HttpMethod
  credentials?: 'omit' | 'same-origin' | 'include'
  headers?: {
    [propName: string]: string
  }
}

export interface CreateApiAsyncAction<P, R> {
  type: string
  (payload?: P): ApiAction<P, R>
  matches(action: Action<any>): action is Action<any>
  matchesPending(action: Action<P>): action is Action<P>
  matchesSuccess(action: Action<R>): action is Action<R>
  matchesFailure(action: Action<any>): action is ErrorAction
}

export type CreateApiActionOptions<P> = ApiActionOptions | ((payload: P) => ApiActionOptions)

/**
 * Creates an action creator for api middleware actions.
 *
 * @param {string} type - The action type. Used as a prefix for actions generated by the api middleware
 * @param {ApiActionOptions | (payload: P) => ApiActionOptions} options - The options for the api call
 * @param {any} addOn - (optional) Any additional properties you want to set on the action. NOTE: do not use with redux-api-middleware
 */
export const createApiAction =
  <P, R>(type: string, options: CreateApiActionOptions<P>, addOn?: any): CreateApiAsyncAction<P, R> => {
    const pendingType = `${type}_PENDING`
    const successType = `${type}_SUCCESS`
    const failureType = `${type}_FAILURE`

    const creator: any = (payload: P): ApiAction<P, R> => {
      const { RSAA, method, endpoint, credentials, headers }
        = typeof (options) === 'function' ? options(payload) : options

      const body = (typeof (payload) === 'object') ? JSON.stringify(payload) : payload

      const actualHeaders = { ...headers }

      if (typeof (payload) === 'object') {
        actualHeaders['Content-Type'] = 'application/json'
      }

      return {
        [RSAA]: {
          body: method === 'POST' || method === 'PUT' ? body : undefined,
          credentials,
          endpoint,
          headers: actualHeaders,
          method,
          types: [pendingType, successType, failureType],
        },
        ...addOn,
      }
    }
    creator.type = type
    creator.matches = (action: Action<any>): action is Action<any> =>
      action.type === pendingType || action.type === successType || action.type === failureType
    creator.matchesPending =
      (action: Action<P>): action is Action<P> => action.type === pendingType
    creator.matchesSuccess =
      (action: Action<R>): action is Action<R> => action.type === successType
    creator.matchesFailure =
      (action: Action<any>): action is ErrorAction => action.type === failureType
    return creator as CreateApiAsyncAction<P, R>
  }
