package com.rntest0mq;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.content.IntentFilter;
import android.os.Bundle;
import android.os.Message;
import android.provider.SyncStateContract;
import android.support.annotation.Nullable;
import android.util.Log;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.Callback;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.modules.core.DeviceEventManagerModule;
import com.facebook.react.uimanager.IllegalViewOperationException;

import static com.facebook.react.bridge.UiThreadUtil.runOnUiThread;

public class P2PModule extends ReactContextBaseJavaModule {

    public P2PModule(ReactApplicationContext reactContext) {
        super(reactContext); //required by React Native

        reactContext.registerReceiver(messageReceiver, new IntentFilter(ZyreService.RECV_MESSAGE));

    }

    @Override
    //getName is required to define the name of the module represented in JavaScript
    public String getName() {
        return "P2PModule";
    }


    private BroadcastReceiver messageReceiver = new BroadcastReceiver() {
        @Override
        public void onReceive(Context context, Intent intent) {
            Bundle bundle = intent.getExtras();
            if (bundle != null) {
                String message_kind = bundle.getString(ZyreService.MESSAGE_KIND);
                String message_sender = bundle.getString(ZyreService.MESSAGE_SENDER);
                String message_body = bundle.getString(ZyreService.MESSAGE_BODY);
                receiveMessage(message_kind, message_sender, message_body);
            }
        }
    };

    public void receiveMessage(String message_kind, String message_sender, String message_body) {
        Log.i("P2PMod.receiveMessage", message_kind + " from " + message_sender + ": " + message_body);
        //Message message = new Message();
        //message. .created_at = SyncStateContract.Helpers.getTimestamp();
        //message.kind = message_kind;
        //message.body = message_body;
        //message.sender = message_sender;
        //listAdapter.addMessage(message);
        //updateMessages();
        WritableMap params = Arguments.createMap();
        params.putString("message_kind", message_kind);
        params.putString("message_sender", message_sender);
        params.putString("message_body", message_body);
        sendEvent(getReactApplicationContext(), "zyreReceivedMessage", params);
    }
    private void sendEvent(ReactContext reactContext,
                           String eventName,
                           @Nullable WritableMap params) {
        reactContext
                .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
                .emit(eventName, params);
    }
    public void updateMessages() {
       /* runOnUiThread(new Runnable() {
            public void run() {
                listAdapter.notifyDataSetChanged();
            }
        });*/
    }

    @ReactMethod
    public void search(String param, Callback errorCallback, Callback successCallback) {
        try {
            Log.i("search", param);
            ((MainActivity)getCurrentActivity()).SendP2PMsg(param);
            successCallback.invoke("Callback : search " + param);
        } catch (IllegalViewOperationException e) {
            errorCallback.invoke(e.getMessage());
        }
    }
    @ReactMethod
    public void sendUnicast(String peerUUID, String message, Callback errorCallback, Callback successCallback) {
        try {
            Log.i("sendUnicast", peerUUID);
            ((MainActivity)getCurrentActivity()).SendP2PMsg(message);
            successCallback.invoke("Callback : Greetings from Java");
        } catch (IllegalViewOperationException e) {
            errorCallback.invoke(e.getMessage());
        }
    }

    @ReactMethod
    public void sendMulticast(String message, Callback errorCallback, Callback successCallback) {
        try {
            Log.i("sendMulticast", message);
            ((MainActivity)getCurrentActivity()).SendP2PMsg(message);
            successCallback.invoke("Callback : Greetings from Java");
        } catch (IllegalViewOperationException e) {
            errorCallback.invoke(e.getMessage());
        }
    }

    @ReactMethod
    public void getLocalUUID(Callback errorCallback, Callback successCallback) {
        try {

            String msg = ((MainActivity)getCurrentActivity()).mZyreService.getLocalUUID();
            Log.i("P2PModule->getLocalUUID",msg);
            successCallback.invoke(msg);
        } catch (IllegalViewOperationException e) {
            errorCallback.invoke(e.getMessage());
        }
    }

    private static final String E_UUID_ERROR = "E_UUID_ERROR";
    @ReactMethod
    public void promisedUUID(Promise promise) {
        try {
            String msg = ((MainActivity)getCurrentActivity()).mZyreService.getLocalUUID();
            Log.i("P2PModule->promisedUUID",msg);
            WritableMap map = Arguments.createMap();
            map.putString("localUUID", msg );
            promise.resolve(map);
        } catch (IllegalViewOperationException e) {
            promise.reject(E_UUID_ERROR, e);
        }
    }
    @ReactMethod
    public void promisedPeers(Promise promise) {
        try {
            String msg = ((MainActivity)getCurrentActivity()).mZyreService.getPeers();
            Log.i("P2PModule->promisedUUID",msg);
            WritableMap map = Arguments.createMap();
            map.putString("peerList", msg );
            promise.resolve(map);
        } catch (IllegalViewOperationException e) {
            promise.reject(E_UUID_ERROR, e);
        }
    }

}
