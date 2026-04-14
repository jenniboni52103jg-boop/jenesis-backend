import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { View } from "react-native";
import { LanguageProvider } from "./context/LanguageContext";
import { CreditsProvider } from "./contexts/CreditsContext";

export default function RootLayout() {
  return (
    <LanguageProvider>
      <CreditsProvider>
        <View style={{ flex: 1, backgroundColor: "#2B1E5C" }}>
          <StatusBar style="light" backgroundColor="#2B1E5C" />

          <Stack
            screenOptions={{
              headerShown: false,
              contentStyle: { backgroundColor: "#2B1E5C" },
            }}
          />

        </View>
      </CreditsProvider>
    </LanguageProvider>
  );
}