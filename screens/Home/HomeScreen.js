import * as React from 'react';
import { StyleSheet, Text, TouchableOpacity, View, ImageBackground, Alert } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import Dialog from "react-native-dialog";
import { ListItem } from 'react-native-elements';

export default class HomeScreen extends React.Component {
  state = {
    allNotices: [],
    allActivities: [],
    allUserActivities: [],
    loadNotices: false,
    loadActivities: false,
    loadUserActivities: false,

    // for dialog
    dialogVisible: false,
    isDatePickerVisible: false, // date picker in dialog
    finalConfirmDialog: false,
    postType: 1,

    // additional data to send to the web server
    userSelectedActivity: {},
    userSelectedInterestCategory: {},
    userSelectedNotice: {},
    serverUrl: '',
    type: 0,
  };

  constructor(props) {
    super(props);
    console.log('Home Screen');
    this.userType = 1;

    this.status = [
      '매칭 전',
      '매칭 중',
      '매칭 완료',
      '활동 진행중',
      '활동 종료',
      '활동 취소'
    ];

    this.getData('Notice');
    this.getData('Activity');
    this.getData('User');
  }

  componentDidUpdate() {
    if (this.props.route.params?.set) {
      if (this.props.route.params.set) {
        console.log("Get new data");
        this.props.route.params.set = false;
        this.getData('Notice');
        this.getData('Activity');
        this.getData('User');
      }
    }
  }

