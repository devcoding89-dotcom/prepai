import type { Difficulty, Exam, Question, TextbookChapter } from "@/lib/types";

type QTuple = [
  Exam,
  string, // subject
  string, // topic
  string, // question
  string[], // options
  string, // answer letter
  string, // explanation
  Difficulty,
  number, // year
];

/**
 * Starter question bank with full subject coverage.
 */
const Q: QTuple[] = [
  // ---------------------------------------------------------------------------
  // JAMB Mathematics
  // ---------------------------------------------------------------------------
  ["JAMB","Mathematics","Quadratic Equations","Solve for x: x² − 5x + 6 = 0",["x = 2 or 3","x = −2 or −3","x = 1 or 6","x = −1 or −6"],"A","Factorise: (x − 2)(x − 3) = 0 ⇒ x = 2 or x = 3.","easy",2023],
  ["JAMB","Mathematics","Quadratic Equations","If the roots of 2x² + kx + 8 = 0 are equal, find k.",["±4","±8","±16","±2"],"B","Equal roots ⇒ discriminant = 0: k² − 4(2)(8) = 0 ⇒ k² = 64 ⇒ k = ±8.","medium",2021],
  ["JAMB","Mathematics","Quadratic Equations","Find the sum of the roots of 3x² − 12x + 7 = 0.",["4","−4","7/3","12"],"A","Sum of roots = −b/a = 12/3 = 4.","easy",2019],
  ["JAMB","Mathematics","Indices and Logarithms","Simplify: log₁₀ 8 + log₁₀ 5 − log₁₀ 4",["1","2","10","0.5"],"A","log(8×5/4) = log 10 = 1.","easy",2020],
  ["JAMB","Mathematics","Indices and Logarithms","If 2^(x+1) = 32, find x.",["3","4","5","6"],"B","32 = 2⁵ ⇒ x + 1 = 5 ⇒ x = 4.","easy",2022],
  ["JAMB","Mathematics","Trigonometry","Evaluate sin 30° + cos 60°",["0.5","1","1.5","0"],"B","sin 30° = 0.5, cos 60° = 0.5 ⇒ sum = 1.","easy",2018],
  ["JAMB","Mathematics","Trigonometry","A ladder 10 m long leans against a wall making 60° with the ground. How high up the wall does it reach?",["5 m","8.66 m","10 m","7.07 m"],"B","Height = 10 sin 60° = 10(0.866) = 8.66 m.","medium",2021],
  ["JAMB","Mathematics","Calculus","Differentiate y = 3x³ − 5x with respect to x.",["9x² − 5","3x² − 5","9x³ − 5x","6x − 5"],"A","dy/dx = 9x² − 5.","easy",2022],
  ["JAMB","Mathematics","Calculus","Evaluate ∫(2x + 3) dx",["x² + 3x + c","2x² + 3x + c","x² + 3 + c","2x + c"],"A","∫2x dx = x², ∫3 dx = 3x ⇒ x² + 3x + c.","easy",2020],
  ["JAMB","Mathematics","Statistics","The mean of 5, 8, 11, x and 12 is 9. Find x.",["7","9","10","6"],"B","Sum = 45 ⇒ 36 + x = 45 ⇒ x = 9.","easy",2019],
  ["JAMB","Mathematics","Statistics","Find the median of: 3, 7, 2, 9, 4",["4","7","3","9"],"A","Ordered: 2,3,4,7,9 ⇒ median = 4.","easy",2021],
  ["JAMB","Mathematics","Probability","A fair die is thrown once. What is the probability of obtaining a prime number?",["1/2","1/3","2/3","1/6"],"A","Primes on a die: 2, 3, 5 ⇒ 3/6 = 1/2.","medium",2022],
  ["JAMB","Mathematics","Number Bases","Convert 25₁₀ to base 2.",["11001","10011","11010","10101"],"A","25 = 16 + 8 + 1 = 11001₂.","medium",2018],
  ["JAMB","Mathematics","Geometry","The interior angle of a regular polygon is 150°. How many sides has it?",["10","12","8","15"],"B","Exterior = 30° ⇒ n = 360/30 = 12.","medium",2020],
  ["JAMB","Mathematics","Sequences and Series","Find the 10th term of the AP: 3, 7, 11, …",["39","43","36","40"],"A","a = 3, d = 4 ⇒ T₁₀ = 3 + 9(4) = 39.","easy",2023],

  // ---------------------------------------------------------------------------
  // JAMB Further Mathematics
  // ---------------------------------------------------------------------------
  ["JAMB","Further Mathematics","Matrices and Determinants","Find the determinant of the 2x2 matrix [[3, 2], [1, 4]].",["10","14","12","8"],"A","det = (3 × 4) − (2 × 1) = 12 − 2 = 10.","easy",2023],
  ["JAMB","Further Mathematics","Matrices and Determinants","If the matrix [[k, 3], [2, 6]] is singular, find the value of k.",["1","2","3","0"],"A","A singular matrix has det = 0: 6k − 6 = 0 ⇒ k = 1.","medium",2022],
  ["JAMB","Further Mathematics","Vectors","Find the dot product of vectors u = 2i + 3j and v = 4i − j.",["5","11","8","10"],"A","u · v = (2)(4) + (3)(−1) = 8 − 3 = 5.","easy",2021],
  ["JAMB","Further Mathematics","Vectors","Calculate the magnitude of vector r = 3i − 4j + 12k.",["13","19","15","12"],"A","|r| = √(3² + (−4)² + 12²) = √(9 + 16 + 144) = √169 = 13.","medium",2020],
  ["JAMB","Further Mathematics","Calculus","Find the derivative of y = e^(2x) · sin(x).",["e^(2x)(2 sin x + cos x)","2e^(2x) cos x","e^(2x) cos x","2e^(2x) sin x"],"A","Product rule: dy/dx = (2e^(2x))sin x + (e^(2x))cos x = e^(2x)(2 sin x + cos x).","hard",2022],
  ["JAMB","Further Mathematics","Calculus","Evaluate the limit as x approaches 0 of (sin 3x) / x.",["3","1","0","1/3"],"A","lim_{x->0} (sin 3x)/x = 3 lim_{x->0} (sin 3x)/(3x) = 3(1) = 3.","medium",2019],
  ["JAMB","Further Mathematics","Mechanics","A particle of mass 2 kg moves with velocity v = 6i + 8j m/s. Find its kinetic energy.",["100 J","50 J","200 J","28 J"],"A","Speed v = √(6² + 8²) = 10 m/s. KE = 1/2 m v² = 1/2 (2)(100) = 100 J.","medium",2023],
  ["JAMB","Further Mathematics","Sequences and Series","Find the sum to infinity of the GP: 16, 8, 4, 2, ...",["32","64","24","48"],"A","S_∞ = a / (1 − r) = 16 / (1 − 1/2) = 16 / 0.5 = 32.","easy",2021],
  ["JAMB","Further Mathematics","Trigonometric Identities","Express cos(2θ) in terms of sin θ.",["1 − 2 sin²θ","2 sin²θ − 1","1 + 2 sin²θ","2 cos²θ − 1"],"A","cos 2θ = cos²θ − sin²θ = (1 − sin²θ) − sin²θ = 1 − 2 sin²θ.","easy",2020],
  ["JAMB","Further Mathematics","Probability and Combinations","In how many ways can a committee of 3 be chosen from 7 people?",["35","21","42","210"],"A","7C3 = 7! / (3! 4!) = (7 × 6 × 5) / (3 × 2 × 1) = 35.","medium",2022],

  // ---------------------------------------------------------------------------
  // JAMB Civic Education
  // ---------------------------------------------------------------------------
  ["JAMB","Civic Education","Human Rights","Which international body adopted the Universal Declaration of Human Rights in 1948?",["United Nations General Assembly","African Union","League of Nations","Commonwealth of Nations"],"A","The UN General Assembly adopted the UDHR on December 10, 1948.","easy",2023],
  ["JAMB","Civic Education","Citizenship","A foreigner who meets constitutional requirements can acquire Nigerian citizenship through",["Naturalisation","Birth","Conquest","Registration by marriage for males"],"A","Under the Nigerian Constitution, non-nationals can acquire citizenship by naturalisation.","easy",2022],
  ["JAMB","Civic Education","Democracy and Rule of Law","Which of the following is a fundamental pillar of the Rule of Law?",["Equality before the law","Immunity for all public officials","Supremacy of the executive over the judiciary","Military decrees"],"A","Rule of law requires that all citizens and institutions are equally accountable before ordinary law.","easy",2021],
  ["JAMB","Civic Education","National Values","The civic virtue of telling the truth and being transparent in public office is known as",["Integrity and honesty","Courage","Selfishness","Nationalism"],"A","Integrity and honesty are core national values essential for public accountability.","easy",2020],
  ["JAMB","Civic Education","Cultism and Drug Abuse","Which agency in Nigeria is primarily responsible for tackling illicit drug trafficking?",["NDLEA","NAFDAC","EFCC","ICPC"],"A","National Drug Law Enforcement Agency (NDLEA) is tasked with combating drug abuse and trafficking.","easy",2022],
  ["JAMB","Civic Education","Public Service","Which body is constitutionally mandated to receive assets declaration of public officers in Nigeria?",["Code of Conduct Bureau","Federal Civil Service Commission","National Assembly","Public Complaints Commission"],"A","The Code of Conduct Bureau (CCB) maintains the asset declaration register.","medium",2021],
  ["JAMB","Civic Education","Peace and Conflict","The process of settling a dispute through a neutral third party whose decision is binding is called",["Arbitration","Mediation","Reconciliation","Negotiation"],"A","Arbitration involves an independent arbiter whose ruling the disputants agree to respect.","medium",2023],

  // ---------------------------------------------------------------------------
  // JAMB Literature in English
  // ---------------------------------------------------------------------------
  ["JAMB","Literature in English","Literary Devices","The phrase 'The angry wind screamed throughout the night' is an example of",["Personification","Oxymoron","Synecdoche","Hyperbole"],"A","Giving human actions/emotions to non-human elements (wind screaming) is personification.","easy",2023],
  ["JAMB","Literature in English","Drama","The tragic flaw that leads to the downfall of a tragic hero is technically called",["Hamartia","Hubris","Catharsis","Anagnorisis"],"A","Hamartia is the inherent tragic flaw or error of judgment leading to downfall.","medium",2022],
  ["JAMB","Literature in English","Poetry","A poem of fourteen lines structured in iambic pentameter with a specific rhyme scheme is a",["Sonnet","Ballad","Ode","Elegy"],"A","A sonnet consists of 14 lines (Petrarchan or Shakespearean).","easy",2021],
  ["JAMB","Literature in English","Prose","The main character who drives the plot in a narrative work is known as the",["Protagonist","Antagonist","Foil","Narrator"],"A","The protagonist is the central character of the story.","easy",2020],
  ["JAMB","Literature in English","Literary Devices","'Cruel kindness' and 'deafening silence' are classic examples of",["Oxymoron","Metaphor","Euphemism","Irony"],"A","An oxymoron pairs contradictory terms together for rhetorical effect.","easy",2022],
  ["JAMB","Literature in English","Drama","A speech in a play where a character speaks their inner thoughts aloud alone on stage is a",["Soliloquy","Monologue","Aside","Dialogue"],"A","A soliloquy reveals innermost thoughts directly to the audience without other characters present.","medium",2021],
  ["JAMB","Literature in English","Poetry","A poem written in memory of someone who has died is known as an",["Elegy","Epic","Ode","Epistle"],"A","An elegy is a mournful, contemplative poem lamenting the death of an individual.","easy",2023],

  // ---------------------------------------------------------------------------
  // JAMB Arabic
  // ---------------------------------------------------------------------------
  ["JAMB","Arabic","Arabic Grammar (Nahw)","In Arabic grammar, the subject that performs the action (الفاعل) is always in which grammatical state?",["Marfu' (مرفوع)","Mansub (منصوب)","Majrur (مجرور)","Majzum (مجزوم)"],"A","Al-Fa'il (the doer of the verb) is always in the nominative state (Marfu').","medium",2023],
  ["JAMB","Arabic","Arabic Grammar (Nahw)","Which of the following particles makes the present tense verb (المضارع) Mansub (منصوب)?",["أَنْ (An)","لَمْ (Lam)","إِنْ (In)","هَلْ (Hal)"],"A","'An' (أَنْ) is among the particles of nasb that give the present verb a fatha.","medium",2022],
  ["JAMB","Arabic","Vocabulary (Mufradat)","What is the plural (جمع) of the Arabic word 'كِتَاب' (Book)?",["كُتُب (Kutub)","كَاتِبُون (Katibun)","مَكْتَبَات (Maktabat)","كِتَابَات (Kitabat)"],"A","The broken plural of Kitab (كتاب) is Kutub (كتب).","easy",2021],
  ["JAMB","Arabic","Morphology (Sarf)","What is the root verb (الفعل الماضي) for the derived word 'مُدَرِّس' (Teacher)?",["دَرَسَ / دَرَّسَ","دِرَاسَة","مَدْرَسَة","يَدْرُسُ"],"A","The root verb is derived from the triliteral root D-R-S (د-ر-س).","easy",2020],
  ["JAMB","Arabic","Vocabulary (Mufradat)","What is the opposite (ضد) of the Arabic word 'جَدِيد' (New)?",["قَدِيم (Old)","كَبِير (Big)","صَغِير (Small)","جَمِيل (Beautiful)"],"A","Qadeem (قديم) means old, which is the antonym of Jadeed (جديد).","easy",2022],
  ["JAMB","Arabic","Arabic Grammar (Nahw)","What role does the noun following a preposition (حرف الجر) play?",["Majrur (مجرور)","Marfu' (مرفوع)","Mansub (منصوب)","Mabni (مبني)"],"A","Ism Majrur takes the genitive case after prepositions like fi, 'ala, min, ila.","easy",2021],

  // ---------------------------------------------------------------------------
  // JAMB Islamic Studies (IRS)
  // ---------------------------------------------------------------------------
  ["JAMB","Islamic Studies (IRS)","Tawheed","The fundamental belief in the absolute oneness and uniqueness of Allah is termed",["Tawheed","Shirk","Risalah","Akhirah"],"A","Tawheed is the foundational pillar of Islamic monotheism.","easy",2023],
  ["JAMB","Islamic Studies (IRS)","Pillars of Islam","Which pillar of Islam becomes obligatory upon able-bodied Muslims with financial and physical means once in a lifetime?",["Hajj","Zakat","Sawm","Salat"],"A","Hajj (pilgrimage to Makkah) is obligatory once in a lifetime for those who can afford it.","easy",2022],
  ["JAMB","Islamic Studies (IRS)","Hadith Studies","A Hadith whose chain of transmission (Isnad) is unbroken with trustworthy narrators is classified as",["Sahih (Authentic)","Da'if (Weak)","Mawdu' (Fabricated)","Mursal"],"A","Sahih Hadith satisfies continuous sanad, uprightness, and accuracy of transmitters.","medium",2021],
  ["JAMB","Islamic Studies (IRS)","Sirah","The migration of Prophet Muhammad (PBUH) from Makkah to Madinah is known as the",["Hijrah","Isra'","Mi'raj","Fath Makkah"],"A","The Hijrah took place in 622 CE and marks the beginning of the Islamic lunar calendar.","easy",2020],
  ["JAMB","Islamic Studies (IRS)","Quranic Studies","Which Surah is considered the 'Mother of the Book' (Umm al-Kitab) and recited in every Rak'ah of prayer?",["Surah Al-Fatihah","Surah Al-Baqarah","Surah Ya-Sin","Surah Al-Ikhlas"],"A","Surah Al-Fatihah (The Opening) is recited in every unit of Islamic prayer.","easy",2022],
  ["JAMB","Islamic Studies (IRS)","Islamic Jurisprudence","The minimum amount of wealth on which Zakat becomes payable is known as the",["Nisab","Zakat al-Fitr","Kaffarah","Fidyah"],"A","Nisab is the threshold value above which a Muslim is required to pay Zakat (2.5%).","medium",2021],

  // ---------------------------------------------------------------------------
  // JAMB Christian Religious Studies (CRS)
  // ---------------------------------------------------------------------------
  ["JAMB","Christian Religious Studies (CRS)","Old Testament","Who was chosen by God to lead the Israelites out of Egyptian bondage?",["Moses","Aaron","Joshua","Gideon"],"A","Moses was commissioned at Mount Horeb (the burning bush) to deliver Israel.","easy",2023],
  ["JAMB","Christian Religious Studies (CRS)","Old Testament","Which prophet confronted the 450 prophets of Baal on Mount Carmel?",["Elijah","Elisha","Amos","Jeremiah"],"A","Prophet Elijah challenged the prophets of Baal and fire consumed his sacrifice on Mount Carmel.","easy",2022],
  ["JAMB","Christian Religious Studies (CRS)","New Testament","In the Sermon on the Mount, Jesus taught: 'Blessed are the peacemakers, for they shall be called...'",["Sons of God","Children of Abraham","Inheritors of the earth","Comforted"],"A","Matthew 5:9 — 'Blessed are the peacemakers, for they will be called children of God.'","easy",2021],
  ["JAMB","Christian Religious Studies (CRS)","Early Church","Who was the first Christian martyr stoned to death for his faith in the Book of Acts?",["Stephen","James","Philip","Peter"],"A","Stephen was martyred by stoning outside Jerusalem (Acts 7).","easy",2020],
  ["JAMB","Christian Religious Studies (CRS)","New Testament Epistles","According to Paul in 1 Corinthians 13, which virtue is the greatest among faith, hope, and love?",["Love (Charity)","Faith","Hope","Prophecy"],"A","1 Corinthians 13:13 — 'And now these three remain: faith, hope and love. But the greatest of these is love.'","easy",2022],
  ["JAMB","Christian Religious Studies (CRS)","Prophets","Which Old Testament prophet emphasized social justice and condemned the oppression of the poor in Israel?",["Amos","Hosea","Jonah","Nahum"],"A","Amos was the prophet of social justice who declared 'Let justice roll down like waters'.","medium",2021],

  // ---------------------------------------------------------------------------
  // JAMB Computer Studies
  // ---------------------------------------------------------------------------
  ["JAMB","Computer Studies","Hardware Components","Which component of the Central Processing Unit performs arithmetic and logical operations?",["ALU (Arithmetic Logic Unit)","Control Unit","Registers","Cache Memory"],"A","The ALU carries out arithmetic (+, -, *, /) and comparison/logical decisions.","easy",2023],
  ["JAMB","Computer Studies","Number Systems","Convert the binary number 1010₂ to decimal (base 10).",["10","12","8","14"],"A","1010₂ = (1 × 2³) + (0 × 2²) + (1 × 2¹) + (0 × 2⁰) = 8 + 0 + 2 + 0 = 10.","easy",2022],
  ["JAMB","Computer Studies","Software and OS","An operating system is best categorized as what type of software?",["System software","Application software","Utility software","Firmware"],"A","Operating systems like Windows, Linux, and macOS manage computer resources as system software.","easy",2021],
  ["JAMB","Computer Studies","Networking and Internet","What network topology connects all nodes to a single central hub or switch?",["Star topology","Bus topology","Ring topology","Mesh topology"],"A","In a star topology, each node connects independently to a central device.","easy",2020],
  ["JAMB","Computer Studies","Cybersecurity and Ethics","Malicious software designed to block access to a computer system until a sum of money is paid is called",["Ransomware","Spyware","Trojan horse","Adware"],"A","Ransomware encrypts user files and demands payment for the decryption key.","medium",2022],
  ["JAMB","Computer Studies","Computer Storage","Which type of computer memory is non-volatile and contains firmware like BIOS?",["ROM","RAM","SRAM","DRAM"],"A","Read-Only Memory (ROM) retains its content even when the computer is powered off.","easy",2021],

  // ---------------------------------------------------------------------------
  // JAMB Agricultural Science
  // ---------------------------------------------------------------------------
  ["JAMB","Agricultural Science","Soil Science","The primary plant nutrient responsible for lush vegetative and leaf growth is",["Nitrogen","Phosphorus","Potassium","Calcium"],"A","Nitrogen (N) promotes rapid leafy and vegetative development in plants.","easy",2023],
  ["JAMB","Agricultural Science","Crop Production","Which of the following is a leguminous crop capable of fixing atmospheric nitrogen in the soil?",["Groundnut (Peanut)","Maize","Cassava","Yam"],"A","Legumes such as groundnut, cowpea, and soybean harbor Rhizobium bacteria in their root nodules.","easy",2022],
  ["JAMB","Agricultural Science","Animal Husbandry","The true stomach of a ruminant animal such as cattle or goat is the",["Abomasum","Rumen","Reticulum","Omasum"],"A","The abomasum is the fourth compartment and the glandular true stomach.","medium",2021],
  ["JAMB","Agricultural Science","Farm Tools and Machinery","The farm implement used for secondary tillage to break down clods and smooth the seedbed is a",["Harrow","Disc plough","Ridger","Planter"],"A","Harrows pulverize soil clods after initial ploughing.","easy",2020],

  // ---------------------------------------------------------------------------
  // JAMB Commerce & Accounting
  // ---------------------------------------------------------------------------
  ["JAMB","Commerce","Trade and Channels","The middleman who buys goods in bulk from producers and sells in smaller quantities to retailers is the",["Wholesaler","Retailer","Agent","Consumer"],"A","Wholesalers bridge the gap between large-scale manufacturers and retail outlets.","easy",2023],
  ["JAMB","Commerce","Insurance","The insurance principle stating that the insured should be restored to their previous financial position is",["Indemnity","Insurable interest","Utmost good faith","Subrogation"],"A","Indemnity prevents profiting from a loss by restoring the exact financial state.","medium",2022],
  ["JAMB","Accounting","Double Entry Principles","In double entry bookkeeping, an increase in an asset account is recorded as a",["Debit","Credit","Contra entry","Balance c/d"],"A","Under double entry: Debit increase in assets/expenses, Credit increase in liabilities/income.","easy",2023],
  ["JAMB","Accounting","Financial Statements","The summary statement showing a company's financial position (assets, liabilities, and equity) on a specific date is the",["Balance Sheet (Statement of Financial Position)","Trial Balance","Trading Account","Profit and Loss Account"],"A","The Balance Sheet presents assets and liabilities at a given point in time.","easy",2022],

  // ---------------------------------------------------------------------------
  // JAMB Geography
  // ---------------------------------------------------------------------------
  ["JAMB","Geography","Physical Geography","The process by which rocks break down in situ without being transported is called",["Weathering","Erosion","Mass wasting","Deposition"],"A","Weathering is the disintegration and decomposition of rocks in place.","easy",2023],
  ["JAMB","Geography","Earth and Solar System","The rotation of the Earth on its axis once every 24 hours causes",["Day and night","The four seasons","Eclipse of the moon","Solstices"],"A","Day and night result from the Earth spinning 360° on its polar axis every 24 hours.","easy",2022],

  // ---------------------------------------------------------------------------
  // JAMB Physics
  // ---------------------------------------------------------------------------
  ["JAMB","Physics","Projectile Motion","A body is projected with velocity 20 m/s at 30° to the horizontal. Find its time of flight. (g = 10 m/s²)",["1 s","2 s","4 s","0.5 s"],"B","T = 2u sinθ/g = 2(20)(0.5)/10 = 2 s.","medium",2021],
  ["JAMB","Physics","Projectile Motion","The maximum height reached by a projectile fired at 40 m/s vertically upward is (g = 10 m/s²)",["40 m","80 m","160 m","20 m"],"B","H = u²/2g = 1600/20 = 80 m.","medium",2019],
  ["JAMB","Physics","Newton's Laws","A force of 20 N acts on a 4 kg mass. Its acceleration is",["5 m/s²","80 m/s²","0.2 m/s²","24 m/s²"],"A","a = F/m = 20/4 = 5 m/s².","easy",2022],
  ["JAMB","Physics","Newton's Laws","The law of inertia is also known as",["Newton's first law","Newton's second law","Newton's third law","Hooke's law"],"A","Newton's first law states a body remains at rest or in uniform motion unless acted upon by an external force.","easy",2018],
  ["JAMB","Physics","Electricity","Three 6 Ω resistors are connected in parallel. The effective resistance is",["18 Ω","2 Ω","6 Ω","0.5 Ω"],"B","1/R = 3/6 ⇒ R = 2 Ω.","medium",2020],
  ["JAMB","Physics","Electricity","The unit of electrical resistance is",["Volt","Ampere","Ohm","Watt"],"C","Resistance is measured in ohms (Ω).","easy",2017],
  ["JAMB","Physics","Waves","A wave of frequency 50 Hz has a wavelength of 4 m. Its speed is",["200 m/s","12.5 m/s","54 m/s","0.08 m/s"],"A","v = fλ = 50 × 4 = 200 m/s.","easy",2021],
  ["JAMB","Physics","Waves","Sound cannot travel through",["Solids","Liquids","Gases","Vacuum"],"D","Sound is a mechanical wave and requires a material medium.","easy",2019],
  ["JAMB","Physics","Heat Energy","The quantity of heat required to raise the temperature of 2 kg of water by 10 °C is (c = 4200 J/kg·K)",["8400 J","84000 J","42000 J","21000 J"],"B","Q = mcΔθ = 2 × 4200 × 10 = 84,000 J.","medium",2022],
  ["JAMB","Physics","Optics","An object placed 10 cm from a concave mirror of focal length 5 cm forms an image at",["10 cm, real","5 cm, virtual","infinity","20 cm, virtual"],"A","1/v = 1/f − 1/u = 1/5 − 1/10 = 1/10 ⇒ v = 10 cm (real, inverted, same size).","hard",2020],

  // ---------------------------------------------------------------------------
  // JAMB Chemistry
  // ---------------------------------------------------------------------------
  ["JAMB","Chemistry","Atomic Structure","The number of neutrons in ³⁵₁₇Cl is",["17","18","35","52"],"B","Neutrons = mass number − atomic number = 35 − 17 = 18.","easy",2021],
  ["JAMB","Chemistry","Atomic Structure","Isotopes of an element differ in the number of",["Protons","Electrons","Neutrons","Energy levels"],"C","Isotopes have the same protons but different neutrons.","easy",2018],
  ["JAMB","Chemistry","Organic Chemistry","The general formula of alkanes is",["CnH2n","CnH2n+2","CnH2n−2","CnHn"],"B","Alkanes are saturated hydrocarbons with formula CnH2n+2.","easy",2022],
  ["JAMB","Chemistry","Organic Chemistry","Which of these is an unsaturated hydrocarbon?",["Ethane","Propane","Ethene","Methane"],"C","Ethene (C₂H₄) contains a carbon–carbon double bond.","easy",2020],
  ["JAMB","Chemistry","Organic Chemistry","The IUPAC name of CH₃CH₂OH is",["Methanol","Ethanol","Ethanal","Ethanoic acid"],"B","Two carbons with an –OH group ⇒ ethanol.","easy",2019],
  ["JAMB","Chemistry","Acids Bases and Salts","A solution with pH 3 is",["Strongly basic","Weakly basic","Acidic","Neutral"],"C","pH below 7 indicates an acidic solution.","easy",2021],
  ["JAMB","Chemistry","Mole Concept","How many moles are in 44 g of CO₂? (C = 12, O = 16)",["0.5","1","2","4"],"B","Molar mass of CO₂ = 44 g/mol ⇒ 44/44 = 1 mole.","easy",2022],
  ["JAMB","Chemistry","Mole Concept","The volume occupied by 0.5 mole of a gas at s.t.p. is",["11.2 dm³","22.4 dm³","5.6 dm³","44.8 dm³"],"A","1 mole occupies 22.4 dm³ ⇒ 0.5 × 22.4 = 11.2 dm³.","medium",2020],
  ["JAMB","Chemistry","Electrolysis","During the electrolysis of acidified water, the gas liberated at the anode is",["Hydrogen","Oxygen","Chlorine","Nitrogen"],"B","Oxidation of water at the anode liberates oxygen.","medium",2018],
  ["JAMB","Chemistry","Periodic Table","Elements in the same group of the periodic table have the same",["Atomic mass","Number of valence electrons","Number of neutrons","Atomic number"],"B","Group members share the same number of valence electrons.","easy",2021],

  // ---------------------------------------------------------------------------
  // JAMB Biology
  // ---------------------------------------------------------------------------
  ["JAMB","Biology","Cell Biology","The powerhouse of the cell is the",["Ribosome","Mitochondrion","Nucleus","Golgi body"],"B","Mitochondria produce ATP through cellular respiration.","easy",2020],
  ["JAMB","Biology","Cell Biology","Which structure is present in plant cells but absent in animal cells?",["Cell membrane","Cell wall","Nucleus","Cytoplasm"],"B","Plant cells have a cellulose cell wall.","easy",2019],
  ["JAMB","Biology","Genetics","A cross between two heterozygous tall pea plants (Tt × Tt) gives a phenotypic ratio of",["1:1","3:1","9:3:3:1","1:2:1"],"B","Monohybrid cross ⇒ 3 tall : 1 short.","medium",2021],
  ["JAMB","Biology","Genetics","The sex chromosomes of a normal human male are",["XX","XY","YY","XO"],"B","Human males are XY.","easy",2018],
  ["JAMB","Biology","Ecology","Organisms that manufacture their own food are called",["Consumers","Producers","Decomposers","Parasites"],"B","Producers (autotrophs) synthesise food via photosynthesis.","easy",2022],
  ["JAMB","Biology","Nutrition","The end product of carbohydrate digestion is",["Amino acids","Glucose","Fatty acids","Glycerol"],"B","Carbohydrates are broken down to simple sugars, mainly glucose.","easy",2020],
  ["JAMB","Biology","Circulatory System","The blood vessel that carries oxygenated blood from the lungs to the heart is the",["Pulmonary artery","Pulmonary vein","Aorta","Vena cava"],"B","The pulmonary vein returns oxygenated blood to the left atrium.","medium",2021],

  // ---------------------------------------------------------------------------
  // JAMB Use of English
  // ---------------------------------------------------------------------------
  ["JAMB","Use of English","Synonyms","Choose the word nearest in meaning to ABUNDANT: The harvest was abundant this year.",["Scarce","Plentiful","Late","Poor"],"B","Abundant means existing in large quantities — plentiful.","easy",2021],
  ["JAMB","Use of English","Antonyms","Choose the option opposite in meaning to CANDID.",["Frank","Honest","Evasive","Open"],"C","Candid means frank/open; its opposite is evasive.","medium",2020],
  ["JAMB","Use of English","Lexis and Structure","Choose the correct option: Neither the teacher nor the students ___ present.",["was","were","is","has"],"B","With 'neither…nor', the verb agrees with the nearer subject 'students' ⇒ were.","medium",2022],
  ["JAMB","Use of English","Lexis and Structure","The meeting was postponed ___ the chairman's absence.",["because","due to","owing","in spite"],"B","'Due to' correctly introduces the noun phrase 'the chairman's absence'.","easy",2019],
  ["JAMB","Use of English","Idioms","'To bury the hatchet' means to",["Hide a weapon","Make peace","Dig a grave","Start a fight"],"B","The idiom means to end a quarrel and make peace.","easy",2018],
  ["JAMB","Use of English","Comprehension","In the sentence 'The boy who won the prize is my brother', the underlined clause 'who won the prize' functions as",["An adverbial clause","An adjectival clause","An noun clause","A prepositional phrase"],"B","It modifies the noun 'boy', so it is an adjectival (relative) clause.","medium",2021],
  ["JAMB","Use of English","Oral English","Choose the word with a different vowel sound from the others.",["beat","seat","great","meat"],"C","'Great' has /eɪ/ while the others have /iː/.","medium",2020],

  // ---------------------------------------------------------------------------
  // JAMB Economics / Government
  // ---------------------------------------------------------------------------
  ["JAMB","Economics","Demand and Supply","The law of demand states that, other things being equal, as price rises quantity demanded",["Rises","Falls","Remains constant","Doubles"],"B","There is an inverse relationship between price and quantity demanded.","easy",2021],
  ["JAMB","Economics","Demand and Supply","A good whose demand rises as income falls is called",["A normal good","An inferior good","A giffen good","A luxury good"],"B","Inferior goods have negative income elasticity of demand.","medium",2019],
  ["JAMB","Economics","Money and Banking","The main function of the Central Bank of Nigeria is to",["Accept deposits from the public","Issue currency and regulate money supply","Give loans to traders","Sell shares"],"B","The CBN is the apex bank responsible for currency issue and monetary policy.","easy",2022],
  ["JAMB","Economics","National Income","GDP measures the total value of goods and services produced",["By citizens anywhere in the world","Within a country's borders in a period","By the government only","By private firms only"],"B","GDP is output produced within the geographical boundaries of a country.","medium",2020],
  ["JAMB","Government","Constitution","A constitution that is contained in a single document is described as",["Unwritten","Written","Flexible","Unitary"],"B","A written constitution is codified in one document.","easy",2021],
  ["JAMB","Government","Federalism","In a federal system, powers are",["Concentrated in the centre","Shared between central and component units","Held by traditional rulers","Held by the judiciary alone"],"B","Federalism divides powers between central and federating units.","easy",2020],
  ["JAMB","Government","Nigerian Government","Nigeria gained independence on",["1 October 1960","1 October 1963","29 May 1999","15 January 1966"],"A","Nigeria became independent on 1 October 1960.","easy",2018],

  // ---------------------------------------------------------------------------
  // WAEC
  // ---------------------------------------------------------------------------
  ["WAEC","Mathematics","Simple Equations","Solve: 3(x − 2) = 12",["x = 4","x = 6","x = 2","x = 5"],"B","3x − 6 = 12 ⇒ 3x = 18 ⇒ x = 6.","easy",2022],
  ["WAEC","Mathematics","Mensuration","Find the area of a circle of radius 7 cm. (π = 22/7)",["154 cm²","44 cm²","49 cm²","22 cm²"],"A","A = πr² = 22/7 × 49 = 154 cm².","easy",2021],
  ["WAEC","Mathematics","Ratio and Proportion","Share ₦4,500 between A and B in the ratio 4:5. How much does B get?",["₦2,000","₦2,500","₦2,250","₦1,800"],"B","Total parts = 9 ⇒ B gets 5/9 × 4500 = ₦2,500.","easy",2020],
  ["WAEC","English Language","Concord","Choose the correct option: Each of the boys ___ a book.",["have","has","are having","were having"],"B","'Each' is singular and takes a singular verb.","easy",2021],
  ["WAEC","English Language","Vocabulary","Choose the word nearest in meaning to METICULOUS.",["Careless","Thorough","Rapid","Rude"],"B","Meticulous means showing great attention to detail — thorough.","medium",2022],
  ["WAEC","Further Mathematics","Calculus","Differentiate y = (2x + 1)⁴ with respect to x.",["8(2x + 1)³","4(2x + 1)³","2(2x + 1)³","8(2x + 1)⁴"],"A","Chain rule: dy/dx = 4(2x + 1)³ · (2) = 8(2x + 1)³.","medium",2022],
  ["WAEC","Further Mathematics","Matrices","If matrix A = [[2, 1], [0, 3]], find A².",["[[4, 5], [0, 9]]","[[4, 1], [0, 9]]","[[4, 2], [0, 6]]","[[2, 5], [0, 9]]"],"A","A² = [[2(2)+1(0), 2(1)+1(3)], [0(2)+3(0), 0(1)+3(3)]] = [[4, 5], [0, 9]].","medium",2021],
  ["WAEC","Further Mathematics","Vectors","Find the angle between two perpendicular vectors.",["90°","0°","45°","180°"],"A","Perpendicular vectors have a dot product of 0 and an angle of 90°.","easy",2020],
  ["WAEC","Civic Education","Citizenship","The legal process of renouncing one's citizenship of a country is known as",["Renunciation","Expatriation","Deprivation","Naturalisation"],"A","Renunciation is the voluntary giving up of one's citizenship.","easy",2022],
  ["WAEC","Civic Education","Democracy","Free and fair elections in a democracy guarantee that",["Government derives authority from the consent of the governed","The ruling party remains in power indefinitely","Opposition parties are prohibited","Only property owners can vote"],"A","Legitimate democratic governance rests upon citizen suffrage and consent.","easy",2021],
  ["WAEC","Literature in English","Literary Appreciation","The repetition of consonant sounds at the beginning of adjacent words is called",["Alliteration","Assonance","Onomatopoeia","Consonance"],"A","Alliteration refers to initial consonant repetition (e.g. 'sweet birds sang').","easy",2022],
  ["WAEC","Literature in English","Drama","The resolution or unravelling of the plot in a dramatic tragedy is known as the",["Denouement (Catastrophe)","Climax","Exposition","Foreshadowing"],"A","The denouement resolves the central conflict following the climax.","medium",2021],
  ["WAEC","Arabic","Grammar","Choose the correct dual form (المثنى) of the noun 'مُعَلِّم' (Teacher).",["مُعَلِّمَانِ","مُعَلِّمُونَ","مُعَلِّمَات","مُعَلِّمِينَ"],"A","Dual nominative takes the suffix -ani (انِ).","easy",2022],
  ["WAEC","Arabic","Vocabulary","What is the meaning of the Arabic word 'مَدْرَسَة' (Madrasah)?",["School","Hospital","Market","Mosque"],"A","Madrasah (مدرسة) means school or educational institution.","easy",2021],
  ["WAEC","Islamic Studies (IRS)","Pillars of Islam","The fasting of the month of Ramadan is prescribed in the Quran in Surah",["Al-Baqarah (2:183)","An-Nisa (4:10)","Al-Imran (3:97)","Al-Ma'idah (5:3)"],"A","Surah Al-Baqarah 2:183 ordains fasting upon believers.","medium",2021],
  ["WAEC","Islamic Studies (IRS)","Hadith","The collection of Hadith compiled by Imam al-Bukhari is known as",["Sahih al-Bukhari","Sunan Abu Dawud","Muwatta Malik","Jami at-Tirmidhi"],"A","Sahih al-Bukhari is regarded as the most authentic collection of Hadith.","easy",2022],
  ["WAEC","Christian Religious Studies (CRS)","Gospels","Which disciple denied Jesus three times before the rooster crowed?",["Peter","John","Judas Iscariot","Thomas"],"A","Peter denied knowing Jesus three times before the cock crowed.","easy",2022],
  ["WAEC","Christian Religious Studies (CRS)","Old Testament","God called Abraham to leave his native land of Ur to go to the land of",["Canaan","Egypt","Babylon","Midian"],"A","Genesis 12: God promised the land of Canaan to Abraham and his descendants.","easy",2021],
  ["WAEC","Computer Studies","Data Representation","How many bits make up one byte?",["8 bits","4 bits","16 bits","32 bits"],"A","One byte consists of 8 bits. (4 bits = 1 nibble).","easy",2021],
  ["WAEC","Computer Studies","Networking","The unique address assigned to a network interface card for communications on a network segment is the",["MAC address","IP address","URL","Domain name"],"A","Media Access Control (MAC) is the physical hardware identifier.","medium",2022],
  ["WAEC","Agricultural Science","Soil Science","Sandy soil has which of the following physical characteristics?",["High porosity and low water retention","High water retention and poor drainage","Sticky texture when wet","High organic matter content"],"A","Sandy soils have large particles, high drainage, and low water holding capacity.","easy",2022],
  ["WAEC","Agricultural Science","Crop Husbandry","The practice of growing two or more crops simultaneously on the same piece of land is called",["Intercropping","Monoculture","Crop rotation","Shifting cultivation"],"A","Intercropping maximizes land use and reduces risk of total crop loss.","easy",2021],
  ["WAEC","Commerce","Trade","The document issued by a seller to a buyer when goods are returned or overcharged is a",["Credit note","Debit note","Proforma invoice","Receipt"],"A","A credit note reduces the amount the customer owes.","easy",2022],
  ["WAEC","Financial Accounting","Bookkeeping","A Petty Cash Book is maintained using which financial system?",["Imprest system","Double voucher system","Single entry system","Accrual system"],"A","Under the imprest system, a fixed float is replenished periodically.","medium",2021],
  ["WAEC","Geography","Physical Geography","Lines on a map joining places of equal atmospheric pressure are called",["Isobars","Isohyets","Isotherms","Contours"],"A","Isobars represent points of equal pressure on meteorological maps.","easy",2022],
  ["WAEC","Physics","Density","A body of mass 500 g occupies a volume of 250 cm³. Its density is",["2 g/cm³","0.5 g/cm³","125 g/cm³","750 g/cm³"],"A","ρ = m/V = 500/250 = 2 g/cm³.","easy",2021],
  ["WAEC","Physics","Simple Machines","The velocity ratio of a machine with 4 pulleys is",["1","2","4","8"],"C","For a block-and-tackle system the velocity ratio equals the number of supporting ropes/pulleys = 4.","medium",2020],
  ["WAEC","Chemistry","Chemical Bonding","The bond formed by the transfer of electrons is",["Covalent","Ionic","Metallic","Hydrogen"],"B","Electron transfer forms oppositely charged ions held by ionic (electrovalent) bonds.","easy",2021],
  ["WAEC","Biology","Respiration","The end products of aerobic respiration are",["Alcohol and CO₂","CO₂ and water","Lactic acid only","Oxygen and glucose"],"B","Aerobic respiration yields carbon dioxide, water and energy.","easy",2022],
  ["WAEC","Economics","Factors of Production","The reward for land as a factor of production is",["Wages","Rent","Interest","Profit"],"B","Land earns rent; labour earns wages; capital earns interest; entrepreneurship earns profit.","easy",2021],
  ["WAEC","Government","Electoral Systems","The system of voting where the candidate with the highest number of votes wins is",["First-past-the-post (Simple Majority)","Proportional Representation","Alternative Vote","Second Ballot"],"A","First-past-the-post awards the seat to the candidate receiving the most votes.","easy",2022],

  // ---------------------------------------------------------------------------
  // NECO
  // ---------------------------------------------------------------------------
  ["NECO","Mathematics","Percentages","A trader bought an item for ₦800 and sold it for ₦1,000. Find the percentage profit.",["20%","25%","30%","15%"],"B","Profit = ₦200 ⇒ 200/800 × 100 = 25%.","easy",2022],
  ["NECO","Mathematics","Geometry","The sum of the interior angles of a hexagon is",["540°","720°","900°","360°"],"B","(n − 2) × 180° = 4 × 180° = 720°.","easy",2021],
  ["NECO","English Language","Punctuation","Which sentence is correctly punctuated?",["My brother, who lives in Kano is a doctor.","My brother who lives in Kano, is a doctor.","My brother, who lives in Kano, is a doctor.","My brother who lives in Kano is, a doctor."],"C","Non-defining relative clauses are enclosed by a pair of commas.","medium",2022],
  ["NECO","English Language","Antonyms","Choose the word opposite in meaning to HOSTILE.",["Friendly","Aggressive","Distant","Cruel"],"A","Hostile means antagonistic; its direct antonym is friendly.","easy",2021],
  ["NECO","Further Mathematics","Trigonometry","If tan θ = 3/4 and θ is in the first quadrant, find cos θ.",["4/5","3/5","5/4","1/2"],"A","In a 3-4-5 right triangle, adjacent = 4, hypotenuse = 5 ⇒ cos θ = 4/5.","easy",2022],
  ["NECO","Further Mathematics","Sequences","Find the 5th term of the geometric sequence 3, 6, 12, 24, ...",["48","96","72","36"],"A","a = 3, r = 2 ⇒ T5 = 3 × 2⁴ = 3 × 16 = 48.","easy",2021],
  ["NECO","Civic Education","Values","Honesty, fairness, and adherence to moral principles in conduct are termed",["Integrity","Nationalism","Patriotism","Courage"],"A","Integrity is the quality of moral uprightness and consistency in principles.","easy",2022],
  ["NECO","Civic Education","Public Service","The administrative body that conducts recruitment, promotion, and discipline of federal civil servants is the",["Federal Civil Service Commission","Code of Conduct Tribunal","National Assembly","Public Complaints Commission"],"A","The Federal Civil Service Commission oversees federal staffing and personnel.","medium",2021],
  ["NECO","Literature in English","Prose","The main struggle between opposing characters or forces in a story is the",["Conflict","Resolution","Exposition","Climax"],"A","Conflict is the central challenge that creates drama and plot tension.","easy",2021],
  ["NECO","Literature in English","Poetry","A stanza of four lines in poetry is termed a",["Quatrain","Couplet","Sestet","Octave"],"A","A four-line unit in verse is a quatrain.","easy",2022],
  ["NECO","Arabic","Grammar","What is the nominal sentence (الجملة الاسمية) in Arabic defined as?",["A sentence beginning with a noun (Ism)","A sentence beginning with a verb (Fi'l)","A sentence beginning with a preposition (Harf)","A sentence with no subject"],"A","Jumla Ismiyya begins with a noun (Mubtada').","easy",2022],
  ["NECO","Arabic","Vocabulary","What is the plural of 'طَالِب' (Student)?",["طُلَّاب (Tullab)","طَالِبُونَ","طَلَبَات","مُطَالِبُونَ"],"A","The standard plural of Talib is Tullab (طلاب).","easy",2021],
  ["NECO","Islamic Studies (IRS)","Sirah","The Battle of Badr took place in which year after Hijrah?",["2 AH","3 AH","5 AH","8 AH"],"A","The Battle of Badr occurred in Ramadan, 2 AH.","easy",2021],
  ["NECO","Islamic Studies (IRS)","Pillars of Faith","Which angel was responsible for delivering divine revelation to the Prophets?",["Jibril (Gabriel)","Mika'il (Michael)","Israfil","Izra'il"],"A","Angel Jibril (AS) conveyed the Word of Allah to the Messengers.","easy",2022],
  ["NECO","Christian Religious Studies (CRS)","Old Testament","The Ten Commandments were given to Moses on Mount",["Sinai","Carmel","Horeb","Nebo"],"A","God delivered the tablets of the law on Mount Sinai.","easy",2022],
  ["NECO","Christian Religious Studies (CRS)","Early Church","On the day of Pentecost, the Holy Spirit descended upon the disciples in the form of",["Tongues as of fire","A flying dove","A rushing flood","A bright star"],"A","Acts 2:3 — 'They saw what seemed to be tongues of fire that separated and came to rest on each of them.'","easy",2021],
  ["NECO","Computer Studies","Operating Systems","Which of the following is an example of an open-source operating system?",["Linux","Windows 11","macOS","iOS"],"A","Linux is a free and open-source operating system kernel.","easy",2021],
  ["NECO","Computer Studies","Logic Gates","Which logic gate produces a HIGH output (1) only when all of its inputs are HIGH (1)?",["AND gate","OR gate","NOT gate","XOR gate"],"A","The AND gate outputs 1 if and only if both/all inputs are 1.","easy",2022],
  ["NECO","Agricultural Science","Soil Science","The process of washing down soluble plant nutrients beyond the root zone by water is",["Leaching","Erosion","Weathering","Salinization"],"A","Leaching removes nutrients to lower subsoil layers.","easy",2022],
  ["NECO","Commerce","Banking","A cheque crossed with two parallel transverse lines across its face must be paid into a",["Bank account","Cash counter","Post office","Central Bank directly"],"A","A crossed cheque cannot be cashed over the counter; it must be cleared into an account.","easy",2021],
  ["NECO","Financial Accounting","Accounting Concepts","The accounting concept assuming that a business will continue operating indefinitely is the",["Going concern concept","Periodicity concept","Matching concept","Business entity concept"],"A","Going concern presumes the enterprise will not be liquidated in the near future.","medium",2022],
  ["NECO","Geography","Nigerian Geography","The major mineral oil producing region in Nigeria is the",["Niger Delta basin","Chad basin","Benue trough","Sokoto plains"],"A","The Niger Delta contains the vast majority of Nigeria's crude oil reserves.","easy",2021],
  ["NECO","Biology","Excretion","The main excretory organ in mammals is the",["Liver","Kidney","Lung","Skin"],"B","Kidneys remove nitrogenous waste as urine.","easy",2021],
  ["NECO","Chemistry","Water Treatment","Temporary hardness of water is caused by",["Calcium sulphate","Calcium hydrogen trioxocarbonate(IV)","Sodium chloride","Magnesium sulphate"],"B","Temporary hardness is due to dissolved hydrogen trioxocarbonates(IV) of calcium and magnesium, removed by boiling.","medium",2020],
  ["NECO","Physics","Magnetism","Like poles of a magnet",["Attract each other","Repel each other","Have no effect","Fuse together"],"B","Like poles repel; unlike poles attract.","easy",2021],
  ["NECO","Government","Democracy","The phrase 'government of the people, by the people and for the people' was coined by",["Aristotle","Abraham Lincoln","Karl Marx","John Locke"],"B","Abraham Lincoln, in the Gettysburg Address (1863).","easy",2019],
  ["NECO","Economics","Market Structures","A market situation where there is only one buyer of a commodity is known as a",["Monopsony","Monopoly","Oligopoly","Duopoly"],"A","Monopsony represents a single buyer market, whereas monopoly is a single seller.","medium",2022],

  // ---------------------------------------------------------------------------
  // AI GENERATED (Mixed drills across subjects)
  // ---------------------------------------------------------------------------
  ["AI GENERATED","Mathematics","Arithmetic and Algebra","If 3x + 5 = 20, what is the value of x?",["5","6","7","4"],"A","3x = 15 ⇒ x = 5.","easy",2024],
  ["AI GENERATED","English Language","Lexis","Choose the synonym of METICULOUS: 'Her meticulous research impressed everyone.'",["Careful and thorough","Careless","Quick","Lazy"],"A","Meticulous means showing great care and attention to detail.","easy",2024],
  ["AI GENERATED","Further Mathematics","Vectors and Matrices","Find the determinant of matrix [[5, 2], [3, 1]].",["-1","1","11","17"],"A","det = (5)(1) − (2)(3) = 5 − 6 = −1.","easy",2024],
  ["AI GENERATED","Further Mathematics","Calculus","Find the derivative of f(x) = 4x³ − 7x + 2.",["12x² − 7","12x² + 7","4x² − 7","12x³ − 7"],"A","f'(x) = 12x² − 7.","easy",2024],
  ["AI GENERATED","Civic Education","Democratic Governance","The principle that distributes government authority among legislative, executive, and judicial branches is",["Separation of Powers","Checks and Balances","Judicial Review","Rule of Law"],"A","Separation of powers prevents concentration of state power in one arm.","easy",2024],
  ["AI GENERATED","Civic Education","Human Rights","Which document serves as the supreme law of the Federal Republic of Nigeria?",["The 1999 Constitution as amended","The Electoral Act","The Penal Code","The African Charter"],"A","The Constitution is supreme and binding on all authorities and persons in Nigeria.","easy",2024],
  ["AI GENERATED","Literature in English","Literary Devices","The deliberate exaggeration for dramatic effect in literature is known as",["Hyperbole","Litotes","Irony","Metaphor"],"A","Hyperbole is an exaggerated statement not meant to be taken literally.","easy",2024],
  ["AI GENERATED","Literature in English","Drama","The resolution or conclusion of a dramatic work following the climax is the",["Catastrophe / Denouement","Exposition","Foil","Prologue"],"A","The denouement unknots the dramatic plot at the conclusion.","easy",2024],
  ["AI GENERATED","Arabic","Nahw Basics","What is the linguistic meaning of the word 'كَلِمَة' (Kalimah) in Arabic?",["Word","Sentence","Letter","Paragraph"],"A","Kalimah means a single meaningful word in Arabic grammar.","easy",2024],
  ["AI GENERATED","Arabic","Vocabulary","Translate 'بَيْت' (Bayt) into English.",["House","Mosque","School","Office"],"A","Bayt (بيت) means house or home in Arabic.","easy",2024],
  ["AI GENERATED","Islamic Studies (IRS)","Aqeedah","Belief in Angels, Divine Books, and the Prophets are articles of",["Iman (Faith)","Islam (Outward action)","Ihsan (Excellence)","Shariah"],"A","These are among the Six Pillars of Iman in Islamic theology.","easy",2024],
  ["AI GENERATED","Islamic Studies (IRS)","Sirah","In which city was Prophet Muhammad (PBUH) born?",["Makkah","Madinah","Ta'if","Jerusalem"],"A","Prophet Muhammad (PBUH) was born in Makkah in the Year of the Elephant (570 CE).","easy",2024],
  ["AI GENERATED","Christian Religious Studies (CRS)","Parables","The parable taught by Jesus to illustrate genuine love for one's neighbor is the Parable of the",["Good Samaritan","Prodigal Son","Sower","Mustard Seed"],"A","Luke 10:25–37 depicts the Good Samaritan assisting an injured traveler.","easy",2024],
  ["AI GENERATED","Christian Religious Studies (CRS)","Gospels","Which Gospel opens with the words: 'In the beginning was the Word, and the Word was with God'?",["John","Matthew","Mark","Luke"],"A","The prologue of John (John 1:1) proclaims Christ as the Eternal Word (Logos).","easy",2024],
  ["AI GENERATED","Computer Studies","Internet & Protocols","Which protocol is used for secure encrypted communication over the World Wide Web?",["HTTPS","HTTP","FTP","SMTP"],"A","HTTPS (HyperText Transfer Protocol Secure) uses SSL/TLS encryption.","easy",2024],
  ["AI GENERATED","Computer Studies","Hardware","The volatile memory used for temporary storage by running programs is",["RAM (Random Access Memory)","ROM","Hard Disk Drive","Optical Drive"],"A","RAM loses its stored data once electrical power is turned off.","easy",2024],
  ["AI GENERATED","Physics","Mechanics","The rate of change of displacement with respect to time is",["Velocity","Acceleration","Speed","Momentum"],"A","Velocity is the vector quantity representing displacement change over time.","easy",2024],
  ["AI GENERATED","Chemistry","Periodic Table","Which gas makes up approximately 78% of the Earth's atmosphere?",["Nitrogen","Oxygen","Carbon dioxide","Argon"],"A","Nitrogen gas (N₂) constitutes roughly 78% of dry atmospheric air.","easy",2024],
  ["AI GENERATED","Biology","Ecology","The interaction where both organisms benefit mutually is termed",["Mutualism","Parasitism","Commensalism","Predation"],"A","Mutualism is a symbiotic relationship advantageous to both partner species.","easy",2024],
  ["AI GENERATED","Economics","Market Equilibrium","When quantity demanded exceeds quantity supplied at a given price, there is a market",["Shortage","Surplus","Equilibrium","Glut"],"A","Shortage occurs when prices are below market-clearing equilibrium.","easy",2024],
  ["AI GENERATED","Government","Organs of State","Which arm of government is responsible for interpreting the laws and constitution?",["Judiciary","Legislature","Executive","Cabinet"],"A","The judiciary adjudicates legal disputes and interprets statutory laws.","easy",2024],
  ["AI GENERATED","Commerce","Trade Channels","Trading between businesses located in different countries is termed",["International (Foreign) Trade","Home Trade","Retail Trade","Wholesale Trade"],"A","Foreign trade involves international import and export of goods.","easy",2024],
  ["AI GENERATED","Accounting","Ledger Accounts","A listing of all debit and credit balances extracted from the ledger to test mathematical accuracy is a",["Trial Balance","Balance Sheet","Cash Book","Sales Day Book"],"A","The Trial Balance checks arithmetical accuracy under double entry bookkeeping.","easy",2024],
  ["AI GENERATED","Geography","Landforms","A triangular deposit of sediment at the mouth of a river where it enters the sea is a",["Delta","Estuary","Meander","Oxbow lake"],"A","River deltas (e.g. Niger Delta) form from deposited alluvial silt at river mouths.","easy",2024],
  ["AI GENERATED","Agricultural Science","Soil Fertility","Which macro-nutrient is essential for strong root establishment in crops?",["Phosphorus","Nitrogen","Iron","Zinc"],"A","Phosphorus (P) is vital for root development, flowering, and seed formation.","easy",2024],
  ["AI GENERATED","General Knowledge","World Affairs","The headquarters of the African Union (AU) is situated in",["Addis Ababa, Ethiopia","Abuja, Nigeria","Cairo, Egypt","Nairobi, Kenya"],"A","The AU headquarters is in Addis Ababa, Ethiopia.","easy",2024],
];

