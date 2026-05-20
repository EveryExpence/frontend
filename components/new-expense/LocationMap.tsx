import { View, Text, useColorScheme, TouchableOpacity, ActivityIndicator } from 'react-native';
import React, { Dispatch, SetStateAction, useState, useRef, useEffect } from 'react';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors } from '@/constants/theme';
import { WebView } from 'react-native-webview';
import * as Location from 'expo-location';
import { Coordinates } from '@/types/data/location';

interface Props {
    location: Coordinates | null;
    setLocation: Dispatch<SetStateAction<Coordinates | null>>;
    setScrollEnabled: Dispatch<SetStateAction<boolean>>;
    disabled?: boolean;
}

const LocationSelection = ({ location, setLocation, setScrollEnabled, disabled }: Props) => {
    const scheme = useColorScheme() ?? 'light';
    const colors = Colors[scheme];
    const webViewRef = useRef<WebView>(null);
    const [isFetching, setIsFetching] = useState(false);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    const isMapLoadedRef = useRef(false);

    useEffect(() => {
        if (!disabled) {
            getCurrentLocation();
        }
    }, [disabled]);

    const mapHtml = `
        <!DOCTYPE html>
        <html>
        <head>
            <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
            <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
            <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
            <style>body { padding: 0; margin: 0; } html, body, #map { height: 100%; width: 100%; }</style>
        </head>
        <body>
            <div id="map"></div>
            <script>
                document.addEventListener('touchstart', () => window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'touchstart' })));
                document.addEventListener('touchend', () => window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'touchend' })));
                document.addEventListener('touchcancel', () => window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'touchend' })));

                const map = L.map('map', { dragging: true }).setView([51.7592, 19.4559], 13);
                L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19 }).addTo(map);

                let marker;
                window.setMarker = (lat, lng) => {
                    if (marker) map.removeLayer(marker);
                    marker = L.marker([lat, lng]).addTo(map);
                }

                map.on('click', (e) => {
                    if (window.disabledMode) return;
                    window.setMarker(e.latlng.lat, e.latlng.lng);
                    window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'coords', latitude: e.latlng.lat, longitude: e.latlng.lng }));
                });

                window.updateMapLocation = (lat, lng) => {
                    map.setView([lat, lng], 15);
                }
            </script>
        </body>
        </html>
    `;

    const onMessage = (event: any) => {
        try {
            const data = JSON.parse(event.nativeEvent.data);
            if (data.type === 'touchstart') setScrollEnabled(false);
            if (data.type === 'touchend') setScrollEnabled(true);
            if (!disabled && data.type === 'coords' && data.latitude && data.longitude) {
                setLocation({ latitude: data.latitude, longitude: data.longitude });
                setErrorMsg(null);
            }
        } catch { }
    };

    const getCurrentLocation = async () => {
        setIsFetching(true);
        setErrorMsg(null);
        try {
            const { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                setErrorMsg('Permission denied');
                return;
            }

            const { coords } = await Location.getCurrentPositionAsync({
                accuracy: Location.Accuracy.Balanced
            });

            if (isMapLoadedRef.current) {
                webViewRef.current?.injectJavaScript(`window.updateMapLocation(${coords.latitude}, ${coords.longitude}); true;`);
            }

            if (location !== null) {
                return;
            }

            setLocation({ latitude: coords.latitude, longitude: coords.longitude });
        } catch (e) {
            setErrorMsg('Failed to fetch location');
        } finally {
            setIsFetching(false);
        }
    };

    const handleLoadEnd = () => {
        isMapLoadedRef.current = true;
        webViewRef.current?.injectJavaScript(`window.disabledMode = ${disabled ? 'true' : 'false'}; true;`);
        if (location !== null) {
            webViewRef.current?.injectJavaScript(`window.updateMapLocation(${location.latitude}, ${location.longitude}); true;`);
            webViewRef.current?.injectJavaScript(`window.setMarker(${location.latitude}, ${location.longitude}); true;`);
        }
    };

    return (
        <View className="w-full mb-8">
            <View className="flex-row justify-between items-center mb-2">
                <Text className="text-2xl text-theme-text font-bold">Location</Text>

                {!disabled && (
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
                                <Text className="text-theme-text ml-2">Get Current</Text>
                            </>
                        )}
                    </TouchableOpacity>
                )}
            </View>

            <View className="w-full h-[400px] rounded-md overflow-hidden bg-theme-surface border border-transparent">
                <WebView
                    ref={webViewRef}
                    originWhitelist={['*']}
                    source={{ html: mapHtml }}
                    onMessage={onMessage}
                    onLoadEnd={handleLoadEnd}
                    scrollEnabled={false}
                    showsVerticalScrollIndicator={false}
                    showsHorizontalScrollIndicator={false}
                />
            </View>

            <View className="flex-row justify-between mt-2">
                <Text className="text-sm text-theme-text opacity-70">
                    {location ? `${location.latitude.toFixed(5)}, ${location.longitude.toFixed(5)}` : "No location selected"}
                </Text>
                {errorMsg && <Text className="text-red-500 text-sm">{errorMsg}</Text>}
            </View>
        </View>
    );
};

export default LocationSelection;