  getData(type) {
    let url;
    if (type == 'Notice') {
      url = "http://saevom06.cafe24.com/noticedata/getTop5Notices"
    } else if (type == 'Activity') {
      url = "http://saevom06.cafe24.com/activitydata/getTop5Activities"
    } else {
      url = "http://saevom06.cafe24.com/activitydata/getTop5ActivitiesForUser?name=" + global.googleUserName + "&email=" + global.googleUserEmail;
    }

    try {
      fetch(url, {
        method: 'GET',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json'
        },
      }).then((response) => response.json())
        .then((responseInJson) => {
          if (type == 'Notice') {
            console.log("Get notice data");
          } else if (type == 'Activity') {
            console.log("Get activity data");
          } else {
            console.log("Get user activity data");
          }
          for (var i = 0; i < responseInJson.length; i++) {
            if (type == 'Notice') {
              responseInJson[i].modDate = this.parseDate(responseInJson[i].modDate);
              responseInJson[i].regDate = this.parseDate(responseInJson[i].regDate);
            } else {
              if (responseInJson[i].deadline.charAt(4) != '년') {
                if (responseInJson[i].deadline == null) {
                  if (responseInJson[i].startTime == null) {
                    responseInJson[i].deadline = '없음';
                  } else {
                    responseInJson[i].deadline = responseInJson[i].startTime;
                  }
                }

                if (responseInJson[i].deadline != '없음') {
                  responseInJson[i].deadline = this.parseDate(responseInJson[i].deadline);
                }

                responseInJson[i].startTime = this.parseDate(responseInJson[i].startTime);
                responseInJson[i].endTime = this.parseDate(responseInJson[i].endTime);
              }
            }
          }
          if (type == 'Notice') {
            this.setState({ allNotices: responseInJson }); // assign data to state variable
          } else if (type == 'Activity') {
            this.setState({ allActivities: responseInJson }); // assign data to state variable
          } else {
            this.setState({ allUserActivities: responseInJson }); // assign data to state variable
          }
          if (type == 'Notice') {
            if (this.state.allNotices.length > 0)
              this.setState({ loadNotices: true })
          } else if (type == 'Activity') {
            console.log(this.state.allActivities.length)
            if (this.state.allActivities.length > 0)
              this.setState({ loadActivities: true })
          } else {
            if (this.state.allUserActivities.length > 0)
              this.setState({ loadUserActivities: true })
          }
        })
    } catch (e) {
      console.log(e);
    }
  }

  fetchPost(url, data) {
    console.log(data);
    try {
      fetch(url, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json'
        },
        //credentials: 'include',

        body: JSON.stringify(data),
      }).then((res) => {
        Alert.alert("신청 되었습니다");
        this.setState({ dialogVisible: false });
      });
    } catch (e) {
      console.warn('fetch failed', e, url);
    }
  }

  parseDate(date) {
    var splitDash = date.split('-');

    var year = splitDash[0] + '/';
    var month = splitDash[1] + '/';

    var splitT = splitDash[2].split('T');

    var day = splitT[0] + ' ';

    var splitColon = splitT[1].split(':');
    var hour = splitColon[0] + ':';
    var minute = splitColon[1];

    return year + month + day + hour + minute;
  }

  createListItem(l, i, type) {
    if (i == 0) {
      if (type == 0) {
        return (
          <ListItem
            key={i}
            title={l.title}
            titleStyle={styles.text}
            containerStyle={styles.listFirst}
            onPress={
              () => {
                this.setState({ postType: type });
                this.setState({ userSelectedNotice: l });
                this.setState({ dialogVisible: true });
              }
            }
          />
        )
      } else {
        return (
          <ListItem
            key={i}
            title={l.title}
            titleStyle={styles.text}
            containerStyle={styles.listFirst}
            onPress={
              () => {
                this.setState({ postType: type });
                this.setState({ userSelectedActivity: l });
                this.setState({ userSelectedInterestCategory: l.interestCategory });
                this.setState({ dialogVisible: true });
              }
            }
          />
        )
      }
    } else {
      if (type == 0) {
        return (
          <ListItem
            key={i}
            title={l.title}
            titleStyle={styles.text}
            containerStyle={styles.list}
            onPress={
              () => {
                this.setState({ postType: type });
                this.setState({ userSelectedNotice: l });
                this.setState({ dialogVisible: true });
              }
            }
          />
        )
      } else {
        return (
          <ListItem
            key={i}
            title={l.title}
            titleStyle={styles.text}
            containerStyle={styles.list}
            onPress={
              () => {
                this.setState({ postType: type });
                this.setState({ userSelectedActivity: l });
                this.setState({ userSelectedInterestCategory: l.interestCategory });
                this.setState({ dialogVisible: true });
              }
            }
          />
        )
      }

    }
  }

  render() {

    console.disableYellowBox = true;
    const { allNotices, allActivities, allUserActivities, loadNotices, loadActivities, loadUserActivities } = this.state;

    return (
      <View style={styles.container}>
        <ImageBackground source={require('../../assets/images/home_back_test.png')} style={styles.background}>
          <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>

            <Dialog.Container visible={this.state.dialogVisible}>
            {this.state.postType != 0 ?
              <Dialog.Title style={{ color: '#000' }} children='required'>{this.state.userSelectedActivity.title}</Dialog.Title>
              :
              <Dialog.Title style={{ color: '#000' }} children='required'>{this.state.userSelectedNotice.title}</Dialog.Title>
            }
              {this.state.postType != 0 ?
                <View>
                  <View style={{flexDirection:'row'}}>
                  
                  <View>

                  
                  <Dialog.Description>
                    <Text>
                      {this.state.userSelectedInterestCategory.name}
                    </Text>
                  </Dialog.Description>
                  </View>
                  <View>
                  <Dialog.Description>
                    <Text>
                      {this.status[this.state.userSelectedActivity.status]}
                    </Text>
                  </Dialog.Description>
                  </View>
                  </View>

                  

                  <Dialog.Description>
                    <Text>
                      시작시간 : {this.state.userSelectedActivity.startTime}
                    </Text>
                  </Dialog.Description>

                  <Dialog.Description>
                    <Text>
                      종료시간 : {this.state.userSelectedActivity.endTime}
                    </Text>
                  </Dialog.Description>

                  <Dialog.Description>
                    <Text>
                      {this.state.userSelectedActivity.place}
                    </Text>
                  </Dialog.Description>

                  <Dialog.Description>
                    <Text>
                      {this.state.userSelectedActivity.content}
                    </Text>
                  </Dialog.Description>
                </View>
                :
                <View>
                  <Dialog.Description>
                    <Text>
                      등록일 : {this.state.userSelectedNotice.modDate}
                    </Text>
                  </Dialog.Description>
                  <Dialog.Description>
                    <Text>
                      {this.state.userSelectedNotice.content}
                    </Text>
                  </Dialog.Description>
                </View>
              }
              {this.state.postType == 1 &&
                <Dialog.Button label="봉사자 지원" title="봉사자 지원" color='#000' onPress={
                  () => {
                    this.fetchPost('http://saevom06.cafe24.com/requestdata/register', {
                      id: this.state.userSelectedActivity.id, // id of the activity that user chose
                      name: global.googleUserName,//this.props.navigation.getParam('userName', 'invalid name from App: Homescreen.js [in <Dialog>]'),
                      email: global.googleUserEmail,// this.props.navigation.getParam('userEmail', 'invalid email from App: Homescreen.js [in <Dialog>]'),
                      type: this.userType,
                    });
                  }
                } />
              }
              <Dialog.Button label="취소" color='gray' onPress={() => { this.setState({ dialogVisible: false }); }} />
            </Dialog.Container>

            <View style={styles.topSpace}>
              <Text style={styles.topText}>환영합니다</Text>
              <Text style={styles.topText}>{global.googleUserName}님</Text>
            </View>

            <View style={styles.box}>
              <View style={styles.title}>
                <Text style={styles.titleText}>공지사항</Text>
                <TouchableOpacity onPress={() => this.props.navigation.navigate('Notice', { screen: '공지 목록', params: { set: true } })}>
                  <Text style={styles.titleButton}>전체보기</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.listBox}>
                {loadNotices ?
                  allNotices.map((l, i) => (
                    this.createListItem(l, i, 0)
                  ))
                  :
                  <ListItem
                    key={0}
                    title='등록된 공지사항이 없습니다'
                    titleStyle={styles.text}
                    containerStyle={styles.listFirst}
                  />
                }
              </View>
            </View>

            <View style={styles.box}>
              <View style={styles.title}>
                <Text style={styles.titleText}>최근 등록된 활동</Text>
                <TouchableOpacity onPress={() => this.props.navigation.navigate('Activity', { screen: '관심사 목록', params:{set:true, listType:1}})}>
                  <Text style={styles.titleButton}>전체보기</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.listBox}>
                {loadActivities ?
                  allActivities.map((l, i) => (
                    this.createListItem(l, i, 1)
                  ))
                  :
                  <ListItem
                    key={0}
                    title='등록된 활동이 없습니다'
                    titleStyle={styles.text}
                    containerStyle={styles.listFirst}
                  />
                }
              </View>
            </View>

            <View style={styles.box}>
              <View style={styles.title}>
                <Text style={styles.titleText}>나의 활동</Text>
                <TouchableOpacity onPress={() => this.props.navigation.navigate('Activity', { screen: '관심사 목록', params:{set:true, listType:2}})}>
                  <Text style={styles.titleButton}>전체보기</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.listBox}>
                {loadUserActivities ?
                  allUserActivities.map((l, i) => (
                    this.createListItem(l, i, 2)
                  ))
                  :
                  <ListItem
                    key={0}
                    title='등록된 활동이 없습니다'
                    titleStyle={styles.text}
                    containerStyle={styles.listFirst}
                  />
                }
              </View>
            </View>

          </ScrollView>

        </ImageBackground>
      </View>
    )
  };
}

