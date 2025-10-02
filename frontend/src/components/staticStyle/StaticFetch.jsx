
export async function customerSettings(){
	const response = await fetch("http://127.0.0.1:5000/customerSettings", {
    method: "GET",
    headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${localStorage.getItem("token")}`
    }
	})
	const data = await response.json()
    console.log(data)
	return data
}
export async function getProducts(){
	const response = await fetch("http://127.0.0.1:5000/get_products" , {
    method: "GET",
    headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${localStorage.getItem("token")}`
    }
	})
	const data = await response.json()
	return data
}