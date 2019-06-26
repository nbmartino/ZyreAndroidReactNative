/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow
 */




//import { ZeroMQ } from 'react-native-zeromq';
import React, { Component } from 'react';
import { Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { NativeModules } from 'react-native';
import { DeviceEventEmitter } from 'react-native';
import { isTSEnumMember } from '@babel/types';


//import console = require('console');

//module.exports = NativeModules.P2PModule;
P2PModule = NativeModules.P2PModule;

const instructions = Platform.select({
  ios: 'Press Cmd+R to reload,\n' + 'Cmd+D or shake for dev menu',
  android:
    'Double tap R on your keyboard to reload,\n' +
    'Shake or press menu button for dev menu',
});


class P2P {
  constructor() {
    this.P2PModule = NativeModules.P2PModule;
    this.MessageList = { messages: [] };
    this.MessageCounter = 0;
    this.localUUID = '123';
  }

  WaitForReply = (MsgID, Timeout, MaxTries) => {
    var localTries = 0;
    do {

      //JSONObject getObject =  this.MessageList.getJSONObject("messages");
      //JSONArray getArray = getObject.getJSONArray("JArray1");
      //setTimeout(function(){ }, Timeout); 
      localTries += 1;
      let msg = 'a';
      this.P2PModule.receiveMessage((err) => { console.log(err) }, (msg) => {
        console.log('this.P2PModule.receiveMessage = ' + msg);

      });

      console.log('WaitForReply : msgStr = ' + msg);

      var MsgObj = JSON.parse('{"msg_type":"exec","params":{"command":"mobile_search","keyword":"derrol","peers":["WIN10-240"]},"senderUUID":"F315AD3280266D13DD11F204A180C9D6","msg_id":"1"}');

      if (MsgObj == null) {
        console.log('WaitForReply : MsgObj == null');
        continue;
      }

      if (MsgObj["msg_id"] == MsgID) {
        console.log('WaitForReply : MsgObj["msg_id"] == MsgID');
        return msg_obj;
      }
      /*
            for(var i = 0; i < this.MessageList["messages"].length; i++)
            {
                var msg_obj =  this.MessageList["messages"](i);
                if(msg_obj["msg_id"] == MsgID){
      
                  return msg_obj;
                }
            }
      */

    } while (localTries < MaxTries);
    console.log('WaitForReply : return null');
    return null;

  }

  handleMsg = (msg) => {
    this.localUUID = msg;
    console.log('handleMsg: this.localUUID = ', this.localUUID);
  }

  Search = (MsgObj) => {

    //acquire this peer's UUID
    //this.P2PModule.getLocalUUID((err) => { console.log(err) }, (msg) => { console.log(msg); global.local_uuid = msg; });

    //MsgObj['senderUUID'] = global.local_uuid;

    this.P2PModule.getLocalUUID((err) => { console.log(err) }, this.handleMsg);

    MsgObj['senderUUID'] = this.localUUID;

    this.MessageCounter += 1;
    MsgObj['msg_id'] = this.MessageCounter;

    this.P2PModule.search(JSON.stringify(MsgObj), (err) => { console.log(err) }, (msg) => { /*this.setState({myText: msg})}*/console.log(msg) });
    //return this.WaitForReply(msgID,1000,3);
  }

}

let mP2P = new P2P();



type Props = {};

export default class App extends Component<Props> {

  constructor() {

    super()


    this.state = {
      myText: 'My Original Text',
    }

    this.MessageList = JSON.parse('{ "messages": [] }');
    this.MessageCounter = 0;
    this.localUUID = '123';
    this.PeerList = JSON.parse('{ "peers": [] }');
  }

  updateText = () => {
    this.setState({ myText: this.setState.myText })
  }

  checkMessages = () => {

    var msgs = this.WaitForReply(this.MessageCounter,2000,3);
    console.log('checkMessages: iterating response objects -> count: ' + msgs.length.toString(10));
    for (var i = 0; i < msgs.length; i++) {
      var item = msgs[i];
      console.log('item.msg_id : ' + item["msg_id"]);
      console.log('item.searchResult : ' + JSON.stringify(item["searchResult"]));
    }
  }

  delayMethod = () => {
    console.log('2 seconds delay...');
  }


  fetchMessage = (MsgID) => {
    var msgs = [];
    console.log('fetchMessage: MsgID = ' + MsgID.toString(16));
    //iterate through the message list populated by the event emitter

    //setTimeout(this.delayMethod, 5000);

    for (var i = 0; i < this.MessageList.messages.length; i++) {
      console.log('fetchMessage: i = ' + i.toString(10));
      var msg = this.MessageList.messages[i];
      console.log('messages[i] = ' + JSON.stringify(msg));

      if (msg['msg_id'].toString(16) ===  MsgID.toString(16)) {
        console.log("msg['msg_id'] equals MsgID");
        msgs.push(msg);
        console.log("fetchMessage: msgs.length = " + msgs.length.toString(10));
      }
      else{

        console.log("msg['msg_id'] !== MsgID");
        console.log("msg['msg_id'] === " + msg['msg_id'] );

      }
    }

    return msgs;
  }


  WaitForReply = (MsgID, Timeout, MaxTries) => {
    var localTries = 0;
  let retOutMsgs = []
    var complete = false;
    try {
      // try to wait for replies from peers to which a search message is sent

      do {

        localTries += 1;

        console.log('before fetchMessage...');

        retOutMsgs = this.fetchMessage(MsgID);

        if (retOutMsgs.length > 0) {

          console.log('msgs.length: ' + retOutMsgs.length);
          console.log('this.PeerList.peers.length: ' + this.PeerList.peers.length);
          if (retOutMsgs.length === this.PeerList.peers.length) {
            console.log('WaitForReply : message count == peer list count');
            complete = true;
          }
        }
        else {
          console.log('msgs.length is less than 0 ');
          // continue to try to wait for messages until MaxTries
        }
        /*
             
        */

      } while ((localTries < MaxTries) && !complete);
    } catch (error) {
      console.error(error);
    }
    console.log('WaitForReply : tried out');
    return retOutMsgs;

  }

  handleMsg = (msg) => {
    this.localUUID = msg;
    console.log('handleMsg: this.localUUID = ', this.localUUID);
  }

  searchFromJava = async () => {
    try {
      // create the message object, replace the 'keyword' member for different search term
      model = { msg_type: "exec", params: { command: "mobile_search", keyword: "derrol", peers: ["WIN10-240"] }, senderUUID: "", msg_id: "" };

      P2PModule.getLocalUUID((err) => { console.log(err) }, this.handleMsg);
      model['senderUUID'] = this.localUUID;

      this.MessageCounter += 1;
      model['msg_id'] = this.MessageCounter.toString(16);

      P2PModule.search(JSON.stringify(model), (err) => { console.log(err) }, (msg) => { /*this.setState({myText: msg})}*/console.log(msg) });
      /*resp_objects = await this.WaitForReply(model['msg_id'], 1000, 3);


      console.log('searchFromJava: iterating response objects -> count: ' + resp_objects.length);
      for (var i = 0; i < resp_objects.length; i++) {
        var item = resp_objects[i];
        console.log('item.msg_id : ' + item["msg_id"]);
        console.log('item.searchString : ' + JSON.stringify(item["searchString"]));
      }
      */

    } catch (error) {
      console.error(error);
    }


  }


  componentDidMount() {

    this.subscription = DeviceEventEmitter.addListener('zyreReceivedMessage', (e) => {
      console.log('zyreReceivedMessage', e);

      model = JSON.parse(e['message_body']);
      console.log('msg_type', model['msg_type']);
      if (model['msg_type'] === 'result') {
        if (model['command'] === 'mobile_search') {
          this.MessageList.messages.push(model);
          console.log('msg_id', model['msg_id']);
          console.log('searchResult', model['searchResult']);
        }
      }
      else if (model['msg_type'] === 'event') {
        if (model['command'] === 'peer_info') {
          var peer = {};
          peer['name'] = model['name'];
          peer['uuid'] = model['uuid'];
          this.PeerList.peers.push(peer);
          console.log('peer count: ' + this.PeerList.peers.length.toString(10));

          console.log('peer name', model['name']);
          console.log('peer uuid', model['uuid']);
        }
      }
    });

    (function () {

    })();
  }

  componentWillUnmount() {
    // When you want to stop listening to new events, simply call .remove() on the subscription
    this.subscription.remove();
  }



  render() {

    {

    }
    return (
      <View style={styles.container}>
        <TouchableOpacity onPress={this.searchFromJava}>
          <Text>1. Send a search query</Text>
        </TouchableOpacity>
        <Text onPress={this.checkMessages}>
         2. Check reply messages
        </Text>
        <Text style={styles.welcome}>Hello World!</Text>
        <Text style={styles.instructions}>To get started, edit App.js</Text>
        <Text style={styles.instructions}>{instructions}</Text>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5FCFF',
  },
  welcome: {
    fontSize: 20,
    textAlign: 'center',
    margin: 10,
  },
  instructions: {
    textAlign: 'center',
    color: '#333333',
    marginBottom: 5,
  },
});
