import { useState, useEffect, useCallback } from "react";

import {
  CloudSun,
  MapPin,
  Search,
  MapPinOff,
  CloudRain,
  CloudSnow,
  CloudLightning,
  Sun,
  Cloud,
  Loader2,
} from "lucide-react";

const OWM_API_KEY = "b286e5ac1f42b84a2886722a20217363";

type WeatherData = {
  temp: number;
  condition: string;
  city: string;
  icon: string;
};

const getWeatherSuggestions = (weather: WeatherData | null) => {
  if (!weather) return [];
  const c = weather.condition.toLowerCase();
  
  if (weather.temp >= 32) {
    return [
      "💧 Drink plenty of water",
      "🧢 Wear cap or use umbrella",
      "🏠 Avoid going outside during peak sun (12PM–3PM)",
      "👕 Wear light cotton clothes",
      "🧴 Use sunscreen",
      "🍉 Eat fruits with high water content",
    ];
  }
  if (c.includes("rain") || c.includes("drizzle") || c.includes("thunder")) {
    return [
      "☔ Carry an umbrella or raincoat",
      "👟 Avoid slippery areas",
      "🦠 Stay away from dirty water",
      "🧥 Keep extra clothes if needed",
      "🚶 Walk carefully on wet roads",
      "📱 Protect your phone from water",
    ];
  }
  if (c.includes("haze") || c.includes("mist") || c.includes("fog") || c.includes("smoke") || c.includes("dust")) {
    return [
      "😷 Wear a mask outdoors",
      "🚫 Avoid heavy outdoor activity",
      "🪟 Keep windows closed",
      "💧 Stay hydrated",
      "🌿 Use air purifier if possible",
    ];
  }
  if (c.includes("snow") || weather.temp <= 15) {
    return [
      "🧥 Wear warm clothes",
      "☕ Drink warm fluids",
      "🛌 Keep yourself covered",
      "🚿 Avoid very cold water",
      "🧦 Wear socks indoors",
    ];
  }
  return [
    "🚶 Go for a walk",
    "🌳 Enjoy fresh air",
    "🧘 Do light exercise",
    "📖 Spend time outdoors",
  ];
};

const WeatherAnimations = ({ condition }: { condition?: string }) => {
  if (!condition) return null;
  const c = condition.toLowerCase();

  return (
    <div className="absolute -inset-4 z-0 overflow-hidden pointer-events-none rounded-3xl opacity-60 dark:opacity-40">
      {c.includes("rain") || c.includes("drizzle") ? (
        <div className="absolute inset-0 flex justify-around">
           {[...Array(12)].map((_, i) => (
             <div key={i} className="w-0.5 h-16 bg-blue-300 dark:bg-blue-400/50" style={{ 
               animation: `fallRain ${0.6 + Math.random() * 0.4}s linear infinite`,
               animationDelay: `${Math.random()}s`
             }} />
           ))}
           <style>{`
             @keyframes fallRain {
               0% { transform: translateY(-100px); opacity: 0; }
               20% { opacity: 0.8; }
               80% { opacity: 0.8; }
               100% { transform: translateY(300px); opacity: 0; }
             }
           `}</style>
        </div>
      ) : c.includes("clear") ? (
        <div className="absolute -top-12 -right-12 w-40 h-40 bg-yellow-300/40 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '4s' }} />
      ) : c.includes("cloud") ? (
        <div className="absolute top-0 w-[200%] flex justify-between opacity-30" style={{ animation: 'floatCloud 20s linear infinite alternate' }}>
            <Cloud size={64} className="text-slate-400" />
            <Cloud size={96} className="text-slate-300 ml-16 mt-8" />
            <Cloud size={48} className="text-slate-200 ml-8 mt-2" />
            <style>{`
             @keyframes floatCloud {
               0% { transform: translateX(-10%); }
               100% { transform: translateX(10%); }
             }
           `}</style>
        </div>
      ) : c.includes("haze") || c.includes("mist") || c.includes("fog") || c.includes("dust") ? (
        <div className="absolute inset-0 bg-gradient-to-t from-slate-300/50 to-transparent blur-xl" style={{ animation: 'fogFloat 8s ease-in-out infinite' }}>
            <style>{`
             @keyframes fogFloat {
               0% { transform: translateX(-5%) translateY(0); opacity: 0.3; }
               50% { transform: translateX(5%) translateY(-5%); opacity: 0.7; }
               100% { transform: translateX(-5%) translateY(0); opacity: 0.3; }
             }
           `}</style>
        </div>
      ) : null}
    </div>
  );
};

