export interface EvidenceCard {
  id: string;
  label: string;
  description: string;
  forensicTool?: string;
  forensicFinding?: string;
}

export interface InterrogationQuestion {
  id: string;
  question: string;
  suspectReaction: string;
  confession: string;
}

export interface ActualJokeItem {
  id: string;
  setup: string;
  punchline: string;
  speakerOrContext: string;
  laughterTag: string;
}

export interface CaseFile {
  id: string;
  caseNo: string;
  title: string;
  featured?: boolean;
  status: string;
  investigator: string;
  suspect?: string;
  missingPerson?: string;
  premise: string;
  headlineJoke: string;
  actualJokes: ActualJokeItem[];
  evidence: EvidenceCard[];
  interrogation?: InterrogationQuestion[];
  verdict: string;
  ownerReview: boolean;
  notes?: string;
}

export const CASE_FILES: CaseFile[] = [
  {
    id: 'case-001',
    caseNo: '001',
    title: 'DORA KI MUMMY KAHAN HAI?',
    featured: true,
    status: 'High Alert Investigation',
    investigator: 'Mausami Ji (Chief Inquisitor)',
    suspect: 'Papa Ji (Suspect #1)',
    missingPerson: 'Dora\'s Mother',
    premise: 'Dora poori duniya mein map lekar ghoomti hai, Boots ke saath dangerous jungle mein crocodile se ladti hai, par Mummy ka pata abhi tak kisi ko nahi maloom. Primary suspect Papa ji par high-profile inquiry baithayi gayi hai.',
    headlineJoke: 'Dora 15 saal se poori duniya se pooch rahi hai "Where are we going?"... Papa ji se poochho "Mummy kahan hain?", toh bolte hain: "Chalo pehle Boots ke red boots polish karwa ke laate hain!"',
    actualJokes: [
      {
        id: 'c1-j1',
        speakerOrContext: 'Mausami Ji vs Papa Ji',
        laughterTag: 'Mausami Ji Special Roast',
        setup: 'Mausami Ji ne Papa ji se seedha sawaal kiya: "Dora backpack se pahaad, seedhi, telescope aur naav sab nikaal leti hai... par Mummy ka phone number kyun nahi nikalta?"',
        punchline: 'Papa ji bole: "Beta, backpack ki storage capacity full ho gayi thi, Mummy ka number cloud storage pe upload kar diya hai!"'
      },
      {
        id: 'c1-j2',
        speakerOrContext: 'Map Intelligence Wiretap',
        laughterTag: '100% Real Inside Joke',
        setup: 'Map gaana gaata hai: "I\'m the Map, I\'m the Map, I know where to go!" Lekin jab Mausami Ji ne Mummy ka GPS coordinate maanga...',
        punchline: 'Map turant bolti hai: "Rerouting... Turn left past the chocolate mountain, cross the crocodile lake, and ask Swiper!" Swiper ne haath khade kar diye: "Bhai hum biscuit chori karte hain, Mummy kidnap nahi!"'
      },
      {
        id: 'c1-j3',
        speakerOrContext: 'Alibi Verification Report',
        laughterTag: 'Official Case Roast',
        setup: 'Papa ji ka sworn statement: "Main toh bas subah subah taaza cow milk lene gaya tha."',
        punchline: 'Mausami Ji ki forensic inquiry: "Uncle doodh lene gaye the ya Dora ko jungle mein venomous snakes ke beech chhod kar khud ghar pe AC chala ke T20 cricket dekh rahe the?!"'
      },
      {
        id: 'c1-j4',
        speakerOrContext: 'Dora\'s Awkward Silence Explained',
        laughterTag: 'Animation Reality Check',
        setup: 'Dora cartoon mein screen ki taraf dekh kar 10 second tak blank stare kyun deti hai?',
        punchline: 'Woh actually audience ke answer ka wait nahi kar rahi hoti... woh dekhti hai ki Papa ji kab kitchen se bahar niklein taaki chupke se Mummy ko call mila sake!'
      }
    ],
    evidence: [
      {
        id: 'c1-e1',
        label: 'Exhibit A: Ek bahut suspicious khamoshi',
        description: 'Jab bhi poochha gaya "Mummy kahan hain?", suspect ne chai ki chuski lekar aasmaan ki taraf dekhna shuru kar diya.',
        forensicTool: 'Audio Decibel & Eye-Tracker Scan',
        forensicFinding: 'Audio level: 0.0 dB. Pupil dilation: 40% increased nervousness. Conclusion: Papa ji chai peene ka bahaana bana kar topic change kar rahe the!'
      },
      {
        id: 'c1-e2',
        label: 'Exhibit B: Map ka classified blueprint',
        description: 'Map se poochha gaya toh usne bola "I am the map!", par mummy ka coordinate blank chhod diya.',
        forensicTool: 'GPS Satellite Coordinate Recovery',
        forensicFinding: 'Map memory chip accessed: Coordinates manually delete kiye gaye the. Map ne lawyer maang liya aur bayaan dene se mana kar diya.'
      },
      {
        id: 'c1-e3',
        label: 'Exhibit C: Swiper ki clandestine gawaahi',
        description: 'Swiper ne bola: "Maine chori nahi ki, no swiping here!" Court ne uske bayaan ko record par liya.',
        forensicTool: 'Polygraph Lie-Detector Test',
        forensicFinding: 'Needle didn\'t flinch. Swiper is 100% innocent of this crime! Swiper testified: "Papa ji ne mujhe chup rehne ke liye Parle-G ka packet diya tha!"'
      },
      {
        id: 'c1-e4',
        label: 'Exhibit D: Backpack se baramad classified receipt',
        description: 'Backpack se ek purana ration bill mila jisme sirf akele Papa ji aur Boots ki Maggi ka hisaab tha.',
        forensicTool: 'Thermal Ink Recovery Scan',
        forensicFinding: 'Thermal scan reveals: Bill dated 14th August. Purchased: 2 Maggi pack, 1 Sting energy drink. Mummy absent from household grocery quota.'
      },
      {
        id: 'c1-e5',
        label: 'Exhibit E: Suspect ka counter-allegation',
        description: 'Suspect ne kaha: "Main toh bas subah doodh lene gaya tha!" Investigation team is statement ko verify kar rahi hai.',
        forensicTool: 'Alibi Verification with Mother Dairy',
        forensicFinding: 'Dairy vendor confirms: "Uncle ji ne 2 packet doodh liye the aur 45 minute tak cricket discussion kar rahe the."'
      }
    ],
    interrogation: [
      {
        id: 'q1',
        question: 'Sach sach bataiye Papa ji, aap doodh lene gaye the ya akele Maggi party kar rahe the?',
        suspectReaction: '*(Chai cup hilate hue thoda nervous hase)*',
        confession: '"Beta dekho, fresh cow milk lene mein waqt lagta hai... aur Maggi toh maine Boots ko taste karane ke liye banayi thi!"'
      },
      {
        id: 'q2',
        question: 'Map se Mummy ka navigation coordinate kisne delete kiya?',
        suspectReaction: '*(Idhar udhar dekhkar chashma saaf kiya)*',
        confession: '"Map ko maine bas bol diya tha ki direct route mat dikhana, thoda adventure ho jayega! Mujhe kya pata tha woh itna literal le lega!"'
      },
      {
        id: 'q3',
        question: 'Swiper ne bola aapne usse Parle-G dekar rishwat di thi?',
        suspectReaction: '*(Shocked expressions)*',
        confession: '"Woh fox jhooth bol raha hai! Parle-G ka half packet usne khud chori kiya tha! Uspe toh pehle se 3 FIR darj hain!"'
      }
    ],
    verdict: 'Pending Final Hearing. Jab tak Dora ki mummy khud prakat nahi hoti, Papa ji suspect number 1 rahenge. Court orders Papa ji to serve hot adrak chai and snacks to Chief Investigator Mausami Ji daily!',
    ownerReview: true,
    notes: 'Approved inside joke case.'
  },
  {
    id: 'case-002',
    caseNo: '002',
    title: 'The Great Family Relationship Confusion',
    status: 'Under Linguistic Review',
    investigator: 'Mausami Ji (Chief Inquisitor)',
    suspect: 'Both Parties (Linguistic Outlaws)',
    premise: 'Mausami Ji calls her father her "boyfriend"; the owner calls his mother his "girlfriend". Linguistic experts and mohalla relatives have declared a state of extreme domestic confusion.',
    headlineJoke: 'Jab Mausami Ji bolti hain "Mera boyfriend mujhe pick karne aa raha hai", log romantic background music expect karte hain... aur car se nikalte hain Papa ji 90s ka Kishore Kumar bajate hue!',
    actualJokes: [
      {
        id: 'c2-j1',
        speakerOrContext: 'The Romantic Car Arrival',
        laughterTag: 'Iconic Inside Joke',
        setup: 'College ke bahar ladkiyan boyfriend ka wait karti hain toh bike pe stylish ladke aate hain. Mausami Ji ne bola: "Wait, mera boyfriend car leke aaya hai."',
        punchline: 'Car ka shisha neeche hua, andar se Papa ji ne smile kiya aur bole: "Beta, AC chalana hai ya khidki kholoon? Aur aate waqt dahi le li maine!"'
      },
      {
        id: 'c2-j2',
        speakerOrContext: 'Owner\'s Girlfriend Tiffin Mystery',
        laughterTag: 'Office Lunch Banter',
        setup: 'Owner ne dosto ke saamne tiffin kholte hue proudly bola: "Aaj meri girlfriend ne mere liye special lunch pack kiya hai."',
        punchline: 'Dosto ne dekha toh andar karele ki sabzi, 3 moti roti aur amla ka achaar tha! Dost bole: "Bhai teri girlfriend 1960 model ki sanskari saas hai kya?!"'
      },
      {
        id: 'c2-j3',
        speakerOrContext: 'Demand List Comparison',
        laughterTag: 'Dating Reality Check',
        setup: 'Duniya mein log boyfriend se Valentine gifts, flowers aur movie dates maangte hain...',
        punchline: 'Mausami Ji boyfriend se bolti hain: "Suno, gaadi 40 ke upar mat bhagana, petrol mehenga ho gaya hai, aur driving licence carry kiya na aapne?!"'
      },
      {
        id: 'c2-j4',
        speakerOrContext: 'Mohalla Society Council in Shock',
        laughterTag: 'Linguistic Crisis',
        setup: 'Mohalle ke rishtedaar in dono ki baatein sunkar emergency meeting mein baith gaye...',
        punchline: 'Sharma ji bole: "Ghor kalyug aa gaya hai! Ladki ka boyfriend retirement pension aur cholesterol checkup discuss kar raha hai, aur ladke ki girlfriend unhe dhoop mein sweater pehankar jaane ko bol rahi hai!"'
      }
    ],
    evidence: [
      {
        id: 'c2-e1',
        label: 'Exhibit A: Car arrival testimony',
        description: 'Witness report: "Mera boyfriend mujhe pick karne aaya hai." Car ka shisha neeche hua toh Papa ji smile kar rahe the.',
        forensicTool: 'Dashcam Audio-Visual Transcription',
        forensicFinding: 'Papa ji confirmed playing retro 90s hits on car stereo with ultimate fatherly swagger.'
      },
      {
        id: 'c2-e2',
        label: 'Exhibit B: Counter boyfriend assertion',
        description: 'Owner claims: "Meri girlfriend ne aaj tiffin mein kheer bheji hai." (It was his mother).',
        forensicTool: 'Tiffin Box Spectrometry',
        forensicFinding: 'Kheer sugar levels optimal. Pure motherly affection detected in extra almond garnishing.'
      },
      {
        id: 'c2-e3',
        label: 'Exhibit C: Dictionary in tears',
        description: 'Oxford Dictionary team has given up trying to categorize this domestic taxonomy.',
        forensicTool: 'Lexical Sanity Check',
        forensicFinding: 'Status: 100% wholesome confusion. Standard dictionary definitions officially revoked.'
      }
    ],
    interrogation: [
      {
        id: 'q1',
        question: 'Aap log normal words jaise "Papa" ya "Mummy" bolne mein kya problem hai?',
        suspectReaction: '*(Shrugging with supreme confidence)*',
        confession: '"Normal words mein woh Bollywood dramatic punch kahan milta hai jo iss custom taxonomy mein hai?"'
      },
      {
        id: 'q2',
        question: 'Kya society iss relation naming scheme ke liye ready hai?',
        suspectReaction: '*(Chuckle)*',
        confession: '"Society ko thoda time lagega catch up karne mein, tab tak we are setting the trend!"'
      }
    ],
    verdict: 'Case Approved by Supreme Court of Wholesome Confusion. Both parties are officially exempted from normal social vocabulary rules with infinite immunity.',
    ownerReview: true,
    notes: 'Approved inside joke case.'
  },
  {
    id: 'case-003',
    caseNo: '003',
    title: 'The Choti Moti Dossier',
    status: 'Affectionately Classified',
    investigator: 'Mausami Ji (Chief Inquisitor)',
    suspect: 'The Owner (Moniker Concocter)',
    premise: 'A brief, light, and affectionate inquiry into the origin and deployment of the "Choti Moti" moniker. Note: This file strictly does not focus purely on physical height, but on overall compact attitude.',
    headlineJoke: 'Unko lagta hai "Choti Moti" bol kar chidha lenge... Par unhe kya pata, packet chota ho sakta hai par attitude seedha Richter scale 8.5 ka hai!',
    actualJokes: [
      {
        id: 'c3-j1',
        speakerOrContext: 'Mausami Ji\'s Official Rebuttal',
        laughterTag: 'Limited Edition Banter',
        setup: 'Owner ne smile ke saath bulaya: "Arrey meri Choti Moti suno toh..."',
        punchline: 'Mausami Ji ka instant counter: "Dekho, main choti nahi hoon. Main travel-size, limited-edition and concentrated swag hoon. Jyada bologe toh stool pe khade hokar daantungi!"'
      },
      {
        id: 'c3-j2',
        speakerOrContext: 'Height vs Command Physics',
        laughterTag: 'Attitude Audit',
        setup: 'Physics department ne calculate kiya: Height vs Authority Ratio.',
        punchline: 'Physical height: 5 feet (with sneakers on). Command level: 6 foot 4 inch ke bouncer jaisa! Ek teekhi nazar padte hi samne wala bina dare sorry bol deta hai.'
      },
      {
        id: 'c3-j3',
        speakerOrContext: 'The Scientific Overthinking Advantage',
        laughterTag: 'Brainpower Roast',
        setup: 'Compact hone ka asli scientific benefit kya hai?',
        punchline: 'Mausami Ji: "Heart se dimaag tak blood circulation bohot tez pahunchta hai, isliye meri overthinking tumhare pure laptop ke processor se 4x fast execute hoti hai!"'
      },
      {
        id: 'c3-j4',
        speakerOrContext: 'Reaction Timeline',
        laughterTag: 'Facial Expression Scan',
        setup: '"Choti Moti" sunte hi facial reaction timeline record kiya gaya:',
        punchline: '0.1 sec: Deadly death stare 👀 | 0.5 sec: Fake angry pout 😤 | 1.2 sec: Dono ki uncontrollably hasi start 😂! Pure affection, zero complaints.'
      }
    ],
    evidence: [
      {
        id: 'c3-e1',
        label: 'Exhibit A: Pocket Dynamo phenomenon',
        description: 'Compact frame mein 400 horsepower ka attitude and decisiveness detect hua.',
        forensicTool: 'Horsepower Dyno Sensor',
        forensicFinding: 'Peak torque registered at 420 Nm whenever she says "Nahi, main batati hoon kaise karna hai."'
      },
      {
        id: 'c3-e2',
        label: 'Exhibit B: Smile impact radar',
        description: 'Choti si smile se serious arguments cancel karne ka scientific record.',
        forensicTool: 'Seismic Caliber Detector',
        forensicFinding: '100% dispute resolution rate within 3.5 seconds of one authentic chuckle.'
      },
      {
        id: 'c3-e3',
        label: 'Exhibit C: Nickname audit',
        description: 'Moniker carries 100% warmth, 0% malice, and infinite sweetness.',
        forensicTool: 'Sentiment & Affection Chromatograph',
        forensicFinding: 'Malice: 0.00%. Warmth: Infinite. Adorableness index off the chart.'
      }
    ],
    interrogation: [
      {
        id: 'q1',
        question: 'Kis authority se aapne yeh "Choti Moti" moniker register kiya?',
        suspectReaction: '*(Hand over heart with a straight face)*',
        confession: '"Yeh koi derogatory title nahi hai! Yeh highest grade affectionate honour hai for the most precious person!"'
      },
      {
        id: 'q2',
        question: 'Kya Mausami Ji height mein sach mein choti hain ya yeh bas afwaah hai?',
        suspectReaction: '*(Smiling gently)*',
        confession: '"Height is just a geometric construct! In terms of personality and aura, she is 10 feet tall!"'
      }
    ],
    verdict: 'Choti Moti remains the official, uncontested title of honour. Any objection is dismissed with hot tea, butter toast, and sweet laughter.',
    ownerReview: true,
    notes: 'Approved inside joke case.'
  },
  {
    id: 'case-004',
    caseNo: '004',
    title: 'The Mumma\'s Boy Investigation',
    status: 'High Profile Inquiry',
    investigator: 'Mausami Ji (Chief Inquisitor)',
    suspect: 'The Owner (Self-Proclaimed Pampered Prince)',
    premise: 'Mausami Ji repeatedly levels the grave charge: The owner is an unrepentant "Mumma\'s Boy". A commission was set up to inspect the alleged pampering.',
    headlineJoke: 'Mausami Ji ki chargesheet: "Yeh aadmi bina Mummy ke validation ke subah kaunsi shirt pehanni hai woh bhi decide nahi kar sakta!"',
    actualJokes: [
      {
        id: 'c4-j1',
        speakerOrContext: 'Paratha Dependency Syndrome',
        laughterTag: 'Royal Pampering Roast',
        setup: 'Mausami Ji: "Aap court ko sach bataiye, aakhri baar aapne khud se chai kab banayi thi?"',
        punchline: 'Suspect ka bold defense: "Kyun banayein jab Mummy adrak daal kar world-class chai haath mein deti hain? Isse dependency nahi, royalty kehte hain!"'
      },
      {
        id: 'c4-j2',
        speakerOrContext: 'Tactical Defense Shield',
        laughterTag: 'Universal Excuse',
        setup: 'Kisi mushkil plan ya social event se bachna ho toh suspect ka universal brahmastra weapon...',
        punchline: '"Main Mummy se pooch ke batata hoon." Pata sabko hai ki Mummy ne mana nahi kiya, isne khud aalas mein plan cancel karwaya hai!'
      },
      {
        id: 'c4-j3',
        speakerOrContext: 'The Supreme Court of Mummy',
        laughterTag: 'Unbeatable Argument',
        setup: 'Mausami Ji jab bhi pure logic aur factual arguments ke saath gussa hoti hain...',
        punchline: 'Suspect: "Mausami Ji chahe kitna bhi daant lein, Mummy toh abhi bhi kehti hain \'Mera beta kitna kamzor ho gaya hai, ek paratha aur khao\'... Ab batao Mummy badi ya logic?!"'
      },
      {
        id: 'c4-j4',
        speakerOrContext: 'Official Court Sentence',
        laughterTag: 'Judicial Punishment',
        setup: 'Guilty as charged! Suspect ko saza kya milni chahiye?',
        punchline: 'Adaalat ka aadesh: "Suspect agle 1 saal tak jab bhi Mummy se kurkure parathe banwaye, sabse pehla garam paratha Mausami Ji ke naam pack hoga!"'
      }
    ],
    evidence: [
      {
        id: 'c4-e1',
        label: 'Exhibit A: The Paratha Privilege',
        description: 'Defense argues that enjoying freshly fried parathas is a basic constitutional necessity, not pampering.',
        forensicTool: 'Ghee & Nutrition Calorimeter',
        forensicFinding: 'White butter content: High. Emotional attachment to Mummy ke haath ka khana: 1000%.'
      },
      {
        id: 'c4-e2',
        label: 'Exhibit B: "Mummy se pooch ke bataunga"',
        description: 'Classified wiretap caught the phrase being used to gracefully dodge plans.',
        forensicTool: 'Voice Stress Analyzer',
        forensicFinding: 'Stress: Zero. The phrase is a seasoned tactical defense shield perfected over 20+ years.'
      },
      {
        id: 'c4-e3',
        label: 'Exhibit C: The Innocence Defense',
        description: 'Suspect claims: "Main toh bas obedient bachha hoon." Judge laughed for 3 minutes straight.',
        forensicTool: 'Facial Muscle Polygraph',
        forensicFinding: 'Smirk detected. The suspect knows he is pampered and wears the badge proudly.'
      }
    ],
    interrogation: [
      {
        id: 'q1',
        question: 'Mausami Ji kehti hain aap har cheez mein Mummy se approval lete hain, is this true?',
        suspectReaction: '*(Pride beaming on face)*',
        confession: '"Bilkul sach! Mummy ki advice lene mein koi sharam nahi, parathas are life and Mummy is top authority!"'
      },
      {
        id: 'q2',
        question: 'Kya aap court ke samne admit karte hain ki aap Mumma\'s Boy hain?',
        suspectReaction: '*(Hands raised in full surrender)*',
        confession: '"Full guilty with pride! Chief Investigator Mausami Ji ki har allegation sar-aankhon par!"'
      }
    ],
    verdict: 'Guilty with maximum leniency! The title "Mumma\'s Boy" stands confirmed with pride. Penalty: Suspect must treat Mausami Ji to coffee and momos.',
    ownerReview: true,
    notes: 'Approved inside joke case.'
  }
];
