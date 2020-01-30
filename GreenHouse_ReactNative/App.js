/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow
 */

import React, { Component } from 'react';
import { View,Text,Dimensions,StyleSheet,ActivityIndicator } from 'react-native';
import WaterPage from './components/WaterPage.js'
import HistoryPage  from './components/HistoryPage.js'
import SchedulePage  from './components/SchedulePage.js'
import { Header,Content,Tabs,Tab,Container,Icon,TabHeading } from 'native-base'

import {createMessage} from './js/utils.js'
const { width, height } = Dimensions.get('window');
const styles = StyleSheet.create({
  column: {
    flexDirection: 'column',
    width: '30%',
    marginLeft: "1.5%",
    marginRight: "1.5%",
    marginTop: "2%",
    marginBottom: "1%"


  },
  columnButton: {
    flexDirection: 'column',
    width: '20%',
    height: '50%',
    marginLeft: "2.5%",
    marginRight: "2.5%",
    marginTop: "2%",
    marginBottom: "1%"
  },
})

const url = "ws://192.168.10.180:8000"
// const url = "ws://greenhouse.openode.io/"

class App extends Component {
  constructor(props) {
    super(props)
    this.state = {  isConnected: false, 
                    text: 0, color: "blue", 
                    waterShow: true, 
                    nodeMCUState: {},
                    history:[]
                  }
    this.ws = new WebSocket(url)   
    this.ws.onopen = () => {
      this.setState({ isConnected: true })
      this.ws.send(createMessage('get-state'))
      setInterval(() => {
        this.ws.send(JSON.stringify({ 'type': 'ping' }))
      }, 30000)
    }
    this.ws.onerror = (ev) => {
      console.log("Close", ev)
      this.setState({ isConnected: false })
      this.ws.close()
      setTimeout(() => {
        let socket = new WebSocket(url)
        socket.onopen = this.ws.onopen
        socket.onerror = this.ws.onerror
        socket.onmessage = this.ws.onmessage
        this.ws = socket
      }, 2000)}
 
      this.ws.onmessage = (ev) => {
        console.log(this.state.nodeMCUState)
        try {
          let message = JSON.parse(ev.data)
          if (message.type == 'state-update') {
            let data = JSON.parse(message.data)
            // console.log(data,typeof data.relay1)
            this.setState((state, props) => {
              return {...state, nodeMCUState:{...state.nodeMCUState,...data}}
            });
            
          }
          if (message.type == 'history-update') {
            let data = JSON.parse(message.data)
            // console.log(data,typeof data.relay1)
            this.setState((state, props) => {
              // console.log("HISTORY ",{...state, history: data})
              return {...state, history:data}
            });
            
          }
        } catch (error) {
    
          console.log("Error happend", error, ev.data)
        }
      }

  }
  render() {
    return (
      <Container>
      <Tabs tabBarUnderlineStyle={{backgroundColor:this.state.nodeMCUState.nodeMCUConnected?"#7FFF00":"orange"}}>
        <Tab heading={ <TabHeading>
                          <Icon style={{fontSize:width/20,marginRight:"8%"}} name="water" />
                          <Text style={{color:"white"}}>Состояние</Text>
                       </TabHeading>}>
           <WaterPage isConnected={this.state.nodeMCUState.nodeMCUConnected} websocket={this.ws} state={this.state.nodeMCUState} />
        </Tab>
        <Tab heading={ <TabHeading>
                          <Icon style={{fontSize:width/20,marginRight:"8%"}} name="clock" />
                          <Text style={{color:"white"}}>Расписание</Text>
                       </TabHeading>}>
        <SchedulePage isConnected={this.state.nodeMCUState.nodeMCUConnected} websocket={this.ws} duration={this.state.nodeMCUState.duration/(3600*1000)} schedule={this.state.nodeMCUState.schedule} />

        </Tab>
        <Tab heading={ <TabHeading>
                          <Icon style={{fontSize:width/20,marginRight:"8%"}} name="paper" />
                          <Text style={{color:"white"}}>История</Text>
                       </TabHeading>}>
        <HistoryPage isConnected={this.state.nodeMCUState.nodeMCUConnected} websocket={this.ws} history={this.state.history} />

        </Tab>
        
      </Tabs>
     { !this.state.isConnected?<ActivityIndicator 
          animating={true}
          size={width / 2}
          color="orange"
          style={{
            flex: 1,
            position: 'absolute',
            left: 0,
            top: 0,
            opacity: 0.5,
            backgroundColor: 'black',
            width: width,
            height:'100%',
            
          }} /> :null}
    </Container>
    );
  }
}



export default App;
