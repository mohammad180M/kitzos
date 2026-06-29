type FigletApi = {
  parseFont: (name: string, data: string) => void;
  text: (
    text: string,
    options: { font: string },
    callback: (err: Error | null, result?: string) => void
  ) => void;
};

export const FIGLET_FONTS = ["Standard", "Big", "Slant", "Banner", "Block"] as const;
export type FigletFont = (typeof FIGLET_FONTS)[number];

let fontsReady: Promise<FigletApi> | null = null;

export function loadFiglet(): Promise<FigletApi> {
  if (!fontsReady) {
    fontsReady = Promise.all([
      import("figlet"),
      import("figlet/importable-fonts/Standard.js"),
      import("figlet/importable-fonts/Big.js"),
      import("figlet/importable-fonts/Slant.js"),
      import("figlet/importable-fonts/Banner.js"),
      import("figlet/importable-fonts/Block.js"),
    ]).then(([figletMod, standardMod, bigMod, slantMod, bannerMod, blockMod]) => {
      const figlet =
        (figletMod as { default: FigletApi }).default ?? (figletMod as unknown as FigletApi);

      const load = (mod: { default?: string } | string) =>
        (mod as { default: string }).default ?? (mod as unknown as string);

      figlet.parseFont("Standard", load(standardMod));
      figlet.parseFont("Big", load(bigMod));
      figlet.parseFont("Slant", load(slantMod));
      figlet.parseFont("Banner", load(bannerMod));
      figlet.parseFont("Block", load(blockMod));
      return figlet;
    });
  }
  return fontsReady;
}

export function renderFiglet(text: string, font: FigletFont): Promise<string> {
  return loadFiglet().then(
    (figlet) =>
      new Promise((resolve, reject) => {
        figlet.text(text, { font }, (err, data) => {
          if (err || !data) reject(err ?? new Error("figlet failed"));
          else resolve(data);
        });
      })
  );
}
