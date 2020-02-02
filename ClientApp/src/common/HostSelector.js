import React, { Component } from 'react';
import { Api } from '../services/api'

export class HostSelector extends Component {

    constructor(props) {
        super(props);
        this.state = { hosts: [], selectedHost:null, selectedPort:null }
    }

    setSelectedHost(value) {
        if (!value) { return; }
        this.setState({ selectedHost: value });
        if (this.props.onHostSelected) {
            this.props.onHostSelected(value);
        }

        this.setSelectedPort(value.ports.length > 0 ? value.ports[0] : null)
    }

    setSelectedPort(value) {
        this.setState({ selectedPort: value });
        if (this.props.onPortSelected) {
            this.props.onPortSelected(value);
        }
    }

    reset() {
        this.selected = null;
        this.setState({ hosts: [], selectedHost: null, selectedPort:null })
    }

    process(values) {
        if (!Array.isArray(values)) { values = [values]; }
        if (!values || values.length < 1 || !values[0].name) { return; }

        let h = this.state.hosts;
        let he = h.filter(v => v.name == values[0].name);
        he = he.length > 0 ? he[0] : null;

        if (!he) {
            let ports = [];
            let newPorts = values.filter(v => values[0].name === v.name).map(o => o.port);
            for (let i = 0; i < newPorts.length; i++) {
                if (ports.filter(o => o === newPorts[i]).length < 1) {
                    ports.push(newPorts[i]);
                }
            }
            h.push({ name: values[0].name, ports: ports.sort() });
            this.setState({ hosts: h });
            if (this.props.onNewHostDetected) { this.props.onNewHostDetected(values[0].name); }
        }
        else {
            let newPorts = values.filter(o => o.name === he.name && he.ports.filter(hp => hp === o.port).length < 1).map(o => o.port);
            if (newPorts && newPorts.length > 0) {
                // insert new ports
                for (let i = 0; i < newPorts.length; i++) {
                    if (he.ports.filter(o => o === newPorts[i]).length < 1) {
                        he.ports.push(newPorts[i]);
                    }
                }
               
                this.setState({ hosts: h });
            }
        }

        if (!this.state.selectedHost) {
            this.setSelectedHost(h[0]);
        }
    }

    ddlHostsSelected(evt) {
        this.setSelectedHost(this.state.hosts.filter(o => o.name == evt.target.value)[0]);
    }

    ddlPortSelected(evt) {
        this.setSelectedPort(evt.target.value);
    }

    render() {
        return (
            <React.Fragment>
                <div id="ddlHosts" class="input-group mr-1 group" onChange={this.ddlHostsSelected.bind(this)}>
                    <div class="input-group-prepend">
                        <label class="input-group-text" for="inputGroupSelect01">Host</label>
                    </div>
                    <select class="custom-select" id="inputGroupSelect01">
                        {this.state.hosts.map((v, i) => <option key={`hostOption${i}`} value={v.name}>{v.name}</option>)}
                    </select>
                </div>
                <div id="ddlPorts" class="input-group mr-1 group" onChange={this.ddlPortSelected.bind(this)}>
                    <div class="input-group-prepend">
                        <label class="input-group-text" for="inputGroupSelect01">Port</label>
                    </div>
                    <select class="custom-select" id="inputGroupSelect02">
                        {(this.state.selectedHost ? this.state.selectedHost : { ports: [] }).ports.map((v, i) => <option key={`portOption${i}`} value={v}>{v}</option>)}
                    </select>
                </div>
            </React.Fragment>
        );
    }
}