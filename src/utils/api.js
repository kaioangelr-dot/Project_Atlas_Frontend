export default class Api {
  constructor({ baseUrl, request, getToken, onUnauthorized }) {
    this._baseUrl = baseUrl;
    this._request = request;
    this._getToken = getToken;
    this._onUnauthorized = onUnauthorized;
  }

  _getHeaders(includeAuth = true) {
    const headers = {
      "Content-Type": "application/json",
      Accept: "application/json",
    };

    const token = includeAuth ? this._getToken() : null;
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    return headers;
  }

  async _checkResponse(res, usesAuth = true) {
    if (!res.ok) {
      const error = await res.json();
      const requestError = new Error(
        error.message || `Request failed with status ${res.status}.`,
      );
      requestError.status = res.status;
      if (res.status === 401 && usesAuth) {
        this._onUnauthorized();
      }
      throw requestError;
    }

    return res.status === 204 ? null : res.json();
  }

  signup(credentials) {
    return this._request(`${this._baseUrl}/signup`, {
      method: "POST",
      headers: this._getHeaders(false),
      body: JSON.stringify(credentials),
    }).then((res) => this._checkResponse(res, false));
  }

  signin(credentials) {
    return this._request(`${this._baseUrl}/signin`, {
      method: "POST",
      headers: this._getHeaders(false),
      body: JSON.stringify(credentials),
    }).then((res) => this._checkResponse(res, false));
  }

  getCurrentUser() {
    return this._request(`${this._baseUrl}/users/me`, {
      headers: this._getHeaders(),
    }).then((res) => this._checkResponse(res));
  }

  getMaps() {
    return this._request(`${this._baseUrl}/maps`, {
      headers: this._getHeaders(),
    }).then((res) => this._checkResponse(res));
  }

  getMapById(mapId) {
    return this._request(`${this._baseUrl}/maps/${mapId}`, {
      headers: this._getHeaders(),
    }).then((res) => this._checkResponse(res));
  }

  saveMap(mapData) {
    return this._request(`${this._baseUrl}/maps`, {
      method: "POST",
      headers: this._getHeaders(),
      body: JSON.stringify({
        name: mapData.title,
        image: mapData.previewImage,
        map: { layers: mapData.layers },
      }),
    }).then(this._checkResponse);
  }

  updateMap(mapId, mapData) {
    return this._request(`${this._baseUrl}/maps/${mapId}`, {
      method: "PATCH",
      headers: this._getHeaders(),
      body: JSON.stringify({
        name: mapData.title,
        image: mapData.previewImage,
        map: { layers: mapData.layers },
      }),
    }).then(this._checkResponse);
  }

  deleteMap(mapId) {
    return this._request(`${this._baseUrl}/maps/${mapId}`, {
      method: "DELETE",
      headers: this._getHeaders(),
    }).then(this._checkResponse);
  }

  changeMapLike(mapId, isLiked) {
    return this._request(`${this._baseUrl}/maps/${mapId}/likes`, {
      method: isLiked ? "DELETE" : "PUT",
      headers: this._getHeaders(),
    }).then((res) => this._checkResponse(res));
  }
}
