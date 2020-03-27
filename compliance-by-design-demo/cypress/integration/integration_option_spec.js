import {answerQuestion, performAct, chooseOption} from './spec_util'


describe('The demo', function() {
    it('Should be able walk through a scenario', function() {
        cy.visit('')

        performAct('<<indienen verzoek een besluit te nemen>>')

        answerQuestion('[verzoek een besluit te nemen]', 'Yes')
        answerQuestion('[bij wettelijk voorschrift is anders bepaald]', 'No')

        performAct('<<indienen verzoek een besluit te nemen>>')

        answerQuestion('[verzoek een besluit te nemen]', 'Yes')
        answerQuestion('[bij wettelijk voorschrift is anders bepaald]', 'No')

        performAct('<<besluiten de aanvraag niet te behandelen>>')

        chooseOption('[aanvraag]', 1)
        answerQuestion('[aanvrager heeft voldaan aan enig wettelijk voorschrift voor het in behandeling nemen van de aanvraag]', 'No')
        answerQuestion('[aanvrager heeft de gelegenheid gehad de aanvraag aan te vullen]', 'Yes')
        answerQuestion('[de aanvraag is binnen de afgelopen 4 weken aangevuld]', 'No')
        answerQuestion('[gestelde termijn voor aanvulling is ongebruikt verstreken]', 'Yes')
    })
})