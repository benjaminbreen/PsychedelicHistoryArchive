#!/usr/bin/env node
import crypto from "node:crypto";
import fs from "node:fs/promises";
import fsSync from "node:fs";
import path from "node:path";
import process from "node:process";

const root = process.cwd();
const importDir = path.join(root, "data", "latin-america-import");

const MOREAU_SLUG = "moreau-hachisch-alienation-mentale";
const BIBRA_SLUG = "bibra-fliegenschwamm-haschisch-genussmittel";
const MOREAU_ID = deterministicUuid(`document:${MOREAU_SLUG}`);
const BIBRA_ID = deterministicUuid(`document:${BIBRA_SLUG}`);

const expertContextPlaceholder = `_This historical-context essay is open for contribution._

Are you a scholar, archivist, community knowledge holder, or subject expert with relevant expertise in this source? Please use the [source issue form](#source-issue-report) at the bottom of this page to propose a short context essay or suggest a contributor. Choose "Other concern" and include "Historical context essay" in the location field.`;

const moreauSourceNote = `_Moreau's 1845 treatise made hashish a psychiatric instrument: a way to observe delirium from within and compare drug-induced experience with mental illness. This excerpt pairs his practical opening on hashish and dawamesc with the later passage where he calls hashish a unique means of exploring mental pathogenesis._`;

const bibraSourceNote = `_Von Bibra's mid-century survey treated intoxicants comparatively across botany, chemistry, travel writing, and self-experiment. This excerpt keeps the focus on fly agaric and hashish: two substances he explicitly compares with opium, alcohol, and other nineteenth-century "Genussmittel."_`;

const moreauOriginalFrench = `_Source: Jacques-Joseph Moreau, Du hachisch et de l'aliénation mentale: études psychologiques (Paris: Fortin, Masson et Cie, 1845), pp. 1-9 and 29-32. This transcription is normalized from the public-domain Internet Archive/Google Books scan; consult the PDF for lineation and exact punctuation._

#### Historique

Comme l'indique suffisamment le titre de cet ouvrage, c'est à l'occasion du hachisch, ou du moins de l'influence qu'exerce cette substance sur les facultés intellectuelles, qu'a été composé le travail que je livre au public.

C'est tout au plus si le hachisch est connu, même de nom, dans le monde médical. M. Aubert-Roche, dans son livre _De la peste, ou typhus d'Orient_ (1840), avait déjà appelé sérieusement l'attention sur le hachisch. En 1841, dans mon mémoire sur le traitement des hallucinations par le _datura stramonium_, je m'attachai à faire connaître sommairement les effets physiologiques de cette substance. C'est par moi-même, et non pas seulement par le rapport d'autrui, que j'avais appris à connaître les effets du hachisch. Au reste, il n'y a pas deux manières de les étudier: l'observation, en pareil cas, lorsqu'elle s'exerce sur d'autres que nous-mêmes, n'atteint que des apparences qui n'apprennent absolument rien, ou peuvent faire tomber dans les plus grossières erreurs.

Une fois pour toutes, et dès en commençant, je tenais à faire cette observation, dont nul ne contestera la justesse. L'expérience personnelle est ici le critérium de la vérité. Je conteste à quiconque le droit de parler des effets du hachisch, s'il ne parle en son nom propre, et s'il n'a été à même de les apprécier par un usage suffisamment répété.

Que l'on ne s'étonne pas de m'entendre parler ainsi. Depuis mon voyage en Orient, les effets du hachisch ont été pour moi l'objet d'une étude sérieuse, persévérante. Autant que j'ai pu, et de toutes manières, je me suis efforcé d'en répandre la connaissance dans le public médical. Mes paroles ont été souvent accueillies avec incrédulité; mais cette incrédulité a cessé toutes les fois que, surmontant certaines craintes, bien naturelles du reste, on a suivi mon exemple, et qu'on a eu le courage de voir par soi-même.

Tous ceux qui ont visité l'Orient savent combien l'usage du hachisch est répandu, parmi les Arabes surtout, chez lesquels il est devenu un besoin non moins impérieux que l'opium chez les Turcs, les Chinois, et les liqueurs alcooliques chez les peuples de l'Europe.

Hachisch est le nom de la plante dont le principe actif forme la base des diverses préparations enivrantes usitées en Égypte, en Syrie et généralement dans presque toutes les contrées orientales. Cette plante est commune dans l'Inde et dans l'Asie méridionale, où elle vient sans culture. C'est une espèce de chanvre qui diffère très peu de notre chanvre d'Europe. Les botanistes l'ont nommé _Cannabis indica_.

La préparation du hachisch la plus commune, et qui sert en quelque sorte de principal condiment à presque toutes les autres, c'est l'extrait gras. La manière de l'obtenir est fort simple: on fait bouillir les feuilles et les fleurs de la plante avec de l'eau à laquelle on a ajouté une certaine quantité de beurre frais; puis, le tout étant réduit, par évaporation, à la consistance d'un sirop, on passe dans un linge. On obtient ainsi le beurre chargé du principe actif et empreint d'une couleur verdâtre assez prononcée.

Cet extrait, qui ne se prend jamais seul, à cause de son goût vireux et nauséabond, sert à la confection de différents électuaires, de pâtes, espèces de nougats, que l'on a soin d'aromatiser avec de l'essence de rose ou de jasmin, afin de masquer l'odeur peu agréable de l'extrait pur. L'électuaire le plus généralement employé est celui que les Arabes appellent _dawamesc_. Sa couleur et sa consistance lui donnent un aspect peu agréable, et qui inspire toujours quelque répugnance, du moins à nous autres Européens.

Les feuilles du hachisch peuvent se fumer avec le tabac; quand elles sont récemment cueillies, elles ont une action rapide et énergique: elles semblent perdre toutes ou presque toutes leurs propriétés en se desséchant. Elles servent encore à la préparation d'une espèce de bière dont les effets sont trop violents pour n'être pas dangereux.

J'ai dit que le dawamesc était la préparation la plus usitée, et dont les effets étaient le plus certains. C'est aussi celle qu'il est le plus facile de se procurer, et qu'on a le moins à craindre de voir s'altérer en la faisant venir d'Orient. C'est du dawamesc que j'ai le plus souvent fait usage.

Son action est loin d'être la même pour tous les individus. À dose égale, elle peut produire des effets extrêmement variés, du moins sous le rapport de leur intensité, suivant les individus. Je ne puis dire précisément quels tempéraments, quelles constitutions ressentent plus vivement son influence.

Il faut prendre le hachisch à jeun, ou du moins plusieurs heures après avoir mangé; sans cela, ses effets sont très incertains, ou tout à fait nuls. Le café paraît aider à leur développement, comme il abrège leur durée, en les rendant momentanément plus intenses.

En général, il ne faut guère moins de la grosseur d'une noix de dawamesc, c'est-à-dire environ 30 grammes, pour obtenir quelques résultats. Avec la moitié ou seulement le quart de cette dose, on éprouvera une gaieté plus ou moins vive, ou même un peu de fou rire; mais ce n'est qu'avec une dose beaucoup plus élevée qu'on obtiendra les effets que l'on désigne généralement dans le Levant sous la dénomination italienne de _fantasia_.

#### Physiologie: introduction

La curiosité seule m'avait d'abord porté à expérimenter par moi-même les effets du hachisch. Un peu plus tard, je n'ai aucune difficulté à en faire l'aveu, je me défendais mal contre le souvenir irritant des sensations dont je lui avais été redevable; mais qu'il me soit permis d'ajouter que, dès le principe, j'étais mû, encore, par des motifs d'un autre ordre. Voici ces motifs:

J'avais vu dans le hachisch, ou plutôt dans son action sur les facultés morales, un moyen puissant, unique, d'exploration en matière de pathogénie mentale; je m'étais persuadé que par elle on devait pouvoir être initié aux mystères de l'aliénation, remonter à la source cachée de ces désordres si nombreux, si variés, si étranges qu'on a l'habitude de désigner sous le nom collectif de folie.

Il se peut que l'on trouve qu'il y a une hardiesse présomptueuse à m'exprimer avec cette assurance sur un sujet que, en général, les hommes dits positifs évitent même d'aborder, le reléguant dans le domaine d'une nuageuse métaphysique.

Cette hardiesse, que j'avoue, les recherches consciencieuses auxquelles ce travail est consacré la légitimeront, j'espère, car on verra qu'elle se fonde, non sur des raisonnements, des inductions dont il est toujours permis de se défier, mais sur des faits que nul doute, nulle incertitude ne saurait atteindre, sur des faits simples et évidents d'observation intérieure.

Ainsi qu'on pourra en juger par la suite, je n'ai eu besoin que de décalquer, en quelque sorte, les principaux phénomènes du délire sur ceux développés par le hachisch, appliquant à ceux-là le mode d'explication que l'examen de ce qui se passait en moi me fournissait pour ceux-ci.

De cette manière, et guidé exclusivement par l'observation, mais par ce genre d'observation qui ne relève que de la conscience ou du sens intime, j'ai cru pouvoir remonter à la source primitive de tout phénomène fondamental du délire. Il en est un qui m'a paru être le fait primitif et générateur de tous les autres: je l'ai appelé fait primordial.

La plupart ont décrit avec soin les symptômes variés à l'infini que leur avaient offert les nombreux malades au milieu desquels ils avaient longtemps vécu; mais je ne sache pas qu'aucun, en parlant de la folie, nous ait transmis le résultat de son expérience personnelle, l'ait décrite d'après ses perceptions et ses sensations propres.

Je terminerai ce travail par le compte-rendu de quelques essais thérapeutiques tentés au moyen du hachisch.`;

