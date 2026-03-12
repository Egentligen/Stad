const swedenBoundingBox = { minLat: 55, minLng: 11, maxLat: 69, maxLng: 24 };

const mapImage = document.getElementById("swedenMap");
const markerLayer = document.getElementById("markerLayer");
const imageBox = document.getElementById("imageBox");
const cityInfo = document.getElementById("cityInfo");
const zoomIn = document.getElementById("zoomIn");
const zoomOut = document.getElementById("zoomOut");

let cities = [];
let zoomLevel = 1, panX = 0, panY = 0;
let isDragging = false, startX, startY;

// Load city data
async function loadCities() {
    const res = await fetch("data/swedenCities.json");
    cities = await res.json();
    cityInfo.innerHTML = `<p>Loaded ${cities.length} cities</p>`;
}
loadCities();

// -------------------
// Panning (click and drag anywhere in imageBox)
// -------------------
imageBox.addEventListener("mousedown", e => {
    isDragging = true;
    startX = e.clientX - panX;
    startY = e.clientY - panY;
    imageBox.classList.add("dragging");
});
window.addEventListener("mousemove", e => {
    if (!isDragging) return;
    panX = e.clientX - startX;
    panY = e.clientY - startY;
    updateTransform();
});
window.addEventListener("mouseup", () => {
    isDragging = false;
    imageBox.classList.remove("dragging");
});

// -------------------
// Zoom buttons
// -------------------
zoomIn.addEventListener("click", () => { zoomLevel *= 1.2; updateTransform(); });
zoomOut.addEventListener("click", () => { zoomLevel /= 1.2; updateTransform(); });

// -------------------
// Update map & marker transform
// -------------------
function updateTransform() {
    mapImage.style.transform = `translate(${panX}px, ${panY}px) scale(${zoomLevel})`;
    markerLayer.style.transform = `translate(${panX}px, ${panY}px) scale(${zoomLevel})`;
}

// -------------------
// Lat/lng -> displayed image position
// -------------------
function latLngToImagePosition(lat, lng) {
    const img = mapImage;

    const imgAspect = img.naturalWidth / img.naturalHeight;
    const boxAspect = img.clientWidth / img.clientHeight;

    let displayWidth, displayHeight, offsetX, offsetY;

    if (imgAspect > boxAspect) {
        displayWidth = img.clientWidth;
        displayHeight = displayWidth / imgAspect;
        offsetX = 0;
        offsetY = (img.clientHeight - displayHeight) / 2;
    } else {
        displayHeight = img.clientHeight;
        displayWidth = displayHeight * imgAspect;
        offsetX = (img.clientWidth - displayWidth) / 2;
        offsetY = 0;
    }

    const xRatio = (lng - swedenBoundingBox.minLng) / (swedenBoundingBox.maxLng - swedenBoundingBox.minLng);
    const yRatio = 1 - (lat - swedenBoundingBox.minLat) / (swedenBoundingBox.maxLat - swedenBoundingBox.minLat);

    return {
        x: xRatio * displayWidth + offsetX,
        y: yRatio * displayHeight + offsetY
    };
}

// -------------------
// Show marker
// -------------------
function showMarker(city) {
    markerLayer.innerHTML = "";
    const pos = latLngToImagePosition(city.lat, city.lng);
    const marker = document.createElement("div");
    marker.className = "marker";
    marker.style.left = pos.x + "px";
    marker.style.top = pos.y + "px";
    markerLayer.appendChild(marker);

    cityInfo.innerHTML = `
        <h2>${city.name}</h2>
        <p><strong>Population:</strong> ${city.population}</p>
        <p><strong>Coordinates:</strong> ${city.lat.toFixed(4)}, ${city.lng.toFixed(4)}</p>
    `;
}

// -------------------
// Search
// -------------------
document.getElementById("searchButton").addEventListener("click", () => {
    const name = document.getElementById("cityInput").value.trim().toLowerCase();
    const city = cities.find(c => c.name.toLowerCase() === name);
    if (!city) return alert("City not found");
    showMarker(city);
});