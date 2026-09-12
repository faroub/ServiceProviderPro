import React, { useEffect, useMemo, useRef, useState } from 'react';
import { MapPin, Navigation, Search } from 'lucide-react';

interface WebPinDropMapProps {
  initialLat?: number;
  initialLng?: number;
  onPinChange: (lat: number, lng: number) => void;
  height?: string;
  lang?: string;
}

const ALGERIA_CITIES = [
  { name: 'Algiers (Alger)', lat: 36.7538, lng: 3.0588 },
  { name: 'Oran (وهران)', lat: 35.6987, lng: -0.6349 },
  { name: 'Constantine (قسنطينة)', lat: 36.3650, lng: 6.6147 },
  { name: 'Annaba (عنابة)', lat: 36.9000, lng: 7.7667 },
  { name: 'Blida (البليدة)', lat: 36.4700, lng: 2.8300 },
  { name: 'Setif (سطيف)', lat: 36.1911, lng: 5.4137 },
  { name: 'Tlemcen (تلمسان)', lat: 34.8783, lng: -1.3150 },
  { name: 'Batna (باتنة)', lat: 35.5559, lng: 6.1743 },
];

export const WebPinDropMap: React.FC<WebPinDropMapProps> = ({
  initialLat = 36.7538,
  initialLng = 3.0588,
  onPinChange,
  height = '240px',
  lang = 'en',
}) => {
  const [coords, setCoords] = useState<{ lat: number; lng: number }>({ lat: initialLat, lng: initialLng });
  const [locating, setLocating] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement | null>(null);

  const mapHtml = useMemo(() => {
    return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
<style>
  html, body, #map { height: 100%; margin: 0; padding: 0; background: #0F172A; }
  .leaflet-container { background: #0F172A; font-family: sans-serif; }
  .custom-pin {
    background: #F59E0B;
    border: 2px solid #FFFFFF;
    border-radius: 50%;
    width: 20px;
    height: 20px;
    box-shadow: 0 0 10px rgba(245, 158, 11, 0.6);
  }
</style>
</head>
<body>
<div id="map"></div>
<script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
<script>
  var lat = ${coords.lat};
  var lng = ${coords.lng};
  var map = L.map('map', { zoomControl: true, attributionControl: false }).setView([lat, lng], 13);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19 }).addTo(map);

  var pinIcon = L.divIcon({ className: 'custom-pin', iconSize: [20, 20], iconAnchor: [10, 10] });
  var marker = L.marker([lat, lng], { draggable: true, icon: pinIcon }).addTo(map);

  function notify(l1, l2) {
    if (window.parent) {
      window.parent.postMessage(JSON.stringify({ type: 'PIN_LOCATION', lat: l1, lng: l2 }), '*');
    }
  }

  marker.on('dragend', function (e) {
    var pos = marker.getLatLng();
    notify(pos.lat, pos.lng);
  });

  map.on('click', function (e) {
    marker.setLatLng(e.latlng);
    notify(e.latlng.lat, e.latlng.lng);
  });

  window.addEventListener('message', function(event) {
    try {
      var data = typeof event.data === 'string' ? JSON.parse(event.data) : event.data;
      if (data && data.type === 'SET_CENTER') {
        map.setView([data.lat, data.lng], 14);
        marker.setLatLng([data.lat, data.lng]);
      }
    } catch(e) {}
  });
</script>
</body>
</html>`;
  }, []);

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      try {
        const data = typeof event.data === 'string' ? JSON.parse(event.data) : event.data;
        if (data && data.type === 'PIN_LOCATION' && typeof data.lat === 'number' && typeof data.lng === 'number') {
          setCoords({ lat: data.lat, lng: data.lng });
          onPinChange(data.lat, data.lng);
        }
      } catch (err) {}
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [onPinChange]);

  const setCenterOnMap = (lat: number, lng: number) => {
    setCoords({ lat, lng });
    onPinChange(lat, lng);
    if (iframeRef.current && iframeRef.current.contentWindow) {
      iframeRef.current.contentWindow.postMessage(
        JSON.stringify({ type: 'SET_CENTER', lat, lng }),
        '*'
      );
    }
  };

  const handleLocateMe = () => {
    if (!navigator.geolocation) return;
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCenterOnMap(pos.coords.latitude, pos.coords.longitude);
        setLocating(false);
      },
      () => setLocating(false),
      { enableHighAccuracy: true, timeout: 5000 }
    );
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 text-xs text-amber-400 font-medium">
          <MapPin className="w-3.5 h-3.5" />
          <span>
            {lang === 'ar' ? 'حدد موقع الخدمة على الخريطة' : lang === 'fr' ? 'Épinglez le lieu du service sur la carte' : 'Pin service location on map'}
          </span>
        </div>

        <button
          type="button"
          onClick={handleLocateMe}
          disabled={locating}
          className="px-2.5 py-1 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 text-[11px] font-semibold flex items-center gap-1 transition-colors"
        >
          <Navigation className={`w-3 h-3 ${locating ? 'animate-spin' : ''}`} />
          <span>{locating ? 'Locating...' : 'My Location (GPS)'}</span>
        </button>
      </div>

      {/* Map City Quick Selector */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-[11px] no-scrollbar">
        <span className="text-slate-500 shrink-0 font-medium">Quick Jump:</span>
        {ALGERIA_CITIES.map((c) => (
          <button
            key={c.name}
            type="button"
            onClick={() => setCenterOnMap(c.lat, c.lng)}
            className="px-2 py-0.5 bg-slate-900 border border-slate-800 hover:border-amber-500/50 rounded-md text-slate-300 hover:text-white shrink-0 transition-colors"
          >
            {c.name}
          </button>
        ))}
      </div>

      {/* Embedded Leaflet Map */}
      <div className="relative rounded-xl overflow-hidden border border-slate-800 bg-slate-950 shadow-inner">
        <iframe
          ref={iframeRef}
          title="Service Location Map"
          srcDoc={mapHtml}
          style={{ width: '100%', height }}
          className="border-0 block"
        />
        <div className="absolute bottom-2 left-2 bg-slate-900/90 backdrop-blur-md px-2.5 py-1 rounded-md border border-slate-800 text-[10px] text-slate-300 font-mono shadow-md">
          📍 {coords.lat.toFixed(5)}, {coords.lng.toFixed(5)}
        </div>
      </div>
    </div>
  );
};
