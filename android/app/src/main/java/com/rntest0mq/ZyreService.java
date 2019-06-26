package com.rntest0mq;

import android.app.ActivityManager;
import android.app.Service;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.content.IntentFilter;
import android.os.Binder;
import android.os.Bundle;
import android.os.IBinder;
import android.util.Log;

import com.facebook.react.bridge.ReadableArray;

import org.zeromq.czmq.Zhash;
import org.zeromq.czmq.Zlist;
import org.zeromq.czmq.Zmsg;
import org.zeromq.zyre.Zyre;
import org.zeromq.zyre.ZyreEvent;

import java.util.List;

import static com.facebook.react.bridge.UiThreadUtil.runOnUiThread;


public class ZyreService extends Service {


    public static final String NODE_NAME = "ZyreDroid";
    public static final String NODE_GROUP = "GLOBAL";

    public static final String RECV_MESSAGE
            ="com.rntest0mq.RECV_MESSAGE";

    public static final String SEND_MESSAGE
            ="com.rntest0mq.SEND_MESSAGE";

    public static final String MESSAGE_KIND
            ="com.rntest0mq.MESSAGE_KIND";

    public static final String MESSAGE_BODY
            ="com.rntest0mq.MESSAGE_BODY";

    public static final String MESSAGE_SENDER
            ="com.rntest0mq.MESSAGE_SENDER";

    int mStartMode;       // It indicates how to behave if the service is killed
    //IBinder mBinder;      // interface for clients that bind
    boolean mAllowRebind; // It indicates whether onRebind should be used

    public Zyre znode = null;

    IBinder mBinder = new LocalBinder();

    public static boolean isRecursionEnable = true;

        void runInBackground() {
            if (!isRecursionEnable)
                // Handle not to start multiple parallel threads
                return;

            // isRecursionEnable = false; when u want to stop
            // on exception on thread make it true again
            new Thread(new Runnable() {
                @Override
                public void run() {
                    // DO your work here
                    // get the data
                    if (znode != null){

                        Zmsg message = znode.recv();
                        String message_kind = message.popstr();
                        Log.i("runInBackground", "Got a message: " + message_kind);
                        if (message_kind.equals("SHOUT") || message_kind.equals("WHISPER")) {
                            String message_sender;
                            String message_body;
                            message.popstr(); // ID String
                            message_sender = message.popstr(); // Sender
                            message_body = message.popstr(); // message
                            Log.e("message_kind",message_kind);
                            Log.e("message_sender",message_sender);
                            Log.e("message_body", message_body);

                            messageReceived(message_kind, message_sender, message_body);
                        }
                    }

                    if (isRunning(getApplicationContext())) {
                        runOnUiThread(new Runnable() {
                            @Override
                            public void run() {
                                // update UI
                                runInBackground();
                            }
                        });
                    } else {
                        runInBackground();
                    }
                }
            }).start();
        }

        public boolean isRunning(Context ctx) {
            ActivityManager activityManager = (ActivityManager) ctx.getSystemService(Context.ACTIVITY_SERVICE);
            List<ActivityManager.RunningTaskInfo> tasks = activityManager.getRunningTasks(Integer.MAX_VALUE);

            for (ActivityManager.RunningTaskInfo task : tasks) {
                if (ctx.getPackageName().equalsIgnoreCase(task.baseActivity.getPackageName()))
                    return true;
            }

            return false;
        }

    @Override
    public void onCreate() {
        // The service is being created
    }

    @Override
    public int onStartCommand(Intent intent, int flags, int startId) {
        // The service is starting, due to a call to startService()
        registerReceiver(sendMessageReceiver, new IntentFilter(ZyreService.SEND_MESSAGE));

        znode = new Zyre(NODE_NAME);
        znode.setVerbose();
        znode.start();

        znode.join("GLOBAL");

        runInBackground();

        return mStartMode;
    }
    @Override
    public IBinder onBind(Intent intent) {
        // A client is binding to the service with bindService()
        return mBinder;
    }

    @Override
    public boolean onUnbind(Intent intent) {
        // All clients have unbound with unbindService()
        return mAllowRebind;
    }
    @Override
    public void onRebind(Intent intent) {
        // A client is binding to the service with bindService(),

        // after onUnbind() has already been called
    }
    @Override
    public void onDestroy() {
        // The service is no longer used and is being destroyed
        znode.stop();
    }

    private BroadcastReceiver sendMessageReceiver = new BroadcastReceiver() {
        @Override
        public void onReceive(Context context, Intent intent) {
            Bundle bundle = intent.getExtras();
            if (bundle != null) {
                String message_kind = bundle.getString(ZyreService.MESSAGE_KIND);
                String message_body = bundle.getString(ZyreService.MESSAGE_BODY);
                dispatchSendMessage(message_kind, message_body);
            }
        }
    };

    private void dispatchSendMessage(final String message_kind, final String message_body) {
        new Thread(new Runnable() {
            @Override
            public void run() {
                sendMessage(message_kind, message_body);
            }
        }).start();
    }

    private void sendMessage(String message_kind, String message_body) {
        if (message_kind.equals("SHOUT")) {
            znode.shouts(NODE_GROUP, message_body);
        } else {
            // TODO: Send other message types
        }
    }

    // Receiving a message

    protected void messageReceived(String message_kind, String message_sender, String message_body) {
        Intent intent = new Intent(RECV_MESSAGE);
        intent.putExtra(MESSAGE_KIND, message_kind);
        intent.putExtra(MESSAGE_BODY, message_body);
        intent.putExtra(MESSAGE_SENDER, message_sender);
        sendBroadcast(intent);
    }

    public String SendP2PMsg(String msg){
        String retMsg = "";
        znode.shouts("GLOBAL", msg);
        return retMsg;
    }

    public String sendUnicast(String peerUUID,String msg){
        String retMsg = "";
        znode.whispers(peerUUID,msg);
        znode.shouts(peerUUID, msg);
        return retMsg;
    }

    public String sendMulticast(String msg){
        String retMsg = "";
        znode.shouts("GLOBAL", msg);
        return retMsg;
    }


    public String getLocalUUID(){
        String retMsg = "";
        retMsg =  znode.uuid();

        Log.e("ZyreSvc->getLocalUUID",retMsg);
        return retMsg;
    }

    public String getPeers(){
        String peerList ;
        peerList = "item1";
        //peerList.add("item-1");
        //for(znode.peers().first()))
        Long uuid;
         Zlist peers = znode.peers();


        Log.e("ZyreSvc->szPeers",Long.toString(peers.size()));
        Long item;
        int ctr = 0;
        for (item = peers.first();ctr < peers.size(); item = peers.next() ){
            Log.e("ZyreSvc->item",Long.toString(item));
            ctr++;
        }

        /*for (item = zhash_first (self->peers); item != NULL;
             item = zhash_next (self->peers))
            zyre_node_ping_peer (zhash_cursor (self->peers), item, self);*/
        /*Do{
            uuid =  znode.peers().next();
            Log.e("ZyreSvc->getPeers",Long.toString(uuid));
        }while(uuid != null);
    */
        Log.e("ZyreSvc->getPeers",peerList);
        return peerList;
    }

    public class LocalBinder extends Binder {
        public ZyreService getService() {
            return ZyreService.this;
        }
    }


}
