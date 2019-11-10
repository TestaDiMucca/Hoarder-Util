/**
 * faxios means fake axios.
 */
const faxios = {
	handleRes: async (res) => {
		return new Promise(async resolve => {
			const text = await res.text();
			try {
				resolve(JSON.parse(text));
			} catch (e) {
				resolve(text);
			}
		});
	},
	get: async (url) => {
		return new Promise(async resolve => {
			const res = await fetch(url);
			resolve(await faxios.handleRes(res));
		});
	},
	post: async (url, params) => {
		return new Promise(async resolve => {
			const options = {
				headers: {
					'content-type': 'application/json; charset=UTF-8'
				},
				body: JSON.stringify(params),
				method: 'post'
			};

			const res = await fetch(url, options);
			resolve(await faxios.handleRes(res));
		});
	},
	put: async (url, params) => {
		return new Promise(async resolve => {
			const options = {
				headers: {
					'content-type': 'application/json; charset=UTF-8'
				},
				body: JSON.stringify(params),
				method: 'put'
			};

			const res = await fetch(url, options);
			resolve(await faxios.handleRes(res));
		});
	},
	delete: async (url) => {
		return new Promise(async resolve => {
			const options = {
				method: 'delete'
			};
			const res = await fetch(url, options);
			resolve(await faxios.handleRes(res));
		});
	}
}

export default faxios;