HomeScreen.navigationOptions = {
  header: null,
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    paddingTop: 0,
    alignItems: 'stretch',
    justifyContent: 'center',
  },
  background: {
    flex: 1,
  },
  topSpace: {
    paddingTop: 20,
    marginBottom: 40,
  },
  topText: {
    color: '#FFF',
    fontSize: 30,
    padding: 5,
    paddingLeft: 20,
  },
  box: {
    flex: 1,
    padding: 18,
    backgroundColor: '#FFF',
    marginBottom: 30,
    marginLeft: 11,
    marginRight: 11,
    borderRadius: 15,
    elevation: 5,
  },
  title: {
    padding: 3,
    flexDirection: 'row',
    marginBottom: 15,
  },
  titleText: {
    flex: 1,
    alignSelf: 'flex-start',
    fontSize: 19,
    fontWeight: 'bold',
    color: 'rgb(29,140,121)',
  },
  titleButton: {
    alignSelf: 'flex-end',
    justifyContent: 'center',
    color: 'rgb(140,140,140)'
  },
  listBox: {
    padding: 3,
  },
  listFirst: {
    flex: 1,
    padding: 5,
    paddingRight: 10,
    paddingBottom: 8,
    marginTop: 3,
    flexDirection: 'row',
  },
  list: {
    flex: 1,
    padding: 5,
    paddingRight: 10,
    paddingBottom: 8,
    marginTop: 3,
    flexDirection: 'row',
    borderTopWidth: 0.5,
    borderColor: 'rgb(220,220,220)',
  },
});
