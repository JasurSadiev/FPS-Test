import type { Game } from './types';

export const popularGames: Game[] = [
  {
    id: 1,
    name: "Black Myth: Wukong",
    developer: "Game Science",
    releaseDate: "2024",
    coverImage: "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/2358720/header.jpg",
    requirements: {
      minGpu: "GTX 1060 6GB",
      minCpu: "i5-8400",
      minRam: 16,
      minStorage: 130
    },
    isCustom: false
  },
  {
    id: 2,
    name: "Cyberpunk 2077",
    developer: "CD PROJEKT RED",
    releaseDate: "2020",
    coverImage: "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1091500/header.jpg",
    requirements: {
      minGpu: "GTX 1060",
      minCpu: "i7-6700",
      minRam: 12,
      minStorage: 70
    },
    isCustom: false
  },
  {
    id: 3,
    name: "Counter-Strike 2",
    developer: "Valve",
    releaseDate: "2023",
    coverImage: "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/730/header.jpg",
    requirements: {
      minGpu: "GTX 640 1GB",
      minCpu: "Quad-core Intel / AMD",
      minRam: 8,
      minStorage: 85
    },
    isCustom: false
  },
  {
    id: 4,
    name: "Elden Ring",
    developer: "FromSoftware",
    releaseDate: "2022",
    coverImage: "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1245620/header.jpg",
    requirements: {
      minGpu: "GTX 1060 3GB",
      minCpu: "i5-8400",
      minRam: 12,
      minStorage: 60
    },
    isCustom: false
  },
  {
    id: 5,
    name: "Red Dead Redemption 2",
    developer: "Rockstar Games",
    releaseDate: "2019",
    coverImage: "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1174180/header.jpg",
    requirements: {
      minGpu: "GTX 770",
      minCpu: "i5-2500K",
      minRam: 8,
      minStorage: 150
    },
    isCustom: false
  },
  {
    id: 6,
    name: "Deadlock",
    developer: "Valve",
    releaseDate: "2024",
    coverImage: "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1422450/header.jpg",
    requirements: {
      minGpu: "GTX 1060",
      minCpu: "i5-8400",
      minRam: 16,
      minStorage: 30
    },
    isCustom: false
  }
];
