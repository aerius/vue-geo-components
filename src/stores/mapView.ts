import { defineStore } from "pinia";
import { ref } from "vue";

/**
 * Shared view state for maps in the library. Kept intentionally small for the
 * bootstrap; real layer/interaction state lands when map code is migrated.
 */
export const useMapViewStore = defineStore("aerius-map-view", () => {
  const center = ref<[number, number]>([155000, 463000]);
  const zoom = ref(3);

  function setCenter(next: [number, number]): void {
    center.value = next;
  }

  function setZoom(next: number): void {
    zoom.value = next;
  }

  return { center, zoom, setCenter, setZoom };
});
