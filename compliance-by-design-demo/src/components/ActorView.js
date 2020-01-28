import React, { Component } from 'react';
import './ActorView.css'
import FactPrompt from './FactPrompt'

class ActorView extends Component {
    constructor(props) {
        super(props)
        console.log('Constructing ActorView', props)
        this.state = {
            'duties': [],
            'loading': true
        }
    }

    async componentDidMount() {
        await this.computeRenderData([], [])
    }

    async componentDidUpdate(prevProps, prevState) {
        console.log('ComponentDidUpdate', 'prev:', prevProps, 'current:', this.props)

        const propsChanged = this.props.caseLink !== prevProps.caseLink || this.props.actorSsid !== prevProps.actorSsid
        if (propsChanged) {
            await this.computeRenderData()
        }
    }

    async computeRenderData() {
        this.setState({'loading': true})
        console.log('ComputeRenderDataState', this.state)
        console.log('ComputeRenderData', this.props)
        try {
            let availableActLinks = await this.props.lawReg.getAvailableActs(this.props.caseLink, this.props.actorSsid, [], [])
            console.log('Got available act links')
            let availableActs = await Promise.all(availableActLinks
                .map(async (act) => {
                    const details = await this.props.lawReg.getActDetails(act.link, this.props.actorSsid)
                    return {...act, 'details': details}
                }))
            console.log('Computing potential acts')
            let potentialActs = await Promise.all((await this.props.lawReg.getPotentialActs(this.props.caseLink, this.props.actorSsid, [], []))
                .map(async (act) => {
                    const details = await this.props.lawReg.getActDetails(act.link, this.props.actorSsid)
                    return {...act, 'details': details}
                }))
            console.log('Getting actions')
            let previousActs = await this.props.lawReg.getActions(this.props.caseLink, this.props.actorSsid)
            const core = this.props.lawReg.getAbundanceService().getCoreAPI();
            const enrichedPreviousActs = await Promise.all(previousActs.map(async (prevAct) => {
                let claim = await core.get(prevAct.link, this.props.actorSsid)
                console.log('claim', claim)
                prevAct.facts = claim.data['DISCIPL_FLINT_FACTS_SUPPLIED']
                return prevAct;
            }))
            let duties
            try {
                console.log('Getting duties')
                duties = await this.props.lawReg.getActiveDuties(this.props.caseLink, this.props.actorSsid)
            } catch (e) {
                console.log('Error', e, ' while determining duties')
                duties = []
            }
            this.setState({
                'availableActs': availableActs,
                'potentialActs': potentialActs,
                'previousActs': enrichedPreviousActs,
                'duties': duties,
                'loading': false,
                'activeAct': undefined,
                'factPrompts': []
            })
        }
        catch (e) {
            console.error("Caught ex", e)
        }

    }

    async takeAction(act, actIndex, actType) {
        this.setState({
            'activeAct': {
                'act': act,
                'index': actIndex,
                'type': actType
            }
        });
        try {
            let caseLink = await this.props.lawReg.take(this.props.actorSsid, this.props.caseLink, act, this.askFact.bind(this))
            if (this.props.onCaseChange) {
                this.props.onCaseChange(caseLink)
            }
        } catch (e) {
            if (e.message.includes('is not allowed')) {
                alert(e.message)
            } else {
                throw e
            }
        }

    }

    async askFact (fact) {
        const resultPromise = new Promise((resolve, reject) => {

            const handleAskFactResult = (result) => {

                let realResult = result || false;
                if (typeof result === 'boolean') {
                    realResult = result
                }
                else if (!isNaN(Number(result))) {
                    realResult = Number(result)
                }
                this.setState((state) => {
                    const newFactPrompts = state.factPrompts || [];

                    newFactPrompts[newFactPrompts.length - 1] = {
                        'fact': fact,
                        'factValue': realResult,
                        'final': true
                    }

                    return {
                        'factPrompts': newFactPrompts
                    }
                });

                resolve(realResult)
            }

            this.setState((state) => {
                const prevFactPrompts = state.factPrompts || [];
                const newFactPrompts = prevFactPrompts.concat({
                    'fact': fact,
                    'resultCallback': handleAskFactResult
                })
                console.log("Setting factPrompts to", newFactPrompts)
                   return {
                        'factPrompts':  newFactPrompts
                    }
            }

            )
        })


        return resultPromise
    }