const moreauTranslation = `_Archive translation from selected French passages in the public-domain 1845 edition; verify against the PDF for formal quotation._

#### Historical Section

As the title of this work sufficiently indicates, the study I am offering to the public was composed on the occasion of hashish, or at least of the influence that this substance exercises on the intellectual faculties.

Hashish is barely known, even by name, in the medical world. In his book _On the Plague, or Typhus of the Orient_ (1840), M. Aubert-Roche had already called serious attention to hashish. In 1841, in my memoir on the treatment of hallucinations with _Datura stramonium_, I set out to give a brief account of the physiological effects of this substance. I had learned the effects of hashish through myself, and not merely through the report of others. Moreover, there are not two ways to study them: observation, in such a case, when it is exercised on people other than ourselves, reaches only appearances, which teach absolutely nothing, or can lead one into the grossest errors.

Once and for all, and at the beginning, I wished to make this observation, whose correctness no one will dispute. Personal experience is here the criterion of truth. I deny anyone the right to speak of the effects of hashish unless he speaks in his own name, and unless he has been able to appreciate them through sufficiently repeated use.

No one should be surprised to hear me speak this way. Since my journey to the Orient, the effects of hashish have been, for me, the object of serious and persistent study. As far as I could, and in every way, I have tried to spread knowledge of it among the medical public. My words were often received with disbelief; but that disbelief ceased whenever, overcoming certain fears, quite natural ones after all, someone followed my example and had the courage to see for himself.

Everyone who has visited the Orient knows how widespread the use of hashish is, especially among the Arabs, for whom it has become a need no less compelling than opium among the Turks and Chinese, or alcoholic liquors among the peoples of Europe.

Hashish is the name of the plant whose active principle forms the basis of the various intoxicating preparations used in Egypt, Syria, and generally across almost all the eastern regions. This plant is common in India and southern Asia, where it grows uncultivated. It is a species of hemp that differs very little from our European hemp. Botanists have named it _Cannabis indica_.

The most common preparation of hashish, and the one that serves in a sense as the principal ingredient in almost all the others, is the fatty extract. The method of obtaining it is very simple: one boils the leaves and flowers of the plant with water to which a certain quantity of fresh butter has been added; then, when the whole has been reduced by evaporation to the consistency of a syrup, it is passed through a cloth. In this way one obtains butter charged with the active principle and marked by a fairly pronounced greenish color.

This extract, which is never taken alone because of its strong and nauseating taste, is used to make various electuaries and pastes, kinds of nougat that are carefully aromatized with essence of rose or jasmine in order to mask the unpleasant odor of the pure extract. The electuary most generally used is the one the Arabs call _dawamesc_. Its color and consistency give it an unpleasant appearance, one that always inspires some repugnance, at least among us Europeans.

Hashish leaves can be smoked with tobacco. When freshly picked, they have a rapid and energetic action; they seem to lose all, or almost all, of their properties as they dry. They are also used to prepare a kind of beer whose effects are too violent not to be dangerous.

I have said that dawamesc was the preparation most commonly used and the one whose effects were most certain. It is also the easiest to obtain, and the least likely to deteriorate when brought from the Orient. Dawamesc is what I have used most often.

Its action is far from the same for all individuals. At an equal dose, it can produce extremely varied effects, at least in their intensity, depending on the person. I cannot say precisely which temperaments or constitutions feel its influence most strongly.

Hashish must be taken fasting, or at least several hours after eating; otherwise its effects are very uncertain, or entirely null. Coffee seems to help their development, just as it shortens their duration by making them momentarily more intense.

In general, one needs scarcely less than the size of a walnut of dawamesc, that is, about 30 grams, to obtain any results. With half, or only a quarter, of this dose, one will experience a more or less lively gaiety, or even a little fit of laughter; but only with a much higher dose will one obtain the effects generally designated in the Levant by the Italian name _fantasia_.

#### Physiology: Introduction

At first, curiosity alone led me to experiment on myself with the effects of hashish. A little later, I have no difficulty admitting it, I defended myself poorly against the irritating memory of the sensations I owed to it; but allow me to add that, from the beginning, I was also moved by motives of another order. These were the motives:

I saw in hashish, or rather in its action on the moral faculties, a powerful and unique means of exploration in the matter of mental pathogenesis. I persuaded myself that through it one ought to be able to be initiated into the mysteries of alienation, to ascend to the hidden source of those disorders so numerous, so varied, and so strange that we are accustomed to designate them collectively by the name madness.

It may be that one will find a presumptuous boldness in my expressing myself with such assurance on a subject that, in general, so-called positive men avoid even approaching, relegating it to the domain of a misty metaphysics.

This boldness, which I acknowledge, will be justified, I hope, by the conscientious research to which this work is devoted; for one will see that it is founded not on reasonings or inductions, of which one is always permitted to be wary, but on facts that no doubt and no uncertainty can touch, simple and evident facts of inner observation.

As one will be able to judge from what follows, I needed only to trace, so to speak, the principal phenomena of delirium onto those developed by hashish, applying to the former the mode of explanation that the examination of what was happening in me supplied for the latter.

In this way, guided exclusively by observation, but by that kind of observation that depends only on consciousness or inner sense, I believed I could ascend to the primitive source of every fundamental phenomenon of delirium. One fact seemed to me to be the primitive fact and generator of all the others: I called it the primordial fact.

Most have carefully described the infinitely varied symptoms presented by the many patients among whom they had long lived; but I do not know of anyone who, speaking of madness, has transmitted to us the result of his personal experience or described it according to his own perceptions and sensations.

I will conclude this work with an account of several therapeutic trials attempted by means of hashish.`;

