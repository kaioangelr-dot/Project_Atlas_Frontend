export default class Api {
  constructor(options) {
    this._baseUrl = options.baseUrl;
  }

  _getHeaders() {
    return {
      "Content-Type": "application/json",
      Accept: "application/json",
    };
  }

  _checkResponse(res) {
    if (!res.ok) {
      return Promise.reject(new Error(`Request failed with status ${res.status}.`));
    }

    return res.status === 204 ? null : res.json();
  }

  getMaps() {
    return fetch(`${this._baseUrl}/maps`, {
      headers: this._getHeaders(),
    }).then(this._checkResponse);
  }

  getMapById(mapId) {
    return fetch(`${this._baseUrl}/maps/${mapId}`, {
      headers: this._getHeaders(),
    }).then(this._checkResponse);
  }

  saveMap(mapData) {
    return fetch(`${this._baseUrl}/maps`, {
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
    return fetch(`${this._baseUrl}/maps/${mapId}`, {
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
    return fetch(`${this._baseUrl}/maps/${mapId}`, {
      method: "DELETE",
      headers: this._getHeaders(),
    }).then(this._checkResponse);
  }

  changeMapLike(mapId, isLiked) {
    return fetch(`${this._baseUrl}/maps/${mapId}/likes`, {
      method: isLiked ? "DELETE" : "PUT",
      headers: this._getHeaders(),
    }).then((res) => this._checkResponse(res));
  }
}
