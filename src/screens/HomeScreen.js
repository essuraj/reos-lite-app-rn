import React, { Component } from "react";
import { StyleSheet, Text, View, AsyncStorage, ScrollView, ActivityIndicator, Dimensions } from "react-native";
import { Appbar, Banner, List, IconButton, Switch, Headline, Button } from "react-native-paper";
var ByteBuffer = require("bytebuffer");
import { BleManager } from "react-native-ble-plx";
import { checkPerm, showToast, Br } from "../components/utils";
import { ColorPicker, toHsv } from "react-native-color-picker";
var Color = require("color");

let colors = [
  "0f051100000012ffff",
  "0f0c0100381d0d1c0b07e2000074ffff",
  "0f0d0300ffffff649d010100000004ffff",
  "0f0d0300ffffff649d010100000004ffff",
  "0f0d0300ffffff644a0101000000b1ffff",
  "0f0d0300ffffff644a0101000000b1ffff",
  "0f0d0300ffffff64a501010000000cffff",
  "0f0d0300ffffff64a501010000000cffff",
  "0f0d0300ffffff648e0101000000f5ffff",
  "0f0d0300ffffff648e0101000000f5ffff",
  "0f0d0300ffffffd09a01010000006dffff",
  "0f0d0300ffffffd09a01010000006dffff",
  "0f0d0300ffffffd046010100000019ffff",
  "0f0d0300ffffffd046010100000019ffff",
  "0f0d0300ffffff8c400101000000cfffff",
  "0f0d0300ffffff8c400101000000cfffff",
  "0f0d0300ffffffba420101000000ffffff",
  "0f0d0300ffffffba420101000000ffffff",
  "0f0d0300ffffffa2420101000000e7ffff",
  "0f0d0300ffffffa2420101000000e7ffff",
  "0f0d0300ff5219a200000100000011ffff",
  "0f0d03000b25ffa2000001000000d6ffff",
  "0f0d030018ff40a2000001000000feffff",
  "0f0d03007340ffa200000100000059ffff",
  "0f0d0300ffda5fa2000001000000dfffff",
  "0f0d03003603ffa2000001000000dfffff",
  "0f0d0300efbfffa200000100000054ffff",
  "0f0d03001401ffa2000001000000bbffff",
  "0f0d03001401ffa2000001000000bbffff",
  "0f0d03001001ffa2000001000000b7ffff",
  "0f0d03000c02ffa2000001000000b4ffff",
  "0f0d03000802ffa2000001000000b0ffff",
  "0f0d03000502ffa2000001000000adffff",
  "0f0d03000202ffa2000001000000aaffff",
  "0f0d03000203ffa2000001000000abffff",
  "0f0d03000206ffa2000001000000aeffff",
  "0f0d03000109ffa2000001000000b0ffff",
  "0f0d0300010dffa2000001000000b4ffff",
  "0f0d03000110ffa2000001000000b7ffff",
  "0f0d03000113ffa2000001000000baffff",
  "0f0d03000114ffa2000001000000bbffff",
  "0f0d03000115ffa2000001000000bcffff",
  "0f0d03000115ffa2000001000000bcffff",
  "0f0d03000116ffa2000001000000bdffff",
  "0f0d03000115ffa2000001000000bcffff",
  "0f0d03000115ffa2000001000000bcffff",
  "0f0d03000115ffa2000001000000bcffff",
  "0f0d03000115ffa0000001000000baffff",
  "0f0d03000115ffa4000001000000beffff",
  "0f0d03000115ffae000001000000c8ffff",
  "0f0d03000115ffb4000001000000ceffff",
  "0f0d03000115ffbc000001000000d6ffff",
  "0f0d03000115ffc2000001000000dcffff",
  "0f0d03000115ffc8000001000000e2ffff",
  "0f0d03000115ffcc000001000000e6ffff",
  "0f0d03000115ffd0000001000000eaffff",
  "0f0d03000115ffd0000001000000eaffff",
  "0f0d03000115ffd0000001000000eaffff",
  "0f0d03000115ffd0000001000000eaffff",
  "0f0d0300ff621dd000000100000053ffff",
  "0f0d03001ee4ffd0000001000000d6ffff",
  "0f0d0300ff4f43d000000100000066ffff",
  "0f0d0300ff4942d00000010000005fffff",
  "0f0d0300ff3f40d000000100000053ffff",
  "0f0d0300ff3e44d000000100000056ffff",
  "0f0d030026ff38d000000100000032ffff",
  "0f0d03006832ffd00000010000006effff",
  "0f0d0300ffc643d0000001000000ddffff",
  "0f0d03000dff87d000000100000068ffff",
  "0f0d030005dfffd0000001000000b8ffff",
  "0f0d0300ff2b1bd00000010000001affff",
  "0f0d03000f40ffd000000100000023ffff"
];
colors = [
  "0f0d0300ff621dd0000001000000eaffff",
  "0f0d0300ff621dd0000001000000eaffff",
  "0f0d03001ee4fdd0000001000000eaffff",
  "0f0d03000115ffd0000001000000f5ffff",
  "0f0d03000115ffd0000001000000eaffff",
  "0f0d03000115ffd0000001000000efffff",
  "0f0d03000115ffd0000001000000ffffff",
  "0f0d0300ff621dd000000100000053ffff",
  "0f0d03001ee4ffd0000001000000d6ffff"
];
export default class App extends Component {
  constructor() {
    super();
    this.manager = new BleManager();
    this.state = {
      isLoading: false,
      scanning: false,
      color: "#26ff38",
      cc: "26ff38",
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
          <View style={{ padding: 8 }}>
            <List.Item
              title="Control Bulb"
              description={this.state.isSwitchOn === true ? "ON" : "OFF"}
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
            list.map((item, i) => <List.Item key={i} title={item.name || "No Name"} description={item.id} onPress={() => this.connect(item)} />)
          )}

          <ColorPicker
            color={this.state.color}
            onColorChange={color => this.setState({ color: color })}
            onColorSelected={h => {
              console.log(h);
              let d = Color(h)
                .hex()
                .replace("#", "");
              console.log(d);
              let a = `0f0d0300${d.toLowerCase()}d000000100000032ffff`;
              console.log(a);

              this.setState({ color: toHsv(h), cc: a });
            }}
            style={{ flex: 1, height: 400 }}
          />
          <Br />
          <Button mode="contained" onPress={async () => await this.write(this.connectedDevice, ByteBuffer.fromHex(this.state.cc).toBase64())}>
            Change color
          </Button>
          <Br />
          {colors.map((item, i) => (
            <List.Item
              key={i}
              title={item}
              description={item.substr(8, 6)}
              left={() => <View style={{ width: 40, height: 40, backgroundColor: "#" + item.substr(8, 6) }} />}
              onPress={() => this.write(this.connectedDevice, ByteBuffer.fromHex(item).toBase64())}
            />
          ))}
          <Br />
          <Text>{JSON.stringify(this.state.cc, null, 2)}</Text>

          {/* <HueSlider style={styles.sliderRow} gradientSteps={40} value={this.state.color} onValueChange={)} /> */}
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
