import React, { Component } from 'react';
import './App.css';
import web3 from './web3';
import lottery from './lottery';

class App extends Component {
  state = {
    manager: '',
    players: [],
    balance: '',
    value: '',
    message: '',
    account: undefined,
    winner: null
  };

  async componentDidMount() {
    const manager = await lottery.methods.manager().call();
    const players = await lottery.methods.getPlayers().call();
    const balance = await web3.eth.getBalance(lottery.options.address);
    const winner = await lottery.methods.getLastWinner().call();
    const account = (await web3.eth.getAccounts())[0];

    this.setState({ manager, players, balance, account, winner });
  }

  onSubmit = async event => {
    event.preventDefault();

    this.setState({ message: 'Waiting on transaction success ...' });

    await lottery.methods.enter().send({
      from: this.state.account,
      value: web3.utils.toWei(this.state.value, 'ether')
    });

    this.setState({ message: 'You have been entered succesfully!' });
  };

  selectWinner = async () => {
    await lottery.methods.pickWinner().send({
      from: this.state.account
    });

    const winner = await lottery.methods.getLastWinner().call();
    this.setState({ winner });
  };

  render() {
    return (
      <div>
        <h2>Lottery Contract</h2>
        <p>
          This contract is managed by {this.state.manager}. There are currently{' '}
          {this.state.players.length} people enterered, competing to win{' '}
          {web3.utils.fromWei(this.state.balance, 'ether')} ethers.
        </p>
        <hr />
        <form onSubmit={this.onSubmit}>
          <h4>Want to try your luck?</h4>
          <div>
            <label>Amount of ether to enter (> 0.01 eth) </label>
            <input
              value={this.state.value}
              onChange={event => this.setState({ value: event.target.value })}
            />
          </div>
          <button>Enter</button>
          <p>Account under use is {this.state.account}.</p>
        </form>
        <h1>{this.state.message}</h1>
        {this.state.account === this.state.manager ? (
          <React.Fragment>
            <hr />
            <button onClick={this.selectWinner}>Pick Winner</button>
            <p />
          </React.Fragment>
        ) : null}
        <hr />
        <p>The last winner is : {this.state.winner}</p>
      </div>
    );
  }
}

export default App;
