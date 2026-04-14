export type StyleCard = {
  id: string;
  title: string;
  subtitle: string;
  templateKey: string;
  images: any[];
};

// funzione random (sceglie 1 immagine)
export function getRandomImage(images: any[]) {
  return images[Math.floor(Math.random() * images.length)];
}

export const STYLE_CARDS: StyleCard[] = [
  {
    id: "autunno",
    title: "Autunno",
    subtitle: "Warm seasonal look",
    templateKey: "autunno",
    images: [
      require("../../assets/explorer/autunno/autunno1.jpg"),
      require("../../assets/explorer/autunno/autunno2.jpg"),
      require("../../assets/explorer/autunno/autunno3.jpg"),
      require("../../assets/explorer/autunno/autunno4.jpg"),
    ],
  },
  {
    id: "photoshop",
    title: "Photoshop",
    subtitle: "Luxury edited look",
    templateKey: "photoshop",
    images: [
      require("../../assets/explorer/photoshop/photoshop1.jpg"),
      require("../../assets/explorer/photoshop/photoshop2.jpg"),
      require("../../assets/explorer/photoshop/photoshop3.jpg"),
      require("../../assets/explorer/photoshop/photoshop4.jpg"),
    ],
  },
  {
    id: "portraits",
    title: "Portraits",
    subtitle: "Studio portraits style",
    templateKey: "portraits",
    images: [
      require("../../assets/explorer/portraits/portraits1.jpg"),
      require("../../assets/explorer/portraits/portraits2.jpg"),
      require("../../assets/explorer/portraits/portraits3.jpg"),
      require("../../assets/explorer/portraits/portraits4.jpg"),
    ],
  },
  {
    id: "travel",
    title: "travel",
    subtitle: "travel transformation",
    templateKey: "travel",
    images: [
      require("../../assets/explorer/travel/travel1.jpg"),
      require("../../assets/explorer/travel/travel2.jpg"),
      require("../../assets/explorer/travel/travel3.jpg"),
      require("../../assets/explorer/travel/travel4.jpg"),
    ],
  },
];