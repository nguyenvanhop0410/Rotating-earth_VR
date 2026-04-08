export function initControlPanel({
  settings,
  renderer,
  keySunLight,
  getPerformanceMode,
  setPerformanceMode,
  getStarsEnabled,
  setStarsEnabled,
  getLabelsEnabled,
  setLabelsEnabled,
  getCoordinatesMapEnabled,
  setCoordinatesMapEnabled,
  onResetView,
  onViewSatellite,
  onViewMoon,
  onViewSun
}) {
  const panel = document.getElementById('panel');
  if (!panel) return;

  const fmt = (v, digits = 4) => Number(v).toFixed(digits);

  function bindSlider({ id, valueId, get, set, digits }) {
    const input = document.getElementById(id);
    const out = document.getElementById(valueId);
    if (!input || !out) return;

    const update = (val) => {
      out.textContent = fmt(val, digits);
    };

    const initial = get();
    input.value = String(initial);
    update(initial);

    input.addEventListener('input', () => {
      const val = Number(input.value);
      set(val);
      update(val);
    });
  }

  function bindSelect({ id, get, set }) {
    const select = document.getElementById(id);
    if (!select) return;
    const initial = get();
    if (initial) select.value = initial;
    select.addEventListener('change', () => {
      set(select.value);
    });
  }

  function bindToggle({ id, get, set }) {
    const input = document.getElementById(id);
    if (!input) return;
    input.checked = !!get();
    input.addEventListener('change', () => {
      set(input.checked);
    });
  }

  function bindButton({ id, onClick }) {
    const button = document.getElementById(id);
    if (!button) return;
    button.addEventListener('click', onClick);
  }

  function bindToggleButton({ id, get, set, onLabel, offLabel }) {
    const button = document.getElementById(id);
    if (!button) return;

    const updateLabel = () => {
      button.textContent = get() ? onLabel : offLabel;
    };

    updateLabel();
    button.addEventListener('click', () => {
      set(!get());
      updateLabel();
    });
  }

  bindSlider({
    id: 'earthSpin',
    valueId: 'earthSpinVal',
    get: () => settings.earthSpin,
    set: (v) => (settings.earthSpin = v),
    digits: 4
  });

  bindSlider({
    id: 'cloudsSpin',
    valueId: 'cloudsSpinVal',
    get: () => settings.cloudsSpin,
    set: (v) => (settings.cloudsSpin = v),
    digits: 4
  });

  bindSlider({
    id: 'sunKey',
    valueId: 'sunKeyVal',
    get: () => (keySunLight ? keySunLight.intensity : 0),
    set: (v) => {
      if (keySunLight) keySunLight.intensity = v;
    },
    digits: 2
  });

  bindSlider({
    id: 'exposure',
    valueId: 'exposureVal',
    get: () => (renderer ? renderer.toneMappingExposure : 1),
    set: (v) => {
      if (renderer) renderer.toneMappingExposure = v;
    },
    digits: 2
  });

  if (getPerformanceMode && setPerformanceMode) {
    bindSelect({
      id: 'perfMode',
      get: getPerformanceMode,
      set: setPerformanceMode
    });
  }

  if (getStarsEnabled && setStarsEnabled) {
    bindToggle({
      id: 'toggleStars',
      get: getStarsEnabled,
      set: setStarsEnabled
    });
  }

  if (getLabelsEnabled && setLabelsEnabled) {
    bindToggle({
      id: 'toggleLabels',
      get: getLabelsEnabled,
      set: setLabelsEnabled
    });
  }

  if (getCoordinatesMapEnabled && setCoordinatesMapEnabled) {
    bindToggleButton({
      id: 'toggleCoordinatesMap',
      get: getCoordinatesMapEnabled,
      set: setCoordinatesMapEnabled,
      onLabel: 'Tắt chế độ tọa độ',
      offLabel: 'Xem tọa độ'
    });
  }

  if (onResetView) {
    bindButton({ id: 'resetView', onClick: onResetView });
  }

  if (onViewSatellite) {
    bindButton({ id: 'viewSatellite', onClick: onViewSatellite });
  }

  if (onViewMoon) {
    bindButton({ id: 'viewMoon', onClick: onViewMoon });
  }

  if (onViewSun) {
    bindButton({ id: 'viewSun', onClick: onViewSun });
  }
}
