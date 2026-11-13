let lifecycle = {
  beforeLoad: [],
  mounted: [],
  destroyed: [],
  beforeMount: [],
  beforeUnmount: []
};

export const getMainLifecycle = () => lifecycle;

export const setMainLifecycle = data => {
  lifecycle = {
    beforeLoad: data.beforeLoad || [],
    mounted: data.mounted || [],
    destroyed: data.destroyed || [],
    beforeMount: data.beforeMount || [],
    beforeUnmount: data.beforeUnmount || []
  };
};
