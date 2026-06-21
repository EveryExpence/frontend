import React, { useRef, useState, useCallback, useEffect } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useExpenseRecords } from '@/hooks/use-expense-records';
import { Coordinates } from '@/types/data/location';
import { useTranslation } from 'react-i18next';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';
import * as Location from 'expo-location';

let WebView: any = null;

try {
  ({ WebView } = require('react-native-webview'));
} catch {
  WebView = null;
}

interface ExpenseMapWidgetProps {
  accountId?: string;
  setScrollEnabled?: (enabled: boolean) => void;
}

const ExpenseMapWidgetComponent: React.FC<ExpenseMapWidgetProps> = ({ accountId, setScrollEnabled }) => {
  const { records, loading, error } = useExpenseRecords(accountId);
  const { t } = useTranslation();
  const webViewRef = useRef<any>(null);
  const scheme = useColorScheme() ?? 'light';
  const colors = Colors[scheme];
  const [isFetching, setIsFetching] = useState(false);

  const locations = React.useMemo(() => {
    return records
      .filter(r => r.location)
      .map(r => {
        try {
          const [lat, lng] = r.location!.split(';');
          if (!lat || !lng) return null;
          return {
            id: r.id,
            title: r.title,
            amount: r.amount,
            currency: r.currency,
            dateLabel: r.dateLabel,
            categoryName: r.categoryName,
            paymentMethodName: r.paymentMethodName,
            coords: {
              latitude: parseFloat(lat),
              longitude: parseFloat(lng),
            } as Coordinates
          };
        } catch {
          return null;
        }
      })
      .filter(l => l !== null) as { id: string, title: string, amount: number, currency: string, dateLabel: string, categoryName: string, paymentMethodName: string, coords: Coordinates }[];
  }, [records]);

  const getCurrentLocation = useCallback(async () => {
    setIsFetching(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') return;

      const { coords } = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced
      });

      webViewRef.current?.injectJavaScript(`window.focusLocation(${coords.latitude}, ${coords.longitude}); true;`);
    } catch {} finally {
      setIsFetching(false);
    }
  }, []);

  useEffect(() => {
    if (webViewRef.current) {
        if (locations.length > 0) {
            webViewRef.current.injectJavaScript(`window.setMarkers(${JSON.stringify(locations)}); true;`);
        } else {
            webViewRef.current.injectJavaScript("window.clearMarkers(); true;");
        }
    }
  }, [locations]);

  if (loading || error || locations.length === 0) {
    return null;
  }

  const mapHtml = `
  <!DOCTYPE html>
  <html>
  <head>
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
  <style>
    body { padding: 0; margin: 0; } 
    html, body, #map { height: 100%; width: 100%; }
    .custom-div-icon {
        background: transparent;
        border: none;
        display: flex;
        align-items: center;
        justify-content: center;
    }
  </style>
  </head>
  <body>
  <div id="map"></div>
  <script>
  document.addEventListener('touchstart', () => window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'touchstart' })));
  document.addEventListener('touchend', () => window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'touchend' })));
  document.addEventListener('touchcancel', () => window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'touchend' })));

  const map = L.map('map', { dragging: true, touchZoom: true, zoomControl: true }).setView([51.7592, 19.4559], 13);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19 }).addTo(map);
  
  let markersLayer = L.featureGroup().addTo(map);

  window.clearMarkers = () => {
      markersLayer.clearLayers();
  };

  window.setMarkers = (locations) => {
    window.clearMarkers();
    if (!locations || locations.length === 0) return;
    
    const newMarkers = [];
    locations.forEach(loc => {
      const iconHtml = '<div style="font-size: 24px;">💸</div>';
      const customIcon = L.divIcon({ html: iconHtml, className: 'custom-div-icon', iconSize: [30, 30], iconAnchor: [15, 15] });
      const marker = L.marker([loc.coords.latitude, loc.coords.longitude], { icon: customIcon });
      marker.bindPopup("<b>" + loc.title + "</b><br>" + loc.categoryName + " - " + loc.paymentMethodName + "<br>" + loc.dateLabel + "<br>" + loc.amount + " " + loc.currency);
      markersLayer.addLayer(marker);
      newMarkers.push([loc.coords.latitude, loc.coords.longitude]);
    });
    
    if (newMarkers.length > 0) {
        const bounds = new L.LatLngBounds(newMarkers);
        map.fitBounds(bounds, { padding: [20, 20], maxZoom: 15 });
    }
  }

  window.focusLocation = (lat, lng) => {
    map.setView([lat, lng], 15);
  }
  </script>
  </body>
  </html>
  `;

  const handleLoadEnd = () => {
      if (locations.length > 0) {
          webViewRef.current?.injectJavaScript(`window.setMarkers(${JSON.stringify(locations)}); true;`);
      }
  };



  const onMessage = (event: any) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      if (data.type === 'touchstart') setScrollEnabled?.(false);
      if (data.type === 'touchend') setScrollEnabled?.(true);
    } catch { }
  };

  return (
    <View className="w-full mb-8">
      <View className="flex-row justify-between items-center mb-2 px-1">
        <Text className="text-[20px] text-theme-text font-bold">{t("dashboard.expense_locations", "Expense Map")}</Text>

        <TouchableOpacity
          onPress={getCurrentLocation}
          className="flex-row items-center bg-theme-surface px-3 py-2 rounded-md"
          disabled={isFetching}
        >
          {isFetching ? (
            <ActivityIndicator size="small" color={colors.text} />
          ) : (
            <>
              <MaterialCommunityIcons name="crosshairs-gps" size={18} color={colors.text} />
              <Text className="text-theme-text ml-2">{t("new_expense.get_current", "Get Current Location")}</Text>
            </>
          )}
        </TouchableOpacity>
      </View>

      <View className={`w-full h-[400px] rounded-xl overflow-hidden bg-theme-surface border border-transparent ${!WebView ? 'items-center justify-center px-4' : ''}`}>
          {WebView ? (
              <WebView
                  ref={webViewRef}
                  style={{ flex: 1, width: '100%', height: '100%' }}
                  originWhitelist={['*']}
                  source={{ html: mapHtml }}
                  onLoadEnd={handleLoadEnd}
                  onMessage={onMessage}
                  scrollEnabled={false}
                  showsVerticalScrollIndicator={false}
                  showsHorizontalScrollIndicator={false}
              />
          ) : (
              <View className="items-center gap-3 justify-center flex-1">
                  <MaterialCommunityIcons name="map-outline" size={34} color={colors.icon} />
                  <Text className="text-center text-theme-text">
                      {t("new_expense.map_unavailable", "Map unavailable")}
                  </Text>
              </View>
          )}
      </View>
    </View>
  );
};

ExpenseMapWidgetComponent.displayName = 'ExpenseMapWidget';
export const ExpenseMapWidget = React.memo(ExpenseMapWidgetComponent);
