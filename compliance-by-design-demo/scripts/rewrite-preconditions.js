let fs = require('fs')
let l = require('@discipl/law-reg')
let LawReg = l.LawReg;

let model = JSON.parse(fs.readFileSync("./model/lerarenbeurs.flintc.json"));

let lawReg = new LawReg();

for (let act of model.acts) {
    if (act.preconditions !== "") {
        act.preconditions = lawReg.factParser.parse(act.preconditions);
    }


}

for (let fact of model.facts) {
    if (fact.function !== "" && fact.function !== "<<>>") {
        fact.function = lawReg.factParser.parse(fact.function);
    }
}

fs.writeFileSync("./output.flint.json", JSON.stringify(model, null, 2));