const bibraOriginalGerman = `_Source: Ernst Freiherr von Bibra, Die narkotischen Genussmittel und der Mensch (Nürnberg: Verlag von Wilhelm Schmid, 1855), pp. 135-139 and 265-270. The transcription below transliterates the Fraktur into modern Roman type and lightly normalizes spacing; consult the PDF for exact lineation and spelling._

#### Fliegenschwamm. Amanita muscaria

Es scheint mit dem Fliegenschwamm ein ähnliches Verhältnis wie mit der Hanfpflanze statt zu finden: jenes nämlich, daß an einem Standorte gewisse Bestandteile mehr ausgebildet werden als an andern. Unser Fliegenschwamm hat zwar auch starke giftige Eigenschaften, aber die berauschenden Wirkungen, welche der sibirische ausübt, scheinen ihm zu fehlen, obgleich er sowohl als der bei uns allenthalben in Wäldern wachsende Fliegenschwamm nach ihren botanischen Kennzeichen nicht unterschieden sind.

Übrigens fragt es sich, ob man bei uns ganz in der Art Versuche mit dem Fliegenschwamm angestellt hat, wie es jene Völker tun, die ihn als Narcoticum benützen, da die meisten in dieser Beziehung bei uns angestellten Experimente mehr eine toxicologische Richtung hatten.

Der Fliegenschwamm hat einen zwei bis sieben Zoll breiten, feurig roten, bisweilen aber auch gelblich gefärbten Hut mit weißen Schuppen. Der Rand ist meistens fein gefurcht, der Stiel weiß, innen hohl, der Wulst schuppig.

Die Benützung dieses Giftschwammes als Narcoticum ist bei den Tungusen, Jukagiren, Jakuten, Ostjaken und den Kamtschadalen gebräuchlich, und er wird diesen Völkern zum Teil unter dem Namen Muchumor zugeführt, in Kamtschatka aber wächst er häufig wild.

Man sammelt den Schwamm in heißen Monaten und hängt ihn zum Trocknen auf; bisweilen läßt man ihn aber auch an seinem Standorte trocknen und bringt ihn dann schon trocken heim. Auf diese letzte Weise soll er sich kräftiger zeigen als im künstlich getrockneten Zustande.

Er wird auf mancherlei Art genossen, wohl auch frisch in Suppe oder in Saucen, wo er aber weniger berauschend wirkt; ferner eingetrocknet und in Pillenform, wo man ihn indessen ganz verschluckt, indem er getrocknet den Magen allzusehr angreifen soll. Die beliebteste Art ist aber als Getränke, indem man ihn in den ausgepreßten Saft der wild wachsenden Zwibelbeere, _Vaccinium uliginosum_, legt, oder auch mit jenem des schmalblätterigen Weiderichs, _Epilobium angustifolium_, vermischt trinkt.

Um für die Dauer eines ganzen Tages eine angenehme Berauschung hervorzubringen, reicht ein großer Schwamm; und trinkt man Wasser nach, so wird die Wirkung stärker. Die Phantasie wird durch den Fliegenschwamm ähnlich angeregt, wie es beim Opium und Haschisch der Fall ist. Der Effekt tritt aber meist erst nach ein oder zwei Stunden ein. Dann legen sich die Trinker auf den Rücken, singen und schwärmen von Glück und Liebe, Reichtum und Ansehen, und bilden sich, wie es heißt, ein, wohlbeleibt und fett zu sein, was also, wie es scheint, bei jenen Völkern ein erwünschter Zustand ist.

Die Schamanen sollen sich bisweilen vollständig in den Zustand der Seher versetzen. Bei manchen Individuen bringt der Trank eine ganz besondere Lebendigkeit hervor; andere aber werden träge und stumpfsinnig. Es scheint überhaupt der Fliegenschwamm, ganz wie die geistigen Getränke, verschieden auf verschiedene Persönlichkeiten zu wirken, was beim Opium und andern ähnlichen Mitteln nicht so ganz der Fall ist.

Bisweilen fallen bei solchen Gelagen die tollsten Dinge vor. Musikalische Talente singen unaufhörlich, andere plaudern, lachen und erzählen aller Welt ihre Geheimnisse; wieder andere werden auf ähnliche Art affiziert, wie es beim Haschisch der Fall ist. Der Begriff des Raumes schwindet, und sie machen mächtige Sprünge, um über einen Strohhalm oder einen andern kleinen Gegenstand hinwegzukommen.

Häufig ist aber auch die Muskelkraft auf eine ganz besondere Weise erhöht; so führt Langsdorff unter anderem an, daß ein durch Fliegenschwamm berauschter Mann einen 120 Pfund schweren Sack fünfzehn Werste weit getragen habe.

Endlich aber, und besonders bei einer allzu mäßigen Dosis, schwillt das Gesicht an; es stellt sich Schwindel, Kopfweh und nicht selten eine vollständige Bewußtlosigkeit ein. Bei längerem und fortgesetztem Gebrauche folgt Zittern in den Gliedern und ähnliche Erscheinungen, wie sie beim Säuferwahnsinn bekannt sind, und im höheren Alter erfolgt dann vollständiger Blödsinn.

Eine andere sehr eigentümliche Eigenschaft des Fliegenschwammes aber haben unsere Spirituosen nicht: der Harn eines Individuums, welches Fliegenschwamm genossen hat, wird ebenfalls berauschend, ja noch mehr als das Getränke in erster Reihe, und äußerst wohlschmeckend, wie jene Leute sagen. Meist trinken deshalb die Diener den Harn ihrer Herren. Da diese Fortführung des Harns lange anhält, so kommt es häufig vor, daß ein Berauschter des Morgens ein Glas seines Harns trinkt, sich auf diese Weise des Katzenjammers entledigt und aufs Neue in die herrlichsten Träume von Liebesglück und Wohlbeleibigkeit verfällt.

So kann auf solche Art eine kleine Gesellschaft guter Freunde, sehr wohlfeil, wenn gleich nach unseren Begriffen eben nicht besonders anständig, sich ein Vergnügen machen. Reisende behaupten, daß das häufig geschehe.

#### Haschisch. Cannabis indica

Haschisch, von welchem wir im Folgenden sprechen wollen, wird aus dem indischen Hanf, _Cannabis indica_, bereitet.

Es ist unnötig, unsere Hanfpflanze zu beschreiben, da sie jedermann kennt. Den indischen Hanf kann man füglich so bezeichnen, daß er gerade so wie der europäische ist, nur ganz anders. Das heißt: die botanischen, wissenschaftlichen Merkmale beider Pflanzen sind ganz dieselben; Blattform, Stellung und Anheftung der Blätter, die Stengel, die Blüthen, alles muß bei beiden vollkommen gleich beschrieben werden. Mit dem besten Willen könnte man keine neue Species machen; weshalb eigentlich, wie mir scheint, der Name _Cannabis indica_ auch nicht wohl als eine wissenschaftliche Bezeichnung genommen werden könnte, sondern bloß als eine Art Aushülfe.

Aber die indische Hanfpflanze ist größer als die in Europa gezogene und hat ganz andere Eigenschaften als diese, chemische nämlich. Es treten Stoffe in ihr auf, welche bei uns, in kälteren Klimaten, nicht zur Reife kommen, oder sich nur in höchst geringer Menge entwickeln könnten.

Die beste Zeit zur Bereitung oder Aufsammlung des Haschisch ist die, wenn die Samen eben erst angefangen haben sich zu bilden. Es schwitzt dann aus den Blättern ein Harz aus, welches man aufsammelt und Churrus nennt, wie es denn für die verschiedenen aus dem Hanf erzeugten Präparate auch sehr verschiedene Namen gibt, während der allgemeine Sammelname für alle Haschisch zu sein scheint.

Der Churrus wird sehr häufig in Nepal und Hindostan verbraucht; als die beste Sorte wird der von Herat betrachtet. Man verwendet aber auch die getrockneten Blüthen, die beginnenden Früchte und die kleineren Blätter, indem man sie trocknet, zu Pulver reibt und dann raucht; denn ähnlich dem Opium ißt und raucht man das Haschisch. Die Mauren der Sahara und ebenso die Bewohner der Berberei rauchen fast alle leidenschaftlich diese trockenen Spitzen, welche sie Keef nennen.

Eine weitere Art, den Haschisch zu gebrauchen, ist als fettes Extract. Man kocht zu diesem Ende die Blätter, Blüthen und beginnenden Früchte mit Wasser, dem man etwas Butter zugesetzt hat, und dampft zur Syrupconsistenz ab. Die so erhaltene Butter hat das wirksame Princip aufgenommen. Sie hat im frischen Zustande einen widerlichen Geruch, weshalb man Rosenöl oder Jasminöl zusetzt.

Dieses fette Extract wird ferner mit Süßigkeiten gemengt, zum Beispiel mit Mandeln, Pistazien und Zucker und wohl auch noch in anderer Form mit mehreren Konfitüren. Man nennt dies Dawamesk und nimmt bis dreißig Gramme davon, entweder mit Kaffee, mit Wasser, oder auch für sich.

Das Nepenthes der Alten war wahrscheinlich irgend ein Hanfpräparat; und von den Scythen erzählt Herodot, daß sie Hanf auf glühende Steine gestreut und sich durch den aufsteigenden Dampf in einen Zustand von Entzückung versetzt hätten. Auch Galen erwähnt des Hanfes als eines Mittels, um Heiterkeit und Frohsinn hervorzurufen.

Diese halb historischen, halb mythischen Notizen über das Alter des Gebrauches, Haschisch zu nehmen, führen uns auf die physiologische Wirkung, welche dasselbe auf den Organismus hervorbringt.

Auch abgesehen von der Stärke der sehr verschiedenen Präparate und der Größe der Dose, in welcher es genommen wird, ist ohne Zweifel die Einwirkung des Haschisch, wie jene des Opiums, eine höchst verschiedene, ja nach der Individualität des Konsumierenden. Dies tritt schon bei einzelnen Personen eines und desselben Volkes hervor; noch mehr aber werden diese Unterschiede sichtbar durch die Racenverschiedenheit.`;

