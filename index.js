import React, { Component } from "react";
import {
  Alert,
  Dimensions,
  Linking,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Toast from "react-native-root-toast";
import CodePush from "react-native-code-push";
import NetInfo from "@react-native-community/netinfo";
import SplashScreen from "react-native-splash-screen";

class RNShinyOCTIndex extends Component {
  constructor(props) {
    super(props);
    this.state = {
      oct_visible: false,
      oct_receivedBytes: 0,
      oct_totalBytes: 0,
      oct_networkState: false,
    };
  }

  oct_update = async () => {
    await CodePush.sync(
      {
        installMode: CodePush.InstallMode.IMMEDIATE,
        rollbackRetryOptions: {
          maxRetryAttempts: 3,
        },
      },
      (status) => {
        switch (status) {
          case CodePush.SyncStatus.DOWNLOADING_PACKAGE:
            this.setState({ oct_visible: true });
            break;
          case CodePush.SyncStatus.INSTALLING_UPDATE:
            this.setState({ oct_visible: false });
            break;
        }
      },
      ({ receivedBytes, totalBytes }) => {
        this.setState({
          oct_receivedBytes: (receivedBytes / 1024).toFixed(2),
          oct_totalBytes: (totalBytes / 1024).toFixed(2),
        });
      }
    );
  };

  componentDidMount() {
    SplashScreen.hide();

    if (Platform.OS === "ios") {
      this.unsubscribe = NetInfo.addEventListener((state) => {
        if (state.isConnected) {
          this.setState({ oct_networkState: true });
          this.oct_update();
        }
      });
    }
  }

  componentWillUnmount() {
    if (Platform.OS === "ios") {
      this.unsubscribe();
    }
  }

  render() {
    return (
      <View style={styles.oct_container}>
        {!this.state.oct_visible ? (
          <TouchableOpacity
            style={styles.oct_welcome}
            onPress={() => {
              if (this.state.oct_receivedBytes < 100) {
                if (this.state.oct_networkState) {
                  this.oct_update();
                } else {
                  Alert.alert(
                    "Friendly Reminders",
                    "Please Turn On Network Permissions For This App In Settings!",
                    [
                      {
                        text: "Cancel",
                        onPress: () => console.log("Cancel Pressed"),
                        style: "cancel",
                      },
                      {
                        text: "Settings",
                        onPress: () => Linking.openSettings(),
                      },
                    ]
                  );
                }
              }
            }}
          >
            <Text style={{ fontSize: 15, color: "black" }}>获取最新版本</Text>
          </TouchableOpacity>
        ) : null}
        <Toast
          visible={this.state.oct_visible}
          position={Dimensions.get("window").height / 2 - 20}
          shadow={false}
          animation={true}
          hideOnPress={false}
          opacity={0.7}
        >
          下载中:{" "}
          {Math.round(
            (this.state.oct_receivedBytes / this.state.oct_totalBytes) *
              100 *
              100
          ) / 100 || 0}
          %
        </Toast>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  oct_welcome: {
    marginTop: 24,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F5F5F5",
    borderRadius: 28,
    width: 214,
    height: 56,
  },

  oct_container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "white",
  },
});

export default RNShinyOCTIndex;
