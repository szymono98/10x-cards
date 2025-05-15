/** @type {import('@cloudflare/next-on-pages').RuntimeConfiguration} */
export default {
  overrides: {
    edge: true,
  },
  buildConfig: {
    enableDynamicWorkers: true,
    useNodeCompat: true,
  },
};