const bibraTranslation = `_Archive translation from selected German passages in the public-domain 1855 edition; verify against the PDF for formal quotation._

#### Fly Agaric. Amanita muscaria

It seems that the fly agaric stands in a relation similar to the hemp plant: in some places certain constituents are more fully developed than in others. Our fly agaric certainly has strong poisonous properties, but the intoxicating effects produced by the Siberian one seem to be lacking in it, although by botanical characters it is not distinct from the fly agaric that grows everywhere in our forests.

The question remains, however, whether experiments have been made here with the fly agaric in quite the same way as among those peoples who use it as a narcotic, since most experiments made here in this respect have had more of a toxicological direction.

The fly agaric has a fiery red cap, two to seven inches wide, sometimes yellowish, with white scales. The edge is usually finely grooved, the stem white and hollow within, and the bulb scaly.

The use of this poisonous mushroom as a narcotic is customary among the Tungus, Yukaghir, Yakut, Ostyak, and Kamchadal peoples. It is supplied to some of these peoples under the name muchumor, while in Kamchatka it often grows wild.

The mushroom is gathered in hot months and hung up to dry; sometimes it is also left to dry where it stands and then brought home already dry. In this latter way it is said to show itself more powerful than when dried artificially.

It is consumed in several ways, sometimes fresh in soup or sauces, though there it has less intoxicating effect; more often dried and in pill form, in which case it is swallowed whole because, when dried, it is said to attack the stomach too strongly. The favorite method is as a drink, by placing it in the expressed juice of the wild-growing bog bilberry, _Vaccinium uliginosum_, or drinking it mixed with that of narrow-leaved willowherb, _Epilobium angustifolium_.

To produce a pleasant intoxication lasting an entire day, one large mushroom is enough; if one drinks water afterward, the effect becomes stronger. The imagination is stimulated by fly agaric much as it is by opium and hashish. The effect, however, usually begins only after one or two hours. Then the drinkers lie on their backs, sing, and rave of happiness and love, wealth and honor; and, as it is said, they imagine themselves well-fed and fat, which appears to be a desired condition among those peoples.

The shamans are said at times to place themselves completely in the state of seers. In some individuals the drink produces a very particular liveliness; others become sluggish and dull. In general, fly agaric, just like spirituous drinks, seems to act differently on different personalities, which is not quite so much the case with opium and similar substances.

At such gatherings the wildest things sometimes occur. Those with musical talents sing without stopping; others chatter, laugh, and tell the whole world their secrets; still others are affected in a way similar to hashish. The concept of space disappears, and they make mighty leaps in order to get over a straw or some other small object.

Muscular strength, too, is often increased in a very particular way. Langsdorff, among other examples, reports that a man intoxicated by fly agaric carried a sack weighing 120 pounds for fifteen versts.

Finally, however, and especially with an excessively large dose, the face swells; dizziness, headache, and not rarely complete unconsciousness set in. With longer and continued use there follows trembling in the limbs and similar phenomena to those known in delirium tremens, and in advanced age complete imbecility follows.

But our spirits do not have another very peculiar property of the fly agaric: the urine of an individual who has consumed fly agaric also becomes intoxicating, indeed even more so than the drink in the first instance, and, as those people say, extremely pleasant to the taste. For this reason servants often drink the urine of their masters. Since this transmission through the urine lasts a long time, it often happens that an intoxicated person drinks a glass of his own urine in the morning, relieves himself in this way of the hangover, and falls anew into the most splendid dreams of love, happiness, and stoutness.

In this way a small company of good friends can make a pleasure for themselves very cheaply, even if according to our concepts not especially decently. Travelers claim that this often occurs.

#### Hashish. Cannabis indica

Hashish, of which we will speak in what follows, is prepared from Indian hemp, _Cannabis indica_.

It is unnecessary to describe our hemp plant, since everyone knows it. Indian hemp can be characterized by saying that it is exactly like the European one, only entirely different. That is to say, the botanical and scientific characters of the two plants are exactly the same: leaf form, the position and attachment of the leaves, the stalks, the flowers, everything must be described in both in exactly the same way. With the best will in the world one could not make a new species; for this reason, it seems to me, the name _Cannabis indica_ cannot properly be taken as a scientific designation, but merely as a kind of stopgap.

But the Indian hemp plant is larger than the one grown in Europe and has entirely different properties, namely chemical ones. Substances appear in it that, among us in colder climates, would not come to maturity, or would develop only in the smallest quantity.

The best time for preparing or collecting hashish is when the seeds have only just begun to form. A resin then sweats out of the leaves, which is collected and called churrus. There are many different names for the various preparations produced from hemp, while hashish seems to be the general collective name for all of them.

Churrus is very commonly consumed in Nepal and Hindustan; the variety from Herat is regarded as the best. The dried flowers, incipient fruits, and smaller leaves are also used, by drying them, rubbing them into powder, and then smoking them; for hashish, like opium, is both eaten and smoked. The Moors of the Sahara, and likewise the inhabitants of Barbary, almost all smoke these dry tips passionately, calling them keef.

Another way to use hashish is as a fatty extract. For this purpose the leaves, flowers, and incipient fruits are boiled with water to which some butter has been added, and then evaporated to the consistency of syrup. The butter obtained in this way has taken up the active principle. In its fresh state it has a repulsive odor, which is why rose oil or jasmine oil is added.

This fatty extract is further mixed with sweets, for example with almonds, pistachios, and sugar, and probably in other forms with various confections. This is called dawamesk, and up to thirty grams of it are taken, either with coffee, with water, or by itself.

The nepenthe of the ancients was probably some hemp preparation; and Herodotus tells of the Scythians that they scattered hemp on glowing stones and, through the rising vapor, put themselves into a state of rapture. Galen also mentions hemp as a means of producing cheerfulness and good spirits.

These half-historical, half-mythical notes about the age of the practice of taking hashish bring us to the physiological effect that it produces on the organism.

Apart from the strength of the very different preparations and the size of the dose in which it is taken, the action of hashish, like that of opium, is without doubt highly variable, depending on the individuality of the consumer. This already appears among individual persons of one and the same people; still more do these differences become visible through differences of race.`;

