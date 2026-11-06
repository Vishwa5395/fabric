export interface Personalisation {
  name: string;
  nicknames: string[];
  referencePhrases: string[];
  insideJokes: {
    doraMother: string;
    familyConfusion: string;
    chotiMoti: string;
    mummasBoy: string;
  };
}

export const PERSONALISATION: Personalisation = {
  name: "Mausami Ji",
  nicknames: ["Mausami Ji", "Madam Ji", "Chhutki", "Choti Moti"],
  referencePhrases: [
    "Dharrate kaat rahi omfoooooo",
    "Aayein? Baigan!",
    "Moye Moye",
    "Jethalal mode activated"
  ],
  insideJokes: {
    doraMother: "Dora ki mummy kahan hai? Suspect: Dora ke papa.",
    familyConfusion: "She calls her father boyfriend; he calls his mother girlfriend.",
    chotiMoti: "Choti Moti - a light, affectionate nickname.",
    mummasBoy: "Madam Ji claims the owner is a Mumma's Boy."
  }
};

