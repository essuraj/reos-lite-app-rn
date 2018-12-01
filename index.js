/** @format */

import React, { Component } from "react";
import { AppRegistry } from "react-native";
import App from "./App";
import { name as appName } from "./app.json";
import { Provider as PaperProvider } from "react-native-paper";
import HomeScreen from "./src/screens/HomeScreen";
const Main = () => (
  <PaperProvider>
    <HomeScreen />
  </PaperProvider>
);
AppRegistry.registerComponent(appName, () => Main);
