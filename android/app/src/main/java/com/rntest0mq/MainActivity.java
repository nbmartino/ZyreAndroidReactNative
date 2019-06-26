package com.rntest0mq;

import android.content.ComponentName;
import android.content.Context;
import android.content.Intent;
import android.content.ServiceConnection;
import android.os.Bundle;
import android.os.IBinder;
import android.util.Log;
import android.view.View;
import com.facebook.react.ReactActivity;
import org.zeromq.czmq.Zmsg;
import org.zeromq.zyre.Zyre;
import org.zeromq.zyre.ZyreEvent;
import android.widget.Toast;

import com.rntest0mq.ZyreService.LocalBinder;


public class MainActivity extends ReactActivity {

    /**
     * Returns the name of the main component registered from JavaScript.
     * This is used to schedule rendering of the component.
     */
    boolean mBounded;
    ZyreService mZyreService;


    @Override
    protected String getMainComponentName() {
        return "RNTest0MQ";
    }

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        startService(new Intent(this, ZyreService.class));
    }

    @Override
    protected void onDestroy() {
        stopService(new Intent(this, ZyreService.class));
        super.onDestroy();

    }

    protected void onStart() {
        super.onStart();

        Intent mIntent = new Intent(this, ZyreService.class);
        bindService(mIntent, mConnection, Context.BIND_AUTO_CREATE);
    };

    ServiceConnection mConnection = new ServiceConnection() {
        @Override
        public void onServiceDisconnected(ComponentName name) {
            Toast.makeText(MainActivity.this, "Service is disconnected", 1000).show();
            mBounded = false;
            mZyreService = null;
        }

        @Override
        public void onServiceConnected(ComponentName name, IBinder service) {
            Toast.makeText(MainActivity.this, "Service is connected", 1000).show();
            mBounded = true;
            LocalBinder mLocalBinder = (LocalBinder)service;
            mZyreService = mLocalBinder.getService();
        }
    };

    public boolean SendP2PMsg(String msg){
        if(mZyreService == null)
            return false;
        Log.i("SendP2pMsg", msg);
        mZyreService.SendP2PMsg(msg);
        return true;
    }

    @Override
    protected void onStop() {
        super.onStop();
        if(mBounded) {
            unbindService(mConnection);
            mBounded = false;
        }
    };

}
