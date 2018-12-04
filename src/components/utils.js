import React, { Component } from "react";
import { ToastAndroid, Platform, PermissionsAndroid, Text } from "react-native";

export function showToast(message) {
  ToastAndroid.show(message, ToastAndroid.SHORT);
}
export function Br(props) {
  return <Text>{"\n"}</Text>;
}

export const checkPerm = async () => {
  if (Platform.OS === "android" && Platform.Version >= 23) {
    let result = await PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION);

    if (result) {
      //   showToast("Permission is OK. ");
      // this.retrieveConnected();
    } else {
      PermissionsAndroid.requestPermission(PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION).then(result => {
        if (result) {
          showToast("User accept");
        } else {
          showToast("User refuse");
        }
      });
    }
    // debugger;
  }
};
