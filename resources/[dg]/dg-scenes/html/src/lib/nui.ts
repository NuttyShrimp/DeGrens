const doRequest = async (action: string, body = {}) => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const rawResult = await fetch(`https://${GetParentResourceName()}/${action}`, {
        method: "post",
        headers: {
            "Content-Type": "application/json; charset=UTF-8"
        },
        body: JSON.stringify(body)
    })
    try {
        const result = await rawResult.json();
        return result
    } catch (err : any) {
        return { body: {}, meta: { ok: false, message: `Failed to do request for: ${action} - ${err.message}` } }
    }
}

export const nuiAction = (action: string, body = {}, devData = { returnData: {} }) => {
    return new Promise(async (res) => {
        const request = await doRequest(action, body)
        if (!request.meta.ok) {
            throw new Error(request.meta.message)
        }
        res(request.body)
    })
}