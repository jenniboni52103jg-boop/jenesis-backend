import AsyncStorage from "@react-native-async-storage/async-storage";
import { Video } from "expo-av";
import { useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import {
    ScrollView,
    StyleSheet,
    Text,
    View,
} from "react-native";

type Project = {
  id: string;
  prompt: string;
  videoUrl: string;
  createdAt: string;
};

export default function Projects() {
  const [projects, setProjects] = useState<Project[]>([]);

  const loadProjects = async () => {
    const stored = await AsyncStorage.getItem("projects");
    if (stored) setProjects(JSON.parse(stored));
  };

  useFocusEffect(
    useCallback(() => {
      loadProjects();
    }, [])
  );

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>📁 Progetti</Text>

      {projects.length === 0 && (
        <Text style={styles.empty}>Nessun progetto salvato</Text>
      )}

      {projects.map((p) => (
        <View key={p.id} style={styles.card}>
          <Text style={styles.prompt}>{p.prompt}</Text>
          <Video
            source={{ uri: p.videoUrl }}
            style={{ width: "100%", height: 220 }}
            useNativeControls
          />
          <Text style={styles.date}>
            {new Date(p.createdAt).toLocaleString()}
          </Text>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    marginBottom: 20,
  },
  empty: {
    textAlign: "center",
    color: "#666",
    marginTop: 40,
  },
  card: {
    marginBottom: 30,
  },
  prompt: {
    fontWeight: "600",
    marginBottom: 10,
  },
  date: {
    fontSize: 12,
    color: "#888",
    marginTop: 6,
  },
});