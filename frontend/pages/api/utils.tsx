interface newReq { 
    [key:string]: any
}

export default function toLowerCase(req: Object): newReq {
    return Object.fromEntries(Object.entries(
        req).map(arr => {
            let result = arr;
            if (typeof(arr[1]) === "string") {
                result = [arr[0], arr[1].toLowerCase()]
            } 
            return result;
        }))
}