const people = [
  {
    id: deterministicUuid("person:jacques-joseph-moreau"),
    slug: "jacques-joseph-moreau",
    name: "Jacques-Joseph Moreau",
    sort_name: "Moreau, Jacques-Joseph",
    birth_year: 1804,
    death_year: 1884,
    bio: "French psychiatrist, often called Moreau de Tours, whose 1845 Du hachisch et de l'aliénation mentale made hashish central to a clinical theory of drug-induced delirium and mental illness."
  },
  {
    id: deterministicUuid("person:ernst-von-bibra"),
    slug: "ernst-von-bibra",
    name: "Ernst von Bibra",
    sort_name: "Bibra, Ernst von",
    birth_year: 1806,
    death_year: 1878,
    bio: "German naturalist and chemist whose Die narkotischen Genussmittel und der Mensch surveyed intoxicants comparatively through botany, chemistry, travel accounts, and self-experiment."
  }
];

const tags = [
  tag("1800-1850", "1800-1850", "era"),
  tag("1850-1900", "1850-1900", "era"),
  tag("europe", "Europe", "region"),
  tag("france", "France", "region"),
  tag("germany", "Germany", "region"),
  tag("hashish", "Hashish", "substance"),
  tag("psychiatry", "Psychiatry", "topic"),
  tag("self-experiment", "Self-experiment", "topic"),
  tag("french-psychiatry", "French psychiatry", "topic"),
  tag("comparative-pharmacology", "Comparative pharmacology", "topic"),
  tag("german-natural-history", "German natural history", "topic")
];

