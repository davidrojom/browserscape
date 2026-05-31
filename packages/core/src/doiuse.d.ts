declare module "doiuse/lib/DoIUse.js" {
  import type { Plugin } from "postcss";

  interface DoIUseOptions {
    browsers?: string[];
    ignore?: string[];
    ignoreFiles?: string[];
    onFeatureUsage?: (usageInfo: unknown) => void;
  }

  class DoIUse {
    constructor(options?: DoIUseOptions);
    postcss: Plugin;
  }

  export default DoIUse;
}
