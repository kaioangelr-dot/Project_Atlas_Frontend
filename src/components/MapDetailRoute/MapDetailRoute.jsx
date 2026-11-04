import { useEffect } from "react";
import { useParams } from "react-router-dom";

export default function MapDetailRoute({ loadMap, loadedMapId, children }) {
  const { mapId } = useParams();

  useEffect(() => {
    loadMap(mapId);
  }, [loadMap, mapId]);

  return loadedMapId === mapId ? children : null;
}
