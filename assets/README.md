# Earth textures (optional)

If you want the Earth to look as realistic as possible, put these files in this folder:

- `earth_day.jpg` (daylight / color map)
- `earth_normal.jpg` (normal map)
- `earth_roughness.jpg` (roughness map, grayscale)
- `earth_specular.jpg` (optional; not directly used by StandardMaterial, but can help you author roughness)
- `earth_night.jpg` (night lights / emissive)
- `earth_clouds.png` (clouds with alpha)

The app will automatically load them. If some files are missing, it falls back to a procedural texture.

## Where to get textures (license-safe)

Prefer public-domain or clearly open-licensed sources.

- NASA Visible Earth / Blue Marble (many datasets are public domain, but always verify the specific dataset page/license note)
- ESA / open data portals (verify usage terms)
- OpenGameArt / CC0 texture packs (verify per-asset)

## Tips

- Use 2K–8K textures for best detail (VR benefits from higher resolution).
- Keep `earth_clouds.png` with transparency (alpha) for the cloud layer.
- If performance drops on mobile VR, start with 2K textures and reduce sphere segments in `index.html`.
