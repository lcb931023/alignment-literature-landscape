import { Component } from 'react'
import Fuse from 'fuse.js'
import Omnitable from './Omnitable'
import DotMap from './DotMap'

class App extends Component {
  constructor(props) {
    super(props)
    this.state = {
      error: null,
      isLoaded: false,
      items: [],
      searchPattern: '',
      searchResult: [],
    }
  }

  handleChange = (event) => {
    this.setState({searchPattern: event.target.value})
  }

  handleSubmit = (event) => {
    event.preventDefault()
    const result = this.fuse.search(this.state.searchPattern)
    console.log(result)
    this.setState({
      searchResult: result
    })
  }

  componentDidMount() {
    fetch("/literature.json")
      .then(res => res.json())
      .then(
        (result) => {
          this.setState({
            isLoaded: true,
            items: result
          });
          this.fuse = new Fuse(result, {
            keys: ['title']
          })
        },
        (error) => {
          this.setState({
            isLoaded: true,
            error
          });
        }
      )
  }

  render() {
    const { error, isLoaded, items, searchPattern, searchResult } = this.state;
    if (error) {
      return <div>Error: {error.message}</div>;
    } else if (!isLoaded) {
      return <div>Loading...</div>;
    } else {
      return (
        // <Omnitable data={items} keyName="title" />
        <div>
          <DotMap width={800} height={600} />
          <form onSubmit={this.handleSubmit}>
            <input type="text" value={searchPattern} onChange={this.handleChange} />
          </form>
          {
            searchResult.length ?
            <Omnitable data={searchResult.map(result => ({...result.item, refIndex: result.refIndex}))} keyName="title" /> : ''
          }
        </div>
      );
    }
  }
}

export default App
