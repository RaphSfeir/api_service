import { CALL_API , getJSON} from 'redux-api-middleware';
import $ from 'jquery';
import { isResultCollection, processCollectionDefault, processSingleDefault, clearDataResponse } from 'JSONApiAdapter';
const API_ROOT = '';

export const genMeta = (params, action, state, res) => {
    if (res) {
        return Object.assign({}, params.meta, {
            status: res.status,
            statusText: res.statusText
        });
    }
    else {
        return Object.assign({}, params.meta, {
            status: -1,
            statusText: 'Network request fail'
        });
    }
}

export const genURL = (url, params) => {
    const getParams = decodeURIComponent($.param(params));
    return `${url}?${getParams}`;
}

const defaultRequestOptions = {
    method: 'GET',
    headers: {'Content-Type': 'application/vnd.api+json', 'Accept': 'application/vnd.api+json'}
};

export const apiFetch = (
    endpoint = 'articles',
    actions = {
        request: 'REQUEST',
        receive: 'RECEIVE',
        reject: 'REJECT'
    }, 
    requestOptions = defaultRequestOptions,
    receiveItemsKey = 'id',
    meta = {}
) => {
    let opts = Object.assign({}, defaultRequestOptions, requestOptions);
    const params = {
        meta: {}
    }
    let output = {
        [CALL_API]: {
            types: [
                {
                    type: (typeof actions.request === 'string') ? actions.request : actions.request.type,
                    payload: (action, state) => (actions.request.payload),
                    meta: (action, state, res) => {
                        return genMeta(params, action, state, res); 
                    }
                },
                {
                    type: actions.receive,
                    payload: (action, state, res) => {
                        return getJSON(res).then((json) => {
                            let result = isResultCollection(json) ? processCollectionDefault(receiveItemsKey)(json) : processSingleDefault(receiveItemsKey)(json);
                            return result; 
                        });
                    },
                    meta: (action, state, res) => {
                        return genMeta(params, action, state, res); 
                    }
                },
                {
                    type: actions.reject,
                    meta: (action, state, res) => {
                        return genMeta(params, action, state, res); 
                    }
                }],
            endpoint: API_ROOT + "/" + genURL(endpoint, opts.params),
            method: opts.method
        }
    }
    if (opts.body)
        output[CALL_API].body = opts.body;
    if (opts.headers)
        output[CALL_API].headers = opts.headers;   
    return output;
};

export const STATUS = {
    NOT_FOUND: 'NOT_FOUND',
    OK: 'OK',
    KO: 'KO',
    SAVED: 'SAVED',
    LOADING: 'LOADING'
}


export const setItemsStatus = (status = STATUS.LOADING, items = {}) => { 
    return Object.keys(items).reduce(
        (acc, key) => {
            acc[key] = status;
            return acc; 
        },
        {}
    )
}
