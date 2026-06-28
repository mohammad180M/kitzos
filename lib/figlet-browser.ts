type FigletApi = {
  parseFont: (name: string, data: string) => void;
  text: (
    text: string,
    options: { font: string },
    callback: (err: Error | null, result?: string) => void
  ) => void;
};

let fontsReady: Promise<FigletApi> | null = null;

export function loadFiglet(): Promise<FigletApi> {
  if (!fontsReady) {
    fontsReady = Promise.all([
      import("figlet"),
      import("figlet/importable-fonts/Standard.js"),
      import("figlet/importable-fonts/Slant.js"),
    ]).then(([figletMod, standardMod, slantMod]) => {
      const figlet = (figletMod as { default: FigletApi }).default ?? (figletMod as unknown as FigletApi);
      const standard =
        (standardMod as { default: string }).default ?? (standardMod as unknown as string);
      const slant = (slantMod as { default: string }).default ?? (slantMod as unknown as string);
      figlet.parseFont("Standard", standard);
      figlet.parseFont("Slant", slant);
      return figlet;
    });
  }
  return fontsReady;
}
