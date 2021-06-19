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
  addStyleSheet("style.css")
  addStyleSheet("https://api.tiles.mapbox.com/mapbox-gl-js/v2.1.1/mapbox-gl.css")
  addScript("https://api.tiles.mapbox.com/mapbox-gl-js/v2.1.1/mapbox-gl.js")
  const map = document.createElement("div")
  map.id = "map"
  document.body.appendChild(map)
}
init()

const getYAML = () => {
  const sc = document.querySelectorAll("script");
  for (const s of sc) {
    if (s.type == "text/yaml") {
      return s.textContent
    }
  }
  return null
}
const showMap = async (texts) => {
  // The original version is https://github.com/indigo-lab/plateau-tokyo23ku-building-mvt-2020. Thanks!
  const style = await (await fetch("https://gsi-cyberjapan.github.io/gsivectortile-3d-like-building/building3d.json")).json()
  for (const layer of style.layers) {
    if (layer.maxzoom >= 17) layer.maxzoom = 24
  }
  style.sources.h = {
    maxzoom: 13,
    minzoom: 3,
    tileSize: 512,
    tiles: [
      "https://optgeo.github.io/10b512-7-113-50/zxy/{z}/{x}/{y}.webp"
    ],
    type: "raster-dem"
  }
  style.sources.v = {
    type: "vector",
    tiles: [
      "https://optgeo.github.io/unite-one/zxy/{z}/{x}/{y}.pbf"
    ],
    attribution: "国土地理院ベクトルタイル提供実験",
    minzoom: 10,
    maxzoom: 12
  }

  style.layers.unshift({
    "id": "one",
    "paint": {
      "fill-color": [
        "match",
        [
          "get",
          "code"
        ],
        "山地",
        "#d9cbae",
        "崖・段丘崖",
        "#9466ab",
        "地すべり地形",
        "#cc99ff",
        "台地・段丘",
        "#ffaa00",
        "山麓堆積地形",
        "#99804d",
        "扇状地",
        "#cacc60",
        "自然堤防",
        "#ffff33",
        "天井川",
        "#fbe09d",
        "砂州・砂丘",
        "#ffff99",
        "凹地・浅い谷",
        "#a3cc7e",
        "氾濫平野",
        "#bbff99",
        "後背低地・湿地",
        "#00d1a4",
        "旧河道",
        "#6699ff",
        "落堀",
        "#1f9999",
        "河川敷・浜",
        "#9f9fc4",
        "水部",
        "#e5ffff",
        "旧水部",
        "#779999",
        "#f00"
      ]
    },
    "source": "v",
    "source-layer": "one",
    "type": "fill"
  })

  style.layers.unshift({
    id: "background",
    paint: {
      "background-color": [
        "rgb",
        255,
        255,
        255
      ]
    },
    type: "background"
  })

  style.layers.unshift({
    id: "sky",
    paint: {
      "sky-type": "atmosphere"
    },
    type: "sky"
  })

  // 地形を立ち上げる
  style.terrain = {
    source: "h"
  }

  // 霞を入れる
  style.fog = {
    range: [-2, 10],
    color: [
      "rgb",
      255,
      255,
      255
    ],
    "horizon-blend": 0.1
  }

  mapboxgl.accessToken = 'pk.eyJ1IjoiaGZ1IiwiYSI6ImlRSGJVUTAifQ.rTx380smyvPc1gUfZv1cmw';
  let map = new mapboxgl.Map({
    container: "map",
    center: [139.68786, 35.68355],
    zoom: 14.65,
    pitch: 60,
    bearing: 22,
    hash: true,
    style: style
  })
  map.addControl(new mapboxgl.NavigationControl())
  map.addControl(new mapboxgl.ScaleControl({
    maxWidth: 200, unit: "metric"
  }))

  let voice = null
  for(let v of speechSynthesis.getVoices()) {
    console.log(v)
    if (v.name == "Kyoko") voice = v
  }

  map.on('load', function() {
    console.log(speechSynthesis.getVoices())
    map.on('click', 'one', function(e) {
      let utterance = new SpeechSynthesisUtterance()
      utterance.lang = "ja-JP"
      utterance.text = texts[e.features[0].properties.code]
      if (voice) utterance.voice = voice
      speechSynthesis.cancel()
      speechSynthesis.speak(utterance)
    })
  })
}

const main = async () => {
  const texts = await YAML.parse(getYAML())
  if (typeof mapboxgl !== 'undefined') {
    showMap(texts)
  } else {
    window.onload = () => {
      showMap(texts)
    }
  }
}
main()
