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
import { NativeEventEmitter, NativeModules } from 'react-native';
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
        this.PeerList = { peers: [] }
        this.MessageCounter = 0;
        this.localUUID = '123';
        
        
        
    }
    
    sleep = (time) => {
        return new Promise((resolve) => setTimeout(resolve, time));
    }
    
    delayFunction = async () => {
        await this.sleep(4000);
        return 1;
    }
    
    fetchReplies = (MsgID, Timeout, MaxTries) => {
        var localTries = 0;
        var replies = { messages: [] };
        console.log('fetchReplies : MsgID == ' + MsgID);
        //do {
        
        //JSONObject getObject =  this.MessageList.getJSONObject("messages");
        //JSONArray getArray = getObject.getJSONArray("JArray1");
        //setTimeout(function () { }, Timeout);
        
        localTries += 1;
        
        for (var i = 0; i < this.MessageList.messages.length; i++) {
            var msg_obj = this.MessageList.messages[i];
            console.log('fetchReplies : msg_obj["msg_id"] == ' + msg_obj["msg_id"]);
            
             console.log('fetchReplies : stringified == ' + JSON.stringify(msg_obj["msg_id"]));
            
            if (JSON.stringify(msg_obj["msg_id"]) == MsgID ) {
                console.log('equal1');
                console.log('fetchReplies : JSON.stringify(msg_obj) == ' + JSON.stringify(msg_obj));
                
                
                 replies.messages.push( JSON.parse(JSON.stringify(msg_obj['searchResult']) ));
                
            }
            
            
            if (msg_obj["msg_id"] == MsgID ) {
                console.log('equal2');
            }
            
            if (parseInt(JSON.stringify(msg_obj["msg_id"]), 16) === parseInt(MsgID, 16)) {
                console.log('fetchReplies() msg_obj == ' + JSON.stringify(msg_obj));
                //replies.messages.push(b);
                //return msg_obj;
            }
        }
        
        
        // } while (localTries < MaxTries);
         console.log("fetchReplies(): JSON.stringify(replies)) ==" + JSON.stringify(replies));
        return JSON.stringify(replies);
        
    }
    
    
    handleMsg = (msg) => {
        this.localUUID = msg;
        console.log('handleMsg: this.localUUID = ', this.localUUID);
    }
    
    RetrieveLocalUUID = async () => {
        try {
            var events = await P2PModule.promisedLocalUUID();
            console.log('from retrieveLocalUUID: ' + JSON.stringify(events));
            this.localUUID = events[0];
            
        } catch (e) {
            console.error(e);
        }
    }
    
    Search = async (MsgObj) => {
        
        this.MessageList.messages = [];
        
        //acquire this peer's UUID
        this.RetrieveLocalUUID();
        
        MsgObj['senderUUID'] = this.localUUID;
        
        this.MessageCounter += 1;
        
        MsgObj['msg_id'] = this.MessageCounter.toString(16);
        
        this.P2PModule.send(JSON.stringify(MsgObj));
        //this.P2PModule.search(JSON.stringify(MsgObj), (err) => { console.log(err) }, (msg) => { /*this.setState({myText: msg})}*/console.log(msg) });
        
        await this.delayFunction();
        
        if (Platform.OS === 'ios') {
            this.P2PModule.fetchMessagesEmitted('');
        }
        
        await this.delayFunction();
        
        return this.fetchReplies(JSON.stringify(MsgObj['msg_id']), 1000, 3);
    }
    
}

let mP2P = new P2P();



type Props = {};

export default class App extends Component<Props> {
    
    constructor() {
        
        super()
        
        this.MessageList = { messages: [] };
        this.PeerList = { peers: [] };
        this.state = {
        myText: 'My Original Text',
        }
        
        this.MessageCounter = 0;
        this.localUUID = '';
    }
    
    updateText = () => {
        this.setState({ myText: this.setState.myText })
    }

    checkMessages = () =>{
        
        console.log('checkMessages()');
    }
   

    receiveMessage = (e) => {
        console.log('zyreReceivedMessage', e);
        
        try {
            model = JSON.parse(e['message_body']);
        } catch (e) {
            console.log('receiveMessage: JSON.parse() error - ' + e);
            return;
        }
        console.log('msg_type', model['msg_type']);
        if (model['msg_type'] === 'result') {
            if (model['command'] === 'mobile_search') {
                mP2P.MessageList.messages.push(model);
                console.log('messages count: ' + mP2P.MessageList.messages.length.toString(10)); console.log('msg_id', model['msg_id']);
                console.log('searchResult', model['searchResult']);
            }
        }
        else if (model['msg_type'] === 'event') {
            if (model['command'] === 'peer_info') {
                var peer = {};
                peer['name'] = model['peer_name'];
                peer['uuid'] = model['peer_uuid'];
                mP2P.PeerList.peers.push(peer);
                console.log('peer count: ' + mP2P.PeerList.peers.length.toString(10));
                
                console.log('peer name', model['peer_name']);
                console.log('peer uuid', model['peer_uuid']);
            }
        }
    }
    
    componentDidMount() {
        
        
        
        if (Platform.OS == 'android') {
            this.subscription = DeviceEventEmitter.addListener('zyreReceivedMessage', this.receiveMessage);
            
        }
        else if (Platform.OS === 'ios') {
            const zyreMsgEmitter = new NativeEventEmitter(NativeModules.P2PModule);
            this._subscription = zyreMsgEmitter.addListener('zyreReceivedMessage', this.receiveMessage);
        }
        (function () {
         
         })();
    }
    
    componentWillUnmount() {
        // When you want to stop listening to new events, simply call .remove() on the subscription
        this.subscription.remove();
    }
    
    
    
    sendSearchQuery = () => {
        
        // create the message object, replace the 'keyword' member for different search term
        model = { msg_type: "exec", params: { command: "mobile_search", keyword: "derrol", peers: ["WIN10-240"] }, senderUUID: "", msg_id: "" };
        
         let response = mP2P.Search(model);
        console.log("sendSearchQuery(): response object = " + response.toString());
        
    }
    
    
    render() {
        
        {
            
        }
        return (
                <View style={styles.container}>
                <TouchableOpacity onPress={this.sendSearchQuery}>
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
