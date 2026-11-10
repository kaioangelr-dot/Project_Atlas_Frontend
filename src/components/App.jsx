import { CurrentUserContext } from "../contexts/CurrentUserContext";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Routes, Route, useLocation, useNavigate } from "react-router-dom";

import Preloader from "./Preloader/Preloader";
import Header from "./Header/Header";
import Navigation from "./Navigation/Navigation";
import Main from "./Main/Main";
import Sidebar from "./Sidebar/Sidebar";
import About from "./About/About";
import Maps from "./Maps/Maps";
import Footer from "./Footer/Footer";
import MapDetailRoute from "./MapDetailRoute/MapDetailRoute";
import { ProtectedRoute } from "./ProtectedRoute/ProtectedRoute";
import { Login } from "./pages/Login";
import { Register } from "./pages/Register";
import IsAuthorized from "./Popup/components/InfoToolTip/components/IsAuthorized";
import IsNotAuthorized from "./Popup/components/InfoToolTip/components/IsNotAuthorized";
import Api from "../utils/api";
import { getToken, removeToken, setToken } from "../utils/token";
import { DEFAULT_MAP, DEFAULT_MAP_ID } from "../utils/defaultMap";

function App() {
  const location = useLocation();
  const { pathname } = location;
  const navigate = useNavigate();
  const previousPathname = useRef(pathname);
  const mapLoadRequest = useRef(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isSessionLoading, setIsSessionLoading] = useState(() => Boolean(getToken()));
  const [isAuthSubmitting, setIsAuthSubmitting] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [maps, setMaps] = useState([DEFAULT_MAP]);
  const [currentMap, setCurrentMap] = useState({ title: "New map", layers: [], likes: [], isSaved: false });
  const [mapLoadVersion, setMapLoadVersion] = useState(0);
  const [loadedMapId, setLoadedMapId] = useState(null);
  const [popup, setPopup] = useState(null);
  const [isOpen, setIsOpen] = useState({ navigation: true, sidebar: true });
  const [isLayerPanelOpen, setIsLayerPanelOpen] = useState(false);
  const [selectTool, setSelectTool] = useState(null);
  const [brushSize, setBrushSize] = useState(5);
  const [brushSoftness, setBrushSoftness] = useState(0);
  const api = useMemo(
    () =>
      new Api({
        baseUrl: import.meta.env.VITE_API_URL,
        request: (url, options) => fetch(url, options),
        getToken,
        onUnauthorized: () => window.dispatchEvent(new Event("atlas:session-expired")),
      }),
    [],
  );

  useEffect(() => {
    const sessionToken = getToken();
    if (!sessionToken) return undefined;

    let isMounted = true;
    api
      .getCurrentUser()
      .then(({ data }) => {
        if (isMounted && getToken() === sessionToken) {
          setCurrentUser(data);
        }
      })
      .catch((error) => {
        if (!isMounted) return;
        console.error("Could not restore user session.", error);
      })
      .finally(() => {
        if (isMounted) setIsSessionLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [api]);

  useEffect(() => {
    const handleSessionExpired = () => {
      removeToken();
      setCurrentUser(null);
      setPopup({
        title: "Sessão encerrada",
        children: (
          <IsNotAuthorized
            message="Sua sessão expirou. Entre novamente para continuar."
            showLoginLink
            handleClosePopup={handleClosePopup}
          />
        ),
      });
    };

    window.addEventListener("atlas:session-expired", handleSessionExpired);
    return () => {
      window.removeEventListener("atlas:session-expired", handleSessionExpired);
    };
  }, []);

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
    if (!currentUser) {
      setPopup({
        title: "Entre na sua conta",
        children: (
          <IsNotAuthorized
            message="Entre para salvar e editar mapas."
            showLoginLink
            handleClosePopup={handleClosePopup}
          />
        ),
      });
      return Promise.resolve();
    }

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
    if (!currentUser) {
      setPopup({
        title: "Entre na sua conta",
        children: (
          <IsNotAuthorized
            message="Entre para curtir mapas."
            showLoginLink
            handleClosePopup={handleClosePopup}
          />
        ),
      });
      return;
    }

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
        setPopup({
          title: "Não foi possível curtir o mapa",
          children: <IsNotAuthorized message={error.message} />,
        });
      });
  }

  function handleMapDelete(map) {
    if (!currentUser || String(map.owner) !== String(currentUser._id)) {
      setPopup({
        title: "Ação não permitida",
        children: (
          <IsNotAuthorized
            message="Você só pode excluir mapas criados pela sua conta."
            showLoginLink={!currentUser}
            handleClosePopup={handleClosePopup}
          />
        ),
      });
      return;
    }

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
        setPopup({
          title: "Não foi possível excluir o mapa",
          children: <IsNotAuthorized message={error.message} />,
        });
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

  function handleSignup(email, password) {
    setIsAuthSubmitting(true);
    return api
      .signup({ email, password })
      .then(() => {
        setPopup({
          children: <IsAuthorized handleClosePopup={handleClosePopup} />,
        });
      })
      .catch((error) => {
        setPopup({
          children: <IsNotAuthorized message={error.message} />,
        });
      })
      .finally(() => setIsAuthSubmitting(false));
  }

  function handleSignin(email, password) {
    setIsAuthSubmitting(true);
    return api
      .signin({ email, password })
      .then(({ token }) => {
        if (!token) throw new Error("The server did not return an access token.");
        setToken(token);
        return api
          .getCurrentUser()
          .then(({ data }) => {
            if (!data) throw new Error("The server did not return the user profile.");
            setCurrentUser(data);
            setPopup(null);
            navigate(location.state?.from?.pathname || "/", { replace: true });
          })
          .catch((error) => {
            removeToken();
            throw error;
          });
      })
      .catch((error) => {
        setPopup({
          children: <IsNotAuthorized message={error.message} />,
        });
      })
      .finally(() => setIsAuthSubmitting(false));
  }

  function handleLogout() {
    removeToken();
    setCurrentUser(null);
    setCurrentMap({ title: "New map", layers: [], likes: [], isSaved: false });
    setPopup(null);
    navigate("/");
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
          handleOpenPopup,
        }}
      >
        <Header currentUser={currentUser} onLogout={handleLogout} />
        {!["/login", "/signup"].includes(pathname) && (
          <Navigation handleArrowClick={handleArrowClick} isOpen={isOpen.navigation} />
        )}
        <Routes>
          <Route
            path="/"
            element={
              <ProtectedRoute
                isLoggedIn={Boolean(currentUser)}
                isLoading={isSessionLoading}
              >
                {mapEditor}
              </ProtectedRoute>
            }
          />
          <Route
            path="/login"
            element={
              <ProtectedRoute
                isLoggedIn={Boolean(currentUser)}
                isLoading={isSessionLoading}
                anonymous
              >
                <Login
                  popup={popup}
                  handleClosePopup={handleClosePopup}
                  handleSignin={handleSignin}
                  isSubmitting={isAuthSubmitting}
                />
              </ProtectedRoute>
            }
          />
          <Route
            path="/signup"
            element={
              <ProtectedRoute
                isLoggedIn={Boolean(currentUser)}
                isLoading={isSessionLoading}
                anonymous
              >
                <Register
                  popup={popup}
                  handleClosePopup={handleClosePopup}
                  handleSignup={handleSignup}
                  isSubmitting={isAuthSubmitting}
                />
              </ProtectedRoute>
            }
          />
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
              <ProtectedRoute
                isLoggedIn={Boolean(currentUser)}
                isLoading={isSessionLoading}
              >
                <MapDetailRoute loadMap={handleLoadMap} loadedMapId={loadedMapId}>
                  {mapEditor}
                </MapDetailRoute>
              </ProtectedRoute>
            }
          />
        </Routes>
        {pathname !== "/" && !pathname.startsWith("/maps/") && <Footer />}
      </CurrentUserContext.Provider>
    </div>
  );
}

export default App;
