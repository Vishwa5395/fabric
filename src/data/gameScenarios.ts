export type Trait = 'CHAOS' | 'OVERTHINK' | 'DETECTIVE';

export interface ScenarioOption {
  id: string;
  label: string; // <= 5 words
  trait: Trait;
  intensity: 1 | 2 | 3;
  verdict: string; // 1-2 lines
}

export interface Scenario {
  id: string;
  situation: string;
  isSpecial?: boolean;
  options: [ScenarioOption, ScenarioOption, ScenarioOption];
}

export const SCENARIOS: Scenario[] = [
  // 1. Instagram time warp
  {
    id: 's1',
    situation: 'You opened Instagram for five minutes. Somehow, 47 minutes have disappeared.',
    options: [
      {
        id: 's1-o1',
        label: 'Aayein? Baigan!',
        trait: 'CHAOS',
        intensity: 2,
        verdict: 'Adalat ne time machine ko suspend kar diya. Time waste nahi, ye toh high level meditation tha.'
      },
      {
        id: 's1-o2',
        label: 'Moye Moye mode on',
        trait: 'OVERTHINK',
        intensity: 3,
        verdict: '47 minutes ka grieving session jaari hai. Agle 2 ghante is pachtave par sochne mein jayenge.'
      },
      {
        id: 's1-o3',
        label: 'Jethalal mode activated',
        trait: 'DETECTIVE',
        intensity: 1,
        verdict: 'Investigation shuru: Instagram algorithm ne Babita ji ki profile par kitna samay roka?'
      }
    ]
  },
  // 2. 214 unread messages
  {
    id: 's2',
    situation: '214 unread messages in the group chat after you were away for 20 minutes.',
    options: [
      {
        id: 's2-o1',
        label: 'Send thumbs-up and mute',
        trait: 'CHAOS',
        intensity: 3,
        verdict: 'Ek thumbs up ne 214 messages ka wajood mita diya. Pura group shock mein hai!'
      },
      {
        id: 's2-o2',
        label: 'Read every single line',
        trait: 'DETECTIVE',
        intensity: 2,
        verdict: 'CBI level inspection complete. Pata chala 200 messages toh bas sticker aur "haan" the.'
      },
      {
        id: 's2-o3',
        label: 'Am I being excluded?',
        trait: 'OVERTHINK',
        intensity: 1,
        verdict: 'Adalat ne aashwasan diya: Unhone aapke bina baat ki matlab unhe guilt ho raha hoga.'
      }
    ]
  },
  // 3. Mummy asks "kuch khaya?"
  {
    id: 's3',
    situation: 'Mummy asks "kuch khaya?" right after you finished eating.',
    options: [
      {
        id: 's3-o1',
        label: 'Dharrate kaat rahi omfoooooo!',
        trait: 'CHAOS',
        intensity: 3,
        verdict: 'Mummy ne bola: "Speed dekho, plate chati gayi par pet mein kuch nahi gaya!"'
      },
      {
        id: 's3-o2',
        label: 'Show empty clean plate',
        trait: 'DETECTIVE',
        intensity: 1,
        verdict: 'Proof rejected by Supreme Mother Court: "Ye do roti se kya hota hai, thoda aur khao."'
      },
      {
        id: 's3-o3',
        label: 'Doubt my own memory',
        trait: 'OVERTHINK',
        intensity: 2,
        verdict: 'Kya sach mein maine khaya tha ya main bas plate dekh kar imagine kar rahi thi?'
      }
    ]
  },
  // 4. Snooze number eight
  {
    id: 's4',
    situation: 'The alarm rings. This is snooze number eight.',
    options: [
      {
        id: 's4-o1',
        label: 'Calculate remaining dream cycles',
        trait: 'OVERTHINK',
        intensity: 1,
        verdict: 'Aapne 14 complex mathematical equations solve kiye bas 7 minute aur sone ke liye.'
      },
      {
        id: 's4-o2',
        label: 'Ye phone hi rigged hai',
        trait: 'DETECTIVE',
        intensity: 2,
        verdict: 'Phone manufacturer par FIR darj: Alarm itna aggressive kyu bajta hai subah subah?'
      },
      {
        id: 's4-o3',
        label: 'Throw blanket and sprint',
        trait: 'CHAOS',
        intensity: 3,
        verdict: 'Rocket launch successful! Brush karte waqt hi socks pehanne ka record ban gaya.'
      }
    ]
  },
  // 5. Wrote three paragraphs, reply "k"
  {
    id: 's5',
    situation: 'You wrote three paragraphs. The reply is "k".',
    options: [
      {
        id: 's5-o1',
        label: 'Reply with dot "."',
        trait: 'CHAOS',
        intensity: 3,
        verdict: 'Cold War level retaliation! Ek akela dot samne wale ki neend uda chuka hai.'
      },
      {
        id: 's5-o2',
        label: 'Analyze lowercase vs capital',
        trait: 'OVERTHINK',
        intensity: 2,
        verdict: '"k" chota tha matlab careless, agar capital "K" hota toh passive aggressive hota... deep analysis!'
      },
      {
        id: 's5-o3',
        label: 'Audit typing speed logs',
        trait: 'DETECTIVE',
        intensity: 1,
        verdict: 'Accused suspect was clearly eating chips while replying. Court convicts them of laziness.'
      }
    ]
  },
  // 6. Message seen three hours ago
  {
    id: 's6',
    situation: 'Message seen three hours ago. No reply.',
    options: [
      {
        id: 's6-o1',
        label: 'Check their last active',
        trait: 'DETECTIVE',
        intensity: 2,
        verdict: 'Spy satellites deployed. Pata chala wo 2 minute pehle online the... ghor anadar!'
      },
      {
        id: 's6-o2',
        label: 'Post super cryptic status',
        trait: 'CHAOS',
        intensity: 3,
        verdict: 'Status posted: "Log kitne matlabi hote hain." Saare rishtedaar call karne lage.'
      },
      {
        id: 's6-o3',
        label: 'Did I sound rude?',
        trait: 'OVERTHINK',
        intensity: 1,
        verdict: 'Purani 4 chats re-read ki gayi. Verdict: Aap bohot polite thi, samne wala hi slow hai.'
      }
    ]
  },
  // 7. Wi-Fi drops at climax
  {
    id: 's7',
    situation: 'Wi-Fi drops just as the climax scene begins.',
    options: [
      {
        id: 's7-o1',
        label: 'Restart router with kick',
        trait: 'CHAOS',
        intensity: 3,
        verdict: 'Desi engineering strikes again. Router light green ho gayi darr ke maare.'
      },
      {
        id: 's7-o2',
        label: 'Write an alternate ending',
        trait: 'OVERTHINK',
        intensity: 2,
        verdict: 'Aapne climax khud hi bana liya, jo original movie se 10 guna zyada dramatic tha.'
      },
      {
        id: 's7-o3',
        label: 'Trace cable to pole',
        trait: 'DETECTIVE',
        intensity: 1,
        verdict: 'Investigator ne dhoondh nikala: Mohalle ke billi ne wire hila diya tha.'
      }
    ]
  },
  // 8. 5 minute mein pahunch raha hoon
  {
    id: 's8',
    situation: 'A friend says "bas 5 minute mein pahunch raha hoon" and is still at home.',
    options: [
      {
        id: 's8-o1',
        label: 'Order full meal without them',
        trait: 'CHAOS',
        intensity: 2,
        verdict: 'Food table par hai, dost abhi geyser on kar raha hai. Adalat approves eating first!'
      },
      {
        id: 's8-o2',
        label: 'Demand live GPS location',
        trait: 'DETECTIVE',
        intensity: 1,
        verdict: 'Busted! Location shows bedroom bed. Sentence: 3 plate momos sponsor karega.'
      },
      {
        id: 's8-o3',
        label: 'Maybe they had trouble?',
        trait: 'OVERTHINK',
        intensity: 3,
        verdict: 'Aapne 5 tragedy scenarios imagine kar liye jabki dost sirf socks dhoondh raha tha.'
      }
    ]
  },
  // 9. Cleaned cupboard, 10 min later same
  {
    id: 's9',
    situation: 'You cleaned the cupboard. Ten minutes later it looks exactly the same as before.',
    options: [
      {
        id: 's9-o1',
        label: 'Close doors, pretend blind',
        trait: 'CHAOS',
        intensity: 1,
        verdict: 'Out of sight, out of mind. The universe is at peace once again.'
      },
      {
        id: 's9-o2',
        label: 'Investigate black hole effect',
        trait: 'DETECTIVE',
        intensity: 2,
        verdict: 'Scientific observation: Kapde aapas mein multiply hone ki chemical ability rakhte hain.'
      },
      {
        id: 's9-o3',
        label: 'Question meaning of order',
        trait: 'OVERTHINK',
        intensity: 3,
        verdict: 'Entropy is natural law of thermodynamics. Madam Ji, physics aapse sehmat hai.'
      }
    ]
  },
  // 10. DORA KI MUMMY SPECIAL HEARING (Always included)
  {
    id: 's10',
    situation: 'DORA KI MUMMY SPECIAL HEARING: New evidence has arrived in the case of Dora\'s missing mother. Which official should be questioned next?',
    isSpecial: true,
    options: [
      {
        id: 's10-o1',
        label: 'Question Dora\'s father immediately',
        trait: 'DETECTIVE',
        intensity: 3,
        verdict: 'Primary suspect summoned! Papa ji ne bola: "Main toh bas bazaar gaya tha." Court unconvinced.'
      },
      {
        id: 's10-o2',
        label: 'Does question make sense?',
        trait: 'OVERTHINK',
        intensity: 1,
        verdict: 'First we must ponder: Dora khud map se rasta poochti hai, toh mummy kahan se dhoondhegi?'
      },
      {
        id: 's10-o3',
        label: 'Summon mohalla, order chai',
        trait: 'CHAOS',
        intensity: 2,
        verdict: 'Full street court assembled with hot samosas! Investigation can wait, gossip is priority.'
      }
    ]
  },
  // 11. Mumma's Boy Allegation
  {
    id: 's11',
    situation: 'A new allegation reaches the court: the accused is a "Mumma\'s Boy." How do you proceed?',
    options: [
      {
        id: 's11-o1',
        label: 'Guilty as charged! Period.',
        trait: 'CHAOS',
        intensity: 3,
        verdict: 'Faisla sunaya gaya: "Mumma ne bola hai dhoop mein mat jao" kehne par 10 saal ki suspension.'
      },
      {
        id: 's11-o2',
        label: 'Subpoena mummy\'s kitchen menu',
        trait: 'DETECTIVE',
        intensity: 2,
        verdict: 'Exhibit A: Tiffin mein roz parathe aate hain. Direct evidence of privileged pampering!'
      },
      {
        id: 's11-o3',
        label: 'Is being caring bad?',
        trait: 'OVERTHINK',
        intensity: 1,
        verdict: 'Adalat ne philosophical debate shuru kar di: Parivaar prem aur mumma\'s boy mein kitna faasla hai?'
      }
    ]
  },
  // 12. Boyfriend vs Father statement
  {
    id: 's12',
    situation: 'A witness statement is read out: "Mera boyfriend mujhe lene aa raha hai." (It was her father.) How do you rule?',
    options: [
      {
        id: 's12-o1',
        label: 'Accept terminology as supreme',
        trait: 'CHAOS',
        intensity: 2,
        verdict: 'Court rules: Papa is the original and forever best boyfriend. Motion granted with loud applause!'
      },
      {
        id: 's12-o2',
        label: 'Check dictionary definition',
        trait: 'OVERTHINK',
        intensity: 3,
        verdict: 'Words are fluid, meanings are social constructs. Lekin sunkar sabka dimaag ghoom gaya!'
      },
      {
        id: 's12-o3',
        label: 'Cross-examine the car driver',
        trait: 'DETECTIVE',
        intensity: 1,
        verdict: 'Papa ji rolled down window: "Haan main hi boyfriend hoon, chalo baitho gadi mein!" Case closed.'
      }
    ]
  }
];

