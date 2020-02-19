import React, {Component} from 'react';
import './ModelView.css';
import {LawReg} from "@discipl/law-reg";

import ActorView from './ActorView'
import Util from "@discipl/law-reg/dist/util";
import EphemeralConnector from "@discipl/core-ephemeral/dist/EphemeralConnector";

const timeoutPromise = (timeoutMillis) => {
    return new Promise(function (resolve, reject) {
        setTimeout(() => resolve(), timeoutMillis)
    })
}

class ModelView extends Component {
  constructor(props) {
    super(props)

    this.lawReg = new LawReg()

    this.state = {
      'lb': this.props.model,
      'loading': true,
      'revert': false,
      'disableControls': false
    }
  }

  async componentDidMount() {
    console.log('ComponentDidMount', this.state.lb)
    await this.initialize(this.state.lb)
  }

  async componentDidUpdate(prevProps) {
    if (this.props.model !== prevProps.model) {
      this.setState({
        ...this.state,
        'lb': this.props.model
      })
      await this.initialize(this.state.lb)

    }
  }

  async reset() {
    this.setState({'caseLink': this.needLink, 'revert': true})
  }

  async revert() {
    const core = this.lawReg.getAbundanceService().getCoreAPI()
    const caseState = await core.get(this.state.caseLink)

    const previousCaseLink = caseState.data['DISCIPL_FLINT_PREVIOUS_CASE']
    if (previousCaseLink) {
      this.setState({'caseLink': previousCaseLink, 'revert': true})
    }
  }


  async initialize(model) {
    console.log('Initializing with', model)
    this.setState({...this.state, 'loading': true})
    if (model == null) {
      console.log('Empty model, not initializing')
      this.setState({...this.state, 'loading': false})
    }
    // Wait to allow react to render before crypto stuff
    await timeoutPromise(1)
    const core = this.lawReg.getAbundanceService().getCoreAPI()
    // Ensure ephemeral is loaded
    await core.registerConnector('ephemeral', new EphemeralConnector())


    const util = new Util(this.lawReg)

    const { ssids, modelLink } = await util.setupModel(model, this.props.config.actors, this.props.config.factFunctionSpec)



    this.needSsid = await core.newSsid('ephemeral')

    await core.allow(this.needSsid)
    this.needLink = await core.claim(this.needSsid, {
      'need': {
        'act': '<<leraar vraagt subsidie voor studiekosten aan>>',
        'DISCIPL_FLINT_MODEL_LINK': modelLink
      }
    })

    const actors = {}
    for (let actor of this.props.config.actors) {
      console.log(ssids)
      actors[actor] = ssids[actor]
    }


    this.setState({...this.state, 'actors': actors, 'caseLink': this.needLink, 'loading': false})
    console.log('State', this.state)
    console.log('Finished initialization')
    console.log('State', this.state)
  }


  onCaseChange(caseLink) {
    this.setState({...this.state, 'caseLink': caseLink, 'revert': false})
  }

  enableControls() {
    this.setState({
      'disableControls': false
    })
  }

  disableControls() {
    this.setState({
      'disableControls': true
    })
  }

  renderActorViews() {
    console.log("Rendering actor views")
    const result = [];
    const colors = ["#0a0", "#229"];
    console.log(this.props.config.actors)
    for (let actor of this.props.config.activeActors) {
      console.log('actor',actor)
      console.log(this.state.actors[actor])
      const color = colors.shift();
      result.push(
        <ActorView lawReg={this.lawReg} actors={this.state.actors} colorCode={color} caseLink={this.state.caseLink} name={actor} onCaseChange={this.onCaseChange.bind(this)} onStartAct={this.disableControls.bind(this)} onEndAct={this.enableControls.bind(this)}/>
      )
    }
    return result;
  }

  render() {
    console.log('ModelView render with state', this.state)
    if (this.state.loading === true) {
      console.log('View render loading true')
      return (<div><p>Loading...</p></div>)
    }
    return (
        <div>
        <div className='model-header'>
          <h1>
            Compliance by Design
          </h1>
          <button disabled={this.state.disableControls} onClick={this.reset.bind(this)}>Reset</button>
          <button disabled={this.state.disableControls} onClick={this.revert.bind(this)}>Undo</button>
        </div>
        <div className='grid-container'>
          {this.renderActorViews()}
        </div>
        </div>
    );
  }
}

export default ModelView;