export function seedQuestions(): Omit<Question, "id" | "created_at">[] {
  return Q.map(([exam, subject, topic, question_text, options, correct_answer, explanation, difficulty, year]) => ({
    exam,
    subject,
    topic,
    question_text,
    options,
    correct_answer,
    explanation,
    difficulty,
    year,
    image_url: null,
    is_active: true,
  }));
}

const chapter = (
  exam: Exam,
  subject: string,
  book_title: string,
  chapter_number: number,
  title: string,
  topic_tags: string[],
  description: string,
  body: string,
): Omit<TextbookChapter, "id" | "created_at"> => ({
  exam,
  subject,
  book_title,
  title,
  chapter_number,
  description,
  topic_tags,
  content_html: body,
  file_path: null,
  page_count: null,
  is_published: true,
});

export function seedTextbooks(): Omit<TextbookChapter, "id" | "created_at">[] {
  return [
    chapter("JAMB","Mathematics","New School Mathematics for Senior Secondary",2,"Quadratic Equations",["Quadratic Equations","Algebra","Sequences and Series"],"Factorisation, completing the square, the quadratic formula and word problems.",`
<h2>2.1 What is a quadratic equation?</h2>
<p>A <strong>quadratic equation</strong> is any equation that can be written in the standard form</p>
<p class="eq">ax² + bx + c = 0,&nbsp; a ≠ 0</p>
<p>where <em>a</em>, <em>b</em> and <em>c</em> are constants. The highest power of the unknown is 2, which is why every quadratic equation has (at most) two roots.</p>
<h2>2.2 Method 1 — Factorisation</h2>
<p>Look for two numbers whose <strong>product is ac</strong> and whose <strong>sum is b</strong>.</p>
<div class="example"><p><strong>Example.</strong> Solve x² − 5x + 6 = 0.</p>
<p>ac = 6 and b = −5. The numbers −2 and −3 work. So</p>
<p class="eq">x² − 2x − 3x + 6 = 0 ⇒ x(x − 2) − 3(x − 2) = 0 ⇒ (x − 2)(x − 3) = 0</p>
<p>Therefore x = 2 or x = 3.</p></div>
<h2>2.3 Method 2 — Completing the square</h2>
<p>Rewrite ax² + bx + c = 0 as (x + b/2a)² = (b² − 4ac)/4a². This is useful when factors are not obvious and is the method used to derive the formula.</p>
<h2>2.4 Method 3 — The quadratic formula</h2>
<p class="eq">x = [−b ± √(b² − 4ac)] / 2a</p>
<p>The expression <strong>Δ = b² − 4ac</strong> is called the <em>discriminant</em>:</p>
<ul>
<li>Δ &gt; 0 → two distinct real roots</li>
<li>Δ = 0 → two equal (repeated) roots</li>
<li>Δ &lt; 0 → no real roots (complex roots)</li>
</ul>
<h2>2.5 Sum and product of roots</h2>
<p>If α and β are the roots of ax² + bx + c = 0 then</p>
<p class="eq">α + β = −b/a &nbsp;&nbsp;&nbsp; αβ = c/a</p>
<p>An equation with roots α and β is x² − (α + β)x + αβ = 0.</p>
<h2>2.6 JAMB-style worked example</h2>
<div class="example"><p><strong>Q.</strong> If the roots of 2x² + kx + 8 = 0 are equal, find k.</p>
<p>Equal roots ⇒ Δ = 0 ⇒ k² − 4(2)(8) = 0 ⇒ k² = 64 ⇒ <strong>k = ±8</strong>.</p></div>
<h2>2.7 Exercise</h2>
<ol><li>Solve 3x² − 12x + 7 = 0 using the formula.</li><li>Find the equation whose roots are 4 and −3.</li><li>For what values of p does x² + px + 9 = 0 have equal roots?</li></ol>`),

    chapter("JAMB","Further Mathematics","Comprehensive Further Mathematics",3,"Matrices and Determinants",["Matrices and Determinants","Matrices","Vectors and Matrices","Linear Algebra"],"Matrix operations, 2x2 and 3x3 determinants, inverse matrices, and systems of linear equations.",`
<h2>3.1 Definition and Order of Matrices</h2>
<p>A <strong>matrix</strong> is a rectangular array of numbers arranged in rows and columns. A matrix with <em>m</em> rows and <em>n</em> columns has order <em>m × n</em>.</p>
<h2>3.2 Determinant of a 2×2 Matrix</h2>
<p>For matrix A = [[a, b], [c, d]]:</p>
<p class="eq">det(A) = |A| = ad − bc</p>
<p>A matrix is <strong>singular</strong> if its determinant is zero (det(A) = 0), which means it has no inverse.</p>
<div class="example"><p><strong>Worked Example:</strong> If [[k, 3], [2, 6]] is singular, find k.</p>
<p>det = (k × 6) − (3 × 2) = 6k − 6 = 0 ⇒ <strong>k = 1</strong>.</p></div>
<h2>3.3 Matrix Multiplication</h2>
<p>Matrix multiplication AB is valid only when the number of columns in A equals the number of rows in B. The element in row <em>i</em> and column <em>j</em> is obtained by taking the dot product of row <em>i</em> of A and column <em>j</em> of B.</p>`),

    chapter("JAMB","Civic Education","Civic Education for Senior Secondary",1,"Citizenship, Rights, and Democratic Values",["Citizenship","Human Rights","Democracy and Rule of Law","National Values"],"Fundamental human rights, acquisition of citizenship, pillars of democracy and rule of law.",`
<h2>1.1 Concept of Citizenship</h2>
<p><strong>Citizenship</strong> is the legal status and relationship between an individual and a state, granting rights and imposing civic obligations.</p>
<ul>
<li><strong>By Birth:</strong> Born in Nigeria with at least one parent or grandparent who belongs to an indigenous community.</li>
<li><strong>By Registration:</strong> Available through marriage or other statutory criteria.</li>
<li><strong>By Naturalisation:</strong> Granted by the President to individuals resident for at least 15 years who meet constitutional criteria.</li>
</ul>
<h2>1.2 Fundamental Human Rights</h2>
<p>Inalienable rights codified in the 1999 Constitution (Chapter IV) and the UDHR (1948):</p>
<ul>
<li>Right to Life and Personal Liberty</li>
<li>Right to Dignity of the Human Person</li>
<li>Freedom of Thought, Conscience, and Religion</li>
<li>Freedom of Expression and Association</li>
</ul>
<h2>1.3 The Rule of Law</h2>
<p>A.V. Dicey defined three core tenets:</p>
<ol><li>Supremacy of regular law over arbitrary power</li><li>Equality of all persons before the law</li><li>Protection of individual rights by independent courts</li></ol>`),

    chapter("JAMB","Literature in English","A Handbook of Literary Terms and Appreciation",1,"Literary Devices, Drama, and Poetry",["Literary Devices","Drama","Poetry","Prose","Literary Appreciation"],"Comprehensive guide to figurative language, structural elements of drama, and poetic meter.",`
<h2>1.1 Figures of Speech (Figurative Language)</h2>
<table>
<tr><th>Device</th><th>Definition</th><th>Example</th></tr>
<tr><td><strong>Metaphor</strong></td><td>Direct comparison without 'like' or 'as'</td><td><em>He is a lion in battle.</em></td></tr>
<tr><td><strong>Personification</strong></td><td>Endowing inanimate objects with human attributes</td><td><em>The sea raged with fury.</em></td></tr>
<tr><td><strong>Oxymoron</strong></td><td>Pairing contradictory words side by side</td><td><em>A deafening silence fell.</em></td></tr>
<tr><td><strong>Hyperbole</strong></td><td>Intentional deliberate exaggeration</td><td><em>I have told you a million times.</em></td></tr>
</table>
<h2>1.2 Dramatic Concepts</h2>
<ul>
<li><strong>Hamartia:</strong> The tragic flaw or fatal weakness of the protagonist.</li>
<li><strong>Catharsis:</strong> The purgation or cleansing of pity and fear experienced by the audience.</li>
<li><strong>Soliloquy:</strong> A monologue where a character speaks their innermost thoughts alone on stage.</li>
</ul>`),

    chapter("JAMB","Arabic","Simplified Arabic for Secondary Schools",1,"Arabic Grammar (An-Nahw) Fundamentals",["Arabic Grammar (Nahw)","Grammar","Nahw Basics","Vocabulary (Mufradat)"],"Parts of speech in Arabic, nominal and verbal sentences, and case endings (I'rab).",`
<h2>1.1 Parts of Speech (أقسام الكلام)</h2>
<p>Every word in Arabic belongs to one of three categories:</p>
<ul>
<li><strong>Ism (اسْم):</strong> Noun or adjective (names of persons, places, things, concepts).</li>
<li><strong>Fi'l (فِعْل):</strong> Verb denoting action in a specific tense (Madi, Mudari', Amr).</li>
<li><strong>Harf (حَرْف):</strong> Particle with meaning only in context (e.g. prepositions: فِي, عَلَى, مِنْ).</li>
</ul>
<h2>1.2 Sentence Types</h2>
<p><strong>1. Nominal Sentence (الجملة الاسمية):</strong> Begins with an Ism. Consists of <em>Mubtada'</em> (subject) and <em>Khabar</em> (predicate), both Marfu' (مرفوع).</p>
<p><strong>2. Verbal Sentence (الجملة الفعلية):</strong> Begins with a Fi'l. Consists of <em>Fi'l</em> (verb) and <em>Fa'il</em> (doer, Marfu').</p>`),

    chapter("JAMB","Islamic Studies (IRS)","Essential Islamic Studies for SSS",1,"Tawheed and the Foundations of Faith",["Tawheed","Aqeedah","Pillars of Islam","Hadith Studies"],"The categories of Tawheed, the Six Articles of Faith, and Hadith classification.",`
<h2>1.1 The Concept and Branches of Tawheed</h2>
<p><strong>Tawheed</strong> is the bedrock of Islamic belief. Scholars classify Tawheed into three interrelated categories:</p>
<ol>
<li><strong>Tawheed ar-Rububiyyah (Oneness of Lordship):</strong> Believing that Allah alone is the Creator, Sustainer, and Ruler of the universe.</li>
<li><strong>Tawheed al-Uluhiyyah / Ibadah (Oneness of Worship):</strong> Directing all acts of worship (prayer, fasting, supplication) to Allah alone without intermediaries.</li>
<li><strong>Tawheed al-Asma' was-Sifat (Oneness of Names and Attributes):</strong> Affirming the divine names and attributes mentioned in the Quran and Sunnah.</li>
</ol>
<h2>1.2 The Five Pillars of Islam</h2>
<p>Shahadah (Declaration of Faith), Salat (5 Daily Prayers), Zakat (Obligatory Charity 2.5%), Sawm (Fasting Ramadan), and Hajj (Pilgrimage to Makkah).</p>`),

    chapter("JAMB","Christian Religious Studies (CRS)","Comprehensive CRS for Senior Secondary",1,"Sovereignty of God, Creation, and the Law",["Old Testament","New Testament","Prophets","Early Church"],"Creation narrative, the Patriarchs, the Exodus, and the Ten Commandments.",`
<h2>1.1 The Sovereignty of God in Creation</h2>
<p>Genesis chapters 1 and 2 present God as the supreme Sovereign who created the cosmos ex nihilo ('out of nothing') through His divine word: <em>"Let there be light."</em></p>
<h2>1.2 The Exodus and the Sinai Covenant</h2>
<p>God commissioned Moses at the burning bush to liberate Israel from slavery in Egypt. After the crossing of the Red Sea, God established the Covenant at Mount Sinai, providing the <strong>Decalogue (Ten Commandments)</strong> covering:</p>
<ul>
<li>Duties to God (Commandments 1–4): Exclusive worship, no idols, reverencing God's name, observing the Sabbath.</li>
<li>Duties to Fellow Man (Commandments 5–10): Honoring parents, prohibition of murder, adultery, theft, false witness, and covetousness.</li>
</ul>`),

    chapter("JAMB","Computer Studies","Fundamentals of Computer Science",1,"Computer Systems, Architecture, and Data Representation",["Hardware Components","Number Systems","Software and OS","Networking and Internet","Cybersecurity and Ethics"],"Von Neumann architecture, ALU, RAM vs ROM, binary conversion, and computer networking.",`
<h2>1.1 Computer Architecture (Von Neumann Model)</h2>
<p>A standard computer system consists of:</p>
<ul>
<li><strong>Central Processing Unit (CPU):</strong> Contains the ALU (Arithmetic Logic Unit) and Control Unit (CU).</li>
<li><strong>Primary Storage:</strong> RAM (Random Access Memory, volatile) and ROM (Read Only Memory, non-volatile).</li>
<li><strong>Input and Output Devices:</strong> Keyboards, mice, monitors, printers.</li>
</ul>
<h2>1.2 Binary and Number Representation</h2>
<p>Computers process instructions using the binary number system (base 2) composed of 0s and 1s:</p>
<p class="eq">1 Byte = 8 Bits &nbsp;•&nbsp; 1 Kilobyte (KB) = 1024 Bytes &nbsp;•&nbsp; 1 Megabyte (MB) = 1024 KB</p>`),

    chapter("JAMB","Physics","Essential Physics for Senior Secondary",5,"Projectile Motion",["Projectile Motion","Newton's Laws","Motion"],"Horizontal and oblique projection, time of flight, range and maximum height.",`
<h2>5.1 Introduction</h2>
<p>A <strong>projectile</strong> is any body thrown into the air and allowed to move freely under gravity. Its motion is analysed by treating the horizontal and vertical components <em>independently</em>.</p>
<ul><li>Horizontal: constant velocity (no acceleration, ignoring air resistance)</li><li>Vertical: uniform acceleration <em>g</em> = 9.8 m/s² (often taken as 10 m/s²)</li></ul>
<h2>5.2 Key formulae (projection at angle θ with speed u)</h2>
<table><tr><th>Quantity</th><th>Formula</th></tr>
<tr><td>Time to maximum height</td><td>t = u sinθ / g</td></tr>
<tr><td>Time of flight</td><td>T = 2u sinθ / g</td></tr>
<tr><td>Maximum height</td><td>H = u² sin²θ / 2g</td></tr>
<tr><td>Range</td><td>R = u² sin 2θ / g</td></tr></table>
<p>The range is maximum when θ = 45°, since sin 2θ = 1.</p>`),

    chapter("JAMB","Chemistry","Comprehensive Chemistry for SSS",7,"Organic Chemistry I — Hydrocarbons",["Organic Chemistry","Alkanes","Alkenes"],"Homologous series, nomenclature, isomerism and reactions of alkanes, alkenes and alkynes.",`
<h2>7.1 The homologous series</h2>
<p>Organic compounds are grouped into families called <strong>homologous series</strong>. Members of a series share a general formula, similar chemical properties and differ by a –CH₂– unit.</p>
<table><tr><th>Series</th><th>General formula</th><th>Example</th></tr>
<tr><td>Alkanes</td><td>CnH2n+2</td><td>Methane CH₄</td></tr>
<tr><td>Alkenes</td><td>CnH2n</td><td>Ethene C₂H₄</td></tr>
<tr><td>Alkynes</td><td>CnH2n−2</td><td>Ethyne C₂H₂</td></tr>
<tr><td>Alkanols</td><td>CnH2n+1OH</td><td>Ethanol C₂H₅OH</td></tr></table>`),

    chapter("JAMB","Biology","Modern Biology for Senior Secondary",9,"Genetics and Heredity",["Genetics","Cell Biology","Variation"],"Mendel's laws, monohybrid and dihybrid crosses, sex determination and genetic disorders.",`
<h2>9.1 Basic terms</h2>
<ul><li><strong>Gene</strong> — the unit of heredity carried on a chromosome.</li><li><strong>Allele</strong> — alternative form of a gene (e.g. T and t).</li><li><strong>Genotype</strong> — the genetic makeup (TT, Tt, tt).</li><li><strong>Phenotype</strong> — the observable characteristic (tall, short).</li></ul>
<h2>9.2 Monohybrid cross</h2>
<p>Tt × Tt gives the Punnett square with phenotypic ratio <strong>3 tall : 1 short</strong>.</p>`),

    chapter("JAMB","Use of English","Countdown English Language",3,"Lexis, Structure and Concord",["Lexis and Structure","Concord","Synonyms","Antonyms"],"Subject–verb agreement, tenses, question tags and commonly tested structures.",`
<h2>3.1 Concord (subject–verb agreement)</h2>
<ul>
<li>Singular subject → singular verb: <em>The boy <strong>runs</strong>.</em></li>
<li>With <em>neither…nor / either…or</em>, the verb agrees with the <strong>nearer</strong> subject: <em>Neither the teacher nor the students <strong>were</strong> present.</em></li>
<li><em>Each, every, everybody</em> are singular: <em>Each of the boys <strong>has</strong> a book.</em></li>
</ul>`),

    chapter("JAMB","Economics","Fundamentals of Economics",4,"Demand, Supply and Price Determination",["Demand and Supply","Elasticity","Price"],"Laws of demand and supply, elasticity and market equilibrium.",`
<h2>4.1 Demand and Supply</h2>
<p><strong>Demand</strong> is the quantity of a commodity consumers are willing and able to buy at a given price over a period. The <em>law of demand</em>: as price rises, quantity demanded falls, other things being equal.</p>`),
  ];
}
