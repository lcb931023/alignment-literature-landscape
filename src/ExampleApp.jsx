import { Component, useState } from 'react'
import reactLogo from './assets/react.svg'
import './ExampleApp.css'

function ManualItem(props) {
  return (
    <div>{JSON.stringify(props)}</div>
  )
}

class Clock extends Component {
  constructor(props) {
    super(props)
    this.state = {date: new Date()}
  }
  componentDidMount() {
    this.timerID = setInterval(()=>this.tick(), 1000)
  }
  componentWillUnmount() {
    clearInterval
  }
  tick() {
    this.setState({
      date: new Date()
    })
  }
  render() {
    const showBlinker = this.state.date.getSeconds() % 2 == 0
    return (
      <div>
        <h1>Hello, world!</h1>
        <h2>It is {this.state.date.toLocaleTimeString()}.
        {showBlinker &&
          <span style={{fontSize: '0.5em'}}> blink</span>
        }
        </h2>
      </div>
    );
  }
}

class ListOfThings extends Component {
  constructor(props) {
    super(props)
  }
  render() {
    const listItems = this.props.items.map((number, i) => 
      <li key={i}>{number}</li>
    )
    return (
      <ul>{listItems}</ul>
    )
  }
}

class NameForm extends Component {
  constructor(props) {
    super(props);
    this.state = {value: ''};
  }

  handleChange = (event) => {
    this.setState({value: event.target.value});
  }

  handleSubmit = (event) => {
    event.preventDefault();
    alert('A name was submitted: ' + this.state.value);
  }

  render() {
    return (
      <div>
        <form onSubmit={this.handleSubmit}>
          <label>
            Name:
            <input type="text" value={this.state.value} onChange={this.handleChange} />
          </label>
          <input type="submit" value="Submit" />
        </form>
        {
          this.state.value &&
          <h2>Hello, {this.state.value}!</h2>
        }
      </div>
    );
  }
}


function App() {
  const [count, setCount] = useState(0)

  function handleClick() {
    setCount(count+1)
  }

  return (
    <div className="App">
      <div>
        <a href="https://vitejs.dev" target="_blank">
          <img src="/vite.svg" className="logo" alt="Vite logo" />
        </a>
        <a href="https://reactjs.org" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>Vite + React</h1>
      <div className="card">
        <button onClick={() => setCount((count) => count + 1)}>
          count is {count}
        </button>
        <p>
          Edit <code>src/App.jsx</code> and save to test HMR
        </p>
      </div>
      <p className="read-the-docs">
        Click on the Vite and React logos to learn more
      </p>
      <ManualItem className="item" name="Manual item one">Text content</ManualItem>
      <ManualItem className="item" name="Manual item two"></ManualItem>
      <ManualItem className="item" name="Manual item bobo"></ManualItem>
      <Clock />
      <ListOfThings items={[2,3,4,5,6,7,8]} />
      <NameForm />
    </div>
  )
}

export default App
