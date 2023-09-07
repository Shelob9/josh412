export const jsonReponse = (data: any,status:number) => {
	return new Response(JSON.stringify(data, null, 2), {
		headers: {
			"content-type": "application/json;charset=UTF-8",
		},
		status: status,
	});
}
