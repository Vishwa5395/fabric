export interface MemeCard {
  id: string;
  category: MemeCategory;
  title: string;
  setup: string;
  punchline: string;
  shape: 'diamond' | 'circle' | 'zigzag' | 'triangle' | 'grid' | 'stripes';
  badge: string;
}

export type MemeCategory =
  | 'OMFoooooo Emergency'
  | 'Dharrate Department'
  | 'Jethalal Intelligence Bureau'
  | 'Moye Moye Archives'
  | 'Madam Ji Moments'
  | 'Random Indian Internet Chaos';

export const MEME_CATEGORIES: MemeCategory[] = [
  'OMFoooooo Emergency',
  'Dharrate Department',
  'Jethalal Intelligence Bureau',
  'Moye Moye Archives',
  'Madam Ji Moments',
  'Random Indian Internet Chaos'
];

export const ARCHIVE_MEMES: MemeCard[] = [
  // 1. OMFoooooo Emergency (8 items)
  {
    id: 'omf-1',
    category: 'OMFoooooo Emergency',
    title: 'Code Red Siren',
    setup: 'Achanak yaad aaya ki gas par paani chadhaya tha...',
    punchline: 'Dharrate kaat rahi omfoooooo! Bartan bachao committee activated.',
    shape: 'diamond',
    badge: 'EMERGENCY'
  },
  {
    id: 'omf-2',
    category: 'OMFoooooo Emergency',
    title: 'Alarm Betrayal',
    setup: 'Subah 7:00 baje ka alarm baji 7:00 PM par...',
    punchline: 'OMFOOOOO! Pura career risk mein aa gaya.',
    shape: 'zigzag',
    badge: 'CRITICAL'
  },
  {
    id: 'omf-3',
    category: 'OMFoooooo Emergency',
    title: 'Screenshot Incident',
    setup: 'Jisko stalk kar rahe the, galti se usi ko photo like ho gaya...',
    punchline: 'Flight mode dabao, phone phek do, identity badlo!',
    shape: 'circle',
    badge: 'CLASSIFIED'
  },
  {
    id: 'omf-4',
    category: 'OMFoooooo Emergency',
    title: 'Chai Spill Threat',
    setup: 'Safed chadar par subah ki pehli kadak chai...',
    punchline: 'Omfoooooo! Ek boond giri aur direct teesra vishwa yuddh.',
    shape: 'stripes',
    badge: 'HAZARD'
  },
  {
    id: 'omf-5',
    category: 'OMFoooooo Emergency',
    title: 'Unsent Message',
    setup: 'Bohot lamba paragraph likh kar "Send" dabane se theek pehle...',
    punchline: 'Dimaag ne bola: Rehne de, self-respect ka sawaal hai.',
    shape: 'triangle',
    badge: 'TACTICAL'
  },
  {
    id: 'omf-6',
    category: 'OMFoooooo Emergency',
    title: 'Low Battery 1%',
    setup: 'Important conversation chal rahi thi aur screen dim ho gayi...',
    punchline: 'Omfoooooo! Olympic level leap towards the switchboard.',
    shape: 'grid',
    badge: 'POWER DRAIN'
  },
  {
    id: 'omf-7',
    category: 'OMFoooooo Emergency',
    title: 'Group Audio Call',
    setup: 'Galti se group call ka button dab gaya...',
    punchline: 'Dharrate kaat rahi omfoooooo! End call button dhoondhte dhoondhte paseene aa gaye.',
    shape: 'zigzag',
    badge: 'PANIC'
  },
  {
    id: 'omf-8',
    category: 'OMFoooooo Emergency',
    title: 'Mummy Footsteps',
    setup: 'Raat ko 2:30 baje fridge se chocolate nikaalte waqt paav ki aahat...',
    punchline: 'Freeze ho jao. Statues can not get scolded.',
    shape: 'diamond',
    badge: 'STEALTH'
  },

  // 2. Dharrate Department (8 items)
  {
    id: 'dh-1',
    category: 'Dharrate Department',
    title: 'Scooter Velocity',
    setup: 'Kisine bola: Bas 5 minute mein dukaan band ho jayegi...',
    punchline: 'Dharrate kaat rahi omfoooooo! Schumacher bhi side maang raha hai.',
    shape: 'stripes',
    badge: 'HIGH SPEED'
  },
  {
    id: 'dh-2',
    category: 'Dharrate Department',
    title: 'Reply in 0.2 Sec',
    setup: 'Crush ka notification aate hi finger velocity...',
    punchline: 'Dharrate kaat rahi omfoooooo! Screen break hone wali thi.',
    shape: 'zigzag',
    badge: 'TURBO'
  },
  {
    id: 'dh-3',
    category: 'Dharrate Department',
    title: 'Packing Skills',
    setup: 'Trip 2 din ki hai par suitcase 40 kilo ka...',
    punchline: 'Outfit redundancy protocol: Ek rainy season ke liye, ek formal apocalypse ke liye.',
    shape: 'grid',
    badge: 'HEAVY LOAD'
  },
  {
    id: 'dh-4',
    category: 'Dharrate Department',
    title: 'Sunday Afternoon Nap',
    setup: 'Bola tha bas 15 minute power nap lungi...',
    punchline: 'Uthi toh seedha agli century mein! Dharratedaar sleep.',
    shape: 'circle',
    badge: 'DORMANT'
  },
  {
    id: 'dh-5',
    category: 'Dharrate Department',
    title: 'Kitchen Masterclass',
    setup: 'Maggi mein achanak thoda extra oregano daal diya...',
    punchline: 'Dharrate kaat rahi omfoooooo! Masterchef trophy dhoondho.',
    shape: 'triangle',
    badge: 'GOURMET'
  },
  {
    id: 'dh-6',
    category: 'Dharrate Department',
    title: 'Bargaining Legend',
    setup: 'Bhaiya ne bola 500, Madam Ji ne offer kiya 150...',
    punchline: 'Shopkeeper ab dukaan unke naam karne par vichaar kar raha hai.',
    shape: 'diamond',
    badge: 'NEGOTIATOR'
  },
  {
    id: 'dh-7',
    category: 'Dharrate Department',
    title: 'Late Night Motivation',
    setup: 'Raat ke 3 baje naya workout routine aur career roadmap banate waqt...',
    punchline: 'Confidence: 100%. Agli subah execution: 0%.',
    shape: 'stripes',
    badge: 'AMBITIOUS'
  },
  {
    id: 'dh-8',
    category: 'Dharrate Department',
    title: 'Express Highway Swag',
    setup: 'Chhoti gaadi, bada attitude aur stereo par full volume...',
    punchline: 'Dharrate kaat rahi omfoooooo! Highway par bas sukoon hi sukoon.',
    shape: 'zigzag',
    badge: 'CRUISING'
  },

  // 3. Jethalal Intelligence Bureau (8 items)
  {
    id: 'jib-1',
    category: 'Jethalal Intelligence Bureau',
    title: 'Sundar Surprise',
    setup: 'Achanak doorbell baji aur samne Sundar khada hai...',
    punchline: 'Bapuji... meri dukaan aur jeb dono sankat mein hain!',
    shape: 'grid',
    badge: 'AHMEDABAD ALERT'
  },
  {
    id: 'jib-2',
    category: 'Jethalal Intelligence Bureau',
    title: 'Babita Ji Balcony View',
    setup: 'Subah chai lekar balcony mein aana...',
    punchline: 'Good morning Babita Ji! Din safal ho gaya.',
    shape: 'circle',
    badge: 'BALCONY OPS'
  },
  {
    id: 'jib-3',
    category: 'Jethalal Intelligence Bureau',
    title: 'Iyer Bhai Scientific Counter',
    setup: 'Jethalal ne bola: Rocket science toh bohot easy hai...',
    punchline: 'Iyer: Non-sense! Bapuji ne peeche se dekh liya.',
    shape: 'triangle',
    badge: 'RESEARCH'
  },
  {
    id: 'jib-4',
    category: 'Jethalal Intelligence Bureau',
    title: 'Nattu Kaka Salary Request',
    setup: 'Sethji, ab toh 15 saal ho gaye, thodi salary badha do...',
    punchline: 'Jethalal: Nattu Kaka, dimaag mat ghumao abhi customer hai!',
    shape: 'diamond',
    badge: 'PAYROLL STRIKE'
  },
  {
    id: 'jib-5',
    category: 'Jethalal Intelligence Bureau',
    title: 'Bapuji Angry Shout',
    setup: 'Jethalal ne chashma dhoondhte hue table gira diya...',
    punchline: 'AE PAGAL AURAT! Arre sorry... JETHIYA!',
    shape: 'zigzag',
    badge: 'DECON 1'
  },
  {
    id: 'jib-6',
    category: 'Jethalal Intelligence Bureau',
    title: 'Chai Biscuit Protocol',
    setup: 'Biscuit chai mein gir gaya...',
    punchline: 'National tragedy level rescue mission with another biscuit.',
    shape: 'stripes',
    badge: 'DIPPING CRISIS'
  },
  {
    id: 'jib-7',
    category: 'Jethalal Intelligence Bureau',
    title: 'Soda Shop Philosophical Summit',
    setup: 'Taarak Mehta ke saath Abdul ki shop par meeting...',
    punchline: 'Duniya ki saari problems ka solution ek masala soda mein.',
    shape: 'circle',
    badge: 'SODA OPS'
  },
  {
    id: 'jib-8',
    category: 'Jethalal Intelligence Bureau',
    title: 'Bagha Boy Wisdom',
    setup: 'Sethji, ek idea hai par nuksaan hone ka 100% chance hai...',
    punchline: 'Jethalal: Toh chup chap khada reh Bagha!',
    shape: 'grid',
    badge: 'IDEA LAB'
  },

  // 4. Moye Moye Archives (8 items)
  {
    id: 'mm-1',
    category: 'Moye Moye Archives',
    title: 'Single Tick Blues',
    setup: 'Paragraph likh kar bheja tha... 6 ghante ho gaye...',
    punchline: 'Moye Moye bgm begins playing in the background.',
    shape: 'triangle',
    badge: 'GHOSTED'
  },
  {
    id: 'mm-2',
    category: 'Moye Moye Archives',
    title: 'Online Order Reality',
    setup: 'Photo mein model lag rahi thi Paris Fashion Week...',
    punchline: 'Ghar par aane ke baad lag raha hai pocha lagane ka kapda.',
    shape: 'diamond',
    badge: 'EXPECTATION FAIL'
  },
  {
    id: 'mm-3',
    category: 'Moye Moye Archives',
    title: 'Movie Climax Disconnect',
    setup: 'Suspense movie ka suspense khulne se theek 2 second pehle...',
    punchline: 'Internet: Buffer... buffer... buffer...',
    shape: 'zigzag',
    badge: 'BUFFERING'
  },
  {
    id: 'mm-4',
    category: 'Moye Moye Archives',
    title: 'Diet Starts Tomorrow',
    setup: 'Akal aayi thi ki aaj se healthy food khana hai...',
    punchline: 'Tabhi dost ne momos aur cold drink order kar di.',
    shape: 'circle',
    badge: 'SABOTAGE'
  },
  {
    id: 'mm-5',
    category: 'Moye Moye Archives',
    title: 'Exam Hall Epiphany',
    setup: 'Question paper dekha: Chapter 4 se saare questions aaye hain...',
    punchline: 'Maine bas Chapter 1 aur 2 padha tha.',
    shape: 'stripes',
    badge: 'SYLLABUS GAP'
  },
  {
    id: 'mm-6',
    category: 'Moye Moye Archives',
    title: 'Haircut Day Disaster',
    setup: 'Barber ko bola bas thode ends trim kar dena...',
    punchline: 'Unhone military cut bana diya. Moye Moye.',
    shape: 'grid',
    badge: 'SALON SAGA'
  },
  {
    id: 'mm-7',
    category: 'Moye Moye Archives',
    title: 'Rain Without Umbrella',
    setup: 'Ghar se nikalte waqt socha dhoop hai toh kya zaroorat...',
    punchline: 'Badal: Aaj isko swimming sikhate hain.',
    shape: 'diamond',
    badge: 'DRENCHED'
  },
  {
    id: 'mm-8',
    category: 'Moye Moye Archives',
    title: 'Forgot The Punchline',
    setup: 'Bohot build-up dekar joke sunana shuru kiya...',
    punchline: 'End mein khud hi bhool gaye ki bolna kya tha.',
    shape: 'triangle',
    badge: 'AWKWARD'
  },

  // 5. Madam Ji Moments (8 items)
  {
    id: 'mj-1',
    category: 'Madam Ji Moments',
    title: 'The Silent Judgment',
    setup: 'Jab kisine bekaar suggestion diya...',
    punchline: 'Madam Ji ne bas 2 second dekha aur aankhon se hi dismiss kar diya.',
    shape: 'stripes',
    badge: 'EVALUATION'
  },
  {
    id: 'mj-2',
    category: 'Madam Ji Moments',
    title: 'Voice Note Marathon',
    setup: 'Normal log text karte hain...',
    punchline: 'Madam Ji ne seedha 4 minute ka podcast bhej diya!',
    shape: 'circle',
    badge: 'PODCASTER'
  },
  {
    id: 'mj-3',
    category: 'Madam Ji Moments',
    title: 'Chai Temperature Protocol',
    setup: 'Chai na toh zyada garam honi chahiye, na thandi...',
    punchline: 'NASA level precision required for Madam Ji’s afternoon cup.',
    shape: 'triangle',
    badge: 'QUALITY CONTROL'
  },
  {
    id: 'mj-4',
    category: 'Madam Ji Moments',
    title: 'Dora Investigation Chief',
    setup: 'Papa ji ne bola: Main toh bas bazaar gaya tha...',
    punchline: 'Madam Ji: Aap suspect number 1 hain. Files band nahi hongi.',
    shape: 'diamond',
    badge: 'CASE 001'
  },
  {
    id: 'mj-5',
    category: 'Madam Ji Moments',
    title: 'Overthinking Championship',
    setup: 'Unhone bola: "Achha theek hai"...',
    punchline: 'Madam Ji ne 4 ghante analyze kiya ki "theek" mein konsa hidden tone tha.',
    shape: 'grid',
    badge: 'DEEP SCAN'
  },
  {
    id: 'mj-6',
    category: 'Madam Ji Moments',
    title: 'Shopping Cart Sanctuary',
    setup: 'Total amount: ₹24,890 in cart...',
    punchline: 'Checkout karne ka plan nahi hai, bas aesthetic look enjoy ho raha hai.',
    shape: 'zigzag',
    badge: 'VIRTUAL LUXURY'
  },
  {
    id: 'mj-7',
    category: 'Madam Ji Moments',
    title: 'Choti Moti Authority',
    setup: 'Height choti hai toh kya hua...',
    punchline: 'Control aur hukum chalane ki capability supreme court se upar hai!',
    shape: 'stripes',
    badge: 'COMMAND'
  },
  {
    id: 'mj-8',
    category: 'Madam Ji Moments',
    title: 'Random Dance Break',
    setup: 'Kitchen mein bina kisi background music ke...',
    punchline: 'Dimaag mein Darkhaast chal raha hai aur kadhai mein chammach lehra raha hai.',
    shape: 'circle',
    badge: 'GROOVE'
  },

  // 6. Random Indian Internet Chaos (8 items)
  {
    id: 'rc-1',
    category: 'Random Indian Internet Chaos',
    title: 'Aayein? Baigan!',
    setup: 'Teacher: Favourite subject konsa hai tumhara?',
    punchline: 'Aayein? Baigan! Internet heritage moment.',
    shape: 'diamond',
    badge: 'HERITAGE'
  },
  {
    id: 'rc-2',
    category: 'Random Indian Internet Chaos',
    title: 'JCB Ki Khudai',
    setup: 'Mohalle ke kone par ek peeli JCB aayi...',
    punchline: 'Pura ilaaka 3 ghante khade hokar review karta raha.',
    shape: 'grid',
    badge: 'CIVIC SPECTACLE'
  },
  {
    id: 'rc-3',
    category: 'Random Indian Internet Chaos',
    title: 'Rasode Mein Kaun Tha?',
    setup: 'Cooker mein se chane nikaal diye...',
    punchline: 'Khali cooker gas par chadha diya. Kaun tha bhai?',
    shape: 'zigzag',
    badge: 'INVESTIGATION'
  },
  {
    id: 'rc-4',
    category: 'Random Indian Internet Chaos',
    title: 'Land Kara De',
    setup: 'Paragliding instructor: Don’t panic bhai...',
    punchline: '500 zyada le le bas zameen par utaar de!',
    shape: 'triangle',
    badge: 'FLIGHT EMERGENCY'
  },
  {
    id: 'rc-5',
    category: 'Random Indian Internet Chaos',
    title: 'Peeche Toh Dekho',
    setup: 'Pathan boy in viral video...',
    punchline: 'Peeche toh dekho! Peeche!',
    shape: 'stripes',
    badge: 'VIRAL RETRO'
  },
  {
    id: 'rc-6',
    category: 'Random Indian Internet Chaos',
    title: 'Shabash Beta Bahut Badiya',
    setup: 'Jab kisine basic common sense use kar li...',
    punchline: 'National award presentation tone: Shabash!',
    shape: 'circle',
    badge: 'CERTIFICATE'
  },
  {
    id: 'rc-7',
    category: 'Random Indian Internet Chaos',
    title: 'Kya Karu Main Mar Jau?',
    setup: 'Meri koi feeling nahi hai?',
    punchline: 'Tumhara kutta Tommy, humara kutta kutta?',
    shape: 'diamond',
    badge: 'SENTIMENTAL'
  },
  {
    id: 'rc-8',
    category: 'Random Indian Internet Chaos',
    title: 'Basanti In Front Of Dogs',
    setup: 'Veeru: Basanti in kutton ke samne mat nachna...',
    punchline: 'DJ: Play the drop! Basanti dance shuru.',
    shape: 'grid',
    badge: 'CLASSIC CINEMA'
  }
];

