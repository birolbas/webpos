function appendOrder(button){
    const menuList = document.getElementsByClassName("order-items")[0]; 
    
    let chosen_product = button
    let product_name = chosen_product.getElementsByClassName("product-name")[0].innerHTML;
    product_price = chosen_product.getElementsByClassName("product-price")[0].innerHTML;
    product_price = parseFloat(product_price);

    const newItem = document.createElement("li");
    newItem.innerHTML = `<span class="item-name">${product_name}</span><span class="price">${product_price}</span>`;
    menuList.appendChild(newItem);
    
    total_price = document.getElementsByClassName("order-summary")[0].getElementsByClassName("total-price")[0].innerHTML;
    total_price = parseFloat(total_price);  
    total_price = total_price + product_price;
    document.getElementsByClassName("order-summary")[0].getElementsByClassName("total-price")[0].innerHTML = total_price;

}
