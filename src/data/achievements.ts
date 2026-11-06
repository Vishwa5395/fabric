export interface AchievementDef {
  id: string;
  name: string;
  description: string;
  hint: string;
  icon: string;
  event: string;
  isCounter?: boolean;
  targetCount?: number;
}

export const ACHIEVEMENTS: AchievementDef[] = [
  {
    id: 'first_contact',
    name: 'First Contact',
    description: 'Welcome page opened and tour began.',
    hint: 'Open the welcome gate to begin the tour.',
    icon: 'DoorOpen',
    event: 'welcome_opened'
  },
  {
    id: 'secret_keeper',
    name: 'Secret Keeper',
    description: 'First private classified diary entry saved safely.',
    hint: 'Save a diary note in the Classified Notebook.',
    icon: 'LockKey',
    event: 'diary_saved'
  },
  {
    id: 'audio_archivist',
    name: 'Audio Archivist',
    description: 'First voice memo safely recorded and preserved.',
    hint: 'Record and save an audio memo in Audio Diary.',
    icon: 'MicrophoneStage',
    event: 'recording_saved'
  },
  {
    id: 'court_veteran',
    name: 'Meme Court Veteran',
    description: 'Completed a full 7-round session of Meme Court.',
    hint: 'Finish all 7 rounds of Meme Court to get your title.',
    icon: 'Gavel',
    event: 'court_completed'
  },
  {
    id: 'dora_detective',
    name: 'Dora\'s Detective',
    description: 'Case 001 (Dora\'s Mother) opened for investigation.',
    hint: 'Inspect Case 001 in the Inside Joke Museum.',
    icon: 'MagnifyingGlass',
    event: 'dora_case_opened'
  },
  {
    id: 'meme_explorer',
    name: 'Meme Enthusiast',
    description: 'Bookmarked a favourite meme from the internet feed.',
    hint: 'Bookmark a funny meme in the Meme Department.',
    icon: 'Sparkle',
    event: 'meme_favourited'
  },
  {
    id: 'music_connoisseur',
    name: 'Sukoon Station Regular',
    description: 'Tuned into Background Music or Sukoon Dhun.',
    hint: 'Listen to a music track or Sukoon Dhun.',
    icon: 'Lightning',
    event: 'music_played'
  }
];
