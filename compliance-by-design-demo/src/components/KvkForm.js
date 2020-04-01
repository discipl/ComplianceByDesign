import React, { Component } from 'react';

class KvkForm extends Component {
    constructor(props) {
        super(props)
        this.state = {
            kvkNumber: "69599084",
            derivedFacts: null
        }
    }

    async query() {
        const result = await fetch("/api/v2/testprofile/companies?kvkNumber=" + this.state.kvkNumber)
        const data = await result.json()
        console.log(data)

        const companyInfo = data.data.items[0]


        const derivedFacts = {}

        // Check foundation and registration date
        
        const foundedAndRegisteredInTime = (parseInt(companyInfo.foundationDate) < 20200315) && (parseInt(companyInfo.registrationDate) < 20200315)

        derivedFacts['[onderneming is voor 15 maart 2020 opgericht en ingeschreven in het KVK Handelsregister]'] = foundedAndRegisteredInTime

        const fewEmployees = parseInt(companyInfo.employees) < 250
    

        this.setState({
            derivedFacts: derivedFacts
        })
    }

    handleChange(event) {    
        this.setState({kvkNumber: event.target.value})  
    }

    returnDerivedFacts() {
        if (this.props.handleDerivedFacts) {
            this.props.handleDerivedFacts(this.state.derivedFacts)
        }
    }

    render() {
        if (this.state.derivedFacts) {
            return (
            <button onClick={this.returnDerivedFacts.bind(this)}>Confirm</button>
            )
        }
        return (
            <form onSubmit={this.query.bind(this)}>
            <input type="text" placeholder="KVK nummer" onChange={this.handleChange.bind(this)} value={this.state.kvkNumber}></input><input type="submit" value="Gegevens opsturen"/> 
          </form>
        )
    }
}

export default KvkForm