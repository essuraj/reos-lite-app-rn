import React, { Component } from "react";
import { StyleSheet, Text, View, AsyncStorage, ScrollView, ActivityIndicator } from "react-native";
import { Appbar, Banner, List, IconButton, Switch, Headline } from "react-native-paper";
var Buffer = require("buffer").Buffer;
import { BleManager } from "react-native-ble-plx";
import { checkPerm, showToast } from "../components/utils";

export default class App extends Component {
  constructor() {
    super();
    this.manager = new BleManager();
    this.state = {
      isLoading: false,
      scanning: false,
      isSwitchOn: true,
      connectedP: undefined,
      connectionName: "Not Connected",
      peripherals: [],
      appState: "",
      notify: false,
      message: ""
    };
  }

  scan = async () => {
    this.setState({ isLoading: true });
    await this.manager.startDeviceScan(null, null, async (error, device) => {
      if (error) {
        console.warn(error);
        return;
      }

      if (device.name === "Lite1100") {
        await AsyncStorage.setItem("last", device.id);
        this.manager.stopDeviceScan();
        this.setState({ peripherals: [device], isLoading: false });
      }
      this.setState({ isLoading: false });
    });
  };

  connectToPreviousDevice = async d => {
    let isConnected = await this.manager.isDeviceConnected(d);
    // await this.manager.cancelDeviceConnection(d);
    if (isConnected === true) {
      await this.manager.cancelDeviceConnection(d);
    }
    let device = await this.manager.connectToDevice(d);
    device = await device.discoverAllServicesAndCharacteristics();
    // debugger;
    this.connectedDevice = device;
    this.setState({ connectedP: device, connectionName: device.name, notify: true, message: "Connected to " + device.name });
    // await this.connect(devices);
  };
  componentDidMount = async () => {
    // await AsyncStorage.removeItem("last");
    let d = await AsyncStorage.getItem("last");
    // debugger;
    await checkPerm();

    const subscription = this.manager.onStateChange(async state => {
      if (state === "PoweredOn") {
        if (d) {
          await this.connectToPreviousDevice(d);
        } else {
          await this.scan();
        }
        // this.scanAndConnect();
        subscription.remove();
      }
    }, true);
  };

  write = async (peripheral, charId) => {
    let isConnected = await this.manager.isDeviceConnected(peripheral.id);
    console.info("device connected", isConnected);
    if (isConnected) {
      try {
        // debugger;
        let data = await this.connectedDevice.writeCharacteristicWithoutResponseForService(
          "0000fff0-0000-1000-8000-00805f9b34fb",
          "0000fff3-0000-1000-8000-00805f9b34fb",
          charId
        );
        // let data = await this.manager.writeCharacteristicWithResponseForDevice(peripheral.id, "0000fff0-0000-1000-8000-00805f9b34fb", "0000fff3-0000-1000-8000-00805f9b34fb", new Buffer(charId).toString("base64"));
        console.warn(data);
      } catch (error) {
        console.warn(error);
      }
    } else {
      showToast("Device isnt connected");
    }
  };
  connect = dev => {
    dev
      .connect()
      .then(device => {
        return device.discoverAllServicesAndCharacteristics();
      })
      .then(async device => {
        let x = { ...device };
        this.connectedDevice = device;
        delete x._manager;
        await AsyncStorage.setItem("last", x.id);
        this.setState({ connectedP: x, connectionName: x.name, notify: true, message: "Connected to " + x.name });
        showToast(x.name + " connected");
      })
      .catch(error => {
        if (error.reason && error.reason.includes("Already connected")) {
          this.setState({ connectedP: dev, connectionName: dev.name, notify: true, message: "Connected to " + dev.name });
          showToast(error.message);
        }
        console.warn(error);
      });
  };
  render() {
    let list = this.state.peripherals;
    return (
      <View style={styles.container}>
        <Appbar.Header>
          <Appbar.Content title={this.state.connectionName} />
          {this.state.isLoading && <ActivityIndicator />}
          <Appbar.Action icon={this.state.scanning ? "pause" : "play-arrow"} onPress={() => this.scan()} />
        </Appbar.Header>
        <Banner
          visible={this.state.notify}
          actions={[
            {
              label: "Close",
              onPress: () =>
                this.setState({
                  notify: false
                })
            },
            {
              label: "Disconnect",
              onPress: async () => {
                this.connectedDevice.onDisconnected((erro, dev) => {
                  if (erro) console.warn(erro);
                  else console.log("Disconnected", dev);
                });
                let res = await this.connectedDevice.cancelConnection();
                console.warn(res);
                // await AsyncStorage.removeItem("last");
                this.setState({ notify: false, connectedP: undefined });
              }
            }
          ]}
        >
          {this.state.message}
        </Banner>
        {this.state.connectedP && (
          <View style={{ flexDirection: "row", padding: 8 }}>
            <List.Item
              title={this.state.isSwitchOn ? "ON" : "OFF"}
              right={() => (
                <Switch
                  value={this.state.isSwitchOn}
                  onValueChange={async () => {
                    if (this.state.isSwitchOn === false) {
                      await this.write(this.state.connectedP, "Dw0DAP8rG9CgAQEAAAC7//8=");
                    } else {
                      await this.write(this.state.connectedP, "DwoNAAAAAAAFAAAT//8=");
                    }
                    this.setState({ isSwitchOn: !this.state.isSwitchOn });
                  }}
                />
              )}
            />
          </View>
        )}
        <ScrollView style={styles.scroll}>
          {/* <Text>{JSON.stringify(this.state.connectedP, null, 2)}</Text> */}

          {list && list.length == 0 ? (
            <View style={{ flex: 1, margin: 20 }}>
              <Text style={{ textAlign: "center" }}>No peripherals</Text>
            </View>
          ) : (
            list.map((item, i) => (
              <List.Item
                key={i}
                title={item.name || "No Name"}
                // left={props => <IconButton {...props} icon="brightness-high" onPress={() => this.write(item, "Dw0DAP8rG9CgAQEAAAC7//8=")} />}
                // right={props => <IconButton {...props} icon="brightness-low" onPress={() => this.write(item, "DwoNAAAAAAAFAAAT//8=")} />}
                description={item.id}
                onPress={() => this.connect(item)}
              />
            ))
          )}
        </ScrollView>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFF",
    width: window.width,
    height: window.height
  },
  scroll: {
    flex: 1
  },
  row: {
    margin: 10
  }
});