async function main() {
  await fs.mkdir(path.join(importDir, "translations"), { recursive: true });
  await fs.writeFile(path.join(importDir, "translations", `${MOREAU_SLUG}.md`), `${moreauTranslation}\n`, "utf8");
  await fs.writeFile(path.join(importDir, "translations", `${BIBRA_SLUG}.md`), `${bibraTranslation}\n`, "utf8");

  const moreauPdf = `pdfs/${MOREAU_SLUG}/moreau-hachisch-alienation-mentale-excerpts.pdf`;
  const bibraPdf = `pdfs/${BIBRA_SLUG}/bibra-fliegenschwamm-haschisch-genussmittel-excerpts.pdf`;
  const moreauStorage = `documents/${MOREAU_ID}/pdfs/${MOREAU_SLUG}/moreau-hachisch-alienation-mentale-excerpts.pdf`;
  const bibraStorage = `documents/${BIBRA_ID}/pdfs/${BIBRA_SLUG}/bibra-fliegenschwamm-haschisch-genussmittel-excerpts.pdf`;

  const documents = await readJson("documents");
  upsertBy(documents, "id", [
    {
      id: MOREAU_ID,
      slug: MOREAU_SLUG,
      title: "Hashish and Mental Alienation",
      subtitle: "Moreau de Tours on dawamesc, self-experiment, and experimental psychiatry",
      display_date: "1845",
      date_start: 1845,
      date_end: 1845,
      document_type: "Book Excerpt",
      medium: "Text",
      language: "French",
      content_language: "French",
      translation_language: "English",
      translation_text_path: `translations/${MOREAU_SLUG}.md`,
      translation_provider: "archive",
      translation_note: "Archive translation from selected French passages in the 1845 public-domain edition; verify against the PDF for formal quotation.",
      reader_mode: "translation",
      region: "France; Europe",
      publication_place: "Paris",
      publisher: "Fortin, Masson et Cie",
      summary: "Selected passages from Moreau de Tours's 1845 psychiatric treatise on hashish, including his insistence on personal experience, description of dawamesc preparation and dosing, and claim that hashish offered a unique experimental route into the psychology of madness.",
      abstract: "Selected passages from Moreau de Tours's 1845 psychiatric treatise on hashish, including his insistence on personal experience, description of dawamesc preparation and dosing, and claim that hashish offered a unique experimental route into the psychology of madness.",
      editorial_note: "Staged in July 2026 from the public-domain Internet Archive/Google Books scan. Excerpt PDF includes printed pages 1-9 and 29-32.",
      citation: "Moreau, Jacques-Joseph. Du hachisch et de l'aliénation mentale: études psychologiques. Paris: Fortin, Masson et Cie, 1845, pp. 1-9, 29-32.",
      rights_statement: "Public domain. The excerpt PDF was prepared from the Internet Archive/Google Books scan of the 1845 Paris edition.",
      source_url: "https://archive.org/details/duhachischetdel00moregoog",
      external_access_url: "https://archive.org/download/duhachischetdel00moregoog/duhachischetdel00moregoog.pdf",
      access_type: "hosted",
      hosting_status: "translation_transcript_pdf",
      cover_image_path: `documents/${MOREAU_ID}/pdf-thumbnails/${MOREAU_SLUG}/page-001.jpg`,
      thumbnail_path: `documents/${MOREAU_ID}/pdf-thumbnails/${MOREAU_SLUG}/page-001.jpg`,
      is_featured: false,
      status: "published",
      published_at: null
    },
    {
      id: BIBRA_ID,
      slug: BIBRA_SLUG,
      title: "Fly Agaric and Hashish in Die narkotischen Genussmittel",
      subtitle: "Ernst von Bibra's German comparative account of Amanita and Cannabis",
      display_date: "1855",
      date_start: 1855,
      date_end: 1855,
      document_type: "Book Excerpt",
      medium: "Text",
      language: "German",
      content_language: "German",
      translation_language: "English",
      translation_text_path: `translations/${BIBRA_SLUG}.md`,
      translation_provider: "archive",
      translation_note: "Archive translation from selected German passages in the 1855 public-domain edition; verify against the PDF for formal quotation.",
      reader_mode: "translation",
      region: "Germany; Europe; Siberia; Central Asia; South Asia",
      publication_place: "Nuremberg",
      publisher: "Wilhelm Schmid",
      summary: "Selective excerpts from Ernst von Bibra's 1855 German survey of narcotic Genussmittel, focused on fly agaric and hashish. The passages show a mid-century comparative framework linking Amanita, Cannabis, opium, alcohol, travel accounts, chemistry, and differential effects across persons and places.",
      abstract: "Selective excerpts from Ernst von Bibra's 1855 German survey of narcotic Genussmittel, focused on fly agaric and hashish. The passages show a mid-century comparative framework linking Amanita, Cannabis, opium, alcohol, travel accounts, chemistry, and differential effects across persons and places.",
      editorial_note: "Staged in July 2026 from the public-domain Internet Archive/Google Books scan. Excerpt PDF includes printed pages 135-139 and 265-270.",
      citation: "Bibra, Ernst Freiherr von. Die narkotischen Genussmittel und der Mensch. Nürnberg: Verlag von Wilhelm Schmid, 1855, pp. 135-139, 265-270.",
      rights_statement: "Public domain. The excerpt PDF was prepared from the Internet Archive/Google Books scan of the 1855 Nuremberg edition.",
      source_url: "https://archive.org/details/bub_gb_GDIbAAAAYAAJ",
      external_access_url: "https://archive.org/download/bub_gb_GDIbAAAAYAAJ/bub_gb_GDIbAAAAYAAJ.pdf",
      access_type: "hosted",
      hosting_status: "translation_transcript_pdf",
      cover_image_path: `documents/${BIBRA_ID}/pdf-thumbnails/${BIBRA_SLUG}/page-001.jpg`,
      thumbnail_path: `documents/${BIBRA_ID}/pdf-thumbnails/${BIBRA_SLUG}/page-001.jpg`,
      is_featured: false,
      status: "published",
      published_at: null
    }
  ]);
  await writeJson("documents", documents);

  const peopleRows = await readJson("people");
  upsertBy(peopleRows, "id", people);
  await writeJson("people", peopleRows);

  const tagRows = await readJson("tags");
  upsertBy(tagRows, "id", tags);
  await writeJson("tags", tagRows);
  const tagCache = new Map(tagRows.map((row) => [row.slug, row.id]));
  for (const nextTag of tags) tagCache.set(nextTag.slug, nextTag.id);

  const documentPeople = await readJson("document_people");
  upsertBy(documentPeople, ["document_id", "person_id", "role"], [
    { document_id: MOREAU_ID, person_id: personId("jacques-joseph-moreau"), role: "author" },
    { document_id: BIBRA_ID, person_id: personId("ernst-von-bibra"), role: "author" }
  ]);
  await writeJson("document_people", documentPeople);

  const documentTags = await readJson("document_tags");
  upsertBy(documentTags, ["document_id", "tag_id"], [
    ...tagLinks(MOREAU_ID, [
      "1800-1850",
      "book-excerpt",
      "europe",
      "france",
      "hashish",
      "cannabis",
      "psychiatry",
      "french-psychiatry",
      "self-experiment",
      "human-experiments",
      "medicine",
      "pharmacology",
      "visionary-experience",
      "psychoactive-plants"
    ], tagCache),
    ...tagLinks(BIBRA_ID, [
      "1850-1900",
      "book-excerpt",
      "europe",
      "germany",
      "siberia",
      "fly-agaric",
      "amanita-muscaria",
      "mushrooms",
      "hashish",
      "cannabis",
      "natural-history",
      "comparative-pharmacology",
      "german-natural-history",
      "ethnopharmacology",
      "pharmacology",
      "psychoactive-plants"
    ], tagCache)
  ]);
  await writeJson("document_tags", documentTags);

  const documentSections = await readJson("document_sections");
  upsertBy(documentSections, "id", [
    section(MOREAU_ID, 0, "Introduction", "source_note", moreauSourceNote),
    section(MOREAU_ID, 1, "Original French", "transcript", moreauOriginalFrench),
    section(MOREAU_ID, 2, "Historical context", "historical_context", expertContextPlaceholder),
    section(BIBRA_ID, 0, "Introduction", "source_note", bibraSourceNote),
    section(BIBRA_ID, 1, "Original German", "transcript", bibraOriginalGerman),
    section(BIBRA_ID, 2, "Historical context", "historical_context", expertContextPlaceholder)
  ]);
  await writeJson("document_sections", documentSections);

  const files = await readJson("files");
  upsertBy(files, "id", [
    pdfFile(MOREAU_ID, moreauPdf, moreauStorage),
    pdfFile(BIBRA_ID, bibraPdf, bibraStorage)
  ]);
  await writeJson("files", files);

  const assets = await readJson("assets");
  upsertBy(assets, "id", [
    pdfAsset(MOREAU_ID, MOREAU_SLUG, moreauPdf, moreauStorage, "https://archive.org/download/duhachischetdel00moregoog/duhachischetdel00moregoog.pdf"),
    pdfAsset(BIBRA_ID, BIBRA_SLUG, bibraPdf, bibraStorage, "https://archive.org/download/bub_gb_GDIbAAAAYAAJ/bub_gb_GDIbAAAAYAAJ.pdf")
  ]);
  await writeJson("assets", assets);

  const externalSources = await readJson("external_sources");
  upsertBy(externalSources, "id", [
    externalSource(MOREAU_ID, "Internet Archive", "Full source page", "https://archive.org/details/duhachischetdel00moregoog", "Public-domain 1845 Paris edition, digitized by Google Books.", true),
    externalSource(MOREAU_ID, "Internet Archive", "Full source PDF", "https://archive.org/download/duhachischetdel00moregoog/duhachischetdel00moregoog.pdf", "Public-domain 1845 Paris edition, digitized by Google Books.", false),
    externalSource(BIBRA_ID, "Internet Archive", "Full source page", "https://archive.org/details/bub_gb_GDIbAAAAYAAJ", "Public-domain 1855 Nuremberg edition, digitized by Google Books.", true),
    externalSource(BIBRA_ID, "Internet Archive", "Full source PDF", "https://archive.org/download/bub_gb_GDIbAAAAYAAJ/bub_gb_GDIbAAAAYAAJ.pdf", "Public-domain 1855 Nuremberg edition, digitized by Google Books.", false)
  ]);
  await writeJson("external_sources", externalSources);

  await updateArchiveSources();
  await updateReadmeCounts();

  await mirrorCsv("documents", documents);
  await mirrorCsv("people", peopleRows);
  await mirrorCsv("tags", tagRows);
  await mirrorCsv("document_people", documentPeople);
  await mirrorCsv("document_tags", documentTags);
  await mirrorCsv("document_sections", documentSections);
  await mirrorCsv("files", files);
  await mirrorCsv("assets", assets);
  await mirrorCsv("external_sources", externalSources);

  console.log(`Staged ${MOREAU_SLUG} and ${BIBRA_SLUG}`);
}

