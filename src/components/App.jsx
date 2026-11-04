import { CurrentUserContext } from "../contexts/CurrentUserContext";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Routes, Route, useLocation } from "react-router-dom";

import Preloader from "./Preloader/Preloader";
import Header from "./Header/Header";
import Navigation from "./Navigation/Navigation";
import Main from "./Main/Main";
import Sidebar from "./Sidebar/Sidebar";
import About from "./About/About";
import Maps from "./Maps/Maps";
import Footer from "./Footer/Footer";
import MapDetailRoute from "./MapDetailRoute/MapDetailRoute";
import Api from "../utils/api";
import { DEFAULT_MAP, DEFAULT_MAP_ID } from "../utils/defaultMap";

function App() {
  const { pathname } = useLocation();
  const previousPathname = useRef(pathname);
  const mapLoadRequest = useRef(0);
  const currentUser = { _id: "3", name: "John Doe", email: "john.doe@example.com" };
  const api = useMemo(
    () =>
      new Api({
        baseUrl: import.meta.env.VITE_API_URL,
      }),
    [],
  );
  const [isLoading, setIsLoading] = useState(true);
  const [maps, setMaps] = useState([DEFAULT_MAP]);
  const [currentMap, setCurrentMap] = useState({ title: "New map", layers: [], likes: [], isSaved: false });
  const [mapLoadVersion, setMapLoadVersion] = useState(0);
  const [loadedMapId, setLoadedMapId] = useState(null);
  const [popup, setPopup] = useState(null);
  const [isOpen, setIsOpen] = useState({ navigation: true, sidebar: true });
  const [isLayerPanelOpen, setIsLayerPanelOpen] = useState(false);
  const [selectTool, setSelectTool] = useState(null);
  const [brushSize, setBrushSize] = useState(16);
  const [brushSoftness, setBrushSoftness] = useState(35);

  function normalizeMap(record) {
    return {
      _id: record._id,
      title: record.name,
      link: record.image,
      previewImage: record.image,
      layers: record.map.layers,
      likes: record.likes,
      owner: record.owner,
      isSaved: true,
    };
  }

  function normalizeMapSummary(record) {
    return {
      _id: record._id,
      title: record.name,
      link: record.image,
      likes: record.likes,
      owner: record.owner,
    };
  }

  useEffect(() => {
    let isMounted = true;

    api
      .getMaps()
      .then((records) => {
        const loadedMaps = records.map(normalizeMapSummary);
        if (isMounted) {
          setMaps([DEFAULT_MAP, ...loadedMaps.filter((map) => map._id !== DEFAULT_MAP_ID)]);
        }
      })
      .catch((error) => {
        if (isMounted) console.error("Could not load maps.", error);
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [api]);

  function handleSaveMap(mapData) {
    setIsLoading(true);
    const saveRequest = currentMap.isSaved ? api.updateMap(currentMap._id, mapData) : api.saveMap(mapData);

    return saveRequest
      .then((savedRecord) => {
        const responseMap = savedRecord ? normalizeMap(savedRecord) : null;
        const map = {
          ...currentMap,
          ...responseMap,
          ...mapData,
          _id: responseMap?._id ?? (currentMap.isSaved ? currentMap._id : undefined),
          link: responseMap?.link ?? mapData.previewImage,
          likes: responseMap?.likes ?? currentMap.likes,
          owner: responseMap?.owner || currentMap.owner || currentUser._id,
          isSaved: true,
        };

        if (!map._id) {
          throw new Error("The server saved the map but did not return its ID.");
        }

        setCurrentMap(map);
        setMaps((currentMaps) => [map, ...currentMaps.filter((item) => item._id !== map._id)]);
        setPopup(null);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }

  const handleLoadMap = useCallback(
    (mapId) => {
      const requestId = mapLoadRequest.current + 1;
      mapLoadRequest.current = requestId;
      setIsLoading(true);
      setLoadedMapId(null);
      const mapRequest = mapId === DEFAULT_MAP_ID ? Promise.resolve(DEFAULT_MAP) : api.getMapById(mapId);
      return mapRequest
        .then((response) => {
          const loadedMap = mapId === DEFAULT_MAP_ID ? response : normalizeMap(response);
          if (requestId !== mapLoadRequest.current) return;
          setCurrentMap(loadedMap);
          setLoadedMapId(loadedMap._id);
          setMapLoadVersion((version) => version + 1);
          setMaps((currentMaps) =>
            currentMaps.map((map) => (map._id === loadedMap._id ? { ...map, ...loadedMap } : map)),
          );
        })
        .catch((error) => {
          if (requestId !== mapLoadRequest.current) return;
          console.error("Could not load map.", error);
        })
        .finally(() => {
          if (requestId === mapLoadRequest.current) setIsLoading(false);
        });
    },
    [api],
  );

  function handleMapLike(isLiked, mapId) {
    return api
      .changeMapLike(mapId, isLiked)
      .then(() => {
        setMaps((currentMaps) =>
          currentMaps.map((map) => {
            if (map._id !== mapId) return map;
            const likes = map.likes.filter((userId) => userId !== currentUser._id);
            return { ...map, likes: isLiked ? likes : [...likes, currentUser._id] };
          }),
        );
      })
      .catch((error) => {
        console.error("Could not update map like.", error);
      });
  }

  function handleMapDelete(map) {
    setIsLoading(true);
    return api
      .deleteMap(map._id)
      .then(() => {
        setMaps((currentMaps) => currentMaps.filter((item) => item._id !== map._id));
        if (currentMap._id === map._id) {
          setCurrentMap({ title: "New map", layers: [], likes: [], isSaved: false });
        }
      })
      .catch((error) => {
        console.error("Could not delete map.", error);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }

  function handleMapTitleChange(title) {
    setCurrentMap((map) => ({ ...map, title }));
  }
  const handleArrowClick = (component) => {
    setIsOpen((prev) => ({
      ...prev,
      [component]: !prev[component],
    }));
  };

  useEffect(() => {
    if (!popup) return;

    const handleEscape = (evt) => {
      if (evt.key === "Escape") {
        handleClosePopup();
      }
    };

    const handleOverlayClose = (evt) => {
      if (evt.target.classList.contains("popup")) {
        handleClosePopup();
      }
    };

    document.addEventListener("keydown", handleEscape);
    document.addEventListener("click", handleOverlayClose);
    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.removeEventListener("click", handleOverlayClose);
    };
  }, [popup]);

  useEffect(() => {
    if (
      pathname === "/" &&
      previousPathname.current !== "/" &&
      (currentMap.isSaved || currentMap._id === DEFAULT_MAP_ID)
    ) {
      setCurrentMap({ title: "New map", layers: [], likes: [], isSaved: false });
    }
    previousPathname.current = pathname;
  }, [currentMap._id, currentMap.isSaved, pathname]);

  function handleOpenPopup(popup) {
    setPopup(popup);
  }

  function handleClosePopup() {
    setPopup(null);
  }

  function handleSelectTool(tool) {
    setSelectTool(tool);
  }

  function handleToggleLayers(nextIsOpen) {
    setIsLayerPanelOpen((currentIsOpen) => (typeof nextIsOpen === "boolean" ? nextIsOpen : !currentIsOpen));
  }

  const mapEditor = (
    <>
      <Main
        key={`${currentMap._id ?? "new-map"}-${mapLoadVersion}`}
        mapTitle={currentMap.title}
        onSaveMap={handleSaveMap}
        onMapTitleChange={handleMapTitleChange}
        isSaving={isLoading}
        onClose={handleClosePopup}
        onOpen={handleOpenPopup}
        onSelectTool={handleSelectTool}
        onToggleLayers={handleToggleLayers}
        isLayerPanelOpen={isLayerPanelOpen}
        brushSize={brushSize}
        brushSoftness={brushSoftness}
        popup={popup}
        selectTool={selectTool}
        layers={currentMap.layers}
      />
      <Sidebar
        handleArrowClick={handleArrowClick}
        isOpen={isOpen.sidebar}
        handleSelectTool={handleSelectTool}
        onToggleLayers={handleToggleLayers}
        isLayerPanelOpen={isLayerPanelOpen}
        brushSize={brushSize}
        onBrushSizeChange={setBrushSize}
        brushSoftness={brushSoftness}
        onBrushSoftnessChange={setBrushSoftness}
        selectTool={selectTool}
      />
    </>
  );

  return (
    <div className="app">
      {isLoading && <Preloader />}
      <CurrentUserContext.Provider
        value={{
          isLoading,
          currentUser,
        }}
      >
        <Header />
        <Navigation handleArrowClick={handleArrowClick} isOpen={isOpen.navigation} />
        <Routes>
          <Route path="/" element={mapEditor} />
          <Route path="/about" element={<About />} />
          <Route
            path="/maps"
            element={
              <Maps
                maps={maps}
                popup={popup}
                handleOpenPopup={handleOpenPopup}
                handleClosePopup={handleClosePopup}
                onmapLike={handleMapLike}
                onmapDelete={handleMapDelete}
              />
            }
          />
          <Route
            path="/maps/:mapId"
            element={
              <MapDetailRoute loadMap={handleLoadMap} loadedMapId={loadedMapId}>
                {mapEditor}
              </MapDetailRoute>
            }
          />
        </Routes>
        {pathname !== "/" && !pathname.startsWith("/maps/") && <Footer />}
      </CurrentUserContext.Provider>
    </div>
  );
}

export default App;
