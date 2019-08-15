//
//  P2PModule.h
//  RNTest0MQ
//
//  Created by Vm Macintosh on 08/08/2019.
//  Copyright © 2019 Facebook. All rights reserved.
//

#ifndef P2PModule_h
#define P2PModule_h

#import <React/RCTBridgeModule.h>
#import <React/RCTEventEmitter.h>
#import <React/RCTBridge.h>
#import "zyre.h"

@interface P2PModule : RCTEventEmitter <RCTBridgeModule> //NSObject <RCTBridgeModule>

-(void)setupZyre;
-(void)fetchMessages;

@end




#endif /* P2PModule_h */
