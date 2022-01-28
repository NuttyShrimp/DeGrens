type dataFunction = (_data: any) => any;

export const RegisterUICallback = (name: string, handler: dataFunction): void => {
	RegisterNuiCallbackType(name);
	on(`__cfx_nui:${name}`, async (data: any, cb: (..._args: any) => void) => {
		const result = await handler(data);
		cb({ data: result ?? {}, meta: { ok: true, message: 'done' } });
	});
};
