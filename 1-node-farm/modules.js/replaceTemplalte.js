module.exports = (template, product) =>{
    let output = template.replace(/{%PRODUCTNAME%}/g, product.productName);
    output = output.replace(/{%PRICE%}/g, product.price);
    output = output.replace(/{%QUANTITY%}/g, product.quantity);
    output = output.replace(/{%ID%}/g, product.id);
    output = output.replace(/{%NUTRIENTS%}/g, product.nutrients);
    output = output.replace(/{%DESCRIPTION%}/g, product.description);
    output = output.replace(/{%FROM%}/g, product.from);
    output = output.replace(/{%IMAGE%}/g, product.image);

    if(!product.organic) output = output.replace(/{%NOT_ORGANIC%}/g,'not-organic');

    return output;
}