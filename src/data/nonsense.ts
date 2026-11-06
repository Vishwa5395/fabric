export interface NewsItem {
  id: string;
  headline: string;
  details: string;
  tag: string;
}

export interface FactItem {
  id: string;
  fact: string;
  category: string;
}

export interface ComplimentItem {
  id: string;
  text: string;
  mood: string;
}

export interface ChaosCombo {
  id: string;
  toast: string;
  reactionHeadline: string;
  reactionBody: string;
  soundPitch: number; // Hz for Web Audio synthesiser
  animType: 'wiggle' | 'pulse' | 'flash' | 'bounce';
}

export const BREAKING_NEWS: NewsItem[] = [
  {
    id: 'n1',
    headline: 'TAZA KHABAR! Madam Ji ne aaj phir bina wajah itna socha ki unke dimaag ne overtime ke paise maang liye.',
    details: 'Dimaag union ne strike ki warning di hai. Chai aur samosa ki maang tez.',
    tag: '100% jhooth, 100% mazaa'
  },
  {
    id: 'n2',
    headline: 'ISRO ka naya khulasa: Mausami Ji ke phone ka charger gayab hona ek antariksh ghatna hai.',
    details: 'Black hole se bhi zyada mysterious bataya gaya hai bed ke peeche ka area.',
    tag: '100% jhooth, 100% mazaa'
  },
  {
    id: 'n3',
    headline: 'Supreme Court ne ghoshna ki: 5 minute ka snooze button dabana ab fundamental right hai.',
    details: '8th snooze par special medal dene ki taiyari.',
    tag: '100% jhooth, 100% mazaa'
  },
  {
    id: 'n4',
    headline: 'WhatsApp group mein 400 unread messages milne par CBI jaanch ki maang.',
    details: 'Madam Ji ne kaha: "Maine bas 10 minute ke liye phone rakha tha."',
    tag: '100% jhooth, 100% mazaa'
  },
  {
    id: 'n5',
    headline: 'Dora ki mummy ki talaash mein international committee ka gathan.',
    details: 'Mausami Ji ko chief investigator banaya gaya. Report 2050 tak aane ki ummeed.',
    tag: '100% jhooth, 100% mazaa'
  },
  {
    id: 'n6',
    headline: 'Weather Department ki warning: Madam Ji ke mood swings se mausam badal sakta hai.',
    details: 'Kabhi dhoop, kabhi baarish, aur achanak severe overthinking ka bayaan.',
    tag: '100% jhooth, 100% mazaa'
  },
  {
    id: 'n7',
    headline: 'Wardrobe saaf karne ke 7 minute baad wapas kapdo ka pahaad ban gaya.',
    details: 'Physics ke niyam fail. Newton ke chauthe niyam par charcha shuru.',
    tag: '100% jhooth, 100% mazaa'
  },
  {
    id: 'n8',
    headline: 'Wifi band hote hi gharwalon ne ek dusre se baat ki: "Ache log hain waise."',
    details: 'Router restart hone ke baad parivaar wapas phone mein leen.',
    tag: '100% jhooth, 100% mazaa'
  },
  {
    id: 'n9',
    headline: 'Omfoooooo dharrate kaatne wali gadi ko traffic police ne salute kiya.',
    details: 'Police commissioner ne bola: "Speed limit se upar confidence tha."',
    tag: '100% jhooth, 100% mazaa'
  },
  {
    id: 'n10',
    headline: 'Khana khane ke theek 2 second baad Mummy ka sawaal: "Kuch khaya bhi ya nahi?"',
    details: 'Archaeologists ne confirm kiya: Ye sawaal 5000 saal purana hai.',
    tag: '100% jhooth, 100% mazaa'
  },
  {
    id: 'n11',
    headline: 'Instagram Reels scroll karte hue 3 ghante nikalne par ghadi company par FIR darj.',
    details: 'Accused clock: "Samay toh humne standard hi chalaya tha."',
    tag: '100% jhooth, 100% mazaa'
  },
  {
    id: 'n12',
    headline: 'Choti Moti ne cup chai pee kar duniya jeetne ka plan banaya.',
    details: 'Phir so gayi kyunki bed bohot comfortable tha.',
    tag: '100% jhooth, 100% mazaa'
  },
  {
    id: 'n13',
    headline: 'Jethalal ne Nattu Kaka se salary badhane ka waada kiya.',
    details: 'Bagha ne bola: "Jaisi jiski soch." Pure department mein sannata.',
    tag: '100% jhooth, 100% mazaa'
  },
  {
    id: 'n14',
    headline: 'Online shopping cart mein 47 items rakh kar app band karne ka naya record.',
    details: 'Finance ministry ne thank you letter bheja: "Desh ki bachat hui."',
    tag: '100% jhooth, 100% mazaa'
  },
  {
    id: 'n15',
    headline: 'Chhutki ki smile ko officially non-polluting clean energy ghoshit kiya gaya.',
    details: 'Power grid ne bataya: Ek hasi se pure mohalle ki batti jal sakti hai.',
    tag: '100% jhooth, 100% mazaa'
  },
  {
    id: 'n16',
    headline: 'Phone ki battery 1% par pahunchne par Olympic level sprint laga kar charger lagaya.',
    details: 'Gold medal pakka samjha ja raha hai.',
    tag: '100% jhooth, 100% mazaa'
  }
];

