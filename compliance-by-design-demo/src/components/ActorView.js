import React, { Component } from 'react';
import './ActorView.css'

class ActorView extends Component {
    constructor(props) {
        super(props)
        console.log('Constructing ActorView', props)
        this.state = {
            'facts': [],
            'nonFacts': [],
            'loading': true,
        }

        this.memory = {
        }
    }

    async componentDidMount() {
        await this.computeRenderData([], [])
    }

    async componentDidUpdate(prevProps, prevState) {
        console.log('ComponentDidUpdate', 'prev:', prevProps, 'current:', this.props)

        const propsChanged = this.props.caseLink !== prevProps.caseLink || this.props.actorSsid !== prevProps.actorSsid
        const stateChanged = this.state.facts.length !== prevState.facts.length || this.state.nonFacts.length !== prevState.nonFacts.length
        if (propsChanged || stateChanged) {
            console.log(stateChanged)
            if (propsChanged && this.props.reset) {
                console.log('ComponentDidUpdate reset')
                await this.computeRenderData([], []);
                this.memory[this.props.caseLink] = {
                    'facts': [],
                    'nonFacts': []
                }
                this.setState({'facts': [], 'nonFacts': []})

            } else if (this.props.revert && this.memory[this.props.caseLink] != null) {
                console.log('ComponentDidUpdate reverting', this.props.name, 'to facts', this.memory[this.props.caseLink])

                await this.computeRenderData(this.memory[this.props.caseLink].facts, this.memory[this.props.caseLink].nonFacts)
                this.setState({'facts': this.memory[this.props.caseLink].facts, 'nonFacts': this.memory[this.props.caseLink].nonFacts})
            } else {
                console.log('ComponentDidUpdate normal render')
                console.log('ComponentDidUpdate revert: ', this.props.revert, this.memory)
                if (this.memory[this.props.caseLink] == null) {
                    this.memory[this.props.caseLink] = {
                        'facts': this.state.facts,
                        'nonFacts': this.state.nonFacts
                    }
                }

                await this.computeRenderData(this.state.facts, this.state.nonFacts)

            }
        }
    }

    async computeRenderData(facts, nonFacts) {
        this.setState({'loading': true})
        console.log('ComputeRenderDataState', this.state)
        console.log('ComputeRenderData', this.props)
        console.log('ComputeRenderData facts and nonFacts', facts, nonFacts)

        let availableActs = await Promise.all((await this.props.lawReg.getAvailableActs(this.props.caseLink, this.props.actorSsid, facts, nonFacts))
            .map(async (act) => {
                const details = await this.props.lawReg.getActDetails(act.link, this.props.actorSsid)
                return {...act, 'details': details}
            }))
        let potentialActs = await Promise.all((await this.props.lawReg.getPotentialActs(this.props.caseLink, this.props.actorSsid, facts, nonFacts))
            .map(async (act) => {
                const details = await this.props.lawReg.getActDetails(act.link, this.props.actorSsid)
                return {...act, 'details': details}
            }))
        let previousActs = await this.props.lawReg.getActions(this.props.caseLink, this.props.actorSsid)
        this.setState({
            'availableActs': availableActs,
            'potentialActs': potentialActs,
            'previousActs': previousActs,
            'loading': false
        })
    }

    async takeAction(act) {
        try {
            let caseLink = await this.props.lawReg.take(this.props.actorSsid, this.props.caseLink, act, this.askFact.bind(this))
            this.memory[caseLink] = {
                'facts': this.state.facts,
                'nonFacts': this.state.nonFacts
            }
            if (this.props.onCaseChange) {
                this.props.onCaseChange(caseLink)
            }
        } catch (e) {
            if (e.message.includes('is not allowed')) {
                alert(e.message)
            }
        }

    }

    askFact (fact) {
        if (this.state.facts.includes(fact)) {
            return true
        }

        if (this.state.nonFacts.includes(fact)) {
            return false
        }

        let result = window.confirm('Is ' + fact + ' van toepassing?')

        console.log('ActorView', this)
        if (result) {

            this.setState((state) => {
                let newFacts = state.facts.slice(0)
                newFacts.push(fact)
                return {
                    'facts': newFacts
                }
            })
        }
        else {
            this.setState((state) => {
                let newNonFacts = state.nonFacts.slice(0)
                newNonFacts.push(fact)
                return {
                    'nonFacts': newNonFacts
                }
            })
        }

        return result
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

    async deleteFact(deleteFact) {
        this.setState((state) => {
            return {
                'facts': state.facts.filter((fact) => fact !== deleteFact)
            }
        })
    }

    async deleteNonFact(deleteNonFact) {
        this.setState((state) => {
            return {
                'nonFacts': state.nonFacts.filter((nonFact) => nonFact !== deleteNonFact)
            }
        })
    }

    renderWallet() {
        console.log('Rendering wallet from', this.state.facts)
        return this.state.facts.map((fact) => <li><p>{fact}<button className='removalButton' onClick={this.deleteFact.bind(this, fact)}>-</button></p></li>)
    }

    renderFalseFacts() {
        return this.state.nonFacts.map((fact) => <li><p>{fact}<button className='removalButton' onClick={this.deleteNonFact.bind(this, fact)}>-</button></p></li>)
    }

    renderPreviousActs() {
        if (!this.state.previousActs) {
            return []
        }
        return this.state.previousActs.map((prevAct) => {
            return <li><p>{prevAct.act}</p></li>
        })
    }

    render() {
        console.log('ActorView render with state', this.state)
        if (this.state.loading === true) {
            console.log('ActorView render loading true')
            return <div className="container"><div className="acts"><p>Loading...</p></div></div>
        }
        return <div className="container">

            <div className="actorHeader" style={{'backgroundColor': this.props.colorCode}}>
              <h3>{this.props.name}</h3>
            </div>
            <div className="acts">
                {this.renderAvailableActs()}
                {this.renderPotentialActs()}
            </div>
            <div className="wallet">
              <h4>Wallet</h4>
              <ul>
                  {this.renderWallet()}
                  <h5>False items</h5>
                  {this.renderFalseFacts()}
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