function personId(slug) {
  const row = people.find((personRow) => personRow.slug === slug);
  if (!row) throw new Error(`Missing person ${slug}`);
  return row.id;
}

function tag(slug, name, tag_type) {
  return {
    id: deterministicUuid(`tag:${slug}`),
    slug,
    name,
    description: "",
    tag_type
  };
}

function tagLinks(documentId, slugs, tagCache) {
  return slugs.map((slug) => {
    const tagId = tagCache.get(slug);
    if (!tagId) throw new Error(`Missing tag ${slug}`);
    return { document_id: documentId, tag_id: tagId };
  });
}

function section(documentId, position, heading, sectionType, body) {
  return {
    id: deterministicUuid(`${documentId}:section:${position}:${heading}`),
    document_id: documentId,
    position,
    heading,
    section_type: sectionType,
    body,
    body_format: "markdown"
  };
}

function pdfFile(documentId, localPath, storagePath) {
  const bytes = fsSync.readFileSync(path.join(importDir, localPath));
  return {
    id: deterministicUuid(`${documentId}:original-pdf`),
    document_id: documentId,
    page_id: null,
    kind: "original_pdf",
    storage_path: storagePath,
    mime_type: "application/pdf",
    byte_size: bytes.length,
    width: null,
    height: null,
    checksum: sha256(bytes)
  };
}

function pdfAsset(documentId, slug, localPath, storagePath, sourceUrl) {
  const bytes = fsSync.readFileSync(path.join(importDir, localPath));
  return {
    id: deterministicUuid(`${documentId}:original-pdf`),
    document_id: documentId,
    document_slug: slug,
    source_url: sourceUrl,
    local_path: localPath,
    storage_path: storagePath,
    kind: "original_pdf",
    mime_type: "application/pdf",
    downloaded: true,
    sha256: sha256(bytes),
    byte_size: bytes.length,
    width: null,
    height: null
  };
}

function externalSource(documentId, repositoryName, accessLabel, url, rightsNote, isPrimary) {
  return {
    id: deterministicUuid(`${documentId}:external:${accessLabel}:${url}`),
    document_id: documentId,
    repository_name: repositoryName,
    institution_name: "",
    url,
    access_label: accessLabel,
    stable_identifier: url,
    rights_note: rightsNote,
    is_primary: isPrimary,
    last_checked_at: null
  };
}

