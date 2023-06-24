
module.exports = (template, data) => {
    return template.replace(/{%(.*)%}/g, function (match, before, name1, after, name2) {
        return before in data ? data[before] : '';
    })
}
