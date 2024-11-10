module.exports = (template, product) =>{
    let output = template.replace(/{%id%}/g, product.id);
    output = output.replace(/{%productName%}/g, product.productName);
    output = output.replace(/{%image%}/g, product.image);
    output = output.replace(/{%from%}/g, product.from);
    output = output.replace(/{%nutrients%}/g, product.nutrients);
    output = output.replace(/{%quantity%}/g, product.quantity);
    output = output.replace(/{%price%}/g, product.price);
    output = output.replace(/{%description%}/g, product.description);

    if (!product.organic) output = output.replace(/{%not-organic%}/g, "not-organic");

    return output;

}