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
    fetch("/literature-with-abstract.json")
      .then(res => res.json())
      .then(
        (result) => {
          this.setState({
            isLoaded: true,
            items: result
          });
          this.fuse = new Fuse(result, {
            keys: ['title', 'tags', 'abstract'],
            includeScore: true,
            distance: 200,
            threshold: 0.49,
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
        <div>
          {/* <Omnitable data={items} keyName="title" /> */}
          <DotMap width={600} height={600} data={
            searchResult.length ?
            searchResult.map(result => ({...result.item, refIndex: result.refIndex, score: result.score})):
            items
            } />
          <form onSubmit={this.handleSubmit}>
            <input type="text" value={searchPattern} onChange={this.handleChange} />
            <input type="submit"/>
            <input type="button" value="Clear" onClick={()=>{this.setState({searchPattern:"", searchResult:[]})}}/>
          </form>
          {
            searchResult.length ?
            <Omnitable data={searchResult.map(result => ({...result.item, refIndex: result.refIndex, score: result.score}))} keyName="title" /> : ''
          }
        </div>
      );
    }
  }
}

export default App
