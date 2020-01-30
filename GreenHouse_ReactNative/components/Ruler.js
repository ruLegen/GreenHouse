import React, { Component, Fragment } from 'react';
import { Text, View, Dimensions,ScrollView} from 'react-native';
import { Header, Title, Body, Left, Right, Icon, List, ListItem, Content, Button } from 'native-base'
const width = Dimensions.get("window").width


class Ruler extends Component {
    constructor(props) {
        super(props)
        this.state = {
            iconWidth: 18,
            parentX: 0,
            timeValue: 0,
        }          //later add substraction of parent's X offset
        this.parentLayoutHandler = (event) => {
            this.setState({ parentX: event.nativeEvent.layout.x })
        }
        this.IconLayoutHandler = (event) => {
            const date = new Date()
            const time = date.getHours() + ((1 / 60) * date.getMinutes())
            const _timeValue = (width - this.state.parentX - (this.state.iconWidth / 2)) / 24 * time
            const _iconWidth = event.nativeEvent.layout.width
            this.setState((prev) => {
                return {
                    ...prev,
                    iconWidth: _iconWidth,
                    timeValue: _timeValue
                }
            })

        }

        setInterval(() => {
            const date = new Date()
            const time = date.getHours() + ((1 / 60) * date.getMinutes())
            const _timeValue = (width - this.state.parentX - (this.state.iconWidth / 2)) / 24 * time
            this.setState((prev) => {
                return {
                    ...prev,
                    timeValue: _timeValue
                }
            })
        }, 1000 * 60);

    }


    render() {
        return (
            <View style={{
                alignItems: "stretch",
                alignItems: "center",
                justifyContent: "center",
                paddingLeft: "0%",
                flex: 1,
                flexWrap: "wrap",
                minWidth: "100%",
                maxHeight: "10%",
                backgroundColor: "gray"
            }}>
                <View  style={{ flex: 1,backgroundColor: "white",flexDirection:"row"}}>
                    {(() => {
                        const highlightArray = this.props.highlight || []
                        const verticalLines = Array(24).fill(0).map((item, index) => {
                            return (
                                <View key={index} style={{
                                    // marginTop:"2%",
                                    flex: 1,
                                    alignItems: "center",
                                    justifyContent: "flex-end",
                                    backgroundColor: highlightArray.includes(index) ? "#00FF00" : "white"
                                }}>
                                    <Text style={{ fontSize: 10 }}>{index}</Text>
                                    <Text style={{}}>|</Text>
                                </View>
                            )
                        })
                        return (verticalLines)
                    })()}
                </View>
                <View onLayout={this.parentLayoutHandler} style={{ backgroundColor: "white", minWidth: "100%", alignSelf: "flex-start", flexDirection: "row" }}>
                    <Icon onLayout={this.IconLayoutHandler}
                        style={{ left: this.state.timeValue, fontSize: 18 }} type="AntDesign" name="arrowup" />
                    {/* Here is Icon pointing with its left cornor, make calulation with its width */}
                </View>
            </View>
        )
    }
}

export default Ruler