export const USELESS_FACTS: FactItem[] = [
  { id: 'f1', fact: 'Cows have best friends and get stressed when they are separated.', category: 'Animals' },
  { id: 'f2', fact: 'Bananas are naturally slightly radioactive because of their high potassium content.', category: 'Science' },
  { id: 'f3', fact: 'Otters hold hands while sleeping so they do not drift away in the water.', category: 'Nature' },
  { id: 'f4', fact: 'Honey never spoils. Archaeologists have tasted 3,000-year-old honey from Egyptian tombs and it was still edible.', category: 'History' },
  { id: 'f5', fact: 'Wombat poop is cube-shaped so it does not roll away.', category: 'Animals' },
  { id: 'f6', fact: 'A day on Venus is longer than a year on Venus.', category: 'Space' },
  { id: 'f7', fact: 'Sea horses mate for life and swim holding each other’s tails.', category: 'Nature' },
  { id: 'f8', fact: 'The dot over the lowercase letter "i" and "j" is officially called a "tittle".', category: 'Language' },
  { id: 'f9', fact: 'Pringles cans were invented by Fredric Baur, who was so proud of them that his ashes were buried in one.', category: 'Food' },
  { id: 'f10', fact: 'Octopuses have three hearts, nine brains, and blue copper-based blood.', category: 'Biology' },
  { id: 'f11', fact: 'Sloths can hold their breath underwater for up to 40 minutes, four times longer than dolphins.', category: 'Animals' },
  { id: 'f12', fact: 'A cloud can weigh more than a million pounds (approx. 500,000 kg).', category: 'Weather' },
  { id: 'f13', fact: 'Butterflies can taste with their feet.', category: 'Nature' },
  { id: 'f14', fact: 'The inventor of the Frisbee was turned into a Frisbee after he died.', category: 'Oddities' },
  { id: 'f15', fact: 'Pineapples take almost three years to grow a single fruit.', category: 'Food' },
  { id: 'f16', fact: 'Flamingos are naturally white or grey; they turn pink from the carotenoids in the algae and brine shrimp they eat.', category: 'Animals' }
];

export const COMPLIMENTS: ComplimentItem[] = [
  { id: 'c1', text: 'Aaj bhi aap kaafi awesome lag rahi hain.', mood: 'Classic' },
  { id: 'c2', text: 'Your existence improves the internet.', mood: 'Global' },
  { id: 'c3', text: 'Aapki hassi se kisi ka pura din ban jaata hai, bina kisi notice ke.', mood: 'Wholesome' },
  { id: 'c4', text: 'Overthinking mein agar PhD milti, toh aap University ki Dean hotin.', mood: 'Playful' },
  { id: 'c5', text: 'Aapke jokes 10/10 hote hain, chahe delivery thodi late ho.', mood: 'Cheeky' },
  { id: 'c6', text: 'Duniya mein confusion bohot hai, par aapki vibe ekdum clear aur mast hai.', mood: 'Calm' },
  { id: 'c7', text: 'Agar drama ek art form hota, toh aap Picasso hotin.', mood: 'Dramatic' },
  { id: 'c8', text: 'Aap jitna bura gaati hain, utne hi pyaar se log sunte hain.', mood: 'Playful' },
  { id: 'c9', text: 'Aapka swag dekh kar GPS bhi apna route change kar leta hai.', mood: 'Bold' },
  { id: 'c10', text: 'Zindagi thodi complicated hai, par aapke saath baat karke sab easy lagta hai.', mood: 'Sincere' },
  { id: 'c11', text: 'Aap chahe kitna bhi gussa karein, lagti phir bhi cute hi hain.', mood: 'Sweet' },
  { id: 'c12', text: 'Aapka standard sense of humour certified gold medal level ka hai.', mood: 'Confidence' },
  { id: 'c13', text: 'Aapki chai pine ki seriousness dekh kar Britishers bhi dar jaate.', mood: 'Chai Lover' },
  { id: 'c14', text: 'Aap jaisa koi nahi hai, aur thank god ek hi piece banaya uparwale ne!', mood: 'Unique' },
  { id: 'c15', text: 'Madam Ji, aapka presence hi kisi boring conversation ko party bana deta hai.', mood: 'Vibrant' },
  { id: 'c16', text: 'Jab aap bolti hain toh lagta hai audio track mein sunshine play ho rahi ho.', mood: 'Gentle' }
];

