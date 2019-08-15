/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

#import <UIKit/UIKit.h>

#import "AppDelegate.h"
#import "P2PModule.h"

int main(int argc, char * argv[]) {
  
  P2PModule *p2p_module = [[P2PModule alloc] init];
  [p2p_module setupZyre]; // call setup function
  
  @autoreleasepool {
    
   
    return UIApplicationMain(argc, argv, nil, NSStringFromClass([AppDelegate class]));
  }
}
