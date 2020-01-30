
import React, { Component,Fragment } from 'react';
import { Text, View, FlatList} from 'react-native';
import { Header, Title, Body, Left, Right, Icon, List, ListItem, Content, Button } from 'native-base'
import { booleanLiteral } from '@babel/types';
import { createMessage } from '../js/utils.js';

class HistoryPage extends Component {
    constructor(props) {
        super(props)
        this.content = React.createRef()
        this.props.websocket.send(createMessage('sync-history'),'')
    }

    componentDidUpdate() {
        this.component._root.scrollToEnd()
        // console.log("Component updated new props",this.props.history)
    }
    render() {
        return (
            <View style={{ margin: "1%", flex: 1 }}>
            
                <View style={{ marginBottom: "1%", flex: 1, backgroundColor: "white" }}>
                    <Content style={{ margin: "1%", flex: 1 }} ref={c => (this.component = c)}>
                        <FlatList   
                            data={this.props.history}
                            renderItem={({item,index})=>{
                                let utcTime = parseInt(Object.keys(item)[0])
                                let timeObject = getTimeObject(utcTime)
                                let relayStat = item[Object.keys(item)[0]]
                                let isDifferentDays = false
                                let prevRelayStat = relayStat
                                //separating here by days, highlighting items if they are from different days
                                if(index == 0)
                                {
                                    isDifferentDays = true
                                    prevRelayStat = {}
                                }
                                if(index >0)
                                {
                                    let prevItem = this.props.history[index-1]
                                    let utcTime = parseInt(Object.keys(prevItem)[0])
                                    let prevTimeObject = getTimeObject(utcTime)
                                    if(prevTimeObject.day != timeObject.day)
                                        isDifferentDays = true
                                    prevRelayStat = prevItem[Object.keys(prevItem)[0]]
                                }
                                return(
                                    <Fragment>
                                        {isDifferentDays?<ListItem itemDivider>
                                            <Text>{timeObject.day + " " + months[timeObject.month]}</Text>
                                        </ListItem>:null}
                                        {
                                            prevRelayStat.relay1 != relayStat.relay1? 
                                                <HistoryItem timeObject={timeObject}
                                                statusHeader={"Состояние воды"}
                                                statusDescription={!relayStat.relay1?"Начало полива":"Конец полива" /*! cause 0 is relay on; 1 is off}*/}
                                                activeStatus={!relayStat.relay1}/>:null
                                        }
                                        {
                                            prevRelayStat.relay2 != relayStat.relay2? 
                                                <HistoryItem timeObject={timeObject}
                                                statusHeader={"Состояние Реле 2"}
                                                statusDescription={!relayStat.relay2 ? "Включено" : "Выключено" /*! cause 0 is relay on; 1 is off}*/}
                                                activeStatus={!relayStat.relay2}
                                                icon="alpha-r"/>:null
                                        }
                                        {
                                            prevRelayStat.relay3 != relayStat.relay3? 
                                                <HistoryItem timeObject={timeObject}
                                                statusHeader={"Состояние Реле 3"}
                                                statusDescription={!relayStat.relay3 ? "Включено" : "Выключено" /*! cause 0 is relay on; 1 is off}*/}
                                                activeStatus={!relayStat.relay3}
                                                icon="lightbulb-on"/>:null
                                        }
                                        {
                                            prevRelayStat.relay4 != relayStat.relay4 ? 
                                                <HistoryItem timeObject={timeObject}
                                                statusHeader={"Состояние Реле 4"}
                                                statusDescription={!relayStat.relay4 ? "Включено" : "Выключено" /*! cause 0 is relay on; 1 is off}*/}
                                                activeStatus={!relayStat.relay4}
                                                icon="house"/>:null
                                        }
                                        {
                                            prevRelayStat.disconnected != relayStat.disconnected ? 
                                                <HistoryItem timeObject={timeObject}
                                                statusHeader={"Сообщение от контроллера"}
                                                statusDescription={!relayStat.disconnected ? "Подключился к серверу" : "Отключился от сервера" /*! cause 0 is relay on; 1 is off}*/}
                                                activeStatus={!relayStat.disconnected}
                                                type={"Entypo"}
                                                size={18}
                                                icon={!relayStat.disconnected?"check":"block"}/>:null
                                        }
                                    </Fragment>   
                                )
                            }}
                        />
                    </Content>
                </View>
            </View>
        );
    }
}


export default HistoryPage;

const months = ['Января',
                'Февраля',
                'Марта',
                'Апреля',
                'Мая',
                'Июня',
                'Июля',
                'Августа',
                'Сентября',
                'Октября',
                'Ноября',
                'Декабря']
function getTimeObject(utcTime)
{
    let _date = new Date(utcTime)

    let _day = _date.getDate()
    let _month = _date.getMonth()
    let _hour = _date.getHours()
    let _minutes = _date.getMinutes()
    return {
        day:_day,
        month:_month,
        hour:_hour,
        minutes:_minutes
    }
}
function HistoryItem(props)
{
    return (
    <ListItem avatar>
        <Left>
            <Icon 
            type={props.type||"MaterialCommunityIcons"} 
            style={{alignSelf: "flex-start",color:props.activeStatus?"green":"red",fontSize: props.size||25}} 
            name={props.icon||(props.activeStatus?"water":"water-off")} large />
        </Left>
        <Body>
            <Text>{props.statusHeader}</Text>
            <Text note>{props.statusDescription}</Text>
        </Body>
        <Right >
            <Text note>{props.timeObject.hour + ':' + props.timeObject.minutes}</Text>
        </Right>
    </ListItem>
    )
    
}