import React, { Component, Fragment } from 'react';
import { Text, View, Dimensions, StyleSheet, Picker } from 'react-native';
import { Header, Title, Body, Left, Right, Icon, List, ListItem, Content, Button } from 'native-base'
import Ruler from './Ruler.js'
import { createMessage } from '../js/utils.js'

const width = Dimensions.get("window").width

const cb = require('../node_modules/cron-builder/cron-builder.js');
const styles = StyleSheet.create({
    optimalFontSize: {
        fontSize: width / 15
    },
    center: {
        justifyContent: "center",
        alignItems: "center",
        flex: 1
    },
    button: {
        margin: "2%",
        minHeight: "40%",
    },
    shadow: {
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 7,
        },
        shadowOpacity: 0.43,
        shadowRadius: 9.51,

        elevation: 15,
    }
})
class SchedulePage extends Component {

    constructor(props) {
        super(props)
        this.props.websocket.send(createMessage('get-state', ''))
        this.timeZoneShifting = 3
        this.cronExp = new cb(this.props.schedule)
        this.hours = this.cronExp.get('hour').split(',')
        this.hours = this.hours.map((item) => {
            let currentHour = parseInt(item) + this.timeZoneShifting
            if (currentHour >= 24)
                currentHour -= 24
            return currentHour
        })  //3 mean timezone shifting

        this.dayOfTheMonth = this.cronExp.get('dayOfTheMonth').split('/')[1] - 1 || "*"
        this.activeButton = '*'
        this.state = {
            selectedHour: this.hours[0].toString(),
            duration: this.props.duration.toString() || '3'        //add here duration
        }
        this.updateSchedule = (days) => {
            this.cronExp.set('dayOfTheMonth', [days])
            const newSchedule = this.cronExp.build()
            this.props.websocket.send(createMessage('change-state', { schedule: newSchedule }))
            //When nodeMCU will accept new schedule props will be update
        }
        this.updatePicker = (itemValue) => {
            console.log(itemValue)
            this.setState({ selectedHour: itemValue.toString() })
        }
        this.updateDurationPicker = (itemValue) => {
            console.log(itemValue)
            this.setState({ duration: itemValue.toString() })
        }

        this.updateScheduleHour = () => {
            //calculate with time zone shiftimg
            let hours = parseInt(this.state.selectedHour)
            hours = hours - this.timeZoneShifting
            if (hours < 0)
                hours += 24

            this.cronExp.set('hour', [hours.toString()])
            this.cronExp.set('minute', ['0'])           //change here to 0

            const newSchedule = this.cronExp.build()
            this.props.websocket.send(createMessage('change-state', { schedule: newSchedule }))
        }
        this.updateScheduleDuration = () => {


            this.props.websocket.send(createMessage('change-state', { duration: parseInt(this.state.duration) * 3600 * 1000 }))

        }
    }
    componentDidMount() {
        console.log("MOuntded")
        console.log(this.state)
        // hours: this.hours,
        // days: this.dayOfTheMonth,
        // selectedHour:this.hours[0].toString(),
        // 

    }
    componentWillUpdate() {
        console.log("UPDATED")
        this.cronExp = new cb(this.props.schedule)
        this.hours = this.cronExp.get('hour').split(',')
        this.hours = this.hours.map((item) => {
            let currentHour = parseInt(item) + this.timeZoneShifting
            if (currentHour >= 24)
                currentHour -= 24
            return currentHour
        })  //3 mean timezone shifting


        this.dayOfTheMonth = this.cronExp.get('dayOfTheMonth').split('/')[1] - 1 || "*"
        this.activeButton = this.dayOfTheMonth == "*" ? 0 : this.dayOfTheMonth

    }
    render() {
        return (
            <View style={{ margin: "1%", flex: 1 }}>
    
                <View style={[styles.center, { marginBottom: "1%", flex: 1, maxHeight: "90%", backgroundColor: "white" }]}>
                    <View style={styles.center}>
                        <View style={styles.center}>
                            <Text style={[styles.optimalFontSize, { alignSelf: "flex-start" }]}>Полив запланирован:</Text>
                            <View style={{}}>
                                <Text style={styles.optimalFontSize}>
                                    {(() => {
                                        if (this.dayOfTheMonth == "*")
                                            var outPutString = "Каждый день"
                                        else {
                                            var outPutString = "Через " + this.dayOfTheMonth
                                            outPutString += this.dayOfTheMonth == 1 ? " сутки" : " суток"
                                        }
                                        return outPutString
                                    })()
                                    }
                                </Text>
                                {
                                    this.hours.map((item, index) => {
                                        return (<Text key={index} style={[styles.optimalFontSize, { color: "#119911" }]}>• В {item} часов</Text>)
                                    })}
                                <Text style={styles.optimalFontSize}>Продолжительность</Text>
                                <Text style={[styles.optimalFontSize, { color: "#119911" }]}>• В {this.props.duration} {this.props.duration == 1 ? "час" : "часа"}</Text>



                            </View>
                        </View>
                    </View>
                    <View style={{ flex: 1, alignItems: "center" }}>
                        <Ruler highlight={this.hours} />
                        <View style={{ flexDirection: "row", justifyContent: "center", alignContent: "center", marginTop: "20%", margin: "2%" }}>
                            <Button disabled={!this.props.isConnected} style={[styles.center, styles.button, { backgroundColor: this.activeButton == 0 ? "green" : "red" }]} onPress={() => { this.updateSchedule("*") }}><Text>Каждый день</Text></Button>
                            <Button disabled={!this.props.isConnected} style={[styles.center, styles.button, { backgroundColor: this.activeButton == 1 ? "green" : "red" }]} onPress={() => { this.updateSchedule("*/2") }}><Text>Через день</Text></Button>
                            <Button disabled={!this.props.isConnected} style={[styles.center, styles.button, { backgroundColor: this.activeButton == 2 ? "green" : "red" }]} onPress={() => { this.updateSchedule("*/3") }}><Text>Через 2 дня</Text></Button>
                        </View>

                        <View style={{ marginBottom:"2%",padding: "1%", flexDirection: "row", justifyContent: "center", alignItems: "baseline", flex: 1 }}>
                            <Text style={{ flex: 0.4, alignSelf: "center" }}>Начало полива</Text>

                            <Picker style={{ flex: 1}} selectedValue={this.state.selectedHour}
                                onValueChange={this.updatePicker}>
                                {(() => {
                                    const dropDownItems = Array(24).fill(0).map((itemn, index) => {
                                        return (<Picker.Item label={index.toString() + " часов"} key={index} value={index.toString()} />)
                                    })
                                    return (dropDownItems)
                                })()}
                            </Picker>
                            <Button disabled={!this.props.isConnected} onPress={this.updateScheduleHour} style={{ padding: "1%", flex: 0.35 }}><Text  style={{width:"100%",color:"white"}}>Принять</Text></Button>
                        </View>

                        <View style={{ padding: "1%", flexDirection: "row", justifyContent: "center", alignItems: "baseline", flex: 1 }}>
                            <Text style={{ flex: 0.4, alignSelf: "center" }}>Продолжительность полива</Text>

                            <Picker style={{ flex: 1 }} selectedValue={this.state.duration}
                                onValueChange={this.updateDurationPicker}>
                                {(() => {
                                    const dropDownItems = [1, 2, 3].map((item, index) => {
                                        return (<Picker.Item label={item.toString() + " часа"} key={item} value={item.toString()} />)
                                    })
                                    return (dropDownItems)
                                })()}
                            </Picker>
                            <Button disabled={!this.props.isConnected} onPress={this.updateScheduleDuration} style={{ padding: "1%", flex: 0.35 }}><Text style={{width:"100%",color:"white"}}>Принять</Text></Button>
                        </View>

                    </View>
                </View>
            </View>
        )
    }
}



export default SchedulePage

// 0 6,12 *'+'/'+'* *'