import { Ionicons } from '@expo/vector-icons';
import * as WebBrowser from 'expo-web-browser';
import * as React from 'react';
import { StyleSheet, Text, View, Alert, TouchableOpacity, Platform, TouchableHighlightBase } from 'react-native';
import { RectButton, ScrollView } from 'react-native-gesture-handler';
import { Badge, Button, ListItem, Input } from 'react-native-elements';
import { Picker } from '@react-native-community/picker';
import TabBarIcon from '../../components/TabBarIcon';
import DateTimePickerModal from 'react-native-modal-datetime-picker';

let title = "";
let memo = "";

export default class RequestScreen extends React.Component {

  state = {
    index: 1,
    isDataLoaded: false,
    isDatePickerVisible: false, // date picker
    isStartTime: false, // since I need to save both startTime and endTime with one picker, use a flag to seperate them
    startTime: null, // data to send to the web server
    endTime: null, // data to send to the web server
    startTimeDataForServer: null,
    endTimeDataForServer: null,
    test: null,
    interestCategoryId: 0,
  }

  constructor(props) {
    super(props);

    var date = new Date();

    this.state = {
      test: props.route.params.test,
      categoryId: props.route.params.categoryId,
      categoryName: props.route.params.categoryName,

      startTime: this.parseDate(date),
      endTime: this.parseDate(date),
    }
  }

  parseDate(newDate) {

    var year = this.addZero(newDate.getFullYear());
    var month = this.addZero(newDate.getMonth() + 1);
    var date = this.addZero(newDate.getDate());
    var day = newDate.getDay();

    switch (day) {
      case 0:
        day = "일";
        break;
      case 1:
        day = "월";
        break;
      case 2:
        day = "화";
        break;
      case 3:
        day = "수";
        break;
      case 4:
        day = "목";
        break;
      case 5:
        day = "금";
        break;
      default:
        day = "토";
        break;
    }

    var hour = newDate.getHours();
    var ampm;
    if (hour < 12) {
      ampm = "오전";
    } else {
      ampm = "오후";

      hour = hour - 12;
    }
    hour = this.addZero(hour);
    var minute = this.addZero(newDate.getMinutes());

    return year + "년 " + month + "월 " + date + "일(" + day + ")" + ampm + " " + hour + "시 " + minute + "분";
  }

  parseDateForServer(newDate){
    
    var year = this.addZero(newDate.getFullYear());
    var month = this.addZero(newDate.getMonth() + 1);
    var date = this.addZero(newDate.getDate());
    var day = newDate.getDay();
    var hour = newDate.getHours();
    hour = this.addZero(hour);
    var minute = this.addZero(newDate.getMinutes());

    // YYYY-MM-DD HH:MM:00 (seconds are fixed to '00')
    var startTimeForServer = year+"-"+month+"-"+date+" "+hour+":"+minute+":00";
    return startTimeForServer;
  }

  addZero(num) {
    if (num < 10) {
      return "0" + num;
    } else {
      return num;
    }
  }

