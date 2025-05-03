function appendOrder(){
    const menuList = document.getElementsByClassName("order-items")[0]; // İlk öğeye erişmek için [0] ekliyoruz
    console.log(menuList);
    
    const newItem = document.createElement("li");
    newItem.innerHTML = `<span class="item-name">ASD</span><span class="price">0 TL</span>`;
    console.log(newItem);
    
    menuList.appendChild(newItem); // Artık appendChild geçerli
}
