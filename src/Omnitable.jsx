import { Component } from 'react'

class Omnitable extends Component {
  constructor(props) {
    super(props)
  }
  render() {
    return (
      <table>
      <thead>
        <tr>
          {Object.keys(this.props.data[0]).map((key) => (
            <th key={key}>{key}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {this.props.data.map((item, index) => (
          <tr key={`${index} - ${item[this.props.keyName]}`}>
            {Object.values(item).map(value => (
              <td key={value}>{value}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
    );
  }
}

export default Omnitable