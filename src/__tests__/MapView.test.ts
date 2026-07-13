import { mount } from "@vue/test-utils";
import { describe, expect, it } from "vitest";

import MapView from "@/components/MapView.vue";

describe("MapView", () => {
  it("renders a map container and emits ready with the OpenLayers map", async () => {
    const wrapper = mount(MapView, { attachTo: document.body });

    expect(wrapper.find(".aerius-map-view").exists()).toBe(true);

    // onMounted creates the map and emits it.
    const ready = wrapper.emitted("ready");
    expect(ready).toBeTruthy();
    expect(ready?.[0]?.[0]).toBeDefined();

    wrapper.unmount();
  });
});