    renderAvailableActs() {
        let acts = this.state.availableActs
        if (!acts) {
            return []
        }

        return acts.map((act, index) => {
            console.log('ActionDetails available', act.details)
            return <div class="available"><button class="actButton" onClick={this.takeAction.bind(this, act.act, index, 'availableActs')}>{act.act}</button>{this.renderFactPrompts(act, index, 'availableActs')}</div>
        })
    }

    renderFactPrompts(act, actIndex, actType) {
        console.log("Maybe rendering factPrompt", act, actIndex, actType, 'with active Act', this.state.activeAct)
        if (this.state.activeAct && this.state.activeAct.index === actIndex && this.state.activeAct.type === actType && this.state.factPrompts) {
            console.log("Really rendering factPrompts", this.state.factPrompts)
            return this.state.factPrompts.map(factPromptState => {
                return <FactPrompt handleResult={factPromptState.resultCallback} final={factPromptState.final} factValue={factPromptState.factValue} fact={factPromptState.fact}/>
            })
        }
        return []
    }

    renderPotentialActs() {
        let acts = this.state.potentialActs
        if (!acts) {
            return []
        }


        return acts.map((act, index) => {
            console.log('ActionDetails potential', act.details)
            return <div class="potential"><button class="actButton" onClick={this.takeAction.bind(this, act.act, index, 'potentialActs')}>{act.act}</button>{this.renderFactPrompts(act, index, 'potentialActs')}</div>
        })
    }

    renderDuties() {
        return this.state.duties.map((duty) => {
            return <li><p>{duty.duty}</p></li>
        })
    }

    renderSuppliedFacts(facts) {
        const renderedFacts = []
        if (!Array.isArray(facts)) {
            for (let fact in facts) {
                if (facts.hasOwnProperty(fact)) {
                    if (!Array.isArray(facts[fact])) {
                        renderedFacts.push(<li><p>{fact}: {JSON.stringify(facts[fact])}</p></li>)
                    }
                    else {
                        renderedFacts.push(<ul>{this.renderSuppliedFacts(facts[fact])}</ul>)
                    }

                }
            }
        }
        else {
            for (let fact of facts) {
                renderedFacts.push(<li>{this.renderSuppliedFacts(fact)}</li>)
            }
        }

        return <ul>{renderedFacts}</ul>
    }

    renderPreviousActs() {
        if (!this.state.previousActs) {
            return []
        }

        return this.state.previousActs.map((prevAct) => {
            return <li><p>{prevAct.act}</p>{this.renderSuppliedFacts(prevAct.facts)}</li>
        })
    }

    render() {
        console.log('ActorView render with state', this.state)
        if (this.state.loading === true) {
            console.log('ActorView render loading true')
            return <div className="container"><div className="acts"><p>Loading...</p></div></div>
        }
        console.log('Props when actorview rendering', this.props)
        return <div className="container">

            <div className="actorHeader" style={{'backgroundColor': this.props.colorCode}}>
              <h3>{this.props.name}</h3>
            </div>
            <div className="acts">
                {this.renderAvailableActs()}
                {this.renderPotentialActs()}
            </div>
            <div className="duties">
                <h4>Duties</h4>
                <ul>
                    {this.renderDuties()}
                </ul>
            </div>
            <div className="prevActs">
              <h4>Previous acts</h4>
              <ul>
                  {this.renderPreviousActs()}
              </ul>
            </div>

        </div>
    }
}

export default ActorView
