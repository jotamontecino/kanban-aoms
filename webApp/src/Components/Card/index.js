import React, { Component } from 'react';
import { Card } from 'antd';

class App extends Component {
  render() {
    return (
      <Card
        size="small"
        title="Default size card"
        extra={<a href="#tata">More</a>}
        style={{ width: 300 }}
      >
        <p>Card content</p>
        <p>Card content</p>
        <p>Card content</p>
      </Card>
    );
  }
}

export default App;
