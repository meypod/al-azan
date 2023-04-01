export type Page = {
  /** URL can be used in <a href> to link to other templates
   Note: This value will be `false` if `permalink` is set to `false`. */
  url: string;

  /** For permalinks: inputPath filename minus template file extension */
  fileSlug: string;

  /** For permalinks: inputPath minus template file extension */
  filePathStem: string;

  /** JS Date Object for current page (used to sort collections) */
  date: Date;

  /** The path to the original source file for the template
  Note: this will include your input directory path! */
  inputPath: string;

  /** Depends on your output directory (the default is _site)
  You probably won’t use this: `url` is better.
  Note: This value will be `false` if `permalink` is set to `false`. */
  outputPath: string;

  /**  Useful with `page.filePathStem` when using custom file extensions. */
  outputFileExtension: string;

  /** The default is the value of `defaultLanguage` passed to the i18n plugin */
  lang: string;
};
