import React, { Component } from 'react';
import './ActorView.css'
import FactModal from './FactModal'

class ActorView extends Component {
    constructor(props) {
        super(props)
        console.log('Constructing ActorView', props)
        this.state = {
            'duties': [],
            'loading': true,
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
                'loading': false
            })
        }
        catch (e) {
            console.error("Caught ex", e)
        }

    }

    async takeAction(act) {
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
                this.setState({'prompt': false})
                if (result) {
                    if (typeof result === 'boolean') {
                        resolve(result)
                    }
                    else if (!isNaN(Number(result))) {
                        resolve(Number(result))
                    }
                    else {
                        resolve(result)
                    }
                }
                else {
                    resolve(false)
                }
            }

            this.setState(
                {
                    'prompt': true,
                    'promptFact': fact,
                    'promptCallback': handleAskFactResult
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

        return acts.map((act) => {
            console.log('ActionDetails available', act.details)
            let actDescription = act.details.juriconnect ?
                <p><a href={'https://wetten.overheid.nl/' + act.details.juriconnect}>{act.act}</a></p>
                : <p>{act.act}</p>;
            return <div class="available">{actDescription}<button class="actButton" onClick={this.takeAction.bind(this, act.act)}>Act!</button></div>
        })
    }

    renderPotentialActs() {
        let acts = this.state.potentialActs
        if (!acts) {
            return []
        }

        return acts.map((act) => {
            let actDescription = act.details.juriconnect ?
                <p><a href={'https://wetten.overheid.nl/' + act.details.juriconnect}>{act.act}</a></p>
                : <p>{act.act}</p>;
            console.log('ActionDetails potential', act.details)
            return <div class="potential">{actDescription}<button class="actButton" onClick={this.takeAction.bind(this, act.act)}>Act!</button></div>
        })
    }

    renderDuties() {
        return this.state.duties.map((duty) => {
            return <li><p>{duty.duty}</p></li>
        })
    }

    renderSuppliedFacts(facts) {
        const renderedFacts = []
        for (let fact in facts) {
            if (facts.hasOwnProperty(fact)) {
                renderedFacts.push(<li><p>{fact}: {JSON.stringify(facts[fact])}</p></li>)
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
            <FactModal show={this.state.prompt} fact={this.state.promptFact} handleResult={this.state.promptCallback}/>
        </div>
    }
}

export default ActorView
