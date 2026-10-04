// Curriculum: levels 1..100. Each level is a unique, progressive text to type.
// Progressive design:
// Levels 1..10   : Home row keys (ASDF JKLM)
// Levels 11..25  : Top row keys (ER T YUIOP Z)
// Levels 26..40  : Bottom row keys (C V B N X W)
// Levels 41..60  : Common words & short combinations
// Levels 61..80  : Complete French sentences & punctuation
// Levels 81..100 : Advanced speed tests & complex vocabulary

const CURRICULUM: { title: string; text: string }[] = [
  // --- RANGÉE DE REPOS (1..10) ---
  { title: "Niveau 01 · Repos: Touches F et J", text: "ffff jjjj ff jj fj jf fff jjj fjf jfj fjjf jffj" },
  { title: "Niveau 02 · Repos: Touches D et K", text: "dddd kkkk dd kk dk kd ddd kkk dkd kdk dkkd kddk" },
  { title: "Niveau 03 · Repos: Touches S et L", text: "ssss llll ss ll sl ls sss lll sls lsl slls lssl" },
  { title: "Niveau 04 · Repos: Touches A et M", text: "aaaa mmmm aa mm am ma aaa mmm ama mam amma maam" },
  { title: "Niveau 05 · Repos: Séquence complète", text: "asdf jklm fdsa mlkj asdf jklm fds a jkl m asdf" },
  { title: "Niveau 06 · Repos: Croisements de doigts", text: "fj dk sl am ma ls kd jf f j d k s l a m fj dk" },
  { title: "Niveau 07 · Repos: Premiers mots 3 lettres", text: "fad fal fas fam jak jad jas jam mas mal kas kal" },
  { title: "Niveau 08 · Repos: Mots réels de repos", text: "fada flac kaza lama sa la ma dada alfa alsa lamas" },
  { title: "Niveau 09 · Repos: Petites phrases simples", text: "la fada de la salle a la masse de la lame de la kaza" },
  { title: "Niveau 10 · Bilan de la rangée de repos", text: "le fada de la masse a valide la salsa dans la salle" },

  // --- RANGÉE HAUTE (11..25) ---
  { title: "Niveau 11 · Rangée haute: Touches R et U", text: "fr ju fr ju frr juu fru jur rur uru fur ruf juru" },
  { title: "Niveau 12 · Rangée haute: Touches T et Y", text: "ft jy ft jy ftt jyy fty jyt tyt yty fyt tyf jyt" },
  { title: "Niveau 13 · Rangée haute: Touches E et I", text: "de ki de ki dee kii dei kie eie iei die kid eiki" },
  { title: "Niveau 14 · Rangée haute: Touches Z et O", text: "se lo se lo zee loo zeo loz zoz ozo zol loz zeli" },
  { title: "Niveau 15 · Rangée haute: Touches A et P", text: "ap pa app paa apap papa paf par pur pour pire poete" },
  { title: "Niveau 16 · Rangée haute: Mots de 3 lettres", text: "rue tir ure tri rut ute urt rur uuu mer air eau" },
  { title: "Niveau 17 · Rangée haute: Mots courants", text: "jour fort port sort tour pour voir dire lire faire" },
  { title: "Niveau 18 · Rangée haute: Vocabulaire usuel", text: "utile idole ordre poete piste porte prise prose" },
  { title: "Niveau 19 · Rangée haute: Phrases légères", text: "le petit poete repart au port avec sa pirogue" },
  { title: "Niveau 20 · Rangée haute: Maîtrise", text: "la pluie tombe sur les toits de la petite ville" },
  { title: "Niveau 21 · Rangée haute: Enchaînements rapides", text: "piste porte partie sortir partie rapide partir priere" },
  { title: "Niveau 22 · Rangée haute: Alternance des mains", text: "europe pirate partie produit propre projet vapeur" },
  { title: "Niveau 23 · Rangée haute: Mots longs", text: "proprement irréprochable repartir republique produite" },
  { title: "Niveau 24 · Rangée haute: Fluidité", text: "le poete ecrit une ode a la pluie et au vent" },
  { title: "Niveau 25 · Bilan de la rangée haute", text: "toutes les idees claires produisent des resultats rapides" },

  // --- RANGÉE BASSE (26..40) ---
  { title: "Niveau 26 · Rangée basse: Touches V et N", text: "fv jn fv jn fvv jnn fvn jnv vnv nvn ven vin" },
  { title: "Niveau 27 · Rangée basse: Touches C et X", text: "dc sx dc sx dcc sxx dcx sxd cxc xcx car cox" },
  { title: "Niveau 28 · Rangée basse: Touches B et W", text: "gb sw gb sw gbb sww gbw swb bwb wbw bas web" },
  { title: "Niveau 29 · Rangée basse: Combinaisons basses", text: "van vin vue voix avec cave cuve noces voix luxe" },
  { title: "Niveau 30 · Rangée basse: Mots avec C et V", text: "avec cave cuve clou chez choc cent cinq vert voix" },
  { title: "Niveau 31 · Rangée basse: Mots avec N et B", text: "bien bon blanc bleu banc bois bain bond bien" },
  { title: "Niveau 32 · Rangée basse: Mots avec X et W", text: "luxe taxe taxi index wagon web watt boxer inox" },
  { title: "Niveau 33 · Rangée basse: Syllabes variées", text: "avec bon vent le bateau avance vite vers le sud" },
  { title: "Niveau 34 · Rangée basse: Phrases complètes", text: "ce vieux navire vogue vers une nouvelle ile bien cachee" },
  { title: "Niveau 35 · Rangée basse: Fluidité des trois rangées", text: "chaque jour apporte sa nouvelle chance de bien faire" },
  { title: "Niveau 36 · Rangée basse: Agilité des doigts", text: "le wagon bleu transporte des boites de verre blanc" },
  { title: "Niveau 37 · Rangée basse: Vocabulaire marin", text: "le voilier avance avec le vent frais de novembre" },
  { title: "Niveau 38 · Rangée basse: Textes courts", text: "nous avons visite ce beau village avec nos voisins" },
  { title: "Niveau 39 · Rangée basse: Rythme régulier", text: "une bonne habitude se construit avec de la patience" },
  { title: "Niveau 40 · Bilan des trois rangées", text: "les dix doigts glissent sur le clavier avec une grande aisance" },

  // --- MOTS & ASSOCIATIONS (41..60) ---
  { title: "Niveau 41 · Mots courts essentiels", text: "le la les un une des de du et ou ni or car ne pas plus" },
  { title: "Niveau 42 · Pronoms personnels", text: "je tu il elle nous vous ils elles on me te se lui leur" },
  { title: "Niveau 43 · Adjectifs possessifs", text: "mon ton son ma ta sa mes tes ses notre votre leur nos vos" },
  { title: "Niveau 44 · Mots du temps", text: "matin midi soir nuit jour semaine mois annee heure minute" },
  { title: "Niveau 45 · Mots du quotidien", text: "ecole travail famille amour temps maison rue ville pays" },
  { title: "Niveau 46 · Verbes courants", text: "ecrire lire compter parler ecouter penser faire voir savoir" },
  { title: "Niveau 47 · Verbes du premier groupe", text: "chanter danser marcher regarder ecouter trouver donner parler" },
  { title: "Niveau 48 · Verbes d'action", text: "courir sauter venir partir ouvrir fermer prendre mettre prendre" },
  { title: "Niveau 49 · Expressions temporelles", text: "hier aujourd'hui demain toujours souvent jamais parfois soudain" },
  { title: "Niveau 50 · Mots de liaison", text: "parce que ainsi donc alors cependant pourtant malgre tout" },
  { title: "Niveau 51 · Vocabulaire informatique", text: "clavier ecran souris fichier dossier reseau donnees code texte" },
  { title: "Niveau 52 · Vocabulaire de l'apprentissage", text: "methode cours lecon exercice memoire geste touche rythme" },
  { title: "Niveau 53 · Motifs répétitifs", text: "la frappe rapide exige de la stabilite et du calme absolu" },
  { title: "Niveau 54 · Phrases de travail", text: "travailler chaque jour permet de progresser sans effort apparent" },
  { title: "Niveau 55 · Phrases sur la concentration", text: "restez concentre sur les lettres et gardez les yeux sur l'ecran" },
  { title: "Niveau 56 · Phrases sur la posture", text: "les poignets souples et le dos droit favorisent une frappe fluide" },
  { title: "Niveau 57 · Phrases d'encouragement", text: "chaque petite victoire quotidienne renforce votre confiance" },
  { title: "Niveau 58 · Phrases de mémoire musculaire", text: "vos doigts apprennent la position exacte de chaque touche" },
  { title: "Niveau 59 · Textes thématiques", text: "le soleil se leve sur la montagne et illumine la vallee" },
  { title: "Niveau 60 · Bilan du niveau intermédiaire", text: "vous maîtrisez désormais l'ensemble des lettres du clavier français" },

  // --- PHRASES & PONCTUATION (61..80) ---
  { title: "Niveau 61 · La règle d'or", text: "la saisie n'est pas un talent naturel, c'est une methode exacte." },
  { title: "Niveau 62 · Automatisation", text: "on ecrit chaque jour les mêmes mots, autant les taper sans regarder." },
  { title: "Niveau 63 · Discipline", text: "dix minutes par jour suffisent a changer votre rapport au clavier." },
  { title: "Niveau 64 · Apprentissage", text: "on ne memorise pas un clavier, on l'apprend doigt par doigt." },
  { title: "Niveau 65 · Précision avant tout", text: "la regularite de frappe vaut toujours mieux que la vitesse brute." },
  { title: "Niveau 66 · Maîtrise du geste", text: "precision avant tout, la vitesse vient ensuite de maniere naturelle." },
  { title: "Niveau 67 · Position de départ", text: "le repos des doigts sur asdf et jklm est le point de depart fondamental." },
  { title: "Niveau 68 · Regard fixe", text: "ecrire les yeux fermes commence par accepter de ne pas regarder les touches." },
  { title: "Niveau 69 · Ponctuation simple", text: "un point, une virgule et deux points permettent de structurer sa pensee." },
  { title: "Niveau 70 · Apostrophes et traits d'union", text: "l'apprentissage d'une langue ou d'un outil demande de l'assiduite." },
  { title: "Niveau 71 · Citations sur la persévérance", text: "c'est en forgeant qu'on devient forgeron, et en tapant qu'on devient dactylo." },
  { title: "Niveau 72 · Citations sur la méthode", text: "rien ne sert de courir, il faut partir a point et garder le bon rythme." },
  { title: "Niveau 73 · Phrase pangramme court", text: "portez ce vieux whisky au juge blond qui fume un cigare." },
  { title: "Niveau 74 · Phrase pangramme complet", text: "voix ambigue d'un coeur qui au zéphyr préfère les jattes de kiwis." },
  { title: "Niveau 75 · Texte narratif 1", text: "le vent souffle doucement dans les arbres de la grande foret calme." },
  { title: "Niveau 76 · Texte narratif 2", text: "un grand livre ouvert sur la table attendait d'etre lu avec attention." },
  { title: "Niveau 77 · Texte descriptif 1", text: "les vagues bleues s'ecrasent en douceur sur le sable chaud de la plage." },
  { title: "Niveau 78 · Texte descriptif 2", text: "la nuit tombe doucement et les premieres etoiles brillent dans le ciel." },
  { title: "Niveau 79 · Défi de précision", text: "la precision exige de frapper chaque touche au centre sans hesiter." },
  { title: "Niveau 80 · Bilan du niveau avancé", text: "votre vitesse s'accélère et vos erreurs deviennent de plus en plus rares." },

  // --- HAUTE PERFORMANCES & EXPERT (81..100) ---
  { title: "Niveau 81 · Vitesse poussée 1", text: "la rapidite d'execution depend de la legerete de votre touche." },
  { title: "Niveau 82 · Vitesse poussée 2", text: "taper sans regarder vous fait gagner des dizaines d'heures chaque annee." },
  { title: "Niveau 83 · Défi des majuscules", text: "Paris, Lyon, Marseille et Bordeaux sont de grandes villes de France." },
  { title: "Niveau 84 · Défi des chiffres et symboles", text: "en 2026, plus de 80% des metiers exigent une maîtrise parfaite du clavier." },
  { title: "Niveau 85 · Alternance des mains complexe", text: "la sténographie et la dactylographie sont des arts de l'ecriture rapide." },
  { title: "Niveau 86 · Vocabulaire professionnel 1", text: "veuillez trouver ci-joint les documents relatifs a notre projet d'avenir." },
  { title: "Niveau 87 · Vocabulaire professionnel 2", text: "nous restons a votre entiere disposition pour toute information complementaire." },
  { title: "Niveau 88 · Rédaction de courriel", text: "bonjour, je vous confirme notre rendez-vous de demain a quatorze heures." },
  { title: "Niveau 89 · Défi d'endurance 1", text: "la persévérance est la cle de la réussite dans toutes les disciplines sportives et intellectuelles." },
  { title: "Niveau 90 · Défi d'endurance 2", text: "un bon dactylographe ne cherche pas la vitesse, la vitesse le rejoint d'elle-meme." },
  { title: "Niveau 91 · Test de régularité", text: "garder le meme intervalle de temps entre chaque touche garantit une frappe harmonieuse." },
  { title: "Niveau 92 · Test d'agilité extrême", text: "exiger le maximum de soi-meme permet d'atteindre des sommets de performance." },
  { title: "Niveau 93 · Texte littéraire 1", text: "dans un trou sous la terre vivait un hobbit. ce n'etait pas un trou deplaisant ou sale." },
  { title: "Niveau 94 · Texte littéraire 2", text: "longtemps, je me suis couche de bonne heure. parfois, a peine ma bougie eteinte." },
  { title: "Niveau 95 · Défi ultime de précision", text: "cent pour cent de precision sur ce texte est le signe d'une maîtrise absolue." },
  { title: "Niveau 96 · Sprint final 1", text: "vos dix doigts sont maintenant des outils d'une efficacite formidable." },
  { title: "Niveau 97 · Sprint final 2", text: "vous n'avez plus besoin d'un regard sur les touches pour exprimer votre pensee." },
  { title: "Niveau 98 · Sprint final 3", text: "votre cerveau et votre clavier sont desormais connectes en ligne directe." },
  { title: "Niveau 99 · Avant-dernier niveau", text: "félicitations pour ce parcours exceptionnel de cent niveaux d'entraînement." },
  { title: "Niveau 100 · Le sommet des 10 Doigts", text: "vous etes désormais un maître dactylographe diplome de la methode des dix doigts !" },
];

export function lessonFor(level: number): { title: string; text: string } {
  const L = Math.max(1, Math.min(100, Math.floor(level)));
  const item = CURRICULUM[L - 1];
  if (item) return item;
  return {
    title: `Niveau ${L} · Entraînement`,
    text: "la saisie n'est pas un talent, c'est une methode.",
  };
}

// Map a character to the key id used by KeyboardFR (lowercased letters,
// punctuation kept literally, space = " ").
export function keyIdFor(ch: string): string {
  if (ch === " ") return " ";
  return ch.toLowerCase();
}
