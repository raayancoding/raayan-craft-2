export default class Biome {

    static PLAINS = { name: "Plains", temp: 0.8, humidity: 0.4, treeDensity: 0.5 };
    static DESERT = { name: "Desert", temp: 2.0, humidity: 0.0, treeDensity: 0.0 };
    static FOREST = { name: "Forest", temp: 0.7, humidity: 0.8, treeDensity: 2.2 };
    static MOUNTAINS = { name: "Mountains", temp: 0.5, humidity: 0.4, treeDensity: 0.3 };
    static SNOW = { name: "Snowy Tundra", temp: 0.05, humidity: 0.5, treeDensity: 0.4 };
    static SWAMP = { name: "Swamp", temp: 0.9, humidity: 0.9, treeDensity: 0.6 };
    static JUNGLE = { name: "Jungle", temp: 1.1, humidity: 1.0, treeDensity: 3.0 };

    static getBiome(temp, humidity) {
        if (temp < 0.3) return Biome.SNOW;
        if (temp > 1.3 && humidity < 0.3) return Biome.DESERT;
        if (temp > 0.95 && humidity > 0.85) return Biome.JUNGLE;
        if (temp > 0.8 && humidity > 0.7) return Biome.SWAMP;
        if (humidity > 0.6) return Biome.FOREST;
        if (humidity < 0.25 && temp > 0.7) return Biome.DESERT;
        return Biome.PLAINS;
    }

    static hashNoise(x, z, salt = 0) {
        let h = (x * 374761393 + z * 668265263 + salt * 974634) | 0;
        h = (h ^ (h >> 13)) * 1274126177;
        h = (h ^ (h >> 16)) >>> 0;
        return (h % 10000) / 10000;
    }

    static smoothTemp(x, z) {
        // continental warmth + variation
        const continent = Math.sin(x * 0.004) * Math.cos(z * 0.004);
        const detail = Math.sin(x * 0.02 + 1.7) * Math.cos(z * 0.02 - 0.6);
        return 0.75 + continent * 0.55 + detail * 0.25;
    }

    static smoothHumidity(x, z) {
        const c = Math.sin(x * 0.003 - 0.8) * Math.cos(z * 0.005 + 0.4);
        const d = Math.sin(x * 0.017 + 0.3) * Math.cos(z * 0.019);
        return 0.55 + c * 0.35 + d * 0.2;
    }
}
