import { useRouter } from "expo-router";
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";

const SECTIONS = [
  {
    key: "dance",
    title: "AI Dance",
    templates: [
      { preview: "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e", template: "dance_1" },
      { preview: "https://images.unsplash.com/photo-1508704019882-f9cf40e475b4", template: "dance_2" },
      { preview: "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c", template: "dance_3" },
      { preview: "https://images.unsplash.com/photo-1547153760-18fc86324498", template: "dance_4" },
      { preview: "https://images.unsplash.com/photo-1515165562835-c4c1b5727e3b", template: "dance_5" },
      { preview: "https://images.unsplash.com/photo-1520975916090-3105956dac38", template: "dance_6" },
      { preview: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4", template: "dance_7" },
      { preview: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee", template: "dance_8" },
    ],
  },

  {
    key: "rapper",
    title: "Rapper Vibes",
    templates: [
      { preview: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4", template: "rapper_1" },
      { preview: "https://images.unsplash.com/photo-1516280440614-37939bbacd81", template: "rapper_2" },
      { preview: "https://images.unsplash.com/photo-1520974735194-8e9fdfbfb1d0", template: "rapper_3" },
      { preview: "https://images.unsplash.com/photo-1506157786151-b8491531f063", template: "rapper_4" },
      { preview: "https://images.unsplash.com/photo-1497032205916-ac775f0649ae", template: "rapper_5" },
      { preview: "https://images.unsplash.com/photo-1520975698519-59c4c8e57e9c", template: "rapper_6" },
      { preview: "https://images.unsplash.com/photo-1509339022327-1e1e25360a1f", template: "rapper_7" },
      { preview: "https://images.unsplash.com/photo-1510915228340-29c85a43dcfe", template: "rapper_8" },
    ],
  },

  {
    key: "fantasy",
    title: "Fantasy AI",
    templates: [
      { preview: "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429", template: "fantasy_1" },
      { preview: "https://images.unsplash.com/photo-1520975916090-9f93d94cdb48", template: "fantasy_2" },
      { preview: "https://images.unsplash.com/photo-1504198458649-3128b932f49b", template: "fantasy_3" },
      { preview: "https://images.unsplash.com/photo-1501785888041-af3ef285b470", template: "fantasy_4" },
      { preview: "https://images.unsplash.com/photo-1519681393784-d120267933ba", template: "fantasy_5" },
      { preview: "https://images.unsplash.com/photo-1519682337058-a94d519337bc", template: "fantasy_6" },
      { preview: "https://images.unsplash.com/photo-1523633589114-88eaf4b4f1a8", template: "fantasy_7" },
      { preview: "https://images.unsplash.com/photo-1531312267124-1d8a62b6e7c5", template: "fantasy_8" },
    ],
  },

  {
    key: "winter",
    title: "Winter Vibes",
    templates: [
      { preview: "https://images.unsplash.com/photo-1516455207990-7a41ce80f7ee", template: "winter_1" },
      { preview: "https://images.unsplash.com/photo-1482192596544-9eb780fc7f66", template: "winter_2" },
      { preview: "https://images.unsplash.com/photo-1489587027915-8fd6c0b2c1d3", template: "winter_3" },
      { preview: "https://images.unsplash.com/photo-1519681393784-d120267933ba", template: "winter_4" },
      { preview: "https://images.unsplash.com/photo-1519682337058-a94d519337bc", template: "winter_5" },
      { preview: "https://images.unsplash.com/photo-1519682577862-22b62b24e493", template: "winter_6" },
      { preview: "https://images.unsplash.com/photo-1516455590571-18256e5bb9ff", template: "winter_7" },
      { preview: "https://images.unsplash.com/photo-1519681393784-d120267933ba", template: "winter_8" },
    ],
  },
];
  
export default function Explore() {
  const router = useRouter();

  return (
    <ScrollView style={styles.container}>
      {SECTIONS.map((section) => (
        <View key={section.key} style={styles.section}>
          <View style={styles.header}>
            <Text style={styles.title}>{section.title}</Text>
            <Text style={styles.seeAll}>Ver todo</Text>
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {section.templates.map((item, index) => (
              <TouchableOpacity
                key={index}
                style={styles.card}
                onPress={() =>
                  router.push({
                    pathname: "/create",
                    params: {
                      category: section.key,
                      template: item.video,
                    },
                  })
                }
              >
                <Image
                  source={{ uri: item.preview }}
                  style={styles.image}
                />

                <View style={styles.overlay}>
                  <Text style={styles.overlayText}>Usa template</Text>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  section: {
    marginBottom: 24,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  title: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
  },
  seeAll: {
    color: "#aaa",
  },
  card: {
    width: 140,
    height: 200,
    borderRadius: 16,
    marginLeft: 16,
    overflow: "hidden",
    backgroundColor: "#111",
  },
  image: {
    width: "100%",
    height: "100%",
  },
  overlay: {
    position: "absolute",
    bottom: 8,
    left: 8,
    right: 8,
    backgroundColor: "rgba(0,0,0,0.6)",
    borderRadius: 12,
    paddingVertical: 6,
  },
  overlayText: {
    color: "#fff",
    textAlign: "center",
    fontSize: 12,
  },
});