async function updateArchiveSources() {
  const archivePath = path.join(importDir, "archive_sources.json");
  let rows = [];
  try {
    rows = JSON.parse(await fs.readFile(archivePath, "utf8"));
  } catch (error) {
    if (error?.code !== "ENOENT") throw error;
  }

  upsertBy(rows, "slug", [
    {
      id: MOREAU_SLUG.replaceAll("-", "_"),
      slug: MOREAU_SLUG,
      title: "Hashish and Mental Alienation",
      author: "Jacques-Joseph Moreau",
      year: 1845,
      displayDate: "1845",
      type: "Book Excerpt",
      medium: "Text",
      era: "1800-1850",
      region: "France; Europe",
      language: "French",
      tags: ["1800-1850", "Book excerpt", "Europe", "France", "Hashish", "Cannabis", "Psychiatry", "Self-experiment", "Medicine", "Pharmacology", "Visionary experience"],
      people: ["Jacques-Joseph Moreau"],
      substances: ["Hashish", "Cannabis"],
      summary: "Selected passages from Moreau de Tours's 1845 psychiatric treatise on hashish, including his insistence on personal experience, description of dawamesc preparation and dosing, and claim that hashish offered a unique experimental route into the psychology of madness.",
      excerpt: "Personal experience is here the criterion of truth.",
      citation: "Moreau, Jacques-Joseph. Du hachisch et de l'aliénation mentale: études psychologiques. Paris: Fortin, Masson et Cie, 1845.",
      rights: "Public domain.",
      sourceUrl: "https://archive.org/details/duhachischetdel00moregoog",
      accessType: "hosted",
      hostingStatus: "translation_transcript_pdf",
      wordCount: wordCount(`${moreauOriginalFrench}\n\n${moreauTranslation}`),
      addedDate: "2026-07-09",
      featured: false,
      imageTone: "document",
      imagePath: `/documents/${MOREAU_ID}/pdf-thumbnails/${MOREAU_SLUG}/page-001.jpg`,
      transcript: moreauOriginalFrench,
      translation: moreauTranslation
    },
    {
      id: BIBRA_SLUG.replaceAll("-", "_"),
      slug: BIBRA_SLUG,
      title: "Fly Agaric and Hashish in Die narkotischen Genussmittel",
      author: "Ernst von Bibra",
      year: 1855,
      displayDate: "1855",
      type: "Book Excerpt",
      medium: "Text",
      era: "1850-1900",
      region: "Germany; Europe; Siberia; South Asia",
      language: "German",
      tags: ["1850-1900", "Book excerpt", "Europe", "Germany", "Siberia", "Fly agaric", "Amanita muscaria", "Mushrooms", "Hashish", "Cannabis", "Natural history", "Comparative pharmacology", "Ethnopharmacology"],
      people: ["Ernst von Bibra"],
      substances: ["Fly agaric", "Amanita muscaria", "Hashish", "Cannabis"],
      summary: "Selective excerpts from Ernst von Bibra's 1855 German survey of narcotic Genussmittel, focused on fly agaric and hashish.",
      excerpt: "The imagination is stimulated by fly agaric much as it is by opium and hashish.",
      citation: "Bibra, Ernst Freiherr von. Die narkotischen Genussmittel und der Mensch. Nürnberg: Verlag von Wilhelm Schmid, 1855.",
      rights: "Public domain.",
      sourceUrl: "https://archive.org/details/bub_gb_GDIbAAAAYAAJ",
      accessType: "hosted",
      hostingStatus: "translation_transcript_pdf",
      wordCount: wordCount(`${bibraOriginalGerman}\n\n${bibraTranslation}`),
      addedDate: "2026-07-09",
      featured: false,
      imageTone: "document",
      imagePath: `/documents/${BIBRA_ID}/pdf-thumbnails/${BIBRA_SLUG}/page-001.jpg`,
      transcript: bibraOriginalGerman,
      translation: bibraTranslation
    }
  ]);

  await fs.writeFile(archivePath, `${JSON.stringify(rows, null, 2)}\n`, "utf8");
  await fs.writeFile(path.join(importDir, "archive_sources.jsonl"), `${rows.map((row) => JSON.stringify(row)).join("\n")}\n`, "utf8");
}

async function updateReadmeCounts() {
  const readmePath = path.join(importDir, "README.md");
  const counts = {
    documents: (await readJson("documents")).length,
    pages: (await readJson("pages")).length,
    files: (await readJson("files")).length,
    assets: (await readJson("assets")).length,
    externalSources: (await readJson("external_sources")).length,
    people: (await readJson("people")).length,
    tags: (await readJson("tags")).length
  };

  let text = "";
  try {
    text = await fs.readFile(readmePath, "utf8");
  } catch (error) {
    if (error?.code !== "ENOENT") throw error;
  }

  const next = text.replace(/## Counts[\s\S]*$/m, `## Counts

- Documents: ${counts.documents}
- Pages: ${counts.pages}
- Files/assets: ${counts.files} files / ${counts.assets} assets
- External sources: ${counts.externalSources}
- People: ${counts.people}
- Tags: ${counts.tags}
`);
  await fs.writeFile(readmePath, next || `# Latin American Psychedelic Research Import Staging

## Counts

- Documents: ${counts.documents}
- Pages: ${counts.pages}
- Files/assets: ${counts.files} files / ${counts.assets} assets
- External sources: ${counts.externalSources}
- People: ${counts.people}
- Tags: ${counts.tags}
`, "utf8");
}

function upsertBy(rows, key, nextRows) {
  for (const next of nextRows) {
    const index = rows.findIndex((row) => conflictValue(row, key) === conflictValue(next, key));
    if (index === -1) rows.push(next);
    else rows[index] = { ...rows[index], ...next };
  }
}

function conflictValue(row, key) {
  if (Array.isArray(key)) return key.map((item) => String(row[item] ?? "")).join("\u0001");
  return String(row[key] ?? "");
}

async function readJson(name) {
  const filePath = path.join(importDir, `${name}.json`);
  try {
    return JSON.parse(await fs.readFile(filePath, "utf8"));
  } catch (error) {
    if (error?.code === "ENOENT") return [];
    throw error;
  }
}

async function writeJson(name, value) {
  await fs.writeFile(path.join(importDir, `${name}.json`), `${JSON.stringify(value, null, 2)}\n`, "utf8");
}

async function mirrorCsv(name, rows) {
  const csvPath = path.join(importDir, `${name}.csv`);
  try {
    await fs.access(csvPath);
  } catch {
    return;
  }

  const existing = await fs.readFile(csvPath, "utf8");
  const newline = existing.includes("\r\n") ? "\r\n" : "\n";
  const existingColumns = existing.split(/\r?\n/, 1)[0].split(",");
  const extraColumns = unique(rows.flatMap((row) => Object.keys(row))).filter((column) => !existingColumns.includes(column));
  const columns = [...existingColumns, ...extraColumns];
  const body = rows.map((row) => columns.map((column) => csvValue(row[column])).join(",")).join(newline);
  await fs.writeFile(csvPath, `${columns.join(",")}${newline}${body}${newline}`, "utf8");
}

function csvValue(value) {
  if (value === null || value === undefined) return "";
  if (typeof value === "boolean") return value ? "True" : "False";
  const stringValue = String(value);
  if (/[",\r\n]/.test(stringValue)) return `"${stringValue.replace(/"/g, '""')}"`;
  return stringValue;
}

function unique(values) {
  return [...new Set(values)];
}

function wordCount(value) {
  return value.trim().split(/\s+/).filter(Boolean).length;
}

function deterministicUuid(value) {
  const hash = crypto.createHash("sha1").update(value).digest();
  const bytes = Buffer.from(hash.subarray(0, 16));
  bytes[6] = (bytes[6] & 0x0f) | 0x50;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;
  const hex = bytes.toString("hex");
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}

function sha256(bytes) {
  return crypto.createHash("sha256").update(bytes).digest("hex");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
