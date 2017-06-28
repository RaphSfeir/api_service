
/**
 * Detects if JSON API Response is a collection of items or a single item
 */
const isResultCollection = (jsonResult) => {
    return (Array.isArray(jsonResult.data));
}

const clearDataResponse = (json, key) => {
    let out = json.reduce(
        (res, row) => {
            var tag = (key !== 'id') ? row.attributes[key] : row[key];
            res[tag] = Object.assign({}, row.attributes, {id: row.id});
            if (row.relationships) {
                for (let rel in row.relationships) {
                    res[tag][rel + '_id'] = row.relationships[rel].data.id;
                }
            }
            return res; 
        }
        , {}
    );
    return out;
}

export const processCollectionDefault = 
    (key = 'id') => {
        return (json) => {
            return {
                items: clearDataResponse(json.data, key),
                pagination: json.meta
            }
        }
    };

export const processSingleDefault = 
    (key = 'id') => {
        return (json) => {
            return {
                items: clearDataResponse(new Array(json.data), key)
            }
        }
    };
