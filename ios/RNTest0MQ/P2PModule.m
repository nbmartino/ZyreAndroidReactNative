//
//  P2PModule.m
//  RNTest0MQ
//
//  Created by Vm Macintosh on 08/08/2019.
//  Copyright © 2019 Facebook. All rights reserved.
//

#import <Foundation/Foundation.h>
#import "P2PModule.h"
#import <React/RCTLog.h>
#import "zyre.h"

@implementation P2PModule{
  
  zyre_t *znode;
  
};


RCT_EXPORT_MODULE();

- (instancetype)init {
  self = [super init ];
  
  [[NSNotificationCenter defaultCenter] addObserver:self
                                           selector:@selector(applicationDidBecomeActive:)
                                              name:UIApplicationDidBecomeActiveNotification                                object:nil];
  znode = zyre_new("ZyreiOS");
  
  zyre_start(znode);
  
  zyre_join(znode,"GLOBAL");
  
  
  const char *name = zyre_uuid(znode);
  
  RCTLogInfo(@"P2PModule init: UUID ==  %s",name);
  
  
  
  return self;
}

- (void)applicationDidBecomeActive:(NSNotification *)notification
{
  NSLog(@"applicationDidBecomeActive: will fetch messages..");
  //[self fetchMessages];
  
}

- (NSArray<NSString *> *)supportedEvents
{
  return @[@"zyreReceivedMessage"];
}

-(void)setupZyre
{
  
}

-(void)fetchMessages
{
  
  if(!znode)
  {
    RCTLogError(@"znode == NULL");
    return;
  }
  
  [NSThread sleepForTimeInterval: 1.000];
  
  //[self fetchMessages];
  
  dispatch_queue_t messageQueue = dispatch_queue_create("Message Queue", NULL);
  
  
  dispatch_async(messageQueue,^{
    
    bool hasEvent = true;
    
    int tries =0;
    
    char *sMsg = "";
    
    while(hasEvent)
    {
      
      sMsg = "";
      
      [NSThread sleepForTimeInterval: 0.500];
      
      zyre_event_t *event = zyre_event_new(self->znode);
      
      if (event == NULL){
        tries += 1;
        NSLog(@"tries = %d", tries);
        hasEvent = false;
        zyre_event_destroy(&event);
        return;
      }
      
      
      
      if (streq(zyre_event_type(event), "WHISPER"))
      {
        zsys_info("[%s] received ping (WHISPER)", zyre_event_peer_name(event));
        
        zmsg_t* msg = zyre_event_msg(event);
        sMsg = zmsg_popstr(msg);
        printf("from WHISPER: msg = %s\n", sMsg);
        
        
        
      }
      else if (streq(zyre_event_type(event), "SHOUT"))
      {
        zsys_info("[%s](%s) received ping (SHOUT)",
                  zyre_event_peer_name(event), zyre_event_group(event));
        
        zmsg_t* msg = zyre_event_msg(event);
        
        sMsg =  zmsg_popstr(msg);
        
        printf("from SHOUT: msg = %s\n", sMsg);
        
        
        
      }
      else
      {
        NSLog(@"has Event - %s",zyre_event_type(event));
      }
      
      zyre_event_destroy(&event);
      
      if(strlen(sMsg) > 1 )
      {
        NSString *finMsg = [NSString stringWithUTF8String:sMsg];
        [self sendEventWithName:@"zyreReceivedMessage" body:@{@"message_body": finMsg}];        }
    }
    
    
    dispatch_async(dispatch_get_main_queue(),^{
      // Update the UI
      NSLog(@"dispatch_async(dispatch_get_main_queue()).. is invoked.");
    });
    
  });
}

+(BOOL)requiresMainQueueSetup
{
  return YES;
}

RCT_EXPORT_METHOD(fetchMessagesEmitted: (NSString *)message)
{
  RCTLogInfo(@"fetchMessagesEmitted -  %@",message);
  if(znode != NULL)
  {
    [self fetchMessages];
  }
  else
  {
    RCTLogError(@"znode == NULL");
  }
}


RCT_EXPORT_METHOD(send:(NSString *)message )
{
  RCTLogInfo(@"Sending message -  %@",message);
  const char * cString = [message cStringUsingEncoding:NSASCIIStringEncoding];
  if(znode != NULL)
  {
    zyre_shouts(znode, "GLOBAL","%s",cString);
  }
  else
  {
    RCTLogError(@"znode == NULL");
  }
}

RCT_EXPORT_METHOD(getLocalUUID:(RCTResponseSenderBlock)errCallback msgCallback :(RCTResponseSenderBlock)msgCallback )
{
  //errCallback();
  //return @"localUUID";
  
  //[msgCallback invoke[@"456"]];
}

RCT_REMAP_METHOD(promisedLocalUUID,
                 promisedLocalUUIDWithResolver:(RCTPromiseResolveBlock)resolve
                 rejecter:(RCTPromiseRejectBlock)reject)
{
  NSString *nsUUID;
  
  if(znode != NULL)
  {
    const char* uuid = zyre_uuid(znode);
    nsUUID = [NSString stringWithUTF8String: uuid];
  }
  else
  {
    RCTLogError(@"promisedLocalUUID: znode == NULL");
  }
  
  NSArray *msg = [NSArray arrayWithObjects: nsUUID, nil];
  
  if (msg) {
    resolve(msg);
  } else {
    NSError *error = [NSError errorWithDomain:@"com.scl.mobile.app.ios" code:200 userInfo:@{@"Error reason": @"cannot retrieve local UUID"}];
    reject(@"no_UUID", @"There is no UUID", error);
  }
}


- (void)zyreEventReceived:(NSNotification *)notification
{
  
  NSString *eventName = notification.userInfo[@"name"];
  [self sendEventWithName:@"EventReminder" body:@{@"name": eventName}];
  
}

@end


