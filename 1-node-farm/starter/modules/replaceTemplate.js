module.exports = (template_card, el)=>{
    let output = template_card.replace(/{%PRODUCTNAME%}/g, el.productName);
    output = output.replace(/{%IMAGE%}/g, el.image);
    output = output.replace(/{%QUANTITY%}/g, el.quantity);
    output = output.replace(/{%PRICE%}/g, el.price);
    output = output.replace(/{%FROM%}/g, el.price);
    output = output.replace(/{%NUTRIENTS%}/g, el.nutrients);
    output = output.replace(/{%DESCRIPTION%}/g, el.description);
    output = output.replace(/{%ID%}/g, el.id);
    
    if(!el.organic){
        output = output.replace(/{%NOT_ORGANIC%}/g, 'not-organic');
    }
    else {
        output = output.replace(/{%NOT_ORGANIC%}/g, '');
    }
    return output;
}