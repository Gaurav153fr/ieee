// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//  QUIZ RUSH — QUESTIONS DATA
//
//  ✏️  THIS IS THE ONLY FILE YOU NEED TO EDIT to add, remove,
//      or change questions. The game mechanics, UI and rendering
//      are completely separate and will NOT be affected.
//
//  FORMAT:
//    q       — the question string shown to the player
//    opts    — exactly [two, options]  (left gate, right gate)
//    correct — index of the correct answer: 0 = first, 1 = second
//
//  NOTE: The game randomly flips left/right at runtime so you
//        don't need to worry about which side is "always correct".
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export interface Question {
  q: string;
  opts: [string, string];
  correct: 0 | 1;
}

export const QUESTIONS: Question[] = [

// ── 🛡️ Cybersecurity Basics ──────────────────────────────
  { q: "What does 'VPN' stand for?",           opts: ["Virtual Private Network", "Very Private Node"],    correct: 0 },
  { q: "A 'strong' password should be?",       opts: ["Short & simple",          "Long & complex"],       correct: 1 },
  { q: "Which is more secure?",                opts: ["HTTP",                   "HTTPS"],                correct: 1 },
  { q: "What is 'Phishing'?",                  opts: ["A fake email/scam",      "A type of software"],   correct: 0 },
  { q: "Is 'Password123' a safe choice?",      opts: ["Yes, it's common",        "No, it's easy to guess"], correct: 1 },
  { q: "What does MFA stand for?",             opts: ["Multi-Factor Auth",       "Many File Access"],     correct: 0 },
  { q: "A 'Firewall' is used to?",             opts: ["Block unauthorized access", "Speed up internet"],  correct: 0 },
  { q: "Public Wi-Fi is generally...?",        opts: ["Always safe",             "Risky for banking"],    correct: 1 },
  { q: "A 'Trojan' is a type of...?",          opts: ["Virus/Malware",           "Hardware part"],        correct: 0 },
  { q: "What should you do with updates?",     opts: ["Install them ASAP",       "Ignore them forever"],  correct: 0 },

  // ── 🔒 Advanced Protection ───────────────────────────────
  { q: "Best way to store passwords?",         opts: ["Note on your desk",       "Password Manager"],     correct: 1 },
  { q: "What is 'Ransomware'?",                opts: ["Data held for money",     "A free gift"],          correct: 0 },
  { q: "Locking your screen (Win+L) is...?",   opts: ["A waste of time",         "Good security habit"],  correct: 1 },
  { q: "An 'Antivirus' scans for?",            opts: ["Malicious files",         "Unused photos"],        correct: 0 },
  { q: "Is '123456' a common password?",       opts: ["Yes, most common",        "No, very rare"],        correct: 0 },
  { q: "What is a 'Botnet'?",                  opts: ["Network of infected PCs", "A group of robots"],    correct: 0 },
  { q: "Spam emails often have...?",           opts: ["Urgent/Scary tone",       "Perfect grammar"],      correct: 0 },
  { q: "Social Engineering targets...?",       opts: ["Human psychology",        "Computer hardware"],    correct: 0 },
  { q: "Incognito mode hides you from...?",    opts: ["Local history only",      "The whole internet"],   correct: 0 },
  { q: "Backups help recover from...?",        opts: ["Data loss",               "Low battery"],          correct: 0 }

];

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//  HOW TO ADD A QUESTION:
//
//  { q: "Your question here?",
//    opts: ["Correct Answer", "Wrong Answer"],
//    correct: 0 },
//
//  Or if the second option is correct:
//
//  { q: "Your question here?",
//    opts: ["Wrong Answer", "Correct Answer"],
//    correct: 1 },
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
