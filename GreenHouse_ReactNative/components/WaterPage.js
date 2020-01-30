
import React, { Component } from 'react';
import { Text, View, Image,ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { Button,Header,Left,Body,Right,Title,Icon } from 'native-base'
import FastImage from 'react-native-fast-image'
import {createMessage} from '../js/utils.js'
class WaterPage extends Component {
    constructor(props) {
        super(props)
        this.state = {waterShow:false}
        console.log(props)
    }
    handleRelayUpdate = (e)=>{

        console.log("BUTTON CLICKED")
        const newRelayState = +!this.props.state.relay1
        this.props.websocket.send(createMessage('change-state',{relay1:newRelayState}))
        
    }
    render() {
        return (
            <View style={{flex: 1,backgroundColor:"#1e1e1e"}}>
                <View style={{ flex: 3, borderRadius: 5, backgroundColor: "#333333" }}>
                <Header style={{maxHeight:"70%",borderRadius:10,backgroundColor:this.props.state.relay1?"#FF0000":"#32CD32"}}>
                <Left>
                <Icon style={{color:"#4682B4"}} name='water' />
                </Left>
                    <Body>
                        <Title style={{width:"100%"}}>Состояние воды</Title>
                    </Body>
                    <Right />
                </Header>
                    <View style={{ flex: 1 }}>
                        <FastImage
                            source={require('../images/water2.gif')}
                            opacity={this.props.state.relay1 ? 0 : 1}
                            style={{ flex: 0.5, height: "50%", width: "50%", alignSelf: "flex-end" }}
                            resizeMode="cover"
                            resizeMethod="scale"
                        />
                        <FastImage
                            source={require('../images/flower.gif')}
                            style={{ flex: 1, height: "100%", width: "100%", alignSelf: "flex-start" }}
                            resizeMode="cover"
                            resizeMethod="scale"
                        />
                    </View>
                </View>
                <View style={{ marginTop: "1%", flex: 1, borderRadius: 5, backgroundColor: "#333333", alignItems: "center" }}>
                    <Button disabled={!this.props.isConnected} style={{ backgroundColor: this.props.isConnected? "#7cdcfe":"gray", marginTop: "1%", marginBottom: "1%", flex: 3, minWidth: "80%", justifyContent: "center", alignSelf: "center" }}
                        onPress={this.handleRelayUpdate}>
                        <Text>{this.props.state.relay1 ? "Включить воду" :"Выключить воду"}</Text>
                    </Button>
                    <TouchableOpacity style={{ marginTop: "2%", marginBottom: "2%", flex: 1, maxWidth: "30%", maxHeight: "10%", alignSelf: "center" }}>
                        <View style={{ flex: 1, minWidth: "200%", alignSelf: "center", backgroundColor: this.props.state.relay1 ? "#ff9333" :  "#4ebe7d"}}></View>
                    </TouchableOpacity>
                </View>
            </View>
        );
    }
}

export default WaterPage;
