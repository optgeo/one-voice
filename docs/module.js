import {
  YAML
} from "https://code4sabae.github.io/js/YAML.js"

const addStyleSheet = (href) => {
  const link = document.createElement("link")
  link.href = href
  link.rel = "stylesheet"
  document.head.appendChild(link)
}
const addScript = (src) => {
  const sc = document.createElement("script")
  sc.src = src
  document.head.appendChild(sc)
}
const init = () => {
  addStyleSheet("https://api.tiles.mapbox.com/mapbox-gl-js/v2.1.1/mapbox-gl.css")
  addScript("https://api.tiles.mapbox.com/mapbox-gl-js/v2.1.1/mapbox-gl.js")
  //addScript("https://unpkg.com/intersection-observer@0.5.1/intersection-observer.js");
  //addScript("https://unpkg.com/scrollama");

  const map = document.createElement("div")
  map.id = "map"
  document.body.appendChild(map)
}
init();

const process = async (config) => {
  return new Promise(async (resolve) => {
    config.theme = 'light';
    config.showMarkers = false;
    const urlParams = new URLSearchParams(window.location.search);
    if (config.allowExternalSotry && urlParams.has('story')) {
      config.chapters = window.location.search.split('story=')[1]
      // specify map title
      if (urlParams.has('title')) {
        config.title = urlParams.get('title')
      }
      // specify default zoom level
      if (urlParams.has('zoom')) {
        config.defaultZoom = parseInt(urlParams.get('zoom'))
      }
    }
    // load data from another file
    if (typeof config.chapters === 'string') {
      const url = config.chapters;
      if (url.endsWith('.tsv') || url.endsWith('output=tsv')) {
        config.chapters = await fetchTsv(url);
      } else if (url.endsWith(".yml")) {
        const yml = await (await fetch(url)).text();
        config.chapters = YAML.parse(yml);
      } else if (url.endsWith(".toml")) {
        const yml = await (await fetch(url)).text();
        config.chapters = TOML.parse(yml);
      } else if (url.endsWith(".csv")) {
        const csv = await CSV.fetch(url);
        config.chapters = CSV.toJSON(csv);
      }
    }
    config.chapters = createChapters(config.chapters, config.defaultZoom || 10);
    resolve(config)
  });
};

const getYAML = () => {
  const sc = document.querySelectorAll("script");
  for (const s of sc) {
    if (s.type == "text/yaml") {
      return s.textContent;
    }
  }
  return null;
};
const main = async () => {
  const yml = getYAML();
  if (!yml) {
  } else {
    const config = await process(YAML.parse(yml))
    console.log(config)
    if (typeof mapboxgl !== 'undefined' && typeof scrollama !== 'undefined') {
      showMap(config);
    } else {
      window.onload = () => {
        showMap(config);
      }
    }
  }
};
main();
