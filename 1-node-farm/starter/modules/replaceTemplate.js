module.exports = (temp, prd) => {
    let output = temp.replace(/{%PRODUCTNAME%}/g, prd.productName);
    output = output.replace(/{%PRICE%}/g, prd.price);
    output = output.replace(/{%IMAGE%}/g, prd.image);
    output = output.replace(/{%QUANTITY%}/g, prd.quantity);
    output = output.replace(/{%PRODUCTID%}/g, prd.id);
    output = output.replace(/{%SOURCEDFROM%}/g, prd.from);
    output = output.replace(/{%NUTRIENTS%}/g, prd.nutrients);
    output = output.replace(/{%DESCRIPTION%}/g, prd.description);
    if (!prd.organic) {
        output = output.replace(/{%NOT_ORGANIC%}/g, 'not-organic');
    }
    return output;
}