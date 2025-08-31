
export async function customerSettings(){
	const response = await fetch("http://127.0.0.1:5000/customerSettings")
	const data = await response.json()
	return data
}
export async function getProducts(){
	const response = await fetch("http://127.0.0.1:5000/get_products")
	const data = await response.json()
	return data
}