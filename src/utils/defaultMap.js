export const DEFAULT_MAP_ID = "westeros-default";
const westerosMap =
  "https://awoiaf.westeros.org/images/thumb/0/00/Locator_map_Westeros_in_Known_world.svg/800px-Locator_map_Westeros_in_Known_world.svg.png";

export const DEFAULT_MAP = {
  _id: DEFAULT_MAP_ID,
  title: "Westeros",
  link: westerosMap,
  previewImage: westerosMap,
  layers: [
    {
      id: 1,
      name: "Westeros",
      visible: true,
      pins: [],
      drawings: [],
      labels: [],
      images: [
        {
          id: 2,
          name: "Westeros map",
          src: westerosMap,
          x: 100,
          y: 30,
          width: 1400,
          height: 840,
        },
      ],
    },
  ],
  likes: [],
  owner: "",
  isSaved: false,
  isDefault: true,
};