  async sendRequestToServer() {

    // send request to the web server
    const url = 'http://saevom06.cafe24.com/requestdata/newRegister';

    let data = {
      id: this.state.categoryId,
      name: global.googleUserName,
      email: global.googleUserEmail,
      startTime: this.state.startTime,
      endTime: this.state.endTime,
      title: this.title,
      memo: this.memo,
    }

    // data validation check
    if (this.title == undefined) this.title = "제목이 입력되지 않았습니다."
    if (this.memo == undefined) this.memo = "메모가 입력되지 않았습니다."
    if (this.state.startTimeDataForServer == undefined) { data['startTime']='0000-00-00 00:00:00'; }
    if (this.state.endTimeDataForServer == undefined) { data['endTime']='0000-00-00 00:00:00';} 

    return await fetch(url, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data),
      }).then(()=>{
        Alert.alert("등록 완료","새로운 봉사활동 요청이 등록 되었습니다!");
      });
  }

  createTwoButtonAlert = () => {
    Alert.alert(
      "새로운 봉사활동을 요청합니다.",
      "정말 요청하시겠습니까?",
      [
        {
          text: "확인", onPress: () => {
            const result = this.sendRequestToServer();
            if (result == 1){
              Alert.alert("새로운 봉사활동 요청이 등록되었습니다!");
            }
          }
        },
        {
          text: "취소",
          onPress: () => console.log("Cancel Pressed"),
          style: "cancel"
        },
      ],
      { cancelable: false }
    );
  }
  state = {
    index: '1',
  };

  fetchPost(url, data) {
    try {
      fetch(url, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json'
        },
        //credentials: 'include',
  
        body: JSON.stringify(data),
      });
      console.log(url);
      console.warn('fetch successful', url);
    } catch (e) {
      console.warn('fetch failed', e, url);
    }
  };

  showDatePicker = () => {
    this.setState({ isDatePickerVisible: true });
  };

  hideDatePicker = () => {
    this.setState({ isDatePickerVisible: false });
  };

  handleConfirm = (date) => {
    if (this.state.isStartTime == true) {
      this.setState({ startTime: this.parseDate(date), startTimeDataForServer: this.parseDateForServer(date) });

      if (this.state.startTime > this.state.endTime) {
        this.setState({ endTime: this.state.startTime, endTimeDataForServer:this.state.startTimeDataForServer });
      }
    } else {
      this.setState({ endTime: this.parseDate(date), endTimeDataForServer: this.parseDateForServer(date) });

      if (this.state.startTime > this.state.endTime) {
        this.setState({ startTime: this.state.endTime, startTimeDataForServer: this.state.endTimeDataForServer });
      }
    }
    this.hideDatePicker();
  };

  render() {
    return (
      <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
        <View>
          <DateTimePickerModal
            isVisible={this.state.isDatePickerVisible}
            mode="datetime"
            display="spinner"
            onConfirm={this.handleConfirm}
            onCancel={this.hideDatePicker}
          />
        </View>

        <View style={styles.box}>
          <View style={styles.list}>
            <View>
              <Text style={styles.title}>제목</Text>
            </View>
            <Input
              name='title'
              placeholder='제목을 입력하세요'
              onChangeText={(input) => { this.title = input; }}
            />
          </View>
          <View style={styles.list}>
            <Text style={styles.title}>카테고리</Text>

            <Text style={styles.text} name='category'>
              {this.state.categoryName}
            </Text>
          </View>
          <View style={styles.list}>
            <Text style={styles.title}>활동시간</Text>
            <View style={styles.time}>
              <TouchableOpacity
                onPress={() => { this.setState({ isStartTime: true, isDatePickerVisible: true }) }
                }>
                <Text style={styles.timeText}>시작시간 선택</Text>
              </TouchableOpacity>
              <View style={styles.timeList}>
                <Text style={styles.date}>{this.state.startTime.substring(0, 16)}</Text>
                <Text style={styles.date}>{this.state.startTime.substring(16, 26)}</Text>
              </View>
            </View>
            <View style={styles.time}>
              <TouchableOpacity
                onPress={() => { this.setState({ isStartTime: false, isDatePickerVisible: true }) }
                }>
                <Text style={styles.timeText}>종료시간 선택</Text>
              </TouchableOpacity>
              <View style={styles.timeList}>
                <Text style={styles.date}>{this.state.endTime.substring(0, 16)}</Text>
                <Text style={styles.date}>{this.state.endTime.substring(16, 26)}</Text>
              </View>
            </View>
          </View>
          <View style={styles.list}>
            <Text style={styles.title}>지원자</Text>
            <Text style={styles.text}>
              {global.googleUserName}
            </Text>
          </View>

          <View style={styles.list}>
            <View>
              <Text style={styles.title}>메모</Text>
            </View>
            <Input
              name='memo'
              placeholder='메모를 입력하세요'
              onChangeText={(input) => { this.memo = input; }}
            />
          </View>

        </View>
        <TouchableOpacity onPress={() => this.createTwoButtonAlert()}>
          <Text style={styles.button}>
            등록하기
          </Text>
        </TouchableOpacity>
      </ScrollView>
    );
  }
  
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#DDD',
  },
  contentContainer: {
    paddingTop: 25,
    padding: 5,
  },
  box: {
    flex: 1,
    padding: 20,
    paddingTop: 30,
    paddingBottom: 30,
    backgroundColor: '#FFF',
    marginBottom: 25,
    marginLeft: 8,
    marginRight: 8,
    borderRadius: 25,
    elevation: 2,
  },
  list: {
    marginTop: 10,
    marginBottom: 10,
  },
  title: {
    flex: 1,
    flexDirection: 'row',
    padding: 3,
    fontSize: 20,
    fontWeight: 'bold',
  },
  text: {
    flex: 1,
    padding: 5,
    paddingLeft: 10,
    fontSize: 15,
    textAlignVertical: 'center',
  },
  time: {
    flex: 1,
    flexDirection: 'row',
    marginBottom: 5,
  },
  timeList: {
    padding: 5,
  },
  timeText: {
    flex: 1,
    paddingLeft: 5,
    paddingRight: 5,
    fontSize: 15,
    textAlignVertical: 'center',
    borderRadius: 50,
    color: '#FFF',
    backgroundColor: 'rgb(29,140,121)',
  },
  date: {
    flex: 1,
    paddingLeft: 5,
    fontSize: 15,
    textAlign: 'left',
  },
  button: {
    textAlign: 'center',
    marginLeft: 35,
    marginRight: 35,
    fontSize: 22,
    color: '#FFF',
    backgroundColor: 'rgb(29,140,121)',
    borderRadius: 50,
    padding: 8,
  }
});