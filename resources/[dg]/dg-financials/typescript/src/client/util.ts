export const RegisterUICallback = (name: string, handler: (data: any) => any): void => {
	RegisterNuiCallbackType(name);
	on(`__cfx_nui:${name}`, async (data: any, cb: (...args: any) => void) => {
		const result = await handler(data);
		cb({ data: result ?? {}, meta: { ok: true, message: 'done' } });
	});
};