export const CHAOS_COMBOS: ChaosCombo[] = [
  {
    id: 'k1',
    toast: 'Alert: Dimaag mein thoda extra ghee daala gaya!',
    reactionHeadline: 'Dharrate Kaat Diye!',
    reactionBody: 'System ne 100% nonsensical energy detect ki hai. Tension lene ka nahi, dene ka!',
    soundPitch: 520,
    animType: 'wiggle'
  },
  {
    id: 'k2',
    toast: 'OMFOOOOO! Emergency overthinking detected!',
    reactionHeadline: 'Break lagao Madam Ji!',
    reactionBody: 'Gaadi ki speed badhao, dimaag ki speed 50% slow karo.',
    soundPitch: 440,
    animType: 'bounce'
  },
  {
    id: 'k3',
    toast: 'Jethalal ne chashma pehan liya hai.',
    reactionHeadline: 'Ae pagal aurat! (Affectionately)',
    reactionBody: 'Babita ji dekh rahi hain, thoda tameez se button dabao.',
    soundPitch: 330,
    animType: 'pulse'
  },
  {
    id: 'k4',
    toast: 'WiFi ne signal de diya, tension na lo.',
    reactionHeadline: 'Full 5G Chaos Mode',
    reactionBody: 'Kripya seatbelt baandh lein, flight hawa mein lehrane wali hai.',
    soundPitch: 660,
    animType: 'flash'
  },
  {
    id: 'k5',
    toast: 'Dora ki mummy ka ek aur clue mila!',
    reactionHeadline: 'Exhibit 99: Samosa wrapper',
    reactionBody: 'Papa ji par shaq aur gehra ho gaya hai. Investigation chalu rakhein.',
    soundPitch: 587,
    animType: 'wiggle'
  },
  {
    id: 'k6',
    toast: 'Moye Moye background music activated!',
    reactionHeadline: 'Tragedy mein bhi swag!',
    reactionBody: 'Jab sab ulta ho raha ho, tab bas thoda muskura dena chahiye.',
    soundPitch: 392,
    animType: 'pulse'
  },
  {
    id: 'k7',
    toast: 'Choti Moti ne protocol break kar diya.',
    reactionHeadline: 'Classified Incident #404',
    reactionBody: 'Notice: Nakhre unchoot hain, entry bilkul free hai.',
    soundPitch: 700,
    animType: 'bounce'
  },
  {
    id: 'k8',
    toast: 'Mumma’s Boy ne safe side choose kiya.',
    reactionHeadline: 'Order In The House!',
    reactionBody: 'Adalat ne faisla safe rakh liya hai. Chai time ho gaya.',
    soundPitch: 494,
    animType: 'flash'
  },
  {
    id: 'k9',
    toast: 'Super-sonic yawn registered.',
    reactionHeadline: 'Battery 20%: Pillow Mode On',
    reactionBody: 'Kripya blanket ke andar retreat karein. Desh ko aapse aaraam chahiye.',
    soundPitch: 350,
    animType: 'pulse'
  },
  {
    id: 'k10',
    toast: 'Aayein? Baigan protocol active.',
    reactionHeadline: 'Kuch samajh nahi aaya par sunkar achha laga',
    reactionBody: 'Ye tha hamara certified high-definition nonsense response.',
    soundPitch: 800,
    animType: 'wiggle'
  }
];

