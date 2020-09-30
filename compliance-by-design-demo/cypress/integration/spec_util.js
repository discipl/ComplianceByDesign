const performAct = (name) => {
    cy.contains(name).click()
}

const answerQuestion = (question, answer) => {
    // cy.wait(500)
    console.log("Clicking" ,answer)
    cy.get('.modal-main').last().contains(question).last().parent().contains(answer).click()

}

const chooseOption = (question, option) => {
    // cy.wait(500)
    cy.get('.modal-main').last().contains(question).last().parent().get('select.value').select(option.toString())
    cy.get('.modal-main').last().contains(question).last().parent().contains('Yes').click()

}

const answerQuestionWithValue = (question, value) => {
    console.log("Answering fact with value", value)
    if (typeof value === 'boolean') {
        answerQuestion(question, value ? 'Yes' : 'No')
    }
    else {
        cy.contains(question).last().parent().get('input').last().type(value)
        answerQuestion(question, 'Yes')
    }

}

const switchToActor = (actor) => {
    cy.get('.actorSelector').select(actor);
    cy.wait(200)
}

const performNonOrderedScenario = (acts, facts) => {
    for (let act of acts) {
        switchToActor(act.actor);
        performAct(act.act)
        for (let i = 0; i < act.numQuestions; i++) {
            console.log("Answering question number", i)
            const modal = cy.get('section.modal-main')
            cy.get('section.modal-main').last().find('span').first().invoke('text').then((question) => {
                for (let fact of Object.keys(facts)) {
                    if (question.includes(fact)) {
                        console.log("Answering fact", fact)
                        if (Array.isArray(facts[fact])) {
                            const value = facts[fact].shift()
                            if (value) {
                                answerQuestionWithValue(question, value)
                            }
                            else {
                                answerQuestionWithValue(question, false)
                            }

                        }
                        else {
                            answerQuestionWithValue(question, facts[fact])
                        }
                    }
                }
            })


        }
    }
}

export {
    performAct,
    answerQuestion,
    chooseOption,
    performNonOrderedScenario,
}