export const WeatherWidget = () => {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isManualMode, setIsManualMode] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");

  const [locationDenied, setLocationDenied] = useState(false);

  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Debounce search query and fetch suggestions
  useEffect(() => {
    const handler = setTimeout(async () => {
      setDebouncedQuery(searchQuery);
      if (searchQuery.trim().length > 2 && isManualMode) {
        try {
          const res = await fetch(`https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(searchQuery)}&limit=5&appid=${OWM_API_KEY}`);
          const data = await res.json();
          setSuggestions(data || []);
          setShowSuggestions(true);
        } catch (e) {
          setSuggestions([]);
        }
      } else {
        setSuggestions([]);
        setShowSuggestions(false);
      }
    }, 500);
    return () => clearTimeout(handler);
  }, [searchQuery, isManualMode]);

  const fetchWeather = useCallback(async (url: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error("Weather data not found");
      const data = await res.json();
      setWeather({
        temp: Math.round(data.main.temp),
        condition: data.weather[0].main,
        city: data.name,
        icon: data.weather[0].icon,
      });
      setLoading(false);
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  }, []);

  const fetchWeatherByCoords = useCallback(
    (lat: number, lon: number, locationNameOverride?: string) => {
      const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${OWM_API_KEY}&units=metric`;
      fetchWeather(url).then(async () => {
        // Also fetch reverse geocoding to broadcast full name if not overridden
        let finalName = locationNameOverride;
        if (!finalName) {
            try {
                const res = await fetch(`https://api.openweathermap.org/geo/1.0/reverse?lat=${lat}&lon=${lon}&limit=1&appid=${OWM_API_KEY}`);
                const data = await res.json();
                if (data && data.length > 0) {
                    finalName = [data[0].name, data[0].state, data[0].country].filter(Boolean).join(", ");
                }
            } catch (e) {}
        }
        if (finalName) {
            window.dispatchEvent(new CustomEvent('elder-location-change', { detail: { locationName: `📍 ${finalName}` } }));
        }
      });
    },
    [fetchWeather]
  );

  const fetchWeatherByCity = useCallback(
    (city: string) => {
      const url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(
        city
      )}&appid=${OWM_API_KEY}&units=metric`;
      fetchWeather(url).then(() => {
          window.dispatchEvent(new CustomEvent('elder-location-change', { detail: { locationName: `📍 ${city}` } }));
      });
    },
    [fetchWeather]
  );

  const handleSuggestionSelect = (sug: any) => {
      const finalName = [sug.name, sug.state, sug.country].filter(Boolean).join(", ");
      setSearchQuery(finalName);
      setSuggestions([]);
      setShowSuggestions(false);
      fetchWeatherByCoords(sug.lat, sug.lon, finalName);
  };

  // Initial and Auto-Update Logic
  useEffect(() => {
    if (isManualMode) {
      if (debouncedQuery.trim() !== "") {
        fetchWeatherByCity(debouncedQuery);
      }
      return;
    }

    const getLocationAndWeather = () => {
      if (!navigator.geolocation) {
        setLocationDenied(true);
        setIsManualMode(true);
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocationDenied(false);
          fetchWeatherByCoords(position.coords.latitude, position.coords.longitude);
        },
        (err) => {
          console.warn("Geolocation Error:", err);
          setLocationDenied(true);
          setIsManualMode(true);
          if (!weather) {
            fetchWeatherByCity("New York"); // Fallback
          }
        }
      );
    };

    getLocationAndWeather();

    // Refresh every 15 minutes
    const interval = setInterval(getLocationAndWeather, 15 * 60 * 1000);
    return () => clearInterval(interval);
  }, [isManualMode, debouncedQuery, fetchWeatherByCoords, fetchWeatherByCity]);

  // Map Condition to Icon
  const renderIcon = () => {
    if (loading) return <Loader2 size={32} className="animate-spin" />;
    if (!weather) return <CloudSun size={32} />;
    const c = weather.condition.toLowerCase();
    if (c.includes("rain") || c.includes("drizzle")) return <CloudRain size={32} />;
    if (c.includes("snow")) return <CloudSnow size={32} />;
    if (c.includes("thunder")) return <CloudLightning size={32} />;
    if (c.includes("clear")) return <Sun size={32} />;
    if (c.includes("cloud")) return <Cloud size={32} />;
    return <CloudSun size={32} />;
  };

  return (
    <div className="flex flex-col justify-between h-full space-y-3 relative">
      <WeatherAnimations condition={weather?.condition} />
      
      <div className="flex items-start justify-between relative z-10">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <p className="text-sky-800 dark:text-sky-200 font-bold uppercase text-xs tracking-wider">
              Weather
            </p>
            {loading && <span className="flex w-2 h-2 rounded-full bg-sky-400 animate-pulse" />}
          </div>

          <div className="min-h-[48px]">
            {error && <p className="text-xs text-rose-500 font-medium">{error}</p>}
            {!error && weather && (
              <>
                <p className="text-3xl sm:text-4xl font-bold text-slate-800 dark:text-white flex items-end gap-1">
                  {weather.temp}°C
                  <span className="text-base text-slate-500 dark:text-slate-300 font-medium pb-1">
                    {weather.condition}
                  </span>
                </p>
                <p className="text-[10px] text-sky-700 dark:text-sky-300 mt-1 uppercase font-semibold flex items-center gap-1">
                  {isManualMode ? <MapPinOff size={10} /> : <MapPin size={10} />}
                  {weather.city}
                </p>
              </>
            )}
          </div>
        </div>
        <div className="p-3 bg-white/50 dark:bg-sky-800/50 rounded-2xl text-sky-600 dark:text-sky-100 shadow-sm border border-white/20 shrink-0">
          {renderIcon()}
        </div>
      </div>

      {/* Smart Suggestions */}
      {!error && weather && (
        <div className="relative z-10 flex-1 min-h-0 overflow-y-auto pr-1 animate-in fade-in slide-in-from-bottom-2 duration-700 scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-700">
          <ul className="text-[11px] sm:text-[11.5px] space-y-1.5 text-slate-700 dark:text-slate-300 font-medium pb-1 leading-tight">
            {getWeatherSuggestions(weather).map((suggestion, idx) => (
              <li key={idx} className="flex items-start gap-1 leading-tight">
                {suggestion}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Manual Controls */}
      <div className="pt-2 border-t border-sky-200 dark:border-sky-800/50 relative z-10 shrink-0">
        {!isManualMode ? (
          <button
            onClick={() => setIsManualMode(true)}
            className="text-[10px] uppercase font-bold text-sky-600 dark:text-sky-300 hover:text-sky-800 dark:hover:text-white flex items-center gap-1 transition-colors"
          >
            <Search size={12} /> Search Location
          </button>
        ) : (
          <div className="space-y-2">
            <div className="relative">
              <input
                type="text"
                placeholder="Enter city name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full text-xs py-1.5 pl-7 pr-2 rounded-md bg-white/50 dark:bg-slate-800/50 border border-sky-300 dark:border-slate-600 text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-sky-500 transition-all font-medium"
              />
              <Search
                size={12}
                className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400"
              />
              {showSuggestions && suggestions.length > 0 && (
                <ul className="absolute z-50 w-full mt-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md shadow-lg overflow-hidden">
                  {suggestions.map((sug, idx) => {
                    const fullName = [sug.name, sug.state, sug.country].filter(Boolean).join(", ");
                    return (
                      <li
                        key={idx}
                        onClick={() => handleSuggestionSelect(sug)}
                        className="px-3 py-2 text-xs text-slate-700 dark:text-slate-300 hover:bg-sky-50 dark:hover:bg-slate-700 cursor-pointer truncate transition-colors"
                      >
                        {fullName}
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
            <button
              onClick={() => {
                setIsManualMode(false);
                setSearchQuery("");
                if (locationDenied) {
                  // If location denied, prompt or handle gracefully
                  alert("Location access is denied. Please enable it in your browser.");
                }
              }}
              className="text-[10px] uppercase font-bold text-sky-600 dark:text-sky-300 hover:text-sky-800 dark:hover:text-white flex items-center gap-1 transition-colors"
            >
              <MapPin size={12} /> Use My Location
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
