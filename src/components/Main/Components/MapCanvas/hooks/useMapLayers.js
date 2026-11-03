import { useCallback, useRef, useState } from "react";

function createMapLayer(id, name) {
  return {
    id,
    name,
    visible: true,
    pins: [],
    drawings: [],
    labels: [],
    images: [],
  };
}

function getInitialLayers(initialLayers) {
  return initialLayers.length > 0 ? initialLayers : [createMapLayer(1, "Layer 1")];
}

function getNextNumericId(layers) {
  const ids = layers.flatMap((layer) => [
    layer.id,
    ...layer.pins.map((pin) => pin.id),
    ...layer.drawings.map((drawing) => drawing.id),
    ...layer.labels.map((label) => label.id),
    ...layer.images.map((image) => image.id),
  ]);
  return Math.max(1, ...ids.filter((id) => Number.isInteger(id)).map(Number)) + 1;
}

export default function useMapLayers(initialLayers) {
  const [layers, setLayers] = useState(() => getInitialLayers(initialLayers));
  const [activeLayerId, setActiveLayerId] = useState(() => getInitialLayers(initialLayers)[0].id);
  const [canUndo, setCanUndo] = useState(false);
  const layersRef = useRef(layers);
  const historyRef = useRef([]);
  const nextIdRef = useRef(getNextNumericId(layers));
  const nextLayerNameRef = useRef(layers.length + 1);

  const allocateId = useCallback(() => nextIdRef.current++, []);

  const recordUndo = useCallback(() => {
    historyRef.current = [...historyRef.current.slice(-49), layersRef.current];
    setCanUndo(true);
  }, []);

  const updateLayers = useCallback(
    (update, shouldRecordUndo = true) => {
      const currentLayers = layersRef.current;
      const nextLayers = update(currentLayers);
      if (nextLayers === currentLayers) return;

      if (shouldRecordUndo) recordUndo();
      layersRef.current = nextLayers;
      setLayers(nextLayers);
    },
    [recordUndo],
  );

  const updateLayer = useCallback(
    (layerId, update, shouldRecordUndo = true) => {
      updateLayers((currentLayers) => {
        const index = currentLayers.findIndex((layer) => layer.id === layerId);
        if (index === -1) return currentLayers;

        const nextLayers = [...currentLayers];
        nextLayers[index] = update(currentLayers[index]);
        return nextLayers;
      }, shouldRecordUndo);
    },
    [updateLayers],
  );

  const undo = useCallback(() => {
    const previousLayers = historyRef.current.pop();
    if (!previousLayers) return;

    layersRef.current = previousLayers;
    setLayers(previousLayers);
    setCanUndo(historyRef.current.length > 0);

    if (!previousLayers.some((layer) => layer.id === activeLayerId)) {
      setActiveLayerId(previousLayers[previousLayers.length - 1].id);
    }
  }, [activeLayerId]);

  const addLayer = useCallback(() => {
    const id = allocateId();
    const name = `Layer ${nextLayerNameRef.current++}`;
    updateLayers((currentLayers) => [...currentLayers, createMapLayer(id, name)]);
    setActiveLayerId(id);
  }, [allocateId, updateLayers]);

  const deleteLayer = useCallback(
    (layerId) => {
      if (layers.length <= 1) return;

      const remainingLayers = layers.filter((layer) => layer.id !== layerId);
      updateLayers((currentLayers) => currentLayers.filter((layer) => layer.id !== layerId));
      if (activeLayerId === layerId) setActiveLayerId(remainingLayers[remainingLayers.length - 1].id);
    },
    [activeLayerId, layers, updateLayers],
  );

  const toggleLayerVisibility = useCallback(
    (layerId) => {
      updateLayer(layerId, (layer) => ({ ...layer, visible: !layer.visible }));
    },
    [updateLayer],
  );

  return {
    layers,
    layersRef,
    activeLayerId,
    setActiveLayerId,
    canUndo,
    allocateId,
    recordUndo,
    updateLayers,
    updateLayer,
    undo,
    addLayer,
    deleteLayer,
    toggleLayerVisibility,
  };
}
